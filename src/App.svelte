<script>
	import MainCompo from './MainCompo.svelte';
	import ChildCompo from './ChildCompo.svelte';
	
	const startTime = Date.now();
	let loading = true;
	let MainCompoDynamic;

	const mainCompoDynamicPromise = import('http://localhost:5000/build/MainCompo.js')
		.then(module => MainCompoDynamic = module.default);

	setTimeout(() => loading = false, 3000);
	setTimeout(() => loading = true, 6000);
	setTimeout(() => loading = false, 9000);
</script>

<h1>Svelte components - dynamic import bug</h1>

<MainCompo name="MainCompo: static import, slot change => OK">
	<div slot="page-content">
		{#if loading}
			Loading...
		{:else}
			<ChildCompo number="1" {startTime} />
		{/if}
	</div>
</MainCompo>

<svelte:component this={MainCompoDynamic} name="MainCompo: dynamic import, no slot change => OK">
	<div slot="page-content">
		<ChildCompo number="2" {startTime} />
	</div>
</svelte:component>

<svelte:component this={MainCompoDynamic} name="MainCompo: dynamic import, slot change => BUG">
	<div slot="page-content">
		{#if loading}
			Loading...
		{:else}
			<ChildCompo number="3" {startTime} />
		{/if}
	</div>
</svelte:component>
