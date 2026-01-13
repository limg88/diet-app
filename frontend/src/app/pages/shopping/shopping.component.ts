import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ShoppingApi } from '../../core/api/shopping.api';
import { ShoppingItem, Unit } from '../../core/api/api.types';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-shopping',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DividerModule,
    SelectModule,
    ToggleSwitchModule,
    InputTextModule,
    InputNumberModule,
    ProgressSpinnerModule,
    TableModule,
    TagModule,
    DialogModule,
  ],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.scss',
})
export class ShoppingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  loading = false;
  items: ShoppingItem[] = [];
  loadError: string | null = null;

  filters = this.fb.group({
    search: [''],
    category: [''],
    unit: [''],
    mealType: [''],
    source: [''],
    purchased: [''],
  });

  offMenuForm = this.fb.group({
    name: ['', Validators.required],
    category: [''],
    unit: ['unit', Validators.required],
    quantity: [1, [Validators.required, Validators.min(0.000001)]],
  });

  editingId: string | null = null;
  showOffMenuForm = false;

  unitOptions = [
    { label: 'gr', value: 'gr' },
    { label: 'ml', value: 'ml' },
    { label: 'unit', value: 'unit' },
  ];

  unitFilterOptions = [
    { label: 'All units', value: '' },
    { label: 'gr', value: 'gr' },
    { label: 'ml', value: 'ml' },
    { label: 'unit', value: 'unit' },
  ];

  mealTypeOptions = [
    { label: 'All meals', value: '' },
    { label: 'Breakfast', value: 'BREAKFAST' },
    { label: 'Morning snack', value: 'MORNING_SNACK' },
    { label: 'Lunch', value: 'LUNCH' },
    { label: 'Afternoon snack', value: 'AFTERNOON_SNACK' },
    { label: 'Dinner', value: 'DINNER' },
    { label: 'Multi', value: 'MULTI' },
  ];

  sourceOptions = [
    { label: 'All', value: '' },
    { label: 'Menu', value: 'MENU' },
    { label: 'Off menu', value: 'OFF_MENU' },
  ];

  purchasedOptions = [
    { label: 'All', value: '' },
    { label: 'Purchased', value: 'true' },
    { label: 'Not purchased', value: 'false' },
  ];

  constructor(
    private readonly shoppingApi: ShoppingApi,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.loadError = null;
    const { search, category, unit, mealType, source, purchased } = this.filters.getRawValue();
    this.shoppingApi
      .getCurrent({
        search: search ?? undefined,
        category: category ?? undefined,
        unit: unit ?? undefined,
        mealType: mealType ?? undefined,
        source: source ?? undefined,
        purchased: purchased ?? undefined,
        sort: 'name:asc',
      })
      .subscribe({
        next: (response) => {
          this.items = response.items;
          this.loading = false;
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to load shopping list';
          this.loadError = message;
          this.items = [];
          this.toastService.error(message);
          this.loading = false;
        },
      });
  }

  togglePurchased(item: ShoppingItem, nextValue: boolean) {
    const previous = item.purchased;
    item.purchased = nextValue;
    this.shoppingApi.updatePurchased(item.id, nextValue).subscribe({
      error: (err) => {
        item.purchased = previous;
        this.toastService.error(err?.error?.message ?? 'Failed to update');
      },
    });
  }

  startEdit(item: ShoppingItem) {
    if (item.source !== 'OFF_MENU') {
      return;
    }
    this.editingId = item.id;
    this.showOffMenuForm = true;
    this.offMenuForm.patchValue({
      name: item.name,
      category: item.category ?? '',
      unit: item.unit,
      quantity: item.totalQuantity,
    });
  }

  clearEdit() {
    this.editingId = null;
    this.showOffMenuForm = false;
    this.offMenuForm.reset({ name: '', category: '', unit: 'unit', quantity: 1 });
  }

  openOffMenuModal() {
    this.editingId = null;
    this.offMenuForm.reset({ name: '', category: '', unit: 'unit', quantity: 1 });
    this.showOffMenuForm = true;
  }

  submitOffMenu() {
    if (this.offMenuForm.invalid) {
      this.offMenuForm.markAllAsTouched();
      return;
    }

    const payload = this.offMenuForm.getRawValue();
    if (!payload.name || !payload.unit || payload.quantity === null) {
      return;
    }

    if (this.editingId) {
      this.shoppingApi
        .updateOffMenu(this.editingId, {
          name: payload.name,
          category: payload.category ?? null,
          unit: payload.unit as Unit,
          quantity: payload.quantity,
        })
        .subscribe({
          next: () => {
            this.toastService.success('Off-menu item updated');
            this.clearEdit();
            this.load();
          },
          error: (err) => {
            this.toastService.error(err?.error?.message ?? 'Update failed');
          },
        });
      return;
    }

    this.shoppingApi
      .createOffMenu({
        name: payload.name,
        category: payload.category ?? undefined,
        unit: payload.unit as Unit,
        quantity: payload.quantity,
      })
      .subscribe({
        next: () => {
          this.toastService.success('Off-menu item added');
          this.clearEdit();
          this.load();
        },
        error: (err) => {
          this.toastService.error(err?.error?.message ?? 'Create failed');
        },
      });
  }

  removeOffMenu(item: ShoppingItem) {
    if (item.source !== 'OFF_MENU') {
      return;
    }
    this.shoppingApi.deleteOffMenu(item.id).subscribe({
      next: () => {
        this.toastService.info('Off-menu item removed');
        this.load();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Delete failed');
      },
    });
  }
}
