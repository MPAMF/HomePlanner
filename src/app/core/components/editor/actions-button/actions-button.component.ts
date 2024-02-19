import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";

import { ActionsButtonOptions } from "../../../models/action-button-options";
import { CommandInvoker } from "../../../commands/command";
import {animate, keyframes, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-actions-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './actions-button.component.html',
  styleUrl: './actions-button.component.scss',
  animations: [trigger('buttonState', [
    state('true', style ({
      transform: 'scale(1)'
    })),
    transition('* => open',
      animate('2000ms', keyframes([
          style({transform: 'scale(0)'}),
          style({transform: 'scale(0.25)'}),
          style({transform: 'scale(0.5)'}),
          style({transform: 'scale(0.75)'}),
          style({transform: 'scale(1)'})
        ])
      ))
  ])]
})

export class ActionsButtonComponent {
  @Input() commandInvoker?: CommandInvoker;
  @Input() actionsButtonOptions?: ActionsButtonOptions;
}
