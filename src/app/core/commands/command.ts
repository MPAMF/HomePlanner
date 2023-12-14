export interface Command {
    execute(): void;
    undo(): void;
}

export class CommandInvoker {
    private history: Command[] = [];
    private historyIndex = -1;

    // TODO: maybe add a limit to the history size

    // Execute a command and add it to the history, clearing the redo history
    execute(command: Command) {
        command.execute();
        this.history.splice(this.historyIndex + 1);
        this.history.push(command);
        this.historyIndex++;
    }

    // Undo the last command
    undo() {
        if (this.historyIndex >= 0) {
            this.history[this.historyIndex].undo();
            this.historyIndex--;
        }
    }

    // Redo the last command
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.history[this.historyIndex].execute();
        }
    }
}
