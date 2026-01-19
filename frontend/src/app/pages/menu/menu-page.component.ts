import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { IngredientsApi } from '../../core/api/ingredients.api';
import { MenuApi } from '../../core/api/menu.api';
import { Ingredient, MealType, Unit, WeeklyMenu } from '../../core/api/api.types';
import { ToastService } from '../../core/ui/toast.service';

type MealDraft = {
  ingredientId: string | null;
  quantity: number;
  unit: Unit;
};

@Component({
  selector: 'app-menu-page',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    SelectModule,
    InputNumberModule,
    ProgressSpinnerModule,
    AccordionModule,
    TagModule,
  ],
  templateUrl: './menu-page.component.html',
  styleUrl: './menu-page.component.scss',
})
export class MenuPageComponent implements OnInit {
  @Input() ownerUserId?: string;
  @Input() title = 'Weekly Menu';
  @Input() showCollaboratorBadge = false;
  @Input() subtitleOverride?: string;

  loading = false;
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
    private readonly toastService: ToastService,
  ) {}

  ngOnInit() {
    this.refresh();
  }

  get subtitleText() {
    if (this.subtitleOverride) {
      return this.subtitleOverride;
    }
    return this.menu ? `Week of ${this.menu.weekStartDate}` : '';
  }

  refresh() {
    this.loading = true;
    this.loadError = null;
    this.ingredientsApi.list({ sort: 'name:asc', ownerUserId: this.ownerUserId }).subscribe({
      next: (ingredientResponse) => {
        this.ingredients = ingredientResponse.items;
        this.menuApi.getCurrent(this.ownerUserId).subscribe({
          next: (menu) => {
            this.menu = menu;
            this.warnIfMenuLooksDuplicated(menu);
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
      .addItem(
        mealId,
        {
          ingredientId: draft.ingredientId,
          quantity,
          unit,
        },
        this.ownerUserId,
      )
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
    this.menuApi.removeItem(itemId, this.ownerUserId).subscribe({
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
    this.menuApi
      .updateItem(item.id, { quantity: item.quantity, unit: item.unit }, this.ownerUserId)
      .subscribe({
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

  private warnIfMenuLooksDuplicated(menu: WeeklyMenu) {
    if (!isDevMode()) {
      return;
    }
    const dayCount = menu?.days?.length ?? 0;
    const itemCount = menu?.days?.reduce((total, day) => {
      const dayItems = day.meals.reduce((sum, meal) => sum + meal.items.length, 0);
      return total + dayItems;
    }, 0) ?? 0;
    if (dayCount > 7 || itemCount > 200) {
      console.warn('[menu] Unusual menu size detected', { dayCount, itemCount });
    }
  }
}
