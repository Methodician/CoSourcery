import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[cosClickOut]'
})
export class ClickOutDirective {

  constructor(private elementRef: ElementRef) { }

  @Output()
  public cosClickOut = new EventEmitter();

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.cosClickOut.emit(true);
    }
  }

}
