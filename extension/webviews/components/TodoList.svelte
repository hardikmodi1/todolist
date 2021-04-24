<script lang="ts">
import { createEventDispatcher } from 'svelte';

  import {dndzone} from 'svelte-dnd-action';
	import {flip} from 'svelte/animate';
import Todo from './Todo.svelte';

const dispatch=createEventDispatcher()

	const flipDurationMs = 200;

  export let items: Array<{_id: string} & any> = [];
  export let listItemClass: string;
  export let todoListId: string;
  // export let ListItemRenderer: any;

  const handleSort = (e: any) => {
		items = e.detail.items;
	}

</script>


<section data-id={todoListId} use:dndzone={{items, flipDurationMs}} on:consider={handleSort} on:finalize>
	{#each items as item(item._id)}
		<div class={listItemClass} animate:flip={{duration:flipDurationMs}}>
     <Todo todo={item} on:updateTodo on:deleteTodo /> 
		</div>
	{/each}
</section>

<style>
	section{
		min-height: 40px;
	}
</style>