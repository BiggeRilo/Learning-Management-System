import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { Course } from '../../../shared/models/course';

export interface CourseFormDialogData {
  course?: Course;
}

@Component({
  selector: 'app-course-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButton],
  template: `
    <h2 mat-dialog-title>{{ isEditing() ? 'Editar curso' : 'Novo curso' }}</h2>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome do curso</mat-label>
          <input matInput formControlName="name" placeholder="Ex.: Introdução à Programação" />
          @if (name?.hasError('required') && name?.touched) {
            <mat-error>O nome do curso é obrigatório.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descrição</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="4"
            placeholder="Descreva o conteúdo do curso"
          ></textarea>
          @if (description?.hasError('required') && description?.touched) {
            <mat-error>A descrição é obrigatória.</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" [mat-dialog-close]="null">Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="submitting()">
          {{ submitting() ? 'Salvando…' : 'Salvar' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    form {
      display: block;
      min-width: 360px;
    }

    .full-width {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CourseFormDialog>);
  private readonly data = inject<CourseFormDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  protected readonly submitting = signal(false);
  protected readonly isEditing = signal(Boolean(this.data.course));

  protected readonly form = this.fb.group({
    name: [this.data.course?.name ?? '', [Validators.required]],
    description: [this.data.course?.description ?? '', [Validators.required]],
  });

  protected get name() {
    return this.form.get('name');
  }

  protected get description() {
    return this.form.get('description');
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, description } = this.form.getRawValue();
    this.dialogRef.close({ name: name ?? '', description: description ?? '' });
  }
}
