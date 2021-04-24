import * as vscode from "vscode";

const KEY = "todolist-board";

export class BoardManager {
  static gloablState: vscode.Memento;

  static setBoardId(boardId: string | undefined) {
    return this.gloablState.update(KEY, boardId);
  }

  static getBoardId(): string | undefined {
    return this.gloablState.get(KEY);
  }
}
