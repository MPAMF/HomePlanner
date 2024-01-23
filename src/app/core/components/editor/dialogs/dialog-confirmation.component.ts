import {Component, Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";

export interface DialogConfirmationComponentData {
  title: string;
  content: string;
}

@Component({
  selector: 'app-dialog-confirmation',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './dialog-confirmation.component.html',
  styleUrl: './dialog-confirmation.component.scss'
})
export class DialogConfirmationComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogConfirmationComponentData
  ) { }
}
