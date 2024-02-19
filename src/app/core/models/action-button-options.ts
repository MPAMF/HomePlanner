import {Board} from "./board";
import {CommandInvoker} from "../commands/command";

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
    public iconsName: string,
    public onClickMethod: (commandInvoker: CommandInvoker) => void
  ) {}
}
