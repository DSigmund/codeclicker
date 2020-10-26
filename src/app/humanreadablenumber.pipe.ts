import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanreadablenumber'
})
export class HumanreadablenumberPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value > (1000 * 1000 * 1000)) {
      return (value / (1000 * 1000 * 1000)).toFixed(2) + 'g';
    } else if (value > (1000 * 1000)) {
      return (value / (1000 * 1000)).toFixed(2) + 'm';
    } else if (value > 1000) {
      return (value / 1000).toFixed(2) + 'k';
    } else {
      return value.toFixed(2);
    }
  }
}
