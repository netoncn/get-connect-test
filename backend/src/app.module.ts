import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { ListsModule } from './lists';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, ListsModule],
})
export class AppModule {}
