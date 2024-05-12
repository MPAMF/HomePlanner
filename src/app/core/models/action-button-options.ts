import {Board} from "./board";
import {CommandInvoker} from "../commands/command";
import {MatDialog} from "@angular/material/dialog";

export class ActionsButtonOptions {

  constructor(
    public isActionsButtonVisible: boolean = false,
    public actionsButtonLeftPosition: number = 0,
    public actionsButtonTopPosition: number = 0,
    public buttonsAndActions: ActionButtonProps[] = []
  ) {}
}

export class ActionButtonProps {

  constructor(
    public iconName: string,
    public onClickMethod: (commandInvoker?: CommandInvoker, modalElementProperties?: MatDialog) => void
  ) {}
}
