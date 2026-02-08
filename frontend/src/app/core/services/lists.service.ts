import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  List,
  ListDetail,
  CreateListRequest,
  UpdateListRequest,
  ListMember,
} from '../models/list.model';
import {
  Invite,
  CreateInviteRequest,
  UpdateMemberRequest,
  AcceptInviteResponse,
} from '../models/invite.model';

@Injectable({
  providedIn: 'root',
})
export class ListsService {
  private readonly api = inject(ApiService);

  getLists(): Observable<List[]> {
    return this.api.get<List[]>('/lists');
  }

  getList(id: string): Observable<ListDetail> {
    return this.api.get<ListDetail>(`/lists/${id}`);
  }

  createList(data: CreateListRequest): Observable<List> {
    return this.api.post<List>('/lists', data);
  }

  updateList(id: string, data: UpdateListRequest): Observable<List> {
    return this.api.patch<List>(`/lists/${id}`, data);
  }

  deleteList(id: string): Observable<void> {
    return this.api.delete<void>(`/lists/${id}`);
  }

  getMembers(listId: string): Observable<ListMember[]> {
    return this.api.get<ListMember[]>(`/lists/${listId}/members`);
  }

  updateMemberRole(
    listId: string,
    userId: string,
    data: UpdateMemberRequest
  ): Observable<ListMember> {
    return this.api.patch<ListMember>(`/lists/${listId}/members/${userId}`, data);
  }

  removeMember(listId: string, userId: string): Observable<void> {
    return this.api.delete<void>(`/lists/${listId}/members/${userId}`);
  }

  getInvites(listId: string): Observable<Invite[]> {
    return this.api.get<Invite[]>(`/lists/${listId}/invites`);
  }

  createInvite(listId: string, data: CreateInviteRequest): Observable<Invite> {
    return this.api.post<Invite>(`/lists/${listId}/invites`, data);
  }

  cancelInvite(listId: string, inviteId: string): Observable<void> {
    return this.api.delete<void>(`/lists/${listId}/invites/${inviteId}`);
  }

  acceptInvite(token: string): Observable<AcceptInviteResponse> {
    return this.api.post<AcceptInviteResponse>(`/invites/${token}/accept`);
  }
}
