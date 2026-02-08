import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ListRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { ListsService } from './lists.service';
import { CreateListDto, UpdateListDto, ListResponseDto, ListDetailResponseDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ListAccessGuard } from './guards/list-access.guard';
import { ListRoleGuard } from './guards/list-role.guard';
import { ListRoles } from './decorators/list-roles.decorator';

@ApiTags('lists')
@ApiBearerAuth()
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new list' })
  @ApiResponse({ status: 201, description: 'List created', type: ListResponseDto })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateListDto,
  ): Promise<ListResponseDto> {
    return this.listsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lists for current user' })
  @ApiResponse({ status: 200, description: 'List of user lists', type: [ListResponseDto] })
  async findAll(@CurrentUser() user: User): Promise<ListResponseDto[]> {
    return this.listsService.findAll(user.id);
  }

  @Get(':listId')
  @UseGuards(ListAccessGuard)
  @ApiOperation({ summary: 'Get list details' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiResponse({ status: 200, description: 'List details', type: ListDetailResponseDto })
  @ApiResponse({ status: 404, description: 'List not found' })
  async findOne(
    @Param('listId') listId: string,
    @CurrentUser() user: User,
  ): Promise<ListDetailResponseDto> {
    return this.listsService.findOne(listId, user.id);
  }

  @Patch(':listId')
  @UseGuards(ListAccessGuard, ListRoleGuard)
  @ListRoles(ListRole.OWNER, ListRole.EDITOR)
  @ApiOperation({ summary: 'Update list' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiResponse({ status: 200, description: 'List updated', type: ListResponseDto })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'List not found' })
  async update(
    @Param('listId') listId: string,
    @Body() dto: UpdateListDto,
  ): Promise<ListResponseDto> {
    return this.listsService.update(listId, dto);
  }

  @Delete(':listId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ListAccessGuard, ListRoleGuard)
  @ListRoles(ListRole.OWNER)
  @ApiOperation({ summary: 'Delete list' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiResponse({ status: 204, description: 'List deleted' })
  @ApiResponse({ status: 403, description: 'Only owner can delete' })
  @ApiResponse({ status: 404, description: 'List not found' })
  async remove(@Param('listId') listId: string): Promise<void> {
    return this.listsService.remove(listId);
  }
}
