import { FormControl } from '@angular/forms';
import { multipleOfValidator } from './multiple-of.validator';

describe('multipleOfValidator', () => {
  const validator = multipleOfValidator(30);

  it('should return null when the value is empty', () => {
    expect(validator(new FormControl(null))).toBeNull();
    expect(validator(new FormControl(undefined))).toBeNull();
  });

  it('should return null for multiples of 30', () => {
    expect(validator(new FormControl(30))).toBeNull();
    expect(validator(new FormControl(90))).toBeNull();
    expect(validator(new FormControl(240))).toBeNull();
  });

  it('should return an error for values that are not multiples of 30', () => {
    const result = validator(new FormControl(45));
    expect(result).toEqual({ multipleOf: { stepMinutes: 30 } });
  });
});
