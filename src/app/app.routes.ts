import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent),
        canActivate: [guestGuard]
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => m.RegisterComponent),
        canActivate: [guestGuard]
      }
    ]
  },
  {
    path: 'levels',
    loadComponent: () => import('./features/levels/level-selection/level-selection.component')
      .then(m => m.LevelSelectionComponent)
  },
  {
    path: 'game/:category/:level',
    loadComponent: () => import('./features/game/game-board/game-board.component')
      .then(m => m.GameBoardComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component')
      .then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard.component')
      .then(m => m.LeaderboardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
