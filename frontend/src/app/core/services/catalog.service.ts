import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SuggestionsResponse } from '../models/catalog.model';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly api = inject(ApiService);

  suggest(query: string): Observable<SuggestionsResponse> {
    return this.api.get<SuggestionsResponse>('/catalog/suggest', { query });
  }
}
