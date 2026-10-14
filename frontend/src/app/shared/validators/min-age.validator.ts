import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null = control.value;
    if (!value) {
      return null;
    }
    const birth = new Date(value);
    if (Number.isNaN(birth.getTime())) {
      return null;
    }
    const today = new Date();
    const cutoff = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    if (birth.getTime() > cutoff.getTime()) {
      return { minAge: { requiredAge: minAge } };
    }
    return null;
  };
}
