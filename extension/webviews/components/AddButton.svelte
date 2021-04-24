<script lang="ts">
  export let buttonLabel: string;
  export let inputPlaceholder: string;
  export let onKeyDown: (boardName: string)=>void;
  let value: string="";
  let showInput: boolean;
</script>

{#if showInput}
    <input 
      placeholder={inputPlaceholder}
      bind:value={value}
      on:keydown={(e)=>{
        if(e.key==="Enter"){
          if(value.trim()){
            onKeyDown(value.trim())
            value=""
            showInput =false;
          }
        }
      }}
      on:blur={()=>{
      showInput = false; 
      }}
      autofocus
    />

  {:else}
    <button on:click={()=>{
    showInput = true;
    }}>{buttonLabel}</button>
  {/if}