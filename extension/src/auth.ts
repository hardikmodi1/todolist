import * as vscode from "vscode";

import { API_BASE_URL } from "./constants";
import polka from "polka";
import { TokenManager } from "./TokenManager";

export const auth = (fn?: () => void) => {
  const app = polka();

  app.listen(54321, (err: Error) => {
    if (err) {
      vscode.window.showErrorMessage(err.message);
    } else {
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse(`${API_BASE_URL}/auth/github`)
      );
    }
  });

  app.get("/auth/:token", async (req, res) => {
    const { token } = req.params;

    if (!token) {
      res.end(`<h1>Something Went Wrong! Please Try Again`);
      return;
    }

    // auth successful
    await TokenManager.setToken(token);
    res.end(`<h1>Authentication Successful</h1>`);
    fn?.();
    app.server?.close();
  });
};
