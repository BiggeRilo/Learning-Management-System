import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { CourseFormDialog } from '../course-form-dialog/course-form-dialog';
import { CourseService } from '../../../core/services/course.service';
import { Notifier } from '../../../core/http/notifier.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import type { Course } from '../../../shared/models/course';

@Component({
  selector: 'app-admin-courses',
  imports: [
    MatTableModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatProgressSpinner,
    EmptyState,
    DatePipe,
  ],
  template: `
    <div class="header">
      <div>
        <h1 class="page-title">Administrar cursos</h1>
        <p class="page-subtitle">Crie, edite e remova os cursos da plataforma.</p>
      </div>
      <button mat-flat-button color="primary" (click)="create()">
        <mat-icon>add</mat-icon>
        Novo curso
      </button>
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="36" />
      </div>
    } @else if (courses().length === 0) {
      <app-empty-state icon="menu_book" title="Nenhum curso cadastrado">
        <button mat-flat-button color="primary" (click)="create()">Criar o primeiro curso</button>
      </app-empty-state>
    } @else {
      <div class="table-wrap">
        <table mat-table [dataSource]="courses()">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nome</th>
            <td mat-cell *matCellDef="let course">{{ course.name }}</td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Criado em</th>
            <td mat-cell *matCellDef="let course">{{ course.createdAt | date: 'dd/MM/yyyy' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-col">Ações</th>
            <td mat-cell *matCellDef="let course" class="actions-col">
              <button mat-icon-button (click)="edit(course)" matTooltip="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                (click)="remove(course)"
                matTooltip="Remover"
                color="warn"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
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

    .loading {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .table-wrap {
      overflow-x: auto;
      border-radius: 12px;
      box-shadow: var(--mat-sys-level1);
    }

    .actions-col {
      width: 110px;
      text-align: right;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCourses {
  private readonly courseService = inject(CourseService);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(Notifier);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly courses = signal<Course[]>([]);
  protected readonly loading = signal(true);
  protected readonly displayedColumns = ['name', 'createdAt', 'actions'];

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
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
  }

  protected create(): void {
    const ref = this.dialog.open(CourseFormDialog);
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((input) => {
        if (!input) {
          return;
        }
        this.courseService.create(input).subscribe({
          next: () => {
            this.notifier.success('Curso criado com sucesso!');
            this.load();
          },
        });
      });
  }

  protected edit(course: Course): void {
    const ref = this.dialog.open(CourseFormDialog, { data: { course } });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((input) => {
        if (!input) {
          return;
        }
        this.courseService.update(course.id, input).subscribe({
          next: () => {
            this.notifier.success('Curso atualizado com sucesso!');
            this.load();
          },
        });
      });
  }

  protected remove(course: Course): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Remover curso',
        message: `Deseja realmente remover o curso "${course.name}"? Esta ação não pode ser desfeita.`,
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
        this.courseService.delete(course.id).subscribe({
          next: () => {
            this.notifier.success('Curso removido com sucesso!');
            this.load();
          },
        });
      });
  }
}
