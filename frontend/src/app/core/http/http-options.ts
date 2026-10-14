import { HttpHeaders } from '@angular/common/http';

export const jsonHttpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }),
};
