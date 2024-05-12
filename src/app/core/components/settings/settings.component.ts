import {Component, OnInit} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {MatIconModule} from "@angular/material/icon";
import {NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {MatSelectModule} from "@angular/material/select";

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
    MatSelectModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  public selectedLanguage: string = "";

  constructor(private translateService: TranslateService) {
  }

  ngOnInit() {
    this.selectedLanguage = this.translateService.currentLang;
  }

  languageSelected() {
    this.translateService.use(this.selectedLanguage);
  }
}
