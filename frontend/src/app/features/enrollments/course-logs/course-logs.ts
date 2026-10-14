import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { TaskLogService } from '../../../core/services/task-log.service';
import { Notifier } from '../../../core/http/notifier.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import type { Enrollment } from '../../../shared/models/enrollment';
import { TASK_CATEGORIES, type TaskCategory, type TaskLog, type TaskLogInput } from '../../../shared/models/task-log';
import {
  daysUntil,
  decodeTimeSpent,
  encodeTimeSpent,
  formatDuration,
  toISODate,
} from '../../../shared/utils/date.util';
import { taskCategoryIcon, taskCategoryLabel } from '../../../shared/utils/task-category.util';

const DURATION_STEP = 30;
const MAX_DURATION_MINUTES = 12 * 60;

const DURATION_OPTIONS: number[] = Array.from(
  { length: MAX_DURATION_MINUTES / DURATION_STEP },
  (_, index) => (index + 1) * DURATION_STEP,
);

@Component({
  selector: 'app-course-logs',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatProgressSpinner,
    EmptyState,
    DatePipe,
  ],
  template: `
    <div class="logs-page">
      <button mat-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        Voltar
      </button>

      @if (enrollment(); as enrollment) {
        <div class="header">
          <div>
            <h1 class="page-title">{{ enrollment.courseName }}</h1>
            <p class="page-subtitle">
              Registre as tarefas realizadas no curso. O curso deve ser concluído dentro de
              6 meses a partir da matrícula.
            </p>
            <div class="deadline" [class.deadline--expired]="expired()">
              <mat-icon>{{ expired() ? 'schedule' : 'event' }}</mat-icon>
              <span>
                @if (expired()) {
                  Prazo de conclusão expirado em {{ enrollment.deadline | date: 'dd/MM/yyyy' }}
                } @else {
                  Prazo de conclusão:
                  {{ enrollment.deadline | date: 'dd/MM/yyyy' }}
                  ({{ daysLeft() === 0 ? 'último dia' : daysLeft() + ' dias restantes' }})
                }
              </span>
            </div>
          </div>
        </div>

        @if (!expired()) {
          <mat-card appearance="outlined" class="form-card">
            <mat-card-header>
              <mat-card-title>{{ editingId() ? 'Editar tarefa' : 'Registrar nova tarefa' }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="form" (ngSubmit)="submit()">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Data</mat-label>
                    <input matInput [matDatepicker]="datePicker" formControlName="date" [max]="today" />
                    <mat-datepicker-toggle matIconSuffix [for]="datePicker"></mat-datepicker-toggle>
                    <mat-datepicker #datePicker></mat-datepicker>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Categoria</mat-label>
                    <mat-select formControlName="category">
                      @for (category of categories; track category) {
                        <mat-option [value]="category">
                          <mat-icon>{{ categoryIcon(category) }}</mat-icon>
                          {{ categoryLabel(category) }}
                        </mat-option>
                      }
                    </mat-select>
                    @if (category?.hasError('required') && category?.touched) {
                      <mat-error>Escolha a categoria da tarefa.</mat-error>
                    }
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Descrição da tarefa</mat-label>
                  <textarea
                    matInput
                    formControlName="description"
                    rows="3"
                    placeholder="O que você estudou ou praticou?"
                  ></textarea>
                  @if (description?.hasError('required') && description?.touched) {
                    <mat-error>A descrição é obrigatória.</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tempo gasto</mat-label>
                  <mat-select formControlName="durationMinutes">
                    @for (option of durationOptions; track option) {
                      <mat-option [value]="option">{{ formatDuration(option) }}</mat-option>
                    }
                  </mat-select>
                  <mat-hint>Em incrementos de 30 minutos</mat-hint>
                </mat-form-field>

                <div class="form-actions">
                  @if (editingId()) {
                    <button mat-button type="button" (click)="cancelEdit()">Cancelar edição</button>
                  }
                  <button
                    mat-flat-button
                    color="primary"
                    type="submit"
                    [disabled]="saving()"
                  >
                    {{ saving() ? 'Salvando…' : editingId() ? 'Salvar alterações' : 'Adicionar tarefa' }}
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        }

        <section class="logs">
          <h2 class="logs__title">Tarefas registradas</h2>
          @if (logsLoading()) {
            <div class="loading">
              <mat-progress-spinner mode="indeterminate" diameter="32" />
            </div>
          } @else if (logs().length === 0) {
            <app-empty-state
              icon="task_alt"
              title="Nenhuma tarefa registrada"
              message="Registre sua primeira tarefa para acompanhar o progresso dos estudos."
            />
          } @else {
            @for (log of logs(); track log.id) {
              <mat-card appearance="outlined" class="log-card">
                <div class="log-card__main">
                  <div class="log-card__icon" [style.background]="categoryColor(log.category)">
                    <mat-icon>{{ categoryIcon(log.category) }}</mat-icon>
                  </div>
                  <div class="log-card__content">
                    <div class="log-card__top">
                      <span class="log-card__category">{{ categoryLabel(log.category) }}</span>
                      <span class="log-card__duration">
                        <mat-icon>schedule</mat-icon>
                        {{ durationLabel(log.timeSpent) }}
                      </span>
                    </div>
                    <p class="log-card__description">{{ log.description }}</p>
                    <span class="log-card__date">
                      {{ log.date | date: 'EEEE, dd/MM/yyyy' }}
                    </span>
                  </div>
                </div>
                <div class="log-card__actions">
                  <button mat-icon-button matTooltip="Editar" (click)="startEdit(log)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Remover" color="warn" (click)="remove(log)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </mat-card>
            }

            <p class="logs__total">
              Total registrado: <strong>{{ totalTimeLabel() }}</strong>
            </p>
          }
        </section>
      } @else if (loading()) {
        <div class="loading">
          <mat-progress-spinner mode="indeterminate" diameter="36" />
        </div>
      } @else {
        <app-empty-state icon="error_outline" title="Matrícula não encontrada">
          <button mat-button (click)="goBack()">Voltar</button>
        </app-empty-state>
      }
    </div>
  `,
  styles: `
    .logs-page {
      max-width: 860px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-title {
      margin: 0;
      font: var(--mat-sys-headline-medium);
    }

    .page-subtitle {
      margin: 8px 0 0;
      color: var(--mat-sys-on-surface-variant);
    }

    .deadline {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 8px 14px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--mat-sys-primary) 10%, transparent);
      color: var(--mat-sys-on-surface-variant);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &--expired {
        background: color-mix(in srgb, var(--mat-sys-error) 12%, transparent);
        color: var(--mat-sys-error);
      }
    }

    .form-card {
      padding: 8px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }

    .logs {
      &__title {
        margin: 0 0 16px;
        font: var(--mat-sys-title-large);
      }

      &__total {
        margin: 16px 0 0;
        text-align: right;
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 32px;
    }

    .log-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      margin-bottom: 12px;

      &__main {
        display: flex;
        gap: 16px;
        flex: 1;
      }

      &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        flex-shrink: 0;
      }

      &__top {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      &__category {
        font-weight: 600;
      }

      &__duration {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.85rem;
        color: var(--mat-sys-on-surface-variant);

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      &__description {
        margin: 6px 0;
        color: var(--mat-sys-on-surface-variant);
      }

      &__date {
        font-size: 0.85rem;
        text-transform: capitalize;
        color: var(--mat-sys-on-surface-variant);
      }

      &__actions {
        display: flex;
        flex-shrink: 0;
      }
    }

    @media (max-width: 560px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseLogs {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly taskLogService = inject(TaskLogService);
  private readonly notifier = inject(Notifier);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly today = new Date();
  protected readonly categories = TASK_CATEGORIES;
  protected readonly durationOptions = DURATION_OPTIONS;
  protected readonly formatDuration = formatDuration;

  protected readonly enrollment = signal<Enrollment | null>(null);
  protected readonly logs = signal<TaskLog[]>([]);
  protected readonly loading = signal(true);
  protected readonly logsLoading = signal(true);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<number | null>(null);

  protected readonly form = this.fb.group({
    date: [new Date(), [Validators.required]],
    category: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    durationMinutes: [DURATION_STEP, [Validators.required]],
  });

  protected readonly daysLeft = computed(() => {
    const enrollment = this.enrollment();
    return enrollment ? daysUntil(enrollment.deadline) : 0;
  });

  protected readonly expired = computed(() => this.enrollment() !== null && this.daysLeft() < 0);

  protected readonly totalTimeLabel = computed(() => {
    const total = this.logs().reduce((sum, log) => sum + decodeTimeSpent(log.timeSpent), 0);
    return formatDuration(total);
  });

  constructor() {
    const enrollmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.enrollmentService
      .myEnrollments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          const match = list.find((item) => item.id === enrollmentId);
          this.enrollment.set(match ?? null);
          this.loading.set(false);
          if (match) {
            this.loadLogs(match.id);
          }
        },
        error: () => this.loading.set(false),
      });
  }

  private loadLogs(enrollmentId: number): void {
    this.logsLoading.set(true);
    this.taskLogService
      .listByEnrollment(enrollmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (logs) => {
          this.logs.set([...logs].sort((a, b) => b.date.localeCompare(a.date)));
          this.logsLoading.set(false);
        },
        error: () => this.logsLoading.set(false),
      });
  }

  protected get category() {
    return this.form.get('category');
  }

  protected get description() {
    return this.form.get('description');
  }

  protected categoryLabel(category: TaskCategory): string {
    return taskCategoryLabel(category);
  }

  protected categoryIcon(category: TaskCategory): string {
    return taskCategoryIcon(category);
  }

  protected categoryColor(category: TaskCategory): string {
    switch (category) {
      case 'PESQUISA':
        return 'color-mix(in srgb, #f0ab00 20%, transparent)';
      case 'PRATICA':
        return 'color-mix(in srgb, #1976d2 20%, transparent)';
      case 'ASSISTIR_VIDEOAULA':
        return 'color-mix(in srgb, #7b1fa2 20%, transparent)';
    }
  }

  protected durationLabel(timeSpent: string): string {
    return formatDuration(decodeTimeSpent(timeSpent));
  }

  protected startEdit(log: TaskLog): void {
    this.editingId.set(log.id);
    this.form.patchValue({
      date: new Date(`${log.date}T00:00:00`),
      category: log.category,
      description: log.description,
      durationMinutes: decodeTimeSpent(log.timeSpent),
    });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({
      date: new Date(),
      category: '',
      description: '',
      durationMinutes: DURATION_STEP,
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const input: TaskLogInput = {
      date: toISODate(new Date(raw.date!)),
      category: raw.category as TaskCategory,
      description: raw.description!.trim(),
      timeSpent: encodeTimeSpent(toISODate(new Date(raw.date!)), raw.durationMinutes!),
    };

    this.saving.set(true);
    const enrollmentId = this.enrollment()!.id;
    const editing = this.editingId();

    const request = editing
      ? this.taskLogService.update(editing, input)
      : this.taskLogService.create(enrollmentId, input);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.notifier.success(editing ? 'Tarefa atualizada!' : 'Tarefa registrada!');
        this.cancelEdit();
        this.loadLogs(enrollmentId);
      },
      error: () => this.saving.set(false),
    });
  }

  protected remove(log: TaskLog): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Remover tarefa',
        message: 'Deseja realmente remover este registro de tarefa?',
        confirmLabel: 'Remover',
        danger: true,
      },
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.taskLogService.delete(log.id).subscribe({
          next: () => {
            this.notifier.success('Tarefa removida!');
            this.loadLogs(this.enrollment()!.id);
          },
        });
      });
  }

  protected goBack(): void {
    this.router.navigate(['/my-courses']);
  }
}
