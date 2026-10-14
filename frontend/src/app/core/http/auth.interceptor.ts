import {
  HttpErrorResponse,
  type HttpEvent,
  type HttpHandlerFn,
  type HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { SessionRefreshService } from '../services/session-refresh.service';
import { TokenStorage } from '../services/token-storage.service';

function isPublicAuthRequest(url: string): boolean {
  return /\/api\/auth\/(login|register|refresh)$/.test(url);
}

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const tokenStorage = inject(TokenStorage);
  const sessionRefresh = inject(SessionRefreshService);
  if (isPublicAuthRequest(req.url)) {
    return next(req);
  }

  const token = tokenStorage.getAccessToken();
  const authenticatedRequest = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || !tokenStorage.getRefreshToken()) {
        return throwError(() => error);
      }

      return sessionRefresh.refreshAccessToken().pipe(
        switchMap((accessToken) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })),
        ),
      );
    }),
  );
}
