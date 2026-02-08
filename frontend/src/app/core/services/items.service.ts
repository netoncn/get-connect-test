import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ListItem, CreateItemRequest, UpdateItemRequest } from '../models/item.model';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private readonly api = inject(ApiService);

  getItems(listId: string): Observable<ListItem[]> {
    return this.api.get<ListItem[]>(`/lists/${listId}/items`);
  }

  createItem(listId: string, data: CreateItemRequest): Observable<ListItem> {
    return this.api.post<ListItem>(`/lists/${listId}/items`, data);
  }

  updateItem(
    listId: string,
    itemId: string,
    data: UpdateItemRequest
  ): Observable<ListItem> {
    return this.api.patch<ListItem>(`/lists/${listId}/items/${itemId}`, data);
  }

  deleteItem(listId: string, itemId: string): Observable<void> {
    return this.api.delete<void>(`/lists/${listId}/items/${itemId}`);
  }
}
