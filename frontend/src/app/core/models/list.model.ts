export type ListRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface ListMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: ListRole;
  createdAt: Date;
}

export interface List {
  id: string;
  name: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  userRole: ListRole;
  itemCount: number;
  memberCount: number;
}

export interface ListDetail extends List {
  members: ListMember[];
}

export interface CreateListRequest {
  name: string;
}

export interface UpdateListRequest {
  name: string;
}
