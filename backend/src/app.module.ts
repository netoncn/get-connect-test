import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule],
})
export class AppModule {}
