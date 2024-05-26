import {Component, Inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatIconModule} from "@angular/material/icon";
import {NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {Canvas} from "../../models/canvas";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatIconModule,
    NgIf,
    ReactiveFormsModule,
    TranslateModule,
    MatSelectModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  public selectedLanguage: string = "";

  constructor(private translateService: TranslateService,
              @Inject(MAT_DIALOG_DATA) public data: { canvas: Canvas }) {
  }

  ngOnInit() {
    this.selectedLanguage = this.translateService.currentLang || this.translateService.defaultLang;
  }

  languageSelected() {
    this.translateService.use(this.selectedLanguage);
  }

  scaleChanged($event: Event) {
    this.data.canvas.scale = parseFloat(($event.target as HTMLInputElement).value);
  }
}
