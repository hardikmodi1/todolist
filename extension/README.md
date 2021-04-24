# TodoList for VSCode

VSCode extension to manage the todolist in a better way and bring todo one step closer to you directly in your dev area.
You can login with github, create boards, todolists and todos.

![Todolist Showcase](https://media.giphy.com/media/jaiqwN3Ny33U302gt6/giphy.gif)

## Features

Manage your tasks without leaving VSCode.
Create Boards, todolists, todos and drag and drop todos as you complete the tasks.

## Running Locally

1. Clone the repo.
2. Navigate to `api` folder, run `yarn` to install the dependancies.
3. Run `yarn watch` to put server in watch mode and in another terminal window run `yarn dev` to start the server.
4. Navigate to `extension` folder and run `yarn` to install the dependancies.
5. Run `yarn watch` to watch the changes in `extension` files.
6. Press `F5` key and select `VSCode extension development` from the dropdown, if that does not appear in your dropdown,
   open the `extension.ts` file and then `F5` again.

This will open up another VSCode window with our extension installed in it.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

**Enjoy!**
