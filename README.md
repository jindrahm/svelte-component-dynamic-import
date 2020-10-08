# Svelte component - dynamic import bug

## Bug description
1. I have a main component dynamically imported and a child component imported statically
2. The child component is rendered in the main component's slot after a DOM change (e.g. loading)
3. The child component's onMount is not called at the beginning but right before onDestroy (BUG)

If the parent component is imported statically or the loading is omitted (the slot content doesn't change), it's OK.

All three case are demonstrated in the app.

## How to run the app
1. Download the repo ZIP and extract
2. npm install
3. npm run dev
4. The app runs on localhost:5000
5. See the JS console on devtools
