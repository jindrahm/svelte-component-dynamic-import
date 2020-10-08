<script>
	export let name;
</script>

<div>
	<h2>{name}</h2>

	<slot name="page-content" />
</div>

<style>
	div {
		border: 1px solid grey;
		padding: 20px;
		margin: 20px 0;
	}
</style>