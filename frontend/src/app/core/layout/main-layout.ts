import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [
    MatToolbar,
    MatButton,
    MatIconButton,
    MatIcon,
    MatMenuModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  template: `
    <mat-toolbar class="toolbar" color="primary">
      <a class="toolbar__brand" routerLink="/">
        <mat-icon>school</mat-icon>
        <span>LMS</span>
      </a>

      <nav class="toolbar__nav">
        <a
          mat-button
          routerLink="/courses"
          routerLinkActive="toolbar__link--active"
          [routerLinkActiveOptions]="{ exact: false }"
        >
          Cursos
        </a>
        @if (auth.isAuthenticated() && !auth.isAdmin()) {
          <a
            mat-button
            routerLink="/my-courses"
            routerLinkActive="toolbar__link--active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Meus cursos
          </a>
        }
        @if (auth.isAdmin()) {
          <a
            mat-button
            routerLink="/admin/courses"
            routerLinkActive="toolbar__link--active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Administrar
          </a>
        }
      </nav>

      <span class="toolbar__spacer"></span>

      @if (auth.isAuthenticated()) {
        <button mat-icon-button [matMenuTriggerFor]="userMenu" [attr.aria-label]="'Menu do usuário'">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item disabled>
            <mat-icon>person</mat-icon>
            {{ fullName() }} ({{ roleLabel() }})
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            Sair
          </button>
        </mat-menu>
      } @else {
        <a mat-button routerLink="/login">Entrar</a>
      }
    </mat-toolbar>

    <main class="page">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      gap: 8px;

      &__brand {
        display: flex;
        align-items: center;
        gap: 8px;
        color: inherit;
        text-decoration: none;
        font-weight: 600;
      }

      &__nav {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: 16px;
        overflow-x: auto;
      }

      &__link--active {
        background-color: rgb(255 255 255 / 0.15);
      }

      &__spacer {
        flex: 1 1 auto;
      }
    }

    .page {
      flex: 1 1 auto;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px 48px;
      box-sizing: border-box;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly fullName = computed(() => {
    const user = this.auth.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  protected readonly roleLabel = computed(() => (this.auth.isAdmin() ? 'Administrador' : 'Estudante'));

  protected logout(): void {
    this.auth.logout();
  }
}
