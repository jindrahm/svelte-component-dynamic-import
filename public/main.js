
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
}
function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else
        dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.wholeText === data)
        return;
    dispatch_dev("SvelteDOMSetData", { node: text, data });
    text.data = data;
}
function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
        if (!~keys.indexOf(slot_key)) {
            console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
        }
    }
}
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error(`'target' is a required option`);
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn(`Component was already destroyed`); // eslint-disable-line no-console
        };
    }
    $capture_state() { }
    $inject_state() { }
}

/* src/MainCompo.svelte generated by Svelte v3.29.0 */

const file = "src/MainCompo.svelte";

function add_css() {
	var style = element("style");
	style.id = "svelte-1j17b19-style";
	style.textContent = "div.svelte-1j17b19{border:1px solid grey;padding:20px;margin:20px 0}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbkNvbXBvLnN2ZWx0ZSIsInNvdXJjZXMiOlsiTWFpbkNvbXBvLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuXHRleHBvcnQgbGV0IG5hbWU7XG48L3NjcmlwdD5cblxuPGRpdj5cblx0PGgyPntuYW1lfTwvaDI+XG5cblx0PHNsb3QgbmFtZT1cInBhZ2UtY29udGVudFwiIC8+XG48L2Rpdj5cblxuPHN0eWxlPlxuXHRkaXYge1xuXHRcdGJvcmRlcjogMXB4IHNvbGlkIGdyZXk7XG5cdFx0cGFkZGluZzogMjBweDtcblx0XHRtYXJnaW46IDIwcHggMDtcblx0fVxuPC9zdHlsZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBV0MsR0FBRyxlQUFDLENBQUMsQUFDSixNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQ3RCLE9BQU8sQ0FBRSxJQUFJLENBQ2IsTUFBTSxDQUFFLElBQUksQ0FBQyxDQUFDLEFBQ2YsQ0FBQyJ9 */";
	append_dev(document.head, style);
}

const get_page_content_slot_changes = dirty => ({});
const get_page_content_slot_context = ctx => ({});

function create_fragment(ctx) {
	let div;
	let h2;
	let t0;
	let t1;
	let current;
	const page_content_slot_template = /*#slots*/ ctx[2]["page-content"];
	const page_content_slot = create_slot(page_content_slot_template, ctx, /*$$scope*/ ctx[1], get_page_content_slot_context);

	const block = {
		c: function create() {
			div = element("div");
			h2 = element("h2");
			t0 = text(/*name*/ ctx[0]);
			t1 = space();
			if (page_content_slot) page_content_slot.c();
			add_location(h2, file, 5, 1, 45);
			attr_dev(div, "class", "svelte-1j17b19");
			add_location(div, file, 4, 0, 38);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, h2);
			append_dev(h2, t0);
			append_dev(div, t1);

			if (page_content_slot) {
				page_content_slot.m(div, null);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (!current || dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

			if (page_content_slot) {
				if (page_content_slot.p && dirty & /*$$scope*/ 2) {
					update_slot(page_content_slot, page_content_slot_template, ctx, /*$$scope*/ ctx[1], dirty, get_page_content_slot_changes, get_page_content_slot_context);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(page_content_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(page_content_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (page_content_slot) page_content_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("MainCompo", slots, ['page-content']);
	let { name } = $$props;
	const writable_props = ["name"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MainCompo> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("name" in $$props) $$invalidate(0, name = $$props.name);
		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({ name });

	$$self.$inject_state = $$props => {
		if ("name" in $$props) $$invalidate(0, name = $$props.name);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [name, $$scope, slots];
}

class MainCompo extends SvelteComponentDev {
	constructor(options) {
		super(options);
		if (!document.getElementById("svelte-1j17b19-style")) add_css();
		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "MainCompo",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
			console.warn("<MainCompo> was created without expected prop 'name'");
		}
	}

	get name() {
		throw new Error("<MainCompo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<MainCompo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/ChildCompo.svelte generated by Svelte v3.29.0 */

const { console: console_1 } = globals;
const file$1 = "src/ChildCompo.svelte";

function create_fragment$1(ctx) {
	let h3;

	const block = {
		c: function create() {
			h3 = element("h3");
			h3.textContent = "Child compo";
			add_location(h3, file$1, 16, 0, 294);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h3, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(h3);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("ChildCompo", slots, []);
	let { number } = $$props;
	console.log("ChildCompo " + number + ": created");

	onMount(() => {
		console.log("ChildCompo " + number + ": mounted");
	});

	onDestroy(() => {
		console.log("ChildCompo " + number + ": destroyed");
	});

	const writable_props = ["number"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<ChildCompo> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("number" in $$props) $$invalidate(0, number = $$props.number);
	};

	$$self.$capture_state = () => ({ onMount, onDestroy, number });

	$$self.$inject_state = $$props => {
		if ("number" in $$props) $$invalidate(0, number = $$props.number);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [number];
}

class ChildCompo extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { number: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "ChildCompo",
			options,
			id: create_fragment$1.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*number*/ ctx[0] === undefined && !("number" in props)) {
			console_1.warn("<ChildCompo> was created without expected prop 'number'");
		}
	}

	get number() {
		throw new Error("<ChildCompo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set number(value) {
		throw new Error("<ChildCompo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/App.svelte generated by Svelte v3.29.0 */
const file$2 = "src/App.svelte";

// (22:2) {:else}
function create_else_block_1(ctx) {
	let childcompo;
	let current;
	childcompo = new ChildCompo({ props: { number: "1" }, $$inline: true });

	const block = {
		c: function create() {
			create_component(childcompo.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(childcompo, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(childcompo.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(childcompo.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(childcompo, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block_1.name,
		type: "else",
		source: "(22:2) {:else}",
		ctx
	});

	return block;
}

// (20:2) {#if loading}
function create_if_block_1(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Loading...");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(20:2) {#if loading}",
		ctx
	});

	return block;
}

// (19:1) <div slot="page-content">
function create_page_content_slot_2(ctx) {
	let div;
	let current_block_type_index;
	let if_block;
	let current;
	const if_block_creators = [create_if_block_1, create_else_block_1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*loading*/ ctx[0]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			div = element("div");
			if_block.c();
			attr_dev(div, "slot", "page-content");
			add_location(div, file$2, 18, 1, 527);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			if_blocks[current_block_type_index].m(div, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index !== previous_block_index) {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(div, null);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if_blocks[current_block_type_index].d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_page_content_slot_2.name,
		type: "slot",
		source: "(19:1) <div slot=\\\"page-content\\\">",
		ctx
	});

	return block;
}

// (29:1) <div slot="page-content">
function create_page_content_slot_1(ctx) {
	let div;
	let childcompo;
	let current;
	childcompo = new ChildCompo({ props: { number: "2" }, $$inline: true });

	const block = {
		c: function create() {
			div = element("div");
			create_component(childcompo.$$.fragment);
			attr_dev(div, "slot", "page-content");
			add_location(div, file$2, 28, 1, 745);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(childcompo, div, null);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(childcompo.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(childcompo.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(childcompo);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_page_content_slot_1.name,
		type: "slot",
		source: "(29:1) <div slot=\\\"page-content\\\">",
		ctx
	});

	return block;
}

// (38:2) {:else}
function create_else_block(ctx) {
	let childcompo;
	let current;
	childcompo = new ChildCompo({ props: { number: "3" }, $$inline: true });

	const block = {
		c: function create() {
			create_component(childcompo.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(childcompo, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(childcompo.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(childcompo.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(childcompo, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(38:2) {:else}",
		ctx
	});

	return block;
}

// (36:2) {#if loading}
function create_if_block(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Loading...");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(36:2) {#if loading}",
		ctx
	});

	return block;
}

// (35:1) <div slot="page-content">
function create_page_content_slot(ctx) {
	let div;
	let current_block_type_index;
	let if_block;
	let current;
	const if_block_creators = [create_if_block, create_else_block];
	const if_blocks = [];

	function select_block_type_1(ctx, dirty) {
		if (/*loading*/ ctx[0]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type_1(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			div = element("div");
			if_block.c();
			attr_dev(div, "slot", "page-content");
			add_location(div, file$2, 34, 1, 918);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			if_blocks[current_block_type_index].m(div, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type_1(ctx);

			if (current_block_type_index !== previous_block_index) {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(div, null);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if_blocks[current_block_type_index].d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_page_content_slot.name,
		type: "slot",
		source: "(35:1) <div slot=\\\"page-content\\\">",
		ctx
	});

	return block;
}

function create_fragment$2(ctx) {
	let h1;
	let t1;
	let maincompo;
	let t2;
	let switch_instance0;
	let t3;
	let switch_instance1;
	let switch_instance1_anchor;
	let current;

	maincompo = new MainCompo({
			props: {
				name: "MainCompo: static import, no slot change",
				$$slots: {
					"page-content": [create_page_content_slot_2]
				},
				$$scope: { ctx }
			},
			$$inline: true
		});

	var switch_value = /*MainCompoDynamic*/ ctx[1];

	function switch_props(ctx) {
		return {
			props: {
				name: "MainCompo: dynamic import, no slot change",
				$$slots: {
					"page-content": [create_page_content_slot_1]
				},
				$$scope: { ctx }
			},
			$$inline: true
		};
	}

	if (switch_value) {
		switch_instance0 = new switch_value(switch_props(ctx));
	}

	var switch_value_1 = /*MainCompoDynamic*/ ctx[1];

	function switch_props_1(ctx) {
		return {
			props: {
				name: "MainCompo: dynamic import, slot change",
				$$slots: {
					"page-content": [create_page_content_slot]
				},
				$$scope: { ctx }
			},
			$$inline: true
		};
	}

	if (switch_value_1) {
		switch_instance1 = new switch_value_1(switch_props_1(ctx));
	}

	const block = {
		c: function create() {
			h1 = element("h1");
			h1.textContent = "Svelte components - dynamic import bug";
			t1 = space();
			create_component(maincompo.$$.fragment);
			t2 = space();
			if (switch_instance0) create_component(switch_instance0.$$.fragment);
			t3 = space();
			if (switch_instance1) create_component(switch_instance1.$$.fragment);
			switch_instance1_anchor = empty();
			add_location(h1, file$2, 15, 0, 417);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h1, anchor);
			insert_dev(target, t1, anchor);
			mount_component(maincompo, target, anchor);
			insert_dev(target, t2, anchor);

			if (switch_instance0) {
				mount_component(switch_instance0, target, anchor);
			}

			insert_dev(target, t3, anchor);

			if (switch_instance1) {
				mount_component(switch_instance1, target, anchor);
			}

			insert_dev(target, switch_instance1_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const maincompo_changes = {};

			if (dirty & /*$$scope, loading*/ 9) {
				maincompo_changes.$$scope = { dirty, ctx };
			}

			maincompo.$set(maincompo_changes);
			const switch_instance0_changes = {};

			if (dirty & /*$$scope*/ 8) {
				switch_instance0_changes.$$scope = { dirty, ctx };
			}

			if (switch_value !== (switch_value = /*MainCompoDynamic*/ ctx[1])) {
				if (switch_instance0) {
					group_outros();
					const old_component = switch_instance0;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance0 = new switch_value(switch_props(ctx));
					create_component(switch_instance0.$$.fragment);
					transition_in(switch_instance0.$$.fragment, 1);
					mount_component(switch_instance0, t3.parentNode, t3);
				} else {
					switch_instance0 = null;
				}
			} else if (switch_value) {
				switch_instance0.$set(switch_instance0_changes);
			}

			const switch_instance1_changes = {};

			if (dirty & /*$$scope, loading*/ 9) {
				switch_instance1_changes.$$scope = { dirty, ctx };
			}

			if (switch_value_1 !== (switch_value_1 = /*MainCompoDynamic*/ ctx[1])) {
				if (switch_instance1) {
					group_outros();
					const old_component = switch_instance1;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value_1) {
					switch_instance1 = new switch_value_1(switch_props_1(ctx));
					create_component(switch_instance1.$$.fragment);
					transition_in(switch_instance1.$$.fragment, 1);
					mount_component(switch_instance1, switch_instance1_anchor.parentNode, switch_instance1_anchor);
				} else {
					switch_instance1 = null;
				}
			} else if (switch_value_1) {
				switch_instance1.$set(switch_instance1_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(maincompo.$$.fragment, local);
			if (switch_instance0) transition_in(switch_instance0.$$.fragment, local);
			if (switch_instance1) transition_in(switch_instance1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(maincompo.$$.fragment, local);
			if (switch_instance0) transition_out(switch_instance0.$$.fragment, local);
			if (switch_instance1) transition_out(switch_instance1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h1);
			if (detaching) detach_dev(t1);
			destroy_component(maincompo, detaching);
			if (detaching) detach_dev(t2);
			if (switch_instance0) destroy_component(switch_instance0, detaching);
			if (detaching) detach_dev(t3);
			if (detaching) detach_dev(switch_instance1_anchor);
			if (switch_instance1) destroy_component(switch_instance1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("App", slots, []);
	let loading = true;
	let MainCompoDynamic;
	const mainCompoDynamicPromise = import('http://localhost:5000/MainCompo.js').then(module => $$invalidate(1, MainCompoDynamic = module.default));
	setTimeout(() => $$invalidate(0, loading = false), 3000);
	setTimeout(() => $$invalidate(0, loading = true), 6000);
	setTimeout(() => $$invalidate(0, loading = false), 9000);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({
		MainCompo,
		ChildCompo,
		loading,
		MainCompoDynamic,
		mainCompoDynamicPromise
	});

	$$self.$inject_state = $$props => {
		if ("loading" in $$props) $$invalidate(0, loading = $$props.loading);
		if ("MainCompoDynamic" in $$props) $$invalidate(1, MainCompoDynamic = $$props.MainCompoDynamic);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [loading, MainCompoDynamic];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment$2.name
		});
	}
}

new App({
	target: document.body
});
