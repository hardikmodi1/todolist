import * as vscode from "vscode";

const KEY = "todolist";

export class TokenManager {
  static gloablState: vscode.Memento;

  static setToken(token: string) {
    return this.gloablState.update(KEY, token);
  }

  static getToken(): string | undefined {
    return this.gloablState.get(KEY);
  }
}
