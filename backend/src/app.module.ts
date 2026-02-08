import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 60,
      },
    ]),
    PrismaModule,
    AuthModule,
    ListsModule,
    InvitesModule,
    ItemsModule,
    CatalogModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
