import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { toISODate } from '../../../shared/utils/date.util';
import { minAgeValidator } from '../../../shared/validators/min-age.validator';

function passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (password && confirm && password !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    MatIcon,
    MatDatepickerModule,
    RouterLink,
  ],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card" appearance="outlined">
        <mat-card-header>
          <mat-card-title>Criar conta</mat-card-title>
          <mat-card-subtitle>Cadastre-se como estudante</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Primeiro nome</mat-label>
                <input matInput formControlName="firstName" autocomplete="given-name" />
                @if (firstName?.hasError('required') && firstName?.touched) {
                  <mat-error>Informe seu primeiro nome.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Último nome</mat-label>
                <input matInput formControlName="lastName" autocomplete="family-name" />
                @if (lastName?.hasError('required') && lastName?.touched) {
                  <mat-error>Informe seu último nome.</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Data de nascimento</mat-label>
              <input
                matInput
                [matDatepicker]="birthPicker"
                formControlName="birthDate"
                [max]="maxBirthDate"
                autocomplete="bday"
              />
              <mat-datepicker-toggle matIconSuffix [for]="birthPicker"></mat-datepicker-toggle>
              <mat-datepicker #birthPicker></mat-datepicker>
              @if (birthDate?.hasError('minAge') && birthDate?.touched) {
                <mat-error>É necessário ter pelo menos 16 anos.</mat-error>
              }
              @if (birthDate?.hasError('required') && birthDate?.touched) {
                <mat-error>Informe sua data de nascimento.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput formControlName="email" type="email" autocomplete="email" />
              <mat-icon matPrefix>mail</mat-icon>
              @if (email?.hasError('required') && email?.touched) {
                <mat-error>Informe seu e-mail.</mat-error>
              }
              @if (email?.hasError('email') && email?.touched) {
                <mat-error>Informe um e-mail válido.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Telefone</mat-label>
              <input matInput formControlName="phone" autocomplete="tel" placeholder="(11) 99999-9999" />
              <mat-icon matPrefix>phone</mat-icon>
              @if (phone?.invalid && phone?.touched) {
                <mat-error>Informe um telefone válido.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input
                matInput
                formControlName="password"
                [type]="showPassword() ? 'text' : 'password'"
                autocomplete="new-password"
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
                <mat-error>A senha deve ter pelo menos 8 caracteres.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar senha</mat-label>
              <input
                matInput
                formControlName="confirmPassword"
                [type]="showPassword() ? 'text' : 'password'"
                autocomplete="new-password"
              />
              @if (confirmPassword?.hasError('required') && confirmPassword?.touched) {
                <mat-error>Confirme sua senha.</mat-error>
              }
              @if (form.hasError('passwordMismatch') && confirmPassword?.touched) {
                <mat-error>As senhas não coincidem.</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              class="full-width submit"
              type="submit"
              [disabled]="submitting()"
            >
              {{ submitting() ? 'Criando…' : 'Criar conta' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <span>Já tem uma conta?</span>
          <a mat-button routerLink="/login">Entrar</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: `
    .auth-page {
      display: flex;
      justify-content: center;
      padding-top: 32px;
    }

    .auth-card {
      width: 100%;
      max-width: 520px;
      padding: 16px;
    }

    .full-width {
      width: 100%;
    }

    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .submit {
      margin-top: 8px;
    }

    mat-card-actions {
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    @media (max-width: 480px) {
      .row {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly maxBirthDate = new Date();
  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);

  protected readonly form = this.fb.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      birthDate: ['', [Validators.required, minAgeValidator(16)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/courses']);
    }
  }

  protected get firstName() {
    return this.form.get('firstName');
  }

  protected get lastName() {
    return this.form.get('lastName');
  }

  protected get birthDate() {
    return this.form.get('birthDate');
  }

  protected get email() {
    return this.form.get('email');
  }

  protected get phone() {
    return this.form.get('phone');
  }

  protected get password() {
    return this.form.get('password');
  }

  protected get confirmPassword() {
    return this.form.get('confirmPassword');
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { firstName, lastName, birthDate, email, phone, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.auth
      .register({
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        birthDate: birthDate ? toISODate(new Date(birthDate)) : '',
        email: email ?? '',
        phone: phone ?? '',
        password: password ?? '',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/courses']),
        error: () => this.submitting.set(false),
      });
  }
}
