import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class Notifier {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3500, panelClass: ['notifier-success'] });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 6000, panelClass: ['notifier-error'] });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 4000 });
  }
}
