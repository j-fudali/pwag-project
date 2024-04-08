import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class RepeatPasswordStateMatcher extends ErrorStateMatcher {
  override isErrorState(
    control: AbstractControl<any, any> | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(
      form &&
      control &&
      form.invalid &&
      form.hasError('notMatch') &&
      (control.dirty || control.touched)
    );
  }
}
