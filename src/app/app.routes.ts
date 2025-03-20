import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
    { path: 'maze', loadComponent: () => import('./pages/maze/maze.component').then(m => m.MazeComponent) },
    { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) },
    { path: '**', redirectTo: '' }
  ];
