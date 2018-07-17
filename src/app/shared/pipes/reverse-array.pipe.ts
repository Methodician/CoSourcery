import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverseArray',
  pure: false
})
export class ReverseArrayPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value) {
      return value.reverse();
    }
  }

}
