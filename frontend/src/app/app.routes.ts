import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { ShellComponent } from './shell/shell.component';
import { LoginComponent } from './pages/login/login.component';
import { MenuComponent } from './pages/menu/menu.component';
import { ShoppingComponent } from './pages/shopping/shopping.component';
import { IngredientsComponent } from './pages/ingredients/ingredients.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'menu' },
      { path: 'menu', component: MenuComponent },
      { path: 'shopping', component: ShoppingComponent },
      { path: 'ingredients', component: IngredientsComponent },
    ],
  },
  { path: '**', redirectTo: 'menu' },
];
