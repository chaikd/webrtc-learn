import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[webrtcSrcObject]'
})
export class SrcObjectDirective {

  @Input() webrtcSrcObject: any
  constructor(private el: ElementRef, private renderer: Renderer2) { 
    this.renderer.setAttribute(el.nativeElement, 'srcObject', this.webrtcSrcObject)
  }

}
