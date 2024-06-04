import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appMapConditions',
  standalone: true,
})
export class MapConditionsPipe implements PipeTransform {
  transform(condition: string): string {
    switch (condition) {
      case 'ok':
        return 'OK';
      case 'borrowed':
        return 'Pożyczony';
      default:
        return 'Zniszczony';
    }
  }
}
