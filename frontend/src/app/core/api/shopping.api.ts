import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ShoppingList } from './api.types';

@Injectable({ providedIn: 'root' })
export class ShoppingApi {
  constructor(private readonly http: HttpClient) {}

  getCurrent(query: Record<string, string | boolean | undefined> = {}) {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<ShoppingList>(`${environment.apiBaseUrl}/shopping/current`, { params });
  }

  updatePurchased(id: string, purchased: boolean) {
    return this.http.patch(`${environment.apiBaseUrl}/shopping/current/items/${id}`, { purchased });
  }

  updateWarehouse(id: string, warehouse: number) {
    return this.http.patch(`${environment.apiBaseUrl}/shopping/current/items/${id}/warehouse`, {
      warehouse,
    });
  }

  createOffMenu(payload: { name: string; category?: string; unit: string; quantity: number }) {
    return this.http.post(`${environment.apiBaseUrl}/shopping/current/off-menu`, payload);
  }

  updateOffMenu(id: string, payload: { name?: string; category?: string | null; unit?: string; quantity?: number }) {
    return this.http.put(`${environment.apiBaseUrl}/shopping/current/off-menu/${id}`, payload);
  }

  deleteOffMenu(id: string) {
    return this.http.delete(`${environment.apiBaseUrl}/shopping/current/off-menu/${id}`);
  }
}
