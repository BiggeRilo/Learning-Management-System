import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, map, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuthResponse, AuthUser } from '../../shared/models/user';
import { jsonHttpOptions } from '../http/http-options';
import { TokenStorage } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class SessionRefreshService {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly tokenStorage = inject(TokenStorage);
  private refreshRequest$: Observable<string> | null = null;

  refreshAccessToken(): Observable<string> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(
        () => new HttpErrorResponse({ status: 401, statusText: 'Refresh token unavailable' }),
      );
    }

    this.refreshRequest$ = this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/auth/refresh`,
        { refreshToken },
        jsonHttpOptions,
      )
      .pipe(
        tap((response) => this.persistSession(response)),
        map((response) => response.accessToken),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.refreshRequest$;
  }

  private persistSession(response: AuthResponse): void {
    const user: AuthUser = {
      id: response.user.id,
      email: response.user.email,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      role: response.user.role,
    };
    this.tokenStorage.save(response.accessToken, response.refreshToken, user);
  }
}
