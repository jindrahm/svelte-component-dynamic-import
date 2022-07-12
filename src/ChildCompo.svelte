<script>
	import {onMount, onDestroy} from 'svelte';

	export let number;
	export let startTime;

	function getLogTime() {
		return new Date(Date.now() - startTime).getSeconds();
	}

	console.log('ChildCompo ' + number + ': created after ' + getLogTime() + ' seconds');

	onMount(() => {
		console.log('ChildCompo ' + number + ': mounted after ' + getLogTime() + ' seconds');
	});

	onDestroy(() => {
		console.log('ChildCompo ' + number + ': destroyed after ' + getLogTime() + ' seconds');
	});
</script>

<h3>Child compo {number}</h3>