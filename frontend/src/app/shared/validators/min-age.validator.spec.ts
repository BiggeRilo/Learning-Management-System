import { FormControl } from '@angular/forms';
import { minAgeValidator } from './min-age.validator';

describe('minAgeValidator', () => {
  const validator = minAgeValidator(16);

  it('should return null when the value is empty', () => {
    expect(validator(new FormControl(''))).toBeNull();
  });

  it('should return null when the birth date is exactly 16 years ago', () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 16);
    const iso = date.toISOString().slice(0, 10);
    expect(validator(new FormControl(iso))).toBeNull();
  });

  it('should return null when the student is older than 16', () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 20);
    const iso = date.toISOString().slice(0, 10);
    expect(validator(new FormControl(iso))).toBeNull();
  });

  it('should return a minAge error when the student is under 16', () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 15);
    const iso = date.toISOString().slice(0, 10);
    const result = validator(new FormControl(iso));
    expect(result).toEqual({ minAge: { requiredAge: 16 } });
  });
});
