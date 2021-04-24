<script lang="ts">
  import { popover } from "../popover/popperAction";

  import type { Board } from "../types";
  import MoreActions from "./MoreActions.svelte";
  import More from "../../media/more.svg";

  import Card from "./Card.svelte";

  export let board: Board;
  export let onUpdateBoard: (board: Board) => void;
  export let onDeleteBoard: (board: Board) => void;
  export let onChangeBoard: (boardId: string) => void;

  let value = board.name;
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

  const updateName = () => {
    if (!value.trim()) {
      value = board.name;
    } else {
      onUpdateBoard({
        ...board,
        name: value.trim(),
      });
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      updateName();
      showInput = false;
    } else if (e.key === "Escape") {
      value = board.name;
      showInput = false;
    }
  };

  const onBlur = (e: FocusEvent) => {
    updateName();
    showInput = false;
  };

  const onAction = (item: any, e: any) => {
    switch (item.id) {
      case "delete":
        onDeleteBoard(board);
        break;
      case "edit":
      default:
        showInput = true;
        break;
    }
  };
</script>

<Card on:click={()=>{
  if(!showInput){
    onChangeBoard(board._id)
  }
}}>
  {#if showInput}
    <input
      bind:value
      placeholder="Edit Board Name"
      on:keydown={onKeyDown}
      on:blur={onBlur}
      autofocus
    />
  {:else}
    <div class="flex items-center justify-between">
      <span class="text-lg text-left">{board.name}</span>
      <button
        class="icon-button"
        use:popover={{
          component: MoreActions,
          onAction,
          actions
        }}
      >
        {@html More}
      </button>
    </div>
  {/if}
</Card>

<style>
  input {
    border-color: transparent;
  }
  .icon-button {
    height: 32px;
    width: 32px;
    border-radius: 50%;
    background-color: inherit;
  }
  .icon-button:focus {
    background-color: var(--vscode-editor-selectionBackground);
  }
</style>
