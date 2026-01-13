import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { IngredientsApi } from '../../core/api/ingredients.api';
import { Ingredient, MealType, Unit } from '../../core/api/api.types';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-ingredients',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DividerModule,
    SelectModule,
    InputTextModule,
    MultiSelectModule,
    ProgressSpinnerModule,
    TableModule,
    DialogModule,
    InputNumberModule,
  ],
  templateUrl: './ingredients.component.html',
  styleUrl: './ingredients.component.scss',
})
export class IngredientsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  loading = false;
  saving = false;
  items: Ingredient[] = [];
  editing: Ingredient | null = null;
  showForm = false;
  loadError: string | null = null;
  private readonly defaultCategories = [
    'Dairy',
    'Grains',
    'Protein',
    'Vegetables',
    'Fruit',
    'Pantry',
    'Drinks',
    'Snacks',
  ];
  categoryOptions: Array<{ label: string; value: string }> = this.defaultCategories.map(
    (value) => ({ label: value, value }),
  );
  categoryFilterOptions: Array<{ label: string; value: string }> = [
    { label: 'All categories', value: '' },
    ...this.defaultCategories.map((value) => ({ label: value, value })),
  ];

  filters = this.fb.group({
    search: [''],
    category: [''],
    unit: [''],
    mealType: [''],
  });

  form = this.fb.group({
    name: ['', Validators.required],
    category: [''],
    defaultUnit: ['gr', Validators.required],
    defaultQuantity: [100, [Validators.required, Validators.min(0.000001)]],
    allowedMealTypes: [[] as MealType[]],
  });

  unitOptions = [
    { label: 'gr', value: 'gr' },
    { label: 'ml', value: 'ml' },
    { label: 'unit', value: 'unit' },
  ];

  mealTypeOptions = [
    { label: 'Breakfast', value: 'BREAKFAST' },
    { label: 'Morning Snack', value: 'MORNING_SNACK' },
    { label: 'Lunch', value: 'LUNCH' },
    { label: 'Afternoon Snack', value: 'AFTERNOON_SNACK' },
    { label: 'Dinner', value: 'DINNER' },
  ];

  constructor(
    private readonly ingredientsApi: IngredientsApi,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.load();
  }

  loadCategories() {
    this.ingredientsApi.listCategories().subscribe({
      next: (response) => {
        const merged = new Set([
          ...this.defaultCategories,
          ...(response.items ?? []),
        ]);
        const sorted = Array.from(merged).sort((a, b) => a.localeCompare(b));
        this.categoryOptions = sorted.map((value) => ({ label: value, value }));
        this.categoryFilterOptions = [
          { label: 'All categories', value: '' },
          ...this.categoryOptions,
        ];
      },
      error: () => {
        this.categoryOptions = this.defaultCategories.map((value) => ({ label: value, value }));
        this.categoryFilterOptions = [
          { label: 'All categories', value: '' },
          ...this.categoryOptions,
        ];
      },
    });
  }

  load() {
    this.loading = true;
    this.loadError = null;
    const { search, category, unit, mealType } = this.filters.getRawValue();
    this.ingredientsApi
      .list({
        search: search ?? undefined,
        category: category ?? undefined,
        unit: (unit as Unit) || undefined,
        mealType: (mealType as MealType) || undefined,
        sort: 'name:asc',
      })
      .subscribe({
        next: (response) => {
          this.items = response.items;
          this.loading = false;
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to load ingredients';
          this.loadError = message;
          this.items = [];
          this.toastService.error(message);
          this.loading = false;
        },
      });
  }

  startEdit(item: Ingredient) {
    this.editing = item;
    this.showForm = true;
    this.form.patchValue({
      name: item.name,
      category: item.category ?? '',
      defaultUnit: item.defaultUnit,
      defaultQuantity: item.defaultQuantity,
      allowedMealTypes: item.allowedMealTypes ?? [],
    });
  }

  clearEdit() {
    this.editing = null;
    this.showForm = false;
    this.form.reset({
      name: '',
      category: '',
      defaultUnit: 'gr',
      defaultQuantity: 100,
      allowedMealTypes: [],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.saving = true;

    if (this.editing) {
        this.ingredientsApi
          .update(this.editing.id, {
            name: payload.name ?? '',
            category: payload.category ?? null,
            defaultUnit: payload.defaultUnit as Unit,
            defaultQuantity: payload.defaultQuantity ?? 100,
            allowedMealTypes: payload.allowedMealTypes ?? [],
          })
        .subscribe({
          next: () => {
          this.toastService.success('Ingredient updated');
          this.clearEdit();
          this.saving = false;
          this.loadCategories();
          this.load();
        },
          error: (err) => {
            this.toastService.error(err?.error?.message ?? 'Update failed');
            this.saving = false;
          },
        });
      return;
    }

    this.ingredientsApi
      .create({
        name: payload.name ?? '',
        category: payload.category ?? undefined,
        defaultUnit: payload.defaultUnit as Unit,
        defaultQuantity: payload.defaultQuantity ?? 100,
        allowedMealTypes: payload.allowedMealTypes ?? [],
      })
      .subscribe({
        next: () => {
          this.toastService.success('Ingredient added');
          this.clearEdit();
          this.saving = false;
          this.loadCategories();
          this.load();
        },
        error: (err) => {
          this.toastService.error(err?.error?.message ?? 'Create failed');
          this.saving = false;
        },
      });
  }

  remove(item: Ingredient) {
    this.loading = true;
    this.ingredientsApi.remove(item.id).subscribe({
      next: () => {
        this.toastService.info('Ingredient removed');
        this.load();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Delete failed');
        this.loading = false;
      },
    });
  }
}
