<script>
	import MainCompo from './MainCompo.svelte';
	import ChildCompo from './ChildCompo.svelte';
	
	let loading = true;
	let MainCompoDynamic;

	const mainCompoDynamicPromise = import('http://localhost:5000/MainCompo.js')
		.then(module => MainCompoDynamic = module.default);

	setTimeout(() => loading = false, 3000);
	setTimeout(() => loading = true, 6000);
	setTimeout(() => loading = false, 9000);
</script>

<h1>Svelte components - dynamic import bug</h1>

<MainCompo name="MainCompo: static import, no slot change">
	<div slot="page-content">
		{#if loading}
			Loading...
		{:else}
			<ChildCompo number="1" />
		{/if}
	</div>
</MainCompo>

<svelte:component this={MainCompoDynamic} name="MainCompo: dynamic import, no slot change">
	<div slot="page-content">
		<ChildCompo number="2" />
	</div>
</svelte:component>

<svelte:component this={MainCompoDynamic} name="MainCompo: dynamic import, slot change">
	<div slot="page-content">
		{#if loading}
			Loading...
		{:else}
			<ChildCompo number="3" />
		{/if}
	</div>
</svelte:component>