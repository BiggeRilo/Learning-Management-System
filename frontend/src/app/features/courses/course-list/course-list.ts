import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Notifier } from '../../../core/http/notifier.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Course } from '../../../shared/models/course';
import { daysUntil } from '../../../shared/utils/date.util';

@Component({
  selector: 'app-course-list',
  imports: [MatCardModule, MatButton, MatIcon, RouterLink, EmptyState, DatePipe],
  template: `
    <div class="header">
      <div>
        <h1 class="page-title">Cursos disponíveis</h1>
        <p class="page-subtitle">
          Escolha um curso e comece sua jornada de aprendizagem. Matrícula liberada por tempo
          indeterminado.
        </p>
      </div>
    </div>

    @if (loading()) {
      <div class="grid">
        @for (placeholder of [1, 2, 3, 4]; track placeholder) {
          <mat-card appearance="outlined" class="skeleton-card">
            <div class="skeleton skeleton--title"></div>
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text"></div>
          </mat-card>
        }
      </div>
    } @else if (courses().length === 0) {
      <app-empty-state icon="menu_book" title="Nenhum curso disponível" />
    } @else {
      <div class="grid">
        @for (course of courses(); track course.id) {
          <mat-card appearance="outlined" class="course-card">
            <mat-card-header>
              <mat-card-title>{{ course.name }}</mat-card-title>
              <mat-card-subtitle>Criado em {{ course.createdAt | date: 'dd/MM/yyyy' }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="course-card__description">{{ course.description }}</p>
              @if (enrollmentFor(course.id); as enrollment) {
                <span class="enrolled-chip">
                  <mat-icon>check_circle</mat-icon>
                  Matriculado
                  @if (daysLeft(enrollment.deadline) >= 0) {
                    — {{ daysLeft(enrollment.deadline) }} dias restantes
                  }
                </span>
              }
            </mat-card-content>
            <mat-card-actions align="end">
              <a mat-button routerLink="/courses/{{ course.id }}">Ver detalhes</a>
              @if (auth.isAuthenticated() && !auth.isAdmin() && !enrollmentFor(course.id)) {
                <button
                  mat-flat-button
                  color="primary"
                  [disabled]="enrollingId() === course.id"
                  (click)="enroll(course.id)"
                >
                  {{ enrollingId() === course.id ? 'Matriculando…' : 'Matricular' }}
                </button>
              }
            </mat-card-actions>
          </mat-card>
        }
      </div>
    }
  `,
  styles: `
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }

    .page-title {
      margin: 0;
      font: var(--mat-sys-headline-medium);
    }

    .page-subtitle {
      margin: 8px 0 0;
      color: var(--mat-sys-on-surface-variant);
      max-width: 640px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .course-card {
      display: flex;
      flex-direction: column;
      height: 100%;

      &__description {
        color: var(--mat-sys-on-surface-variant);
        min-height: 3em;
      }
    }

    .enrolled-chip {
      margin-top: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--mat-sys-secondary) 18%, transparent);
      color: var(--mat-sys-on-secondary-container);
    }

    .skeleton-card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skeleton {
      border-radius: 8px;
      background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;

      &--title {
        height: 20px;
        width: 70%;
      }

      &--text {
        height: 14px;
        width: 100%;
      }
    }

    @keyframes shimmer {
      to {
        background-position: -200% 0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseList {
  private readonly courseService = inject(CourseService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthService);

  protected readonly courses = signal<Course[]>([]);
  protected readonly enrollments = signal(new Map<number, { id: number; deadline: string }>());
  protected readonly loading = signal(true);
  protected readonly enrollingId = signal<number | null>(null);

  constructor() {
    this.courseService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (courses) => {
          this.courses.set(courses);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });

    if (this.auth.isAuthenticated() && !this.auth.isAdmin()) {
      this.enrollmentService
        .myEnrollments()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((list) => {
          const map = new Map<number, { id: number; deadline: string }>();
          for (const item of list) {
            map.set(item.courseId, { id: item.id, deadline: item.deadline });
          }
          this.enrollments.set(map);
        });
    }
  }

  protected enrollmentFor(courseId: number): { id: number; deadline: string } | undefined {
    return this.enrollments().get(courseId);
  }

  protected daysLeft(deadline: string): number {
    return daysUntil(deadline);
  }

  protected enroll(courseId: number): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/courses' } });
      return;
    }
    if (this.auth.isAdmin()) {
      return;
    }
    this.enrollingId.set(courseId);
    this.enrollmentService
      .enroll(courseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (enrollment) => {
          const updated = new Map(this.enrollments());
          updated.set(courseId, { id: enrollment.id, deadline: enrollment.deadline });
          this.enrollments.set(updated);
          this.enrollingId.set(null);
          this.notifier.success('Matrícula realizada com sucesso!');
        },
        error: () => this.enrollingId.set(null),
      });
  }
}
