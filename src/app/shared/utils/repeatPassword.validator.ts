import { AbstractControl, ValidationErrors } from '@angular/forms';

export function repeatPassword(
  group: AbstractControl
): ValidationErrors | null {
  const password = group.get('password')?.value;
  const rePassword = group.get('rePassword')?.value;
  return password === rePassword ? null : { notMatch: true };
}
