export type ItemKind = 'BOOK' | 'OTHER';

export interface BookMetadata {
  source?: string;
  sourceId?: string;
  authors?: string[];
  isbn?: string;
  coverUrl?: string;
}

export interface ListItem {
  id: string;
  listId: string;
  createdById: string;
  createdByName: string;
  kind: ItemKind;
  title: string;
  notes?: string;
  done: boolean;
  metadata?: BookMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateItemRequest {
  kind: ItemKind;
  title: string;
  notes?: string;
  metadata?: BookMetadata;
}

export interface UpdateItemRequest {
  title?: string;
  notes?: string;
  done?: boolean;
}
