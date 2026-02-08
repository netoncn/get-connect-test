import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { ListsModule } from './lists';
import { InvitesModule } from './invites';
import { ItemsModule } from './items';
import { CatalogModule } from './catalog';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    ListsModule,
    InvitesModule,
    ItemsModule,
    CatalogModule,
  ],
})
export class AppModule {}
