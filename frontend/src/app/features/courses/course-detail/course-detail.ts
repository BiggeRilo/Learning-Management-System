import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Notifier } from '../../../core/http/notifier.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import type { Course } from '../../../shared/models/course';
import { daysUntil } from '../../../shared/utils/date.util';

@Component({
  selector: 'app-course-detail',
  imports: [MatCardModule, MatButton, MatIcon, EmptyState, DatePipe, RouterLink],
  template: `
    @if (course(); as course) {
      <div class="detail">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Voltar
        </button>

        <mat-card appearance="outlined" class="detail__card">
          <mat-card-header>
            <mat-card-title>{{ course.name }}</mat-card-title>
            <mat-card-subtitle>Criado em {{ course.createdAt | date: 'dd/MM/yyyy' }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="detail__description">{{ course.description }}</p>

            @if (enrollment(); as enrollment) {
              <div class="detail__status detail__status--enrolled">
                <mat-icon>check_circle</mat-icon>
                <div>
                  <strong>Você está matriculado</strong>
                  <p>
                    Prazo de conclusão:
                    {{ enrollment.deadline | date: 'dd/MM/yyyy' }}
                    ({{ daysLeftText() }})
                  </p>
                </div>
                <a mat-flat-button color="primary" routerLink="/my-courses/{{ enrollment.id }}/logs">
                  Registrar tarefas
                </a>
              </div>
            } @else if (auth.isAuthenticated() && !auth.isAdmin()) {
              <div class="detail__status">
                <mat-icon>info</mat-icon>
                <div>
                  <strong>Pronto para começar?</strong>
                  <p>Faça sua matrícula e inicie o processo de aprendizagem.</p>
                </div>
                <button
                  mat-flat-button
                  color="primary"
                  [disabled]="enrolling()"
                  (click)="enroll(course.id)"
                >
                  {{ enrolling() ? 'Matriculando…' : 'Matricular-se' }}
                </button>
              </div>
            } @else if (auth.isAdmin()) {
              <div class="detail__status">
                <mat-icon>admin_panel_settings</mat-icon>
                <div>
                  <strong>Visualização de administrador</strong>
                  <p>Administradores gerenciam cursos e não realizam matrículas.</p>
                </div>
                <a mat-flat-button color="primary" routerLink="/admin/courses">
                  Administrar cursos
                </a>
              </div>
            } @else {
              <div class="detail__status">
                <mat-icon>lock</mat-icon>
                <div>
                  <strong>Faça login para se matricular</strong>
                </div>
                <a mat-flat-button color="primary" routerLink="/login">Entrar</a>
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    } @else if (loading()) {
      <app-empty-state icon="hourglass_top" title="Carregando…" />
    } @else {
      <app-empty-state icon="error_outline" title="Curso não encontrado">
        <button mat-button (click)="goBack()">Voltar</button>
      </app-empty-state>
    }
  `,
  styles: `
    .detail {
      max-width: 760px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .detail__card {
      padding: 8px;
    }

    .detail__description {
      font-size: 1.05rem;
      line-height: 1.6;
      color: var(--mat-sys-on-surface-variant);
    }

    .detail__status {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 16px;
      padding: 16px;
      border-radius: 12px;
      background: var(--mat-sys-surface-container-high);

      mat-icon {
        flex-shrink: 0;
      }

      p {
        margin: 4px 0 0;
        color: var(--mat-sys-on-surface-variant);
      }

      a,
      button {
        margin-left: auto;
      }

      &--enrolled {
        background: color-mix(in srgb, var(--mat-sys-secondary) 15%, transparent);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly courseService = inject(CourseService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly notifier = inject(Notifier);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthService);

  protected readonly course = signal<Course | null>(null);
  protected readonly enrollment = signal<{ id: number; deadline: string } | null>(null);
  protected readonly loading = signal(true);
  protected readonly enrolling = signal(false);

  protected readonly daysLeftText = computed(() => {
    const enrollment = this.enrollment();
    if (!enrollment) {
      return '';
    }
    const days = daysUntil(enrollment.deadline);
    if (days < 0) {
      return 'prazo expirado';
    }
    return days === 0 ? 'último dia' : `${days} dias restantes`;
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.courseService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (course) => {
          this.course.set(course);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });

    if (this.auth.isAuthenticated() && !this.auth.isAdmin()) {
      this.enrollmentService
        .myEnrollments()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((list) => {
          const match = list.find((item) => item.courseId === id);
          if (match) {
            this.enrollment.set({ id: match.id, deadline: match.deadline });
          }
        });
    }
  }

  protected enroll(courseId: number): void {
    if (this.auth.isAdmin()) {
      return;
    }
    this.enrolling.set(true);
    this.enrollmentService
      .enroll(courseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (enrollment) => {
          this.enrollment.set({ id: enrollment.id, deadline: enrollment.deadline });
          this.enrolling.set(false);
          this.notifier.success('Matrícula realizada com sucesso!');
        },
        error: () => this.enrolling.set(false),
      });
  }

  protected goBack(): void {
    this.router.navigate(['/courses']);
  }
}
