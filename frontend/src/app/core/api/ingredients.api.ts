import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Ingredient, IngredientList, MealType, Unit } from './api.types';

@Injectable({ providedIn: 'root' })
export class IngredientsApi {
  constructor(private readonly http: HttpClient) {}

  list(query: {
    search?: string;
    category?: string;
    unit?: Unit;
    mealType?: MealType;
    includeDeleted?: boolean;
    sort?: string;
    ownerUserId?: string;
  }) {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<IngredientList>(`${environment.apiBaseUrl}/ingredients`, { params });
  }

  listCategories() {
    return this.http.get<{ items: string[] }>(`${environment.apiBaseUrl}/ingredients/categories`);
  }

  create(payload: {
    name: string;
    category?: string;
    defaultUnit: Unit;
    defaultQuantity: number;
    allowedMealTypes?: MealType[];
  }) {
    return this.http.post<Ingredient>(`${environment.apiBaseUrl}/ingredients`, payload);
  }

  update(
    id: string,
    payload: {
      name?: string;
      category?: string | null;
      defaultUnit?: Unit;
      defaultQuantity?: number;
      allowedMealTypes?: MealType[] | null;
    },
  ) {
    return this.http.put<Ingredient>(`${environment.apiBaseUrl}/ingredients/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<Ingredient>(`${environment.apiBaseUrl}/ingredients/${id}`);
  }
}
