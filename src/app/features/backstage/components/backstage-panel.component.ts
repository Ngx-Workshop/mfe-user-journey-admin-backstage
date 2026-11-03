import { afterNextRender, afterRenderEffect, ChangeDetectionStrategy, Component, DestroyRef,
  ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { NgxPanel, NgxPanelShape, NgxPanelBackground, NgxPanelTone } from '@tmdjr/ngx-workshop-design-system';
import { observePanelBody } from '../utils/panel-body-viewport';
@Component({
  selector: 'ngx-backstage-panel', imports: [NgxPanel], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-panel [heading]="heading()" [eyebrow]="eyebrow()" [shape]="shape()" [background]="background()" [tone]="tone()">
      <div ngxPanelHeader class="backstage-panel__tools"><ng-content select="[backstagePanelHeader]" /></div>
      <section #body class="backstage-panel__body" [style.height.px]="bodyHeight()" tabindex="0"
        role="region" [attr.aria-label]="heading()"><ng-content /></section>
    </ngx-panel>
  `,
  styles: [`
    :host { display: block; min-height: 0; min-width: 0; height: 100%; }
    ngx-panel { height: auto; }
    .backstage-panel__tools { display: flex; gap: 0.5rem; align-items: center; font: var(--ngx-font-label); font-size: 0.7rem; }
    .backstage-panel__body { position: relative; min-height: 0; overflow: auto; scrollbar-width: thin; box-sizing: border-box; padding: 4px 2px; }
    .backstage-panel__body:focus-visible { outline: 2px solid var(--ngx-color-primary); outline-offset: -2px; }
  `],
})
export class BackstagePanelComponent {
  readonly heading = input.required<string>(); readonly eyebrow = input.required<string>();
  readonly shape = input<NgxPanelShape>('stepped'); readonly background = input<NgxPanelBackground>('solid');
  readonly tone = input<NgxPanelTone>('primary'); readonly resetKey = input<unknown>(null); readonly bodyHeight = signal(0);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body'); private readonly destroyRef = inject(DestroyRef);
  constructor() {
    afterRenderEffect(() => { this.resetKey(); this.body().nativeElement.scrollTop = 0; });
    afterNextRender(() => this.destroyRef.onDestroy(observePanelBody(this.host.nativeElement,
      this.body().nativeElement, height => this.bodyHeight.set(height ?? 0), 'container')));
  }
}
