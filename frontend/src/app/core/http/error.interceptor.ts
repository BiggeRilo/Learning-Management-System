import { HttpErrorResponse, type HttpEvent, type HttpHandlerFn, type HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import type { ApiError } from '../../shared/models/api';
import { TokenStorage } from '../services/token-storage.service';
import { Notifier } from './notifier.service';

function isPublicAuthRequest(url: string): boolean {
  return /\/api\/auth\/(login|register|refresh)$/.test(url);
}

function extractMessage(error: HttpErrorResponse, requestUrl: string): string {
  const body = error.error;
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    return body.message;
  }
  if (error.status === 0) {
    return 'Não foi possível conectar ao servidor. Tente novamente.';
  }
  switch (error.status) {
    case 400:
      return 'Requisição inválida. Verifique os dados informados.';
    case 401:
      if (isPublicAuthRequest(requestUrl)) {
        return 'Não foi possível autenticar. Verifique seus dados e tente novamente.';
      }
      return 'Sua sessão expirou. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    case 404:
      return 'O recurso solicitado não foi encontrado.';
    case 409:
      return 'Conflito: o registro já existe ou não está disponível.';
    case 422:
      return 'Dados não processáveis. Verifique as regras de negócio.';
    case 500:
    default:
      return 'Ocorreu um erro inesperado no servidor.';
  }
}

function extractFieldErrors(error: HttpErrorResponse): Record<string, string> | undefined {
  const body = error.error;
  if (body && typeof body === 'object' && body.fieldErrors && typeof body.fieldErrors === 'object') {
    return body.fieldErrors as Record<string, string>;
  }
  return undefined;
}

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const notifier = inject(Notifier);
  const router = inject(Router);
  const tokenStorage = inject(TokenStorage);

  return next(req).pipe(
    catchError((error: HttpErrorResponse): Observable<never> => {
      if (error.status === 401 && !isPublicAuthRequest(req.url)) {
        const returnUrl = router.url;
        tokenStorage.clear();
        void router.navigate(['/login'], {
          queryParams: returnUrl && returnUrl !== '/login' ? { returnUrl } : undefined,
        });
      }

      const apiError: ApiError = {
        status: error.status,
        message: extractMessage(error, req.url),
        fieldErrors: extractFieldErrors(error),
      };
      notifier.error(apiError.message);
      return throwError(() => apiError);
    }),
  );
}
