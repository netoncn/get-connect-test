import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
      },
    });

    const accessToken = await this.generateToken(user);

    return {
      accessToken,
      user: this.toUserResponse(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateToken(user);

    return {
      accessToken,
      user: this.toUserResponse(user),
    };
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toUserResponse(user);
  }

  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.signAsync(payload);
  }

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
