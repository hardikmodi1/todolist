<script lang="ts">
  import { onMount } from "svelte";
  import { overrideItemIdKeyNameBeforeInitialisingDndZones } from "svelte-dnd-action";
  overrideItemIdKeyNameBeforeInitialisingDndZones("_id");

  import type { TodoList } from "../types";

  import AddButton from "./AddButton.svelte";
  import List from "./TodoList.svelte";
  import TodoListHeader from "./TodoListHeader.svelte";

  let boardId: string;
  let boardName: string;
  let accessToken: string;
  let todoListsByIds: { [key: string]: TodoList } = {};
  let todoListsIds: string[] = [];

  onMount(async () => {
    tsvscode.postMessage({ type: "get-token", value: undefined });
    tsvscode.postMessage({
      type: "get-board-id",
      value: undefined,
    });
    window.addEventListener("message", async (event) => {
      const message = event.data;
      switch (message.type) {
        case "token":
          accessToken = message.value;
          break;
        case "board-id": {
          boardId = message.value;
          console.log(boardId, "BoardId");
          const todoListsResponse = await fetch(
            `${apiBaseUrl}/todo-list/${boardId}`,
            {
              headers: {
                authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const response = await todoListsResponse.json();
          if (response.success) {
            if (!response.board) {
              tsvscode.postMessage({
                type: "set-board-id",
                value: undefined,
              });
            } else {
              boardName = response.board.name;
              if (!boardId) {
                boardId = response.board._id;
              }
              todoListsByIds = (response.todoLists ?? []).reduce(
                (acc: { [key: string]: TodoList }, todoList: TodoList) => {
                  acc[todoList._id] = todoList;
                  return acc;
                },
                {}
              );
              todoListsIds = response.todoListsIds;
            }
          } else {
            tsvscode.postMessage({
              type: "on-error",
              value: `Error occured while fetching the board 😢`,
            });
          }
          break;
        }
        case "delete-todolist": {
          const deletetodoListResponse = await fetch(
            `${apiBaseUrl}/todo-list`,
            {
              method: "DELETE",
              body: JSON.stringify({
                boardId,
                id: message.value.id,
              }),
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const { success } = await deletetodoListResponse.json();
          if (success) {
            const indexToDelete = todoListsIds.indexOf(message.value.id);

            if (indexToDelete !== undefined && indexToDelete > -1) {
              todoListsIds.splice(indexToDelete, 1);
              delete todoListsByIds[message.value.id];
              todoListsIds = todoListsIds;
            }
          } else {
            tsvscode.postMessage({
              type: "on-error",
              value: `Error occured while deleting the todolist 😢`,
            });
          }
          break;
        }
        case "delete-todo": {
          const deleteTodoResponse = await fetch(
            `${apiBaseUrl}/todo-list/todo`,
            {
              method: "DELETE",
              body: JSON.stringify({
                todoListId: message.value.todoListId,
                todoId: message.value._id,
              }),
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const { success } = await deleteTodoResponse.json();
          if (success) {
            const todoIndex = todoListsByIds[
              message.value.todoListId
            ].todos.findIndex((todo) => todo._id == message.value._id);
            todoListsByIds[message.value.todoListId].todos.splice(todoIndex, 1);
            todoListsByIds[message.value.todoListId].todos =
              todoListsByIds[message.value.todoListId].todos;
          }
          break;
        }
      }
    });
  });

  const handleAddTodoList = async (value: string) => {
    const todoListResponse = await fetch(`${apiBaseUrl}/todo-list`, {
      method: "POST",
      body: JSON.stringify({
        title: value,
        boardId,
      }),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });
    const { success, todoList } = await todoListResponse.json();
    if (success) {
      todoListsByIds = {
        ...todoListsByIds,
        [todoList._id]: todoList,
      };
      todoListsIds = [...todoListsIds, todoList._id];
    } else {
      tsvscode.postMessage({
        type: "on-error",
        value: `Error occured in saving the todolist 😢`,
      });
    }
  };

  const onChangeTitle = async (e: any) => {
    const todoListResponse = await fetch(`${apiBaseUrl}/todo-list`, {
      method: "PUT",
      body: JSON.stringify({
        title: e.detail.title,
        _id: e.detail.id,
      }),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });
    const { success, todoList } = await todoListResponse.json();
    if (success) {
      todoListsByIds = {
        ...todoListsByIds,
        [todoList._id]: todoList,
      };
    } else {
      tsvscode.postMessage({
        type: "on-error",
        value: `Error occured while saving the title of todolist 😢`,
      });
    }
  };

  const onDeleteTodoList = (e: any) => {
    tsvscode.postMessage({
      type: "on-delete-todolist-confirmation",
      value: {
        confirmationMessage: `Are you sure you want to delete the todolist '${e.detail.title}'?`,
        ...e.detail,
      },
    });
  };

  const handleAddTodo = async (todoListId: string, todo: string) => {
    const todoListResponse = await fetch(`${apiBaseUrl}/todo-list/todo`, {
      method: "POST",
      body: JSON.stringify({
        id: todoListId,
        todo,
      }),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });
    const { success, todo: newTodo } = await todoListResponse.json();
    if (success) {
      todoListsByIds[todoListId].todos = [
        ...todoListsByIds[todoListId].todos,
        newTodo,
      ];
    } else {
      tsvscode.postMessage({
        type: "on-error",
        value: `Error occured in adding the new todo 😢`,
      });
    }
  };

  const handleUpdateTodo = async (e: any, todoListId: string) => {
    const newTodoResponse = await fetch(`${apiBaseUrl}/todo-list/todo`, {
      method: "PUT",
      body: JSON.stringify({
        todoListId: todoListId,
        todoId: e.detail.id,
        todo: e.detail.todo,
      }),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });
    const { success, todo } = await newTodoResponse.json();
    if (success) {
      const todoIndex = todoListsByIds[todoListId].todos.findIndex(
        (todo) => todo._id == e.detail.id
      );
      todoListsByIds[todoListId].todos[todoIndex] = {
        ...todoListsByIds[todoListId].todos[todoIndex],
        todo,
      };
    } else {
      tsvscode.postMessage({
        type: "on-error",
        value: `Error occured while updating the todo 😢`,
      });
    }
  };

  const handleDeleteTodo = async (e: any, todoListId: string) => {
    tsvscode.postMessage({
      type: "on-delete-todo-confirmation",
      value: {
        confirmationMessage: "Are you sure you want to delete the todo?",
        ...e.detail,
        todoListId,
      },
    });
  };

  const handleReorderTodo = async (e: any, todoListId: string) => {
    const reorderTodoResponse = await fetch(
      `${apiBaseUrl}/todo-list/todo/reorder`,
      {
        method: "PUT",
        body: JSON.stringify({
          todoListId: todoListId,
          todos: e.detail.items,
        }),
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const { success, todos } = await reorderTodoResponse.json();
    if (success) {
      todoListsByIds[todoListId].todos = todos;
    } else {
      tsvscode.postMessage({
        type: "on-error",
        value: `Error occured in reordering the todo 😢`,
      });
    }
  };
</script>

{#if !accessToken}
  <h1>Please sign in to continue</h1>
{:else if !boardId}
  <h1>No Board Found</h1>
{:else}
  <h2>Board: {boardName}</h2>
  <div class="flex mt-4">
    <div class="flex">
      {#each todoListsIds as todoListId}
        <div
          class="todoListContainer border-1 border-panel border-solid rounded-8 mr-4 h-full"
        >
          <div>
            <TodoListHeader
              on:deleteTodoList={onDeleteTodoList}
              on:changeTitle={onChangeTitle}
              title={todoListsByIds[todoListId].title}
              id={todoListsByIds[todoListId]._id}
            />

            <div class="p-4">
              <List
                items={todoListsByIds[todoListId].todos}
                listItemClass="mb-4"
                todoListId={todoListsByIds[todoListId]._id}
                on:updateTodo={(e) => handleUpdateTodo(e, todoListId)}
                on:deleteTodo={(e) => handleDeleteTodo(e, todoListId)}
                on:finalize={(e) => handleReorderTodo(e, todoListId)}
              />

              <AddButton
                buttonLabel="Add Todo"
                inputPlaceholder="Enter Todo"
                onKeyDown={(todo) =>
                  handleAddTodo(todoListsByIds[todoListId]._id, todo)}
              />
            </div>
          </div>
        </div>
      {/each}
    </div>
    <div>
      <AddButton
        buttonLabel="Add TodoList"
        inputPlaceholder="Todo List"
        onKeyDown={handleAddTodoList}
      />
    </div>
  </div>
{/if}

<style>
  button {
    min-width: 106px;
  }
  .todoListContainer {
    color: var(--vscode-editor-foreground);
    width: 300px;
    height: max-content;
  }

  .todoListName {
    background: var(--vscode-minimapGutter-modifiedBackground);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
</style>
