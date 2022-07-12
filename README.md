# Svelte component - dynamic import bug [SOLVED]
## Bug description
1. I have a main component dynamically imported and a child component imported statically
2. The child component is rendered in the main component's slot after a DOM change (e.g. loading)
3. The child component's onMount is not called at the beginning but right before onDestroy (BUG)

If the parent component is imported statically or the loading is omitted (the slot content doesn't change), it's OK.

All three case are demonstrated in the app.

## Solution
Build `svelte/internal` as a separate module `svelteInternal.js` and handle `svelte` and `svelte/internal` as external and point it to `svelteInternal.js`.

That causes that the internal svelte logic is at one place and shared for all the components.

## How to run the app
1. Download the repo ZIP and extract
2. npm install
3. npm run dev
4. The app runs on localhost:12345
5. See the JS console in devtools
