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
import { InvitesService } from './invites.service';
import {
  CreateInviteDto,
  UpdateMemberDto,
  InviteResponseDto,
  AcceptInviteResponseDto,
  PendingInviteDto,
} from './dto';
import { ListMemberResponseDto } from '../lists/dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ListAccessGuard } from '../lists/guards/list-access.guard';
import { ListRoleGuard } from '../lists/guards/list-role.guard';
import { ListRoles } from '../lists/decorators/list-roles.decorator';

@ApiTags('members & invites')
@ApiBearerAuth()
@Controller()
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Get('lists/:listId/members')
  @UseGuards(ListAccessGuard)
  @ApiOperation({ summary: 'Get list members' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiResponse({ status: 200, type: [ListMemberResponseDto] })
  async getMembers(
    @Param('listId') listId: string,
  ): Promise<ListMemberResponseDto[]> {
    return this.invitesService.getMembers(listId);
  }

  @Post('lists/:listId/invites')
  @UseGuards(ListAccessGuard, ListRoleGuard)
  @ListRoles(ListRole.OWNER)
  @ApiOperation({ summary: 'Create invite (owner only)' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiResponse({ status: 201, type: InviteResponseDto })
  @ApiResponse({
    status: 409,
    description: 'User already member or invite exists',
  })
  async createInvite(
    @Param('listId') listId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateInviteDto,
  ): Promise<InviteResponseDto> {
    return this.invitesService.createInvite(listId, user.id, dto);
  }

  @Get('lists/:listId/invites')
  @UseGuards(ListAccessGuard, ListRoleGuard)
  @ListRoles(ListRole.OWNER)
  @ApiOperation({ summary: 'Get pending invites (owner only)' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiResponse({ status: 200, type: [InviteResponseDto] })
  async getPendingInvites(
    @Param('listId') listId: string,
  ): Promise<InviteResponseDto[]> {
    return this.invitesService.getPendingInvites(listId);
  }

  @Delete('lists/:listId/invites/:inviteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ListAccessGuard, ListRoleGuard)
  @ListRoles(ListRole.OWNER)
  @ApiOperation({ summary: 'Cancel invite (owner only)' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiParam({ name: 'inviteId', description: 'Invite ID' })
  @ApiResponse({ status: 204, description: 'Invite cancelled' })
  async cancelInvite(
    @Param('listId') listId: string,
    @Param('inviteId') inviteId: string,
  ): Promise<void> {
    return this.invitesService.cancelInvite(listId, inviteId);
  }

  @Get('invites/pending')
  @ApiOperation({ summary: 'Get my pending invites' })
  @ApiResponse({ status: 200, type: [PendingInviteDto] })
  async getMyPendingInvites(
    @CurrentUser() user: User,
  ): Promise<PendingInviteDto[]> {
    return this.invitesService.getMyPendingInvites(user.id);
  }

  @Post('invites/:inviteId/accept')
  @ApiOperation({ summary: 'Accept invite by ID' })
  @ApiParam({ name: 'inviteId', description: 'Invite ID' })
  @ApiResponse({ status: 201, type: AcceptInviteResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Invite expired or already accepted',
  })
  @ApiResponse({ status: 403, description: 'Email mismatch' })
  async acceptInviteById(
    @Param('inviteId') inviteId: string,
    @CurrentUser() user: User,
  ): Promise<AcceptInviteResponseDto> {
    return this.invitesService.acceptInviteById(inviteId, user.id);
  }

  @Post('invites/:inviteId/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reject invite' })
  @ApiParam({ name: 'inviteId', description: 'Invite ID' })
  @ApiResponse({ status: 204, description: 'Invite rejected' })
  async rejectInvite(
    @Param('inviteId') inviteId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.invitesService.rejectInvite(inviteId, user.id);
  }

  @Post('invites/:token/accept-by-token')
  @ApiOperation({ summary: 'Accept invite by token (legacy)' })
  @ApiParam({ name: 'token', description: 'Invite token' })
  @ApiResponse({ status: 201, type: AcceptInviteResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Invite expired or already accepted',
  })
  @ApiResponse({ status: 403, description: 'Email mismatch' })
  async acceptInvite(
    @Param('token') token: string,
    @CurrentUser() user: User,
  ): Promise<AcceptInviteResponseDto> {
    return this.invitesService.acceptInvite(token, user.id);
  }

  @Patch('lists/:listId/members/:userId')
  @UseGuards(ListAccessGuard, ListRoleGuard)
  @ListRoles(ListRole.OWNER)
  @ApiOperation({ summary: 'Update member role (owner only)' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, type: ListMemberResponseDto })
  @ApiResponse({ status: 403, description: 'Cannot change owner role' })
  async updateMemberRole(
    @Param('listId') listId: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<ListMemberResponseDto> {
    return this.invitesService.updateMemberRole(listId, targetUserId, dto);
  }

  @Delete('lists/:listId/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ListAccessGuard, ListRoleGuard)
  @ListRoles(ListRole.OWNER)
  @ApiOperation({ summary: 'Remove member (owner only)' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'Member removed' })
  @ApiResponse({ status: 403, description: 'Cannot remove owner' })
  async removeMember(
    @Param('listId') listId: string,
    @Param('userId') targetUserId: string,
  ): Promise<void> {
    return this.invitesService.removeMember(listId, targetUserId);
  }
}
