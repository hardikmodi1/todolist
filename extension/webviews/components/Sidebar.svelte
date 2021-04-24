<script lang="ts">
  import { onMount } from "svelte";
  import type { User } from "../types";
  import Boards from "./Boards.svelte";

  let loading = true;
  let user: User | null = null;
  let accessToken = "";

  onMount(async () => {
    window.addEventListener("message", async (event) => {
      const message = event.data;
      switch (message.type) {
        case "token":
          accessToken = message.value;
          const response = await fetch(`${apiBaseUrl}/me`, {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          });
          const data = await response.json();
          user = data.user;
          loading = false;
          break;
        case "delete-board":
          const deleteResponse = await fetch(`${apiBaseUrl}/board`, {
            method: "DELETE",
            body: JSON.stringify({
              id: message.value._id,
            }),
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${accessToken}`,
            },
          });
          const { success } = await deleteResponse.json();
          if (success && user) {
            user.boards = user.boards.filter(
              ({ _id }) => _id !== message.value._id
            );
            tsvscode.postMessage({
              type: "on-info",
              value: `Board '${message.value.name}' Deleted Successfully!`,
            });
            tsvscode.postMessage({
              type: "on-board-delete",
              value: {
                boardId: message.value._id,
              },
            });
          } else {
            tsvscode.postMessage({
              type: "on-error",
              value: `Error occured while deleting the board 😢`,
            });
          }
          break;
      }
    });

    tsvscode.postMessage({ type: "get-token", value: undefined });
  });

  const onAddBoard = async (e: any) => {
    const response = await fetch(`${apiBaseUrl}/board`, {
      method: "POST",
      body: JSON.stringify({
        name: e.detail.name,
      }),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });
    const { board } = await response.json();

    if (user) {
      user.boards = [...user.boards, board];
    }
  };

  const onDeleteBoard = async (e: any) => {
    tsvscode.postMessage({
      type: "on-delete-confirmation",
      value: {
        confirmationMessage: "Are you sure?",
        ...e.detail,
      },
    });
  };

  const onUpdateBoard = async (e: any) => {
    const response = await fetch(`${apiBaseUrl}/board`, {
      method: "PUT",
      body: JSON.stringify(e.detail),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });
    const { success, board: updatedBoard } = await response.json();
    if (success && user) {
      user.boards = user.boards.map((board) => {
        if (board._id === e.detail._id) {
          return updatedBoard;
        }
        return board;
      });
    } else {
      tsvscode.postMessage({
        type: "on-error",
        value: `Error occured while updating the board 😢`,
      });
    }
  };

  const onChangeBoard = async (e: any) => {
    tsvscode.postMessage({
      type: "on-change-board",
      value: {
        boardId: e.detail.boardId,
      },
    });
  };
</script>

{#if loading}
  <div>Loading...</div>
{:else if user}
  <h2>Hello, {user.name}</h2>

  <Boards
    boards={user.boards}
    on:addBoard={onAddBoard}
    on:deleteBoard={onDeleteBoard}
    on:updateBoard={onUpdateBoard}
    on:changeBoard={onChangeBoard}
  />

  <button
    on:click={() => {
      accessToken = "";
      user = null;
      tsvscode.postMessage({ type: "logout", value: undefined });
    }}
    class="secondary mt-4">Logout</button
  >
{:else}
  <button
    on:click={() => {
      tsvscode.postMessage({ type: "authenticate", value: undefined });
    }}>Login With Github</button
  >
{/if}
