import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import type { Enrollment } from '../../../shared/models/enrollment';
import { daysUntil } from '../../../shared/utils/date.util';

@Component({
  selector: 'app-my-courses',
  imports: [MatCardModule, MatButton, MatIcon, RouterLink, EmptyState, DatePipe],
  template: `
    <div class="header">
      <div>
        <h1 class="page-title">Meus cursos</h1>
        <p class="page-subtitle">
          Acompanhe seus cursos e registre o progresso dos seus estudos.
        </p>
      </div>
      <a mat-flat-button color="primary" routerLink="/courses">
        <mat-icon>add</mat-icon>
        Matricular em novo curso
      </a>
    </div>

    @if (loading()) {
      <div class="grid">
        @for (placeholder of [1, 2]; track placeholder) {
          <mat-card appearance="outlined" class="placeholder-card"></mat-card>
        }
      </div>
    } @else if (enrollments().length === 0) {
      <app-empty-state icon="assignment_ind" title="Você ainda não está matriculado em nenhum curso">
        <a mat-flat-button color="primary" routerLink="/courses">Explorar cursos</a>
      </app-empty-state>
    } @else {
      <div class="grid">
        @for (enrollment of enrollments(); track enrollment.id) {
          <mat-card appearance="outlined" class="enrollment-card">
            <mat-card-header>
              <mat-card-title>{{ enrollment.courseName }}</mat-card-title>
              <mat-card-subtitle>
                Matriculado em {{ enrollment.enrolledAt | date: 'dd/MM/yyyy' }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="enrollment-card__description">{{ enrollment.courseDescription }}</p>
              <div class="deadline" [class.deadline--danger]="daysLeft(enrollment.deadline) < 0">
                <mat-icon>{{ daysLeft(enrollment.deadline) < 0 ? 'schedule' : 'event' }}</mat-icon>
                <span>
                  @if (daysLeft(enrollment.deadline) < 0) {
                    Prazo de conclusão expirado em
                    {{ enrollment.deadline | date: 'dd/MM/yyyy' }}
                  } @else {
                    Conclusão até {{ enrollment.deadline | date: 'dd/MM/yyyy' }} —
                    {{ daysLeft(enrollment.deadline) === 0 ? 'último dia' : daysLeft(enrollment.deadline) + ' dias restantes' }}
                  }
                </span>
              </div>
            </mat-card-content>
            <mat-card-actions align="end">
              <a mat-flat-button color="primary" routerLink="/my-courses/{{ enrollment.id }}/logs">
                <mat-icon>edit_note</mat-icon>
                Registrar tarefas
              </a>
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
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .enrollment-card {
      display: flex;
      flex-direction: column;

      &__description {
        color: var(--mat-sys-on-surface-variant);
        min-height: 3em;
      }
    }

    .deadline {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      background: color-mix(in srgb, var(--mat-sys-primary) 10%, transparent);
      color: var(--mat-sys-on-surface-variant);

      mat-icon {
        flex-shrink: 0;
      }

      &--danger {
        background: color-mix(in srgb, var(--mat-sys-error) 12%, transparent);
        color: var(--mat-sys-error);
      }
    }

    .placeholder-card {
      height: 200px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyCourses {
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly enrollments = signal<Enrollment[]>([]);
  protected readonly loading = signal(true);

  protected readonly total = computed(() => this.enrollments().length);

  constructor() {
    this.enrollmentService
      .myEnrollments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (enrollments) => {
          this.enrollments.set(enrollments);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  protected daysLeft(deadline: string): number {
    return daysUntil(deadline);
  }
}
