import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest, User } from '../../shared/models/user';
import { environment } from '../../../environments/environment';
import { jsonHttpOptions } from '../http/http-options';
import { TokenStorage } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorage);
  private readonly router = inject(Router);

  readonly user = this.tokenStorage.user;
  readonly isAuthenticated = computed(
    () => this.user() !== null && this.tokenStorage.accessToken() !== null,
  );
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request, jsonHttpOptions).pipe(
      tap((response) => this.handleAuth(response)),
    );
  }

  register(request: RegisterRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request, jsonHttpOptions).pipe(
      tap((response) => this.handleAuth(response)),
    );
  }

  logout(): void {
    this.tokenStorage.clear();
    this.router.navigate(['/login']);
  }

  private handleAuth(response: AuthResponse): void {
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

export type { User };
