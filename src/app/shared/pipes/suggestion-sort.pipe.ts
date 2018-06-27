import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'suggestionSort'
})
export class SuggestionSortPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
