import { type HttpHandlerFn, type HttpRequest } from '@angular/common/http';

const JSON_METHODS = new Set(['POST', 'PUT', 'PATCH']);

function shouldUseJsonContentType(req: HttpRequest<unknown>): boolean {
  if (!JSON_METHODS.has(req.method)) {
    return false;
  }
  if (req.body === null || req.body === undefined) {
    return false;
  }
  if (req.body instanceof FormData || req.body instanceof Blob || req.body instanceof ArrayBuffer) {
    return false;
  }
  return true;
}

export function jsonContentTypeInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): ReturnType<HttpHandlerFn> {
  if (!shouldUseJsonContentType(req)) {
    return next(req);
  }

  const contentType = req.headers.get('Content-Type');
  if (contentType?.toLowerCase().startsWith('application/json')) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }),
  );
}
