import { ListRole } from './list.model';

export interface Invite {
  id: string;
  listId: string;
  email: string;
  role: ListRole;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

export interface CreateInviteRequest {
  email: string;
  role?: 'EDITOR' | 'VIEWER';
}

export interface UpdateMemberRequest {
  role: 'EDITOR' | 'VIEWER';
}

export interface AcceptInviteResponse {
  message: string;
  listId: string;
  listName: string;
}
