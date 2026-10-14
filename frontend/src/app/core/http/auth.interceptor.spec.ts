import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import type { AuthResponse } from '../../shared/models/user';
import { TokenStorage } from '../services/token-storage.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpTesting: HttpTestingController;
  let tokenStorage: TokenStorage;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    tokenStorage = TestBed.inject(TokenStorage);
    tokenStorage.save('expired-access', 'valid-refresh', {
      id: 1,
      email: 'student@example.com',
      firstName: 'Ana',
      lastName: 'Silva',
      role: 'STUDENT',
    });
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('refreshes an expired access token and retries the original request', async () => {
    const resultPromise = firstValueFrom(
      TestBed.inject(HttpClient).get<{ ok: boolean }>('/api/protected'),
    );

    const initialRequest = httpTesting.expectOne('/api/protected');
    expect(initialRequest.request.headers.get('Authorization')).toBe('Bearer expired-access');
    initialRequest.flush(null, { status: 401, statusText: 'Unauthorized' });

    const refreshRequest = httpTesting.expectOne('/api/auth/refresh');
    expect(refreshRequest.request.body).toEqual({ refreshToken: 'valid-refresh' });
    const response: AuthResponse = {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      tokenType: 'Bearer',
      user: {
        id: 1,
        firstName: 'Ana',
        lastName: 'Silva',
        birthDate: '2000-01-01',
        email: 'student@example.com',
        phone: '11999999999',
        role: 'STUDENT',
        createdAt: '2026-08-08T00:00:00',
      },
    };
    refreshRequest.flush(response);

    const retriedRequest = httpTesting.expectOne('/api/protected');
    expect(retriedRequest.request.headers.get('Authorization')).toBe('Bearer new-access');
    retriedRequest.flush({ ok: true });

    await expect(resultPromise).resolves.toEqual({ ok: true });
    expect(tokenStorage.getAccessToken()).toBe('new-access');
    expect(tokenStorage.getRefreshToken()).toBe('new-refresh');
  });

  it('shares one refresh request between simultaneous 401 responses', async () => {
    const http = TestBed.inject(HttpClient);
    const firstResult = firstValueFrom(http.get('/api/first'));
    const secondResult = firstValueFrom(http.get('/api/second'));

    httpTesting.expectOne('/api/first').flush(null, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne('/api/second').flush(null, { status: 401, statusText: 'Unauthorized' });

    const refreshRequests = httpTesting.match('/api/auth/refresh');
    expect(refreshRequests).toHaveLength(1);
    refreshRequests[0].flush({
      accessToken: 'shared-access',
      refreshToken: 'shared-refresh',
      tokenType: 'Bearer',
      user: {
        id: 1,
        firstName: 'Ana',
        lastName: 'Silva',
        birthDate: '2000-01-01',
        email: 'student@example.com',
        phone: '11999999999',
        role: 'STUDENT',
        createdAt: '2026-08-08T00:00:00',
      },
    } satisfies AuthResponse);

    const firstRetry = httpTesting.expectOne('/api/first');
    const secondRetry = httpTesting.expectOne('/api/second');
    expect(firstRetry.request.headers.get('Authorization')).toBe('Bearer shared-access');
    expect(secondRetry.request.headers.get('Authorization')).toBe('Bearer shared-access');
    firstRetry.flush({ ok: 1 });
    secondRetry.flush({ ok: 2 });

    await expect(firstResult).resolves.toEqual({ ok: 1 });
    await expect(secondResult).resolves.toEqual({ ok: 2 });
  });
});
