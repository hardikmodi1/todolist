<script lang="ts">
  export let showInput: boolean = false
  export let value: string;
  export let placeholder: string;
  export let onSubmit: (value: string) => void;
  export let onReject: (value: string) => void;

  $: inputValue = value;
  let lastAction: string='allowed';

  const updateValue=()=>{
   if(!inputValue.trim()){
      onReject(inputValue);
      // inputValue=value;
    }
    else{
      onSubmit(inputValue.trim());
    }
  }
  
  const onKeyDown=(e: KeyboardEvent)=>{
    if (e.key === "Enter") {
      lastAction='Enter'
      console.log("keydown")
      updateValue()
    } else if (e.key === "Escape") {
      lastAction='Escape'
      console.log("Escape")
      onReject(inputValue);
      // inputValue=value;
    }
    else{
      lastAction='allowed'
    }
  }
  
  const onBlur=(e: FocusEvent)=>{
    // to prevent the call of updateValue twice when user presses enters
    if(lastAction==='allowed'){
      console.log("blur", e)
      updateValue();
    }
    lastAction='allowed'
  }
</script>

{#if showInput}
  <input
    bind:value={inputValue}
    placeholder={placeholder}
    on:keydown={onKeyDown}
    on:blur={onBlur}
    autofocus
  />
{/if}

<style>

</style>