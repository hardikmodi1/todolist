import * as vscode from "vscode";
import { auth } from "./auth";
import { BoardManager } from "./BoardManager";
import { API_BASE_URL } from "./constants";
import { TodoListsPanel } from "./TodoListsPanel";
import { TokenManager } from "./TokenManager";
import { getNonce } from "./utils/getNonce";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      console.log(data);
      switch (data.type) {
        case "authenticate": {
          auth(() =>
            webviewView.webview.postMessage({
              type: "token",
              value: TokenManager.getToken(),
            })
          );
          break;
        }
        case "logout": {
          await TokenManager.setToken("");
          await BoardManager.setBoardId(undefined);
          TodoListsPanel.kill();
          break;
        }
        case "get-token": {
          webviewView.webview.postMessage({
            type: "token",
            value: TokenManager.getToken(),
          });
          break;
        }
        case "on-change-board": {
          await BoardManager.setBoardId(data.value.boardId);
          TodoListsPanel.createOrShow(this._extensionUri);
          break;
        }
        case "on-delete-confirmation": {
          const confirmation = await vscode.window.showInformationMessage(
            data.value.confirmationMessage,
            {
              modal: true,
            },
            "Yes",
            "No"
          );
          if (confirmation === "Yes") {
            webviewView.webview.postMessage({
              type: "delete-board",
              value: data.value,
            });
          }
          break;
        }
        case "on-board-delete": {
          const openedBoardId = BoardManager.getBoardId();
          if (openedBoardId === data.value.boardId) {
            await BoardManager.setBoardId(undefined);
            TodoListsPanel.kill();
          }
          break;
        }
        case "on-info": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "on-error": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const utilityStylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "utility.css")
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${
          webview.cspSource
        }; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <link href="${utilityStylesUri}" rel="stylesheet">
        <script nonce="${nonce}">
          const tsvscode=acquireVsCodeApi();
          const apiBaseUrl=${JSON.stringify(API_BASE_URL)}
        </script>
			</head>
      <body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
