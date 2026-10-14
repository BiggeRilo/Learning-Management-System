import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    MatIcon,
    RouterLink,
  ],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card" appearance="outlined">
        <mat-card-header>
          <mat-card-title>Entrar</mat-card-title>
          <mat-card-subtitle>Acesse sua conta na plataforma</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput formControlName="email" type="email" autocomplete="email" />
              <mat-icon matPrefix>mail</mat-icon>
              @if (email?.invalid && email?.touched) {
                <mat-error>Informe um e-mail válido.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input
                matInput
                formControlName="password"
                [type]="showPassword() ? 'text' : 'password'"
                autocomplete="current-password"
              />
              <button
                mat-icon-button
                matIconSuffix
                type="button"
                (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
              >
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (password?.invalid && password?.touched) {
                <mat-error>A senha é obrigatória.</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              class="full-width submit"
              type="submit"
              [disabled]="submitting()"
            >
              {{ submitting() ? 'Entrando…' : 'Entrar' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <span>Ainda não tem conta?</span>
          <a mat-button routerLink="/register">Cadastre-se</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: `
    .auth-page {
      display: flex;
      justify-content: center;
      padding-top: 48px;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 16px;
    }

    .full-width {
      width: 100%;
    }

    .submit {
      margin-top: 8px;
    }

    mat-card-actions {
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/courses']);
    }
  }

  protected get email() {
    return this.form.get('email');
  }

  protected get password() {
    return this.form.get('password');
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.auth
      .login({ email: email ?? '', password: password ?? '' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const returnUrl = this.router.parseUrl(this.router.url).queryParamMap.get('returnUrl');
          this.router.navigateByUrl(returnUrl ?? '/courses');
        },
        error: () => this.submitting.set(false),
      });
  }
}
