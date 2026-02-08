import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { ListsModule } from './lists';
import { InvitesModule } from './invites';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, ListsModule, InvitesModule],
})
export class AppModule {}
