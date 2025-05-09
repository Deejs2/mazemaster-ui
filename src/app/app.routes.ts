import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'maze', loadComponent: () => import('./pages/maze/maze.component').then(m => m.MazeComponent) },
  { path: 'auth', loadChildren: () => import('./auth/auth-routing.module').then(m => m.AuthRoutingModule) },
  { path: '**', redirectTo: '' } // Wildcard route should always be last
];
