import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";

import { ActionsButtonOptions } from "../../../models/action-button-options";
import { CommandInvoker } from "../../../commands/command";
import {bottomToTopScaleAnimation} from "../../animations/bottom-to-top-scale-animation";

@Component({
  selector: 'app-actions-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './actions-button.component.html',
  styleUrl: './actions-button.component.scss',
  animations: [bottomToTopScaleAnimation]
})

export class ActionsButtonComponent {
  @Input() commandInvoker?: CommandInvoker;
  @Input() actionsButtonOptions?: ActionsButtonOptions;
}
