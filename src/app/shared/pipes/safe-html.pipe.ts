import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";


@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {
constructor (private safe: DomSanitizer) { }
  transform(value: any, args?: any): any {
    return  this.safe.bypassSecurityTrustHtml(value) ;
  }

}
