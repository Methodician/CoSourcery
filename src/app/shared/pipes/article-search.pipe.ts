import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'articleSearch'
})
export class ArticleSearchPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
