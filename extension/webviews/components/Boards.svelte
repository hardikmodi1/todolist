<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import { flip } from "svelte/animate";

  import type { Board as BoardT } from "../types";
  import AddButton from "./AddButton.svelte";
  import Board from "./Board.svelte";

  export let boards: BoardT[] = [];
  let dispatch = createEventDispatcher();

  const onAddBoard = (name: string) => {
    dispatch("addBoard", { name });
  };

  const onDeleteBoard = (board: BoardT) => {
    dispatch("deleteBoard", board);
  };

  const onUpdateBoard = (board: BoardT) => {
    dispatch("updateBoard", board);
  };

  const onChangeBoard = (boardId: string) => {
    dispatch("changeBoard", { boardId });
  };
</script>

{#if boards.length === 0}
  <div class="mt-4">You don't have any board yet. Let's Begin</div>
{:else}
  {#each boards as board (board._id)}
    <div class="mt-4" in:slide out:slide animate:flip={{ duration: 400 }}>
      <Board
        {board}
        {onUpdateBoard}
        {onDeleteBoard}
        {onChangeBoard}
      />
    </div>
  {/each}
{/if}

<div class="mt-4">
  <AddButton
    buttonLabel="Add Board"
    inputPlaceholder="Enter Board Name"
    onKeyDown={onAddBoard}
  />
</div>
