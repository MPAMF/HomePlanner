import {trigger, keyframes, transition, animate, state, AnimationTriggerMetadata, style} from '@angular/animations';

export const bottomToTopScaleAnimation: AnimationTriggerMetadata = trigger('buttonState', [
  state('true', style ({
    transform: 'scale(1)'
  })),
  transition('* => open',
    animate('1000ms', keyframes([
        style({transform: 'scale(0) translateY(-100%)'}),
        style({transform: 'scale(0.25) translateY(-75%)'}),
        style({transform: 'scale(0.5) translateY(-50%)'}),
        style({transform: 'scale(0.75) translateY(-25%)'}),
        style({transform: 'scale(1) translateY(0%)'})
      ])
    ))
]);
