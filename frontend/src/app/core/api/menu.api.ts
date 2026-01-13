import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { WeeklyMenu } from './api.types';

@Injectable({ providedIn: 'root' })
export class MenuApi {
  constructor(private readonly http: HttpClient) {}

  getCurrent(ownerUserId?: string) {
    let params = new HttpParams();
    if (ownerUserId) {
      params = params.set('ownerUserId', ownerUserId);
    }
    return this.http.get<WeeklyMenu>(`${environment.apiBaseUrl}/menu/current`, { params });
  }

  addItem(
    mealId: string,
    payload: { ingredientId: string; quantity: number; unit: string },
    ownerUserId?: string,
  ) {
    let params = new HttpParams();
    if (ownerUserId) {
      params = params.set('ownerUserId', ownerUserId);
    }
    return this.http.post(`${environment.apiBaseUrl}/menu/current/meals/${mealId}/items`, payload, {
      params,
    });
  }

  updateItem(itemId: string, payload: { quantity?: number; unit?: string }, ownerUserId?: string) {
    let params = new HttpParams();
    if (ownerUserId) {
      params = params.set('ownerUserId', ownerUserId);
    }
    return this.http.put(`${environment.apiBaseUrl}/menu/current/items/${itemId}`, payload, { params });
  }

  removeItem(itemId: string, ownerUserId?: string) {
    let params = new HttpParams();
    if (ownerUserId) {
      params = params.set('ownerUserId', ownerUserId);
    }
    return this.http.delete(`${environment.apiBaseUrl}/menu/current/items/${itemId}`, { params });
  }
}
