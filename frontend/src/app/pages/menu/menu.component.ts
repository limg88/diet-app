import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from 'primeng/accordion';
import { IngredientsApi } from '../../core/api/ingredients.api';
import { MenuApi } from '../../core/api/menu.api';
import { ShoppingApi } from '../../core/api/shopping.api';
import { Ingredient, MealType, Unit, WeeklyMenu } from '../../core/api/api.types';
import { ToastService } from '../../core/ui/toast.service';

type MealDraft = {
  ingredientId: string | null;
  quantity: number;
  unit: Unit;
};

@Component({
  selector: 'app-menu',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    SelectModule,
    InputNumberModule,
    ProgressSpinnerModule,
    AccordionModule,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnInit {
  loading = false;
  saving = false;
  menu: WeeklyMenu | null = null;
  ingredients: Ingredient[] = [];
  drafts: Record<string, MealDraft> = {};
  loadError: string | null = null;
  itemQuantityCache: Record<string, number> = {};

  dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  mealTypes: MealType[] = [
    'BREAKFAST',
    'MORNING_SNACK',
    'LUNCH',
    'AFTERNOON_SNACK',
    'DINNER',
  ];

  unitOptions = [
    { label: 'gr', value: 'gr' },
    { label: 'ml', value: 'ml' },
    { label: 'unit', value: 'unit' },
  ];

  constructor(
    private readonly menuApi: MenuApi,
    private readonly ingredientsApi: IngredientsApi,
    private readonly shoppingApi: ShoppingApi,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.loadError = null;
    this.ingredientsApi.list({ sort: 'name:asc' }).subscribe({
      next: (ingredientResponse) => {
        this.ingredients = ingredientResponse.items;
        this.menuApi.getCurrent().subscribe({
          next: (menu) => {
            this.menu = menu;
            this.loading = false;
          },
          error: (err) => {
            const message = err?.error?.message ?? 'Failed to load menu';
            this.loadError = message;
            this.menu = null;
            this.toastService.error(message);
            this.loading = false;
          },
        });
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Failed to load ingredients';
        this.loadError = message;
        this.menu = null;
        this.toastService.error(message);
        this.loading = false;
      },
    });
  }

  getDraft(mealId: string): MealDraft {
    if (!this.drafts[mealId]) {
      this.drafts[mealId] = { ingredientId: null, quantity: 1, unit: 'gr' };
    }
    return this.drafts[mealId];
  }

  addItem(mealId: string) {
    const draft = this.getDraft(mealId);
    if (!draft.ingredientId) {
      this.toastService.info('Select an ingredient');
      return;
    }

    const ingredient = this.ingredients.find((item) => item.id === draft.ingredientId);
    const quantity = ingredient?.defaultQuantity ?? draft.quantity;
    const unit = ingredient?.defaultUnit ?? draft.unit;

    this.menuApi
      .addItem(mealId, {
        ingredientId: draft.ingredientId,
        quantity,
        unit,
      })
      .subscribe({
        next: () => {
          this.toastService.success('Item added');
          this.drafts[mealId] = { ingredientId: null, quantity: 1, unit: 'gr' };
          this.refresh();
        },
        error: (err) => {
          this.toastService.error(err?.error?.message ?? 'Cannot add item');
        },
      });
  }

  removeItem(itemId: string) {
    this.menuApi.removeItem(itemId).subscribe({
      next: () => {
        this.toastService.info('Item removed');
        this.refresh();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Remove failed');
      },
    });
  }

  ingredientLabel(ingredientId: string) {
    return this.ingredients.find((item) => item.id === ingredientId)?.name ?? 'Unknown';
  }

  getItemUnit(ingredientId: string, unit?: Unit | null) {
    return unit ?? this.ingredients.find((item) => item.id === ingredientId)?.defaultUnit ?? 'gr';
  }

  trackItemFocus(itemId: string, quantity: number) {
    this.itemQuantityCache[itemId] = quantity;
  }

  updateItemQuantity(item: { id: string; quantity: number; unit: Unit }) {
    const previous = this.itemQuantityCache[item.id] ?? item.quantity;
    if (!item.quantity || item.quantity <= 0) {
      this.toastService.error('Quantity must be greater than 0');
      item.quantity = previous;
      this.itemQuantityCache[item.id] = previous;
      return;
    }
    if (item.quantity === previous) {
      return;
    }
    this.menuApi.updateItem(item.id, { quantity: item.quantity, unit: item.unit }).subscribe({
      next: () => {
        this.toastService.success('Quantity updated');
        this.itemQuantityCache[item.id] = item.quantity;
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Update failed');
        item.quantity = previous;
      },
    });
  }

  mealLabel(mealType: MealType) {
    const map: Record<MealType, string> = {
      BREAKFAST: 'Breakfast',
      MORNING_SNACK: 'Morning Snack',
      LUNCH: 'Lunch',
      AFTERNOON_SNACK: 'Afternoon Snack',
      DINNER: 'Dinner',
    };
    return map[mealType];
  }

  getMeal(day: WeeklyMenu['days'][number], mealType: MealType) {
    return day.meals.find((meal) => meal.mealType === mealType) ?? null;
  }
}
