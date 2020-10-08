<script>
	import {onMount, onDestroy} from 'svelte';

	export let number;

	console.log('ChildCompo ' + number + ': created');

	onMount(() => {
		console.log('ChildCompo ' + number + ': mounted');
	});

	onDestroy(() => {
		console.log('ChildCompo ' + number + ': destroyed');
	});
</script>

<h3>Child compo</h3>