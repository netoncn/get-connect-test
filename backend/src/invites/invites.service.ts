import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ListRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma';
import {
  CreateInviteDto,
  UpdateMemberDto,
  InviteResponseDto,
  AcceptInviteResponseDto,
} from './dto';
import { ListMemberResponseDto } from '../lists/dto';

@Injectable()
export class InvitesService {
  private readonly INVITE_EXPIRATION_DAYS = 7;

  constructor(private readonly prisma: PrismaService) {}

  async getMembers(listId: string): Promise<ListMemberResponseDto[]> {
    const members = await this.prisma.listMember.findMany({
      where: { listId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      userName: m.user.name,
      userEmail: m.user.email,
      role: m.role,
      createdAt: m.createdAt,
    }));
  }

  async createInvite(
    listId: string,
    userId: string,
    dto: CreateInviteDto,
  ): Promise<InviteResponseDto> {
    const email = dto.email.toLowerCase();
    const role = dto.role ?? ListRole.VIEWER;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingMembership = await this.prisma.listMember.findUnique({
        where: {
          listId_userId: {
            listId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMembership) {
        throw new ConflictException('User is already a member of this list');
      }
    }

    const existingInvite = await this.prisma.listInvite.findFirst({
      where: {
        listId,
        email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      throw new ConflictException('An active invite already exists for this email');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.INVITE_EXPIRATION_DAYS);

    const invite = await this.prisma.listInvite.create({
      data: {
        listId,
        email,
        token: randomUUID(),
        role,
        expiresAt,
        createdById: userId,
      },
    });

    return {
      id: invite.id,
      listId: invite.listId,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      acceptedAt: invite.acceptedAt ?? undefined,
      createdAt: invite.expiresAt,
    };
  }

  async acceptInvite(token: string, userId: string): Promise<AcceptInviteResponseDto> {
    const invite = await this.prisma.listInvite.findUnique({
      where: { token },
      include: { list: true },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.acceptedAt) {
      throw new BadRequestException('Invite has already been accepted');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new ForbiddenException('This invite is for a different email address');
    }

    const existingMembership = await this.prisma.listMember.findUnique({
      where: {
        listId_userId: {
          listId: invite.listId,
          userId,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('You are already a member of this list');
    }

    await this.prisma.$transaction([
      this.prisma.listMember.create({
        data: {
          listId: invite.listId,
          userId,
          role: invite.role,
        },
      }),
      this.prisma.listInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return {
      message: 'Invite accepted successfully',
      listId: invite.listId,
      listName: invite.list.name,
    };
  }

  async updateMemberRole(
    listId: string,
    targetUserId: string,
    dto: UpdateMemberDto,
  ): Promise<ListMemberResponseDto> {
    const membership = await this.prisma.listMember.findUnique({
      where: {
        listId_userId: {
          listId,
          userId: targetUserId,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    if (membership.role === ListRole.OWNER) {
      throw new ForbiddenException('Cannot change the role of the list owner');
    }

    const updated = await this.prisma.listMember.update({
      where: { id: membership.id },
      data: { role: dto.role },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      id: updated.id,
      userId: updated.user.id,
      userName: updated.user.name,
      userEmail: updated.user.email,
      role: updated.role,
      createdAt: updated.createdAt,
    };
  }

  async removeMember(listId: string, targetUserId: string): Promise<void> {
    const membership = await this.prisma.listMember.findUnique({
      where: {
        listId_userId: {
          listId,
          userId: targetUserId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    if (membership.role === ListRole.OWNER) {
      throw new ForbiddenException('Cannot remove the list owner');
    }

    await this.prisma.listMember.delete({
      where: { id: membership.id },
    });
  }

  async getPendingInvites(listId: string): Promise<InviteResponseDto[]> {
    const invites = await this.prisma.listInvite.findMany({
      where: {
        listId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'asc' },
    });

    return invites.map((invite) => ({
      id: invite.id,
      listId: invite.listId,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      acceptedAt: invite.acceptedAt ?? undefined,
      createdAt: invite.expiresAt,
    }));
  }

  async cancelInvite(listId: string, inviteId: string): Promise<void> {
    const invite = await this.prisma.listInvite.findFirst({
      where: {
        id: inviteId,
        listId,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    await this.prisma.listInvite.delete({
      where: { id: inviteId },
    });
  }
}
