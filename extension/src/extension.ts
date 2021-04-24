import * as vscode from "vscode";
import { auth } from "./auth";
import { BoardManager } from "./BoardManager";
import { TodoListsPanel } from "./TodoListsPanel";
import { SidebarProvider } from "./SidebarProvider";
import { TokenManager } from "./TokenManager";

export function activate(context: vscode.ExtensionContext) {
  TokenManager.gloablState = context.globalState;
  BoardManager.gloablState = context.globalState;

  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "todolist-sidebar",
      sidebarProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("todolist.openTodoLists", () => {
      TodoListsPanel.createOrShow(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("todolist.authenticate", () => {
      auth();
    })
  );
  // context.subscriptions.push(
  //   vscode.commands.registerCommand("todolist.refresh", async () => {
  //     TodoListsPanel.kill();
  //     TodoListsPanel.createOrShow(context.extensionUri);
  //     // await vscode.commands.executeCommand("workbench.action.closeSidebar");
  //     // await vscode.commands.executeCommand(
  //     //   "workbench.view.extension.todolist-sidebar-view"
  //     // );
  //     setTimeout(() => {
  //       vscode.commands.executeCommand(
  //         "workbench.action.webview.openDeveloperTools"
  //       );
  //     }, 500);
  //   })
  // );
}

export function deactivate() {}
