<script lang="ts">
  export let onAction: (item: any, e: any) => void;
  export let close: () => void;
  export let actions: Array<{id: string; label: string}>=[]
</script>

<ul id="modal">
  {#each actions as item (item.id)}
    <li
      on:click={(e) => {
        onAction(item, e);
        close();
      }}
    >
      {item.label}
    </li>
  {/each}
</ul>

<style>
  ul {
    background-color: black;
    color: white;
    border-radius: 8px;
    list-style: none;
    padding: 10px 0px;
  }

  li {
    cursor: pointer;
    padding: 8px 16px;
  }
</style>
