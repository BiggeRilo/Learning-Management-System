import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function multipleOfValidator(stepMinutes: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: number | null = control.value;
    if (value === null || value === undefined || Number.isNaN(value)) {
      return null;
    }
    if (value % stepMinutes !== 0) {
      return { multipleOf: { stepMinutes } };
    }
    return null;
  };
}
