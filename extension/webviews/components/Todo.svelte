<script lang="ts">
  import type { Todo } from "../types";
  import More from "../../media/more.svg";
  import { popover } from "../popover/popperAction";
  import { createEventDispatcher } from "svelte";
  import VisibilityControlledInput from "./VisibilityControlledInput.svelte";
  import MoreActions from "./MoreActions.svelte";

  export let todo: Todo;

  const dispatch = createEventDispatcher();
  let showInput: boolean = false;
  let actions = [
    {
      id: "edit",
      label: "Edit",
    },
    {
      id: "delete",
      label: "Delete",
    },
  ];

  const onAction = (item: any, e: any) => {
    console.log(item, "check here");
    switch (item.id) {
      case "delete":
        dispatch("deleteTodo", todo);
        break;
      case "edit":
      default:
        showInput = true;
        break;
    }
  };

  const onSubmit = (newTodo: string) => {
    showInput = false;
    dispatch("updateTodo", { todo: newTodo, id: todo._id });
  };
</script>

<div
  class="card p-4 rounded-8 border-1 border-solid border-panel flex items-center justify-between"
>
  <VisibilityControlledInput
    {onSubmit}
    onReject={(value) => {
      showInput = false;
    }}
    placeholder="Edit TodoList Title"
    value={todo.todo}
    {showInput}
  />
  {#if !showInput}
    <span class="text-lg text-left">{todo.todo}</span>
    <button
      class="icon-button"
      use:popover={{
        component: MoreActions,
        onAction,
        actions,
      }}
    >
      {@html More}
    </button>
  {/if}
</div>

<style>
  .card {
    cursor: pointer;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
  }
  .card:hover,
  .card:focus {
    background-color: var(--vscode-editor-selectionBackground);
  }
  button {
    flex: 0;
  }
</style>
