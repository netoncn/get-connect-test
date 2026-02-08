import { Module } from '@nestjs/common';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { ListAccessGuard } from './guards/list-access.guard';
import { ListRoleGuard } from './guards/list-role.guard';

@Module({
  controllers: [ListsController],
  providers: [ListsService, ListAccessGuard, ListRoleGuard],
  exports: [ListsService, ListAccessGuard, ListRoleGuard],
})
export class ListsModule {}
