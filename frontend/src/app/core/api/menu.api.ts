import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { WeeklyMenu } from './api.types';

@Injectable({ providedIn: 'root' })
export class MenuApi {
  constructor(private readonly http: HttpClient) {}

  getCurrent() {
    return this.http.get<WeeklyMenu>(`${environment.apiBaseUrl}/menu/current`);
  }

  addItem(mealId: string, payload: { ingredientId: string; quantity: number; unit: string }) {
    return this.http.post(`${environment.apiBaseUrl}/menu/current/meals/${mealId}/items`, payload);
  }

  updateItem(itemId: string, payload: { quantity?: number; unit?: string }) {
    return this.http.put(`${environment.apiBaseUrl}/menu/current/items/${itemId}`, payload);
  }

  removeItem(itemId: string) {
    return this.http.delete(`${environment.apiBaseUrl}/menu/current/items/${itemId}`);
  }
}
