import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appExtractFilename',
  standalone: true,
})
export class ExtractFilenamePipe implements PipeTransform {
  transform(value: string, cutTimestamp?: boolean): string {
    const extractedFilename = value.split('/').at(-1)!.split('?')[0];
    return cutTimestamp
      ? extractedFilename.split('.')[0] +
          '.' +
          extractedFilename.split('.')[1].split('_')[0]
      : extractedFilename;
  }
}
