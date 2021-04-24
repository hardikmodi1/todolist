<script lang="ts">
</script>

<button class="card p-4 rounded-8 border-1 border-solid border-panel" on:click>
  <slot />
</button>

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
</style>
