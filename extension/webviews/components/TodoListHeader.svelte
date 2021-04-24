<script lang="ts">
  import { createEventDispatcher } from "svelte";
import More from "../../media/more.svg"
import { popover } from "../popover/popperAction";
import MoreActions from "./MoreActions.svelte";
import VisibilityControlledInput from "./VisibilityControlledInput.svelte";

  export let title: string
  export let id: string;

  const dispatch=createEventDispatcher();
  let showInput: boolean=false;
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
    switch (item.id) {
      case "delete":
        dispatch('deleteTodoList', {id, title}) 
        break;
      case "edit":
      default:
        showInput = true;
        break;
    }
  };

</script>


<div class="p-4 flex items-center justify-between todoListName">
  <VisibilityControlledInput onSubmit={(title)=>{
    showInput=false;
    dispatch('changeTitle',{title, id})
  }} onReject={(value)=>{
    showInput=false;
  }} placeholder="Edit TodoList Title" value={title} {showInput} />
  {#if !showInput}
    <span class="text-lg text-left">{title}</span>
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
  button{
    flex: 0;
  }
  .todoListName {
    background: var(--vscode-minimapGutter-modifiedBackground);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
</style>