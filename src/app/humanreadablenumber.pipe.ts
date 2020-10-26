import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanreadablenumber'
})
export class HumanreadablenumberPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value > 1000000) {
      return (value / 1000000) + 'm';
    } else if (value > 1000) {
      return (value / 1000) + 'k';
    } else {
      return value;
    }
  }
}
