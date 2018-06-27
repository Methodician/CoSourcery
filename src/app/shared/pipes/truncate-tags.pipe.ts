import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateTags'
})
export class TruncateTagsPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
