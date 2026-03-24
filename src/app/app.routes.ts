import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },

  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage),
  },

  {
    path: 'pago',
    loadComponent: () => import('./pages/pago/pago.page').then(m => m.PagoPage)
  },

  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'pago-final',
    loadComponent: () => import('./pages/pago-final/pago-final.page').then( m => m.PagoFinalPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then( m => m.AdminPage)
  },

  {
    path: 'logout-button',
    loadComponent: () => import('./pages/logout-button/logout-button.component').then( m => m.LogoutButtonComponent)
  }
  

];