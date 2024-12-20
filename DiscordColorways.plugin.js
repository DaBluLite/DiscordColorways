/**
 * @name DiscordColorways
 * @author DaBluLite
 * @description A plugin that offers easy access to simple color schemes/themes for Discord, also known as Colorways
 * @version 7.0.0
 * @authorId 582170007505731594
 * @invite ZfPH6SDkMW
 */

/*@cc_on
@if (@_jscript)

	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const betterdiscord = new BdApi("DiscordColorways");
const React = BdApi.React;
const ReactDOM = BdApi.ReactDOM;

function Spinner({ className = "", style }) {
	return BdApi.React.createElement("div", { className: `colorwaysBtn-spinner ${className}`, role: "img", "aria-label": "Loading", style }, BdApi.React.createElement("div", { className: "colorwaysBtn-spinnerInner" }, BdApi.React.createElement("svg", { className: "colorwaysBtn-spinnerCircular", viewBox: "25 25 50 50", fill: "currentColor" }, BdApi.React.createElement("circle", { className: "colorwaysBtn-spinnerBeam colorwaysBtn-spinnerBeam3", cx: "50", cy: "50", r: "20" }), BdApi.React.createElement("circle", { className: "colorwaysBtn-spinnerBeam colorwaysBtn-spinnerBeam2", cx: "50", cy: "50", r: "20" }), BdApi.React.createElement("circle", { className: "colorwaysBtn-spinnerBeam", cx: "50", cy: "50", r: "20" }))));
}

const Filters = {
	...betterdiscord.Webpack.Filters,
	byName: (name) => {
		return (target) => (target?.displayName ?? target?.constructor?.displayName) === name;
	},
	byKeys: (...keys) => {
		return (target) => target instanceof Object && keys.every((key) => key in target);
	},
	byProtos: (...protos) => {
		return (target) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
	},
	bySource: (...fragments) => {
		return (target) => {
			while (target instanceof Object && "$$typeof" in target) {
				target = target.render ?? target.type;
			}
			if (target instanceof Function) {
				const source = target.toString();
				const renderSource = target.prototype?.render?.toString();
				return fragments.every(
					(fragment) => typeof fragment === "string" ? source.includes(fragment) || renderSource?.includes(fragment) : fragment(source) || renderSource && fragment(renderSource)
				);
			} else {
				return false;
			}
		};
	},
	byCode: (...code) => (m) => {
		if (typeof m !== "function") return false;
		const s2 = Function.prototype.toString.call(m);
		for (const c of code) {
			if (!s2.includes(c)) return false;
		}
		return true;
	},
	componentByCode: (...code) => {
		const filter = Filters.byCode(...code);
		return (m) => {
			if (filter(m)) return true;
			if (!m.$$typeof) return false;
			if (m.type && m.type.render) return filter(m.type.render);
			if (m.type) return filter(m.type);
			if (m.render) return filter(m.render);
			return false;
		};
	}
};
const hasThrown = new WeakSet();
const wrapFilter = (filter) => (exports, module, moduleId) => {
	try {
		if (exports?.default?.remove && exports?.default?.set && exports?.default?.clear && exports?.default?.get && !exports?.default?.sort)
			return false;
		if (exports.remove && exports.set && exports.clear && exports.get && !exports.sort)
			return false;
		if (exports?.default?.getToken || exports?.default?.getEmail || exports?.default?.showToken)
			return false;
		if (exports.getToken || exports.getEmail || exports.showToken)
			return false;
		return filter(exports, module, moduleId);
	} catch (err) {
		if (!hasThrown.has(filter))
			console.warn(
				"WebpackModules~getModule",
				"Module filter threw an exception.",
				filter,
				err
			);
		hasThrown.add(filter);
		return false;
	}
};
const listeners = new Set();
function addListener(listener) {
	listeners.add(listener);
	return removeListener.bind(null, listener);
}
function removeListener(listener) {
	return listeners.delete(listener);
}
const Webpack = {
	...betterdiscord.Webpack,
	getLazy: (filter, options = {}) => {
		const {
			signal: abortSignal,
			defaultExport = true,
			searchExports = false
		} = options;
		const fromCache = Webpack.getModule(filter, {
			defaultExport,
			searchExports
		});
		if (fromCache) return Promise.resolve(fromCache);
		const wrappedFilter = wrapFilter(filter);
		return new Promise((resolve) => {
			const cancel = () => removeListener(listener);
			const listener = function(exports) {
				if (!exports || exports === window || exports === document.documentElement || exports[Symbol.toStringTag] === "DOMTokenList")
					return;
				let foundModule = null;
				if (typeof exports === "object" && searchExports && !exports.TypedArray) {
					for (const key in exports) {
						foundModule = null;
						const wrappedExport = exports[key];
						if (!wrappedExport) continue;
						if (wrappedFilter(wrappedExport)) foundModule = wrappedExport;
					}
				} else {
					if (exports.Z && wrappedFilter(exports.Z))
						foundModule = defaultExport ? exports.Z : exports;
					if (exports.ZP && wrappedFilter(exports.ZP))
						foundModule = defaultExport ? exports.ZP : exports;
					if (exports.__esModule && exports.default && wrappedFilter(exports.default))
						foundModule = defaultExport ? exports.default : exports;
					if (wrappedFilter(exports)) foundModule = exports;
				}
				if (!foundModule) return;
				cancel();
				resolve(foundModule);
			};
			addListener(listener);
			abortSignal?.addEventListener("abort", () => {
				cancel();
				resolve(null);
			});
		});
	}
};
const ReactDOMInternals = ReactDOM?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.Events ?? [];
const [
	getInstanceFromNode,
	getNodeFromInstance,
	getFiberCurrentPropsFromNode,
	enqueueStateRestore,
	restoreStateIfNeeded,
	batchedUpdates
] = ReactDOMInternals;
const FCHook = ({
	children: { type, props },
	callback
}) => {
	const result = type(props);
	return callback(result, props) ?? result;
};
const hookFunctionComponent = (target, callback) => {
	const props = {
		children: { ...target },
		callback
	};
	target.props = props;
	target.type = FCHook;
	return target;
};
const queryTree = (node, predicate) => {
	const worklist = [node].flat();
	while (worklist.length !== 0) {
		const node2 = worklist.shift();
		if (React.isValidElement(node2)) {
			if (predicate(node2)) {
				return node2;
			}
			const children = node2?.props?.children;
			if (children) {
				worklist.push(...[children].flat());
			}
		}
	}
	return null;
};
const getFiber = (node) => getInstanceFromNode(node ?? {});
const queryFiber = (fiber, predicate, direction = "up", depth = 30) => {
	if (depth < 0) {
		return null;
	}
	if (predicate(fiber)) {
		return fiber;
	}
	if (direction === "up" || direction === "both") {
		let count = 0;
		let parent = fiber.return;
		while (parent && count < depth) {
			if (predicate(parent)) {
				return parent;
			}
			count++;
			parent = parent.return;
		}
	}
	if (direction === "down" || direction === "both") {
		let child = fiber.child;
		while (child) {
			const result = queryFiber(child, predicate, "down", depth - 1);
			if (result) {
				return result;
			}
			child = child.sibling;
		}
	}
	return null;
};
const findOwner = (fiber, depth = 50) => {
	return queryFiber(
		fiber,
		(node) => node?.stateNode instanceof React.Component,
		"up",
		depth
	);
};
const ColorwayCSS$1 = {
	get: () => document.getElementById("activeColorwayCSS")?.textContent || "",
	set: (e) => {
		if (!document.getElementById("activeColorwayCSS")) {
			document.head.append(Object.assign(document.createElement("style"), {
				id: "activeColorwayCSS",
				textContent: e
			}));
		} else document.getElementById("activeColorwayCSS").textContent = e;
	},
	remove: () => document.getElementById("activeColorwayCSS")?.remove()
};
const unconfigurable = ["arguments", "caller", "prototype"];
const handler = {};
const kGET = Symbol.for("vencord.lazy.get");
const kCACHE = Symbol.for("vencord.lazy.cached");
for (const method of [
	"apply",
	"construct",
	"defineProperty",
	"deleteProperty",
	"getOwnPropertyDescriptor",
	"getPrototypeOf",
	"has",
	"isExtensible",
	"ownKeys",
	"preventExtensions",
	"set",
	"setPrototypeOf"
]) {
	handler[method] = (target, ...args) => Reflect[method](target[kGET](), ...args);
}
handler.ownKeys = (target) => {
	const v = target[kGET]();
	const keys = Reflect.ownKeys(v);
	for (const key of unconfigurable) {
		if (!keys.includes(key)) keys.push(key);
	}
	return keys;
};
handler.getOwnPropertyDescriptor = (target, p) => {
	if (typeof p === "string" && unconfigurable.includes(p))
		return Reflect.getOwnPropertyDescriptor(target, p);
	const descriptor = Reflect.getOwnPropertyDescriptor(target[kGET](), p);
	if (descriptor) Object.defineProperty(target, p, descriptor);
	return descriptor;
};
function proxyLazy(factory, attempts = 5, isChild = false) {
	let isSameTick = true;
	if (!isChild) setTimeout(() => isSameTick = false, 0);
	let tries = 0;
	const proxyDummy = Object.assign(function() {
	}, {
		[kCACHE]: void 0,
		[kGET]() {
			if (!proxyDummy[kCACHE] && attempts > tries++) {
				proxyDummy[kCACHE] = factory();
				if (!proxyDummy[kCACHE] && attempts === tries)
					console.error("Lazy factory failed:", factory);
			}
			return proxyDummy[kCACHE];
		}
	});
	return new Proxy(proxyDummy, {
		...handler,
		get(target, p, receiver) {
			if (!isChild && isSameTick)
				return proxyLazy(
					() => Reflect.get(target[kGET](), p, receiver),
					attempts,
					true
				);
			const lazyTarget = target[kGET]();
			if (typeof lazyTarget === "object" || typeof lazyTarget === "function") {
				return Reflect.get(lazyTarget, p, receiver);
			}
			throw new Error("proxyLazy called on a primitive value");
		}
	});
}
Webpack.getByKeys("radioBar");
const {
	useStateFromStores
} = proxyLazy(() => Webpack.getModule(Filters.byProps("useStateFromStores")));
exports.Forms = {};
let Card;
let Button;
let Switch$1;
let Tooltip$1;
let TextInput;
let TextArea;
let Text;
let Select;
let SearchableSelect;
let Slider;
let ButtonLooks;
exports.Popout = void 0;
let Dialog;
let TabBar$1;
let Paginator;
let ScrollerThin;
let Clickable;
let Avatar;
exports.FocusLock = void 0;
let useToken;
Webpack.getByKeys("open", "saveAccountChanges");
({ ...Webpack.getByKeys("MenuItem", "MenuSliderControl") });
Webpack.waitForModule(Filters.byKeys("FormItem", "Button")).then((m) => {
	({
		useToken,
		Card,
		Button,
		FormSwitch: Switch$1,
		Tooltip: Tooltip$1,
		TextInput,
		TextArea,
		Text,
		Select,
		SearchableSelect,
		Slider,
		ButtonLooks,
		TabBar: TabBar$1,
		Popout: exports.Popout,
		Dialog,
		Paginator,
		ScrollerThin,
		Clickable,
		Avatar,
		FocusLock: exports.FocusLock
	} = m);
	exports.Forms = m;
});
Webpack.waitForModule(Filters.byStrings("showEyeDropper")).then(
	(e) => e
);
exports.UserStore = void 0;
proxyLazy(
	() => Webpack.getByKeys("openUserProfileModal", "closeUserProfileModal")
);
proxyLazy(
	() => Webpack.getByKeys("getUser", "fetchCurrentUser")
);
proxyLazy(() => Webpack.getByKeys("ModalRoot", "ModalCloseButton"));
const Toasts = {
	show: Webpack.getByKeys("showToast")["showToast"],
	pop: Webpack.getByKeys("popToast")["popToast"],
	useToastStore: Webpack.getByKeys("useToastStore")["useToastStore"],
	create: Webpack.getByKeys("createToast")["createToast"]
};
const FluxDispatcher = Webpack.getModule(
	(m) => m.dispatch && m.subscribe
);
function waitForStore(storeName, callback) {
	Webpack.waitForModule(Filters.byStoreName(storeName)).then(
		(e) => callback(e)
	);
}
waitForStore("DraftStore", (s2) => s2);
waitForStore("UserStore", (s2) => exports.UserStore = s2);
waitForStore(
	"SelectedChannelStore",
	(s2) => s2
);
waitForStore(
	"SelectedGuildStore",
	(s2) => s2
);
waitForStore("UserProfileStore", (m) => m);
waitForStore(
	"ChannelStore",
	(m) => m
);
waitForStore("GuildStore", (m) => m);
waitForStore(
	"GuildMemberStore",
	(m) => m
);
waitForStore(
	"RelationshipStore",
	(m) => m
);
waitForStore("PermissionStore", (m) => m);
waitForStore("PresenceStore", (m) => m);
waitForStore("ReadStateStore", (m) => m);
waitForStore("GuildChannelStore", (m) => m);
waitForStore(
	"MessageStore",
	(m) => m
);
waitForStore("WindowStore", (m) => m);
waitForStore("EmojiStore", (m) => m);
Webpack.waitForModule(Filters.byKeys("SUPPORTS_COPY", "copy")).then(
	(e) => e
);
const ModalAPI = proxyLazy(() => Webpack.getByKeys("openModalLazy"));
function openModal(render, options, contextKey) {
	return ModalAPI.openModal(render, options, contextKey);
}
Webpack.waitForModule(Filters.byKeys("parseTopic")).then((m) => m);
proxyLazy(() => Webpack.getByKeys("PreloadedUserSettingsActionCreators"));
const ContextMenuApi = {
	closeContextMenu: betterdiscord.ContextMenu.close,
	openContextMenu: betterdiscord.ContextMenu.open
};
var r; Webpack.modules[192379]; Webpack.modules[610521]; Webpack.modules[442837]; Webpack.modules[607070];
null !== (r = document.getElementById("app-mount")) && void 0 !== r ? r : document;

const css$1 = "/* stylelint-disable property-no-vendor-prefix */\n/* stylelint-disable function-linear-gradient-no-nonstandard-direction */\n/* stylelint-disable color-function-notation */\n/* stylelint-disable alpha-value-notation */\n/* stylelint-disable value-no-vendor-prefix */\n/* stylelint-disable color-hex-length */\n/* stylelint-disable no-descending-specificity */\n/* stylelint-disable declaration-block-no-redundant-longhand-properties */\n/* stylelint-disable selector-id-pattern */\n/* stylelint-disable selector-class-pattern */\n@import url(\"https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css\");\n@import url(\"https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Edu+AU+VIC+WA+NT+Hand:wght@400..700&display=swap\");\n\n.ColorwaySelectorBtn {\n  	height: 48px;\n  	width: 48px;\n  	border-radius: 50px;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	transition: 0.15s ease-out;\n  	background-color: var(--background-primary);\n  	cursor: pointer;\n  	color: var(--text-normal);\n}\n\n.ColorwaySelectorBtn:hover {\n  	background-color: var(--brand-500);\n  	color: var(--white);\n  	border-radius: 16px;\n}\n\n.discordColorwayPreviewColorContainer {\n  	display: flex;\n  	flex-flow: wrap;\n  	flex-direction: row;\n  	overflow: hidden;\n  	border-radius: 50%;\n  	width: 56px;\n  	height: 56px;\n  	box-shadow: 0 0 0 1.5px var(--interactive-normal);\n  	box-sizing: border-box;\n  	flex-shrink: 0;\n}\n\n.discordColorwayPreviewColor {\n  	width: 50%;\n  	height: 50%;\n}\n\n.discordColorwayPreviewColorContainer:not(:has(> .discordColorwayPreviewColor:nth-child(2)))\n  	> .discordColorwayPreviewColor {\n  	height: 100%;\n  	width: 100%;\n}\n\n.discordColorwayPreviewColorContainer:not(:has(> .discordColorwayPreviewColor:nth-child(3)))\n  	> .discordColorwayPreviewColor {\n  	height: 100%;\n}\n\n.discordColorwayPreviewColorContainer:not(:has(> .discordColorwayPreviewColor:nth-child(4)))\n  	> .discordColorwayPreviewColor:nth-child(3) {\n  	width: 100%;\n}\n\n.colorways-selector {\n  	position: relative;\n  	display: grid;\n  	grid-template-columns: repeat(2, calc(50% - 4px));\n  	grid-auto-rows: max-content;\n  	gap: 8px;\n  	width: 100%;\n  	scrollbar-width: none !important;\n  	box-sizing: border-box;\n  	overflow: hidden auto;\n}\n\n.colorways-selector[data-layout=\"compact\"] {\n  	grid-template-columns: repeat(3, calc((100%/3) - 5.3333px));\n}\n\n.colorways-selector[data-layout=\"compact\"] > .discordColorway {\n  	padding: 4px 6px;\n  	min-height: 38px;\n}\n\n.colorways-selector[data-layout=\"compact\"] > .discordColorway .colorwayLabelSubnote {\n  	display: none;\n}\n\n.colorways-selector::-webkit-scrollbar {\n  	width: 0;\n}\n\n.colorwaySelectorModal,\n.colorwayModal {\n  	width: 90% !important;\n  	height: 90% !important;\n  	border-radius: 12px;\n  	border: 1px solid #2a2a2a;\n  	display: flex;\n  	flex-direction: row;\n  	background-color: #090909;\n  	margin: 0 auto;\n  	pointer-events: all;\n  	position: relative;\n  	animation: show-modal 0.2s ease-in-out;\n}\n\n.theme-light .colorwaySelectorModal,\n.theme-light .colorwayModal {\n  	background-color: #f5f5f5;\n  	border-color: #d6d6d6;\n}\n\n@keyframes reveal-modal {\n  	from {\n  			translate: 0 -20px;\n  	}\n\n  	to {\n  			translate: 0;\n  	}\n}\n\n@keyframes reveal-modal-backdrop {\n  	from {\n  			opacity: 0;\n  	}\n\n  	to {\n  			opacity: 0.75;\n  	}\n}\n\n.colorwaysModalBackdrop {\n  	background-color: #707070;\n  	opacity: 0.75;\n  	position: fixed;\n  	top: 0;\n  	left: 0;\n  	width: 100%;\n  	height: 100%;\n  	z-index: 1;\n  	transition: 0.4s ease;\n  	animation: reveal-modal-backdrop 0.4s ease;\n  	pointer-events: all;\n}\n\n.colorwayModal {\n  	flex-direction: column;\n}\n\n.colorwaySelectorModal.closing,\n.colorwayModal.closing,\n.colorwaysPreview-modal.closing,\n.colorwaysModal.closing {\n  	animation: close-modal 0.2s ease-in-out;\n  	transform: scale(0.5);\n  	opacity: 0;\n}\n\n.colorwaySelectorModal.hidden,\n.colorwayModal.hidden,\n.colorwaysPreview-modal.hidden,\n.colorwaysModal.hidden {\n  	animation: close-modal 0.2s ease-in-out;\n  	transform: scale(0.5);\n  	opacity: 0;\n}\n\n@keyframes show-modal {\n  	0% {\n  			transform: scale(0.7);\n  			opacity: 0;\n  	}\n\n  	75% {\n  			transform: scale(1.009);\n  			opacity: 1;\n  	}\n\n  	100% {\n  			transform: scale(1);\n  			opacity: 1;\n  	}\n}\n\n@keyframes close-modal {\n  	from {\n  			transform: scale(1);\n  			opacity: 1;\n  	}\n\n  	to {\n  			transform: scale(0.7);\n  			opacity: 0;\n  	}\n}\n\n.colorwaysSettingsDivider {\n  	width: 100%;\n  	height: 1px;\n  	border-top: thin solid #fff;\n  	margin-top: 20px;\n}\n\n.colorwaysSettings-switch {\n  	background-color: rgb(85 87 94);\n  	flex: 0 0 auto;\n  	position: relative;\n  	border-radius: 14px;\n  	width: 40px;\n  	height: 24px;\n  	cursor: pointer;\n  	transition: 0.15s ease;\n}\n\n.colorwaysSettings-switch.checked {\n  	background-color: #fff;\n}\n\n.colorwaySwitch-label {\n  	flex: 1;\n  	display: block;\n  	overflow: hidden;\n  	margin-top: 0;\n  	margin-bottom: 0;\n  	color: var(--header-primary);\n  	line-height: 24px;\n  	font-size: 16px;\n  	font-weight: 500;\n  	word-wrap: break-word;\n  	cursor: pointer;\n}\n\n.colorwaysNote {\n  	color: var(--header-secondary);\n  	font-size: 14px;\n  	line-height: 20px;\n  	font-weight: 400;\n  	margin-top: 8px;\n}\n\n.colorwayModal-selectorHeader {\n  	display: flex;\n  	width: 100%;\n  	box-sizing: border-box;\n  	flex-direction: column;\n  	gap: 8px;\n}\n\n.colorwayModalContent {\n  	display: flex;\n  	flex-direction: column;\n  	width: 100%;\n  	height: 100%;\n  	position: relative;\n  	overflow: hidden;\n  	border-radius: 0 4px 4px 0;\n}\n\n.colorwaySelectorSidebar-tab {\n  	font-family: var(--font-display);\n  	border-radius: 8px;\n  	cursor: pointer;\n  	transition: 0.2s ease;\n  	border: 1px solid transparent;\n  	display: flex;\n  	align-items: center;\n  	line-height: 24px;\n}\n\n.colorwaysPillButton {\n  	padding: 4px 12px;\n  	border-radius: 16px;\n  	background-color: transparent;\n  	transition: 0.2s ease;\n  	cursor: pointer;\n  	display: flex;\n  	gap: 0.5rem;\n  	justify-content: center;\n  	align-items: center;\n  	height: var(--custom-button-button-sm-height);\n  	min-width: var(--custom-button-button-sm-width);\n  	min-height: var(--custom-button-button-sm-height);\n  	box-sizing: border-box;\n}\n\n.colorwaysPillButton-outlined {\n  	transition: color var(--custom-button-transition-duration)ease,background-color var(--custom-button-transition-duration)ease,border-color var(--custom-button-transition-duration)ease !important;\n  	border-width: 1px !important;\n  	border-style: solid !important;\n}\n\n.colorwaysPillButton:not(.colorwaysPillButton-outlined).colorwaysPillButton-primary {\n  	color: #fff;\n  	background-color: #101010;\n}\n\n.theme-light .colorwaysPillButton:not(.colorwaysPillButton-outlined).colorwaysPillButton-primary {\n  	color: #000;\n  	background-color: #f0f0f0;\n}\n\n.colorwaysPillButton:not(.colorwaysPillButton-outlined).colorwaysPillButton-secondary {\n  	color: #fff;\n  	background-color: #1a1a1a;\n}\n\n.theme-light.colorwaysPillButton:not(.colorwaysPillButton-outlined).colorwaysPillButton-secondary {\n  	color: #000;\n  	background-color: #e6e6e6;\n}\n\n.colorwaysPillButton:not(.colorwaysPillButton-outlined).colorwaysPillButton-danger {\n  	color: #fff;\n  	background-color: #e80808;\n}\n\n.colorwaysPillButton:not(.colorwaysPillButton-outlined).colorwaysPillButton-brand {\n  	color: #000;\n  	background-color: #fff;\n}\n\n.colorwaysPillButton.colorwaysPillButton-outlined.colorwaysPillButton-primary {\n  	color: #fff;\n  	border-color: #101010;\n}\n\n.colorwaysPillButton.colorwaysPillButton-outlined.colorwaysPillButton-secondary {\n  	color: #fff;\n  	border-color: #1a1a1a;\n}\n\n.colorwaysPillButton.colorwaysPillButton-outlined.colorwaysPillButton-danger {\n  	color: #fff;\n  	border-color: #e80808;\n}\n\n.colorwaysPillButton.colorwaysPillButton-outlined.colorwaysPillButton-brand {\n  	color: #fff;\n  	border-color: #fff;\n}\n\n.theme-light .colorwaysPillButton.colorwaysPillButton-outlined {\n  	color: #000;\n}\n\n.colorwaysPillButton.colorwaysPillButton-icon {\n  	padding: 4px;\n}\n\n.colorwaysPillButton.colorwaysPillButton-primary:hover,\n.colorwaysPillButton.colorwaysPillButton-secondary:hover,\n.theme-light .colorwaysPillButton.colorwaysPillButton-brand:hover {\n  	background-color: #2a2a2a;\n  	border-color: #2a2a2a;\n  	color: #fff;\n}\n\n.colorwaysPillButton.colorwaysPillButton-primary:active,\n.colorwaysPillButton.colorwaysPillButton-secondary:active,\n.theme-light .colorwaysPillButton.colorwaysPillButton-brand:active {\n  	background-color: #0a0a0a;\n  	border-color: #0a0a0a;\n  	color: #fff;\n}\n\n.theme-light .colorwaysPillButton.colorwaysPillButton-primary:hover,\n.theme-light .colorwaysPillButton.colorwaysPillButton-secondary:hover {\n  	background-color: #d6d6d6;\n  	border-color: #d6d6d6;\n  	color: #000;\n}\n\n.theme-light .colorwaysPillButton.colorwaysPillButton-primary:active,\n.theme-light .colorwaysPillButton.colorwaysPillButton-secondary:active {\n  	background-color: #919191;\n  	border-color: #919191;\n  	color: #000;\n}\n\n.colorwaysPillButton.colorwaysPillButton-danger:hover {\n  	background-color: #c70707;\n  	border-color: #c70707;\n  	color: #fff;\n}\n\n.colorwaysPillButton.colorwaysPillButton-danger:active {\n  	background-color: #b10606;\n  	border-color: #b10606;\n  	color: #fff;\n}\n\n.colorwaysPillButton.colorwaysPillButton-brand:hover {\n  	background-color: #e1e1e1;\n  	border-color: #e1e1e1;\n  	color: #000;\n}\n\n.colorwaysPillButton.colorwaysPillButton-brand:active {\n  	background-color: #919191;\n  	border-color: #919191;\n  	color: #000;\n}\n\n.theme-light .colorwaysPillButton.colorwaysPillButton-brand:hover {\n  	background-color: #2a2a2a;\n  	border-color: #2a2a2a;\n  	color: #fff;\n}\n\n.theme-light .colorwaysPillButton.colorwaysPillButton-brand:active {\n  	background-color: #0a0a0a;\n  	border-color: #0a0a0a;\n  	color: #fff;\n}\n\n.colorwaysPillButton-md {\n  	height: var(--custom-button-button-md-height);\n  	min-width: var(--custom-button-button-md-width);\n  	min-height: var(--custom-button-button-md-height);\n}\n\n.colorwaysPillButton-lg {\n  	height: var(--custom-button-button-lg-height);\n  	min-width: var(--custom-button-button-lg-width);\n  	min-height: var(--custom-button-button-lg-height);\n}\n\n.colorwaysPillButton-xl {\n  	height: var(--custom-button-button-xl-height);\n  	min-width: var(--custom-button-button-xl-width);\n  	min-height: var(--custom-button-button-xl-height);\n}\n\n.colorwaysPillButton-tn {\n  	height: var(--custom-button-button-tn-height);\n  	min-width: var(--custom-button-button-tn-width);\n  	min-height: var(--custom-button-button-tn-height);\n}\n\n.colorwaySelectorSidebar-tab:hover {\n  	background-color: #2a2a2a;\n}\n\n.colorwaySelectorSidebar-tab.active {\n  	background-color: #0a0a0a;\n  	border-color: #a6a6a6;\n}\n\n.theme-light .colorwaySelectorSidebar-tab:hover {\n  	background-color: #d6d6d6; /* #2a2a2a */\n}\n\n.theme-light .colorwaySelectorSidebar-tab.active {\n  	background-color: #f5f5f5;\n  	border-color: #595959;\n}\n\n.colorwaysPageHeader {\n  	color: #fff;\n  	margin: 8px;\n  	font-weight: normal;\n  	padding-left: 16px;\n  	box-sizing: border-box;\n  	border-radius: 8px;\n  	background-color: #101010;\n  	display: flex;\n  	gap: 16px;\n  	align-items: center;\n  	height: 50px;\n  	flex-shrink: 0;\n}\n\n.theme-light .colorwaysPageHeader {\n  	background-color: #f0f0f0;\n  	color: #000;\n}\n\n.colorwaySelectorSidebar {\n  	background-color: #101010;\n  	color: #fff;\n  	box-sizing: border-box;\n  	height: calc(100% - 16px);\n  	border-radius: 8px;\n  	flex: 0 0 auto;\n  	padding: 8px;\n  	margin: 8px;\n  	margin-right: 0;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	border-top-left-radius: 8px;\n  	border-bottom-left-radius: 8px;\n}\n\n.theme-light .colorwaySelectorSidebar {\n  	background-color: #e6e6e6;\n  	color: #000;\n}\n\n.colorwaySelectorModalContent {\n  	display: flex;\n  	flex-direction: column;\n  	width: 100%;\n  	height: 100%;\n  	overflow: visible !important;\n  	padding: 0 16px !important;\n}\n\n.colorwaysServerListItem {\n  	position: relative;\n  	margin: 0 0 8px;\n  	display: flex;\n  	-webkit-box-pack: center;\n  	-ms-flex-pack: center;\n  	justify-content: center;\n  	width: 72px;\n}\n\n.colorwayInfoIconContainer {\n  	height: 22px;\n  	width: 22px;\n  	background-color: var(--brand-500);\n  	position: absolute;\n  	top: -1px;\n  	left: -1px;\n  	border-radius: 50%;\n  	opacity: 0;\n  	z-index: +1;\n  	color: var(--white-500);\n  	padding: 1px;\n  	box-sizing: border-box;\n}\n\n.colorwayInfoIconContainer:hover {\n  	background-color: var(--brand-500-560);\n}\n\n.discordColorway:hover .colorwayInfoIconContainer {\n  	opacity: 1;\n  	transition: 0.15s;\n}\n\n.colorwayCreator-swatch {\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	height: 50px;\n  	border-radius: 4px;\n  	box-sizing: border-box;\n  	border: none;\n  	width: 100%;\n  	position: relative;\n  	color: #fff;\n}\n\n.colorwayCreator-swatchName {\n  	color: currentcolor;\n  	pointer-events: none;\n}\n\n.colorwayCreator-colorPreviews {\n  	width: 104px;\n  	height: 104px;\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: space-between;\n  	flex-wrap: wrap;\n  	gap: 0;\n  	position: relative;\n  	box-sizing: border-box;\n  	border-radius: 104px;\n  	overflow: hidden;\n  	border: 2px solid var(--interactive-normal);\n  	flex-shrink: 0;\n}\n\n.colorwayCreator-colorPreviews > [class^=\"colorSwatch\"],\n.colorwayCreator-colorPreviews > [class^=\"colorSwatch\"] > [class^=\"swatch\"] {\n  	width: 50px;\n  	height: 50px;\n  	border: none;\n  	position: relative;\n  	border-radius: 0;\n}\n\n.colorwayCreator-colorPreviews > [class^=\"colorSwatch\"] > [class^=\"swatch\"] > svg {\n  	display: none;\n}\n\n.colorwayCreator-colorInput {\n  	width: 1px;\n  	height: 1px;\n  	opacity: 0;\n  	position: absolute;\n  	pointer-events: none;\n}\n\n.colorwayCreator-menuWrapper {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	padding: 20px 16px !important;\n  	overflow: visible !important;\n  	min-height: unset;\n}\n\n.colorwayCreator-modal {\n  	width: 620px !important;\n  	max-width: 620px;\n  	max-height: unset !important;\n}\n\n.colorways-creator-module-warning {\n  	color: var(--brand-500);\n}\n\n.colorwaysPicker-colorLabel {\n  	position: absolute;\n  	top: 0;\n  	left: 0;\n  	width: 100%;\n  	height: 100%;\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	pointer-events: none;\n}\n\n.colorwaySelector-noDisplay {\n  	display: none;\n}\n\n.colorwayInfo-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	color: var(--header-primary);\n}\n\n.colorwayInfo-colorSwatches {\n  	width: 100%;\n  	height: 46px;\n  	display: flex;\n  	flex-direction: row;\n  	align-items: center;\n  	justify-content: center;\n  	margin: 12px 0;\n  	gap: 8px;\n}\n\n.colorwayInfo-colorSwatch {\n  	display: flex;\n  	width: 100px;\n  	height: 38px;\n  	border-radius: 3px;\n  	cursor: pointer;\n  	position: relative;\n  	transition: 0.15s;\n}\n\n.colorwayInfo-colorSwatch:hover {\n  	filter: brightness(0.8);\n}\n\n.colorwayInfo-row {\n  	font-weight: 400;\n  	font-size: 20px;\n  	color: var(--header-secondary);\n  	margin-bottom: 4px;\n  	display: flex;\n  	flex-direction: row;\n  	align-items: center;\n  	justify-content: space-between;\n  	gap: 8px;\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	padding: 8px 12px;\n}\n\n.colorwayInfo-css {\n  	flex-direction: column;\n  	align-items: start;\n}\n\n.colorwayInfo-cssCodeblock {\n  	border-radius: 4px;\n  	border: 1px solid var(--background-accent);\n  	padding: 3px 6px;\n  	white-space: pre;\n  	max-height: 400px;\n  	overflow: auto;\n  	font-size: 0.875rem;\n  	line-height: 1.125rem;\n  	width: 100%;\n  	box-sizing: border-box;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar {\n  	width: 8px;\n  	height: 8px;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-corner {\n  	background-color: transparent;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-thumb {\n  	background-color: var(--scrollbar-auto-thumb);\n  	min-height: 40px;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-thumb,\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-track {\n  	border: 2px solid transparent;\n  	background-clip: padding-box;\n  	border-radius: 8px;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-track {\n  	margin-bottom: 8px;\n}\n\n.colorwaysCreator-settingCat {\n  	display: flex;\n  	flex-direction: column;\n  	padding: 10px;\n  	border-radius: 8px;\n  	background-color: #1a1a1a;\n  	box-sizing: border-box;\n  	max-height: 250px;\n  	overflow: hidden overlay;\n}\n\n.colorwaysColorpicker-settingCat {\n  	padding: 0;\n  	background-color: transparent;\n  	border-radius: 0;\n}\n\n.colorwaysColorpicker-search {\n  	width: 100%;\n}\n\n.colorwaysCreator-settingItm {\n  	display: flex;\n  	flex-direction: row;\n  	align-items: center;\n  	width: 100%;\n  	border-radius: 4px;\n  	cursor: pointer;\n  	box-sizing: border-box;\n  	padding: 8px;\n  	justify-content: space-between;\n}\n\n.colorwaysCreator-settingItm:hover {\n  	background-color: var(--background-modifier-hover);\n}\n\n.colorwaysCreator-settingsList .colorwaysCreator-preset {\n  	justify-content: start;\n  	gap: 8px;\n}\n\n.colorwaysCreator-settingsList {\n  	overflow: hidden auto;\n  	scrollbar-width: none !important;\n  	max-height: 185px;\n}\n\n.colorwaysCreator-settingCat-collapsed > :is(.colorwaysCreator-settingsList, .colorwayInfo-cssCodeblock),\n.colorwaysColorpicker-collapsed {\n  	display: none !important;\n}\n\n.colorwayColorpicker {\n  	display: flex;\n  	flex-direction: column;\n  	padding: 20px 16px !important;\n  	width: 620px !important;\n  	min-height: unset;\n}\n\n.colorwaysCreator-noHeader {\n  	margin-top: 12px;\n  	margin-bottom: 12px;\n}\n\n.colorwaysCreator-noMinHeight {\n  	min-height: unset;\n  	height: fit-content;\n}\n\n.colorwaysPreview-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	width: 100%;\n  	height: 270px;\n  	flex: 1 0 auto;\n  	border-radius: 4px;\n  	overflow: hidden;\n}\n\n.colorwaysPreview-modal {\n  	max-width: unset !important;\n  	max-height: unset !important;\n  	width: fit-content;\n  	height: fit-content;\n  	pointer-events: all;\n}\n\n.colorwaysPreview-modal > .colorwaysPreview-wrapper {\n  	height: 100%;\n}\n\n.colorwaysPreview-titlebar {\n  	height: 22px;\n  	width: 100%;\n  	display: flex;\n  	flex: 1 0 auto;\n}\n\n.colorwaysPreview-body {\n  	height: 100%;\n  	width: 100%;\n  	display: flex;\n}\n\n.colorwayPreview-guilds {\n  	width: 72px;\n  	height: 100%;\n  	display: flex;\n  	flex: 1 0 auto;\n  	padding-top: 4px;\n  	flex-direction: column;\n}\n\n.colorwayPreview-channels {\n  	width: 140px;\n  	height: 100%;\n  	display: flex;\n  	flex-direction: column-reverse;\n  	border-top-left-radius: 8px;\n  	flex: 1 0 auto;\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-channels {\n  	width: 240px;\n}\n\n.colorwayPreview-chat {\n  	width: 100%;\n  	height: 100%;\n  	display: flex;\n  	position: relative;\n  	flex-direction: column-reverse;\n}\n\n.colorwayPreview-userArea {\n  	width: 100%;\n  	height: 40px;\n  	display: flex;\n  	flex: 1 0 auto;\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-userArea {\n  	height: 52px;\n}\n\n.colorwaysPreview {\n  	display: flex;\n  	flex-direction: column;\n  	padding: 10px;\n  	gap: 5px;\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	box-sizing: border-box;\n  	color: var(--header-secondary);\n  	overflow: hidden overlay;\n  	margin-bottom: 4px;\n}\n\n.colorwaysPreview-collapsed .colorwaysPreview-wrapper {\n  	display: none;\n}\n\n.colorwayInfo-lastCat,\n.colorwaysCreator-lastCat {\n  	margin-bottom: 12px;\n}\n\n.colorwayPreview-guild {\n  	width: 100%;\n  	margin-bottom: 8px;\n  	display: flex;\n  	justify-content: center;\n}\n\n.colorwayPreview-guildItem {\n  	cursor: pointer;\n  	width: 48px;\n  	height: 48px;\n  	border-radius: 50px;\n  	transition: 0.2s ease;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n}\n\n.colorwayPreview-guildItem:hover {\n  	border-radius: 16px;\n}\n\n.colorwayPreview-guildSeparator {\n  	width: 32px;\n  	height: 2px;\n  	opacity: 0.48;\n  	border-radius: 1px;\n}\n\n.colorwayToolbox-listItem {\n  	align-items: center;\n  	border-radius: 4px;\n  	color: var(--interactive-normal);\n  	display: flex;\n  	flex-direction: column;\n  	gap: 12px;\n  	background-color: transparent !important;\n  	width: calc(564px / 4);\n  	cursor: default;\n  	float: left;\n  	box-sizing: border-box;\n  	margin: 0;\n  	padding: 0;\n}\n\n.colorwayToolbox-listItemSVG {\n  	padding: 19px;\n  	overflow: visible;\n  	border-radius: 50%;\n  	background-color: var(--background-tertiary);\n  	border: 1px solid transparent;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	transition: 0.15s ease;\n  	cursor: pointer;\n  	color: var(--interactive-normal);\n}\n\n.colorwayToolbox-listItem:hover {\n  	color: var(--interactive-normal) !important;\n}\n\n.colorwayToolbox-listItemSVG:hover {\n  	border-color: var(--brand-500);\n  	background-color: var(--brand-500-15a);\n  	color: var(--interactive-hover) !important;\n}\n\n.colorwayToolbox-title {\n  	align-items: center;\n  	display: flex;\n  	text-transform: uppercase;\n  	margin-top: 2px;\n  	padding-bottom: 8px;\n  	margin-bottom: 0;\n}\n\n.colorwayToolbox-list {\n  	box-sizing: border-box;\n  	height: 100%;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 12px;\n  	overflow: hidden;\n}\n\n.colorwayPreview-chatBox {\n  	height: 32px;\n  	border-radius: 6px;\n  	margin: 8px;\n  	margin-bottom: 12px;\n  	margin-top: 0;\n  	flex: 1 1 auto;\n}\n\n.colorwayPreview-filler {\n  	width: 100%;\n  	height: 100%;\n  	flex: 0 1 auto;\n}\n\n.colorwayPreview-topShadow {\n  	box-shadow:\n  			0 1px 0 hsl(var(--primary-900-hsl) / 20%),\n  			0 1.5px 0 hsl(var(--primary-860-hsl) / 5%),\n  			0 2px 0 hsl(var(--primary-900-hsl) / 5%);\n  	width: 100%;\n  	height: 32px;\n  	font-family: var(--font-display);\n  	font-weight: 500;\n  	padding: 12px 16px;\n  	box-sizing: border-box;\n  	align-items: center;\n  	display: flex;\n  	flex: 1 0 auto;\n}\n\n.colorwayPreview-channels > .colorwayPreview-topShadow {\n  	border-top-left-radius: 8px;\n}\n\n.colorwayPreview-channels > .colorwayPreview-topShadow:hover {\n  	background-color: hsl(var(--primary-500-hsl) / 30%);\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-topShadow {\n  	height: 48px;\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-chatBox {\n  	height: 44px;\n  	border-radius: 8px;\n  	margin: 16px;\n  	margin-bottom: 24px;\n}\n\n.colorwaysBtn-tooltipContent {\n  	font-weight: 600;\n  	font-size: 16px;\n  	line-height: 20px;\n}\n\n.colorwaySelector-headerIcon {\n  	box-sizing: border-box;\n  	width: 100%;\n  	height: 100%;\n  	transition:\n  			transform 0.1s ease-out,\n  			opacity 0.1s ease-out;\n  	color: var(--interactive-normal);\n}\n\n.colorwaySelector-header {\n  	align-items: center;\n  	justify-content: center;\n  	padding-bottom: 0;\n  	box-shadow: none !important;\n}\n\n.colorwayTextBox {\n  	width: 100%;\n  	border-radius: 6px;\n  	background-color: #101010;\n  	transition: 0.2s ease;\n  	border: 1px solid transparent;\n  	padding-left: 12px;\n  	color: #fff;\n  	height: 40px;\n  	box-sizing: border-box;\n}\n\n.colorwayTextBox::-webkit-outer-spin-button,\n.colorwayTextBox::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n\n.theme-light .colorwayTextBox {\n  	color: #000;\n  	background-color: #f0f0f0;\n}\n\n.colorwayTextBox:hover,\n.colorwayTextBox:focus {\n  	background-color: #1a1a1a;\n}\n\n.theme-light .colorwayTextBox:hover,\n.theme-light .colorwayTextBox:focus {\n  	background-color: #e6e6e6;\n}\n\n.colorwayTextBox:focus {\n  	border-color: #a6a6a6;\n}\n\n.theme-light .colorwayTextBox:focus {\n  	border-color: #595959;\n}\n\n.colorwaySelector-sources {\n  	flex: 0 0 auto;\n  	color: var(--button-outline-primary-text);\n  	border-color: var(--button-outline-primary-border);\n}\n\n.colorwaySelector-sources:hover {\n  	background-color: var(--button-outline-primary-background-hover);\n  	border-color: var(--button-outline-primary-border-hover);\n  	color: var(--button-outline-primary-text-hover);\n}\n\n.colorwaySelector-headerBtn {\n  	position: absolute;\n  	top: 64px;\n  	right: 20px;\n}\n\n.theme-light .colorwaySelector-pill_selected {\n  	border-color: var(--brand-500) !important;\n  	background-color: var(--brand-500-160) !important;\n}\n\n.theme-dark .colorwaySelector-pill_selected {\n  	border-color: var(--brand-500) !important;\n  	background-color: var(--brand-500-15a) !important;\n}\n\n.colorwaysTooltip-tooltipPreviewRow {\n  	display: flex;\n  	align-items: center;\n  	margin-top: 8px;\n}\n\n.colorwayCreator-colorPreview {\n  	width: 100%;\n  	border-radius: 4px;\n  	height: 50px;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n}\n\n.colorwaysCreator-colorPreviewItm .colorwayCreator-colorPreviews {\n  	padding: 0;\n  	background-color: transparent;\n  	border-radius: 0;\n}\n\n.colorwaysCreator-colorPreviewItm {\n  	flex-direction: column;\n  	align-items: start;\n}\n\n.colorwaysTooltip-header {\n  	background-color: var(--background-primary);\n  	padding: 2px 8px;\n  	border-radius: 16px;\n  	height: min-content;\n  	color: var(--header-primary);\n  	margin-bottom: 2px;\n  	display: inline-flex;\n  	margin-left: -4px;\n}\n\n.colorwaySelector-pillSeparator {\n  	height: 24px;\n  	width: 1px;\n  	background-color: var(--primary-400);\n}\n\n.colorwaysSelector-changelog {\n  	font-weight: 400;\n  	font-size: 20px;\n  	color: var(--header-secondary);\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	padding: 8px 12px;\n}\n\n.colorwaysChangelog-li {\n  	position: relative;\n  	font-size: 16px;\n  	line-height: 20px;\n}\n\n.colorwaysChangelog-li::before {\n  	content: \"\";\n  	position: absolute;\n  	top: 10px;\n  	left: -15px;\n  	width: 6px;\n  	height: 6px;\n  	margin-top: -4px;\n  	margin-left: -3px;\n  	border-radius: 50%;\n  	opacity: 0.3;\n}\n\n.theme-dark .colorwaysChangelog-li::before {\n  	background-color: hsl(216deg calc(var(--saturation-factor, 1) * 9.8%) 90%);\n}\n\n.theme-light .colorwaysChangelog-li::before {\n  	background-color: hsl(223deg calc(var(--saturation-factor, 1) * 5.8%) 52.9%);\n}\n\n.colorways-selector .colorwayToolbox-list {\n  	width: 100%;\n}\n\n.colorwaysToolbox-label {\n  	border-radius: 20px;\n  	box-sizing: border-box;\n  	color: var(--text-normal);\n  	transition: 0.15s ease;\n  	width: 100%;\n  	margin-left: 0;\n  	height: fit-content;\n  	text-align: center;\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: wrap;\n  	cursor: default;\n  	max-height: 2rem;\n  	padding: 0 8px;\n}\n\n.colorwaysSelector-changelogHeader {\n  	font-weight: 700;\n  	font-size: 16px;\n  	line-height: 20px;\n  	text-transform: uppercase;\n  	position: relative;\n  	display: flex;\n  	align-items: center;\n}\n\n.colorwaysSelector-changelogHeader::after {\n  	content: \"\";\n  	height: 1px;\n  	flex: 1 1 auto;\n  	margin-left: 4px;\n  	opacity: 0.6;\n  	background-color: currentcolor;\n}\n\n.colorwaysSelector-changelogHeader_added {\n  	color: var(--text-positive);\n}\n\n.colorwaysSelector-changelogHeader_fixed {\n  	color: hsl(359deg calc(var(--saturation-factor, 1) * 87.3%) 59.8%);\n}\n\n.colorwaysSelector-changelogHeader_changed {\n  	color: var(--text-warning);\n}\n\n.is-mobile .colorwaySelectorModal,\n.is-mobile .colorwayCreator-modal {\n  	width: 100vw !important;\n  	box-sizing: border-box;\n  	min-width: unset;\n  	border-radius: 0;\n  	height: 100vh;\n  	max-height: unset;\n  	border: none;\n}\n\n.is-mobile .colorwaySelectorModalContent {\n  	box-sizing: border-box;\n  	width: 100vw;\n}\n\n.is-mobile .colorwaySelector-doublePillBar {\n  	flex-direction: column-reverse;\n  	align-items: end;\n}\n\n.is-mobile .colorwaySelector-doublePillBar > .colorwaySelector-pillWrapper:first-child {\n  	width: 100%;\n  	gap: 4px;\n  	overflow-x: auto;\n  	justify-content: space-between;\n}\n\n.is-mobile .colorwaySelector-doublePillBar > .colorwaySelector-pillWrapper:first-child > .colorwaySelector-pill {\n  	border-radius: 0;\n  	border-top: none;\n  	border-left: none;\n  	border-right: none;\n  	background-color: transparent;\n  	width: 100%;\n  	justify-content: center;\n  	flex: 0 0 min-content;\n}\n\n.is-mobile\n  	.colorwaySelector-doublePillBar\n  	> .colorwaySelector-pillWrapper:first-child\n  	> .colorwaySelector-pillSeparator {\n  	display: none;\n}\n\n.is-mobile .layer-fP3xEz:has(.colorwaySelectorModal, .colorwayCreator-modal) {\n  	padding: 0;\n}\n\n.is-mobile .colorways-selector {\n  	justify-content: space-around;\n  	gap: 10px;\n}\n\n#colorwaySelector-pill_closeSelector {\n  	display: none !important;\n}\n\n.is-mobile #colorwaySelector-pill_closeSelector {\n  	display: flex !important;\n}\n\n.colorwaysBtn-spinner {\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	width: 100%;\n}\n\n.colorwaysBtn-spinnerInner {\n  	transform: rotate(280deg);\n  	position: relative;\n  	display: inline-block;\n  	width: 32px;\n  	height: 32px;\n  	contain: paint;\n}\n\n@keyframes spinner-spinning-circle-rotate {\n  	100% {\n  			transform: rotate(1turn);\n  	}\n}\n\n@keyframes spinner-spinning-circle-dash {\n  	0% {\n  			stroke-dasharray: 1, 200;\n  			stroke-dashoffset: 0;\n  	}\n\n  	50% {\n  			stroke-dasharray: 130, 200;\n  	}\n\n  	100% {\n  			stroke-dasharray: 130, 200;\n  			stroke-dashoffset: -124;\n  	}\n}\n\n.colorwaysBtn-spinnerCircular {\n  	animation: spinner-spinning-circle-rotate 2s linear infinite;\n  	height: 100%;\n  	width: 100%;\n}\n\n.colorwaysBtn-spinnerBeam {\n  	animation: spinner-spinning-circle-dash 2s ease-in-out infinite;\n  	stroke-dasharray: 1, 200;\n  	stroke-dashoffset: 0;\n  	fill: none;\n  	stroke-width: 6;\n  	stroke-miterlimit: 10;\n  	stroke-linecap: round;\n  	stroke: currentcolor;\n}\n\n.colorwaysBtn-spinnerBeam2 {\n  	stroke: currentcolor;\n  	opacity: 0.6;\n  	animation-delay: 0.15s;\n}\n\n.colorwaysBtn-spinnerBeam3 {\n  	stroke: currentcolor;\n  	opacity: 0.3;\n  	animation-delay: 0.23s;\n}\n\n.colorwaysModalTab {\n  	height: 100%;\n}\n\n.discordColorway {\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: start;\n  	padding: 11px 8px;\n  	gap: 5px;\n  	border-radius: 6px;\n  	background-color: #101010;\n  	box-sizing: border-box;\n  	min-height: 56px;\n  	align-items: center;\n  	border: 1px solid transparent;\n  	transition: 0.2s ease;\n  	cursor: pointer;\n}\n\n.theme-light .discordColorway {\n  	background-color: #f0f0f0;\n}\n\n.discordColorway:hover,\n.discordColorway:focus,\n.discordColorway[aria-checked=\"true\"] {\n  	background-color: #2a2a2a;\n}\n\n.theme-light .discordColorway:hover,\n.theme-light .discordColorway:focus,\n.theme-light .discordColorway[aria-checked=\"true\"] {\n  	background-color: #d6d6d6;\n}\n\n.discordColorway[aria-checked=\"true\"] {\n  	border-color: #a6a6a6;\n}\n\n.theme-light .discordColorway[aria-checked=\"true\"] {\n  	border-color: #595959;\n}\n\n.colorwaysSettings-modalRoot {\n  	min-width: 520px;\n}\n\n.colorwaysSettings-colorwaySourceLabel {\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n  	flex-grow: 1;\n  	line-height: 30px;\n}\n\n.colorwaysSettings-colorwaySourceLabelHeader {\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n  	flex-grow: 1;\n  	font-weight: 700;\n  	font-size: 16px;\n}\n\n.colorwaysSettings-colorwaySourceLabel,\n.colorwaysSettings-colorwaySourceLabelHeader,\n.colorwaysSettings-colorwaySourceDesc {\n  	color: #fff;\n}\n\n.colorwaysSettings-colorwaySourceDesc {\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n  	flex-grow: 1;\n}\n\n.colorwaysSettings-iconButton {\n  	background-color: transparent !important;\n  	border-radius: 0;\n}\n\n.colorwaysSettings-iconButtonInner {\n  	display: flex;\n  	gap: 4px;\n  	align-items: center;\n}\n\n.colorwaysSettings-modalContent {\n  	margin: 8px 0;\n}\n\n@keyframes loading-bar {\n  	0% {\n  			left: 0;\n  			right: 100%;\n  			width: 0;\n  	}\n\n  	10% {\n  			left: 0;\n  			right: 75%;\n  			width: 25%;\n  	}\n\n  	90% {\n  			right: 0;\n  			left: 75%;\n  			width: 25%;\n  	}\n\n  	100% {\n  			left: 100%;\n  			right: 0;\n  			width: 0;\n  	}\n}\n\n.colorwaysLoader-barContainer {\n  	width: 100%;\n  	border-radius: var(--radius-round);\n  	border: 0;\n  	position: relative;\n  	padding: 0;\n}\n\n.colorwaysLoader-bar {\n  	position: absolute;\n  	border-radius: var(--radius-round);\n  	top: 0;\n  	right: 100%;\n  	bottom: 0;\n  	left: 0;\n  	background: var(--brand-500);\n  	width: 0;\n  	animation: loading-bar 2s linear infinite;\n  	transition: 0.2s ease;\n}\n\n.colorwaysSettingsSelector-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n}\n\n.colorwaysSettingsPage-wrapper .colorwayToolbox-listItem {\n  	gap: 8px;\n  	border-radius: 50px;\n  	padding: 12px 16px;\n  	background-color: var(--background-tertiary);\n  	transition: 0.15s ease;\n  	border: 1px solid transparent;\n  	color: var(--interactive-normal);\n}\n\n.colorwaysSettingsPage-wrapper .colorwayToolbox-listItem:hover {\n  	border-color: var(--brand-500);\n  	background-color: var(--brand-500-15a);\n  	color: var(--interactive-hover);\n}\n\n.colorwaysSettingsSelector-wrapper .colorwaySelector-doublePillBar {\n  	justify-content: start;\n}\n\n.colorwaysCreator-toolboxItm:hover {\n  	background-color: var(--brand-500) !important;\n}\n\n.colorwayCreator-colorPreview_primary + .colorwayCreator-colorPreview_primary,\n.colorwayCreator-colorPreview_secondary + .colorwayCreator-colorPreview_secondary,\n.colorwayCreator-colorPreview_tertiary + .colorwayCreator-colorPreview_tertiary,\n.colorwayCreator-colorPreview_accent + .colorwayCreator-colorPreview_accent {\n  	display: none;\n}\n\n.colorwaysConflictingColors-warning {\n  	width: 100%;\n  	text-align: center;\n  	justify-content: center;\n  	color: #fff;\n}\n\n.ColorwaySelectorBtn_thin {\n  	height: 21px !important;\n  	width: 56px !important;\n}\n\n.ColorwaySelectorBtn_thin:hover {\n  	border-radius: 8px;\n}\n\n.colorwayTextBoxPopout {\n  	display: none !important;\n}\n\n.colorways-badge {\n  	font-size: 0.625rem;\n  	text-transform: uppercase;\n  	vertical-align: top;\n  	display: inline-flex;\n  	align-items: center;\n  	text-indent: 0;\n  	background: #fff;\n  	color: #000;\n  	flex: 0 0 auto;\n  	height: 15px;\n  	padding: 0 4px;\n  	margin-top: 5px;\n  	border-radius: 16px;\n}\n\n.theme-light .colorways-badge {\n  	background-color: #000;\n  	color: #fff;\n}\n\n.hoverRoll {\n  	display: inline-block;\n  	vertical-align: top;\n  	cursor: default;\n  	text-align: left;\n  	box-sizing: border-box;\n  	position: relative;\n  	width: 100%;\n  	contain: paint;\n}\n\n.hoverRoll_hovered {\n  	white-space: nowrap;\n  	text-overflow: ellipsis;\n  	overflow: hidden;\n  	display: block;\n  	transition: all.22s ease;\n  	transform-style: preserve-3d;\n  	pointer-events: none;\n  	width: 100%;\n  	opacity: 0;\n  	transform: translate3d(0, 107%, 0);\n  	position: absolute;\n  	top: 0;\n  	left: 0;\n  	bottom: 0;\n  	right: 0;\n}\n\n.hoverRoll:hover .hoverRoll_hovered,\n.colorwaysSettings-colorwaySource:hover .hoverRoll_hovered {\n  	transform: translateZ(0);\n  	opacity: 1;\n}\n\n.hoverRoll_normal {\n  	white-space: nowrap;\n  	text-overflow: ellipsis;\n  	overflow: hidden;\n  	display: block;\n  	transition: all 0.22s ease;\n  	transform-style: preserve-3d;\n  	pointer-events: none;\n  	width: 100%;\n}\n\n.hoverRoll:hover .hoverRoll_normal,\n.colorwaysSettings-colorwaySource:hover .hoverRoll_normal {\n  	transform: translate3d(0, -107%, 0);\n  	opacity: 0;\n  	user-select: none;\n}\n\n.dc-warning-card {\n  	padding: 1em;\n  	margin-bottom: 1em;\n  	background-color: var(--info-warning-background);\n  	border-color: var(--info-warning-foreground);\n  	color: var(--info-warning-text);\n}\n\n/* stylelint-disable-next-line no-duplicate-selectors */\n.colorwaysPreview-modal {\n  	width: 90vw !important;\n  	height: 90vh !important;\n  	max-height: unset !important;\n  	animation: show-modal 0.2s ease;\n}\n\n.colorwaysPresetPicker-content {\n  	padding: 16px;\n}\n\n.colorwaysPresetPicker {\n  	width: 600px;\n}\n\n.colorwaysCreator-setting {\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: space-between;\n  	border-radius: 8px;\n  	background-color: #1a1a1a;\n  	box-sizing: border-box;\n  	padding: 10px 18px;\n  	padding-right: 10px;\n  	cursor: pointer;\n  	align-items: center;\n}\n\n.colorwaysCreator-setting:hover {\n  	background-color: #2a2a2a;\n}\n\n.dc-colorway-selector::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--si-appearance) center/contain no-repeat !important;\n  	mask: var(--si-appearance) center/contain no-repeat !important;\n}\n\n.dc-colorway-settings::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--si-vencordsettings) center/contain no-repeat !important;\n  	mask: var(--si-vencordsettings) center/contain no-repeat !important;\n}\n\n.dc-colorway-sources-manager::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--si-instantinvites) center/contain no-repeat !important;\n  	mask: var(--si-instantinvites) center/contain no-repeat !important;\n}\n\n.dc-colorway-store::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--si-discovery) center/contain no-repeat !important;\n  	mask: var(--si-discovery) center/contain no-repeat !important;\n}\n\n.colorwaySourceModal {\n  	min-height: unset;\n}\n\n.colorwaySelector-sourceSelect {\n  	width: fit-content !important;\n}\n\n.dc-info-card {\n  	border-radius: 5px;\n  	border: 1px solid var(--blue-345);\n  	padding: 1em;\n  	margin-bottom: 1em;\n  	display: flex;\n  	gap: 1em;\n  	flex-direction: column;\n}\n\n.theme-dark .dc-info-card {\n  	color: var(--white-500);\n}\n\n.theme-light .dc-info-card {\n  	color: var(--black-500);\n}\n\n.colorwaysSettings-sourceScroller {\n  	scrollbar-width: none;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	overflow: hidden auto;\n}\n\n.colorwaysScroller {\n  	scrollbar-width: none !important;\n  	overflow: hidden auto;\n}\n\n.colorwaysSettings-sourceScroller::-webkit-scrollbar {\n  	width: 0;\n}\n\n.colorwayMessage {\n  	padding: 20px;\n  	border: 1px solid #a6a6a6f0;\n  	border-radius: 8px;\n  	background-color: #090909;\n  	display: flex;\n}\n\n.colorwayMessage-contents {\n  	display: flex;\n  	flex-direction: column;\n}\n\n.colorwaysLoadingModal,\n.colorwayInfo-cssModal {\n  	width: fit-content;\n  	height: fit-content;\n  	min-width: unset;\n  	min-height: unset;\n  	background: none;\n  	box-shadow: none !important;\n  	border: none;\n}\n\n.discordColorway .discordColorwayPreviewColorContainer {\n  	width: 30px;\n  	height: 30px;\n}\n\n.discordColorway .colorwayInfoIconContainer {\n  	height: 28px;\n  	width: 28px;\n  	border-radius: 3px;\n  	position: static;\n  	opacity: 1;\n  	justify-content: center;\n  	display: flex;\n  	align-items: center;\n  	background: transparent;\n  	border: 1px solid var(--button-outline-primary-border);\n  	color: var(--button-outline-primary-text);\n  	transition: 0.15s;\n}\n\n.discordColorway .colorwayInfoIconContainer:hover {\n  	background-color: var(--button-outline-primary-background-hover);\n  	border-color: var(--button-outline-primary-border-hover);\n  	color: var(--button-outline-primary-text-hover);\n}\n\n.colorwayLabel {\n  	margin-right: auto;\n  	margin-top: 0 !important;\n  	margin-left: 0.5rem;\n  	color: var(--header-primary);\n  	font-family: bootstrap-icons, var(--font-primary);\n  	/* stylelint-disable-next-line value-keyword-case */\n  	text-rendering: optimizeLegibility;\n}\n\n.colorwayLabelSubnote {\n  	color: var(--header-secondary);\n  	overflow: hidden overlay;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n  	width: 100%;\n  	height: 23px;\n}\n\n.colorwayLabelContainer {\n  	min-width: 0;\n  	display: flex;\n  	flex-direction: column;\n  	margin-right: 8px;\n  	width: 100%;\n}\n\n.colorwaySelectionCircle {\n  	position: absolute;\n  	width: 56px;\n  	height: 56px;\n  	top: 0;\n  	left: 0;\n}\n\n.colorwaySelector-sorter {\n  	height: 50px;\n  	width: 100%;\n  	box-shadow: var(--elevation-low);\n  	margin-bottom: 8px;\n  	display: flex;\n}\n\n.colorwaySelector-sorter_selectedSpacer {\n  	width: 80px;\n  	height: 50px;\n}\n\n.colorwaySelector-sorter_text {\n  	line-height: 50px;\n  	margin: 0;\n}\n\n.colorwaySelector-sorter_name {\n  	margin-right: auto;\n  	cursor: pointer;\n}\n\n.colorwayPresetLabel {\n  	margin-right: 1rem;\n}\n\n.colorwayPreview-channel {\n  	margin: 10px;\n  	width: calc(100% - 20px);\n  	height: 8px;\n  	border-radius: 16px;\n}\n\n.colorwaysModal {\n  	border-radius: 16px;\n  	background-color: #000;\n  	color: #fff;\n  	height: fit-content;\n  	min-height: unset;\n  	width: fit-content;\n  	border: none;\n  	padding: 0;\n  	margin: 0;\n  	transition: 0.4s ease;\n  	animation: show-modal 0.4s ease;\n  	pointer-events: all;\n  	min-width: 400px;\n}\n\n.colorwaysModalContent {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 4px;\n  	padding: 16px;\n}\n\n.colorwaysModalContent-sourcePreview {\n  	padding-left: 0;\n  	padding-right: 0;\n}\n\n.colorwaysMenuTabs {\n  	width: 100%;\n  	height: 24px;\n  	box-sizing: content-box !important;\n}\n\n.colorwaysMenuTab {\n  	color: #fff;\n  	text-decoration: none;\n  	padding: 4px 12px;\n  	border-radius: 32px;\n  	transition: 0.2s ease;\n  	margin-right: 8px;\n  	display: inline-block;\n}\n\n.theme-light .colorwaysMenuTab {\n  	color: #000;\n}\n\n.colorwayInnerTab {\n  	box-sizing: border-box;\n  	width: 100%;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	height: calc(100% - 50px);\n  	padding: 16px;\n  	overflow: hidden auto;\n}\n\n.colorwayInnerTab::-webkit-scrollbar {\n  	width: 0;\n}\n\n.colorwaysMenuTab:hover {\n  	background-color: #1f1f1f;\n}\n\n.theme-light .colorwaysMenuTab:hover {\n  	background-color: #e0e0e0;\n}\n\n.colorwaysMenuTab.active {\n  	color: #000;\n  	background-color: #fff;\n}\n\n.theme-light .colorwaysMenuTab.active {\n  	color: #fff;\n  	background-color: #000;\n}\n\n.colorwaysModalFooter {\n  	border-top-left-radius: 8px;\n  	border-top-right-radius: 8px;\n  	border-bottom-left-radius: 16px;\n  	border-bottom-right-radius: 16px;\n  	padding: 8px;\n  	display: flex;\n  	flex-direction: row-reverse;\n  	background-color: #0a0a0a;\n  	width: calc(100% - 16px);\n  	gap: 8px;\n}\n\n.colorwaysModalFooter > .colorwaysPillButton {\n  	width: 100%;\n}\n\n.colorwaysModalHeader {\n  	margin: 0;\n  	font-weight: normal;\n  	font-size: 1.25em;\n  	padding: 16px;\n  	color: var(--text-normal);\n}\n\n.colorwaysModalFieldHeader {\n  	margin-bottom: 8px;\n  	display: block;\n  	font-family: var(--font-display);\n  	font-size: 12px;\n  	line-height: 1.3333;\n  	font-weight: 700;\n  	text-transform: uppercase;\n  	letter-spacing: .02em;\n  	color: var(--header-secondary);\n}\n\n.colorwaysModalFieldHeader-error {\n  	color: #FF0000;\n}\n\n.colorwaysModalFieldHeader-errorMsg {\n  	font-size: 12px;\n  	font-weight: 500;\n  	font-style: italic;\n  	text-transform: none;\n}\n\n.colorwaysModalFieldHeader-errorMsgSeparator {\n  	padding-left: 4px;\n  	padding-right: 4px;\n}\n\n.colorwayIDCard {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	max-width: 500px;\n  	width: 100%;\n}\n\n.colorwayIDCard > .discordColorway {\n  	width: 100%;\n}\n\n.colorwaysContextMenu {\n  	border-radius: 8px;\n  	border: 1px solid #dfdfdf;\n  	background-color: #000;\n  	padding: 4px;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 4px;\n  	position: relative;\n  	z-index: 5;\n}\n\n.colorwaysSubmenuWrapper .colorwaysContextMenu {\n  	right: -12px;\n  	position: relative;\n}\n\n.colorwaysContextMenuItm {\n  	box-sizing: border-box;\n  	display: flex;\n  	justify-content: space-between;\n  	align-items: center;\n  	min-height: 32px;\n  	padding: 6px 8px;\n  	border-radius: 6px;\n  	background-color: #101010;\n  	border: 1px solid transparent;\n  	transition: 0.2s ease;\n  	cursor: pointer;\n  	color: #dfdfdf;\n}\n\n.colorwaysContextMenuItm:hover {\n  	background-color: #2a2a2a;\n  	border-color: #a6a6a6;\n}\n\n.colorwaysRadioSelected {\n  	fill: #fff;\n}\n\n.colorwaysTooltip {\n  	background-color: var(--background-floating);\n  	box-shadow: var(--shadow-high);\n  	color: var(--text-normal);\n  	pointer-events: none;\n  	border-radius: 5px;\n  	font-weight: 500;\n  	font-size: 14px;\n  	line-height: 16px;\n  	max-width: 190px;\n  	box-sizing: border-box;\n  	word-wrap: break-word;\n  	z-index: 1002;\n  	will-change: opacity, transform;\n  	transition:\n  			transform 0.1s ease,\n  			opacity 0.1s ease;\n  	position: fixed;\n}\n\n.colorwaysTooltip.colorwaysTooltip-hidden {\n  	transform: scale(0.95);\n  	opacity: 0;\n}\n\n.colorwaysTooltip-right {\n  	transform-origin: 0% 50%;\n}\n\n.colorwaysTooltipPointer {\n  	width: 0;\n  	height: 0;\n  	border: 0 solid transparent;\n  	border-width: 5px;\n  	pointer-events: none;\n  	border-top-color: var(--background-floating);\n}\n\n.colorwaysTooltip-right > .colorwaysTooltipPointer {\n  	position: absolute;\n  	right: 100%;\n  	top: 50%;\n  	margin-top: -5px;\n  	border-left-width: 5px;\n  	transform: rotate(90deg);\n}\n\n.colorwaysTooltipContent {\n  	padding: 8px 12px;\n  	overflow: hidden;\n  	font-weight: 600;\n  	font-size: 16px;\n  	line-height: 20px;\n  	display: flex;\n  	flex-direction: column;\n}\n\n.colorwaysManagerConnectionMenu {\n  	transform: translateX(-20px);\n  	opacity: 0;\n  	border: 1px solid #a6a6a6f0;\n  	background-color: #090909;\n  	transition:\n  			transform 0.2s ease,\n  			opacity 0.2s ease;\n  	display: flex;\n  	flex-direction: column;\n  	padding: 8px 12px;\n  	color: #fff;\n  	pointer-events: none;\n  	border-radius: 8px;\n  	font-weight: 600;\n  	font-size: 16px;\n  	line-height: 20px;\n  	z-index: +1;\n}\n\n.colorwaysManagerConnectionMenu.visible {\n  	opacity: 1;\n  	transform: none;\n  	pointer-events: all;\n}\n\n.colorwaysManagerConnectionValue {\n  	color: #80868e;\n  	font-weight: 500;\n  	font-size: 12;\n}\n\n.colorwaysManagerConnectionValue > b {\n  	color: #a0a6ae;\n}\n\n.colorwaysWordmarkFirstPart {\n  	font-family: var(--font-headline);\n  	font-size: 24px;\n  	color: var(--header-primary);\n  	line-height: 31px;\n  	margin-bottom: 0;\n}\n\n.colorwaysWordmarkSecondPart {\n  	font-family: var(--font-display);\n  	font-size: 24px;\n  	background-color: var(--brand-500);\n  	padding: 0 4px;\n  	border-radius: 4px;\n}\n\n.visual-refresh .colorwaysWordmarkSecondPart {\n  	border-radius: 8px;\n  	padding: 0 8px;\n  	border: 1px solid var(--border-strong);\n  	font-family: \"Edu AU VIC WA NT Hand\", cursive;\n  	line-height: 32px;\n  	display: inline-block;\n}\n\n.visual-refresh .ColorwaySelectorBtn {\n  	width: 44px;\n  	height: 44px;\n}\n\n.colorwaysServerListItemPill {\n  	width: 4px;\n  	margin-left: -4px;\n  	height: 0;\n  	position: absolute;\n  	top: 50%;\n  	left: 0;\n  	transform: translateY(-50%);\n  	background-color: var(--header-primary);\n  	border-radius: 0 4px 4px 0;\n  	transition: 0.2s ease-in-out;\n}\n\n.colorwaysServerListItemPill[data-status=\"hover\"],\n.colorwaysServerListItemPill[data-status=\"active\"] {\n  	margin-left: 0;\n  	height: 20px;\n}\n\n.colorwaysServerListItemPill[data-status=\"active\"] {\n  	height: 40px;\n}\n\n.colorwaysManagerActive {\n  	color: #fff;\n  	margin: auto;\n  	font-size: 20px;\n  	display: flex;\n  	justify-content: center;\n  	gap: 8px;\n  	align-items: center;\n  	position: absolute;\n  	top: 0;\n  	left: 0;\n  	height: 100%;\n  	width: 100%;\n  	backdrop-filter: blur(16px);\n  	z-index: 1;\n}\n\n.colorwaysMenuHeader {\n  	box-sizing: border-box;\n  	display: flex;\n  	justify-content: space-between;\n  	align-items: center;\n  	min-height: 32px;\n  	padding: 6px 8px;\n  	text-transform: uppercase;\n  	font-family: var(--font-display);\n  	font-weight: 800;\n  	font-size: 12px;\n  	padding-top: 4px;\n  	padding-bottom: 0;\n  	color: #fff;\n  	text-decoration: underline;\n}\n\n.colorwaysCaretContainer {\n  	position: relative;\n  	flex: 0 0 auto;\n  	height: 18px;\n  	width: 18px;\n  	margin-left: 8px;\n}\n\n.colorwaySelectorSpinner {\n  	position: absolute;\n  	top: 20px;\n  	right: 20px;\n  	width: 32px;\n  	color: #fff;\n  	transform: scale(.8);\n}\n\n.colorwaySelectorSpinner-hidden {\n  	display: none;\n}\n\n.colorwaysContextMenuColors {\n  	display: flex;\n  	justify-items: center;\n  	align-items: center;\n  	gap: 4px;\n  	padding: 8px;\n}\n\n.colorwaysContextMenuColor {\n  	border-radius: 8px;\n  	min-width: 44px;\n  	width: 100%;\n  	height: 44px;\n  	cursor: pointer;\n  	transition: .2s ease;\n}\n\n.colorwaysContextMenuColor:hover {\n  	filter: brightness(.8);\n}\n\n.colorwaysSettings-switchHandle {\n  	transition: 0.2s;\n  	display: block;\n  	position: absolute;\n  	width: 28px;\n  	height: 18px;\n  	margin: 3px;\n}\n\n.colorwaysFeatureIconContainer {\n  	padding: 16px;\n  	background-color: #0a0a0a;\n  	border-radius: 100%;\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	width: fit-content;\n  	margin: 0 32px;\n}\n\n.colorwaysFeatureIconLabel {\n  	text-align: center;\n  	height: fit-content;\n  	padding-top: 16px;\n}\n\n.colorwaysFeaturePresent {\n  	display: grid;\n  	grid-template-columns: repeat(3, 144px);\n  	grid-template-rows: repeat(2, 1fr);\n  	justify-content: space-evenly;\n  	height: fit-content;\n  	min-height: unset;\n  	align-items: center;\n}\n\n.saturation-white {\n  	background: -webkit-linear-gradient(to right, #fff, rgba(255,255,255,0));\n  	background: linear-gradient(to right, #fff, rgba(255,255,255,0));\n}\n\n.saturation-black {\n  	background: -webkit-linear-gradient(to top, #000, rgba(0,0,0,0));\n  	background: linear-gradient(to top, #000, rgba(0,0,0,0));\n}\n\n.hue-horizontal {\n  	background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0\n  		33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n  	background: -webkit-linear-gradient(to right, #f00 0%, #ff0\n  		17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n}\n\n.hue-vertical {\n  	background: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%,\n  		#0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n  	background: -webkit-linear-gradient(to top, #f00 0%, #ff0 17%,\n  		#0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n}\n\n.colorwaysSaveAsSwatch {\n  	width: 50px;\n  	height: 50px;\n  	border: none;\n  	position: relative;\n  	border-radius: 0;\n  	cursor: pointer;\n}\n\n.colorwayCustomColorpicker {\n  	display: flex;\n  	flex-direction: column;\n  	width: 220px;\n  	padding: 16px;\n  	gap: 16px;\n  	border: 1px solid var(--border-subtle);\n  	background-color: var(--background-primary);\n  	border-radius: 4px;\n  	box-shadow: var(--elevation-high);\n}\n\n.colorwayCustomColorpicker-suggestedColor {\n  	width: 32px;\n  	height: 32px;\n  	border-radius: 4px;\n  	cursor: pointer;\n  	border: 1px solid var(--primary-400);\n}\n\n.colorwayCustomColorpicker-suggestedColors {\n  	display: flex;\n  	justify-content: center;\n  	flex-wrap: wrap;\n  	gap: 12px;\n}\n\n.colorwayCustomColorpicker-inputContainer {\n  	display: flex;\n  	align-items: center;\n  	gap: 12px;\n}\n\n.colorwayCustomColorpicker-eyeDropper {\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	cursor: pointer;\n  	width: 16px;\n  	height: 16px;\n  	margin: 0;\n}\n\n.colorwayCustomColorpicker-inputWrapper {\n  	display: flex;\n  	flex-direction: column;\n  	flex: 1;\n}\n";

const css = "/* stylelint-disable color-function-notation */\n/* stylelint-disable custom-property-pattern */\n/* stylelint-disable no-descending-specificity */\n.colorwaySelectorModal[data-theme=\"discord\"],\n.colorwayModal[data-theme=\"discord\"] {\n  	border: none;\n  	box-shadow: var(--legacy-elevation-border), var(--legacy-elevation-high);\n  	background-color: var(--modal-background);\n  	border-radius: 4px;\n}\n\n[data-theme=\"discord\"] .colorwaysSettingsDivider {\n  	border-color: var(--background-modifier-accent);\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-switchCircle {\n  	fill: #fff !important;\n}\n\n[data-theme=\"discord\"] .colorwayInnerTab,\n.colorwayInnerTab[data-theme=\"discord\"] {\n  	border-top-left-radius: 4px;\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-switch {\n  	background-color: rgb(128 132 142);\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-switch.checked {\n  	background-color: #23a55a;\n}\n\n[data-theme=\"discord\"] > .colorwaySelectorSidebar > .colorwaySelectorSidebar-tab {\n  	transition: none;\n  	border-radius: 4px;\n  	border: none;\n}\n\n[data-theme=\"discord\"] > .colorwaySelectorSidebar > .colorwaySelectorSidebar-tab.active {\n  	background-color: var(--background-modifier-selected);\n}\n\n[data-theme=\"discord\"] > .colorwaySelectorSidebar > .colorwaySelectorSidebar-tab:hover {\n  	background-color: var(--background-modifier-hover);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton {\n  	height: var(--custom-button-button-sm-height);\n  	min-width: var(--custom-button-button-sm-width);\n  	min-height: var(--custom-button-button-sm-height);\n  	width: auto;\n  	transition:\n  			background-color var(--custom-button-transition-duration) ease,\n  			color var(--custom-button-transition-duration) ease;\n  	position: relative;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	box-sizing: border-box;\n  	border: none;\n  	border-radius: 3px;\n  	font-size: 14px;\n  	font-weight: 500;\n  	line-height: 16px;\n  	padding: 2px 16px;\n  	user-select: none;\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton.colorwaysPillButton-primary,\n[data-theme=\"discord\"] .colorwaysPillButton.colorwaysPillButton-secondary {\n  	border-color: var(--button-secondary-background);\n  	color: var(--button-outline-primary-text);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton:not(.colorwaysPillButton-outlined).colorwaysPillButton-primary,\n[data-theme=\"discord\"] .colorwaysPillButton:not(.colorwaysPillButton-outlined).colorwaysPillButton-secondary {\n  	background-color: var(--button-secondary-background);\n  	color: var(--white-500);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton.colorwaysPillButton-primary:hover,\n[data-theme=\"discord\"] .colorwaysPillButton.colorwaysPillButton-secondary:hover {\n  	background-color: var(--button-secondary-background-hover);\n  	border-color: var(--button-secondary-background-hover);\n  	color: var(--button-outline-primary-text-hover);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton.colorwaysPillButton-primary:active,\n[data-theme=\"discord\"] .colorwaysPillButton.colorwaysPillButton-secondary:active {\n  	background-color: var(--button-secondary-background-active);\n  	border-color: var(--button-secondary-background-active);\n  	color: var(--button-outline-primary-text-active);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton.colorwaysPillButton-brand {\n  	color: var(--button-outline-brand-text);\n  	border-color: var(--brand-500);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton:not(.colorwaysPillButton-outlined).colorwaysPillButton-brand {\n  	color: var(--white-500);\n  	background-color: var(--brand-500);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton.colorwaysPillButton-brand:hover {\n  	background-color: var(--brand-560);\n  	border-color: var(--brand-560);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton.colorwaysPillButton-brand:active {\n  	background-color: var(--brand-600);\n  	border-color: var(--brand-600);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton.colorwaysPillButton-danger {\n  	color: var(--button-outline-danger-text);\n  	border-color: var(--button-danger-background);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton:not(.colorwaysPillButton-outlined).colorwaysPillButton-danger {\n  	color: var(--white-500);\n  	background-color: var(--button-danger-background);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton.colorwaysPillButton-danger:hover {\n  	background-color: var(--button-danger-background-hover);\n  	border-color: var(--button-danger-background-hover);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton.colorwaysPillButton-danger:active {\n  	background-color: var(--button-danger-background-active);\n  	border-color: var(--button-danger-background-active);\n}\n\n[data-theme=\"discord\"] > .colorwaySelectorSidebar {\n  	border-radius: 4px 0 0 4px;\n  	background-color: var(--modal-footer-background);\n  	box-shadow: inset 0 1px 0 hsl(var(--primary-630-hsl) / 60%);\n  	padding: 12px;\n  	margin: 0;\n  	height: 100%;\n}\n\n.theme-light [data-theme=\"discord\"] > .colorwaySelectorSidebar {\n  	box-shadow: inset 0 1px 0 hsl(var(--primary-100-hsl) / 60%);\n}\n\n[data-theme=\"discord\"] .colorwayTextBox {\n  	border-radius: 3px;\n  	color: var(--text-normal);\n  	background-color: var(--input-background) !important;\n  	height: 40px;\n  	padding: 10px;\n  	transition: none;\n  	font-size: 16px;\n  	border: none;\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySource {\n  	border-radius: 4px;\n  	color: var(--interactive-normal);\n  	background-color: var(--background-secondary);\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySource:hover {\n  	color: var(--interactive-active);\n  	background-color: var(--background-modifier-hover);\n}\n\n[data-theme=\"discord\"] .discordColorway {\n  	border-radius: 4px;\n  	transition: none;\n  	background-color: var(--background-secondary);\n  	border: none;\n  	color: var(--header-primary);\n}\n\n[data-theme=\"discord\"] .discordColorway:hover,\n[data-theme=\"discord\"] .discordColorway:focus {\n  	filter: none;\n  	background-color: var(--background-modifier-hover);\n}\n\n[data-theme=\"discord\"] .discordColorway[aria-checked=\"true\"] {\n  	background-color: var(--background-modifier-selected);\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySourceLabelHeader,\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySourceDesc {\n  	color: var(--header-primary);\n}\n\n[data-theme=\"discord\"] .colorways-badge {\n  	height: 16px;\n  	padding: 0 4px;\n  	border-radius: 4px;\n  	flex: 0 0 auto;\n  	background: var(--bg-brand);\n  	color: var(--white);\n  	text-transform: uppercase;\n  	vertical-align: top;\n  	display: inline-flex;\n  	align-items: start;\n  	text-indent: 0;\n  	font-weight: 600;\n  	font-size: 12px;\n  	line-height: 12px;\n}\n\n.colorwaysModal[data-theme=\"discord\"] {\n  	box-shadow: var(--legacy-elevation-border), var(--legacy-elevation-high);\n  	background-color: var(--modal-background);\n  	border-radius: 4px;\n  	display: flex;\n  	flex-direction: column;\n  	margin: 0 auto;\n  	pointer-events: all;\n  	position: relative;\n}\n\n[data-theme=\"discord\"] .colorwaysMenuTabs {\n  	padding-bottom: 16px;\n}\n\n[data-theme=\"discord\"] .colorwaysMenuTab {\n  	padding: 0;\n  	padding-bottom: 16px;\n  	margin-right: 32px;\n  	margin-bottom: -2px;\n  	border-bottom: 2px solid transparent;\n  	transition: none;\n  	border-radius: 0;\n  	background-color: transparent !important;\n  	font-size: 16px;\n  	line-height: 20px;\n  	cursor: pointer;\n  	font-weight: 500;\n}\n\n[data-theme=\"discord\"] .colorwaysMenuTab:hover {\n  	color: var(--interactive-hover);\n  	border-bottom-color: var(--brand-500);\n}\n\n[data-theme=\"discord\"] .colorwaysMenuTab.active {\n  	cursor: default;\n  	color: var(--interactive-active);\n  	border-bottom-color: var(--control-brand-foreground);\n}\n\n[data-theme=\"discord\"] .colorwaysModalFooter {\n  	border-radius: 0 0 5px 5px;\n  	background-color: var(--modal-footer-background);\n  	padding: 16px;\n  	box-shadow: inset 0 1px 0 hsl(var(--primary-630-hsl) / 60%);\n  	gap: 0;\n  	width: unset;\n}\n\n.theme-light [data-theme=\"discord\"] > .colorwaysModalFooter {\n  	box-shadow: inset 0 1px 0 hsl(var(--primary-100-hsl) / 60%);\n}\n\n[data-theme=\"discord\"] .colorwaysModalFooter > .colorwaysPillButton {\n  	margin-left: 8px;\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysPillButton {\n  	border-radius: 8px;\n  	transition-duration: .3s;\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysPillButton:not(.colorwaysPillButton-outlined) {\n  	border: 1px solid rgba(255,255,255,10%) !important;\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton-md {\n  	height: var(--custom-button-button-md-height);\n  	min-width: var(--custom-button-button-md-width);\n  	min-height: var(--custom-button-button-md-height);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton-lg {\n  	height: var(--custom-button-button-lg-height);\n  	min-width: var(--custom-button-button-lg-width);\n  	min-height: var(--custom-button-button-lg-height);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton-xl {\n  	height: var(--custom-button-button-xl-height);\n  	min-width: var(--custom-button-button-xl-width);\n  	min-height: var(--custom-button-button-xl-height);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton-tn {\n  	height: var(--custom-button-button-tn-height);\n  	min-width: var(--custom-button-button-tn-width);\n  	min-height: var(--custom-button-button-tn-height);\n}\n\n[data-theme=\"discord\"] .colorwaysModalHeader {\n  	box-shadow:\n  			0 1px 0 0 hsl(var(--primary-800-hsl) / 30%),\n  			0 1px 2px 0 hsl(var(--primary-800-hsl) / 30%);\n  	border-radius: 4px 4px 0 0;\n  	transition: box-shadow 0.1s ease-out;\n  	word-wrap: break-word;\n  	font-family: var(--font-display);\n  	font-size: 20px;\n  	line-height: 1.2;\n  	font-weight: 600;\n}\n\n.theme-light [data-theme=\"discord\"] .colorwaysModalHeader {\n  	box-shadow: 0 1px 0 0 hsl(var(--primary-300-hsl)/ 30%);\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySourceLabel,\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySourceLabelHeader,\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySourceDesc {\n  	color: var(--header-primary);\n}\n\n[data-theme=\"discord\"] .colorwaysCreator-setting,\n[data-theme=\"discord\"] .colorwaysCreator-settingCat {\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n}\n\n[data-theme=\"discord\"] .colorwaysCreator-setting:hover {\n  	background-color: var(--background-modifier-hover);\n}\n\n[data-theme=\"discord\"] .colorwaysContextMenu,\n.colorwaysContextMenu[data-theme=\"discord\"] {\n  	background: var(--background-floating);\n  	box-shadow: var(--shadow-high);\n  	border-radius: 4px;\n  	padding: 6px 8px;\n  	border: none;\n  	gap: 0;\n  	min-width: 188px;\n  	max-width: 320px;\n  	box-sizing: border-box;\n}\n\n[data-theme=\"discord\"] .colorwaysContextMenuItm {\n  	border: none;\n  	transition: none;\n  	margin: 2px 0;\n  	border-radius: 2px;\n  	font-size: 14px;\n  	font-weight: 500;\n  	line-height: 18px;\n  	color: var(--interactive-normal);\n  	background-color: transparent;\n}\n\n[data-theme=\"discord\"] .colorwaysContextMenuItm:hover {\n  	background-color: var(--menu-item-default-hover-bg);\n  	color: var(--white);\n}\n\n[data-theme=\"discord\"] .colorwaysContextMenuItm:active {\n  	background-color: var(--menu-item-default-active-bg);\n  	color: var(--white);\n}\n\n[data-theme=\"discord\"] .colorwaysRadioSelected {\n  	fill: var(--control-brand-foreground-new);\n}\n\n[data-theme=\"discord\"] .colorwaysConflictingColors-warning {\n  	color: var(--text-normal);\n}\n\n[data-theme=\"discord\"] .colorwaysManagerConnectionMenu {\n  	transition:\n  			transform 0.1s ease,\n  			opacity 0.1s ease !important;\n  	transform: scale(0.95);\n  	transform-origin: 0% 50%;\n  	background-color: var(--background-floating);\n  	box-shadow: var(--shadow-high);\n  	color: var(--text-normal);\n  	border: none;\n  	border-radius: 5px;\n}\n\n.colorwayIDCard[data-theme=\"discord\"] > .colorwayMessage {\n  	border-radius: 5px;\n  	border: none;\n  	background-color: var(--background-secondary);\n}\n\n.theme-dark .colorwayIDCard[data-theme=\"discord\"] .colorwayMessage {\n  	background: hsl(var(--primary-630-hsl) / 60%);\n}\n\n.theme-light .colorwayIDCard[data-theme=\"discord\"] .colorwayMessage {\n  	background: hsl(var(--primary-100-hsl) / 60%);\n}\n\n[data-theme=\"discord\"] .colorwaysManagerConnectionValue {\n  	color: var(--text-muted);\n}\n\n[data-theme=\"discord\"] .colorwaysManagerConnectionValue > b {\n  	color: var(--text-normal);\n}\n\n.visual-refresh .colorwaySelectorModal[data-theme=\"discord\"],\n.colorwaySelectorModal[data-theme=\"discord\"].visual-refresh {\n  	border-radius: var(--radius-md);\n  	background-color: var(--bg-base-primary);\n  	border: 1px solid var(--border-subtle);\n}\n\n.visual-refresh .colorwaySelectorModal[data-theme=\"discord\"] > .colorwaySelectorSidebar,\n.colorwaySelectorModal[data-theme=\"discord\"].visual-refresh > .colorwaySelectorSidebar {\n  	border-top-left-radius: var(--radius-md);\n  	border-bottom-left-radius: var(--radius-md);\n  	background: var(--bg-overlay-3,var(--bg-base-tertiary));\n  	margin-right: 0;\n}\n\n.visual-refresh .colorwaySelectorModal[data-theme=\"discord\"] .colorwaySelectorSidebar-tab,\n.colorwaySelectorModal[data-theme=\"discord\"].visual-refresh .colorwaySelectorSidebar-tab {\n  	border-radius: 8px;\n  	border: 1px solid transparent;\n  	transition:\n  			background-color 0.1s ease-in-out,\n  			border-color 0.1s ease-in-out;\n}\n\n.visual-refresh .colorwaySelectorModal[data-theme=\"discord\"] .colorwaySelectorSidebar-tab.active,\n.colorwaySelectorModal[data-theme=\"discord\"].visual-refresh .colorwaySelectorSidebar-tab.active {\n  	background: var(--bg-overlay-1, var(--bg-surface-raised));\n  	border-color: var(--border-faint);\n}\n\n.visual-refresh [data-theme=\"discord\"] .discordColorway,\n.visual-refresh [data-theme=\"discord\"] .colorwaysSettings-colorwaySource {\n  	background: var(--bg-mod-faint);\n  	border-radius: 8px;\n  	border: 1px solid rgba(255,255,255,10%) !important;\n  	transition:\n  			background-color 0.1s ease-in-out,\n  			border-color 0.1s ease-in-out;\n}\n\n.visual-refresh [data-theme=\"discord\"] .discordColorway:hover,\n.visual-refresh [data-theme=\"discord\"] .discordColorway:focus,\n.visual-refresh [data-theme=\"discord\"] .colorwaysSettings-colorwaySource:hover {\n  	background: var(--bg-mod-subtle);\n}\n\n.visual-refresh [data-theme=\"discord\"] .discordColorway[aria-checked=\"true\"] {\n  	border-color: var(--border-faint);\n  	background: var(--bg-mod-strong);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwayTextBox {\n  	background: rgba(0,0,0,8%) !important;\n  	border-radius: 8px;\n  	transition: border-color.2s ease-in-out;\n  	border: 1px solid var(--__temp-input-border);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwayTextBox:focus {\n  	border-color: var(--text-link);\n}\n\n[data-theme=\"discord\"] .colorwaysPageHeader {\n  	border-radius: 0;\n  	border-top-right-radius: 4px;\n  	padding-top: 16px;\n  	margin: 0;\n  	background-color: transparent;\n}\n\n[data-theme=\"discord\"] .colorwaySelectorModal {\n  	border-radius: 4px;\n}\n\n[data-theme=\"discord\"] .colorwaysMenuHeader {\n  	text-decoration: none;\n  	color: var(--interactive-normal);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysContextMenu,\n.visual-refresh .colorwaysContextMenu[data-theme=\"discord\"] {\n  	background-color: var(--background-surface-higher);\n  	border-radius: 8px;\n  	border: 1px solid var(--border-subtle);\n  	box-shadow: var(--shadow-high);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysContextMenuItm {\n  	border-radius: 4px;\n  	margin: 0;\n  	padding: 8px;\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysContextMenuItm:hover,\n.visual-refresh [data-theme=\"discord\"] .colorwaysContextMenuItm:active {\n  	background-color: var(--bg-mod-subtle);\n  	color: var(--header-primary);\n}\n\n[data-theme=\"discord\"] .colorwaysContextMenuItm-danger {\n  	color: var(--status-danger);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysContextMenuItm-danger {\n  	color: var(--text-danger);\n}\n\n[data-theme=\"discord\"] .colorwaysContextMenuItm-danger:hover {\n  	background-color: var(--menu-item-danger-hover-bg);\n  	color: var(--white);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysContextMenuItm-danger:hover {\n  	background-color: var(--info-danger-background);\n  	color: var(--text-danger);\n}\n\n[data-theme=\"discord\"] .colorwaysContextMenuItm:hover > svg {\n  	color: var(--white);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysContextMenuItm > svg {\n  	width: 20px;\n  	height: 20px;\n}\n\n[data-theme=\"discord\"] .colorwaysContextMenuColor {\n  	border-radius: 4px;\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysContextMenuColor {\n  	border-radius: 8px;\n}\n\n.colorwaysRadioIndicator-redesign {\n  	box-sizing: border-box;\n  	width: 20px;\n  	height: 20px;\n  	border-radius: 50%;\n  	background: transparent;\n  	display: none;\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysRadioIndicator-redesign {\n  	display: inline;\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysRadioIndicator {\n  	display: none;\n}\n\n.visual-refresh [data-theme=\"discord\"] .dc-menu-caret {\n  	width: 20px;\n  	height: 20px;\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysModalContent {\n  	padding: var(--spacing-24);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysModalFooter {\n  	padding-left: var(--spacing-24);\n  	padding-right: var(--spacing-24);\n  	padding-top: 0;\n  	background: none;\n  	box-shadow: none;\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysModalHeader {\n  	box-shadow: none;\n  	padding-bottom: 0;\n}\n\n.visual-refresh .colorwaysModal[data-theme=\"discord\"],\n.colorwaysModal[data-theme=\"discord\"].visual-refresh {\n  	background-color: var(--background-surface-high);\n  	border-radius: var(--radius-md);\n  	border: 1px solid var(--border-subtle);\n}\n\n[data-theme=\"discord\"] .colorwaysModalFieldHeader {\n  	font-family: var(--font-display);\n  	font-size: 12px;\n  	line-height: 1.3333;\n  	font-weight: 700;\n  	text-transform: uppercase;\n  	letter-spacing: .02em;\n  	color: var(--header-secondary);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysModalFieldHeader {\n  	color: var(--header-primary);\n  	font-size: 16px;\n  	line-height: 20px;\n  	font-weight: 500;\n  	margin-bottom: 8px;\n  	text-transform: capitalize;\n}\n\n[data-theme=\"discord\"] .colorwaysModalFieldHeader-error {\n  	color: var(--text-danger);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysSettings-switch {\n  	height: 32px;\n  	border-radius: 16px;\n  	width: 48px;\n  	box-sizing: border-box;\n  	border: 1px solid transparent;\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysSettings-switch.checked {\n  	border-color: var(--__temp-input-border);\n  	background-color: var(--brand-500);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysSettings-switchHandle {\n  	height: 24px;\n}\n\n[data-theme=\"discord\"] .colorwaysFeatureIconContainer {\n  	background-color: var(--modal-footer-background);\n}\n";

const defaultColorwaySource = "https://raw.githubusercontent.com/ProjectColorway/ProjectColorway/master/index.json";
const knownThemeVars = {
	"Cyan": {
		variable: "--cyan-accent-color",
		accent: "--cyan-accent-color",
		primary: "--cyan-background-primary",
		secondary: "--cyan-background-secondary"
	},
	"Virtual Boy": {
		variable: "--VBaccent",
		tertiary: "--VBaccent-muted",
		alt: {
			tertiary: "--VBaccent-dimmest"
		}
	},
	"Modular": {
		variable: "--modular-hue",
		accentVariables: {
			h: "--modular-hue",
			s: "--modular-saturation",
			l: "--modular-lightness"
		}
	},
	"Solana": {
		variable: "--accent-hue",
		accentVariables: {
			h: "--accent-hue",
			s: "--accent-saturation",
			l: "--accent-brightness"
		},
		primaryVariables: {
			h: "--background-accent-hue",
			s: "--background-accent-saturation",
			l: "--background-accent-brightness"
		}
	}
};
const nullColorwayObj = { id: null, sourceType: null, source: null, colors: { accent: "", primary: "", secondary: "", tertiary: "" } };
const colorProps = [
	{
		name: "Accent",
		id: "accent"
	},
	{
		name: "Primary",
		id: "primary"
	},
	{
		name: "Secondary",
		id: "secondary"
	},
	{
		name: "Tertiary",
		id: "tertiary"
	}
];
const colorPickerProps = {
	suggestedColors: [
		"#313338",
		"#2b2d31",
		"#1e1f22",
		"#5865f2"
	],
	showEyeDropper: true
};

async function defaultsLoader() {
	const [
		customColorways,
		colorwaySourceFiles,
		showColorwaysButton,
		activeColorwayObject,
		colorwaysPluginTheme,
		colorwaysBoundManagers,
		colorwaysManagerAutoconnectPeriod,
		colorwaysManagerDoAutoconnect,
		colorwaysPreset,
		colorwaysForceVR,
		activeAutoPreset,
		colorwayUsageMetrics
	] = await DataStore.getMany([
		"customColorways",
		"colorwaySourceFiles",
		"showColorwaysButton",
		"activeColorwayObject",
		"colorwaysPluginTheme",
		"colorwaysBoundManagers",
		"colorwaysManagerAutoconnectPeriod",
		"colorwaysManagerDoAutoconnect",
		"colorwaysPreset",
		"colorwaysForceVR",
		"activeAutoPreset",
		"colorwayUsageMetrics"
	]);
	[
		{
			name: "colorwaysManagerAutoconnectPeriod",
			value: colorwaysManagerAutoconnectPeriod,
			default: 3e3
		},
		{
			name: "colorwaysManagerDoAutoconnect",
			value: colorwaysManagerDoAutoconnect,
			default: true
		},
		{
			name: "showColorwaysButton",
			value: showColorwaysButton,
			default: false
		},
		{
			name: "colorwaysBoundManagers",
			value: colorwaysBoundManagers,
			default: []
		},
		{
			name: "activeColorwayObject",
			value: activeColorwayObject,
			default: nullColorwayObj
		},
		{
			name: "colorwaysPluginTheme",
			value: colorwaysPluginTheme,
			default: "discord"
		},
		{
			name: "colorwaysPreset",
			value: colorwaysPreset,
			default: "default"
		},
		{
			name: "colorwaysForceVR",
			value: colorwaysForceVR,
			default: false
		},
		{
			name: "activeAutoPreset",
			value: activeAutoPreset,
			default: "hueRotation"
		},
		{
			name: "colorwayUsageMetrics",
			value: colorwayUsageMetrics,
			default: []
		}
	].forEach(({ name, value, default: def }) => {
		if (!value) DataStore.set(name, def);
	});
	if (customColorways && Array.isArray(customColorways) && customColorways.length) {
		if (typeof customColorways[0] !== "object" || !Object.keys(customColorways[0]).includes("colorways")) {
			DataStore.set("customColorways", [{ name: "Custom", colorways: customColorways }]);
		}
	} else {
		DataStore.set("customColorways", []);
	}
	if (colorwaySourceFiles) {
		if (typeof colorwaySourceFiles[0] === "string") {
			DataStore.set("colorwaySourceFiles", colorwaySourceFiles.map((sourceURL, i) => {
				return { name: sourceURL === defaultColorwaySource ? "Project Colorway" : `Source #${i}`, url: sourceURL === "https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json" ? defaultColorwaySource : sourceURL };
			}));
		}
	} else {
		DataStore.set("colorwaySourceFiles", [{
			name: "Project Colorway",
			url: defaultColorwaySource
		}]);
	}
}

const ColorwayCSS = {
	get: () => document.getElementById("activeColorwayCSS").textContent || "",
	set: (e) => {
		if (!document.getElementById("activeColorwayCSS")) {
			document.head.append(Object.assign(document.createElement("style"), {
				id: "activeColorwayCSS",
				textContent: e
			}));
		} else document.getElementById("activeColorwayCSS").textContent = e;
	},
	remove: () => document.getElementById("activeColorwayCSS")?.remove()
};

const contexts = {
	colorwaysPluginTheme: "discord",
	colorwaysForceVR: false,
	colorwaySourceFiles: [],
	customColorways: [],
	activeColorwayObject: nullColorwayObj,
	activeAutoPreset: "hueRotation",
	colorwayData: [],
	showColorwaysButton: false,
	colorwayUsageMetrics: [],
	colorwaysManagerDoAutoconnect: true,
	colorwaysPreset: "default",
	colorwaysManagerAutoconnectPeriod: 3e3
};
async function initContexts() {
	const [
		colorwaysForceVR,
		colorwaysPluginTheme,
		customColorways,
		colorwaySourceFiles,
		activeColorwayObject,
		activeAutoPreset,
		showColorwaysButton,
		colorwayUsageMetrics,
		colorwaysManagerDoAutoconnect,
		colorwaysPreset,
		colorwaysManagerAutoconnectPeriod
	] = await DataStore.getMany([
		"colorwaysForceVR",
		"colorwaysPluginTheme",
		"customColorways",
		"colorwaySourceFiles",
		"activeColorwayObject",
		"activeAutoPreset",
		"showColorwaysButton",
		"colorwayUsageMetrics",
		"colorwaysManagerDoAutoconnect",
		"colorwaysPreset",
		"colorwaysManagerAutoconnectPeriod"
	]);
	contexts.colorwaysPluginTheme = colorwaysPluginTheme;
	contexts.colorwaysForceVR = colorwaysForceVR;
	contexts.customColorways = customColorways;
	contexts.colorwaySourceFiles = colorwaySourceFiles;
	contexts.activeColorwayObject = activeColorwayObject;
	contexts.activeAutoPreset = activeAutoPreset;
	contexts.showColorwaysButton = showColorwaysButton;
	contexts.colorwayUsageMetrics = colorwayUsageMetrics;
	contexts.colorwaysManagerDoAutoconnect = colorwaysManagerDoAutoconnect;
	contexts.colorwaysPreset = colorwaysPreset;
	contexts.colorwaysManagerAutoconnectPeriod = colorwaysManagerAutoconnectPeriod;
	const responses = await Promise.all(
		colorwaySourceFiles.map(
			(source) => fetch(source.url)
		)
	);
	contexts.colorwayData = await Promise.all(
		responses.map((res, i) => ({ response: res, name: colorwaySourceFiles[i].name })).map(
			(res) => res.response.json().then((dt) => ({ colorways: dt.colorways, source: res.name, type: "online" })).catch(() => ({ colorways: [], source: res.name, type: "online" }))
		)
	);
	return contexts;
}
function setContext(context, value, save = true) {
	contexts[context] = value;
	save && DataStore.set(context, value);
	return value;
}
async function refreshSources() {
	const responses = await Promise.all(
		contexts.colorwaySourceFiles.map(
			(source) => fetch(source.url)
		)
	);
	contexts.colorwayData = await Promise.all(
		responses.map((res, i) => ({ response: res, name: contexts.colorwaySourceFiles[i].name })).map(
			(res) => res.response.json().then((dt) => ({ colorways: dt.colorways, source: res.name, type: "online" })).catch(() => ({ colorways: [], source: res.name, type: "online" }))
		)
	);
}

function HexToHSL(H) {
	let r = 0, g = 0, b = 0;
	if (H.length === 4) r = "0x" + H[1] + H[1], g = "0x" + H[2] + H[2], b = "0x" + H[3] + H[3];
	else if (H.length === 7) {
		r = "0x" + H[1] + H[2];
		g = "0x" + H[3] + H[4];
		b = "0x" + H[5] + H[6];
	}
	r /= 255, g /= 255, b /= 255;
	var cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;
	if (delta === 0) h = 0;
	else if (cmax === r) h = (g - b) / delta % 6;
	else if (cmax === g) h = (b - r) / delta + 2;
	else h = (r - g) / delta + 4;
	h = Math.round(h * 60);
	if (h < 0) h += 360;
	l = (cmax + cmin) / 2;
	s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
	s = +(s * 100).toFixed(1);
	l = +(l * 100).toFixed(1);
	return [Math.round(h), Math.round(s), Math.round(l)];
}
const stringToHex = (str) => {
	let hex = "";
	for (let i = 0; i < str.length; i++) {
		const charCode = str.charCodeAt(i);
		const hexValue = charCode.toString(16);
		hex += hexValue.padStart(2, "0");
	}
	return hex;
};
const hexToString = (hex) => {
	let str = "";
	for (let i = 0; i < hex.length; i += 2) {
		const hexValue = hex.substr(i, 2);
		const decimalValue = parseInt(hexValue, 16);
		str += String.fromCharCode(decimalValue);
	}
	return str;
};
function getHex(str) {
	const color = Object.assign(
		document.createElement("canvas").getContext("2d"),
		{ fillStyle: str }
	).fillStyle;
	if (color.includes("rgba(")) {
		return getHex(String([...color.split(",").slice(0, 3), ")"]).replace(",)", ")").replace("a", ""));
	} else {
		return color;
	}
}
function getFontOnBg(bgColor) {
	var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
	var r = parseInt(color.substring(0, 2), 16);
	var g = parseInt(color.substring(2, 4), 16);
	var b = parseInt(color.substring(4, 6), 16);
	return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#ffffff";
}
function hslToHex(h, s, l) {
	h /= 360;
	s /= 100;
	l /= 100;
	let r, g, b;
	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p2, q2, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
			if (t < 1 / 2) return q2;
			if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
			return p2;
		};
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	const toHex = (x) => {
		const hex = Math.round(x * 255).toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	};
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function rgbToHex(r, g, b) {
	const toHex = (x) => {
		const hex = Math.round(x * 255).toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	};
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function colorToHex(color) {
	var colorType = "hex";
	if (color.includes("hsl")) {
		colorType = "hsl";
	} else if (color.includes("rgb")) {
		colorType = "rgb";
	}
	color = color.replaceAll(",", "").replace(/.+?\(/, "").replace(")", "").replaceAll(/[ \t]+\/[ \t]+/g, " ").replaceAll("%", "").replaceAll("/", "");
	if (colorType === "hsl") {
		color = hslToHex(Number(color.split(" ")[0]), Number(color.split(" ")[1]), Number(color.split(" ")[2]));
	}
	if (colorType === "rgb") {
		color = rgbToHex(Number(color.split(" ")[0]), Number(color.split(" ")[1]), Number(color.split(" ")[2]));
	}
	return color.replace("#", "");
}
function compareColorwayObjects(obj1, obj2) {
	return obj1.id === obj2.id && obj1.source === obj2.source && obj1.sourceType === obj2.sourceType && obj1.colors.accent === obj2.colors.accent && obj1.colors.primary === obj2.colors.primary && obj1.colors.secondary === obj2.colors.secondary && obj1.colors.tertiary === obj2.colors.tertiary;
}
function chooseFile(mimeTypes) {
	return new Promise((resolve) => {
		const input = document.createElement("input");
		input.type = "file";
		input.style.display = "none";
		input.accept = mimeTypes;
		input.onchange = async () => {
			resolve(input.files?.[0] ?? null);
		};
		document.body.appendChild(input);
		input.click();
		setImmediate(() => document.body.removeChild(input));
	});
}
function saveFile(file) {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(file);
	a.download = file.name;
	document.body.appendChild(a);
	a.click();
	setImmediate(() => {
		URL.revokeObjectURL(a.href);
		document.body.removeChild(a);
	});
}
function classes(...classes2) {
	return classes2.filter(Boolean).join(" ");
}
function getWsClientIdentity() {
	switch (PluginProps.clientMod) {
		case "Vencord":
			return "vencord";
		case "BetterDiscord":
			return "betterdiscord";
		default:
			return "discord";
	}
}
const Clipboard = {
	copy: (text) => DiscordNative ? DiscordNative.clipboard.copy(text) : navigator.clipboard.writeText(text)
};

function Icon({ height = 24, width = 24, className, children, viewBox, ...svgProps }) {
	return BdApi.React.createElement(
		"svg",
		{
			className: classes(className, "dc-icon"),
			role: "img",
			width,
			height,
			viewBox,
			...svgProps
		},
		children
	);
}
function WirelessIcon({ height = 24, width = 24, className, ...svgProps }) {
	return BdApi.React.createElement(
		Icon,
		{
			width,
			height,
			viewBox: "0 0 24 24",
			...svgProps
		},
		BdApi.React.createElement("path", { fill: "currentColor", d: "M2 3a1 1 0 0 1 1-1 19 19 0 0 1 19 19 1 1 0 1 1-2 0A17 17 0 0 0 3 4a1 1 0 0 1-1-1Z" }),
		BdApi.React.createElement("path", { fill: "currentColor", d: "M2 8a1 1 0 0 1 1-1 14 14 0 0 1 14 14 1 1 0 1 1-2 0A12 12 0 0 0 3 9a1 1 0 0 1-1-1Z" }),
		BdApi.React.createElement("path", { fill: "currentColor", d: "M3 12a1 1 0 1 0 0 2 7 7 0 0 1 7 7 1 1 0 1 0 2 0 9 9 0 0 0-9-9ZM2 17.83c0-.46.37-.83.83-.83C5.13 17 7 18.87 7 21.17c0 .46-.37.83-.83.83H3a1 1 0 0 1-1-1v-3.17Z" })
	);
}
function CopyIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-copy-icon"),
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement("g", { fill: "currentColor" }, BdApi.React.createElement("path", { d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z" }), BdApi.React.createElement("path", { d: "M15 5H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z" }))
	);
}
function OpenExternalIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-open-external-icon"),
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement(
			"polygon",
			{
				fill: "currentColor",
				fillRule: "nonzero",
				points: "13 20 11 20 11 8 5.5 13.5 4.08 12.08 12 4.16 19.92 12.08 18.5 13.5 13 8"
			}
		)
	);
}
function DeleteIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-delete-icon"),
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				d: "M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"
			}
		),
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				d: "M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"
			}
		)
	);
}
function PlusIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-plus-icon"),
			viewBox: "0 0 18 18"
		},
		BdApi.React.createElement(
			"polygon",
			{
				"fill-rule": "nonzero",
				fill: "currentColor",
				points: "15 10 10 10 10 15 8 15 8 10 3 10 3 8 8 8 8 3 10 3 10 8 15 8"
			}
		)
	);
}
function PalleteIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-pallete-icon"),
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				d: "M 12,0 C 5.3733333,0 0,5.3733333 0,12 c 0,6.626667 5.3733333,12 12,12 1.106667,0 2,-0.893333 2,-2 0,-0.52 -0.2,-0.986667 -0.52,-1.346667 -0.306667,-0.346666 -0.506667,-0.813333 -0.506667,-1.32 0,-1.106666 0.893334,-2 2,-2 h 2.36 C 21.013333,17.333333 24,14.346667 24,10.666667 24,4.7733333 18.626667,0 12,0 Z M 4.6666667,12 c -1.1066667,0 -2,-0.893333 -2,-2 0,-1.1066667 0.8933333,-2 2,-2 1.1066666,0 2,0.8933333 2,2 0,1.106667 -0.8933334,2 -2,2 z M 8.666667,6.6666667 c -1.106667,0 -2.0000003,-0.8933334 -2.0000003,-2 0,-1.1066667 0.8933333,-2 2.0000003,-2 1.106666,0 2,0.8933333 2,2 0,1.1066666 -0.893334,2 -2,2 z m 6.666666,0 c -1.106666,0 -2,-0.8933334 -2,-2 0,-1.1066667 0.893334,-2 2,-2 1.106667,0 2,0.8933333 2,2 0,1.1066666 -0.893333,2 -2,2 z m 4,5.3333333 c -1.106666,0 -2,-0.893333 -2,-2 0,-1.1066667 0.893334,-2 2,-2 1.106667,0 2,0.8933333 2,2 0,1.106667 -0.893333,2 -2,2 z"
			}
		)
	);
}
function DownloadIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-download-icon"),
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				d: "M12 2a1 1 0 0 1 1 1v10.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V3a1 1 0 0 1 1-1ZM3 20a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2H3Z"
			}
		)
	);
}
function ImportIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-import-icon"),
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				d: "M.9 3a.9.9 0 0 1 .892.778l.008.123v16.201a.9.9 0 0 1-1.792.121L0 20.102V3.899A.9.9 0 0 1 .9 3Zm14.954 2.26.1-.112a1.2 1.2 0 0 1 1.584-.1l.113.1 5.998 5.998a1.2 1.2 0 0 1 .1 1.584l-.1.112-5.997 6.006a1.2 1.2 0 0 1-1.799-1.584l.1-.113 3.947-3.954H4.8a1.2 1.2 0 0 1-1.191-1.06l-.008-.14a1.2 1.2 0 0 1 1.06-1.192l.14-.008h15.103l-3.95-3.952a1.2 1.2 0 0 1-.1-1.585l.1-.112z"
			}
		)
	);
}
function IDIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			viewBox: "0 0 24 24",
			className: classes(props.className, "dc-id-icon"),
			fillRule: "evenodd",
			clipRule: "evenodd"
		},
		BdApi.React.createElement("path", { fill: "currentColor", d: "M15.3 14.48c-.46.45-1.08.67-1.86.67h-1.39V9.2h1.39c.78 0 1.4.22 1.86.67.46.45.68 1.22.68 2.31 0 1.1-.22 1.86-.68 2.31Z" }),
		BdApi.React.createElement("path", { fill: "currentColor", "fill-rule": "evenodd", d: "M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm1 15h2.04V7.34H6V17Zm4-9.66V17h3.44c1.46 0 2.6-.42 3.38-1.25.8-.83 1.2-2.02 1.2-3.58s-.4-2.75-1.2-3.58c-.79-.83-1.92-1.25-3.38-1.25H10Z", "clip-rule": "evenodd" })
	);
}
function CodeIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-code-icon"),
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				d: "M9.6 7.8 4 12l5.6 4.2a1 1 0 0 1 .4.8v1.98c0 .21-.24.33-.4.2l-8.1-6.4a1 1 0 0 1 0-1.56l8.1-6.4c.16-.13.4-.01.4.2V7a1 1 0 0 1-.4.8ZM14.4 7.8 20 12l-5.6 4.2a1 1 0 0 0-.4.8v1.98c0 .21.24.33.4.2l8.1-6.4a1 1 0 0 0 0-1.56l-8.1-6.4a.25.25 0 0 0-.4.2V7a1 1 0 0 0 .4.8Z"
			}
		)
	);
}
function PencilIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-pencil-icon"),
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				d: "m13.96 5.46 4.58 4.58a1 1 0 0 0 1.42 0l1.38-1.38a2 2 0 0 0 0-2.82l-3.18-3.18a2 2 0 0 0-2.82 0l-1.38 1.38a1 1 0 0 0 0 1.42ZM2.11 20.16l.73-4.22a3 3 0 0 1 .83-1.61l7.87-7.87a1 1 0 0 1 1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-7.87 7.87a3 3 0 0 1-1.6.83l-4.23.73a1.5 1.5 0 0 1-1.73-1.73Z"
			}
		)
	);
}
function CaretIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-menu-caret"),
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement("path", { fill: "currentColor", d: "M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z" })
	);
}
function CogIcon(props) {
	props.style ??= {};
	props.style.contentVisibility = "visible";
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			viewBox: "0 0 24 24",
			className: classes(props.className, "dc-cog-icon"),
			preserveAspectRatio: "xMidYMid meet"
		},
		BdApi.React.createElement("path", { fill: "currentColor", "fill-rule": "evenodd", d: "M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z", "clip-rule": "evenodd" })
	);
}

function RightClickContextMenu({
	children,
	menu
}) {
	const [theme, setTheme] = React.useState(contexts.colorwaysPluginTheme);
	function Menu() {
		React.useEffect(() => {
			window.addEventListener("click", () => FluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" }));
			FluxDispatcher.subscribe("COLORWAYS_UPDATE_THEME", ({ theme: theme2 }) => setTheme(theme2));
			return () => {
				window.removeEventListener("click", () => FluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" }));
				FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_THEME", ({ theme: theme2 }) => setTheme(theme2));
			};
		}, []);
		return BdApi.React.createElement("nav", { "data-theme": theme, className: "colorwaysContextMenu" }, menu);
	}
	return BdApi.React.createElement(BdApi.React.Fragment, null, children({
		onContextMenu: (e) => {
			ContextMenuApi.openContextMenu(e, () => BdApi.React.createElement(Menu, null));
		}
	}));
}

const PrimarySatDiffs = {
	130: 63.9594,
	160: 49.4382,
	200: 37.5758,
	230: 30.3797,
	260: 22.5166,
	300: 32.5,
	330: 27.0968,
	345: 22.5166,
	360: 18.9189,
	400: -14.4,
	430: -33.0435,
	460: 25.2101,
	500: -11.0236,
	530: -3.0303,
	645: 7.40741,
	660: 3.0303,
	730: 11.9403,
	800: 25
};
const BrandSatDiffs = {
	100: -9.54712,
	130: 2.19526,
	160: -1.17509,
	200: -2.72351,
	230: 1.62225,
	260: 0.698487,
	300: 0.582411,
	330: -0.585823,
	345: -0.468384,
	360: 0.582411,
	400: 0.582411,
	430: 0.116754,
	460: -0.116891,
	530: -24.8194,
	560: -49.927,
	600: -58.8057,
	630: -58.8057,
	660: -58.0256,
	700: -58.2202,
	730: -58.6103,
	760: -58.4151,
	800: -57.2502,
	830: -57.4436,
	860: -58.4151,
	900: -52.5074
};
const BrandLightDiffs = {
	100: 33.5,
	130: 32.2,
	160: 30.2,
	200: 28.2,
	230: 26.2999,
	260: 23.8999,
	300: 21.2,
	330: 16.8999,
	345: 14.0999,
	360: 12.7999,
	400: 7.0999,
	430: 5.0999,
	460: 2.7999,
	530: -5.9,
	560: -12.3,
	600: -20.6,
	630: -26.5,
	660: -31.4,
	700: -38.8,
	730: -40.4,
	760: -42.5,
	800: -45.3,
	830: -49.8,
	860: -55.1,
	900: -61.6
};
function gradientBase(colors, tintedText = true, discordSaturation = true, mutedTextBrightness, name) {
	colors.primary ??= "#313338";
	colors.secondary ??= "#2b2d31";
	colors.tertiary ??= "#1e1f22";
	colors.accent ??= "#ffffff";
	colors.primary.replace("#", "");
	colors.secondary.replace("#", "");
	colors.tertiary.replace("#", "");
	colors.accent.replace("#", "");
	return `@import url(//dablulite.github.io/css-snippets/NitroThemesFix/import.css);
${generateCss({ ...colors, primary: hslToHex(HexToHSL(colors.primary)[0], HexToHSL(colors.primary)[1] === 0 ? 0 : 24, 17), secondary: hslToHex(HexToHSL(colors.secondary)[0], HexToHSL(colors.secondary)[1] === 0 ? 0 : 24, 12), tertiary: hslToHex(HexToHSL(colors.tertiary)[0], HexToHSL(colors.tertiary)[1] === 0 ? 0 : 24, 7) }, tintedText, discordSaturation, mutedTextBrightness, name)}
.theme-dark {
		--bg-overlay-color: 0 0 0;
		--bg-overlay-color-inverse: 255 255 255;
		--bg-overlay-opacity-1: 0.85;
		--bg-overlay-opacity-2: 0.8;
		--bg-overlay-opacity-3: 0.7;
		--bg-overlay-opacity-4: 0.5;
		--bg-overlay-opacity-5: 0.4;
		--bg-overlay-opacity-6: 0.1;
		--bg-overlay-opacity-hover: 0.5;
		--bg-overlay-opacity-hover-inverse: 0.08;
		--bg-overlay-opacity-active: 0.45;
		--bg-overlay-opacity-active-inverse: 0.1;
		--bg-overlay-opacity-selected: 0.4;
		--bg-overlay-opacity-selected-inverse: 0.15;
		--bg-overlay-opacity-chat: 0.8;
		--bg-overlay-opacity-home: 0.85;
		--bg-overlay-opacity-home-card: 0.8;
		--bg-overlay-opacity-app-frame: var(--bg-overlay-opacity-4);
}
.theme-light {
		--bg-overlay-color: 255 255 255;
		--bg-overlay-color-inverse: 0 0 0;
		--bg-overlay-opacity-1: 0.9;
		--bg-overlay-opacity-2: 0.8;
		--bg-overlay-opacity-3: 0.7;
		--bg-overlay-opacity-4: 0.6;
		--bg-overlay-opacity-5: 0.3;
		--bg-overlay-opacity-6: 0.15;
		--bg-overlay-opacity-hover: 0.7;
		--bg-overlay-opacity-hover-inverse: 0.02;
		--bg-overlay-opacity-active: 0.65;
		--bg-overlay-opacity-active-inverse: 0.03;
		--bg-overlay-opacity-selected: 0.6;
		--bg-overlay-opacity-selected-inverse: 0.04;
		--bg-overlay-opacity-chat: 0.9;
		--bg-overlay-opacity-home: 0.7;
		--bg-overlay-opacity-home-card: 0.9;
		--bg-overlay-opacity-app-frame: var(--bg-overlay-opacity-5);
}
.children_fc4f04:after, .form_a7d72e:before {
		content: none;
}
.scroller_fea3ef {
		background: var(--bg-overlay-app-frame,var(--background-tertiary));
}
.expandedFolderBackground_bc7085 {
		background: rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-6));
}
.wrapper__8436d:not(:hover):not(.selected_ae80f7) .childWrapper_a6ce15 {
		background: rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-6));
}
.folder_bc7085:has(.expandedFolderIconWrapper_bc7085) {
		background: var(--bg-overlay-6,var(--background-secondary));
}
.circleIconButton_db6521:not(.selected_db6521) {
		background: rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-6));
}
.auto_eed6a8::-webkit-scrollbar-thumb,
.thin_eed6a8::-webkit-scrollbar-thumb {
		background-size: 200vh;
		background-image: -webkit-gradient(linear,left top,left bottom,from(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-4))),to(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-4)))),var(--custom-theme-background);
		background-image: linear-gradient(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-4)),rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-4))),var(--custom-theme-background);
}
.auto_eed6a8::-webkit-scrollbar-track {
		background-size: 200vh;
		background-image: -webkit-gradient(linear,left top,left bottom,from(rgb(var(--bg-overlay-color)/.4)),to(rgb(var(--bg-overlay-color)/.4))),var(--custom-theme-background);
		background-image: linear-gradient(rgb(var(--bg-overlay-color)/.4),rgb(var(--bg-overlay-color)/.4)),var(--custom-theme-background);
}
.wrapper_f90abb:not(:hover):not(.selected_f90abb) .childWrapper_f90abb {
		background: rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-6));
}
.theme-light .tooltip_b6c360 {
		--bg-overlay-color: 255 255 255;
		background: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-chat)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-chat))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover !important;
}
:root:root {
		--bg-overlay-1: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-1)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-1))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
		--bg-overlay-2: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-2)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-2))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
		--bg-overlay-3: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-3)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-3))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
		--bg-overlay-4: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-4)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-4))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
		--bg-overlay-5: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-5)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-5))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
		--bg-overlay-6: linear-gradient(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-6)),rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-6))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
		--bg-overlay-hover: linear-gradient(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-hover-inverse)),rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-hover-inverse))) fixed 0 0/cover,linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-hover)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-hover))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
		--bg-overlay-active: linear-gradient(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-active-inverse)),rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-active-inverse))) fixed 0 0/cover,linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-active)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-active))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
		--bg-overlay-selected: linear-gradient(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-selected-inverse)),rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-selected-inverse))) fixed 0 0/cover,linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-selected)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-selected))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
		--bg-overlay-chat: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-chat)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-chat))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
		--bg-overlay-home: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-home)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-home))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
		--bg-overlay-home-card: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-home-card)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-home-card))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
		--bg-overlay-app-frame: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-app-frame)),rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-app-frame))) fixed 0 0/cover,var(--custom-theme-background) fixed 0 0/cover;
}`;
}
function generateCss(colors, tintedText = true, discordSaturation = true, mutedTextBrightness, name) {
	colors.primary ??= "#313338";
	colors.secondary ??= "#2b2d31";
	colors.tertiary ??= "#1e1f22";
	colors.accent ??= "#ffffff";
	const primaryColor = colors.primary.replace("#", "");
	const secondaryColor = colors.secondary.replace("#", "");
	const tertiaryColor = colors.tertiary.replace("#", "");
	const accentColor = colors.accent.replace("#", "");
	return `/**
 * @name ${name}
 * @version ${PluginProps.CSSVersion}
 * @description Automatically generated Colorway.
 * @author ${exports.UserStore.getCurrentUser().username}
 * @authorId ${exports.UserStore.getCurrentUser().id}
 */
:root:root {
		--brand-100-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[100]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[100]) * 10) / 10, 0)};
		--blurple-1-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[100]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[100]) * 10) / 10, 0)};
		--brand-130-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[130]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[130]) * 10) / 10, 0)}%;
		--brand-160-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[160]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[160]) * 10) / 10, 0)}%;
		--brand-200-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[200]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[200]) * 10) / 10, 0)}%;
		--blurple-2-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[200]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[200]) * 10) / 10, 0)}%;
		--brand-230-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[230]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[230]) * 10) / 10, 0)}%;
		--blurple-5-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[230]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[230]) * 10) / 10, 0)}%;
		--brand-260-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[260]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[260]) * 10) / 10, 0)}%;
		--blurple-8-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[260]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[260]) * 10) / 10, 0)}%;
		--brand-300-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[300]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[300]) * 10) / 10, 0)}%;
		--blurple-13-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[300]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[300]) * 10) / 10, 0)}%;
		--brand-330-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[330]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[330]) * 10) / 10, 0)}%;
		--blurple-19-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[330]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[330]) * 10) / 10, 0)}%;
		--brand-345-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[345]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[345]) * 10) / 10, 0)}%;
		--blurple-23-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[345]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[345]) * 10) / 10, 0)}%;
		--brand-360-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[360]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[360]) * 10) / 10, 0)}%;
		--blurple-26-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[360]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[360]) * 10) / 10, 0)}%;
		--brand-400-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[400]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[400]) * 10) / 10, 0)}%;
		--blurple-37-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[400]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[400]) * 10) / 10, 0)}%;
		--brand-430-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[430]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[430]) * 10) / 10, 0)}%;
		--blurple-40-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[430]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[430]) * 10) / 10, 0)}%;
		--brand-460-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[460]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[460]) * 10) / 10, 0)}%;
		--blurple-44-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[460]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[460]) * 10) / 10, 0)}%;
		--brand-500-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${HexToHSL("#" + accentColor)[2]}%;
		--blurple-50-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${HexToHSL("#" + accentColor)[2]}%;
		--brand-530-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[530]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[530]) * 10) / 10, 100)}%;
		--blurple-53-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[530]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[530]) * 10) / 10, 100)}%;
		--brand-560-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[560]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[560]) * 10) / 10, 100)}%;
		--blurple-56-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[560]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[560]) * 10) / 10, 100)}%;
		--brand-600-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[600]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[600]) * 10) / 10, 100)}%;
		--blurple-61-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[600]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[600]) * 10) / 10, 100)}%;
		--brand-630-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[630]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[630]) * 10) / 10, 100)}%;
		--blurple-64-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[630]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[630]) * 10) / 10, 100)}%;
		--brand-660-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[660]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[660]) * 10) / 10, 100)}%;
		--blurple-68-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[660]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[660]) * 10) / 10, 100)}%;
		--brand-700-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[700]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[700]) * 10) / 10, 100)}%;
		--blurple-73-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[700]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[700]) * 10) / 10, 100)}%;
		--brand-730-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[730]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[730]) * 10) / 10, 100)}%;
		--blurple-75-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[730]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[730]) * 10) / 10, 100)}%;
		--brand-760-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[760]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[760]) * 10) / 10, 100)}%;
		--blurple-77-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[760]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[760]) * 10) / 10, 100)}%;
		--brand-800-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[800]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[800]) * 10) / 10, 100)}%;
		--blurple-79-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[800]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[800]) * 10) / 10, 100)}%;
		--brand-830-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[830]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[830]) * 10) / 10, 100)}%;
		--blurple-83-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[830]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[830]) * 10) / 10, 100)}%;
		--brand-860-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[860]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[860]) * 10) / 10, 100)}%;
		--blurple-90-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[860]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[860]) * 10) / 10, 100)}%;
		--brand-900-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[900]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[900]) * 10) / 10, 100)}%;
		--blurple-99-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[900]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[900]) * 10) / 10, 100)}%;
}
.theme-dark {
		--primary-800-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[800]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6 * 2, 0)}%;
		--neutral-84-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[800]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6 * 2, 0)}%;
		--primary-730-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[730]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6, 0)}%;
		--neutral-77-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[730]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6, 0)}%;
		--primary-700-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${HexToHSL("#" + tertiaryColor)[2]}%;
		--neutral-75-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${HexToHSL("#" + tertiaryColor)[2]}%;
		--primary-660-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[660]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.max(HexToHSL("#" + secondaryColor)[2] - 3.6, 0)}%;
		--neutral-72-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[660]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.max(HexToHSL("#" + secondaryColor)[2] - 3.6, 0)}%;
		--primary-645-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[645]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.max(HexToHSL("#" + secondaryColor)[2] - 1.1, 0)}%;
		--neutral-68-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[645]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.max(HexToHSL("#" + secondaryColor)[2] - 1.1, 0)}%;
		--primary-630-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${HexToHSL("#" + secondaryColor)[2]}%;
		--neutral-67-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${HexToHSL("#" + secondaryColor)[2]}%;
		--neutral-66-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${HexToHSL("#" + secondaryColor)[2] * 1.25}%;
		--primary-600-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%;
		--neutral-64-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1] - 1}%) ${HexToHSL("#" + primaryColor)[2] + 1}%;
		--neutral-63-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%;
		--primary-560-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6, 100)}%;
		--neutral-60-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6, 100)}%;
		--primary-530-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[530]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 2, 100)}%;
		--neutral-56-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[530]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 2, 100)}%;
		--primary-500-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[500]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%) ${mutedTextBrightness || Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 3, 100)}%;
		--neutral-50-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[500]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%) ${mutedTextBrightness || Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 3, 100)}%;
		--interactive-muted: hsl(${HexToHSL("#" + primaryColor)[0]} ${HexToHSL("#" + primaryColor)[1] / 2}% ${Math.max(Math.min(HexToHSL("#" + primaryColor)[2] - 5, 100), 45)}%);
		${tintedText ? `--primary-460-hsl: 0 calc(var(--saturation-factor, 1)*0%) 50%;
		--neutral-44-hsl: 0 calc(var(--saturation-factor, 1)*0%) 50%;
		--primary-430: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL(`#${primaryColor}`)[1] / 100 * (100 + PrimarySatDiffs[430]) * 10) / 10 : HexToHSL(`#${primaryColor}`)[1]}%), 90%)` : `hsl(${HexToHSL(`#${secondaryColor}`)[0]}, calc(var(--saturation-factor, 1)*100%), 20%)`};
		--neutral-36: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL(`#${primaryColor}`)[1] / 100 * (100 + PrimarySatDiffs[430]) * 10) / 10 : HexToHSL(`#${primaryColor}`)[1]}%), 90%)` : `hsl(${HexToHSL(`#${secondaryColor}`)[0]}, calc(var(--saturation-factor, 1)*100%), 20%)`};
		--primary-400: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL(`#${primaryColor}`)[1] / 100 * (100 + PrimarySatDiffs[400]) * 10) / 10 : HexToHSL(`#${primaryColor}`)[1]}%), 90%)` : `hsl(${HexToHSL(`#${secondaryColor}`)[0]}, calc(var(--saturation-factor, 1)*100%), 20%)`};
		--neutral-31: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL(`#${primaryColor}`)[1] / 100 * (100 + PrimarySatDiffs[400]) * 10) / 10 : HexToHSL(`#${primaryColor}`)[1]}%), 90%)` : `hsl(${HexToHSL(`#${secondaryColor}`)[0]}, calc(var(--saturation-factor, 1)*100%), 20%)`};
		--primary-360: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL(`#${primaryColor}`)[1] / 100 * (100 + PrimarySatDiffs[360]) * 10) / 10 : HexToHSL(`#${primaryColor}`)[1]}%), 90%)` : `hsl(${HexToHSL(`#${secondaryColor}`)[0]}, calc(var(--saturation-factor, 1)*100%), 20%)`};
		--neutral-24: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL(`#${primaryColor}`)[1] / 100 * (100 + PrimarySatDiffs[360]) * 10) / 10 : HexToHSL(`#${primaryColor}`)[1]}%), 90%)` : `hsl(${HexToHSL(`#${secondaryColor}`)[0]}, calc(var(--saturation-factor, 1)*100%), 20%)`};` : ""}
}
.theme-darker {
		--neutral-69-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2] - 3.6}%;
		--neutral-75-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2] - 7.2}%;
		--neutral-76-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${HexToHSL("#" + secondaryColor)[2] - 7.2}%;
		--neutral-78-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${HexToHSL("#" + secondaryColor)[2] - 7.6}%;
		--neutral-83-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[800]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 5.5, 0)}%;
}
.theme-light {
		--white-500-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 80, 90)}%;
		--primary-130-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${Math.min(HexToHSL("#" + secondaryColor)[2] + 80, 85)}%;
		--neutral-3-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${Math.min(HexToHSL("#" + secondaryColor)[2] + 80, 85)}%;
		--primary-160-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[660]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.min(HexToHSL("#" + secondaryColor)[2] + 76.4, 82.5)}%;
		--neutral-5-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[660]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.min(HexToHSL("#" + secondaryColor)[2] + 76.4, 82.5)}%;
		--primary-200-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 80, 80)}%;
		--neutral-6-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 80, 80)}%;
}
.emptyPage_c6b11b,
.scrollerContainer_c6b11b,
.container_f1fd9c,
.header_f1fd9c {
		background-color: unset !important;
}
.container_c2efea,
.container_f1fd9c,
.header_f1fd9c {
		background: transparent !important;
}${Math.round(HexToHSL("#" + primaryColor)[2]) > 80 ? `

/*Primary*/
.theme-dark .container_c2739c,
.theme-dark .body_cd82a7,
.theme-dark .toolbar_fc4f04,
.theme-dark .container_f0fccd,
.theme-dark .messageContent_f9f2ca,
.theme-dark .attachButtonPlus_f298d4,
.theme-dark .username_f9f2ca:not([style]),
.theme-dark .children_fc4f04,
.theme-dark .buttonContainer_f9f2ca,
.theme-dark .listItem_c96c45,
.theme-dark .body_cd82a7 .caret_fc4f04,
.theme-dark .body_cd82a7 .titleWrapper_fc4f04 > h1,
.theme-dark .body_cd82a7 .icon_fc4f04 {
		--white-500: black !important;
		--interactive-normal: black !important;
		--text-normal: black !important;
		--text-muted: black !important;
		--header-primary: black !important;
		--header-secondary: black !important;
}

.theme-dark .contentRegionScroller_c25c6d :not(.mtk1,.mtk2,.mtk3,.mtk4,.mtk5,.mtk6,.mtk7,.mtk8,.mtk9,.monaco-editor .line-numbers) {
		--white-500: black !important;
}

.theme-dark .container_fc4f04 {
		--channel-icon: black;
}

.theme-dark .callContainer_d880dc {
		--white-500: ${HexToHSL("#" + tertiaryColor)[2] > 80 ? "black" : "white"} !important;
}

.theme-dark .channelTextArea_a7d72e {
		--text-normal: ${HexToHSL("#" + primaryColor)[2] + 3.6 > 80 ? "black" : "white"};
}

.theme-dark .placeholder_a552a6 {
		--channel-text-area-placeholder: ${HexToHSL("#" + primaryColor)[2] + 3.6 > 80 ? "black" : "white"};
		opacity: .6;
}

.theme-dark .colorwaySelectorIcon {
		background-color: black;
}

.theme-dark .root_f9a4c9 > .header_f9a4c9 > h1 {
		color: black;
}
/*End Primary*/` : ""}${HexToHSL("#" + secondaryColor)[2] > 80 ? `

/*Secondary*/
.theme-dark .wrapper_cd82a7 *,
.theme-dark .sidebar_a4d4d9 *:not(.hasBanner_fd6364 *),
.theme-dark .members_cbd271 *:not([style]),
.theme-dark .sidebarRegionScroller_c25c6d *,
.theme-dark .header_e06857,
.theme-dark .lookFilled_dd4f85.colorPrimary_dd4f85 {
		--white-500: black !important;
		--channels-default: black !important;
		--channel-icon: black !important;
		--interactive-normal: var(--white-500);
		--interactive-hover: var(--white-500);
		--interactive-active: var(--white-500);
}

.theme-dark .channelRow_f04d06 {
		background-color: var(--background-secondary);
}

.theme-dark .channelRow_f04d06 * {
		--channel-icon: black;
}

.theme-dark #app-mount .activity_a31c43 {
		--channels-default: var(--white-500) !important;
}

.theme-dark .nameTag_b2ca13 {
		--header-primary: black !important;
		--header-secondary: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 90%)" : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)"} !important;
}

.theme-dark .bannerVisible_fd6364 .headerContent_fd6364 {
		color: #fff;
}

.theme-dark .embedFull_b0068a {
		--text-normal: black;
}
/*End Secondary*/` : ""}${HexToHSL("#" + tertiaryColor)[2] > 80 ? `

/*Tertiary*/
.theme-dark .winButton_a934d8,
.theme-dark .searchBar_e0840f *,
.theme-dark .wordmarkWindows_a934d8,
.theme-dark .searchBar_a46bef *,
.theme-dark .searchBarComponent_f0963d {
		--white-500: black !important;
}

.theme-dark [style="background-color: var(--background-secondary);"] {
		color: ${HexToHSL("#" + secondaryColor)[2] > 80 ? "black" : "white"};
}

.theme-dark .popout_c5b389 > * {
		--interactive-normal: black !important;
		--header-secondary: black !important;
}

.theme-dark .tooltip_b6c360 {
		--text-normal: black !important;
}
.theme-dark .children_fc4f04 .icon_fc4f04 {
		color: var(--interactive-active) !important;
}
/*End Tertiary*/` : ""}${HexToHSL("#" + accentColor)[2] > 80 ? `

/*Accent*/
.selected_db6521 *,
.selected_ae80f7 *,
#app-mount .lookFilled_dd4f85.colorBrand_dd4f85:not(.buttonColor_adcaac),
.colorDefault_d90b3d.focused_d90b3d,
.row_c5b389:hover,
.colorwayInfoIcon,
.checkmarkCircle_cb7c27 > circle {
		--white-500: black !important;
}

.ColorwaySelectorBtn:hover .vc-pallete-icon {
		color: #000 !important;
}

:root:root {
		--mention-foreground: black !important;
}
/*End Accent*/` : ""}`;
}
function getAutoPresets(accentColor) {
	return {
		hueRotation: {
			name: "Hue Rotation",
			id: "hueRotation",
			colors: {
				accent: accentColor,
				primary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 11% 21%)`),
				secondary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 11% 18%)`),
				tertiary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 10% 13%)`)
			}
		},
		accentSwap: {
			name: "Accent Swap",
			id: "accentSwap",
			colors: {
				accent: accentColor,
				primary: "#313338",
				secondary: "#2b2d31",
				tertiary: "#1e1f22"
			}
		},
		AMOLED: {
			name: "AMOLED",
			id: "AMOLED",
			colors: {
				accent: accentColor,
				primary: "#000000",
				secondary: "#000000",
				tertiary: "#000000"
			}
		},
		materialYou: {
			name: "Material You",
			id: "materialYou",
			colors: {
				accent: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 100% 23%)`),
				primary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 12% 12%)`),
				secondary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 12% 16%)`),
				tertiary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 16% 18%)`)
			}
		}
	};
}
function getPreset(colors, discordSaturation = false) {
	colors.primary ??= "#313338";
	colors.secondary ??= "#2b2d31";
	colors.tertiary ??= "#1e1f22";
	colors.accent ??= "#ffffff";
	const primaryColor = colors.primary.replace("#", "");
	const secondaryColor = colors.secondary.replace("#", "");
	const tertiaryColor = colors.tertiary.replace("#", "");
	const accentColor = colors.accent.replace("#", "");
	return {
		default: {
			name: "Default",
			preset: generateCss(
				colors,
				true,
				discordSaturation,
				void 0
			),
			id: "default",
			colors: ["accent", "primary", "secondary", "tertiary"]
		},
		cyan: {
			name: "Cyan",
			preset: `:root:root {
		--cyan-accent-color: #${accentColor};
		--cyan-background-primary: hsl(${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%/60%);
		--cyan-second-layer: hsl(${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 3.6 * 2, 100)}%/60%);
}`,
			id: "cyan",
			colors: ["accent", "primary", "secondary"]
		},
		cyanLegacy: {
			name: "Cyan 1 (Legacy)",
			preset: `:root:root {
		--cyan-accent-color: #${accentColor};
		--cyan-background-primary: hsl(${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%/40%);
		--cyan-background-secondary: hsl(${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 3.6 * 2, 100)}%);
}`,
			id: "cyanLegacy",
			colors: ["accent", "primary", "secondary"]
		},
		nexusRemastered: {
			name: "Nexus Remastered",
			preset: `:root:root {
		--nexus-accent-color: #${accentColor};
		--nexus-background-secondary: hsl(${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[800]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6 * 2, 0)}%);
		--nexus-background-elevated: hsl(${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[800]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6 * 2, 0)}%);
		--nexus-background-floating: hsl(${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[800]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6 * 2, 0)}%);
		--nexus-background-tertiary: hsl(${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${HexToHSL("#" + tertiaryColor)[2]}%);
		--home-background: hsl(${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${HexToHSL("#" + tertiaryColor)[2]}%);
		--nexus-background-primary: hsl(${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%);
		--primary-800-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[800]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6 * 2, 0)}%;
		--primary-730-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[730]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6, 0)}%;
		--primary-700-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${HexToHSL("#" + tertiaryColor)[2]}%;
		--primary-660-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[660]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.max(HexToHSL("#" + secondaryColor)[2] - 3.6, 0)}%;
		--primary-645-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[645]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.max(HexToHSL("#" + secondaryColor)[2] - 1.1, 0)}%;
		--primary-630-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${HexToHSL("#" + secondaryColor)[2]}%;
		--primary-600-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%;
		--primary-560-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6, 100)}%;
		--primary-530-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[530]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 2, 100)}%;
		--primary-500-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[500]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 3, 100)}%;
		--primary-200: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[200]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%), 90%)` : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)"}
}
.theme-dark {
		--background-tertiary: var(--primary-700) !important;
}
.theme-light {
		--background-tertiary: var(--primary-200) !important;
}`,
			id: "nexusRemastered",
			colors: ["accent", "primary", "secondary", "tertiary"]
		},
		virtualBoy: {
			name: "Virtual Boy",
			preset: `:root:root {
		--VBaccent: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${HexToHSL("#" + accentColor)[2]}%;
		--VBaccent-muted: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 10, 0)}%;
		--VBaccent-dimmest: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 3.6 * 5 - 3, 100)}%;
}`,
			id: "virtualBoy",
			colors: ["accent", "tertiary"]
		},
		modular: {
			name: "Modular",
			preset: `:root:root {
		--brand-500: #${accentColor};
		--primary-800-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[800]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6 * 2, 0)}%;
		--primary-730-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[730]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6, 0)}%;
		--primary-700-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${HexToHSL("#" + tertiaryColor)[2]}%;
		--primary-660-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[660]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.max(HexToHSL("#" + secondaryColor)[2] - 3.6, 0)}%;
		--primary-645-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[645]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.max(HexToHSL("#" + secondaryColor)[2] - 1.1, 0)}%;
		--primary-630-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${HexToHSL("#" + secondaryColor)[2]}%;
		--primary-600-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%;
		--primary-560-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6, 100)}%;
		--primary-530-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[530]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 2, 100)}% !important;
		--primary-500-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[500]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 3, 100)}% !important;
		--primary-330: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[330]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%), 90%)` : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)"};
		--primary-360: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[360]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%), 90%)` : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)"};
		--primary-400: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[400]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%), 90%)` : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)"}
}`,
			id: "modular",
			colors: ["accent", "primary", "secondary", "tertiary"]
		},
		solana: {
			name: "Solana",
			preset: `:root:root {
		--accent-hue: ${HexToHSL("#" + accentColor)[0]};
		--accent-saturation: calc(var(--saturation-factor, 1)${HexToHSL("#" + accentColor)[1]}%);
		--accent-brightness: ${HexToHSL("#" + accentColor)[2]}%;
		--background-accent-hue: ${HexToHSL("#" + primaryColor)[0]};
		--background-accent-saturation: calc(var(--saturation-factor, 1)${HexToHSL("#" + primaryColor)[1]}%);
		--background-accent-brightness: ${HexToHSL("#" + primaryColor)[2]}%;
		--background-overlay-opacity: 0%;
}`,
			id: "solana",
			colors: ["accent", "primary"]
		},
		neobrutal: {
			name: "Neobrutal",
			preset: `.theme-light {
		--neobrutal-color-1: hsl(${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%) !important;
		--neobrutal-color-2: hsl(${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 80, 90)}%) !important;
		--neobrutal-color-text: hsl(${HexToHSL("#" + accentColor)[0]} ${HexToHSL("#" + accentColor)[1]} ${HexToHSL("#" + accentColor)[2] - 10}) !important;
		--neobrutal-color-accent: #${accentColor} !important;
}

.theme-dark {
		--neobrutal-color-1: hsl(${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 80, 90)}%) !important;
		--neobrutal-color-2: hsl(${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%) !important;
		--neobrutal-color-text: hsl(${HexToHSL("#" + accentColor)[0]} ${HexToHSL("#" + accentColor)[1]}% ${HexToHSL("#" + accentColor)[2] + 10}%) !important;
		--neobrutal-color-accent: #${accentColor} !important;
}`,
			id: "neobrutal",
			colors: ["accent", "primary"]
		},
		gradientType1: {
			name: "Gradient Type 1",
			preset: {
				full: `${gradientBase(colors, true, discordSaturation)}
								:root:root {
										--custom-theme-background: linear-gradient(239.16deg, #${primaryColor} 10.39%, #${secondaryColor} 26.87%, #${tertiaryColor} 48.31%, hsl(${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${Math.min(HexToHSL("#" + secondaryColor)[2] + 3.6, 100)}%) 64.98%, #${primaryColor} 92.5%);
								}`,
				base: `239.16deg, #${primaryColor} 10.39%, #${secondaryColor} 26.87%, #${tertiaryColor} 48.31%, hsl(${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${Math.min(HexToHSL("#" + secondaryColor)[2] + 3.6, 100)}%) 64.98%, #${primaryColor} 92.5%`
			},
			id: "gradientType1",
			colors: ["accent", "primary", "secondary", "tertiary"]
		},
		gradientType2: {
			name: "Gradient Type 2",
			preset: {
				full: `${gradientBase(colors, true, discordSaturation)}
						:root:root {
								--custom-theme-background: linear-gradient(48.17deg, #${primaryColor} 11.21%, #${secondaryColor} 61.92%);
						}`,
				base: `48.17deg, #${primaryColor} 11.21%, #${secondaryColor} 61.92%`
			},
			id: "gradientType2",
			colors: ["accent", "primary", "secondary"]
		},
		hueRotation: {
			name: "Hue Rotation",
			preset: generateCss(
				getAutoPresets(accentColor).hueRotation.colors,
				true,
				true,
				void 0
			),
			id: "hueRotation",
			colors: ["accent"],
			calculated: {
				primary: `hsl(${HexToHSL("#" + accentColor)[0]} 11% 21%)`,
				secondary: `hsl(${HexToHSL("#" + accentColor)[0]} 11% 18%)`,
				tertiary: `hsl(${HexToHSL("#" + accentColor)[0]} 10% 13%)`
			}
		},
		accentSwap: {
			name: "Accent Swap",
			preset: generateCss(
				getAutoPresets(accentColor).accentSwap.colors,
				true,
				true,
				void 0
			),
			id: "accentSwap",
			colors: ["accent"]
		},
		materialYou: {
			name: "Material You",
			preset: generateCss(
				getAutoPresets(accentColor).materialYou.colors,
				true,
				true,
				void 0
			),
			id: "materialYou",
			colors: ["accent"],
			calculated: {
				primary: `hsl(${HexToHSL("#" + accentColor)[0]} 12% 12%)`,
				secondary: `hsl(${HexToHSL("#" + accentColor)[0]} 12% 16%)`,
				tertiary: `hsl(${HexToHSL("#" + accentColor)[0]} 16% 18%)`
			}
		},
		AMOLED: {
			name: "AMOLED",
			preset: generateCss(
				getAutoPresets(accentColor).AMOLED.colors,
				true,
				true,
				void 0
			),
			id: "AMOLED",
			colors: ["accent"],
			calculated: {
				primary: "#000000",
				secondary: "#000000",
				tertiary: "#000000"
			}
		}
	};
}
const gradientPresetIds = [
	"gradientType1",
	"gradientType2"
];

var SortOptions = ((SortOptions2) => {
	SortOptions2[SortOptions2["NAME_AZ"] = 1] = "NAME_AZ";
	SortOptions2[SortOptions2["NAME_ZA"] = 2] = "NAME_ZA";
	SortOptions2[SortOptions2["SOURCE_AZ"] = 3] = "SOURCE_AZ";
	SortOptions2[SortOptions2["SOURCE_ZA"] = 4] = "SOURCE_ZA";
	SortOptions2[SortOptions2["SOURCETYPE_ONLINE"] = 5] = "SOURCETYPE_ONLINE";
	SortOptions2[SortOptions2["SOURCETYPE_OFFLINE"] = 6] = "SOURCETYPE_OFFLINE";
	SortOptions2[SortOptions2["COLORCOUNT_ASCENDING"] = 7] = "COLORCOUNT_ASCENDING";
	SortOptions2[SortOptions2["COLORCOUNT_DESCENDING"] = 8] = "COLORCOUNT_DESCENDING";
	SortOptions2[SortOptions2["MOST_USED"] = 9] = "MOST_USED";
	SortOptions2[SortOptions2["LEAST_USED"] = 10] = "LEAST_USED";
	return SortOptions2;
})(SortOptions || {});

function Modal({ modalProps, onFinish, title, children, type = "normal", confirmMsg = "Finish", additionalButtons = [], cancelMsg = "Cancel" }) {
	const [theme, setTheme] = React.useState(contexts.colorwaysPluginTheme);
	const [forceVR, setForceVR] = React.useState(contexts.colorwaysForceVR);
	const cont = React.useRef(null);
	React.useEffect(() => {
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_THEME", ({ theme: theme2 }) => setTheme(theme2));
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_FORCE_VR", ({ enabled }) => setForceVR(enabled));
		return () => {
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_THEME", ({ theme: theme2 }) => setTheme(theme2));
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_FORCE_VR", ({ enabled }) => setForceVR(enabled));
		};
	}, []);
	return BdApi.React.createElement(exports.FocusLock, { containerRef: cont }, BdApi.React.createElement("div", { className: forceVR ? "visual-refresh" : "", style: { display: "contents" } }, BdApi.React.createElement("div", { ref: cont, className: `colorwaysModal ${modalProps.transitionState === 2 ? "closing" : ""} ${modalProps.transitionState === 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, title), BdApi.React.createElement("div", { className: "colorwaysModalContent", style: { minWidth: "500px" } }, children), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-md" + (type === "danger" ? " colorwaysPillButton-danger" : " colorwaysPillButton-brand"),
			onClick: () => onFinish({ closeModal: modalProps.onClose })
		},
		confirmMsg
	), additionalButtons.map(({ type: type2, action, text }) => BdApi.React.createElement(
		"button",
		{
			className: `colorwaysPillButton colorwaysPillButton-md${type2 === "primary" ? " colorwaysPillButton-outlined" : ""} colorwaysPillButton-${type2}`,
			onClick: () => action({ closeModal: modalProps.onClose })
		},
		text
	)), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-md colorwaysPillButton-outlined colorwaysPillButton-primary",
			onClick: () => modalProps.onClose()
		},
		cancelMsg
	)))));
}

function AutoColorwaySelector({ modalProps, onChange, autoColorwayId = "" }) {
	const [autoId, setAutoId] = React.useState(autoColorwayId);
	return BdApi.React.createElement(
		Modal,
		{
			modalProps,
			title: "Auto Colorway Settings",
			onFinish: ({ closeModal }) => {
				DataStore.set("activeAutoPreset", autoId);
				onChange(autoId);
				closeModal();
			}
		},
		BdApi.React.createElement("div", { className: "dc-info-card", style: { marginTop: "1em" } }, BdApi.React.createElement("strong", null, "About the Auto Colorway"), BdApi.React.createElement("span", null, "The auto colorway allows you to use your system's accent color in combination with a selection of presets that will fully utilize it.")),
		BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader" }, "Presets:"),
		BdApi.React.createElement("div", { className: "colorways-selector" }, Object.values(getAutoPresets()).map((autoPreset) => BdApi.React.createElement(
			"div",
			{
				className: "discordColorway",
				"aria-checked": autoId === autoPreset.id,
				onClick: () => {
					setAutoId(autoPreset.id);
				}
			},
			BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), autoId === autoPreset.id && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", fill: "currentColor" })),
			BdApi.React.createElement("span", { className: "colorwayLabel" }, autoPreset.name)
		)))
	);
}

function CPicker({ onChange, onClose, color, suggestedColors, showEyeDropper, children }) {
	return BdApi.React.createElement(
		exports.Popout,
		{
			positionKey: crypto.randomUUID(),
			renderPopout: (e) => BdApi.React.createElement(
				exports.Forms.CustomColorPicker,
				{
					...e,
					value: color,
					onChange,
					suggestedColors,
					showEyeDropper
				}
			),
			onRequestClose: onClose
		},
		({ ...n }) => {
			return children({ ...n });
		}
	);
}

function ConflictingColorsModal({
	modalProps,
	onFinished
}) {
	const [accentColor, setAccentColor] = React.useState(getHex(
		getComputedStyle(
			document.body
		).getPropertyValue("--brand-500")
	));
	const [primaryColor, setPrimaryColor] = React.useState(getHex(
		getComputedStyle(
			document.body
		).getPropertyValue("--background-primary")
	));
	const [secondaryColor, setSecondaryColor] = React.useState(getHex(
		getComputedStyle(
			document.body
		).getPropertyValue("--background-secondary")
	));
	const [tertiaryColor, setTertiaryColor] = React.useState(getHex(
		getComputedStyle(
			document.body
		).getPropertyValue("--background-tertiary")
	));
	return BdApi.React.createElement(
		Modal,
		{
			modalProps,
			title: "Conflicting Colors Found",
			type: "normal",
			onFinish: ({ closeModal }) => {
				onFinished({
					accent: accentColor,
					primary: primaryColor,
					secondary: secondaryColor,
					tertiary: tertiaryColor
				});
				closeModal();
			}
		},
		BdApi.React.createElement("span", { className: "colorwaysConflictingColors-warning" }, "Multiple known themes have been found, select the colors you want to copy from below:"),
		BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Colors to copy:"),
		BdApi.React.createElement("div", { className: "colorwayCreator-colorPreviews" }, BdApi.React.createElement("div", { className: "colorwayCreator-colorPreview", style: { backgroundColor: primaryColor, color: getFontOnBg(primaryColor) } }, "Primary"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreview", style: { backgroundColor: secondaryColor, color: getFontOnBg(secondaryColor) } }, "Secondary"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreview", style: { backgroundColor: tertiaryColor, color: getFontOnBg(tertiaryColor) } }, "Tertiary"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreview", style: { backgroundColor: accentColor, color: getFontOnBg(accentColor) } }, "Accent")),
		BdApi.React.createElement("div", { className: "colorwaysCreator-settingCat" }, BdApi.React.createElement("div", { className: "colorwaysCreator-settingsList" }, BdApi.React.createElement(
			"div",
			{
				id: "colorways-colorstealer-item_Default",
				className: "colorwaysCreator-settingItm colorwaysCreator-colorPreviewItm"
			},
			BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Discord"),
			BdApi.React.createElement("div", { className: "colorwayCreator-colorPreviews" }, BdApi.React.createElement(
				"div",
				{
					className: "colorwayCreator-colorPreview",
					style: {
						backgroundColor: getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--background-primary")
						),
						color: getFontOnBg(
							getHex(
								getComputedStyle(
									document.body
								).getPropertyValue("--background-primary")
							)
						)
					},
					onClick: () => setPrimaryColor(
						getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--background-primary")
						)
					)
				},
				"Primary"
			), BdApi.React.createElement(
				"div",
				{
					className: "colorwayCreator-colorPreview",
					style: {
						backgroundColor: getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--background-secondary")
						),
						color: getFontOnBg(
							getHex(
								getComputedStyle(
									document.body
								).getPropertyValue("--background-secondary")
							)
						)
					},
					onClick: () => setSecondaryColor(
						getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--background-secondary")
						)
					)
				},
				"Secondary"
			), BdApi.React.createElement(
				"div",
				{
					className: "colorwayCreator-colorPreview",
					style: {
						backgroundColor: getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--background-tertiary")
						),
						color: getFontOnBg(
							getHex(
								getComputedStyle(
									document.body
								).getPropertyValue("--background-tertiary")
							)
						)
					},
					onClick: () => setTertiaryColor(
						getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--background-tertiary")
						)
					)
				},
				"Tertiary"
			), BdApi.React.createElement(
				"div",
				{
					className: "colorwayCreator-colorPreview",
					style: {
						backgroundColor: getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--brand-500")
						),
						color: getFontOnBg(
							getHex(
								getComputedStyle(
									document.body
								).getPropertyValue("--brand-500")
							)
						)
					},
					onClick: () => setAccentColor(
						getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--brand-500")
						)
					)
				},
				"Accent"
			))
		), Object.values(knownThemeVars).map((theme, i) => {
			if (getComputedStyle(document.body).getPropertyValue(theme.variable)) {
				return BdApi.React.createElement(
					"div",
					{
						id: "colorways-colorstealer-item_" + Object.keys(knownThemeVars)[i],
						className: "colorwaysCreator-settingItm colorwaysCreator-colorPreviewItm"
					},
					BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, Object.keys(knownThemeVars)[i] + (theme.alt ? " (Main)" : "")),
					BdApi.React.createElement("div", { className: "colorwayCreator-colorPreviews" }, theme.primary && getComputedStyle(document.body).getPropertyValue(theme.primary).match(/^\d.*%$/) ? BdApi.React.createElement(
						"div",
						{
							className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_primary",
							style: {
								backgroundColor: getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.primary)})`),
								color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.primary)})`))
							},
							onClick: () => {
								setPrimaryColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.primary)})`));
							}
						},
						"Primary"
					) : theme.primary ? BdApi.React.createElement(
						"div",
						{
							className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_primary",
							style: {
								backgroundColor: getHex(getComputedStyle(document.body).getPropertyValue(theme.primary)),
								color: getFontOnBg(getHex(getComputedStyle(document.body).getPropertyValue(theme.primary)))
							},
							onClick: () => {
								setPrimaryColor(getHex(getComputedStyle(document.body).getPropertyValue(theme.primary)));
							}
						},
						"Primary"
					) : theme.primaryVariables && BdApi.React.createElement(
						"div",
						{
							className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_primary",
							style: { backgroundColor: `hsl(${getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.l)})`, color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.l)})`)) },
							onClick: () => {
								setPrimaryColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme.primaryVariables.l)})`));
							}
						},
						"Primary"
					), theme.secondary && getComputedStyle(document.body).getPropertyValue(theme.secondary).match(/^\d.*%$/) ? BdApi.React.createElement(
						"div",
						{
							className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_secondary",
							style: {
								backgroundColor: getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.secondary)})`),
								color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.secondary)})`))
							},
							onClick: () => {
								setSecondaryColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.secondary)})`));
							}
						},
						"Secondary"
					) : theme.secondary ? BdApi.React.createElement(
						"div",
						{
							className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_secondary",
							style: {
								backgroundColor: getHex(getComputedStyle(document.body).getPropertyValue(theme.secondary)),
								color: getFontOnBg(getHex(getComputedStyle(document.body).getPropertyValue(theme.secondary)))
							},
							onClick: () => {
								setSecondaryColor(getHex(getComputedStyle(document.body).getPropertyValue(theme.secondary)));
							}
						},
						"Secondary"
					) : theme.secondaryVariables && BdApi.React.createElement(
						"div",
						{
							className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_secondary",
							style: { backgroundColor: `hsl(${getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.l)})`, color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.l)})`)) },
							onClick: () => {
								setSecondaryColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme.secondaryVariables.l)})`));
							}
						},
						"Secondary"
					), theme.tertiary && getComputedStyle(document.body).getPropertyValue(theme.tertiary).match(/^\d.*%$/) ? BdApi.React.createElement(
						"div",
						{
							className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_tertiary",
							style: {
								backgroundColor: getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.tertiary)})`),
								color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.tertiary)})`))
							},
							onClick: () => {
								setTertiaryColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.tertiary)})`));
							}
						},
						"Tertiary"
					) : theme.tertiary ? BdApi.React.createElement(
						"div",
						{
							className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_tertiary",
							style: {
								backgroundColor: getHex(getComputedStyle(document.body).getPropertyValue(theme.tertiary)),
								color: getFontOnBg(getHex(getComputedStyle(document.body).getPropertyValue(theme.tertiary)))
							},
							onClick: () => {
								setTertiaryColor(getHex(getComputedStyle(document.body).getPropertyValue(theme.tertiary)));
							}
						},
						"Tertiary"
					) : theme.tertiaryVariables && BdApi.React.createElement(
						"div",
						{
							className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_tertiary",
							style: { backgroundColor: `hsl(${getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.l)})`, color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.l)})`)) },
							onClick: () => {
								setTertiaryColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme.tertiaryVariables.l)})`));
							}
						},
						"Tertiary"
					), theme.accent && getComputedStyle(document.body).getPropertyValue(theme.accent).match(/^\d.*%$/) ? BdApi.React.createElement(
						"div",
						{
							className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_accent",
							style: {
								backgroundColor: getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.accent)})`),
								color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.accent)})`))
							},
							onClick: () => {
								setAccentColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.accent)})`));
							}
						},
						"Accent"
					) : theme.accent ? BdApi.React.createElement(
						"div",
						{
							className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_accent",
							style: {
								backgroundColor: getHex(getComputedStyle(document.body).getPropertyValue(theme.accent)),
								color: getFontOnBg(getHex(getComputedStyle(document.body).getPropertyValue(theme.accent)))
							},
							onClick: () => {
								setAccentColor(getHex(getComputedStyle(document.body).getPropertyValue(theme.accent)));
							}
						},
						"Accent"
					) : theme.accentVariables && BdApi.React.createElement(
						"div",
						{
							className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_accent",
							style: { backgroundColor: `hsl(${getComputedStyle(document.body).getPropertyValue(theme.accentVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme.accentVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.accentVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme.accentVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme.accentVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.accentVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme.accentVariables.l)})`, color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.accentVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme.accentVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.accentVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme.accentVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme.accentVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.accentVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme.accentVariables.l)})`)) },
							onClick: () => {
								setAccentColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme.accentVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme.accentVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.accentVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme.accentVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme.accentVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme.accentVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme.accentVariables.l)})`));
							}
						},
						"Accent"
					))
				);
			}
		})))
	);
}

function NewColorwayNameModal({ modalProps, onSelected, storeToModify }) {
	const [errorMsg, setErrorMsg] = React.useState();
	const [newColorwayName, setNewColorwayName] = React.useState("");
	return BdApi.React.createElement(
		Modal,
		{
			modalProps,
			title: "Select new name",
			confirmMsg: "Finish",
			type: "normal",
			onFinish: ({ closeModal }) => {
				setErrorMsg("");
				if (storeToModify.colorways.map((colorway) => colorway.name).includes(newColorwayName)) {
					return setErrorMsg("Name already exists");
				}
				onSelected(newColorwayName);
				closeModal();
			}
		},
		BdApi.React.createElement("span", { className: `colorwaysModalFieldHeader${errorMsg ? " colorwaysModalFieldHeader-error" : ""}` }, "Name", errorMsg ? BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader-errorMsg" }, BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader-errorMsgSeparator" }, "-"), errorMsg) : BdApi.React.createElement(BdApi.React.Fragment, null)),
		BdApi.React.createElement(
			"input",
			{
				type: "text",
				className: "colorwayTextBox",
				value: newColorwayName,
				onInput: ({ currentTarget: { value } }) => setNewColorwayName(value),
				placeholder: "Enter valid colorway name"
			}
		)
	);
}

function DuplicateColorwayModal({ modalProps, onFinish, oldStores, storeToModify, colorway, storename }) {
	return BdApi.React.createElement(
		Modal,
		{
			modalProps,
			cancelMsg: "Select different store",
			title: "Duplicate Colorway",
			confirmMsg: "Rename",
			onFinish: ({ closeModal }) => openModal((propss) => BdApi.React.createElement(
				NewColorwayNameModal,
				{
					storeToModify,
					modalProps: propss,
					onSelected: (e) => {
						const newStore = { name: storeToModify.name, colorways: [...storeToModify.colorways, { ...colorway, name: e }] };
						DataStore.set("customColorways", [...oldStores.filter((source) => source.name !== storename), newStore]);
						closeModal();
						onFinish();
					}
				}
			)),
			additionalButtons: [
				{
					text: "Overwrite",
					type: "danger",
					action: ({ closeModal }) => {
						openModal((propss) => BdApi.React.createElement(
							Modal,
							{
								modalProps: propss,
								onFinish: ({ closeModal: closeModall }) => {
									const newStore = { name: storeToModify.name, colorways: [...storeToModify.colorways.filter((colorwayy) => colorwayy.name !== colorway.name), colorway] };
									DataStore.set("customColorways", [...oldStores.filter((source) => source.name !== storename), newStore]);
									modalProps.onClose();
									closeModal();
									closeModall();
									onFinish();
								},
								title: "Overwrite Colorway",
								type: "danger",
								confirmMsg: "Overwrite"
							},
							"Overwrite duplicate colorway? This action cannot be undone!"
						));
					}
				}
			]
		},
		BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "A colorway with the same name was found in this store, what do you want to do?")
	);
}

function InputColorwayIdModal({ modalProps, onColorwayId }) {
	const [colorwayID, setColorwayID] = React.useState("");
	const [error, setError] = React.useState("");
	return BdApi.React.createElement(
		Modal,
		{
			modalProps,
			onFinish: ({ closeModal }) => {
				if (!colorwayID) {
					return setError("Please enter a Colorway ID");
				} else if (!hexToString(colorwayID).includes(",")) {
					return setError("Invalid Colorway ID");
				} else {
					onColorwayId(colorwayID);
					closeModal();
				}
			},
			title: "Enter Colorway ID"
		},
		BdApi.React.createElement("span", { className: `colorwaysModalFieldHeader${error ? " colorwaysModalFieldHeader-error" : ""}`, style: { marginBottom: "4px" } }, "Colorway ID", error ? BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader-errorMsg" }, BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader-errorMsgSeparator" }, "-"), error) : null),
		BdApi.React.createElement(
			"input",
			{
				type: "text",
				className: "colorwayTextBox",
				placeholder: "Enter Colorway ID",
				onInput: ({ currentTarget: { value } }) => setColorwayID(value)
			}
		)
	);
}

function Setting({
	children,
	divider = false,
	disabled = false
}) {
	return BdApi.React.createElement("div", { style: {
		display: "flex",
		flexDirection: "column",
		marginBottom: "20px"
	} }, disabled ? BdApi.React.createElement("div", { style: {
		pointerEvents: "none",
		opacity: 0.5,
		cursor: "not-allowed"
	} }, children) : children, divider && BdApi.React.createElement("div", { className: "colorwaysSettingsDivider" }));
}

function Switch({
	onChange,
	value,
	id,
	label,
	style = {}
}) {
	return label ? BdApi.React.createElement("div", { style: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		alignItems: "center",
		cursor: "pointer",
		...style
	} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label", htmlFor: id }, label), BdApi.React.createElement("div", { className: `colorwaysSettings-switch ${value ? "checked" : ""}` }, BdApi.React.createElement("svg", { viewBox: "0 0 28 20", preserveAspectRatio: "xMinYMid meet", "aria-hidden": "true", className: "colorwaysSettings-switchHandle", style: {
		left: value ? "12px" : "-3px"
	} }, BdApi.React.createElement("rect", { className: "colorwaysSettings-switchCircle", fill: "#000", x: "4", y: "0", height: "20", width: "20", rx: "10" })), BdApi.React.createElement("input", { checked: value, id, type: "checkbox", style: {
		position: "absolute",
		opacity: 0,
		width: "100%",
		height: "100%",
		cursor: "pointer",
		borderRadius: "14px",
		top: 0,
		left: 0,
		margin: 0
	}, tabIndex: 0, onChange: (e) => {
		onChange(e.currentTarget.checked);
	} }))) : BdApi.React.createElement("div", { className: `colorwaysSettings-switch ${value ? "checked" : ""}` }, BdApi.React.createElement("svg", { viewBox: "0 0 28 20", preserveAspectRatio: "xMinYMid meet", "aria-hidden": "true", style: {
		left: value ? "12px" : "-3px",
		transition: ".2s ease",
		display: "block",
		position: "absolute",
		width: "28px",
		height: "18px",
		margin: "3px"
	} }, BdApi.React.createElement("rect", { className: "colorwaysSettings-switchCircle", fill: "#000", x: "4", y: "0", height: "20", width: "20", rx: "10" })), BdApi.React.createElement("input", { checked: value, id, type: "checkbox", style: {
		position: "absolute",
		opacity: 0,
		width: "100%",
		height: "100%",
		cursor: "pointer",
		borderRadius: "14px",
		top: 0,
		left: 0,
		margin: 0
	}, tabIndex: 0, onChange: (e) => {
		onChange(e.currentTarget.checked);
	} }));
}

function NewStoreModal({ modalProps, onOnline, onOffline, offlineOnly = false, name = "" }) {
	const [colorwaySourceName, setColorwaySourceName] = React.useState(name);
	const [colorwaySourceURL, setColorwaySourceURL] = React.useState("");
	const [nameError, setNameError] = React.useState("");
	const [URLError, setURLError] = React.useState("");
	const [nameReadOnly, setNameReadOnly] = React.useState(false);
	const [isOnline, setIsOnline] = React.useState(false);
	return BdApi.React.createElement(
		Modal,
		{
			modalProps,
			title: "Add a source",
			type: "normal",
			onFinish: async ({ closeModal }) => {
				const sourcesArr = await DataStore.get("colorwaySourceFiles");
				if (!colorwaySourceName) {
					setNameError("Please enter a valid name");
				} else if (!offlineOnly && isOnline && !colorwaySourceURL) {
					setURLError("Please enter a valid URL");
				} else if (sourcesArr.map((s) => s.name).includes(colorwaySourceName)) {
					setNameError("An online source with that name already exists");
				} else if (!offlineOnly && isOnline && sourcesArr.map((s) => s.url).includes(colorwaySourceURL)) {
					setURLError("An online source with that url already exists");
				} else {
					isOnline && !offlineOnly ? onOnline({ name: colorwaySourceName, url: colorwaySourceURL }) : onOffline({ name: colorwaySourceName });
					closeModal();
				}
			}
		},
		!offlineOnly ? BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement(
			Switch,
			{
				label: "Online",
				value: isOnline,
				onChange: setIsOnline
			}
		), BdApi.React.createElement("span", { className: "colorwaysNote" }, "Immutable, and always up-to-date")) : null,
		BdApi.React.createElement("span", { className: `colorwaysModalFieldHeader${nameError ? " colorwaysModalFieldHeader-error" : ""}`, style: { marginBottom: "4px", width: "100%" } }, "Name", nameError ? BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader-errorMsg" }, BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader-errorMsgSeparator" }, "-"), nameError) : BdApi.React.createElement(BdApi.React.Fragment, null)),
		BdApi.React.createElement(
			"input",
			{
				type: "text",
				className: "colorwayTextBox",
				placeholder: "Enter a valid Name...",
				onInput: (e) => setColorwaySourceName(e.currentTarget.value),
				value: colorwaySourceName,
				readOnly: nameReadOnly && isOnline && !offlineOnly,
				disabled: nameReadOnly && isOnline && !offlineOnly
			}
		),
		isOnline && !offlineOnly ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("span", { className: `colorwaysModalFieldHeader${URLError ? " colorwaysModalFieldHeader-error" : ""}`, style: { marginBottom: "4px", marginTop: "16px" } }, "URL", URLError ? BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader-errorMsg" }, BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader-errorMsgSeparator" }, "-"), URLError) : BdApi.React.createElement(BdApi.React.Fragment, null)), BdApi.React.createElement(
			"input",
			{
				type: "text",
				className: "colorwayTextBox",
				placeholder: "Enter a valid URL...",
				onChange: ({ currentTarget: { value } }) => {
					setColorwaySourceURL(value);
					if (value === defaultColorwaySource) {
						setNameReadOnly(true);
						setColorwaySourceName("Project Colorway");
					} else setNameReadOnly(false);
				},
				value: colorwaySourceURL
			}
		)) : null
	);
}

function SaveColorwayAsModal({
	modalProps,
	loadUI = () => {
	},
	colorwayID,
	colorwayObject,
	store
}) {
	const [colors, updateColors] = React.useReducer((colors2, action) => {
		if (action.task === "all") {
			return { ...action.colorObj };
		} else {
			return { ...colors2, [action.task]: action.color };
		}
	}, colorwayObject ? colorwayObject.colors : {
		accent: "5865f2",
		primary: "313338",
		secondary: "2b2d31",
		tertiary: "1e1f22"
	});
	const [offlineColorwayStores, setOfflineColorwayStores] = React.useState([]);
	const [colorwayName, setColorwayName] = React.useState(colorwayObject ? colorwayObject.id : "");
	const [noStoreError, setNoStoreError] = React.useState(false);
	const [storename, setStorename] = React.useState("");
	const setColor = [
		"accent",
		"primary",
		"secondary",
		"tertiary"
	];
	React.useEffect(() => {
		(async function() {
			setOfflineColorwayStores(await DataStore.get("customColorways"));
		})();
		if (colorwayID) {
			if (!colorwayID.includes(",")) {
				console.error("Invalid Colorway ID");
			} else {
				colorwayID.split("|").forEach((prop) => {
					if (prop.includes(",#")) {
						prop.split(/,#/).forEach((color, i) => updateColors({ task: setColor[i], color: colorToHex(color) }));
					}
					if (prop.includes("n:")) {
						setColorwayName(prop.split("n:")[1]);
					}
				});
			}
		}
	});
	return BdApi.React.createElement(
		Modal,
		{
			modalProps,
			title: (() => {
				if (colorwayID) return "Save Temporary";
				if (colorwayObject && !store) return "Save";
				if (colorwayObject && store) return "Edit";
				return "Create";
			})() + " Colorway",
			onFinish: async ({ closeModal }) => {
				setNoStoreError(false);
				if (!storename) {
					return setNoStoreError(true);
				}
				const customColorway = {
					name: colorwayName || "Colorway",
					accent: "#" + colors.accent,
					primary: "#" + colors.primary,
					secondary: "#" + colors.secondary,
					tertiary: "#" + colors.tertiary,
					author: exports.UserStore.getCurrentUser().username,
					authorID: exports.UserStore.getCurrentUser().id,
					CSSVersion: PluginProps.CSSVersion
				};
				const oldStores = await DataStore.get("customColorways");
				const storeToModify = (await DataStore.get("customColorways")).filter((source) => source.name === store || storename)[0];
				const newStore = { name: storeToModify.name, colorways: [...storeToModify.colorways, customColorway] };
				if (storeToModify.colorways.map((colorway) => colorway.name).includes(customColorway.name) && !store) {
					return openModal((props) => BdApi.React.createElement(
						DuplicateColorwayModal,
						{
							colorway: customColorway,
							modalProps: props,
							oldStores,
							storeToModify,
							storename,
							onFinish: () => {
								closeModal();
								loadUI();
								updateRemoteSources();
							}
						}
					));
				}
				setContext("customColorways", [...oldStores.filter((source) => source.name !== storename), newStore]);
				closeModal();
				loadUI();
				updateRemoteSources();
			},
			additionalButtons: [
				...!store ? [{
					text: "Create New Store...",
					type: "brand",
					action: () => openModal((props) => BdApi.React.createElement(
						NewStoreModal,
						{
							modalProps: props,
							offlineOnly: true,
							onOffline: async ({ name }) => {
								setOfflineColorwayStores(setContext("customColorways", [...offlineColorwayStores, { name, colorways: [] }]));
							}
						}
					))
				}] : [],
				{
					text: "Copy Current Colors",
					type: "brand",
					action: () => {
						function setAllColors({ accent, primary, secondary, tertiary }) {
							updateColors({
								task: "all",
								colorObj: {
									accent: accent.split("#")[1],
									primary: primary.split("#")[1],
									secondary: secondary.split("#")[1],
									tertiary: tertiary.split("#")[1]
								}
							});
						}
						var copiedThemes = ["Discord"];
						Object.values(knownThemeVars).map((theme, i) => {
							if (getComputedStyle(document.body).getPropertyValue(theme.variable)) {
								copiedThemes.push(Object.keys(knownThemeVars)[i]);
							}
						});
						if (copiedThemes.length > 1) {
							openModal((props) => BdApi.React.createElement(ConflictingColorsModal, { modalProps: props, onFinished: setAllColors }));
						} else {
							updateColors({
								task: "all",
								colorObj: {
									primary: getHex(
										getComputedStyle(
											document.body
										).getPropertyValue("--primary-600")
									).split("#")[1],
									secondary: getHex(
										getComputedStyle(
											document.body
										).getPropertyValue("--primary-630")
									).split("#")[1],
									tertiary: getHex(
										getComputedStyle(
											document.body
										).getPropertyValue("--primary-700")
									).split("#")[1],
									accent: getHex(
										getComputedStyle(
											document.body
										).getPropertyValue("--brand-500")
									).split("#")[1]
								}
							});
						}
					}
				},
				{
					text: "Enter Colorway ID",
					type: "primary",
					action: () => openModal((props) => BdApi.React.createElement(InputColorwayIdModal, { modalProps: props, onColorwayId: (colorwayID2) => {
						hexToString(colorwayID2).split(/,#/).forEach((color, i) => updateColors({ task: setColor[i], color: colorToHex(color) }));
					} }))
				}
			]
		},
		BdApi.React.createElement("div", { style: { display: "flex", gap: "20px" } }, BdApi.React.createElement("div", { className: "colorwayCreator-colorPreviews" }, colorProps.map((presetColor) => {
			return BdApi.React.createElement(
				CPicker,
				{
					color: parseInt(colors[presetColor.id], 16),
					onChange: (color) => {
						let hexColor = color.toString(16);
						while (hexColor.length < 6) {
							hexColor = "0" + hexColor;
						}
						updateColors({ task: presetColor.id, color: hexColor });
					},
					...colorPickerProps,
					onClose: () => {
					}
				},
				({ onClick }) => BdApi.React.createElement("div", { className: "colorwaysSaveAsSwatch", style: { backgroundColor: "#" + colors[presetColor.id] }, onClick })
			);
		})), BdApi.React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px", width: "100%" } }, BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader" }, "Name"), BdApi.React.createElement(
			"input",
			{
				type: "text",
				className: "colorwayTextBox",
				placeholder: "Give your Colorway a name",
				value: colorwayName,
				autoFocus: true,
				onInput: (e) => setColorwayName(e.currentTarget.value)
			}
		), !store ? BdApi.React.createElement(BdApi.React.Fragment, null, !offlineColorwayStores.length ? BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-primary",
				style: { marginTop: "8px" },
				onClick: () => {
					openModal((props) => BdApi.React.createElement(
						NewStoreModal,
						{
							modalProps: props,
							offlineOnly: true,
							onOffline: async ({ name }) => {
								setOfflineColorwayStores(setContext("customColorways", [...offlineColorwayStores, { name, colorways: [] }]));
							}
						}
					));
				}
			},
			BdApi.React.createElement(PlusIcon, { width: 14, height: 14, style: { boxSizing: "content-box" } }),
			"Create new store..."
		) : BdApi.React.createElement("span", { style: { marginTop: "8px" }, className: `colorwaysModalFieldHeader${noStoreError ? " colorwaysModalFieldHeader-error" : ""}` }, "Source", noStoreError ? BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader-errorMsg" }, BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader-errorMsgSeparator" }, "-"), "No store selected") : BdApi.React.createElement(BdApi.React.Fragment, null)), BdApi.React.createElement("div", { className: "colorways-selector" }, offlineColorwayStores.map((store2) => BdApi.React.createElement(
			"div",
			{
				className: "discordColorway",
				"aria-checked": storename === store2.name,
				onClick: () => {
					setStorename(store2.name);
				}
			},
			BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), storename === store2.name && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" })),
			BdApi.React.createElement("div", { className: "colorwayLabelContainer" }, BdApi.React.createElement("span", { className: "colorwayLabel" }, store2.name), BdApi.React.createElement("span", { className: "colorwayLabel colorwayLabelSubnote colorwaysNote" }, store2.colorways.length, " colorways"))
		)))) : null))
	);
}

function ReloadButton({
	onClick,
	setShowSpinner
}) {
	const menuProps = React.useRef(null);
	const [pos, setPos] = React.useState({ x: 0, y: 0 });
	const [showMenu, setShowMenu] = React.useState(false);
	function rightClickContextMenu(e) {
		e.stopPropagation();
		window.dispatchEvent(new Event("click"));
		setShowMenu(!showMenu);
		setPos({
			x: e.currentTarget.getBoundingClientRect().x,
			y: e.currentTarget.getBoundingClientRect().y + e.currentTarget.offsetHeight + 8
		});
	}
	function onPageClick(e) {
		setShowMenu(false);
	}
	React.useEffect(() => {
		window.addEventListener("click", onPageClick);
		return () => {
			window.removeEventListener("click", onPageClick);
		};
	}, []);
	async function onForceReload_internal() {
		setShowMenu(false);
		setShowSpinner(true);
		const responses = await Promise.all(
			contexts.colorwaySourceFiles.map(
				(source) => fetch(source.url, { "cache": "no-store" })
			)
		);
		setShowSpinner(false);
		return setContext("colorwayData", await Promise.all(
			responses.map((res, i) => ({ response: res, name: contexts.colorwaySourceFiles[i].name })).map(
				(res) => res.response.json().then((dt) => ({ colorways: dt.colorways, source: res.name, type: "online" })).catch(() => ({ colorways: [], source: res.name, type: "online" }))
			)
		), false);
	}
	async function onReload_internal() {
		setShowMenu(false);
		setShowSpinner(true);
		const responses = await Promise.all(
			contexts.colorwaySourceFiles.map(
				(source) => fetch(source.url)
			)
		);
		setShowSpinner(false);
		return setContext("colorwayData", await Promise.all(
			responses.map((res, i) => ({ response: res, name: contexts.colorwaySourceFiles[i].name })).map(
				(res) => res.response.json().then((dt) => ({ colorways: dt.colorways, source: res.name, type: "online" })).catch(() => ({ colorways: [], source: res.name, type: "online" }))
			)
		), false);
	}
	return BdApi.React.createElement(BdApi.React.Fragment, null, showMenu ? BdApi.React.createElement("nav", { className: "colorwaysContextMenu", ref: menuProps, style: {
		position: "fixed",
		top: `${pos.y}px`,
		left: `${pos.x}px`
	} }, BdApi.React.createElement("button", { onClick: async () => onClick(await onForceReload_internal()), className: "colorwaysContextMenuItm" }, "Force Refresh", BdApi.React.createElement(
		"svg",
		{
			xmlns: "http://www.w3.org/2000/svg",
			x: "0px",
			y: "0px",
			width: "18",
			height: "18",
			style: { boxSizing: "content-box", marginLeft: "8px" },
			viewBox: "0 0 24 24",
			fill: "currentColor"
		},
		BdApi.React.createElement(
			"rect",
			{
				y: "0",
				fill: "none",
				width: "24",
				height: "24"
			}
		),
		BdApi.React.createElement(
			"path",
			{
				d: "M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z"
			}
		),
		BdApi.React.createElement(
			"path",
			{
				d: "M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z"
			}
		)
	))) : null, BdApi.React.createElement("button", { className: "colorwaysPillButton colorwaysPillButton-primary", onContextMenu: rightClickContextMenu, onClick: async () => onClick(await onReload_internal()) }, BdApi.React.createElement(
		"svg",
		{
			xmlns: "http://www.w3.org/2000/svg",
			x: "0px",
			y: "0px",
			width: "14",
			height: "14",
			style: { boxSizing: "content-box" },
			viewBox: "0 0 24 24",
			fill: "currentColor"
		},
		BdApi.React.createElement(
			"rect",
			{
				y: "0",
				fill: "none",
				width: "24",
				height: "24"
			}
		),
		BdApi.React.createElement(
			"path",
			{
				d: "M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z"
			}
		),
		BdApi.React.createElement(
			"path",
			{
				d: "M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z"
			}
		)
	), "Refresh"));
}

function Radio({ checked = false, style = {} }) {
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("svg", { className: "colorwaysRadioIndicator", "aria-hidden": "true", role: "img", width: "18", height: "18", viewBox: "0 0 24 24", style }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), checked ? BdApi.React.createElement("circle", { className: "colorwaysRadioSelected", cx: "12", cy: "12", r: "5" }) : null), BdApi.React.createElement("svg", { className: "colorwaysRadioIndicator-redesign", viewBox: "0 0 24 24", style }, checked ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "12", fill: "var(--redesign-input-control-selected)" }), BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", fill: "white" })) : null, BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "12", "stroke-width": "2", stroke: "rgba(255, 255, 255, 0.1)", fill: "none" })));
}

function SelectorOptionsMenu({ sort, onSortChange, source, sources, onSourceChange, onAutoPreset, onLayout, layout }) {
	const [pos, setPos] = React.useState({ x: 0, y: 0 });
	const [subPos, setSubPos] = React.useState({ x: 0, y: 0 });
	const [showMenu, setShowMenu] = React.useState(false);
	const [showSort, setShowSort] = React.useState(false);
	const [showSources, setShowSources] = React.useState(false);
	const [showPresets, setShowPresets] = React.useState(false);
	const [showAutoPresets, setShowAutoPresets] = React.useState(false);
	const [showLayouts, setShowLayouts] = React.useState(false);
	const [preset, setPreset] = React.useState("default");
	const [current, setCurrent] = React.useState(source);
	const [autoColorwayId, setAutoColorwayId] = React.useState("");
	const layouts = [{ name: "Normal", id: "normal" }, { name: "Compact", id: "compact" }];
	function rightClickContextMenu(e) {
		e.stopPropagation();
		window.dispatchEvent(new Event("click"));
		setShowMenu(!showMenu);
		setPos({
			x: e.currentTarget.getBoundingClientRect().x,
			y: e.currentTarget.getBoundingClientRect().y + e.currentTarget.offsetHeight + 8
		});
		return;
	}
	function onPageClick(e) {
		setShowMenu(false);
	}
	React.useEffect(() => {
		(async () => {
			setPreset(await DataStore.get("colorwaysPreset"));
			setAutoColorwayId(await DataStore.get("activeAutoPreset"));
		})();
		window.addEventListener("click", onPageClick);
		return () => {
			window.removeEventListener("click", onPageClick);
		};
	}, []);
	function onSortChange_internal(newSort) {
		onSortChange(newSort);
		setShowMenu(false);
	}
	function onSourceChange_internal(newSort) {
		onSourceChange(newSort.id);
		setCurrent(newSort);
		setShowMenu(false);
	}
	function onLayout_intrnl(layout2) {
		onLayout(layout2);
		setShowMenu(false);
	}
	function onPresetChange(value) {
		setPreset(value);
		DataStore.set("colorwaysPreset", value);
		DataStore.get("activeColorwayObject").then((active) => {
			if (active.id) {
				if (wsOpen) {
					if (hasManagerRole) {
						sendColorway(active);
					}
				} else {
					if (value === "default") {
						ColorwayCSS.set(generateCss(
							active.colors,
							true,
							true,
							void 0,
							active.id
						));
					} else {
						if (gradientPresetIds.includes(value)) {
							const css = Object.keys(active).includes("linearGradient") ? gradientBase(active.colors, true) + `:root:root {--custom-theme-background: linear-gradient(${active.linearGradient})}` : getPreset(active.colors)[value].preset.full;
							ColorwayCSS.set(css);
						} else {
							ColorwayCSS.set(getPreset(active.colors)[value].preset);
						}
					}
				}
			}
		});
		setShowMenu(false);
	}
	function onAutoPresetChange(activeAutoPreset) {
		onAutoPreset(activeAutoPreset);
		setShowMenu(false);
	}
	return BdApi.React.createElement(BdApi.React.Fragment, null, showMenu ? BdApi.React.createElement("nav", { className: "colorwaysContextMenu", style: {
		position: "fixed",
		top: `${pos.y}px`,
		left: `${pos.x}px`
	}, onClick: (e) => e.stopPropagation() }, BdApi.React.createElement("button", { className: "colorwaysContextMenuItm", onMouseEnter: (e) => {
		setShowSort(true);
		setSubPos({
			x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth,
			y: e.currentTarget.getBoundingClientRect().y
		});
	}, onMouseLeave: (e) => {
		const elem = document.elementFromPoint(e.clientX, e.clientY);
		if (elem !== e.currentTarget) {
			setShowSort(false);
		}
	} }, "Sort by: ", (() => {
		switch (sort) {
			case 1:
				return "Name (A-Z)";
			case 2:
				return "Name (Z-A)";
			case 3:
				return "Source (A-Z)";
			case 4:
				return "Source (Z-A)";
			case 5:
				return "Source Type (Online First)";
			case 6:
				return "Source Type (Offline First)";
			case 7:
				return "Color Count (Ascending)";
			case 8:
				return "Color Count (Descending)";
			case 9:
				return "Most Used";
			case 10:
				return "Least Used";
			default:
				return "Name (A-Z)";
		}
	})(), BdApi.React.createElement("div", { className: "colorwaysCaretContainer" }, BdApi.React.createElement(CaretIcon, { width: 16, height: 16 })), showSort ? BdApi.React.createElement("div", { className: "colorwaysSubmenuWrapper", style: {
		position: "fixed",
		top: `${subPos.y}px`,
		left: `${subPos.x}px`
	} }, BdApi.React.createElement("nav", { className: "colorwaysContextMenu" }, BdApi.React.createElement("button", { onClick: () => onSortChange_internal(9), className: "colorwaysContextMenuItm" }, "Most Used", BdApi.React.createElement(Radio, { checked: sort === 9, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(10), className: "colorwaysContextMenuItm" }, "Least Used", BdApi.React.createElement(Radio, { checked: sort === 10, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(1), className: "colorwaysContextMenuItm" }, "Name (A-Z)", BdApi.React.createElement(Radio, { checked: sort === 1, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(2), className: "colorwaysContextMenuItm" }, "Name (Z-A)", BdApi.React.createElement(Radio, { checked: sort === 2, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(3), className: "colorwaysContextMenuItm" }, "Source (A-Z)", BdApi.React.createElement(Radio, { checked: sort === 3, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(4), className: "colorwaysContextMenuItm" }, "Source (Z-A)", BdApi.React.createElement(Radio, { checked: sort === 4, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(5), className: "colorwaysContextMenuItm" }, "Source Type (Online First)", BdApi.React.createElement(Radio, { checked: sort === 5, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(6), className: "colorwaysContextMenuItm" }, "Source Type (Offline First)", BdApi.React.createElement(Radio, { checked: sort === 6, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(7), className: "colorwaysContextMenuItm" }, "Color Count (Ascending)", BdApi.React.createElement(Radio, { checked: sort === 7, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(8), className: "colorwaysContextMenuItm" }, "Color Count (Descending)", BdApi.React.createElement(Radio, { checked: sort === 8, style: {
		marginLeft: "8px"
	} })))) : BdApi.React.createElement(BdApi.React.Fragment, null)), BdApi.React.createElement("button", { className: "colorwaysContextMenuItm", onMouseEnter: (e) => {
		setShowPresets(true);
		setSubPos({
			x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth,
			y: e.currentTarget.getBoundingClientRect().y
		});
	}, onMouseLeave: (e) => {
		const elem = document.elementFromPoint(e.clientX, e.clientY);
		if (elem !== e.currentTarget) {
			setShowPresets(false);
		}
	} }, "Preset: ", Object.values(getPreset({})).find((pr) => pr.id === preset)?.name, BdApi.React.createElement("div", { className: "colorwaysCaretContainer" }, BdApi.React.createElement(CaretIcon, { width: 16, height: 16 })), showPresets ? BdApi.React.createElement("div", { className: "colorwaysSubmenuWrapper", style: {
		position: "fixed",
		top: `${subPos.y}px`,
		left: `${subPos.x}px`
	} }, BdApi.React.createElement("nav", { className: "colorwaysContextMenu" }, Object.values(getPreset({})).map(({ name, id }) => {
		return BdApi.React.createElement("button", { onClick: () => onPresetChange(id), className: "colorwaysContextMenuItm" }, name, BdApi.React.createElement(Radio, { checked: preset === id, style: {
			marginLeft: "8px"
		} }));
	}))) : null), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysContextMenuItm",
			onMouseEnter: (e) => {
				setShowAutoPresets(true);
				setSubPos({
					x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth,
					y: e.currentTarget.getBoundingClientRect().y
				});
			},
			onMouseLeave: (e) => {
				const elem = document.elementFromPoint(e.clientX, e.clientY);
				if (elem !== e.currentTarget) {
					setShowAutoPresets(false);
				}
			},
			onClick: () => {
				openModal((props) => BdApi.React.createElement(AutoColorwaySelector, { autoColorwayId, modalProps: props, onChange: (autoPresetId) => {
					onAutoPresetChange(autoPresetId);
				} }));
			}
		},
		"Auto Colorway Preset: ",
		Object.values(getAutoPresets()).find((pr) => pr.id === autoColorwayId)?.name,
		BdApi.React.createElement("div", { className: "colorwaysCaretContainer" }, BdApi.React.createElement(CaretIcon, { width: 16, height: 16 })),
		showAutoPresets ? BdApi.React.createElement("div", { className: "colorwaysSubmenuWrapper", style: {
			position: "fixed",
			top: `${subPos.y}px`,
			left: `${subPos.x}px`
		} }, BdApi.React.createElement("nav", { className: "colorwaysContextMenu" }, Object.values(getAutoPresets()).map(({ name, id }) => {
			return BdApi.React.createElement("button", { onClick: () => onAutoPresetChange(id), className: "colorwaysContextMenuItm" }, name, BdApi.React.createElement(Radio, { checked: autoColorwayId === id, style: {
				marginLeft: "8px"
			} }));
		}))) : null
	), BdApi.React.createElement("button", { className: "colorwaysContextMenuItm", onMouseEnter: (e) => {
		setShowSources(true);
		setSubPos({
			x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth,
			y: e.currentTarget.getBoundingClientRect().y
		});
	}, onMouseLeave: (e) => {
		const elem = document.elementFromPoint(e.clientX, e.clientY);
		if (elem !== e.currentTarget) {
			setShowSources(false);
		}
	} }, "Source: ", current.name, BdApi.React.createElement("div", { className: "colorwaysCaretContainer" }, BdApi.React.createElement(CaretIcon, { width: 16, height: 16 })), showSources ? BdApi.React.createElement("div", { className: "colorwaysSubmenuWrapper", style: {
		position: "fixed",
		top: `${subPos.y}px`,
		left: `${subPos.x}px`
	} }, BdApi.React.createElement("nav", { className: "colorwaysContextMenu" }, sources.map(({ name, id }) => {
		return BdApi.React.createElement("button", { onClick: () => onSourceChange_internal({ name, id }), className: "colorwaysContextMenuItm" }, name, BdApi.React.createElement(Radio, { checked: source.id === id, style: {
			marginLeft: "8px"
		} }));
	}))) : null), BdApi.React.createElement("button", { className: "colorwaysContextMenuItm", onMouseEnter: (e) => {
		setShowLayouts(true);
		setSubPos({
			x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth,
			y: e.currentTarget.getBoundingClientRect().y
		});
	}, onMouseLeave: (e) => {
		const elem = document.elementFromPoint(e.clientX, e.clientY);
		if (elem !== e.currentTarget) {
			setShowLayouts(false);
		}
	} }, "Layout: ", layouts.find((l) => l.id === layout)?.name, BdApi.React.createElement("div", { className: "colorwaysCaretContainer" }, BdApi.React.createElement(CaretIcon, { width: 16, height: 16 })), showLayouts ? BdApi.React.createElement("div", { className: "colorwaysSubmenuWrapper", style: {
		position: "fixed",
		top: `${subPos.y}px`,
		left: `${subPos.x}px`
	} }, BdApi.React.createElement("nav", { className: "colorwaysContextMenu" }, layouts.map(({ name, id }) => {
		return BdApi.React.createElement("button", { onClick: () => onLayout_intrnl(id), className: "colorwaysContextMenuItm" }, name, BdApi.React.createElement(Radio, { checked: layout === id, style: {
			marginLeft: "8px"
		} }));
	}))) : null)) : null, BdApi.React.createElement("button", { className: "colorwaysPillButton colorwaysPillButton-primary", onClick: rightClickContextMenu }, BdApi.React.createElement(CogIcon, { width: 14, height: 14 }), " Options..."));
}

function Selector({
	settings = { selectorType: "normal" },
	hasTheme = false
}) {
	const [colorwayData, setColorwayData] = React.useState([]);
	const [searchValue, setSearchValue] = React.useState("");
	const [sortBy, setSortBy] = React.useState(SortOptions.MOST_USED);
	const [activeColorwayObject, setActiveColorwayObject] = React.useState(contexts.activeColorwayObject);
	const [customColorwayData, setCustomColorwayData] = React.useState(contexts.customColorways.map((colorSrc) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
	const [showSpinner, setShowSpinner] = React.useState(false);
	const [visibleSources, setVisibleSources] = React.useState("all");
	const [selectedColorways, setSelectedColorways] = React.useState([]);
	const [errorCode, setErrorCode] = React.useState(0);
	const [wsConnected, setWsConnected] = React.useState(wsOpen);
	const [theme, setTheme] = React.useState(contexts.colorwaysPluginTheme);
	const [isManager, setManager] = React.useState(hasManagerRole);
	const [autoPreset, setAutoPreset] = React.useState(contexts.activeAutoPreset);
	const [layout, setLayout] = React.useState("normal");
	const [usageMetrics, setUsageMetrics] = React.useState(contexts.colorwayUsageMetrics);
	React.useEffect(() => {
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_WS_CONNECTED", ({ isConnected }) => setWsConnected(isConnected));
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_ACTIVE_COLORWAY", ({ active }) => setActiveColorwayObject(active));
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_WS_MANAGER_ROLE", ({ isManager: isManager2 }) => setManager(isManager2));
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_THEME", ({ theme: theme2 }) => setTheme(theme2));
		return () => {
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_WS_CONNECTED", ({ isConnected }) => setWsConnected(isConnected));
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_ACTIVE_COLORWAY", ({ active }) => setActiveColorwayObject(active));
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_WS_MANAGER_ROLE", ({ isManager: isManager2 }) => setManager(isManager2));
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_THEME", ({ theme: theme2 }) => setTheme(theme2));
		};
	}, [isManager]);
	function setColorway(obj, src, action) {
		if (action === "add") {
			const srcList = customColorwayData.map((s) => {
				if (s.source === src) {
					return { name: s.source, colorways: [...s.colorways, obj] };
				}
				return { name: s.source, colorways: s.colorways };
			});
			setCustomColorwayData(srcList.map((colorSrc) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
			setContext("customColorways", srcList);
			updateRemoteSources();
		}
		if (action === "remove") {
			const srcList = customColorwayData.map((s) => {
				if (s.source === src) {
					return { name: s.source, colorways: s.colorways.filter((c) => c.name !== obj.name) };
				}
				return { name: s.source, colorways: s.colorways };
			});
			setCustomColorwayData(srcList.map((colorSrc) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
			setContext("customColorways", srcList);
			updateRemoteSources();
		}
	}
	const filters = [
		{
			name: "All",
			id: "all",
			sources: [...colorwayData, ...customColorwayData]
		},
		...colorwayData.map((source) => ({
			name: source.source,
			id: source.source.toLowerCase().replaceAll(" ", "-"),
			sources: [source]
		})),
		...customColorwayData.map((source) => ({
			name: source.source,
			id: source.source.toLowerCase().replaceAll(" ", "-"),
			sources: [source]
		}))
	];
	React.useEffect(() => {
		(async function() {
			if (settings.previewSource) {
				setShowSpinner(true);
				const res = await fetch(settings.previewSource);
				const dataPromise = res.json().then((data2) => data2).catch(() => ({ colorways: [], errorCode: 1, errorMsg: "Colorway Source format is invalid" }));
				const data = await dataPromise;
				if (data.errorCode) {
					setErrorCode(data.errorCode);
				}
				const colorwayList = data.css ? data.css.map((customStore) => customStore.colorways).flat() : data.colorways;
				setColorwayData([{ colorways: colorwayList || [], source: res.url, type: "online" }]);
				setShowSpinner(false);
			} else setColorwayData(contexts.colorwayData);
		})();
	}, []);
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("div", { className: "colorwayModal-selectorHeader", "data-theme": hasTheme ? theme : "discord" }, BdApi.React.createElement(
		"input",
		{
			type: "text",
			className: "colorwayTextBox",
			placeholder: "Search for Colorways...",
			value: searchValue,
			autoFocus: true,
			onInput: ({ currentTarget: { value } }) => setSearchValue(value)
		}
	), BdApi.React.createElement(Spinner, { className: `colorwaySelectorSpinner${!showSpinner ? " colorwaySelectorSpinner-hidden" : ""}` }), BdApi.React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } }, BdApi.React.createElement(
		ReloadButton,
		{
			onClick: async (data) => setColorwayData(data),
			setShowSpinner
		}
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-primary",
			onClick: () => {
				openModal((props) => BdApi.React.createElement(
					SaveColorwayAsModal,
					{
						modalProps: props,
						loadUI: async () => {
							setContext("customColorways", await DataStore.get("customColorways"));
							setCustomColorwayData((await DataStore.get("customColorways")).map((colorSrc) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
						}
					}
				));
			}
		},
		BdApi.React.createElement(PlusIcon, { width: 14, height: 14, style: { boxSizing: "content-box" } }),
		"Add..."
	), BdApi.React.createElement(
		SelectorOptionsMenu,
		{
			sort: sortBy,
			layout,
			onSortChange: (newSort) => {
				setSortBy(newSort);
			},
			source: filters.find((filter) => filter.id === visibleSources),
			sources: filters,
			onSourceChange: (sourceId) => {
				setVisibleSources(sourceId);
			},
			onLayout: (l) => {
				setLayout(l);
			},
			onAutoPreset: (activeAutoPreset) => {
				setAutoPreset(activeAutoPreset);
				setContext("activeAutoPreset", activeAutoPreset);
				if (activeColorwayObject.id === "Auto" && activeColorwayObject.sourceType === "auto") {
					const { colors } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset];
					const newObj = {
						id: "Auto",
						sourceType: "auto",
						source: "OS Accent Color",
						colors
					};
					if (isManager) {
						sendColorway(newObj);
					} else {
						setContext("activeColorwayObject", newObj);
						setActiveColorwayObject(newObj);
						DataStore.get("colorwaysPreset").then((colorwaysPreset) => {
							if (colorwaysPreset === "default") {
								ColorwayCSS.set(generateCss(
									colors,
									true,
									true,
									void 0,
									newObj.id
								));
							} else {
								if (gradientPresetIds.includes(colorwaysPreset)) {
									ColorwayCSS.set(getPreset(colors)[colorwaysPreset].preset.full);
								} else {
									ColorwayCSS.set(getPreset(colors)[colorwaysPreset].preset);
								}
							}
						});
					}
				}
			}
		}
	))), wsConnected && settings.selectorType === "normal" && !isManager ? BdApi.React.createElement("div", { className: "colorwaysManagerActive" }, "A manager is connected. Color selection is locked", BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-primary",
			onClick: requestManagerRole
		},
		BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", fill: "none", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { fill: "currentColor", "fill-rule": "evenodd", d: "M6 9h1V6a5 5 0 0 1 10 0v3h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3Zm9-3v3H9V6a3 3 0 1 1 6 0Zm-1 8a2 2 0 0 1-1 1.73V18a1 1 0 1 1-2 0v-2.27A2 2 0 1 1 14 14Z", "clip-rule": "evenodd" })),
		"Request Manager Role"
	)) : BdApi.React.createElement(BdApi.React.Fragment, null), BdApi.React.createElement("div", { style: { maxHeight: settings.selectorType === "multiple-selection" ? "50%" : "unset" }, className: "colorways-selector", "data-theme": hasTheme ? theme : "discord", "data-layout": layout }, activeColorwayObject.sourceType === "temporary" && settings.selectorType === "normal" && BdApi.React.createElement(
		"div",
		{
			className: "discordColorway",
			id: "colorway-Temporary",
			role: "button",
			"aria-checked": activeColorwayObject.sourceType === "temporary",
			onClick: async () => {
				setContext("activeColorwayObject", nullColorwayObj);
				setActiveColorwayObject(nullColorwayObj);
				ColorwayCSS.remove();
			}
		},
		BdApi.React.createElement("div", { className: "discordColorwayPreviewColorContainer" }, BdApi.React.createElement(
			"div",
			{
				className: "discordColorwayPreviewColor",
				style: { backgroundColor: "#" + activeColorwayObject.colors.accent }
			}
		), BdApi.React.createElement(
			"div",
			{
				className: "discordColorwayPreviewColor",
				style: { backgroundColor: "#" + activeColorwayObject.colors.primary }
			}
		), BdApi.React.createElement(
			"div",
			{
				className: "discordColorwayPreviewColor",
				style: { backgroundColor: "#" + activeColorwayObject.colors.secondary }
			}
		), BdApi.React.createElement(
			"div",
			{
				className: "discordColorwayPreviewColor",
				style: { backgroundColor: "#" + activeColorwayObject.colors.tertiary }
			}
		)),
		BdApi.React.createElement("div", { className: "colorwayLabelContainer" }, BdApi.React.createElement("span", { className: "colorwayLabel" }, activeColorwayObject.id), BdApi.React.createElement("span", { className: "colorwayLabel colorwayLabelSubnote colorwaysNote" }, "Temporary Colorway")),
		BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-secondary",
				onClick: async (e) => {
					e.stopPropagation();
					openModal((props) => BdApi.React.createElement(
						SaveColorwayAsModal,
						{
							modalProps: props,
							colorwayObject: activeColorwayObject,
							loadUI: async () => {
								setContext("customColorways", await DataStore.get("customColorways"));
								setCustomColorwayData((await DataStore.get("customColorways")).map((colorSrc) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
							}
						}
					));
				}
			},
			BdApi.React.createElement(PlusIcon, { width: 20, height: 20 })
		)
	), getComputedStyle(document.body).getPropertyValue("--os-accent-color") && settings.selectorType === "normal" && "auto".includes(searchValue.toLowerCase()) ? BdApi.React.createElement(
		"div",
		{
			className: "discordColorway",
			id: "colorway-Auto",
			role: "button",
			"aria-checked": activeColorwayObject.id === "Auto" && activeColorwayObject.sourceType === "auto",
			onClick: async () => {
				const activeAutoPreset = await DataStore.get("activeAutoPreset");
				if (activeColorwayObject.id === "Auto" && activeColorwayObject.sourceType === "auto") {
					if (isManager) {
						sendColorway(nullColorwayObj);
					} else {
						setContext("activeColorwayObject", nullColorwayObj);
						setActiveColorwayObject(nullColorwayObj);
						ColorwayCSS.remove();
					}
				} else {
					const { colors } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset];
					const newObj = {
						id: "Auto",
						sourceType: "online",
						source: null,
						colors
					};
					if (isManager) {
						sendColorway(newObj);
					} else {
						ColorwayCSS.set(generateCss(
							colors,
							true,
							true,
							void 0,
							"Auto Colorway"
						));
						setContext("activeColorwayObject", newObj);
						setActiveColorwayObject(newObj);
					}
				}
			}
		},
		BdApi.React.createElement("div", { className: "discordColorwayPreviewColorContainer", style: { backgroundColor: "var(--os-accent-color)" } }),
		BdApi.React.createElement("div", { className: "colorwayLabelContainer" }, BdApi.React.createElement("span", { className: "colorwayLabel" }, "Auto Colorway"), BdApi.React.createElement("span", { className: "colorwayLabel colorwayLabelSubnote colorwaysNote" }, "Active preset: ", Object.values(getAutoPresets()).find((pr) => pr.id === autoPreset)?.name)),
		BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-secondary",
				onClick: async (e) => {
					e.stopPropagation();
					openModal((props) => BdApi.React.createElement(AutoColorwaySelector, { autoColorwayId: autoPreset, modalProps: props, onChange: (autoPresetId) => {
						setAutoPreset(autoPresetId);
						if (activeColorwayObject.id === "Auto") {
							const { colors } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[autoPreset];
							const newObj = {
								id: "Auto",
								sourceType: "online",
								source: null,
								colors
							};
							if (isManager) {
								sendColorway(newObj);
							} else {
								setContext("activeColorwayObject", newObj);
								setActiveColorwayObject(newObj);
								DataStore.get("colorwaysPreset").then((colorwaysPreset) => {
									if (colorwaysPreset === "default") {
										ColorwayCSS.set(generateCss(
											colors,
											true,
											true,
											void 0,
											newObj.id
										));
									} else {
										if (gradientPresetIds.includes(colorwaysPreset)) {
											ColorwayCSS.set(getPreset(colors)[colorwaysPreset].preset.full);
										} else {
											ColorwayCSS.set(getPreset(colors)[colorwaysPreset].preset);
										}
									}
								});
							}
						}
					} }));
				}
			},
			BdApi.React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", style: { margin: "4px" }, viewBox: "0 0 24 24", fill: "currentColor" }, BdApi.React.createElement("path", { d: "M 21.2856,9.6 H 24 v 4.8 H 21.2868 C 20.9976,15.5172 20.52,16.5576 19.878,17.4768 L 21.6,19.2 19.2,21.6 17.478,19.8768 c -0.9216,0.642 -1.9596,1.1208 -3.078,1.4088 V 24 H 9.6 V 21.2856 C 8.4828,20.9976 7.4436,20.5188 6.5232,19.8768 L 4.8,21.6 2.4,19.2 4.1232,17.4768 C 3.4812,16.5588 3.0024,15.5184 2.7144,14.4 H 0 V 9.6 H 2.7144 C 3.0024,8.4816 3.48,7.4424 4.1232,6.5232 L 2.4,4.8 4.8,2.4 6.5232,4.1232 C 7.4424,3.48 8.4816,3.0024 9.6,2.7144 V 0 h 4.8 v 2.7132 c 1.1184,0.2892 2.1564,0.7668 3.078,1.4088 l 1.722,-1.7232 2.4,2.4 -1.7232,1.7244 c 0.642,0.9192 1.1208,1.9596 1.4088,3.0768 z M 12,16.8 c 2.65092,0 4.8,-2.14908 4.8,-4.8 0,-2.650968 -2.14908,-4.8 -4.8,-4.8 -2.650968,0 -4.8,2.149032 -4.8,4.8 0,2.65092 2.149032,4.8 4.8,4.8 z" }))
		)
	) : BdApi.React.createElement(BdApi.React.Fragment, null), errorCode !== 0 && BdApi.React.createElement("span", { style: {
		color: "#fff",
		margin: "auto",
		fontWeight: "bold",
		display: "flex",
		gap: "8px",
		alignItems: "center"
	} }, errorCode === 1 && "Error: Invalid Colorway Source Format. If this error persists, contact the source author to resolve the issue."), (filters.find((filter) => filter.id === visibleSources) || { name: "null", id: "null", sources: [] }).sources.map(({ colorways, source, type }) => colorways.map((colorway) => ({ ...colorway, sourceType: type, source, preset: colorway.preset || (colorway.isGradient ? "Gradient" : "Default") }))).flat().sort((a, b) => {
		const objA = {
			id: a.name,
			source: a.source,
			sourceType: a.sourceType,
			colors: {}
		};
		a.accent ? objA.colors.accent = "#" + colorToHex(a.accent) : void 0;
		a.primary ? objA.colors.primary = "#" + colorToHex(a.primary) : void 0;
		a.secondary ? objA.colors.secondary = "#" + colorToHex(a.secondary) : void 0;
		a.tertiary ? objA.colors.tertiary = "#" + colorToHex(a.tertiary) : void 0;
		const objB = {
			id: b.name,
			source: b.source,
			sourceType: b.sourceType,
			colors: {}
		};
		b.accent ? objB.colors.accent = "#" + colorToHex(b.accent) : void 0;
		b.primary ? objB.colors.primary = "#" + colorToHex(b.primary) : void 0;
		b.secondary ? objB.colors.secondary = "#" + colorToHex(b.secondary) : void 0;
		b.tertiary ? objB.colors.tertiary = "#" + colorToHex(b.tertiary) : void 0;
		const aMetric = usageMetrics.find((metric) => compareColorwayObjects(metric, objA)) || { ...objA, uses: 0 };
		const bMetric = usageMetrics.find((metric) => compareColorwayObjects(metric, objB)) || { ...objB, uses: 0 };
		switch (sortBy) {
			case SortOptions.NAME_AZ:
				return a.name.localeCompare(b.name);
			case SortOptions.NAME_ZA:
				return b.name.localeCompare(a.name);
			case SortOptions.SOURCE_AZ:
				return a.source.localeCompare(b.source);
			case SortOptions.SOURCE_ZA:
				return b.source.localeCompare(a.source);
			case SortOptions.SOURCETYPE_ONLINE:
				return a.sourceType === "online" ? -1 : 1;
			case SortOptions.SOURCETYPE_OFFLINE:
				return a.sourceType === "offline" ? -1 : 1;
			case SortOptions.COLORCOUNT_ASCENDING:
				return (a.colors || [
					"accent",
					"primary",
					"secondary",
					"tertiary"
				]).length - (b.colors || [
					"accent",
					"primary",
					"secondary",
					"tertiary"
				]).length;
			case SortOptions.COLORCOUNT_DESCENDING:
				return (b.colors || [
					"accent",
					"primary",
					"secondary",
					"tertiary"
				]).length - (a.colors || [
					"accent",
					"primary",
					"secondary",
					"tertiary"
				]).length;
			case SortOptions.MOST_USED:
				if (aMetric.uses === bMetric.uses) {
					return a.name.localeCompare(b.name);
				} else {
					return bMetric.uses - aMetric.uses;
				}
			case SortOptions.LEAST_USED:
				if (aMetric.uses === bMetric.uses) {
					return b.name.localeCompare(a.name);
				} else {
					return aMetric.uses - bMetric.uses;
				}
			default:
				return a.name.localeCompare(b.name);
		}
	}).filter(({ name }) => name.toLowerCase().includes(searchValue.toLowerCase())).map((color) => BdApi.React.createElement(RightClickContextMenu, { menu: BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("div", { className: "colorwaysContextMenuColors" }, (color.colors || [
		"accent",
		"primary",
		"secondary",
		"tertiary"
	]).map((c) => BdApi.React.createElement("div", { className: "colorwaysContextMenuColor", style: { backgroundColor: "#" + colorToHex(color[c]) }, onClick: () => {
		Clipboard.copy("#" + colorToHex(color[c]));
		Toasts.show({
			message: "Copied Color Successfully",
			type: 1,
			id: "copy-color-notify"
		});
	} }))), BdApi.React.createElement("button", { onClick: () => {
		const colorwayIDArray = `${color.accent},${color.primary},${color.secondary},${color.tertiary}|n:${color.name}${color.preset ? `|p:${color.preset}` : ""}`;
		const colorwayID = stringToHex(colorwayIDArray);
		Clipboard.copy(colorwayID);
		Toasts.show({
			message: "Copied Colorway ID Successfully",
			type: 1,
			id: "copy-colorway-id-notify"
		});
	}, className: "colorwaysContextMenuItm" }, "Copy Colorway ID", BdApi.React.createElement(IDIcon, { width: 16, height: 16, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => {
		const newObj = {
			id: color.name,
			sourceType: color.sourceType,
			source: color.source,
			colors: {}
		};
		color.accent ? newObj.colors.accent = "#" + colorToHex(color.accent) : void 0;
		color.primary ? newObj.colors.primary = "#" + colorToHex(color.primary) : void 0;
		color.secondary ? newObj.colors.secondary = "#" + colorToHex(color.secondary) : void 0;
		color.tertiary ? newObj.colors.tertiary = "#" + colorToHex(color.tertiary) : void 0;
		Clipboard.copy(generateCss(
			newObj.colors,
			true,
			true,
			void 0,
			newObj.id
		));
		Toasts.show({
			message: "Copied CSS to Clipboard",
			type: 1,
			id: "copy-colorway-css-notify"
		});
	}, className: "colorwaysContextMenuItm" }, "Copy CSS", BdApi.React.createElement(CodeIcon, { width: 16, height: 16, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => {
		const newObj = {
			id: color.name,
			sourceType: color.sourceType,
			source: color.source,
			colors: {}
		};
		color.accent ? newObj.colors.accent = "#" + colorToHex(color.accent) : void 0;
		color.primary ? newObj.colors.primary = "#" + colorToHex(color.primary) : void 0;
		color.secondary ? newObj.colors.secondary = "#" + colorToHex(color.secondary) : void 0;
		color.tertiary ? newObj.colors.tertiary = "#" + colorToHex(color.tertiary) : void 0;
		saveFile(new File([`/**
														* @name ${color.name || "Colorway"}
														* @version ${PluginProps.CSSVersion}
														* @description Automatically generated Colorway.
														* @author ${exports.UserStore.getCurrentUser().username}
														* @authorId ${exports.UserStore.getCurrentUser().id}
														*/
													 ${generateCss(
			newObj.colors,
			true,
			true,
			void 0,
			newObj.id
		)}`], `${color.name.replaceAll(" ", "-").toLowerCase()}.theme.css`, { type: "text/plain" }));
	}, className: "colorwaysContextMenuItm" }, "Download CSS as Theme", BdApi.React.createElement(DownloadIcon, { width: 16, height: 16, style: {
		marginLeft: "8px"
	} })), color.sourceType === "offline" ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: async () => {
		openModal((props) => BdApi.React.createElement(
			SaveColorwayAsModal,
			{
				store: color.source,
				colorwayObject: {
					id: color.name,
					source: color.source,
					sourceType: color.sourceType,
					colors: {
						accent: colorToHex(color.accent) || "5865f2",
						primary: colorToHex(color.primary) || "313338",
						secondary: colorToHex(color.secondary) || "2b2d31",
						tertiary: colorToHex(color.tertiary) || "1e1f22"
					}
				},
				modalProps: props,
				loadUI: async () => {
					setContext("customColorways", await DataStore.get("customColorways"));
					setCustomColorwayData((await DataStore.get("customColorways")).map((colorSrc) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
				}
			}
		));
	}, className: "colorwaysContextMenuItm" }, "Edit Colorway", BdApi.React.createElement(PencilIcon, { width: 16, height: 16, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => {
		openModal((props) => BdApi.React.createElement(
			Modal,
			{
				modalProps: props,
				title: "Delete Colorway",
				onFinish: async ({ closeModal }) => {
					if (activeColorwayObject.id === color.name) {
						setContext("activeColorwayObject", nullColorwayObj);
						setActiveColorwayObject(nullColorwayObj);
						ColorwayCSS.remove();
					}
					setColorway(color, color.source, "remove");
					closeModal();
				},
				confirmMsg: "Delete",
				type: "danger"
			},
			"Are you sure you want to delete this colorway? This cannot be undone!"
		));
	}, className: "colorwaysContextMenuItm colorwaysContextMenuItm-danger" }, "Delete Colorway...", BdApi.React.createElement(DeleteIcon, { width: 16, height: 16, style: {
		marginLeft: "8px"
	} }))) : null, color.sourceType === "online" ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: async () => {
		openModal((props) => BdApi.React.createElement(
			SaveColorwayAsModal,
			{
				colorwayObject: {
					id: color.name,
					source: color.source,
					sourceType: color.sourceType,
					colors: {
						accent: colorToHex(color.accent) || "5865f2",
						primary: colorToHex(color.primary) || "313338",
						secondary: colorToHex(color.secondary) || "2b2d31",
						tertiary: colorToHex(color.tertiary) || "1e1f22"
					}
				},
				modalProps: props,
				loadUI: async () => {
					setContext("customColorways", await DataStore.get("customColorways"));
					setCustomColorwayData((await DataStore.get("customColorways")).map((colorSrc) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
				}
			}
		));
	}, className: "colorwaysContextMenuItm" }, "Edit Colorway Locally", BdApi.React.createElement(PencilIcon, { width: 16, height: 16, style: {
		marginLeft: "8px"
	} }))) : null) }, ({ onContextMenu }) => BdApi.React.createElement(
		"div",
		{
			className: "discordColorway",
			role: "button",
			id: "colorway-" + color.name,
			onContextMenu,
			"aria-checked": activeColorwayObject.id === color.name && activeColorwayObject.source === color.source,
			onClick: async () => {
				if (settings.selectorType === "normal") {
					if (activeColorwayObject.id === color.name && activeColorwayObject.source === color.source) {
						if (isManager) {
							sendColorway(nullColorwayObj);
						} else {
							setContext("activeColorwayObject", nullColorwayObj);
							setActiveColorwayObject(nullColorwayObj);
							ColorwayCSS.remove();
						}
					} else {
						const newObj = {
							id: color.name,
							sourceType: color.sourceType,
							source: color.source,
							colors: {}
						};
						color.accent ? newObj.colors.accent = "#" + colorToHex(color.accent) : void 0;
						color.primary ? newObj.colors.primary = "#" + colorToHex(color.primary) : void 0;
						color.secondary ? newObj.colors.secondary = "#" + colorToHex(color.secondary) : void 0;
						color.tertiary ? newObj.colors.tertiary = "#" + colorToHex(color.tertiary) : void 0;
						if (usageMetrics.find((metric) => compareColorwayObjects(metric, newObj))) {
							const foundMetric = usageMetrics.find((metric) => compareColorwayObjects(metric, newObj));
							const newMetrics = [...usageMetrics.filter((metric) => !compareColorwayObjects(metric, newObj)), { ...foundMetric, uses: (foundMetric?.uses || 0) + 1 }];
							setContext("colorwayUsageMetrics", newMetrics);
							setUsageMetrics(newMetrics);
						} else {
							const newMetrics = [...usageMetrics, { ...newObj, uses: 1 }];
							setContext("colorwayUsageMetrics", newMetrics);
							setUsageMetrics(newMetrics);
						}
						if (color.linearGradient) newObj.linearGradient = color.linearGradient;
						if (isManager) sendColorway(newObj);
						else {
							setActiveColorwayObject(newObj);
							setContext("activeColorwayObject", newObj);
							DataStore.get("colorwaysPreset").then((colorwaysPreset) => {
								if (colorwaysPreset === "default") {
									ColorwayCSS.set(generateCss(
										newObj.colors,
										true,
										true,
										void 0,
										newObj.id
									));
								} else {
									if (gradientPresetIds.includes(colorwaysPreset)) {
										const css = Object.keys(newObj).includes("linearGradient") ? gradientBase(newObj.colors, true) + `:root:root {--custom-theme-background: linear-gradient(${newObj.linearGradient})}` : getPreset(newObj.colors)[colorwaysPreset].preset.full;
										ColorwayCSS.set(css);
									} else {
										ColorwayCSS.set(getPreset(newObj.colors)[colorwaysPreset].preset);
									}
								}
							});
						}
					}
				}
				if (settings.selectorType === "multiple-selection") {
					if (selectedColorways.includes(color)) {
						setSelectedColorways(selectedColorways.filter((c) => c !== color));
					} else {
						setSelectedColorways([...selectedColorways, color]);
					}
				}
			}
		},
		BdApi.React.createElement("div", { className: "discordColorwayPreviewColorContainer" }, !color.isGradient ? Object.values({
			accent: color.accent,
			primary: color.primary,
			secondary: color.secondary,
			tertiary: color.tertiary
		}).map((colorStr) => BdApi.React.createElement(
			"div",
			{
				className: "discordColorwayPreviewColor",
				style: {
					backgroundColor: `#${colorToHex(colorStr)}`
				}
			}
		)) : BdApi.React.createElement(
			"div",
			{
				className: "discordColorwayPreviewColor",
				style: {
					background: `linear-gradient(${color.linearGradient})`
				}
			}
		)),
		BdApi.React.createElement("div", { className: "colorwayLabelContainer" }, BdApi.React.createElement("span", { className: "colorwayLabel" }, color.name), BdApi.React.createElement("span", { className: "colorwayLabel colorwayLabelSubnote colorwaysNote" }, "by ", color.author, " \u2022 from ", color.source))
	))), !filters.flatMap((f) => f.sources.map((s) => s.colorways)).flat().length ? BdApi.React.createElement(
		"div",
		{
			className: "discordColorway",
			role: "button",
			id: "colorway-nocolorways"
		},
		BdApi.React.createElement(WirelessIcon, { width: 30, height: 30, style: { color: "var(--interactive-active)" } }),
		BdApi.React.createElement("div", { className: "colorwayLabelContainer" }, BdApi.React.createElement("span", { className: "colorwayLabel" }, "It's quite emty in here."), BdApi.React.createElement("span", { className: "colorwayLabel colorwayLabelSubnote colorwaysNote" }, "Try searching for something else, or add another source"))
	) : null));
}

function FeaturePresenter({ items, ...props }) {
	return BdApi.React.createElement("div", { ...props, className: "colorwaysFeaturePresent" }, items.map(({ Icon }) => BdApi.React.createElement("div", { className: "colorwaysFeatureIconContainer" }, BdApi.React.createElement(Icon, { width: 48, height: 48 }))), items.map(({ title }) => BdApi.React.createElement("span", { className: "colorwaysFeatureIconLabel" }, title)));
}

function ReloadRequiredModal({ modalProps }) {
	return BdApi.React.createElement(
		Modal,
		{
			modalProps,
			title: "Restart required!",
			confirmMsg: "Reload",
			onFinish: () => location.reload()
		},
		"Reload Discord to reset/import settings to DiscordColorways"
	);
}

function TabBar({
	items = [],
	container = ({ children }) => BdApi.React.createElement(BdApi.React.Fragment, null, children),
	onChange,
	active = ""
}) {
	return BdApi.React.createElement(BdApi.React.Fragment, null, container({
		children: BdApi.React.createElement("div", { className: "colorwaysMenuTabs" }, items.map((item) => {
			return BdApi.React.createElement("div", { className: `colorwaysMenuTab ${active === item.name ? "active" : ""}`, onClick: () => onChange(item.name) }, item.name);
		}))
	}), items.map((item) => active === item.name ? item.component() : null));
}

function SettingsPage({
	hasTheme = false
}) {
	const colorways = contexts.colorwayData.flatMap((src) => src.colorways);
	const customColorways = contexts.customColorways.flatMap((src) => src.colorways);
	const [colorsButtonVisibility, setColorsButtonVisibility] = React.useState(contexts.showColorwaysButton);
	const [theme, setTheme] = React.useState(contexts.colorwaysPluginTheme);
	const [shouldAutoconnect, setShouldAutoconnect] = React.useState(contexts.colorwaysManagerDoAutoconnect);
	const [autoconnectDelay, setAutoconnectDelay] = React.useState(contexts.colorwaysManagerAutoconnectPeriod / 1e3);
	const [forceVR, setForceVR] = React.useState(contexts.colorwaysForceVR);
	const [active, setActive] = React.useState("Settings");
	return BdApi.React.createElement("div", { className: "colorwaysModalTab", "data-theme": hasTheme ? theme : "discord" }, BdApi.React.createElement(
		TabBar,
		{
			active,
			container: ({ children }) => BdApi.React.createElement("div", { className: "colorwaysPageHeader" }, children),
			items: [
				{
					name: "Settings",
					component: () => BdApi.React.createElement("div", { className: "colorwayInnerTab", style: { gap: 0 } }, BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader" }, "Quick Switch"), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement(
						Switch,
						{
							value: colorsButtonVisibility,
							label: "Enable Quick Switch",
							id: "showColorwaysButton",
							onChange: (v) => {
								setColorsButtonVisibility(v);
								setContext("showColorwaysButton", v);
								FluxDispatcher.dispatch({
									type: "COLORWAYS_UPDATE_BUTTON_VISIBILITY",
									isVisible: v
								});
							}
						}
					), BdApi.React.createElement("span", { className: "colorwaysNote" }, "Shows a button on the top of the servers list that opens a colorway selector modal.")), BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader" }, "Appearance"), BdApi.React.createElement(Setting, null, BdApi.React.createElement("div", { style: {
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
						cursor: "pointer"
					} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "Plugin Theme"), BdApi.React.createElement(
						"select",
						{
							className: "colorwaysPillButton colorwaysPillButton-primary",
							style: { border: "none" },
							onChange: ({ currentTarget: { value } }) => {
								setTheme(value);
								setContext("colorwaysPluginTheme", value);
								FluxDispatcher.dispatch({
									type: "COLORWAYS_UPDATE_THEME",
									theme: value
								});
							},
							value: theme
						},
						BdApi.React.createElement("option", { value: "discord" }, "Discord (Default)"),
						BdApi.React.createElement("option", { value: "colorish" }, "Colorish")
					))), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement(
						Switch,
						{
							value: forceVR,
							label: "Force Visual Refresh Variant on Discord Theme",
							id: "forceVRVar",
							onChange: (v) => {
								setForceVR(v);
								setContext("colorwaysForceVR", v);
								FluxDispatcher.dispatch({
									type: "COLORWAYS_UPDATE_FORCE_VR",
									enabled: v
								});
							}
						}
					), BdApi.React.createElement("span", { className: "colorwaysNote" }, "Note: Only applies to Modals")), BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader" }, "Manager"), BdApi.React.createElement(Setting, null, BdApi.React.createElement(
						Switch,
						{
							value: shouldAutoconnect,
							label: "Automatically retry to connect to Manager",
							id: "autoReconnect",
							onChange: (v) => {
								setShouldAutoconnect(v);
								setContext("colorwaysManagerDoAutoconnect", v);
								if (!isWSOpen() && v) connect();
							}
						}
					)), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
						cursor: "pointer"
					} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "Reconnection Delay (in seconds)"), BdApi.React.createElement(
						"input",
						{
							type: "number",
							className: "colorwayTextBox",
							style: {
								width: "100px",
								textAlign: "end"
							},
							value: autoconnectDelay,
							autoFocus: true,
							onInput: ({ currentTarget: { value } }) => {
								setAutoconnectDelay(Number(value || "0"));
								setContext("colorwaysManagerAutoconnectPeriod", Number(value || "0") * 1e3);
							}
						}
					))), BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader" }, "Configuration"), BdApi.React.createElement(Setting, null, BdApi.React.createElement("div", { style: {
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
						cursor: "pointer"
					} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "Manage Settings..."), BdApi.React.createElement(
						"button",
						{
							className: "colorwaysPillButton colorwaysPillButton-primary",
							onClick: async () => {
								const keys = [
									"customColorways",
									"colorwaySourceFiles",
									"showColorwaysButton",
									"activeColorwayObject",
									"colorwaysPluginTheme",
									"colorwaysBoundManagers",
									"colorwaysManagerAutoconnectPeriod",
									"colorwaysManagerDoAutoconnect",
									"colorwaysPreset",
									"colorwaysForceVR",
									"activeAutoPreset",
									"colorwayUsageMetrics"
								];
								const data = await DataStore.getMany(keys);
								const settings = {};
								keys.forEach((key, i) => {
									settings[key] = data[i];
								});
								saveFile(new File([JSON.stringify(settings)], "DiscordColorways.settings.json", { type: "application/json" }));
							}
						},
						"Export"
					), BdApi.React.createElement(
						"button",
						{
							className: "colorwaysPillButton colorwaysPillButton-danger",
							style: {
								marginLeft: "8px"
							},
							onClick: () => {
								openModal((props) => BdApi.React.createElement(
									Modal,
									{
										modalProps: props,
										title: "Import Settings for DiscordColorways",
										onFinish: async ({ closeModal }) => {
											const file = await chooseFile("application/json");
											if (!file) return;
											const reader = new FileReader();
											reader.onload = async () => {
												const settings = JSON.parse(reader.result);
												Object.keys(settings).forEach(async (key) => {
													await DataStore.set(key, settings[key]);
												});
												closeModal();
												openModal((props2) => BdApi.React.createElement(ReloadRequiredModal, { modalProps: props2 }));
											};
										},
										confirmMsg: "Import File...",
										type: "danger"
									},
									"Are you sure you want to import a settings file? Current settings will be overwritten!"
								));
							}
						},
						"Import"
					))), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
						cursor: "pointer"
					} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "Reset plugin to default settings"), BdApi.React.createElement(
						"button",
						{
							className: "colorwaysPillButton colorwaysPillButton-danger",
							onClick: () => {
								openModal((props) => BdApi.React.createElement(
									Modal,
									{
										modalProps: props,
										title: "Reset DiscordColorways",
										onFinish: async ({ closeModal }) => {
											const resetValues = [
												["customColorways", []],
												["colorwaySourceFiles", [{
													name: "Project Colorway",
													url: defaultColorwaySource
												}]],
												["showColorwaysButton", false],
												["activeColorwayObject", nullColorwayObj],
												["colorwaysPluginTheme", "discord"],
												["colorwaysBoundManagers", []],
												["colorwaysManagerAutoconnectPeriod", 3e3],
												["colorwaysManagerDoAutoconnect", true],
												["colorwaysPreset", "default"],
												["colorwaysForceVR", false],
												["activeAutoPreset", "hueRotation"],
												["colorwayUsageMetrics", []]
											];
											DataStore.setMany(resetValues);
											closeModal();
											openModal((props2) => BdApi.React.createElement(ReloadRequiredModal, { modalProps: props2 }));
										},
										confirmMsg: "Reset Plugin",
										type: "danger"
									},
									"Are you sure you want to reset DiscordColorways to its default settings? This will delete:",
									BdApi.React.createElement(
										FeaturePresenter,
										{
											style: {
												marginTop: "16px"
											},
											items: [
												{
													Icon: WirelessIcon,
													title: "Your Online and Offline Sources"
												},
												{
													Icon: PalleteIcon,
													title: "Your Colorways"
												},
												{
													Icon: CogIcon,
													title: "Your Settings"
												}
											]
										}
									)
								));
							}
						},
						"Reset..."
					)), BdApi.React.createElement("span", { className: "colorwaysNote" }, "Reset the plugin to its default settings. All bound managers, sources, and colorways will be deleted. Please reload Discord after use.")), BdApi.React.createElement("span", { className: "colorwaysModalFieldHeader" }, "About"), BdApi.React.createElement("h1", { className: "colorwaysWordmarkFirstPart" }, "Discord ", BdApi.React.createElement("span", { className: "colorwaysWordmarkSecondPart" }, "Colorways")), BdApi.React.createElement(
						"span",
						{
							style: {
								color: "var(--text-normal)",
								fontWeight: 500,
								fontSize: "14px",
								marginBottom: "12px"
							}
						},
						"by Project Colorway"
					), BdApi.React.createElement("div", { className: "colorwaysSettingsDivider", style: { marginBottom: "20px" } }), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
						cursor: "pointer"
					} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "Plugin Version"), BdApi.React.createElement("span", { className: "colorwaysNote" }, PluginProps.pluginVersion, " (", PluginProps.clientMod, ")"))), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
						cursor: "pointer"
					} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "UI Version"), BdApi.React.createElement("span", { className: "colorwaysNote" }, PluginProps.UIVersion))), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
						cursor: "pointer"
					} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "CSS Version"), BdApi.React.createElement("span", { className: "colorwaysNote" }, PluginProps.CSSVersion))), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
						cursor: "pointer"
					} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "Loaded Colorways"), BdApi.React.createElement("span", { className: "colorwaysNote" }, [...colorways, ...customColorways].length))), BdApi.React.createElement(Setting, null, BdApi.React.createElement("div", { style: {
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
						cursor: "pointer"
					} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "Project Links"), BdApi.React.createElement("a", { role: "link", target: "_blank", className: "colorwaysPillButton colorwaysPillButton-primary", style: { width: "fit-content" }, href: "https://github.com/DaBluLite/DiscordColorways" }, "DiscordColorways ", BdApi.React.createElement(OpenExternalIcon, { width: 16, height: 16 })), BdApi.React.createElement("a", { role: "link", target: "_blank", className: "colorwaysPillButton colorwaysPillButton-primary", style: { width: "fit-content", marginLeft: "8px" }, href: "https://github.com/DaBluLite/ProjectColorway" }, "Project Colorway ", BdApi.React.createElement(OpenExternalIcon, { width: 16, height: 16 })))))
				},
				{
					name: "History",
					component: () => BdApi.React.createElement("div", { className: "colorwayInnerTab" }, BdApi.React.createElement("div", { style: {
						display: "flex",
						gap: "8px"
					} }, BdApi.React.createElement(
						"button",
						{
							className: "colorwaysPillButton colorwaysPillButton-primary",
							style: { flexShrink: "0" },
							onClick: async () => {
								saveFile(new File([JSON.stringify(contexts.colorwayUsageMetrics)], "colorways_usage_metrics.json", { type: "application/json" }));
							}
						},
						BdApi.React.createElement(DownloadIcon, { width: 14, height: 14 }),
						"Export usage data"
					)), BdApi.React.createElement("div", { className: "colorways-selector", style: { gridTemplateColumns: "unset", flexGrow: "1" } }, contexts.colorwayUsageMetrics.map((color) => BdApi.React.createElement("div", { className: "discordColorway" }, BdApi.React.createElement("div", { className: "colorwayLabelContainer" }, BdApi.React.createElement("span", { className: "colorwayLabel" }, color.id), BdApi.React.createElement("span", { className: "colorwayLabel colorwayLabelSubnote colorwaysNote" }, "in ", color.source, " \u2022 ", color.uses, " uses"))))))
				}
			],
			onChange: setActive
		}
	));
}

function SourceManagerOptionsMenu({
	sort,
	onSortChange,
	onLayout,
	layout
}) {
	const [pos, setPos] = React.useState({ x: 0, y: 0 });
	const [subPos, setSubPos] = React.useState({ x: 0, y: 0 });
	const [showMenu, setShowMenu] = React.useState(false);
	const [showSort, setShowSort] = React.useState(false);
	const [showLayouts, setShowLayouts] = React.useState(false);
	const layouts = [{ name: "Normal", id: "normal" }, { name: "Compact", id: "compact" }];
	function rightClickContextMenu(e) {
		e.stopPropagation();
		window.dispatchEvent(new Event("click"));
		setShowMenu(!showMenu);
		setPos({
			x: e.currentTarget.getBoundingClientRect().x,
			y: e.currentTarget.getBoundingClientRect().y + e.currentTarget.offsetHeight + 8
		});
		return;
	}
	function onPageClick(e) {
		setShowMenu(false);
	}
	React.useEffect(() => {
		window.addEventListener("click", onPageClick);
		return () => {
			window.removeEventListener("click", onPageClick);
		};
	}, []);
	function onSortChange_internal(newSort) {
		onSortChange(newSort);
		setShowMenu(false);
		setShowSort(false);
	}
	function onLayout_intrnl(layout2) {
		onLayout(layout2);
		setShowMenu(false);
		setShowLayouts(false);
	}
	return BdApi.React.createElement(BdApi.React.Fragment, null, showMenu ? BdApi.React.createElement("nav", { className: "colorwaysContextMenu", style: {
		position: "fixed",
		top: `${pos.y}px`,
		left: `${pos.x}px`
	}, onClick: (e) => e.stopPropagation() }, BdApi.React.createElement("button", { className: "colorwaysContextMenuItm", onMouseEnter: (e) => {
		setShowSort(true);
		setSubPos({
			x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth,
			y: e.currentTarget.getBoundingClientRect().y
		});
	}, onMouseLeave: (e) => {
		const elem = document.elementFromPoint(e.clientX, e.clientY);
		if (elem !== e.currentTarget) {
			setShowSort(false);
		}
	} }, "Sort by: ", (() => {
		switch (sort) {
			case 1:
				return "Name (A-Z)";
			case 2:
				return "Name (Z-A)";
			default:
				return "Name (A-Z)";
		}
	})(), BdApi.React.createElement("div", { className: "colorwaysCaretContainer" }, BdApi.React.createElement(CaretIcon, { width: 16, height: 16 })), showSort ? BdApi.React.createElement("div", { className: "colorwaysSubmenuWrapper", style: {
		position: "fixed",
		top: `${subPos.y}px`,
		left: `${subPos.x}px`
	} }, BdApi.React.createElement("nav", { className: "colorwaysContextMenu" }, BdApi.React.createElement("button", { onClick: () => onSortChange_internal(1), className: "colorwaysContextMenuItm" }, "Name (A-Z)", BdApi.React.createElement(Radio, { checked: sort === 1, style: {
		marginLeft: "8px"
	} })), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(2), className: "colorwaysContextMenuItm" }, "Name (Z-A)", BdApi.React.createElement(Radio, { checked: sort === 2, style: {
		marginLeft: "8px"
	} })))) : BdApi.React.createElement(BdApi.React.Fragment, null)), BdApi.React.createElement("button", { className: "colorwaysContextMenuItm", onMouseEnter: (e) => {
		setShowLayouts(true);
		setSubPos({
			x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth,
			y: e.currentTarget.getBoundingClientRect().y
		});
	}, onMouseLeave: (e) => {
		const elem = document.elementFromPoint(e.clientX, e.clientY);
		if (elem !== e.currentTarget) {
			setShowLayouts(false);
		}
	} }, "Layout: ", layouts.find((l) => l.id === layout)?.name, BdApi.React.createElement("div", { className: "colorwaysCaretContainer" }, BdApi.React.createElement(CaretIcon, { width: 16, height: 16 })), showLayouts ? BdApi.React.createElement("div", { className: "colorwaysSubmenuWrapper", style: {
		position: "fixed",
		top: `${subPos.y}px`,
		left: `${subPos.x}px`
	} }, BdApi.React.createElement("nav", { className: "colorwaysContextMenu" }, layouts.map(({ name, id }) => {
		return BdApi.React.createElement("button", { onClick: () => onLayout_intrnl(id), className: "colorwaysContextMenuItm" }, name, BdApi.React.createElement(Radio, { checked: layout === id, style: {
			marginLeft: "8px"
		} }));
	}))) : null)) : null, BdApi.React.createElement("button", { className: "colorwaysPillButton colorwaysPillButton-primary", onClick: rightClickContextMenu }, BdApi.React.createElement(CogIcon, { width: 14, height: 14 }), " Options..."));
}

function SourceManager({
	hasTheme = false
}) {
	const [theme, setTheme] = React.useState(contexts.colorwaysPluginTheme);
	const [active, setActive] = React.useState("Installed");
	const [colorwaySourceFiles, setColorwaySourceFiles] = React.useState(contexts.colorwaySourceFiles);
	const [customColorwayStores, setCustomColorwayStores] = React.useState(contexts.customColorways);
	const [storeObject, setStoreObject] = React.useState([]);
	const [searchValue, setSearchValue] = React.useState("");
	const [searchValuee, setSearchValuee] = React.useState("");
	const [sortBy, setSortBy] = React.useState(SortOptions.NAME_AZ);
	const [layout, setLayout] = React.useState("normal");
	const [showSpinner, setShowSpinner] = React.useState(false);
	function setOnline(obj, action) {
		if (action === "add") {
			const srcList = [...colorwaySourceFiles, obj];
			setColorwaySourceFiles(srcList);
			setContext("colorwaySourceFiles", srcList);
		}
		if (action === "remove") {
			const srcList = colorwaySourceFiles.filter((src) => src.name !== obj.name && src.url !== obj.url);
			setColorwaySourceFiles(srcList);
			setContext("colorwaySourceFiles", srcList);
		}
		refreshSources();
		updateRemoteSources();
	}
	function setOffline(obj, action) {
		if (action === "add") {
			const srcList = [...customColorwayStores, obj];
			setCustomColorwayStores(srcList);
			setContext("customColorways", srcList);
		}
		if (action === "remove") {
			const srcList = customColorwayStores.filter((src) => src.name !== obj.name);
			setCustomColorwayStores(srcList);
			setContext("customColorways", srcList);
		}
		updateRemoteSources();
	}
	React.useEffect(() => {
		updateRemoteSources();
		(async function() {
			const res = await fetch("https://dablulite.vercel.app/?q=" + encodeURI(searchValue));
			const data = await res.json();
			setStoreObject(data.sources);
		})();
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_THEME", ({ theme: theme2 }) => setTheme(theme2));
		return () => {
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_THEME", ({ theme: theme2 }) => setTheme(theme2));
		};
	}, []);
	return BdApi.React.createElement("div", { className: "colorwaysModalTab", "data-theme": hasTheme ? theme : "discord" }, BdApi.React.createElement(TabBar, { active, container: ({ children }) => BdApi.React.createElement("div", { className: "colorwaysPageHeader" }, children), onChange: setActive, items: [
		{
			name: "Installed",
			component: () => BdApi.React.createElement("div", { className: "colorwayInnerTab" }, BdApi.React.createElement(
				"input",
				{
					type: "text",
					className: "colorwayTextBox",
					placeholder: "Search for sources...",
					value: searchValuee,
					autoFocus: true,
					onInput: ({ currentTarget: { value } }) => setSearchValuee(value)
				}
			), BdApi.React.createElement(Spinner, { className: `colorwaySelectorSpinner${!showSpinner ? " colorwaySelectorSpinner-hidden" : ""}` }), BdApi.React.createElement("div", { style: {
				display: "flex",
				gap: "8px"
			} }, BdApi.React.createElement(
				"button",
				{
					className: "colorwaysPillButton colorwaysPillButton-primary",
					style: { flexShrink: "0" },
					onClick: () => {
						openModal((props) => BdApi.React.createElement(
							NewStoreModal,
							{
								modalProps: props,
								onOnline: async ({ name, url }) => setOnline({ name, url }, "add"),
								onOffline: async ({ name }) => setOffline({ name, colorways: [] }, "add")
							}
						));
					}
				},
				BdApi.React.createElement(PlusIcon, { width: 14, height: 14 }),
				"New..."
			), BdApi.React.createElement(
				SourceManagerOptionsMenu,
				{
					sort: sortBy,
					layout,
					onSortChange: (newSort) => {
						setSortBy(newSort);
					},
					onLayout: (l) => {
						setLayout(l);
					}
				}
			), BdApi.React.createElement(
				"button",
				{
					className: "colorwaysPillButton colorwaysPillButton-primary",
					style: { flexShrink: "0" },
					onClick: async () => {
						const file = await chooseFile("application/json");
						if (!file) return;
						const reader = new FileReader();
						reader.onload = () => {
							try {
								openModal((props) => BdApi.React.createElement(
									NewStoreModal,
									{
										modalProps: props,
										offlineOnly: true,
										name: JSON.parse(reader.result).name,
										onOffline: async ({ name }) => {
											setOffline({ name, colorways: JSON.parse(reader.result).colorways }, "add");
										}
									}
								));
							} catch (err) {
								console.error("DiscordColorways: " + err);
							}
						};
						reader.readAsText(file);
					}
				},
				BdApi.React.createElement(ImportIcon, { width: 14, height: 14 }),
				"Import Offline..."
			)), BdApi.React.createElement("div", { className: "colorways-selector", "data-layout": layout }, getComputedStyle(document.body).getPropertyValue("--os-accent-color") ? BdApi.React.createElement(
				"div",
				{
					className: "discordColorway",
					style: { cursor: "default" },
					id: "colorwaySource-auto"
				},
				BdApi.React.createElement("div", { className: "colorwayLabelContainer" }, BdApi.React.createElement("span", { className: "colorwayLabel" }, "OS Accent Color"), BdApi.React.createElement("span", { className: "colorwayLabel colorwayLabelSubnote colorwaysNote" }, BdApi.React.createElement("div", { className: "colorways-badge" }, "Offline \u2022 Built-In"), " \u2022 Auto Colorway"))
			) : BdApi.React.createElement(BdApi.React.Fragment, null), ![
				...colorwaySourceFiles.map((src) => ({ ...src, type: "online" })),
				...customColorwayStores.map((src) => ({ ...src, type: "offline" }))
			].length && !getComputedStyle(document.body).getPropertyValue("--os-accent-color") ? BdApi.React.createElement(
				"div",
				{
					className: "discordColorway",
					id: "colorwaySource-missingSource",
					onClick: async () => setOnline({ name: "Project Colorway", url: defaultColorwaySource }, "add")
				},
				BdApi.React.createElement(WirelessIcon, { width: 30, height: 30, style: { color: "var(--interactive-active)" } }),
				BdApi.React.createElement("div", { className: "colorwayLabelContainer" }, BdApi.React.createElement("span", { className: "colorwayLabel" }, "It's quite emty in here."), BdApi.React.createElement("span", { className: "colorwayLabel colorwayLabelSubnote colorwaysNote" }, "Click here to add the Project Colorway source"))
			) : null, [
				...colorwaySourceFiles.map((src) => ({ ...src, type: "online" })),
				...customColorwayStores.map((src) => ({ ...src, type: "offline" }))
			].filter((src) => src.name.toLowerCase().includes(searchValuee.toLowerCase())).sort((a, b) => {
				switch (sortBy) {
					case SortOptions.NAME_AZ:
						return a.name.localeCompare(b.name);
					case SortOptions.NAME_ZA:
						return b.name.localeCompare(a.name);
					default:
						return a.name.localeCompare(b.name);
				}
			}).map(
				(src, i) => BdApi.React.createElement(RightClickContextMenu, { menu: BdApi.React.createElement(BdApi.React.Fragment, null, src.type === "online" ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: () => {
					Clipboard.copy(src.url);
					Toasts.show({
						message: "Copied URL Successfully",
						type: 1,
						id: "copy-url-notify"
					});
				}, className: "colorwaysContextMenuItm" }, "Copy URL", BdApi.React.createElement(CopyIcon, { width: 16, height: 16, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement(
					"button",
					{
						className: "colorwaysContextMenuItm",
						onClick: async () => {
							openModal((props) => BdApi.React.createElement(
								NewStoreModal,
								{
									modalProps: props,
									offlineOnly: true,
									name: src.name,
									onOffline: async ({ name }) => {
										const res = await fetch(src.url);
										const data = await res.json();
										setOffline({ name, colorways: data.colorways }, "add");
									}
								}
							));
						}
					},
					"Download...",
					BdApi.React.createElement(DownloadIcon, { width: 14, height: 14 })
				)) : BdApi.React.createElement(
					"button",
					{
						className: "colorwaysContextMenuItm",
						onClick: async () => {
							saveFile(new File([JSON.stringify({ "name": src.name, "colorways": [...src.colorways] })], `${src.name.replaceAll(" ", "-").toLowerCase()}.colorways.json`, { type: "application/json" }));
						}
					},
					"Export as...",
					BdApi.React.createElement(DownloadIcon, { width: 14, height: 14 })
				), BdApi.React.createElement(
					"button",
					{
						className: "colorwaysContextMenuItm colorwaysContextMenuItm-danger",
						onClick: async () => {
							openModal((props) => BdApi.React.createElement(
								Modal,
								{
									modalProps: props,
									title: "Remove Source",
									onFinish: async ({ closeModal }) => {
										if (src.type === "online") {
											setOnline({ name: src.name, url: src.url }, "remove");
										} else {
											setOffline({ name: src.name, colorways: [] }, "remove");
										}
										closeModal();
									},
									confirmMsg: "Delete",
									type: "danger"
								},
								"Are you sure you want to remove this source? This cannot be undone!"
							));
						}
					},
					"Remove",
					BdApi.React.createElement(DeleteIcon, { width: 14, height: 14 })
				)) }, ({ onContextMenu }) => BdApi.React.createElement(
					"div",
					{
						className: "discordColorway",
						style: { cursor: "default" },
						id: "colorwaySource" + src.name,
						onContextMenu
					},
					BdApi.React.createElement("div", { className: "colorwayLabelContainer" }, BdApi.React.createElement("span", { className: "colorwayLabel" }, src.name), src.type === "online" ? BdApi.React.createElement("span", { className: "colorwayLabel colorwayLabelSubnote colorwaysNote" }, BdApi.React.createElement("div", { className: "colorways-badge" }, "Online", src.url === defaultColorwaySource ? " \u2022 Built-In" : ""), " \u2022 on ", src.url) : BdApi.React.createElement("span", { className: "colorwayLabel colorwayLabelSubnote colorwaysNote" }, BdApi.React.createElement("div", { className: "colorways-badge" }, "Offline"), " \u2022 ", src.colorways.length, " colorways")),
					BdApi.React.createElement("div", { style: { marginRight: "auto" } }),
					BdApi.React.createElement(
						"button",
						{
							className: "colorwaysPillButton colorwaysPillButton-danger",
							onClick: async () => {
								openModal((props) => BdApi.React.createElement(
									Modal,
									{
										modalProps: props,
										title: "Remove Source",
										onFinish: async ({ closeModal }) => {
											if (src.type === "online") {
												setOnline({ name: src.name, url: src.url }, "remove");
											} else {
												setOffline({ name: src.name, colorways: [] }, "remove");
											}
											closeModal();
										},
										confirmMsg: "Delete",
										type: "danger"
									},
									"Are you sure you want to remove this source? This cannot be undone!"
								));
							}
						},
						BdApi.React.createElement(DeleteIcon, { width: 16, height: 16 })
					)
				))
			)))
		},
		{
			name: "Discover",
			component: () => BdApi.React.createElement("div", { className: "colorwayInnerTab" }, BdApi.React.createElement("div", { style: { display: "flex", marginBottom: "8px" } }, BdApi.React.createElement(
				"input",
				{
					type: "text",
					className: "colorwayTextBox",
					placeholder: "Search for sources...",
					value: searchValue,
					onChange: (e) => setSearchValue(e.currentTarget.value)
				}
			), BdApi.React.createElement(
				"button",
				{
					className: "colorwaysPillButton colorwaysPillButton-primary",
					style: { marginLeft: "8px", marginTop: "auto", marginBottom: "auto" },
					onClick: async function() {
						const res = await fetch("https://dablulite.vercel.app/");
						const data = await res.json();
						setStoreObject(data.sources);
						setColorwaySourceFiles(await DataStore.get("colorwaySourceFiles"));
						setContext("colorwaySourceFiles", await DataStore.get("colorwaySourceFiles"));
					}
				},
				BdApi.React.createElement(
					"svg",
					{
						xmlns: "http://www.w3.org/2000/svg",
						x: "0px",
						y: "0px",
						width: "14",
						height: "14",
						style: { boxSizing: "content-box", flexShrink: 0 },
						viewBox: "0 0 24 24",
						fill: "currentColor"
					},
					BdApi.React.createElement(
						"rect",
						{
							y: "0",
							fill: "none",
							width: "24",
							height: "24"
						}
					),
					BdApi.React.createElement(
						"path",
						{
							d: "M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z"
						}
					),
					BdApi.React.createElement(
						"path",
						{
							d: "M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z"
						}
					)
				),
				"Refresh"
			)), BdApi.React.createElement("div", { className: "colorways-selector" }, storeObject.map(
				(item) => item.name.toLowerCase().includes(searchValue.toLowerCase()) ? BdApi.React.createElement(RightClickContextMenu, { menu: BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: () => {
					Clipboard.copy(item.url);
					Toasts.show({
						message: "Copied URL Successfully",
						type: 1,
						id: "copy-url-notify"
					});
				}, className: "colorwaysContextMenuItm" }, "Copy URL", BdApi.React.createElement(CopyIcon, { width: 16, height: 16, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement(
					"button",
					{
						className: "colorwaysContextMenuItm",
						onClick: () => {
							openModal((props) => BdApi.React.createElement(
								Modal,
								{
									modalProps: props,
									title: "Previewing colorways for " + item.name,
									onFinish: () => {
									},
									confirmMsg: "Done"
								},
								BdApi.React.createElement("div", { className: "colorwayInnerTab", style: { flexGrow: "1" } }, BdApi.React.createElement(Selector, { settings: { selectorType: "preview", previewSource: item.url } }))
							));
						}
					},
					"Preview",
					BdApi.React.createElement(PalleteIcon, { width: 16, height: 16, style: {
						marginLeft: "8px"
					} })
				), BdApi.React.createElement(
					"button",
					{
						className: `colorwaysContextMenuItm${colorwaySourceFiles.map((source) => source.name).includes(item.name) ? " colorwaysContextMenuItm-danger" : ""}`,
						onClick: async () => {
							if (colorwaySourceFiles.map((source) => source.name).includes(item.name)) {
								openModal((props) => BdApi.React.createElement(
									Modal,
									{
										modalProps: props,
										title: "Remove Source",
										onFinish: async ({ closeModal }) => {
											setOnline({ name: item.name, url: item.url }, "remove");
											closeModal();
										},
										confirmMsg: "Delete",
										type: "danger"
									},
									"Are you sure you want to remove this source? This cannot be undone!"
								));
							} else {
								setOnline({ name: item.name, url: item.url }, "add");
							}
						}
					},
					colorwaySourceFiles.map((source) => source.name).includes(item.name) ? BdApi.React.createElement(BdApi.React.Fragment, null, "Remove", BdApi.React.createElement(DeleteIcon, { width: 16, height: 16, style: {
						marginLeft: "8px"
					} })) : BdApi.React.createElement(BdApi.React.Fragment, null, "Add Source", BdApi.React.createElement(DownloadIcon, { width: 16, height: 16, style: {
						marginLeft: "8px"
					} }))
				)) }, ({ onContextMenu }) => BdApi.React.createElement(
					"div",
					{
						className: "discordColorway",
						style: { cursor: "default" },
						id: "colorwaySource" + item.name,
						onContextMenu
					},
					BdApi.React.createElement("div", { className: "colorwayLabelContainer" }, BdApi.React.createElement("span", { className: "colorwayLabel" }, item.name), BdApi.React.createElement("span", { className: "colorwayLabel colorwayLabelSubnote colorwaysNote" }, item.description, " \u2022 by ", item.authorGh)),
					BdApi.React.createElement("div", { style: { marginRight: "auto" } }),
					BdApi.React.createElement(
						"button",
						{
							className: `colorwaysPillButton ${colorwaySourceFiles.map((source) => source.name).includes(item.name) ? "colorwaysPillButton-danger" : "colorwaysPillButton-secondary"}`,
							onClick: async () => {
								if (colorwaySourceFiles.map((source) => source.name).includes(item.name)) {
									openModal((props) => BdApi.React.createElement(
										Modal,
										{
											modalProps: props,
											title: "Remove Source",
											onFinish: async ({ closeModal }) => {
												setOnline({ name: item.name, url: item.url }, "remove");
												closeModal();
											},
											confirmMsg: "Delete",
											type: "danger"
										},
										"Are you sure you want to remove this source? This cannot be undone!"
									));
								} else {
									setOnline({ name: item.name, url: item.url }, "add");
								}
							}
						},
						colorwaySourceFiles.map((source) => source.name).includes(item.name) ? BdApi.React.createElement(DeleteIcon, { width: 16, height: 16 }) : BdApi.React.createElement(DownloadIcon, { width: 16, height: 16 })
					),
					BdApi.React.createElement("a", { role: "link", className: "colorwaysPillButton colorwaysPillButton-secondary", target: "_blank", href: "https://github.com/" + item.authorGh }, BdApi.React.createElement("img", { src: "/assets/6a853b4c87fce386cbfef4a2efbacb09.svg", width: 16, height: 16, alt: "GitHub" }))
				)) : BdApi.React.createElement(BdApi.React.Fragment, null)
			)))
		}
	] }));
}

function SidebarTab({ id, title, Icon, bottom, onSelect, activeTab, expanded = false, onContextMenu = () => {
}, onMouseEnter = () => {
}, onMouseLeave = () => {
} }) {
	return BdApi.React.createElement(
		"div",
		{
			className: "colorwaySelectorSidebar-tab" + (id === activeTab ? " active" : ""),
			style: { ...bottom ? { marginTop: "auto" } : {}, padding: expanded || !title ? "8px" : "12px", ...!title ? { width: "fit-content" } : {} },
			onClick: (e) => {
				onSelect(id, e);
			},
			onContextMenu,
			onMouseEnter,
			onMouseLeave
		},
		BdApi.React.createElement(Icon, { width: expanded ? 18 : 24, height: expanded ? 18 : 24 }),
		expanded && title ? BdApi.React.createElement("span", { style: { marginLeft: "8px" } }, title) : null
	);
}

function Tooltip({
	children,
	text,
	position = "top"
}) {
	const [visible, setVisible] = React.useState(false);
	const [pos, setPos] = React.useState({ x: 0, y: 0 });
	const tooltip = React.useRef(null);
	function showTooltip({ currentTarget }) {
		setPos((() => {
			switch (position) {
				case "right":
					return {
						x: currentTarget.getBoundingClientRect().x + currentTarget.offsetWidth + 8,
						y: currentTarget.getBoundingClientRect().y + currentTarget.offsetHeight / 2 - tooltip.current.offsetHeight / 2
					};
				case "left":
					return {
						x: currentTarget.getBoundingClientRect().x - tooltip.current.offsetWidth - 8,
						y: currentTarget.getBoundingClientRect().y + currentTarget.offsetHeight / 2 - tooltip.current.offsetHeight / 2
					};
				case "bottom":
					return {
						x: currentTarget.getBoundingClientRect().x + currentTarget.offsetWidth / 2 - tooltip.current.offsetWidth / 2,
						y: currentTarget.getBoundingClientRect().y + tooltip.current.offsetHeight + 8
					};
				case "top":
					return {
						x: currentTarget.getBoundingClientRect().x + currentTarget.offsetWidth / 2 - tooltip.current.offsetWidth / 2,
						y: currentTarget.getBoundingClientRect().y - tooltip.current.offsetHeight - 8
					};
				default:
					return {
						x: currentTarget.getBoundingClientRect().x + currentTarget.offsetWidth + 8,
						y: currentTarget.getBoundingClientRect().y + currentTarget.offsetHeight / 2 - tooltip.current.offsetHeight / 2
					};
			}
		})());
		setVisible(true);
	}
	function onWindowUnfocused(e) {
		e = e || window.event;
		var from = e.relatedTarget || e.toElement;
		if (!from || from.nodeName === "HTML") {
			setVisible(false);
		}
	}
	React.useEffect(() => {
		document.addEventListener("mouseout", onWindowUnfocused);
		return () => {
			document.removeEventListener("mouseout", onWindowUnfocused);
		};
	}, []);
	return BdApi.React.createElement(BdApi.React.Fragment, null, children({
		onMouseEnter: (e) => showTooltip(e),
		onMouseLeave: () => setVisible(false),
		onClick: () => setVisible(false)
	}), BdApi.React.createElement("div", { ref: tooltip, className: `colorwaysTooltip colorwaysTooltip-${position} ${!visible ? "colorwaysTooltip-hidden" : ""}`, style: {
		top: `${pos.y}px`,
		left: `${pos.x}px`
	} }, BdApi.React.createElement("div", { className: "colorwaysTooltipPointer" }), BdApi.React.createElement("div", { className: "colorwaysTooltipContent" }, text)));
}

function MainModalSidebar({ onTabChange }) {
	const [activeTab, setActiveTab] = React.useState("selector");
	const [wsConnected, setWsConnected] = React.useState(wsOpen);
	const [boundKey$1, setBoundKey] = React.useState(boundKey);
	const [expanded, setExpanded] = React.useState(false);
	const [isManager, setManager] = React.useState(hasManagerRole);
	React.useEffect(() => {
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_WS_CONNECTED", ({ isConnected }) => setWsConnected(isConnected));
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_BOUND_KEY", ({ boundKey: boundKey2 }) => setBoundKey(boundKey2));
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_WS_MANAGER_ROLE", ({ isManager: isManager2 }) => setManager(isManager2));
		return () => {
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_BOUND_KEY", ({ boundKey: boundKey2 }) => setBoundKey(boundKey2));
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_WS_CONNECTED", ({ isConnected }) => setWsConnected(isConnected));
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_WS_MANAGER_ROLE", ({ isManager: isManager2 }) => setManager(isManager2));
		};
	}, []);
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("div", { className: "colorwaySelectorSidebar" }, BdApi.React.createElement(
		SidebarTab,
		{
			activeTab,
			onSelect: () => setExpanded(!expanded),
			Icon: (props) => BdApi.React.createElement(CaretIcon, { ...props, style: expanded ? { transform: "rotate(90deg)" } : {} }),
			id: "expand_sidebar",
			expanded
		}
	), BdApi.React.createElement(
		SidebarTab,
		{
			activeTab,
			onSelect: (id) => {
				setActiveTab(id);
				onTabChange(id);
				setExpanded(false);
			},
			Icon: PalleteIcon,
			id: "selector",
			title: "Change Colorway",
			expanded
		}
	), BdApi.React.createElement(
		SidebarTab,
		{
			activeTab,
			onSelect: (id) => {
				setActiveTab(id);
				onTabChange(id);
				setExpanded(false);
			},
			Icon: CogIcon,
			id: "settings",
			title: "Settings",
			expanded
		}
	), BdApi.React.createElement(
		SidebarTab,
		{
			activeTab,
			onSelect: (id) => {
				setActiveTab(id);
				onTabChange(id);
				setExpanded(false);
			},
			Icon: WirelessIcon,
			id: "sources",
			title: "Sources",
			expanded
		}
	), BdApi.React.createElement(
		Tooltip,
		{
			position: "right",
			text: BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("span", null, wsConnected ? "Connected to manager" : "No manager connected"), wsConnected ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("span", { style: { color: "var(--text-muted)", fontWeight: 500, fontSize: 12 } }, "Bound Key: ", JSON.stringify(boundKey$1)), BdApi.React.createElement("span", { style: { color: "var(--text-muted)", fontWeight: 500, fontSize: 12 } }, "Right click for options")) : null)
		},
		({ onMouseEnter, onMouseLeave, onClick }) => BdApi.React.createElement(
			RightClickContextMenu,
			{
				menu: BdApi.React.createElement(BdApi.React.Fragment, null, wsConnected ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: () => Clipboard.copy(JSON.stringify(boundKey$1)), className: "colorwaysContextMenuItm" }, "Copy Bound Key"), BdApi.React.createElement("button", { onClick: restartWS, className: "colorwaysContextMenuItm" }, "Reset Connection"), BdApi.React.createElement("button", { onClick: updateRemoteSources, className: "colorwaysContextMenuItm" }, "Update Remote Sources"), !isManager ? BdApi.React.createElement("button", { onClick: requestManagerRole, className: "colorwaysContextMenuItm" }, "Request manager role") : null) : null)
			},
			({ onContextMenu }) => BdApi.React.createElement(
				SidebarTab,
				{
					activeTab,
					onSelect: (_, e) => {
						if (wsConnected) {
							onClick(e);
							onContextMenu(e);
						}
					},
					bottom: true,
					onContextMenu: (e) => {
						if (wsConnected) {
							onClick(e);
							onContextMenu(e);
						}
					},
					onMouseEnter,
					onMouseLeave,
					Icon: WirelessIcon,
					id: "ws_connection",
					title: "Manager Connection",
					expanded
				}
			)
		)
	)));
}
function MainModal({
	modalProps
}) {
	const [activeTab, setActiveTab] = React.useState("selector");
	const [theme, setTheme] = React.useState(contexts.colorwaysPluginTheme);
	const [forceVR, setForceVR] = React.useState(contexts.colorwaysForceVR);
	const cont = React.useRef(null);
	React.useEffect(() => {
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_THEME", ({ theme: theme2 }) => setTheme(theme2));
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_FORCE_VR", ({ enabled }) => setForceVR(enabled));
		return () => {
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_THEME", ({ theme: theme2 }) => setTheme(theme2));
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_FORCE_VR", ({ enabled }) => setForceVR(enabled));
		};
	}, []);
	return BdApi.React.createElement(exports.FocusLock, { containerRef: cont }, BdApi.React.createElement("div", { ref: cont, className: `colorwaySelectorModal${forceVR ? " visual-refresh" : ""} ${modalProps.transitionState === 2 ? "closing" : ""} ${modalProps.transitionState === 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement(MainModalSidebar, { onTabChange: setActiveTab }), BdApi.React.createElement("div", { className: "colorwayModalContent" }, activeTab === "selector" && BdApi.React.createElement("div", { className: "colorwayInnerTab", style: { height: "100%" } }, BdApi.React.createElement(Selector, { hasTheme: true })), activeTab === "sources" && BdApi.React.createElement(SourceManager, { hasTheme: true }), activeTab === "settings" && BdApi.React.createElement(SettingsPage, { hasTheme: true }))));
}

let wsOpen = false;
let boundKey = null;
let hasManagerRole = false;
let socket;
function sendColorway(obj) {
	socket?.send(JSON.stringify({
		type: "complication:manager-role:send-colorway",
		active: obj,
		boundKey
	}));
}
function requestManagerRole() {
	socket?.send(JSON.stringify({
		type: "complication:manager-role:request",
		boundKey
	}));
}
function updateRemoteSources() {
	DataStore.getMany([
		"colorwaySourceFiles",
		"customColorways"
	]).then(([
		colorwaySourceFiles,
		customColorways
	]) => {
		socket?.send(JSON.stringify({
			type: "complication:remote-sources:init",
			boundKey,
			online: colorwaySourceFiles,
			offline: customColorways
		}));
	});
}
function closeWS() {
	socket?.close(1);
}
function restartWS() {
	socket?.close(1);
	connect();
}
function isWSOpen() {
	return Boolean(socket && socket.readyState === socket.OPEN);
}
function connect() {
	if (socket && socket.readyState === socket.OPEN) return;
	const ws = socket = new WebSocket("ws://localhost:6124");
	let hasErrored = false;
	ws.onopen = function() {
		wsOpen = true;
		hasManagerRole = false;
		FluxDispatcher.dispatch({
			type: "COLORWAYS_UPDATE_WS_CONNECTED",
			isConnected: true
		});
	};
	ws.onmessage = function({ data: datta }) {
		const data = JSON.parse(datta);
		function typeSwitch(type) {
			switch (type) {
				case "change-colorway":
					if (data.active.id == null) {
						setContext("activeColorwayObject", nullColorwayObj);
						ColorwayCSS.remove();
						FluxDispatcher.dispatch({
							type: "COLORWAYS_UPDATE_ACTIVE_COLORWAY",
							active: nullColorwayObj
						});
					} else {
						setContext("activeColorwayObject", data.active);
						FluxDispatcher.dispatch({
							type: "COLORWAYS_UPDATE_ACTIVE_COLORWAY",
							active: data.active
						});
						DataStore.get("colorwaysPreset").then((colorwaysPreset) => {
							if (colorwaysPreset === "default") {
								ColorwayCSS.set(generateCss(
									data.active.colors,
									true,
									true,
									void 0,
									data.active.id
								));
							} else {
								if (gradientPresetIds.includes(colorwaysPreset)) {
									const css = Object.keys(data.active).includes("linearGradient") ? gradientBase(data.active.colors, true) + `:root:root {--custom-theme-background: linear-gradient(${data.active.linearGradient})}` : getPreset(data.active.colors)[colorwaysPreset].preset.full;
									ColorwayCSS.set(css);
								} else {
									ColorwayCSS.set(getPreset(data.active.colors)[colorwaysPreset].preset);
								}
							}
						});
					}
					return;
				case "remove-colorway":
					setContext("activeColorwayObject", nullColorwayObj);
					ColorwayCSS.remove();
					FluxDispatcher.dispatch({
						type: "COLORWAYS_UPDATE_ACTIVE_COLORWAY",
						active: nullColorwayObj
					});
					return;
				case "manager-connection-established":
					DataStore.get("colorwaysBoundManagers").then((boundManagers) => {
						if (data.MID) {
							const boundSearch = boundManagers.filter((boundManager) => {
								if (Object.keys(boundManager)[0] === data.MID) return boundManager;
							});
							if (boundSearch.length) {
								boundKey = boundSearch[0];
							} else {
								const id = { [data.MID]: `${getWsClientIdentity()}.${Math.random().toString(16).slice(2)}.${( new Date()).getUTCMilliseconds()}` };
								DataStore.set("colorwaysBoundManagers", [...boundManagers, id]);
								boundKey = id;
							}
							FluxDispatcher.dispatch({
								type: "COLORWAYS_UPDATE_BOUND_KEY",
								boundKey
							});
							ws?.send(JSON.stringify({
								type: "client-sync-established",
								boundKey,
								complications: [
									"remote-sources",
									"manager-role",
									"ui-summon"
								]
							}));
							DataStore.getMany([
								"colorwaySourceFiles",
								"customColorways"
							]).then(([
								colorwaySourceFiles,
								customColorways
							]) => {
								ws?.send(JSON.stringify({
									type: "complication:remote-sources:init",
									boundKey,
									online: colorwaySourceFiles,
									offline: customColorways
								}));
							});
						}
					});
					return;
				case "complication:manager-role:granted":
					hasManagerRole = true;
					FluxDispatcher.dispatch({
						type: "COLORWAYS_UPDATE_WS_MANAGER_ROLE",
						isManager: true
					});
					return;
				case "complication:manager-role:revoked":
					hasManagerRole = false;
					FluxDispatcher.dispatch({
						type: "COLORWAYS_UPDATE_WS_MANAGER_ROLE",
						isManager: false
					});
					return;
				case "complication:ui-summon:summon":
					openModal((props) => BdApi.React.createElement(MainModal, { modalProps: props }));
					return;
				case "complication:remote-sources:update-request":
					DataStore.getMany([
						"colorwaySourceFiles",
						"customColorways"
					]).then(([
						colorwaySourceFiles,
						customColorways
					]) => {
						ws?.send(JSON.stringify({
							type: "complication:remote-sources:init",
							boundKey,
							online: colorwaySourceFiles,
							offline: customColorways
						}));
					});
					return;
			}
		}
		typeSwitch(data.type);
	};
	ws.onclose = function(e) {
		boundKey = null;
		hasManagerRole = false;
		wsOpen = false;
		FluxDispatcher.dispatch({
			type: "COLORWAYS_UPDATE_WS_CONNECTED",
			isConnected: false
		});
		if (contexts.colorwaysManagerDoAutoconnect && (e.code !== 1 || hasErrored)) {
			setTimeout(() => connect(), contexts.colorwaysManagerAutoconnectPeriod);
		}
	};
	ws.onerror = () => hasErrored = true;
}

function ListItem({
	children,
	tooltip,
	hasPill = false
}) {
	const [status, setStatus] = React.useState("none");
	const btn = React.useRef(null);
	function onWindowUnfocused(e) {
		e = e || window.event;
		var from = e.relatedTarget || e.toElement;
		if (!from || from.nodeName === "HTML") {
			setStatus("none");
		}
	}
	React.useEffect(() => {
		document.addEventListener("mouseout", () => onWindowUnfocused);
		return () => {
			document.removeEventListener("mouseout", onWindowUnfocused);
		};
	}, []);
	return tooltip ? BdApi.React.createElement(Tooltip, { text: tooltip, position: "right" }, ({ onMouseEnter, onMouseLeave, onClick }) => {
		return BdApi.React.createElement("div", { ref: btn, className: "colorwaysServerListItem" }, hasPill ? BdApi.React.createElement("div", { className: "colorwaysServerListItemPill", "data-status": status }) : BdApi.React.createElement(BdApi.React.Fragment, null), children({
			onMouseEnter: (e) => {
				onMouseEnter({ currentTarget: btn.current });
				status !== "active" ? setStatus("hover") : void 0;
			},
			onMouseLeave: (e) => {
				onMouseLeave(e);
				status !== "active" ? setStatus("none") : void 0;
			},
			isActive: (stat) => setStatus(stat ? "active" : "none"),
			onClick
		}));
	}) : BdApi.React.createElement("div", { className: "colorwaysServerListItem" }, hasPill ? BdApi.React.createElement("div", { className: "colorwaysServerListItemPill", "data-status": status }) : BdApi.React.createElement(BdApi.React.Fragment, null), children({
		onMouseEnter: () => status !== "active" ? setStatus("hover") : void 0,
		onMouseLeave: () => status !== "active" ? setStatus("none") : void 0,
		isActive: (stat) => setStatus(stat ? "active" : "none"),
		onClick: () => {
		}
	}));
}

function ColorwaysButton() {
	const [activeColorway, setActiveColorway] = React.useState(contexts.activeColorwayObject);
	const [visibility, setVisibility] = React.useState(false);
	const [autoPreset, setAutoPreset] = React.useState(contexts.activeAutoPreset);
	React.useEffect(() => {
		(async function() {
			setVisibility(await DataStore.get("showColorwaysButton"));
		})();
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_BUTTON_VISIBILITY", ({ isVisible }) => setVisibility(isVisible));
		return () => {
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_BUTTON_VISIBILITY", ({ isVisible }) => setVisibility(isVisible));
		};
	});
	return visibility || PluginProps.clientMod === "BetterDiscord" ? BdApi.React.createElement(
		ListItem,
		{
			hasPill: true,
			tooltip: BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("span", null, "Discord Colorways"), BdApi.React.createElement("span", { style: { color: "var(--text-muted)", fontWeight: 500, fontSize: 12 } }, "Active Colorway: " + (activeColorway.id || "None")), activeColorway.id === "Auto" && activeColorway.sourceType === "auto" ? BdApi.React.createElement("span", { style: { color: "var(--text-muted)", fontWeight: 500, fontSize: 12 } }, "Auto Colorway Preset: " + (autoPreset ? getAutoPresets()[autoPreset].name : "None")) : BdApi.React.createElement(BdApi.React.Fragment, null))
		},
		({ onMouseEnter, onMouseLeave, isActive, onClick }) => {
			return BdApi.React.createElement(
				"div",
				{
					className: "ColorwaySelectorBtn",
					onMouseEnter: async (e) => {
						onMouseEnter(e);
						setActiveColorway(contexts.activeColorwayObject);
						setAutoPreset(contexts.activeAutoPreset);
					},
					onMouseLeave: (e) => {
						onMouseLeave(e);
					},
					onClick: (e) => {
						onClick(e);
						isActive(false);
						openModal((props) => BdApi.React.createElement(MainModal, { modalProps: props }));
					}
				},
				BdApi.React.createElement(PalleteIcon, null)
			);
		}
	) : BdApi.React.createElement(BdApi.React.Fragment, null);
}

const DataStore = {
	get: async (key) => {
		return betterdiscord.Data.load(key) || null;
	},
	set: async (key, value) => {
		betterdiscord.Data.save(key, value);
	},
	getMany: async (keys) => {
		return keys.map((setting) => betterdiscord.Data.load(setting) || null);
	}
};
const PluginProps = {
	pluginVersion: "7.0.0",
	clientMod: "BetterDiscord",
	UIVersion: "2.2.0",
	creatorVersion: "1.23"
};
const guildStyles = Webpack.getModule(Filters.byKeys("guilds", "base"), { searchExports: false, defaultExport: true });
const treeStyles = Webpack.getModule(Filters.byKeys("tree", "scroller"), { searchExports: false, defaultExport: true });
const GuildsNav = Webpack.getModule(Filters.bySource("guildsnav"), { searchExports: true, defaultExport: true });
const instead = (object, method, callback, options) => {
	const original = object?.[method];
	if (!(original instanceof Function)) {
		throw TypeError(`patch target ${original} is not a function`);
	}
	const cancel = betterdiscord.Patcher.instead(object, method, options.once ? (...args) => {
		const result = callback(cancel, original, args);
		cancel();
		return result;
	} : (...args) => callback(cancel, original, args));
	if (!options.silent) {
		console.log(`Patched ${options.name ?? String(method)}`);
	}
	return cancel;
};
const forceFullRerender = (fiber) => new Promise((resolve) => {
	const owner = findOwner(fiber);
	if (owner) {
		const { stateNode } = owner;
		instead(stateNode, "render", () => null, { once: true, silent: true });
		stateNode.forceUpdate(() => stateNode.forceUpdate(() => resolve(true)));
	} else {
		resolve(false);
	}
});
const triggerRerender = async () => {
	const node = document.getElementsByClassName(guildStyles.guilds)?.[0];
	const fiber = getFiber(node);
	if (!await forceFullRerender(fiber)) {
		console.warn("Unable to rerender guilds");
	}
};
class DiscordColorways {
	load() {
	}
	start() {
		betterdiscord.Patcher.after(
			GuildsNav,
			"type",
			(cancel, result, ...args) => {
				const target = queryTree(args[0], (node) => node?.props?.className?.split(" ").includes(guildStyles.guilds));
				if (!target) {
					return console.error("Unable to find chain patch target");
				}
				hookFunctionComponent(target, (result2) => {
					const scroller = queryTree(result2, (node) => node?.props?.value?.includes("guilds list"));
					if (!scroller) {
						return console.error("Unable to find scroller");
					}
					const { children } = scroller.props;
					const Child = children.props.children();
					const list = Child.props.children.props.children.find((child) => child.props.className.includes(treeStyles.scroller));
					console.log(list);
					list.props.children.splice(list.props.children.indexOf(list.props.children.filter((child) => child !== null && typeof child.type === "string")[0]), 0, BdApi.React.createElement(ColorwaysButton, null));
					children.props.children = () => Child;
				});
			}
		);
		betterdiscord.DOM.addStyle(css$1 + css);
		triggerRerender();
		defaultsLoader();
		connect();
		initContexts().then((contexts) => {
			if (contexts.activeColorwayObject.id) {
				if (contexts.colorwaysPreset === "default") {
					ColorwayCSS$1.set(generateCss(
						contexts.activeColorwayObject.colors,
						true,
						true,
						void 0,
						contexts.activeColorwayObject.id
					));
				} else {
					if (gradientPresetIds.includes(contexts.colorwaysPreset)) {
						const css = Object.keys(contexts.activeColorwayObject).includes("linearGradient") ? gradientBase(contexts.activeColorwayObject.colors, true) + `:root:root {--custom-theme-background: linear-gradient(${contexts.activeColorwayObject.linearGradient})}` : getPreset(contexts.activeColorwayObject.colors)[contexts.colorwaysPreset].preset.full;
						ColorwayCSS$1.set(css);
					} else {
						ColorwayCSS$1.set(getPreset(contexts.activeColorwayObject.colors)[contexts.colorwaysPreset].preset);
					}
				}
			}
		});
	}
	stop() {
		ColorwayCSS$1.remove();
		betterdiscord.DOM.removeStyle();
		betterdiscord.Patcher.unpatchAll();
		closeWS();
	}
}

Object.defineProperty(exports, 'useCallback', {
		enumerable: true,
		get: () => React.useCallback
});
Object.defineProperty(exports, 'useEffect', {
		enumerable: true,
		get: () => React.useEffect
});
Object.defineProperty(exports, 'useReducer', {
		enumerable: true,
		get: () => React.useReducer
});
Object.defineProperty(exports, 'useRef', {
		enumerable: true,
		get: () => React.useRef
});
Object.defineProperty(exports, 'useState', {
		enumerable: true,
		get: () => React.useState
});
exports.ContextMenuApi = ContextMenuApi;
exports.DataStore = DataStore;
exports.FluxDispatcher = FluxDispatcher;
exports.PluginProps = PluginProps;
exports.Toasts = Toasts;
exports["default"] = DiscordColorways;
exports.openModal = openModal;
exports.useStateFromStores = useStateFromStores;

/*@end@*/