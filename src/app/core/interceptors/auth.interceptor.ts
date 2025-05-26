import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('maze_master_token');
  const router = inject(Router);

  // Attach token to the request if it exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Handle unauthorized or forbidden errors
      if (error.status === 401 || error.status === 403) {
        localStorage.clear(); // Clear tokens and user data
        router.navigate(['/auth/login']).then(() => {
          window.location.reload(); // Force a full page reload
        });
      }
      return throwError(() => error);
    })
  );
};