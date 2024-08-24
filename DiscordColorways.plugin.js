/**
 * @name DiscordColorways
 * @author DaBluLite
 * @description A plugin that offers easy access to simple color schemes/themes for Discord, also known as Colorways
 * @version 6.1.0
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

function Spinner({ className, style }) {
	return BdApi.React.createElement("div", { className: "colorwaysBtn-spinner" + (className ? ` ${className}` : ""), role: "img", "aria-label": "Loading", style }, BdApi.React.createElement("div", { className: "colorwaysBtn-spinnerInner" }, BdApi.React.createElement("svg", { className: "colorwaysBtn-spinnerCircular", viewBox: "25 25 50 50", fill: "currentColor" }, BdApi.React.createElement("circle", { className: "colorwaysBtn-spinnerBeam colorwaysBtn-spinnerBeam3", cx: "50", cy: "50", r: "20" }), BdApi.React.createElement("circle", { className: "colorwaysBtn-spinnerBeam colorwaysBtn-spinnerBeam2", cx: "50", cy: "50", r: "20" }), BdApi.React.createElement("circle", { className: "colorwaysBtn-spinnerBeam", cx: "50", cy: "50", r: "20" }))));
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
		const s = Function.prototype.toString.call(m);
		for (const c of code) {
			if (!s.includes(c)) return false;
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
let Card;
let Button;
let Switch$1;
let Tooltip$1;
let TextInput;
let TextArea;
let Text;
let Select;
let SearchableSelect;
exports.Slider = void 0;
let ButtonLooks;
let Popout;
let Dialog;
let TabBar$1;
let Paginator;
let ScrollerThin;
let Clickable;
let Avatar;
let FocusLock;
let useToken;
Webpack.getByKeys("open", "saveAccountChanges");
({ ...Webpack.getByKeys("MenuItem", "MenuSliderControl") });
exports.ColorPicker = () => {
	return BdApi.React.createElement(Spinner, { className: "colorways-creator-module-warning" });
};
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
		Slider: exports.Slider,
		ButtonLooks,
		TabBar: TabBar$1,
		Popout,
		Dialog,
		Paginator,
		ScrollerThin,
		Clickable,
		Avatar,
		FocusLock
	} = m);
});
Webpack.waitForModule(Filters.byStrings("showEyeDropper")).then(
	(e) => exports.ColorPicker = e
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
waitForStore("DraftStore", (s) => s);
waitForStore("UserStore", (s) => exports.UserStore = s);
waitForStore(
	"SelectedChannelStore",
	(s) => s
);
waitForStore(
	"SelectedGuildStore",
	(s) => s
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
function saveSettings(settings) {
	betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), ...settings });
}
function getSetting(setting) {
	return betterdiscord.Data.load("settings")[setting];
}
function getBulkSetting(...settings) {
	return settings.map((setting) => betterdiscord.Data.load("settings")[setting]);
}

const css$1 = "/* stylelint-disable no-descending-specificity */\n/* stylelint-disable declaration-block-no-redundant-longhand-properties */\n/* stylelint-disable selector-id-pattern */\n/* stylelint-disable selector-class-pattern */\n@import url(\"https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css\");\n\n.ColorwaySelectorBtn {\n  	height: 48px;\n  	width: 48px;\n  	border-radius: 50px;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	transition: 0.15s ease-out;\n  	background-color: var(--background-primary);\n  	cursor: pointer;\n  	color: var(--text-normal);\n}\n\n.ColorwaySelectorBtn:hover {\n  	background-color: var(--brand-500);\n  	border-radius: 16px;\n}\n\n.discordColorwayPreviewColorContainer {\n  	display: flex;\n  	flex-flow: wrap;\n  	flex-direction: row;\n  	overflow: hidden;\n  	border-radius: 50%;\n  	width: 56px;\n  	height: 56px;\n  	box-shadow: 0 0 0 1.5px var(--interactive-normal);\n  	box-sizing: border-box;\n}\n\n.discordColorwayPreviewColor {\n  	width: 50%;\n  	height: 50%;\n}\n\n.discordColorwayPreviewColorContainer:not(:has(> .discordColorwayPreviewColor:nth-child(2)))\n  	> .discordColorwayPreviewColor {\n  	height: 100%;\n  	width: 100%;\n}\n\n.discordColorwayPreviewColorContainer:not(:has(> .discordColorwayPreviewColor:nth-child(3)))\n  	> .discordColorwayPreviewColor {\n  	height: 100%;\n}\n\n.discordColorwayPreviewColorContainer:not(:has(> .discordColorwayPreviewColor:nth-child(4)))\n  	> .discordColorwayPreviewColor:nth-child(3) {\n  	width: 100%;\n}\n\n.ColorwaySelectorWrapper {\n  	position: relative;\n  	display: flex;\n  	gap: 8px;\n  	width: 100%;\n  	scrollbar-width: none !important;\n  	flex-direction: column;\n  	padding: 0 16px !important;\n  	box-sizing: border-box;\n  	overflow: hidden auto;\n}\n\n.ColorwaySelectorWrapper::-webkit-scrollbar {\n  	width: 0;\n}\n\n.colorwaySelectorModal,\n.colorwayModal {\n  	width: 90% !important;\n  	height: 90% !important;\n  	border-radius: 8px;\n  	border: 1px solid #a6a6a6f0;\n  	display: flex;\n  	flex-direction: row;\n  	background-color: #090909;\n  	margin: 0 auto;\n  	pointer-events: all;\n  	position: relative;\n  	animation: show-modal 0.2s ease-in-out;\n}\n\n@keyframes reveal-modal {\n  	from {\n  			translate: 0 -20px;\n  	}\n  	to {\n  			translate: 0;\n  	}\n}\n@keyframes reveal-modal-backdrop {\n  	from {\n  			opacity: 0;\n  	}\n  	to {\n  			opacity: 0.75;\n  	}\n}\n\n.colorwaysModalBackdrop {\n  	background-color: #707070;\n  	opacity: 0.75;\n  	position: fixed;\n  	top: 0;\n  	left: 0;\n  	width: 100%;\n  	height: 100%;\n  	z-index: 1;\n  	transition: 0.4s ease;\n  	animation: reveal-modal-backdrop 0.4s ease;\n  	pointer-events: all;\n}\n\n.colorwayModal {\n  	flex-direction: column;\n}\n\n.colorwaySelectorModal.closing,\n.colorwayModal.closing,\n.colorwaysPreview-modal.closing,\n.colorwaysModal.closing {\n  	animation: close-modal 0.2s ease-in-out;\n  	transform: scale(0.5);\n  	opacity: 0;\n}\n\n.colorwaySelectorModal.hidden,\n.colorwayModal.hidden,\n.colorwaysPreview-modal.hidden,\n.colorwaysModal.hidden {\n  	animation: close-modal 0.2s ease-in-out;\n  	transform: scale(0.5);\n  	opacity: 0;\n}\n\n@keyframes show-modal {\n  	0% {\n  			transform: scale(0.7);\n  			opacity: 0;\n  	}\n  	75% {\n  			transform: scale(1.009);\n  			opacity: 1;\n  	}\n  	100% {\n  			transform: scale(1);\n  			opacity: 1;\n  	}\n}\n\n@keyframes close-modal {\n  	from {\n  			transform: scale(1);\n  			opacity: 1;\n  	}\n  	to {\n  			transform: scale(0.7);\n  			opacity: 0;\n  	}\n}\n\n.colorwaysSettingsDivider {\n  	width: 100%;\n  	height: 1px;\n  	border-top: thin solid #fff;\n  	margin-top: 20px;\n}\n\n.colorwaysSettings-switch {\n  	background-color: rgb(85, 87, 94);\n  	flex: 0 0 auto;\n  	position: relative;\n  	border-radius: 14px;\n  	width: 40px;\n  	height: 24px;\n  	cursor: pointer;\n  	transition: 0.15s ease;\n  	cursor: pointer;\n}\n\n.colorwaysSettings-switch.checked {\n  	background-color: #fff;\n}\n\n.colorwaySwitch-label {\n  	flex: 1;\n  	display: block;\n  	overflow: hidden;\n  	margin-top: 0;\n  	margin-bottom: 0;\n  	color: #fff;\n  	line-height: 24px;\n  	font-size: 16px;\n  	font-weight: 500;\n  	word-wrap: break-word;\n  	cursor: pointer;\n}\n\n.colorwaysNote {\n  	color: #fff;\n  	opacity: 0.5;\n}\n\n.colorwayModal-selectorHeader {\n  	display: flex;\n  	width: 100%;\n  	padding: 16px;\n  	padding-bottom: 8px;\n  	box-sizing: border-box;\n  	flex-direction: column;\n  	gap: 8px;\n}\n\n.colorwayModalContent {\n  	display: flex;\n  	flex-direction: column;\n  	width: 100%;\n  	height: 100%;\n}\n\n.colorwaySelectorSidebar-tab {\n  	font-family: bootstrap-icons;\n  	width: 48px;\n  	height: 48px;\n  	border-radius: 8px;\n  	cursor: pointer;\n  	transition: 0.2s ease;\n  	border: 1px solid transparent;\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	font-size: 24px;\n}\n\n.colorwaysPillButton {\n  	padding: 4px 12px;\n  	border-radius: 16px;\n  	background-color: #101010;\n  	color: #fff;\n  	transition: 0.2s ease;\n  	cursor: pointer;\n  	display: flex;\n  	gap: 0.5rem;\n  	justify-content: center;\n  	align-items: center;\n  	width: fit-content;\n  	height: 32px;\n}\n\n.colorwaysPillButton.colorwaysPillButton-onSurface {\n  	background-color: #1a1a1a;\n}\n\n.colorwaysPillButton.colorwaysPillButton-icon {\n  	padding: 4px;\n}\n\n.colorwaysPillButton:hover {\n  	background-color: #2a2a2a;\n}\n\n.colorwaySelectorSidebar-tab:hover {\n  	background-color: #2a2a2a;\n}\n\n.colorwaySelectorSidebar-tab.active {\n  	background-color: #0a0a0a;\n  	border-color: #a6a6a6;\n}\n\n.colorwaySelectorSidebar {\n  	background-color: #101010;\n  	color: #fff;\n  	box-sizing: border-box;\n  	height: 100%;\n  	flex: 0 0 auto;\n  	padding: 16px;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	border-top-left-radius: 8px;\n  	border-bottom-left-radius: 8px;\n}\n\n.colorwaySelectorModalContent {\n  	display: flex;\n  	flex-direction: column;\n  	width: 100%;\n  	height: 100%;\n  	overflow: visible !important;\n  	padding: 0 16px !important;\n}\n\n.ColorwaySelectorBtnContainer {\n  	position: relative;\n  	margin: 0 0 8px;\n  	display: flex;\n  	-webkit-box-pack: center;\n  	-ms-flex-pack: center;\n  	justify-content: center;\n  	width: 72px;\n}\n\n.colorwayInfoIconContainer {\n  	height: 22px;\n  	width: 22px;\n  	background-color: var(--brand-500);\n  	position: absolute;\n  	top: -1px;\n  	left: -1px;\n  	border-radius: 50%;\n  	opacity: 0;\n  	z-index: +1;\n  	color: var(--white-500);\n  	padding: 1px;\n  	box-sizing: border-box;\n}\n\n.colorwayInfoIconContainer:hover {\n  	background-color: var(--brand-experiment-560);\n}\n\n.discordColorway:hover .colorwayInfoIconContainer {\n  	opacity: 1;\n  	transition: 0.15s;\n}\n\n.colorwayCreator-swatch {\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	height: 50px;\n  	border-radius: 4px;\n  	box-sizing: border-box;\n  	border: none;\n  	width: 100%;\n  	position: relative;\n  	color: #fff;\n}\n\n.colorwayCreator-swatchName {\n  	color: currentcolor;\n  	pointer-events: none;\n}\n\n.colorwayCreator-colorPreviews {\n  	width: 100%;\n  	height: fit-content;\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: space-between;\n  	gap: 8px;\n  	position: relative;\n  	box-sizing: border-box;\n}\n\n.colorwayCreator-colorInput {\n  	width: 1px;\n  	height: 1px;\n  	opacity: 0;\n  	position: absolute;\n  	pointer-events: none;\n}\n\n.colorwayCreator-menuWrapper {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	padding: 20px 16px !important;\n  	overflow: visible !important;\n  	min-height: unset;\n}\n\n.colorwayCreator-modal {\n  	width: 620px !important;\n  	max-width: 620px;\n  	max-height: unset !important;\n}\n\n.colorways-creator-module-warning {\n  	color: var(--brand-500);\n}\n\n.colorwayCreator-colorPreviews > [class^=\"colorSwatch\"],\n.colorwayCreator-colorPreviews > [class^=\"colorSwatch\"] > [class^=\"swatch\"] {\n  	width: 100%;\n  	border: none;\n  	position: relative;\n}\n\n.colorwaysPicker-colorLabel {\n  	position: absolute;\n  	top: 0;\n  	left: 0;\n  	width: 100%;\n  	height: 100%;\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	pointer-events: none;\n}\n\n.colorwayCreator-colorPreviews > .colorSwatch-2UxEuG:has([fill=\"var(--primary-530)\"]) > .colorwaysPicker-colorLabel {\n  	color: var(--primary-530);\n}\n\n.colorwaySelector-noDisplay {\n  	display: none;\n}\n\n.colorwayInfo-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	color: var(--header-primary);\n}\n\n.colorwayInfo-colorSwatches {\n  	width: 100%;\n  	height: 46px;\n  	display: flex;\n  	flex-direction: row;\n  	align-items: center;\n  	justify-content: center;\n  	margin: 12px 0;\n  	gap: 8px;\n}\n\n.colorwayInfo-colorSwatch {\n  	display: flex;\n  	width: 100px;\n  	height: 38px;\n  	border-radius: 3px;\n  	cursor: pointer;\n  	position: relative;\n  	transition: 0.15s;\n}\n\n.colorwayInfo-colorSwatch:hover {\n  	filter: brightness(0.8);\n}\n\n.colorwayInfo-row {\n  	font-weight: 400;\n  	font-size: 20px;\n  	color: var(--header-secondary);\n  	margin-bottom: 4px;\n  	display: flex;\n  	flex-direction: row;\n  	align-items: center;\n  	justify-content: space-between;\n  	gap: 8px;\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	padding: 8px 12px;\n}\n\n.colorwayInfo-css {\n  	flex-direction: column;\n  	align-items: start;\n}\n\n.colorwayInfo-cssCodeblock {\n  	border-radius: 4px;\n  	border: 1px solid var(--background-accent);\n  	padding: 3px 6px;\n  	white-space: pre;\n  	max-height: 400px;\n  	overflow: auto;\n  	font-size: 0.875rem;\n  	line-height: 1.125rem;\n  	width: 100%;\n  	box-sizing: border-box;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar {\n  	width: 8px;\n  	height: 8px;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-corner {\n  	background-color: transparent;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-thumb {\n  	background-color: var(--scrollbar-auto-thumb);\n  	min-height: 40px;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-thumb,\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-track {\n  	border: 2px solid transparent;\n  	background-clip: padding-box;\n  	border-radius: 8px;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-track {\n  	margin-bottom: 8px;\n}\n\n.colorwaysCreator-settingCat {\n  	display: flex;\n  	flex-direction: column;\n  	padding: 10px;\n  	border-radius: 8px;\n  	background-color: #1a1a1a;\n  	box-sizing: border-box;\n  	max-height: 250px;\n  	overflow: hidden overlay;\n}\n\n.colorwaysColorpicker-settingCat {\n  	padding: 0;\n  	background-color: transparent;\n  	border-radius: 0;\n}\n\n.colorwaysColorpicker-search {\n  	width: 100%;\n}\n\n.colorwaysCreator-settingItm {\n  	display: flex;\n  	flex-direction: row;\n  	align-items: center;\n  	width: 100%;\n  	border-radius: 4px;\n  	cursor: pointer;\n  	box-sizing: border-box;\n  	padding: 8px;\n  	justify-content: space-between;\n}\n\n.colorwaysCreator-settingItm:hover {\n  	background-color: var(--background-modifier-hover);\n}\n\n.colorwaysCreator-settingsList .colorwaysCreator-preset {\n  	justify-content: start;\n  	gap: 8px;\n}\n\n.colorwaysCreator-settingsList {\n  	overflow: hidden auto;\n  	scrollbar-width: none !important;\n  	max-height: 185px;\n}\n\n.colorwaysCreator-settingCat-collapsed > :is(.colorwaysCreator-settingsList, .colorwayInfo-cssCodeblock),\n.colorwaysColorpicker-collapsed {\n  	display: none !important;\n}\n\n.colorwayColorpicker {\n  	display: flex;\n  	flex-direction: column;\n  	padding: 20px 16px !important;\n  	width: 620px !important;\n  	min-height: unset;\n}\n\n.colorwaysCreator-noHeader {\n  	margin-top: 12px;\n  	margin-bottom: 12px;\n}\n\n.colorwaysCreator-noMinHeight {\n  	min-height: unset;\n  	height: fit-content;\n}\n\n.colorwaysPreview-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	width: 100%;\n  	height: 270px;\n  	flex: 1 0 auto;\n  	border-radius: 4px;\n  	overflow: hidden;\n}\n\n.colorwaysPreview-modal {\n  	max-width: unset !important;\n  	max-height: unset !important;\n  	width: fit-content;\n  	height: fit-content;\n  	pointer-events: all;\n}\n\n.colorwaysPreview-modal > .colorwaysPreview-wrapper {\n  	height: 100%;\n}\n\n.colorwaysPreview-titlebar {\n  	height: 22px;\n  	width: 100%;\n  	display: flex;\n  	flex: 1 0 auto;\n}\n\n.colorwaysPreview-body {\n  	height: 100%;\n  	width: 100%;\n  	display: flex;\n}\n\n.colorwayPreview-guilds {\n  	width: 72px;\n  	height: 100%;\n  	display: flex;\n  	flex: 1 0 auto;\n  	padding-top: 4px;\n  	flex-direction: column;\n}\n\n.colorwayPreview-channels {\n  	width: 140px;\n  	height: 100%;\n  	display: flex;\n  	flex-direction: column-reverse;\n  	border-top-left-radius: 8px;\n  	flex: 1 0 auto;\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-channels {\n  	width: 240px;\n}\n\n.colorwayPreview-chat {\n  	width: 100%;\n  	height: 100%;\n  	display: flex;\n  	position: relative;\n  	flex-direction: column-reverse;\n}\n\n.colorwayPreview-userArea {\n  	width: 100%;\n  	height: 40px;\n  	display: flex;\n  	flex: 1 0 auto;\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-userArea {\n  	height: 52px;\n}\n\n.colorwaysPreview {\n  	display: flex;\n  	flex-direction: column;\n  	padding: 10px;\n  	gap: 5px;\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	box-sizing: border-box;\n  	color: var(--header-secondary);\n  	overflow: hidden overlay;\n  	margin-bottom: 4px;\n}\n\n.colorwaysPreview-collapsed .colorwaysPreview-wrapper {\n  	display: none;\n}\n\n.colorwayInfo-lastCat,\n.colorwaysCreator-lastCat {\n  	margin-bottom: 12px;\n}\n\n.colorwayPreview-guild {\n  	width: 100%;\n  	margin-bottom: 8px;\n  	display: flex;\n  	justify-content: center;\n}\n\n.colorwayPreview-guildItem {\n  	cursor: pointer;\n  	width: 48px;\n  	height: 48px;\n  	border-radius: 50px;\n  	transition: 0.2s ease;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n}\n\n.colorwayPreview-guildItem:hover {\n  	border-radius: 16px;\n}\n\n.colorwayPreview-guildSeparator {\n  	width: 32px;\n  	height: 2px;\n  	opacity: 0.48;\n  	border-radius: 1px;\n}\n\n.colorwayToolbox-listItem {\n  	align-items: center;\n  	border-radius: 4px;\n  	color: var(--interactive-normal);\n  	display: flex;\n  	flex-direction: column;\n  	gap: 12px;\n  	background-color: transparent !important;\n  	width: calc(564px / 4);\n  	cursor: default;\n  	float: left;\n  	box-sizing: border-box;\n  	margin: 0;\n  	padding: 0;\n}\n\n.colorwayToolbox-listItemSVG {\n  	padding: 19px;\n  	overflow: visible;\n  	border-radius: 50%;\n  	background-color: var(--background-tertiary);\n  	border: 1px solid transparent;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	transition: 0.15s ease;\n  	cursor: pointer;\n  	color: var(--interactive-normal);\n}\n\n.colorwayToolbox-listItem:hover {\n  	color: var(--interactive-normal) !important;\n}\n\n.colorwayToolbox-listItemSVG:hover {\n  	border-color: var(--brand-500);\n  	background-color: var(--brand-experiment-15a);\n  	color: var(--interactive-hover) !important;\n}\n\n.colorwayToolbox-title {\n  	align-items: center;\n  	display: flex;\n  	text-transform: uppercase;\n  	margin-top: 2px;\n  	padding-bottom: 8px;\n  	margin-bottom: 0;\n}\n\n.colorwayToolbox-list {\n  	box-sizing: border-box;\n  	height: 100%;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 12px;\n  	overflow: hidden;\n}\n\n.colorwayPreview-chatBox {\n  	height: 32px;\n  	border-radius: 6px;\n  	margin: 8px;\n  	margin-bottom: 12px;\n  	margin-top: 0;\n  	flex: 1 1 auto;\n}\n\n.colorwayPreview-filler {\n  	width: 100%;\n  	height: 100%;\n  	flex: 0 1 auto;\n}\n\n.colorwayPreview-topShadow {\n  	box-shadow:\n  			0 1px 0 hsl(var(--primary-900-hsl) / 20%),\n  			0 1.5px 0 hsl(var(--primary-860-hsl) / 5%),\n  			0 2px 0 hsl(var(--primary-900-hsl) / 5%);\n  	width: 100%;\n  	height: 32px;\n  	font-family: var(--font-display);\n  	font-weight: 500;\n  	padding: 12px 16px;\n  	box-sizing: border-box;\n  	align-items: center;\n  	display: flex;\n  	flex: 1 0 auto;\n}\n\n.colorwayPreview-channels > .colorwayPreview-topShadow {\n  	border-top-left-radius: 8px;\n}\n\n.colorwayPreview-channels > .colorwayPreview-topShadow:hover {\n  	background-color: hsl(var(--primary-500-hsl) / 30%);\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-topShadow {\n  	height: 48px;\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-chatBox {\n  	height: 44px;\n  	border-radius: 8px;\n  	margin: 16px;\n  	margin-bottom: 24px;\n}\n\n.colorwaysBtn-tooltipContent {\n  	font-weight: 600;\n  	font-size: 16px;\n  	line-height: 20px;\n}\n\n.colorwaySelector-headerIcon {\n  	box-sizing: border-box;\n  	width: 100%;\n  	height: 100%;\n  	transition:\n  			transform 0.1s ease-out,\n  			opacity 0.1s ease-out;\n  	color: var(--interactive-normal);\n}\n\n.colorwaySelector-header {\n  	align-items: center;\n  	justify-content: center;\n  	padding-bottom: 0;\n  	box-shadow: none !important;\n}\n\n.colorwayTextBox {\n  	width: 100%;\n  	border-radius: 6px;\n  	background-color: #101010;\n  	transition: 0.2s ease;\n  	border: 1px solid transparent;\n  	padding-left: 12px;\n  	color: #fff;\n  	height: 40px;\n  	box-sizing: border-box;\n}\n\n.colorwayTextBox:hover {\n  	background-color: #1a1a1a;\n}\n\n.colorwayTextBox:focus {\n  	background-color: #1a1a1a;\n  	border-color: #a6a6a6;\n}\n\n.colorwaySelector-sources {\n  	flex: 0 0 auto;\n  	color: var(--button-outline-primary-text);\n  	border-color: var(--button-outline-primary-border);\n}\n\n.colorwaySelector-sources:hover {\n  	background-color: var(--button-outline-primary-background-hover);\n  	border-color: var(--button-outline-primary-border-hover);\n  	color: var(--button-outline-primary-text-hover);\n}\n\n.colorwaySelector-headerBtn {\n  	position: absolute;\n  	top: 64px;\n  	right: 20px;\n}\n\n.theme-light .colorwaySelector-pill_selected {\n  	border-color: var(--brand-500) !important;\n  	background-color: var(--brand-experiment-160) !important;\n}\n\n.theme-dark .colorwaySelector-pill_selected {\n  	border-color: var(--brand-500) !important;\n  	background-color: var(--brand-experiment-15a) !important;\n}\n\n.colorwaysTooltip-tooltipPreviewRow {\n  	display: flex;\n  	align-items: center;\n  	margin-top: 8px;\n}\n\n.colorwayCreator-colorPreview {\n  	width: 100%;\n  	border-radius: 4px;\n  	height: 50px;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n}\n\n.colorwaysCreator-colorPreviewItm .colorwayCreator-colorPreviews {\n  	padding: 0;\n  	background-color: transparent;\n  	border-radius: 0;\n}\n\n.colorwaysCreator-colorPreviewItm {\n  	flex-direction: column;\n  	align-items: start;\n}\n\n.colorwaysTooltip-header {\n  	background-color: var(--background-primary);\n  	padding: 2px 8px;\n  	border-radius: 16px;\n  	height: min-content;\n  	color: var(--header-primary);\n  	margin-bottom: 2px;\n  	display: inline-flex;\n  	margin-left: -4px;\n}\n\n.colorwaySelector-pillSeparator {\n  	height: 24px;\n  	width: 1px;\n  	background-color: var(--primary-400);\n}\n\n.colorwaysSelector-changelog {\n  	font-weight: 400;\n  	font-size: 20px;\n  	color: var(--header-secondary);\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	padding: 8px 12px;\n}\n\n.colorwaysChangelog-li {\n  	position: relative;\n  	font-size: 16px;\n  	line-height: 20px;\n}\n\n.colorwaysChangelog-li::before {\n  	content: \"\";\n  	position: absolute;\n  	top: 10px;\n  	left: -15px;\n  	width: 6px;\n  	height: 6px;\n  	margin-top: -4px;\n  	margin-left: -3px;\n  	border-radius: 50%;\n  	opacity: 0.3;\n}\n\n.theme-dark .colorwaysChangelog-li::before {\n  	background-color: hsl(216deg calc(var(--saturation-factor, 1) * 9.8%) 90%);\n}\n\n.theme-light .colorwaysChangelog-li::before {\n  	background-color: hsl(223deg calc(var(--saturation-factor, 1) * 5.8%) 52.9%);\n}\n\n.ColorwaySelectorWrapper .colorwayToolbox-list {\n  	width: 100%;\n}\n\n.colorwaysToolbox-label {\n  	border-radius: 20px;\n  	box-sizing: border-box;\n  	color: var(--text-normal);\n  	transition: 0.15s ease;\n  	width: 100%;\n  	margin-left: 0;\n  	height: fit-content;\n  	text-align: center;\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: wrap;\n  	cursor: default;\n  	max-height: 2rem;\n  	padding: 0 8px;\n}\n\n.colorwaysSelector-changelogHeader {\n  	font-weight: 700;\n  	font-size: 16px;\n  	line-height: 20px;\n  	text-transform: uppercase;\n  	position: relative;\n  	display: flex;\n  	align-items: center;\n}\n\n.colorwaysSelector-changelogHeader::after {\n  	content: \"\";\n  	height: 1px;\n  	flex: 1 1 auto;\n  	margin-left: 4px;\n  	opacity: 0.6;\n  	background-color: currentcolor;\n}\n\n.colorwaysSelector-changelogHeader_added {\n  	color: var(--text-positive);\n}\n\n.colorwaysSelector-changelogHeader_fixed {\n  	color: hsl(359deg calc(var(--saturation-factor, 1) * 87.3%) 59.8%);\n}\n\n.colorwaysSelector-changelogHeader_changed {\n  	color: var(--text-warning);\n}\n\n.is-mobile .colorwaySelectorModal,\n.is-mobile .colorwayCreator-modal {\n  	width: 100vw !important;\n  	box-sizing: border-box;\n  	min-width: unset;\n  	border-radius: 0;\n  	height: 100vh;\n  	max-height: unset;\n  	border: none;\n}\n\n.is-mobile .colorwaySelectorModalContent {\n  	box-sizing: border-box;\n  	width: 100vw;\n}\n\n.is-mobile .colorwaySelector-doublePillBar {\n  	flex-direction: column-reverse;\n  	align-items: end;\n}\n\n.is-mobile .colorwaySelector-doublePillBar > .colorwaySelector-pillWrapper:first-child {\n  	width: 100%;\n  	gap: 4px;\n  	overflow-x: auto;\n  	justify-content: space-between;\n}\n\n.is-mobile .colorwaySelector-doublePillBar > .colorwaySelector-pillWrapper:first-child > .colorwaySelector-pill {\n  	border-radius: 0;\n  	border-top: none;\n  	border-left: none;\n  	border-right: none;\n  	background-color: transparent;\n  	width: 100%;\n  	justify-content: center;\n  	flex: 0 0 min-content;\n}\n\n.is-mobile\n  	.colorwaySelector-doublePillBar\n  	> .colorwaySelector-pillWrapper:first-child\n  	> .colorwaySelector-pillSeparator {\n  	display: none;\n}\n\n.is-mobile .layer-fP3xEz:has(.colorwaySelectorModal, .colorwayCreator-modal) {\n  	padding: 0;\n}\n\n.is-mobile .ColorwaySelectorWrapper {\n  	justify-content: space-around;\n  	gap: 10px;\n}\n\n#colorwaySelector-pill_closeSelector {\n  	display: none !important;\n}\n\n.is-mobile #colorwaySelector-pill_closeSelector {\n  	display: flex !important;\n}\n\n.colorwaysBtn-spinner {\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	width: 100%;\n}\n\n.colorwaysBtn-spinnerInner {\n  	transform: rotate(280deg);\n  	position: relative;\n  	display: inline-block;\n  	width: 32px;\n  	height: 32px;\n  	contain: paint;\n}\n\n@keyframes spinner-spinning-circle-rotate {\n  	100% {\n  			transform: rotate(1turn);\n  	}\n}\n\n@keyframes spinner-spinning-circle-dash {\n  	0% {\n  			stroke-dasharray: 1, 200;\n  			stroke-dashoffset: 0;\n  	}\n\n  	50% {\n  			stroke-dasharray: 130, 200;\n  	}\n\n  	100% {\n  			stroke-dasharray: 130, 200;\n  			stroke-dashoffset: -124;\n  	}\n}\n\n.colorwaysBtn-spinnerCircular {\n  	animation: spinner-spinning-circle-rotate 2s linear infinite;\n  	height: 100%;\n  	width: 100%;\n}\n\n.colorwaysBtn-spinnerBeam {\n  	animation: spinner-spinning-circle-dash 2s ease-in-out infinite;\n  	stroke-dasharray: 1, 200;\n  	stroke-dashoffset: 0;\n  	fill: none;\n  	stroke-width: 6;\n  	stroke-miterlimit: 10;\n  	stroke-linecap: round;\n  	stroke: currentcolor;\n}\n\n.colorwaysBtn-spinnerBeam2 {\n  	stroke: currentcolor;\n  	opacity: 0.6;\n  	animation-delay: 0.15s;\n}\n\n.colorwaysBtn-spinnerBeam3 {\n  	stroke: currentcolor;\n  	opacity: 0.3;\n  	animation-delay: 0.23s;\n}\n\n.colorwaysModalTab {\n  	padding: 16px;\n}\n\n.colorwaysSettings-colorwaySource {\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: space-between;\n  	padding: 8px;\n  	gap: 5px;\n  	border-radius: 8px;\n  	box-sizing: border-box;\n  	align-items: center;\n  	background-color: #101010;\n}\n\n.discordColorway {\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: start;\n  	padding: 0 8px;\n  	gap: 5px;\n  	border-radius: 6px;\n  	background-color: #101010;\n  	box-sizing: border-box;\n  	min-height: 44px;\n  	align-items: center;\n  	border: 1px solid transparent;\n  	transition: 0.2s ease;\n  	cursor: pointer;\n}\n\n.discordColorway:hover {\n  	background-color: #2a2a2a;\n  	filter: brightness(0.8);\n}\n\n.discordColorway[aria-checked=\"true\"] {\n  	background-color: #2a2a2a;\n  	border-color: #a6a6a6;\n}\n\n.colorwaysSettings-modalRoot {\n  	min-width: 520px;\n}\n\n.colorwaysSettings-colorwaySourceLabel {\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n  	flex-grow: 1;\n  	line-height: 30px;\n}\n\n.colorwaysSettings-colorwaySourceLabelHeader {\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n  	flex-grow: 1;\n  	font-weight: 700;\n  	font-size: 16px;\n}\n\n.colorwaysModalSectionHeader,\n.colorwaysSettings-colorwaySourceLabel,\n.colorwaysSettings-colorwaySourceLabelHeader,\n.colorwaysSettings-colorwaySourceDesc {\n  	color: #fff;\n}\n\n.colorwaysSettings-colorwaySourceDesc {\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n  	flex-grow: 1;\n}\n\n.colorwaysSettings-iconButton {\n  	background-color: transparent !important;\n  	border-radius: 0;\n}\n\n.colorwaysSettings-iconButtonInner {\n  	display: flex;\n  	gap: 4px;\n  	align-items: center;\n}\n\n.colorwaysSettings-modalContent {\n  	margin: 8px 0;\n}\n\n@keyframes loading-bar {\n  	0% {\n  			left: 0;\n  			right: 100%;\n  			width: 0;\n  	}\n\n  	10% {\n  			left: 0;\n  			right: 75%;\n  			width: 25%;\n  	}\n\n  	90% {\n  			right: 0;\n  			left: 75%;\n  			width: 25%;\n  	}\n\n  	100% {\n  			left: 100%;\n  			right: 0;\n  			width: 0;\n  	}\n}\n\n.colorwaysLoader-barContainer {\n  	width: 100%;\n  	border-radius: var(--radius-round);\n  	border: 0;\n  	position: relative;\n  	padding: 0;\n}\n\n.colorwaysLoader-bar {\n  	position: absolute;\n  	border-radius: var(--radius-round);\n  	top: 0;\n  	right: 100%;\n  	bottom: 0;\n  	left: 0;\n  	background: var(--brand-500);\n  	width: 0;\n  	animation: loading-bar 2s linear infinite;\n  	transition: 0.2s ease;\n}\n\n.colorwaysSettingsSelector-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n}\n\n.colorwaysSettingsPage-wrapper .colorwayToolbox-listItem {\n  	gap: 8px;\n  	border-radius: 50px;\n  	padding: 12px 16px;\n  	background-color: var(--background-tertiary);\n  	transition: 0.15s ease;\n  	border: 1px solid transparent;\n  	color: var(--interactive-normal);\n}\n\n.colorwaysSettingsPage-wrapper .colorwayToolbox-listItem:hover {\n  	border-color: var(--brand-500);\n  	background-color: var(--brand-experiment-15a);\n  	color: var(--interactive-hover);\n}\n\n.colorwaysSettingsSelector-wrapper .colorwaySelector-doublePillBar {\n  	justify-content: start;\n}\n\n.colorwaysCreator-toolboxItm:hover {\n  	background-color: var(--brand-experiment) !important;\n}\n\n.colorwayCreator-colorPreview_primary + .colorwayCreator-colorPreview_primary,\n.colorwayCreator-colorPreview_secondary + .colorwayCreator-colorPreview_secondary,\n.colorwayCreator-colorPreview_tertiary + .colorwayCreator-colorPreview_tertiary,\n.colorwayCreator-colorPreview_accent + .colorwayCreator-colorPreview_accent {\n  	display: none;\n}\n\n.colorwaysConflictingColors-warning {\n  	width: 100%;\n  	text-align: center;\n  	justify-content: center;\n  	color: #fff;\n}\n\n.ColorwaySelectorBtn_thin {\n  	height: 21px !important;\n  	width: 56px !important;\n}\n\n.ColorwaySelectorBtn_thin:hover {\n  	border-radius: 8px;\n}\n\n.colorwayTextBoxPopout {\n  	display: none !important;\n}\n\n.colorways-badge {\n  	font-size: 0.625rem;\n  	text-transform: uppercase;\n  	vertical-align: top;\n  	display: inline-flex;\n  	align-items: center;\n  	text-indent: 0;\n  	background: #fff;\n  	color: #000;\n  	flex: 0 0 auto;\n  	height: 15px;\n  	padding: 0 4px;\n  	margin-top: 7.5px;\n  	border-radius: 16px;\n}\n\n.hoverRoll {\n  	display: inline-block;\n  	vertical-align: top;\n  	cursor: default;\n  	text-align: left;\n  	box-sizing: border-box;\n  	position: relative;\n  	width: 100%;\n  	contain: paint;\n}\n\n.hoverRoll_hovered {\n  	white-space: nowrap;\n  	text-overflow: ellipsis;\n  	overflow: hidden;\n  	display: block;\n  	transition: all.22s ease;\n  	transform-style: preserve-3d;\n  	pointer-events: none;\n  	width: 100%;\n  	opacity: 0;\n  	transform: translate3d(0, 107%, 0);\n  	position: absolute;\n  	top: 0;\n  	left: 0;\n  	bottom: 0;\n  	right: 0;\n}\n\n.hoverRoll:hover .hoverRoll_hovered,\n.colorwaysSettings-colorwaySource:hover .hoverRoll_hovered {\n  	transform: translateZ(0);\n  	opacity: 1;\n}\n\n.hoverRoll_normal {\n  	white-space: nowrap;\n  	text-overflow: ellipsis;\n  	overflow: hidden;\n  	display: block;\n  	transition: all 0.22s ease;\n  	transform-style: preserve-3d;\n  	pointer-events: none;\n  	width: 100%;\n}\n\n.hoverRoll:hover .hoverRoll_normal,\n.colorwaysSettings-colorwaySource:hover .hoverRoll_normal {\n  	transform: translate3d(0, -107%, 0);\n  	opacity: 0;\n  	user-select: none;\n}\n\n.dc-warning-card {\n  	padding: 1em;\n  	margin-bottom: 1em;\n  	background-color: var(--info-warning-background);\n  	border-color: var(--info-warning-foreground);\n  	color: var(--info-warning-text);\n}\n\n/* stylelint-disable-next-line no-duplicate-selectors */\n.colorwaysPreview-modal {\n  	width: 90vw !important;\n  	height: 90vh !important;\n  	max-height: unset !important;\n  	animation: show-modal 0.2s ease;\n}\n\n.colorwaysPresetPicker-content {\n  	padding: 16px;\n}\n\n.colorwaysPresetPicker {\n  	width: 600px;\n}\n\n.colorwaysCreator-setting {\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: space-between;\n  	border-radius: 8px;\n  	background-color: #1a1a1a;\n  	box-sizing: border-box;\n  	padding: 10px 18px;\n  	padding-right: 10px;\n  	cursor: pointer;\n  	align-items: center;\n}\n\n.colorwaysCreator-setting:hover {\n  	background-color: #2a2a2a;\n}\n\n.dc-colorway-selector::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--si-appearance) center/contain no-repeat !important;\n  	mask: var(--si-appearance) center/contain no-repeat !important;\n}\n\n.dc-colorway-settings::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--si-vencordsettings) center/contain no-repeat !important;\n  	mask: var(--si-vencordsettings) center/contain no-repeat !important;\n}\n\n.dc-colorway-ondemand::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--si-vencordupdater) center/contain no-repeat !important;\n  	mask: var(--si-vencordupdater) center/contain no-repeat !important;\n}\n\n.dc-colorway-sources-manager::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--si-instantinvites) center/contain no-repeat !important;\n  	mask: var(--si-instantinvites) center/contain no-repeat !important;\n}\n\n.colorwaySourceModal {\n  	min-height: unset;\n}\n\n.colorwaySelector-sourceSelect {\n  	width: fit-content !important;\n}\n\n.dc-info-card {\n  	border-radius: 5px;\n  	border: 1px solid var(--blue-345);\n  	padding: 1em;\n  	margin-bottom: 1em;\n  	display: flex;\n  	gap: 1em;\n  	flex-direction: column;\n}\n\n.theme-dark .dc-info-card {\n  	color: var(--white-500);\n}\n\n.theme-light .dc-info-card {\n  	color: var(--black-500);\n}\n\n.colorwaysSettings-sourceScroller {\n  	scrollbar-width: none;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	overflow: hidden auto;\n}\n\n.colorwaysScroller {\n  	scrollbar-width: none !important;\n  	overflow: hidden auto;\n}\n\n.colorwaysSettings-sourceScroller::-webkit-scrollbar {\n  	width: 0;\n}\n\n.colorwayMessage {\n  	padding: 20px;\n  	border: 1px solid #a6a6a6f0;\n  	border-radius: 8px;\n  	background-color: #090909;\n  	display: flex;\n}\n\n.colorwayMessage-contents {\n  	display: flex;\n  	flex-direction: column;\n}\n\n.colorwaysLoadingModal,\n.colorwayInfo-cssModal {\n  	width: fit-content;\n  	height: fit-content;\n  	min-width: unset;\n  	min-height: unset;\n  	background: none;\n  	box-shadow: none !important;\n  	border: none;\n}\n\n.discordColorway .discordColorwayPreviewColorContainer {\n  	width: 30px;\n  	height: 30px;\n}\n\n.discordColorway .colorwayInfoIconContainer {\n  	height: 28px;\n  	width: 28px;\n  	border-radius: 3px;\n  	position: static;\n  	opacity: 1;\n  	justify-content: center;\n  	display: flex;\n  	align-items: center;\n  	background: transparent;\n  	border: 1px solid var(--button-outline-primary-border);\n  	color: var(--button-outline-primary-text);\n  	transition: 0.15s;\n}\n\n.discordColorway .colorwayInfoIconContainer:hover {\n  	background-color: var(--button-outline-primary-background-hover);\n  	border-color: var(--button-outline-primary-border-hover);\n  	color: var(--button-outline-primary-text-hover);\n}\n\n.colorwayLabel {\n  	margin-right: auto;\n  	margin-top: 0 !important;\n  	margin-left: 0.5rem;\n  	color: #dfdfdf;\n}\n\n.colorwaySelectionCircle {\n  	position: absolute;\n  	width: 56px;\n  	height: 56px;\n  	top: 0;\n  	left: 0;\n}\n\n.colorwaySelector-sorter {\n  	height: 50px;\n  	width: 100%;\n  	box-shadow: var(--elevation-low);\n  	margin-bottom: 8px;\n  	display: flex;\n}\n\n.colorwaySelector-sorter_selectedSpacer {\n  	width: 80px;\n  	height: 50px;\n}\n\n.colorwaySelector-sorter_text {\n  	line-height: 50px;\n  	margin: 0;\n}\n\n.colorwaySelector-sorter_name {\n  	margin-right: auto;\n  	cursor: pointer;\n}\n\n.colorwayPresetLabel {\n  	margin-right: 1rem;\n}\n\n.colorwayPreview-channel {\n  	margin: 10px;\n  	width: calc(100% - 20px);\n  	height: 8px;\n  	border-radius: 16px;\n}\n\n.colorwaysModal {\n  	border-radius: 16px;\n  	background-color: #000;\n  	color: #fff;\n  	height: fit-content;\n  	min-height: unset;\n  	width: fit-content;\n  	border: none;\n  	padding: 0;\n  	margin: 0;\n  	transition: 0.4s ease;\n  	animation: show-modal 0.4s ease;\n  	pointer-events: all;\n}\n\n.colorwaysModalContent {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 4px;\n  	padding: 16px;\n}\n\n.colorwaysModalContent-sourcePreview {\n  	padding-left: 0;\n  	padding-right: 0;\n}\n\n.colorwaysMenuTabs {\n  	width: 100%;\n  	height: 30px;\n  	padding-bottom: 8px;\n  	box-sizing: content-box;\n}\n\n.colorwaysMenuTab {\n  	color: #fff;\n  	text-decoration: none;\n  	padding: 4px 12px;\n  	border-radius: 32px;\n  	transition: 0.2s ease;\n  	margin-right: 8px;\n  	display: inline-block;\n}\n\n.colorwaySourceTab {\n  	box-sizing: border-box;\n  	width: 100%;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n}\n\n.colorwaysMenuTab:hover {\n  	background-color: #1f1f1f;\n}\n\n.colorwaysMenuTab.active {\n  	color: #000;\n  	background-color: #fff;\n}\n\n.colorwaysModalFooter {\n  	border-top-left-radius: 8px;\n  	border-top-right-radius: 8px;\n  	border-bottom-left-radius: 16px;\n  	border-bottom-right-radius: 16px;\n  	padding: 8px;\n  	display: flex;\n  	flex-direction: row-reverse;\n  	background-color: #0a0a0a;\n  	width: calc(100% - 16px);\n  	gap: 8px;\n}\n\n.colorwaysModalFooter > .colorwaysPillButton {\n  	width: 100%;\n}\n\n.colorwaysModalHeader {\n  	margin: 0;\n  	font-weight: normal;\n  	font-size: 1.25em;\n  	padding: 16px;\n}\n\n.colorwaysModalSectionHeader {\n  	font-size: 14px;\n  	margin-bottom: 2px;\n}\n\n.colorwaysModalSectionError {\n  	color: red;\n  	font-style: italic;\n}\n\n.colorwayIDCard {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 1em;\n}\n\n.colorwaysContextMenu {\n  	border-radius: 8px;\n  	border: 1px solid #dfdfdf;\n  	background-color: #000;\n  	padding: 4px;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 4px;\n  	z-index: 5;\n}\n\n.colorwaysContextMenuItm {\n  	box-sizing: border-box;\n  	display: flex;\n  	justify-content: space-between;\n  	align-items: center;\n  	min-height: 32px;\n  	padding: 6px 8px;\n  	border-radius: 6px;\n  	background-color: #101010;\n  	border: 1px solid transparent;\n  	transition: 0.2s ease;\n  	cursor: pointer;\n  	color: #dfdfdf;\n}\n\n.colorwaysContextMenuItm:hover {\n  	background-color: #2a2a2a;\n  	border-color: #a6a6a6;\n}\n\n.colorwaysRadioSelected {\n  	fill: #fff;\n}\n\n.colorwaysTooltip {\n  	background-color: var(--background-floating);\n  	box-shadow: var(--shadow-high);\n  	color: var(--text-normal);\n  	pointer-events: none;\n  	border-radius: 5px;\n  	font-weight: 500;\n  	font-size: 14px;\n  	line-height: 16px;\n  	max-width: 190px;\n  	box-sizing: border-box;\n  	word-wrap: break-word;\n  	z-index: 1002;\n  	will-change: opacity, transform;\n  	transition:\n  			transform 0.1s ease,\n  			opacity 0.1s ease;\n  	position: fixed;\n}\n\n.colorwaysTooltip.colorwaysTooltip-hidden {\n  	transform: scale(0.95);\n  	opacity: 0;\n}\n\n.colorwaysTooltip-right {\n  	transform-origin: 0% 50%;\n}\n\n.colorwaysTooltipPointer {\n  	width: 0;\n  	height: 0;\n  	border: 0 solid transparent;\n  	border-width: 5px;\n  	pointer-events: none;\n  	border-top-color: var(--background-floating);\n}\n\n.colorwaysTooltip-right > .colorwaysTooltipPointer {\n  	position: absolute;\n  	right: 100%;\n  	top: 50%;\n  	margin-top: -5px;\n  	border-left-width: 5px;\n  	transform: rotate(90deg);\n}\n\n.colorwaysTooltipContent {\n  	padding: 8px 12px;\n  	overflow: hidden;\n  	font-weight: 600;\n  	font-size: 16px;\n  	line-height: 20px;\n  	display: flex;\n  	flex-direction: column;\n}\n\n.colorwaysManagerConnectionMenu {\n  	transform: translateX(-20px);\n  	opacity: 0;\n  	border: 1px solid #a6a6a6f0;\n  	background-color: #090909;\n  	transition:\n  			transform 0.2s ease,\n  			opacity 0.2s ease;\n  	display: flex;\n  	flex-direction: column;\n  	padding: 8px 12px;\n  	color: #fff;\n  	pointer-events: none;\n  	border-radius: 8px;\n  	font-weight: 600;\n  	font-size: 16px;\n  	line-height: 20px;\n}\n\n.colorwaysManagerConnectionMenu.visible {\n  	opacity: 1;\n  	transform: none;\n  	pointer-events: all;\n}\n\n.colorwaysManagerConnectionValue {\n  	color: #80868e;\n  	font-weight: 500;\n  	font-size: 12;\n}\n\n.colorwaysManagerConnectionValue > b {\n  	color: #a0a6ae;\n}\n";

const css = ".colorwaySelectorModal[data-theme=\"discord\"],\n.colorwayModal[data-theme=\"discord\"] {\n  	border: none;\n  	box-shadow: var(--legacy-elevation-border), var(--legacy-elevation-high);\n  	background-color: var(--modal-background);\n}\n\n[data-theme=\"discord\"] .colorwaysSettingsDivider {\n  	border-color: var(--background-modifier-accent);\n}\n\n[data-theme=\"discord\"] .colorwaySwitch-label,\n[data-theme=\"discord\"] .colorwaysNote {\n  	color: var(--header-primary);\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-switchCircle {\n  	fill: #fff !important;\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-switch {\n  	background-color: rgb(128, 132, 142);\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-switch.checked {\n  	background-color: #23a55a;\n}\n\n[data-theme=\"discord\"] > .colorwaySelectorSidebar > .colorwaySelectorSidebar-tab {\n  	transition: none;\n  	border-radius: 4px;\n  	border: none;\n}\n\n[data-theme=\"discord\"] > .colorwaySelectorSidebar > .colorwaySelectorSidebar-tab.active {\n  	background-color: var(--background-modifier-selected);\n}\n\n[data-theme=\"discord\"] > .colorwaySelectorSidebar > .colorwaySelectorSidebar-tab:hover {\n  	background-color: var(--background-modifier-hover);\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton {\n  	color: var(--white-500);\n  	background-color: var(--button-secondary-background);\n  	height: var(--custom-button-button-sm-height);\n  	min-width: var(--custom-button-button-sm-width);\n  	min-height: var(--custom-button-button-sm-height);\n  	width: auto;\n  	transition:\n  			background-color var(--custom-button-transition-duration) ease,\n  			color var(--custom-button-transition-duration) ease;\n  	position: relative;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	box-sizing: border-box;\n  	border: none;\n  	border-radius: 3px;\n  	font-size: 14px;\n  	font-weight: 500;\n  	line-height: 16px;\n  	padding: 2px 16px;\n  	-moz-user-select: none;\n  	user-select: none;\n}\n\n[data-theme=\"discord\"] .colorwaysPillButton:hover {\n  	background-color: var(--button-secondary-background-hover);\n}\n\n[data-theme=\"discord\"] > .colorwaySelectorSidebar {\n  	border-top-left-radius: 4px;\n  	border-bottom-left-radius: 4px;\n  	background-color: var(--modal-footer-background);\n  	box-shadow: inset 0 1px 0 hsl(var(--primary-630-hsl) / 0.6);\n  	padding: 12px;\n}\n\n[data-theme=\"discord\"] .colorwayTextBox {\n  	border-radius: 3px;\n  	color: var(--text-normal);\n  	background-color: var(--input-background) !important;\n  	height: 40px;\n  	padding: 10px;\n  	transition: none;\n  	font-size: 16px;\n  	border: none;\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySource {\n  	border-radius: 4px;\n  	color: var(--interactive-normal);\n  	background-color: var(--background-secondary);\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySource:hover {\n  	color: var(--interactive-active);\n  	background-color: var(--background-modifier-hover);\n}\n\n[data-theme=\"discord\"] .discordColorway {\n  	border-radius: 4px;\n  	transition: none;\n  	background-color: var(--background-secondary);\n  	border: none;\n}\n\n[data-theme=\"discord\"] .discordColorway:hover {\n  	filter: none;\n  	background-color: var(--background-modifier-hover);\n}\n\n[data-theme=\"discord\"] .discordColorway[aria-checked=\"true\"] {\n  	background-color: var(--background-modifier-selected);\n}\n\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySourceLabelHeader,\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySourceDesc {\n  	color: var(--header-primary);\n}\n\n[data-theme=\"discord\"] .colorways-badge {\n  	height: 16px;\n  	padding: 0 4px;\n  	border-radius: 4px;\n  	margin-left: 4px;\n  	flex: 0 0 auto;\n  	background: var(--bg-brand);\n  	color: var(--white);\n  	font-size: 0.625rem;\n  	text-transform: uppercase;\n  	vertical-align: top;\n  	display: inline-flex;\n  	align-items: center;\n  	text-indent: 0;\n  	font-weight: 600;\n  	font-size: 12px;\n  	line-height: 16px;\n}\n\n.colorwaysModal[data-theme=\"discord\"] {\n  	box-shadow: var(--legacy-elevation-border), var(--legacy-elevation-high);\n  	background-color: var(--modal-background);\n  	border-radius: 4px;\n  	display: flex;\n  	flex-direction: column;\n  	margin: 0 auto;\n  	pointer-events: all;\n  	position: relative;\n}\n\n[data-theme=\"discord\"] .colorwaysMenuTabs {\n  	padding-bottom: 16px;\n}\n\n[data-theme=\"discord\"] .colorwaysMenuTab {\n  	padding: 0;\n  	padding-bottom: 16px;\n  	margin-right: 32px;\n  	margin-bottom: -2px;\n  	border-bottom: 2px solid transparent;\n  	transition: none;\n  	border-radius: 0;\n  	background-color: transparent;\n  	font-size: 16px;\n  	line-height: 20px;\n  	cursor: pointer;\n  	font-weight: 500;\n}\n\n[data-theme=\"discord\"] .colorwaysMenuTab:hover {\n  	color: var(--interactive-hover);\n  	border-bottom-color: var(--brand-500);\n}\n\n[data-theme=\"discord\"] .colorwaysMenuTab.active {\n  	cursor: default;\n  	color: var(--interactive-active);\n  	border-bottom-color: var(--control-brand-foreground);\n}\n\n[data-theme=\"discord\"] .colorwaysModalFooter {\n  	border-radius: 0 0 5px 5px;\n  	background-color: var(--modal-footer-background);\n  	padding: 16px;\n  	box-shadow: inset 0 1px 0 hsl(var(--primary-630-hsl) / 0.6);\n  	gap: 0;\n  	width: unset;\n}\n\n[data-theme=\"discord\"] .colorwaysModalFooter > .colorwaysPillButton {\n  	width: auto;\n  	height: var(--custom-button-button-md-height);\n  	min-width: var(--custom-button-button-md-width);\n  	min-height: var(--custom-button-button-md-height);\n  	transition:\n  			color var(--custom-button-transition-duration) ease,\n  			background-color var(--custom-button-transition-duration) ease,\n  			border-color var(--custom-button-transition-duration) ease;\n  	border: 1px solid var(--button-outline-primary-border);\n  	color: var(--button-outline-primary-text);\n  	margin-left: 8px;\n  	background-color: transparent;\n}\n\n[data-theme=\"discord\"] .colorwaysModalFooter > .colorwaysPillButton:hover {\n  	background-color: var(--button-outline-primary-background-hover);\n  	border-color: var(--button-outline-primary-border-hover);\n  	color: var(--button-outline-primary-text-hover);\n}\n\n[data-theme=\"discord\"] .colorwaysModalFooter > .colorwaysPillButton:active {\n  	background-color: var(--button-outline-primary-background-active);\n  	border-color: var(--button-outline-primary-border-active);\n  	color: var(--button-outline-primary-text-active);\n}\n\n[data-theme=\"discord\"] .colorwaysModalFooter > .colorwaysPillButton.colorwaysPillButton-onSurface {\n  	color: var(--white-500);\n  	background-color: var(--brand-500);\n  	border: none;\n}\n\n[data-theme=\"discord\"] .colorwaysModalFooter > .colorwaysPillButton.colorwaysPillButton-onSurface:hover {\n  	background-color: var(--brand-560);\n}\n\n[data-theme=\"discord\"] .colorwaysModalFooter > .colorwaysPillButton.colorwaysPillButton-onSurface:active {\n  	background-color: var(--brand-600);\n}\n\n[data-theme=\"discord\"] .colorwaysModalHeader {\n  	box-shadow:\n  			0 1px 0 0 hsl(var(--primary-800-hsl) / 0.3),\n  			0 1px 2px 0 hsl(var(--primary-800-hsl) / 0.3);\n  	border-radius: 4px 4px 0 0;\n  	transition: box-shadow 0.1s ease-out;\n  	word-wrap: break-word;\n}\n\n[data-theme=\"discord\"] .colorwaysModalSectionHeader,\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySourceLabel,\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySourceLabelHeader,\n[data-theme=\"discord\"] .colorwaysSettings-colorwaySourceDesc {\n  	color: var(--header-primary);\n}\n\n[data-theme=\"discord\"] .colorwaysCreator-setting,\n[data-theme=\"discord\"] .colorwaysCreator-settingCat {\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n}\n\n[data-theme=\"discord\"] .colorwaysCreator-setting:hover {\n  	background-color: var(--background-modifier-hover);\n}\n\n[data-theme=\"discord\"] .colorwaysContextMenu {\n  	background: var(--background-floating);\n  	box-shadow: var(--shadow-high);\n  	border-radius: 4px;\n  	padding: 6px 8px;\n  	border: none;\n  	gap: 0;\n  	min-width: 188px;\n  	max-width: 320px;\n  	box-sizing: border-box;\n}\n\n[data-theme=\"discord\"] .colorwaysContextMenuItm {\n  	border: none;\n  	transition: none;\n  	margin: 2px 0;\n  	border-radius: 2px;\n  	font-size: 14px;\n  	font-weight: 500;\n  	line-height: 18px;\n  	color: var(--interactive-normal);\n  	background-color: transparent;\n}\n\n[data-theme=\"discord\"] .colorwaysContextMenuItm:hover {\n  	background-color: var(--menu-item-default-hover-bg);\n  	color: var(--white);\n}\n\n[data-theme=\"discord\"] .colorwaysContextMenuItm:active {\n  	background-color: var(--menu-item-default-active-bg);\n  	color: var(--white);\n}\n\n[data-theme=\"discord\"] .colorwaysRadioSelected {\n  	fill: var(--control-brand-foreground-new);\n}\n\n[data-theme=\"discord\"] .colorwaysConflictingColors-warning {\n  	color: var(--text-normal);\n}\n\n[data-theme=\"discord\"] .colorwaysManagerConnectionMenu {\n  	transition:\n  			transform 0.1s ease,\n  			opacity 0.1s ease !important;\n  	transform: scale(0.95);\n  	transform-origin: 0% 50%;\n  	background-color: var(--background-floating);\n  	box-shadow: var(--shadow-high);\n  	color: var(--text-normal);\n  	border: none;\n  	border-radius: 5px;\n}\n\n.colorwayIDCard[data-theme=\"discord\"] > .colorwayMessage {\n  	border-radius: 5px;\n  	border: none;\n  	background-color: var(--background-secondary);\n}\n\n.theme-dark .colorwayIDCard[data-theme=\"discord\"] .colorwayMessage {\n  	background: hsl(var(--primary-630-hsl) / 60%);\n}\n\n.theme-light .colorwayIDCard[data-theme=\"discord\"] .colorwayMessage {\n  	background: hsl(var(--primary-100-hsl) / 60%);\n}\n\n[data-theme=\"discord\"] .colorwaysManagerConnectionValue {\n  	color: var(--text-muted);\n}\n\n[data-theme=\"discord\"] .colorwaysManagerConnectionValue > b {\n  	color: var(--text-normal);\n}\n\n.visual-refresh .colorwaySelectorModal[data-theme=\"discord\"] {\n  	border-radius: 12px;\n  	background-color: var(--bg-base-primary);\n}\n\n.visual-refresh .colorwaySelectorModal[data-theme=\"discord\"] > .colorwaySelectorSidebar {\n  	border-top-left-radius: 12px;\n  	border-bottom-left-radius: 12px;\n  	background-color: var(--bg-base-tertiary);\n  	margin-right: 0;\n  	border: 1px solid var(--border-subtle);\n}\n\n.visual-refresh .colorwaySelectorModal[data-theme=\"discord\"] .colorwaySelectorSidebar-tab {\n  	border-radius: 8px;\n  	width: 44px;\n  	height: 44px;\n  	border: 1px solid transparent;\n  	transition:\n  			background-color 0.1s ease-in-out,\n  			border-color 0.1s ease-in-out;\n}\n\n.visual-refresh .colorwaySelectorModal[data-theme=\"discord\"] .colorwaySelectorSidebar-tab.active {\n  	background: var(--bg-overlay-1, var(--bg-surface-raised));\n  	border-color: var(--border-faint);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysPillButton,\n.visual-refresh [data-theme=\"discord\"] .discordColorway {\n  	background: var(--bg-mod-faint);\n  	border-radius: 8px;\n  	transition:\n  			background-color 0.1s ease-in-out,\n  			border-color 0.1s ease-in-out;\n}\n\n.visual-refresh [data-theme=\"discord\"] .discordColorway {\n  	border: 1px solid transparent;\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwaysPillButton:hover,\n.visual-refresh [data-theme=\"discord\"] .discordColorway:hover {\n  	background: var(--bg-mod-subtle);\n}\n\n.visual-refresh [data-theme=\"discord\"] .discordColorway[aria-checked=\"true\"] {\n  	border-color: var(--border-faint);\n  	background: var(--bg-mod-strong);\n}\n\n.visual-refresh [data-theme=\"discord\"] .colorwayTextBox {\n  	background: var(--bg-overlay-3, var(--bg-mod-strong)) !important;\n  	border-radius: 8px;\n}\n";

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
const parseClr = (clr) => (clr & 16777215).toString(16).padStart(6, "0");
async function getRepainterTheme(link) {
	const linkCheck = link.match(/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&\/\/=]*)/g).filter((x) => x.startsWith("https://repainter.app/themes/"))[0];
	if (!linkCheck) return { status: "fail", errorCode: 0, errorMsg: "Invalid URL" };
	const { pageProps: { fallback: { a: { name, colors } } } } = { "pageProps": { "initialId": "01G5PMR5G9H76H1R2RET4A0ZHY", "fallback": { a: { "id": "01G5PMR5G9H76H1R2RET4A0ZHY", "name": "Midwinter Fire", "description": "Very red", "createdAt": "2022-06-16T16:15:11.881Z", "updatedAt": "2022-07-12T08:37:13.141Z", "settingsLines": ["Colorful", "Bright", "Vibrant style"], "voteCount": 309, "colors": [-1426063361, 4294901760, 4294901760, -1426071591, -1426080078, -1426089335, 4294901760, -1426119398, -1428615936, -1431629312, -1434644480, 4294901760, 4294901760, 4294901760, 4294901760, -1426067223, -1426071086, -1426079070, -1426088082, 4294901760, -1428201216, -1430761216, -1433255936, 4294901760, 4294901760, 4294901760, 4294901760, 4294901760, 4294901760, -1426070330, 4294901760, -1426086346, 4294901760, -1430030080, 4294901760, -1434431744, 4294901760, 4294901760, 4294901760, 4294901760, -1426064133, 4294901760, -1426071591, 4294901760, -1426874223, 4294901760, -1430359452, 4294901760, -1433845194, 4294901760, -1437922816, 4294901760, 4294901760, 4294901760, 4294901760, -1426071591, -1426080078, -1426089335, -1427799438, -1429640356, 4294901760, -1433191891, 4294901760, 4294901760, 4294901760] } } }, "__N_SSP": true };
	return { status: "success", id: name, colors: colors.filter((c) => c !== 4294901760).map((c) => "#" + parseClr(c)) };
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
function CloseIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-close-icon"),
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				d: "M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
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
function SortIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-sort-icon"),
			viewBox: "0 0 16 16"
		},
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				d: "M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 12.293zm4 .5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1zM7 12.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5"
			}
		)
	);
}

const defaultColorwaySource = "https://raw.githubusercontent.com/ProjectColorway/ProjectColorway/master/index.json";
const fallbackColorways = [
	{
		name: "Keyboard Purple",
		original: false,
		accent: "hsl(235 85.6% 64.7%)",
		primary: "#222456",
		secondary: "#1c1f48",
		tertiary: "#080d1d",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/KeyboardPurple/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Eclipse",
		original: false,
		accent: "hsl(87 85.6% 64.7%)",
		primary: "#000000",
		secondary: "#181818",
		tertiary: "#0a0a0a",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Eclipse/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Cyan",
		original: false,
		accent: "#009f88",
		primary: "#202226",
		secondary: "#1c1e21",
		tertiary: "#141517",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Cyan/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Spotify",
		original: false,
		accent: "hsl(141 76% 48%)",
		primary: "#121212",
		secondary: "#090909",
		tertiary: "#090909",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Spotify/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Bright n' Blue",
		original: true,
		accent: "hsl(234, 68%, 33%)",
		primary: "#394aae",
		secondary: "#29379d",
		tertiary: "#1b278d",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/BrightBlue/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Still Young",
		original: true,
		accent: "hsl(58 85.6% 89%)",
		primary: "#443a31",
		secondary: "#7c3d3e",
		tertiary: "#207578",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/StillYoung/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Sea",
		original: true,
		accent: "hsl(184, 100%, 50%)",
		primary: "#07353b",
		secondary: "#0b5e60",
		tertiary: "#08201d",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Sea/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Lava",
		original: true,
		accent: "hsl(4, 80.4%, 32%)",
		primary: "#401b17",
		secondary: "#351917",
		tertiary: "#230b0b",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Lava/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Solid Pink",
		original: true,
		accent: "hsl(340, 55.2%, 56.3%)",
		primary: "#1e151c",
		secondary: "#21181f",
		tertiary: "#291e27",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/SolidPink/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Sand",
		original: true,
		accent: "hsl(41, 31%, 45%)",
		primary: "#7f6c43",
		secondary: "#665b33",
		tertiary: "#5c5733",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Sand/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "AMOLED",
		original: true,
		accent: "hsl(235 85.6% 64.7%)",
		primary: "#000000",
		secondary: "#000000",
		tertiary: "#000000",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Amoled/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Zorin",
		original: false,
		accent: "hsl(200, 89%, 86%)",
		primary: "#171d20",
		secondary: "#171d20",
		tertiary: "#1e2529",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Zorin/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Desaturated",
		original: false,
		accent: "hsl(227, 58%, 65%)",
		primary: "#35383d",
		secondary: "#2c2f34",
		tertiary: "#1e1f24",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Desaturated/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Crimson",
		original: false,
		accent: "hsl(0, 100%, 50%)",
		primary: "#050000",
		secondary: "#0a0000",
		tertiary: "#0f0000",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Crimson/import.css);",
		author: "Riddim_GLiTCH",
		authorID: "801089753038061669"
	},
	{
		name: "Jupiter",
		original: true,
		accent: "#ffd89b",
		primary: "#ffd89b",
		secondary: "#19547b",
		tertiary: "#1e1f22",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Jupiter/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594",
		isGradient: true,
		colors: ["accent", "primary", "secondary"]
	},
	{
		name: "Neon Candy",
		original: true,
		accent: "#FC00FF",
		primary: "#00DBDE",
		secondary: "#00DBDE",
		tertiary: "#00DBDE",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/NeonCandy/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594",
		isGradient: true,
		colors: ["accent", "primary"]
	},
	{
		name: "Wildberry",
		original: false,
		accent: "#f40172",
		primary: "#180029",
		secondary: "#340057",
		tertiary: "#4b007a",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Wildberry/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Facebook",
		original: false,
		accent: "#2375e1",
		primary: "#18191a",
		secondary: "#242526",
		tertiary: "#3a3b3c",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Facebook/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Material You",
		original: false,
		accent: "#004977",
		primary: "#1f1f1f",
		secondary: "#28292a",
		tertiary: "#2d2f31",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/MaterialYou/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "Discord Teal",
		original: false,
		accent: "#175f6d",
		primary: "#313338",
		secondary: "#2b2d31",
		tertiary: "#1e1f22",
		"dc-import": "@import url(//dablulite.github.io/css-snippets/DiscordTeal/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594",
		colors: ["accent"]
	},
	{
		name: "\u9EC4\u660F\u306E\u82B1 (Twilight Blossom)",
		original: true,
		accent: "#e100ff",
		primary: "#04000a",
		secondary: "#0b0024",
		tertiary: "#210042",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/TwilightBlossom/import.css);",
		author: "Riddim_GLiTCH",
		authorID: "801089753038061669"
	},
	{
		name: "Chai",
		original: true,
		accent: "#59cd51",
		primary: "#1c1e15",
		secondary: "#1e2118",
		tertiary: "#24291e",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/Chai/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	},
	{
		name: "CS1.6",
		original: false,
		accent: "#929a8d",
		primary: "#3f4738",
		secondary: "#5b6c51",
		tertiary: "#4d5945",
		"dc-import": "@import url(//dablulite.github.io/DiscordColorways/CS16/import.css);",
		author: "DaBluLite",
		authorID: "582170007505731594"
	}
];
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
const nullColorwayObj = { id: null, css: null, sourceType: null, source: null };

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
const pureGradientBase = `
.theme-dark :is(.colorwaysPreview-modal, .colorwaysPreview-wrapper) {
		--dc-overlay-color: 0 0 0;
		--dc-overlay-color-inverse: 255 255 255;
		--dc-overlay-opacity-1: 0.85;
		--dc-overlay-opacity-2: 0.8;
		--dc-overlay-opacity-3: 0.7;
		--dc-overlay-opacity-4: 0.5;
		--dc-overlay-opacity-5: 0.4;
		--dc-overlay-opacity-6: 0.1;
		--dc-overlay-opacity-hover: 0.5;
		--dc-overlay-opacity-hover-inverse: 0.08;
		--dc-overlay-opacity-active: 0.45;
		--dc-overlay-opacity-active-inverse: 0.1;
		--dc-overlay-opacity-selected: 0.4;
		--dc-overlay-opacity-selected-inverse: 0.15;
		--dc-overlay-opacity-chat: 0.8;
		--dc-overlay-opacity-home: 0.85;
		--dc-overlay-opacity-home-card: 0.8;
		--dc-overlay-opacity-app-frame: var(--dc-overlay-opacity-4);
		--dc-guild-button: rgb(var(--dc-overlay-color-inverse)/var(--dc-overlay-opacity-6));
		--dc-secondary-alt: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-3)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-3))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-chat-header: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-2)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-2))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
}
.theme-light :is(.colorwaysPreview-modal, .colorwaysPreview-wrapper) {
		--dc-overlay-color: 255 255 255;
		--dc-overlay-color-inverse: 0 0 0;
		--dc-overlay-opacity-1: 0.9;
		--dc-overlay-opacity-2: 0.8;
		--dc-overlay-opacity-3: 0.7;
		--dc-overlay-opacity-4: 0.6;
		--dc-overlay-opacity-5: 0.3;
		--dc-overlay-opacity-6: 0.15;
		--dc-overlay-opacity-hover: 0.7;
		--dc-overlay-opacity-hover-inverse: 0.02;
		--dc-overlay-opacity-active: 0.65;
		--dc-overlay-opacity-active-inverse: 0.03;
		--dc-overlay-opacity-selected: 0.6;
		--dc-overlay-opacity-selected-inverse: 0.04;
		--dc-overlay-opacity-chat: 0.9;
		--dc-overlay-opacity-home: 0.7;
		--dc-overlay-opacity-home-card: 0.9;
		--dc-overlay-opacity-app-frame: var(--dc-overlay-opacity-5);
		--dc-guild-button: rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-3));
		--dc-secondary-alt: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-1)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-1))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-chat-header: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-1)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-1))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
}
.colorwaysPreview-modal,
.colorwaysPreview-wrapper {
		--dc-overlay-1: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-1)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-1))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-overlay-2: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-2)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-2))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-overlay-3: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-3)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-3))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-overlay-4: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-4)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-4))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-overlay-5: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-5)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-5))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-overlay-6: linear-gradient(rgb(var(--dc-overlay-color-inverse)/var(--dc-overlay-opacity-6)),rgb(var(--dc-overlay-color-inverse)/var(--dc-overlay-opacity-6))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-overlay-hover: linear-gradient(rgb(var(--dc-overlay-color-inverse)/var(--dc-overlay-opacity-hover-inverse)),rgb(var(--dc-overlay-color-inverse)/var(--dc-overlay-opacity-hover-inverse))) fixed 0 0/cover,linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-hover)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-hover))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-overlay-active: linear-gradient(rgb(var(--dc-overlay-color-inverse)/var(--dc-overlay-opacity-active-inverse)),rgb(var(--dc-overlay-color-inverse)/var(--dc-overlay-opacity-active-inverse))) fixed 0 0/cover,linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-active)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-active))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-overlay-selected: linear-gradient(rgb(var(--dc-overlay-color-inverse)/var(--dc-overlay-opacity-selected-inverse)),rgb(var(--dc-overlay-color-inverse)/var(--dc-overlay-opacity-selected-inverse))) fixed 0 0/cover,linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-selected)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-selected))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-overlay-chat: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-chat)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-chat))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-overlay-home: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-home)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-home))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-overlay-home-card: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-home-card)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-home-card))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
		--dc-overlay-app-frame: linear-gradient(rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-app-frame)),rgb(var(--dc-overlay-color)/var(--dc-overlay-opacity-app-frame))) fixed 0 0/cover,var(--gradient-theme-bg) fixed 0 0/cover;
}`;
function gradientBase(accentColor, discordSaturation = false) {
	return `@import url(//dablulite.github.io/css-snippets/NitroThemesFix/import.css);
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
:root:root {
		--brand-100-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[100]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[100]) * 10) / 10, 0)};
		--brand-130-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[130]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[130]) * 10) / 10, 0)}%;
		--brand-160-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[160]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[160]) * 10) / 10, 0)}%;
		--brand-200-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[200]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[200]) * 10) / 10, 0)}%;
		--brand-230-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[230]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[230]) * 10) / 10, 0)}%;
		--brand-260-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[260]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[260]) * 10) / 10, 0)}%;
		--brand-300-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[300]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[300]) * 10) / 10, 0)}%;
		--brand-330-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[330]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[330]) * 10) / 10, 0)}%;
		--brand-345-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[345]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[345]) * 10) / 10, 0)}%;
		--brand-360-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[360]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[360]) * 10) / 10, 0)}%;
		--brand-400-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[400]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[400]) * 10) / 10, 0)}%;
		--brand-430-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[430]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[430]) * 10) / 10, 0)}%;
		--brand-460-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[460]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[460]) * 10) / 10, 0)}%;
		--brand-500-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${HexToHSL("#" + accentColor)[2]}%;
		--brand-530-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[530]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[530]) * 10) / 10, 100)}%;
		--brand-560-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[560]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[560]) * 10) / 10, 100)}%;
		--brand-600-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[600]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[600]) * 10) / 10, 100)}%;
		--brand-630-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[630]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[630]) * 10) / 10, 100)}%;
		--brand-660-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[660]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[660]) * 10) / 10, 100)}%;
		--brand-700-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[700]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[700]) * 10) / 10, 100)}%;
		--brand-730-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[730]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[730]) * 10) / 10, 100)}%;
		--brand-760-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[760]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[760]) * 10) / 10, 100)}%;
		--brand-800-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[800]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[800]) * 10) / 10, 100)}%;
		--brand-830-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[830]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[830]) * 10) / 10, 100)}%;
		--brand-860-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[860]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[860]) * 10) / 10, 100)}%;
		--brand-900-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[900]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[900]) * 10) / 10, 100)}%;
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
function generateCss(primaryColor, secondaryColor, tertiaryColor, accentColor, tintedText = true, discordSaturation = true, mutedTextBrightness, name) {
	primaryColor = primaryColor.replace("#", "");
	secondaryColor = secondaryColor.replace("#", "");
	tertiaryColor = tertiaryColor.replace("#", "");
	accentColor = accentColor.replace("#", "");
	return `/**
 * @name ${name}
 * @version ${PluginProps.creatorVersion}
 * @description Automatically generated Colorway.
 * @author ${exports.UserStore.getCurrentUser().username}
 * @authorId ${exports.UserStore.getCurrentUser().id}
 */
:root:root {
		--brand-100-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[100]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[100]) * 10) / 10, 0)};
		--brand-130-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[130]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[130]) * 10) / 10, 0)}%;
		--brand-160-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[160]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[160]) * 10) / 10, 0)}%;
		--brand-200-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[200]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[200]) * 10) / 10, 0)}%;
		--brand-230-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[230]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[230]) * 10) / 10, 0)}%;
		--brand-260-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[260]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[260]) * 10) / 10, 0)}%;
		--brand-300-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[300]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[300]) * 10) / 10, 0)}%;
		--brand-330-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[330]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[330]) * 10) / 10, 0)}%;
		--brand-345-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[345]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[345]) * 10) / 10, 0)}%;
		--brand-360-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[360]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[360]) * 10) / 10, 0)}%;
		--brand-400-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[400]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[400]) * 10) / 10, 0)}%;
		--brand-430-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[430]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[430]) * 10) / 10, 0)}%;
		--brand-460-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[460]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[460]) * 10) / 10, 0)}%;
		--brand-500-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${HexToHSL("#" + accentColor)[2]}%;
		--brand-530-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[530]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[530]) * 10) / 10, 100)}%;
		--brand-560-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[560]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[560]) * 10) / 10, 100)}%;
		--brand-600-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[600]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[600]) * 10) / 10, 100)}%;
		--brand-630-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[630]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[630]) * 10) / 10, 100)}%;
		--brand-660-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[660]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[660]) * 10) / 10, 100)}%;
		--brand-700-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[700]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[700]) * 10) / 10, 100)}%;
		--brand-730-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[730]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[730]) * 10) / 10, 100)}%;
		--brand-760-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[760]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[760]) * 10) / 10, 100)}%;
		--brand-800-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[800]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[800]) * 10) / 10, 100)}%;
		--brand-830-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[830]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[830]) * 10) / 10, 100)}%;
		--brand-860-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[860]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[860]) * 10) / 10, 100)}%;
		--brand-900-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + accentColor)[1] / 100 * (100 + BrandSatDiffs[900]) * 10) / 10 : HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[900]) * 10) / 10, 100)}%;
}
.theme-dark {
		--primary-800-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[800]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6 * 2, 0)}%;
		--primary-730-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[730]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6, 0)}%;
		--primary-700-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${HexToHSL("#" + tertiaryColor)[2]}%;
		--primary-660-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[660]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.max(HexToHSL("#" + secondaryColor)[2] - 3.6, 0)}%;
		--primary-645-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[645]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.max(HexToHSL("#" + secondaryColor)[2] - 1.1, 0)}%;
		--primary-630-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${HexToHSL("#" + secondaryColor)[2]}%;
		--primary-600-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%;
		--primary-560-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6, 100)}%;
		--primary-530-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[530]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 2, 100)}%;
		--primary-500-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[500]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%) ${mutedTextBrightness || Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 3, 100)}%;
		--interactive-muted: hsl(${HexToHSL("#" + primaryColor)[0]} ${HexToHSL("#" + primaryColor)[1] / 2}% ${Math.max(Math.min(HexToHSL("#" + primaryColor)[2] - 5, 100), 45)}%);
		${tintedText ? `--primary-460-hsl: 0 calc(var(--saturation-factor, 1)*0%) 50%;
		--primary-430: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL(`#${primaryColor}`)[1] / 100 * (100 + PrimarySatDiffs[430]) * 10) / 10 : HexToHSL(`#${primaryColor}`)[1]}%), 90%)` : `hsl(${HexToHSL(`#${secondaryColor}`)[0]}, calc(var(--saturation-factor, 1)*100%), 20%)`};
		--primary-400: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL(`#${primaryColor}`)[1] / 100 * (100 + PrimarySatDiffs[400]) * 10) / 10 : HexToHSL(`#${primaryColor}`)[1]}%), 90%)` : `hsl(${HexToHSL(`#${secondaryColor}`)[0]}, calc(var(--saturation-factor, 1)*100%), 20%)`};
		--primary-360: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL(`#${primaryColor}`)[1] / 100 * (100 + PrimarySatDiffs[360]) * 10) / 10 : HexToHSL(`#${primaryColor}`)[1]}%), 90%)` : `hsl(${HexToHSL(`#${secondaryColor}`)[0]}, calc(var(--saturation-factor, 1)*100%), 20%)`};` : ""}
}
.theme-light {
		--white-500-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 80, 90)}%;
		--primary-130-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${Math.min(HexToHSL("#" + secondaryColor)[2] + 80, 85)}%;
		--primary-160-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[660]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.min(HexToHSL("#" + secondaryColor)[2] + 76.4, 82.5)}%;
		--primary-200-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 80, 80)}%;
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
function getPreset(primaryColor, secondaryColor, tertiaryColor, accentColor) {
	function cyanLegacy(discordSaturation = false) {
		return `:root:root {
		--cyan-accent-color: #${accentColor};
		--cyan-background-primary: hsl(${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%/40%);
		--cyan-background-secondary: hsl(${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 3.6 * 2, 100)}%);
}`;
	}
	function cyan(discordSaturation = false) {
		return `:root:root {
		--cyan-accent-color: #${accentColor};
		--cyan-background-primary: hsl(${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%/60%);
		--cyan-second-layer: hsl(${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 3.6 * 2, 100)}%/60%);
}`;
	}
	function nexusRemastered(discordSaturation = false) {
		return `:root:root {
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
}`;
	}
	function modular(discordSaturation = false) {
		return `:root:root {
		--brand-experiment: #${accentColor};
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
}`;
	}
	function virtualBoy(discordSaturation = false) {
		return `:root:root {
		--VBaccent: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${HexToHSL("#" + accentColor)[2]}%;
		--VBaccent-muted: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 10, 0)}%;
		--VBaccent-dimmest: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 3.6 * 5 - 3, 100)}%;
}`;
	}
	function solana(discordSaturation = false) {
		return `:root:root {
		--accent-hue: ${HexToHSL("#" + accentColor)[0]};
		--accent-saturation: calc(var(--saturation-factor, 1)${HexToHSL("#" + accentColor)[1]}%);
		--accent-brightness: ${HexToHSL("#" + accentColor)[2]}%;
		--background-accent-hue: ${HexToHSL("#" + primaryColor)[0]};
		--background-accent-saturation: calc(var(--saturation-factor, 1)${HexToHSL("#" + primaryColor)[1]}%);
		--background-accent-brightness: ${HexToHSL("#" + primaryColor)[2]}%;
		--background-overlay-opacity: 0%;
}`;
	}
	function gradientType1(discordSaturation = false) {
		return {
			full: `${gradientBase(accentColor, discordSaturation)}
						:root:root {
								--custom-theme-background: linear-gradient(239.16deg, #${primaryColor} 10.39%, #${secondaryColor} 26.87%, #${tertiaryColor} 48.31%, hsl(${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${Math.min(HexToHSL("#" + secondaryColor)[2] + 3.6, 100)}%) 64.98%, #${primaryColor} 92.5%);
						}`,
			base: `239.16deg, #${primaryColor} 10.39%, #${secondaryColor} 26.87%, #${tertiaryColor} 48.31%, hsl(${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${Math.min(HexToHSL("#" + secondaryColor)[2] + 3.6, 100)}%) 64.98%, #${primaryColor} 92.5%`
		};
	}
	function gradientType2(discordSaturation = false) {
		return {
			full: `${gradientBase(accentColor, discordSaturation)}
				:root:root {
						--custom-theme-background: linear-gradient(48.17deg, #${primaryColor} 11.21%, #${secondaryColor} 61.92%);
				}`,
			base: `48.17deg, #${primaryColor} 11.21%, #${secondaryColor} 61.92%`
		};
	}
	return {
		default: {
			name: "Default",
			preset: generateCss,
			id: "default",
			colors: ["accent", "primary", "secondary", "tertiary"]
		},
		cyan: {
			name: "Cyan",
			preset: cyan,
			id: "cyan",
			colors: ["accent", "primary", "secondary"]
		},
		cyanLegacy: {
			name: "Cyan 1 (Legacy)",
			preset: cyanLegacy,
			id: "cyanLegacy",
			colors: ["accent", "primary", "secondary"]
		},
		nexusRemastered: {
			name: "Nexus Remastered",
			preset: nexusRemastered,
			id: "nexusRemastered",
			colors: ["accent", "primary", "secondary", "tertiary"]
		},
		virtualBoy: {
			name: "Virtual Boy",
			preset: virtualBoy,
			id: "virtualBoy",
			colors: ["accent", "tertiary"]
		},
		modular: {
			name: "Modular",
			preset: modular,
			id: "modular",
			colors: ["accent", "primary", "secondary", "tertiary"]
		},
		solana: {
			name: "Solana",
			preset: solana,
			id: "solana",
			colors: ["accent", "primary"]
		},
		gradientType1: {
			name: "Gradient Type 1",
			preset: gradientType1,
			id: "gradientType1",
			colors: ["accent", "primary", "secondary", "tertiary"]
		},
		gradientType2: {
			name: "Gradient Type 2",
			preset: gradientType2,
			id: "gradientType2",
			colors: ["accent", "primary", "secondary"]
		},
		hueRotation: {
			name: "Hue Rotation",
			preset: () => generateCss(
				getAutoPresets(accentColor).hueRotation.colors.primary,
				getAutoPresets(accentColor).hueRotation.colors.secondary,
				getAutoPresets(accentColor).hueRotation.colors.tertiary,
				getAutoPresets(accentColor).hueRotation.colors.accent,
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
			preset: () => generateCss(
				getAutoPresets(accentColor).accentSwap.colors.primary,
				getAutoPresets(accentColor).accentSwap.colors.secondary,
				getAutoPresets(accentColor).accentSwap.colors.tertiary,
				getAutoPresets(accentColor).accentSwap.colors.accent,
				true,
				true,
				void 0
			),
			id: "accentSwap",
			colors: ["accent"]
		},
		materialYou: {
			name: "Material You",
			preset: () => generateCss(
				getAutoPresets(accentColor).materialYou.colors.primary,
				getAutoPresets(accentColor).materialYou.colors.secondary,
				getAutoPresets(accentColor).materialYou.colors.tertiary,
				getAutoPresets(accentColor).materialYou.colors.accent,
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
	return SortOptions2;
})(SortOptions || {});

function AutoColorwaySelector({ modalProps, onChange, autoColorwayId = "" }) {
	const [autoId, setAutoId] = React.useState(autoColorwayId);
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	return BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, "Auto Preset Settings"), BdApi.React.createElement("div", { className: "colorwaysModalContent" }, BdApi.React.createElement("div", { className: "dc-info-card", style: { marginTop: "1em" } }, BdApi.React.createElement("strong", null, "About the Auto Colorway"), BdApi.React.createElement("span", null, "The auto colorway allows you to use your system's accent color in combination with a selection of presets that will fully utilize it.")), BdApi.React.createElement("div", { style: { marginBottom: "20px" } }, BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Presets:"), Object.values(getAutoPresets()).map((autoPreset) => BdApi.React.createElement(
		"div",
		{
			className: "discordColorway",
			"aria-checked": autoId === autoPreset.id,
			style: { padding: "10px", marginBottom: "8px" },
			onClick: () => {
				setAutoId(autoPreset.id);
			}
		},
		BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), autoId === autoPreset.id && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" })),
		BdApi.React.createElement("span", { className: "colorwayLabel" }, autoPreset.name)
	)))), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-onSurface",
			onClick: () => {
				DataStore.set("activeAutoPreset", autoId);
				onChange(autoId);
				modalProps.onClose();
			}
		},
		"Finish"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => {
				modalProps.onClose();
			}
		},
		"Cancel"
	)));
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

function TabBar({
	items = []
}) {
	const [active, setActive] = React.useState(items[0].name);
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("div", { className: "colorwaysMenuTabs" }, items.map((item) => {
		return BdApi.React.createElement("div", { className: `colorwaysMenuTab ${active == item.name ? "active" : ""}`, onClick: () => {
			setActive(item.name);
		} }, item.name);
	})), items.map((item) => {
		const Component = item.component;
		return active == item.name ? BdApi.React.createElement(Component, null) : null;
	}));
}

function StoreNameModal({ modalProps, originalName, onFinish, conflicting }) {
	const [error, setError] = React.useState("");
	const [newStoreName, setNewStoreName] = React.useState(originalName);
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	return BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, conflicting ? "Duplicate Store Name" : "Give this store a name"), BdApi.React.createElement("div", { className: "colorwaysModalContent" }, conflicting ? BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "A store with the same name already exists. Please give a different name to the imported store:") : BdApi.React.createElement(BdApi.React.Fragment, null), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Name:"), BdApi.React.createElement("input", { type: "text", className: "colorwayTextBox", value: newStoreName, onChange: ({ currentTarget: { value } }) => setNewStoreName(value), style: { marginBottom: "16px" } })), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-onSurface",
			style: { marginLeft: 8 },
			onClick: async () => {
				setError("");
				if ((await DataStore.get("customColorways")).map((store) => store.name).includes(newStoreName)) {
					return setError("Error: Store name already exists");
				}
				onFinish(newStoreName);
				modalProps.onClose();
			}
		},
		"Finish"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			style: { marginLeft: 8 },
			onClick: () => modalProps.onClose()
		},
		"Cancel"
	)));
}
function AddOnlineStoreModal({ modalProps, onFinish }) {
	const [colorwaySourceName, setColorwaySourceName] = React.useState("");
	const [colorwaySourceURL, setColorwaySourceURL] = React.useState("");
	const [nameError, setNameError] = React.useState("");
	const [URLError, setURLError] = React.useState("");
	const [nameReadOnly, setNameReadOnly] = React.useState(false);
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	return BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, "Add a source:"), BdApi.React.createElement("div", { className: "colorwaysModalContent" }, BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Name:"), BdApi.React.createElement(
		"input",
		{
			type: "text",
			className: "colorwayTextBox",
			placeholder: "Enter a valid Name...",
			onInput: (e) => setColorwaySourceName(e.currentTarget.value),
			value: colorwaySourceName,
			readOnly: nameReadOnly,
			disabled: nameReadOnly
		}
	), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader", style: { marginTop: "8px" } }, "URL:"), BdApi.React.createElement(
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
				}
			},
			value: colorwaySourceURL,
			style: { marginBottom: "16px" }
		}
	)), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-onSurface",
			onClick: async () => {
				const sourcesArr = await DataStore.get("colorwaySourceFiles");
				if (!colorwaySourceName) {
					setNameError("Error: Please enter a valid name");
				} else if (!colorwaySourceURL) {
					setURLError("Error: Please enter a valid URL");
				} else if (sourcesArr.map((s) => s.name).includes(colorwaySourceName)) {
					setNameError("Error: An online source with that name already exists");
				} else if (sourcesArr.map((s) => s.url).includes(colorwaySourceURL)) {
					setURLError("Error: An online source with that url already exists");
				} else {
					onFinish(colorwaySourceName, colorwaySourceURL);
					modalProps.onClose();
				}
			}
		},
		"Finish"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => modalProps.onClose()
		},
		"Cancel"
	)));
}
function SourceManager({
	hasTheme = false
}) {
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	function Container({ children }) {
		if (hasTheme) return BdApi.React.createElement("div", { className: "colorwaysModalTab", "data-theme": theme }, children);
		else return BdApi.React.createElement("div", { className: "colorwaysModalTab" }, children);
	}
	return BdApi.React.createElement(Container, null, BdApi.React.createElement(TabBar, { items: [
		{
			name: "Online",
			component: OnlineTab
		},
		{
			name: "Offline",
			component: OfflineTab
		}
	] }));
}
function OfflineTab() {
	const [customColorwayStores, setCustomColorwayStores] = React.useState([]);
	React.useEffect(() => {
		(async function() {
			setCustomColorwayStores(await DataStore.get("customColorways"));
			updateRemoteSources();
		})();
	}, []);
	return BdApi.React.createElement("div", { className: "colorwaySourceTab" }, BdApi.React.createElement("div", { style: {
		display: "flex",
		gap: "8px"
	} }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			style: { flexShrink: "0" },
			onClick: async () => {
				const file = await chooseFile("application/json");
				if (!file) return;
				const reader = new FileReader();
				reader.onload = async () => {
					try {
						if ((await DataStore.get("customColorways")).map((store) => store.name).includes(JSON.parse(reader.result).name)) {
							openModal((props) => BdApi.React.createElement(StoreNameModal, { conflicting: true, modalProps: props, originalName: JSON.parse(reader.result).name, onFinish: async (e) => {
								await DataStore.set("customColorways", [...await DataStore.get("customColorways"), { name: e, colorways: JSON.parse(reader.result).colorways }]);
								setCustomColorwayStores(await DataStore.get("customColorways"));
								updateRemoteSources();
							} }));
						} else {
							await DataStore.set("customColorways", [...await DataStore.get("customColorways"), JSON.parse(reader.result)]);
							setCustomColorwayStores(await DataStore.get("customColorways"));
							updateRemoteSources();
						}
					} catch (err) {
						console.error("DiscordColorways: " + err);
					}
				};
				reader.readAsText(file);
				updateRemoteSources();
			}
		},
		BdApi.React.createElement(ImportIcon, { width: 14, height: 14 }),
		"Import..."
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			style: { flexShrink: "0" },
			onClick: () => {
				openModal((props) => BdApi.React.createElement(StoreNameModal, { conflicting: false, modalProps: props, originalName: "", onFinish: async (e) => {
					await DataStore.set("customColorways", [...await DataStore.get("customColorways"), { name: e, colorways: [] }]);
					setCustomColorwayStores(await DataStore.get("customColorways"));
					props.onClose();
					updateRemoteSources();
				} }));
			}
		},
		BdApi.React.createElement(
			"svg",
			{
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": "true",
				role: "img",
				width: "14",
				height: "14",
				viewBox: "0 0 24 24"
			},
			BdApi.React.createElement(
				"path",
				{
					fill: "currentColor",
					d: "M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z"
				}
			)
		),
		"New..."
	)), BdApi.React.createElement("div", { className: "colorwaysSettings-sourceScroller" }, getComputedStyle(document.body).getPropertyValue("--os-accent-color") ? BdApi.React.createElement("div", { className: `colorwaysSettings-colorwaySource`, style: { flexDirection: "column", padding: "16px", alignItems: "start" } }, BdApi.React.createElement("div", { style: { alignItems: "center", width: "100%", height: "30px", display: "flex" } }, BdApi.React.createElement("span", { className: "colorwaysSettings-colorwaySourceLabel" }, "OS Accent Color", " ", BdApi.React.createElement("div", { className: "colorways-badge" }, "Built-In")))) : BdApi.React.createElement(BdApi.React.Fragment, null), customColorwayStores.map(
		({ name: customColorwaySourceName, colorways: offlineStoreColorways }) => BdApi.React.createElement("div", { className: `colorwaysSettings-colorwaySource`, style: { flexDirection: "column", padding: "16px", alignItems: "start" } }, BdApi.React.createElement("span", { className: "colorwaysSettings-colorwaySourceLabel" }, customColorwaySourceName), BdApi.React.createElement("div", { style: { marginLeft: "auto", gap: "8px", display: "flex" } }, BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-onSurface",
				onClick: async () => {
					saveFile(new File([JSON.stringify({ "name": customColorwaySourceName, "colorways": [...offlineStoreColorways] })], `${customColorwaySourceName.replaceAll(" ", "-").toLowerCase()}.colorways.json`, { type: "application/json" }));
				}
			},
			BdApi.React.createElement(DownloadIcon, { width: 14, height: 14 }),
			" Export as..."
		), BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-onSurface",
				onClick: async () => {
					var sourcesArr = [];
					const customColorwaySources = await DataStore.get("customColorways");
					customColorwaySources.map((source) => {
						if (source.name !== customColorwaySourceName) {
							sourcesArr.push(source);
						}
					});
					DataStore.set("customColorways", sourcesArr);
					setCustomColorwayStores(sourcesArr);
					updateRemoteSources();
				}
			},
			BdApi.React.createElement(DeleteIcon, { width: 20, height: 20 }),
			" Remove"
		)))
	)));
}
function OnlineTab() {
	const [colorwaySourceFiles, setColorwaySourceFiles] = React.useState([]);
	React.useEffect(() => {
		(async function() {
			setColorwaySourceFiles(await DataStore.get("colorwaySourceFiles"));
			updateRemoteSources();
		})();
	}, []);
	return BdApi.React.createElement("div", { className: "colorwaySourceTab" }, BdApi.React.createElement("div", { style: {
		display: "flex",
		gap: "8px"
	} }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			style: { flexShrink: "0" },
			onClick: () => {
				openModal((props) => BdApi.React.createElement(AddOnlineStoreModal, { modalProps: props, onFinish: async (name, url) => {
					await DataStore.set("colorwaySourceFiles", [...await DataStore.get("colorwaySourceFiles"), { name, url }]);
					setColorwaySourceFiles([...await DataStore.get("colorwaySourceFiles"), { name, url }]);
					updateRemoteSources();
				} }));
			}
		},
		BdApi.React.createElement(
			"svg",
			{
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": "true",
				role: "img",
				width: "14",
				height: "14",
				viewBox: "0 0 24 24"
			},
			BdApi.React.createElement(
				"path",
				{
					fill: "currentColor",
					d: "M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z"
				}
			)
		),
		"Add..."
	)), BdApi.React.createElement("div", { className: "colorwaysSettings-sourceScroller" }, !colorwaySourceFiles.length && BdApi.React.createElement("div", { className: `colorwaysSettings-colorwaySource`, style: { flexDirection: "column", padding: "16px", alignItems: "start" }, onClick: async () => {
		DataStore.set("colorwaySourceFiles", [{ name: "Project Colorway", url: defaultColorwaySource }, ...(await DataStore.get("colorwaySourceFiles")).filter((i) => i.name !== "Project Colorway")]);
		setColorwaySourceFiles([{ name: "Project Colorway", url: defaultColorwaySource }, ...(await DataStore.get("colorwaySourceFiles")).filter((i) => i.name !== "Project Colorway")]);
	} }, BdApi.React.createElement(PlusIcon, { width: 24, height: 24 }), BdApi.React.createElement("span", { className: "colorwaysSettings-colorwaySourceLabel" }, "Add Project Colorway Source")), colorwaySourceFiles.map(
		(colorwaySourceFile, i) => BdApi.React.createElement("div", { className: `colorwaysSettings-colorwaySource`, style: { flexDirection: "column", padding: "16px", alignItems: "start" } }, BdApi.React.createElement("div", { className: "hoverRoll" }, BdApi.React.createElement("span", { className: "colorwaysSettings-colorwaySourceLabel hoverRoll_normal" }, colorwaySourceFile.name, " ", colorwaySourceFile.url === defaultColorwaySource && BdApi.React.createElement("div", { className: "colorways-badge" }, "Built-In"), " ", colorwaySourceFile.url === "https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json" && BdApi.React.createElement("div", { className: "colorways-badge" }, "Built-In | Outdated")), BdApi.React.createElement("span", { className: "colorwaysSettings-colorwaySourceLabel hoverRoll_hovered" }, colorwaySourceFile.url)), BdApi.React.createElement("div", { style: { marginLeft: "auto", gap: "8px", display: "flex" } }, BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-onSurface",
				onClick: () => {
					navigator.clipboard.writeText(colorwaySourceFile.url);
				}
			},
			BdApi.React.createElement(CopyIcon, { width: 14, height: 14 }),
			" Copy URL"
		), colorwaySourceFile.url === "https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json" && BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-onSurface",
				onClick: async () => {
					DataStore.set("colorwaySourceFiles", [{ name: "Project Colorway", url: defaultColorwaySource }, ...(await DataStore.get("colorwaySourceFiles")).filter((i2) => i2.name !== "Project Colorway")]);
					setColorwaySourceFiles([{ name: "Project Colorway", url: defaultColorwaySource }, ...(await DataStore.get("colorwaySourceFiles")).filter((i2) => i2.name !== "Project Colorway")]);
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
			" Update source..."
		), colorwaySourceFile.url !== defaultColorwaySource && colorwaySourceFile.url !== "https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json" && BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-onSurface",
				onClick: async () => {
					openModal((props) => BdApi.React.createElement(StoreNameModal, { conflicting: false, modalProps: props, originalName: colorwaySourceFile.name || "", onFinish: async (e) => {
						const res = await fetch(colorwaySourceFile.url);
						const data = await res.json();
						DataStore.set("customColorways", [...await DataStore.get("customColorways"), { name: e, colorways: data.colorways || [] }]);
						updateRemoteSources();
					} }));
				}
			},
			BdApi.React.createElement(DownloadIcon, { width: 14, height: 14 }),
			" Download..."
		), BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-onSurface",
				onClick: async () => {
					DataStore.set("colorwaySourceFiles", (await DataStore.get("colorwaySourceFiles")).filter((src, ii) => ii !== i));
					setColorwaySourceFiles((await DataStore.get("colorwaySourceFiles")).filter((src, ii) => ii !== i));
					updateRemoteSources();
				}
			},
			BdApi.React.createElement(DeleteIcon, { width: 14, height: 14 }),
			" Remove"
		))))
	)));
}

function Store({
	hasTheme = false
}) {
	const [storeObject, setStoreObject] = React.useState([]);
	const [colorwaySourceFiles, setColorwaySourceFiles] = React.useState([]);
	const [searchValue, setSearchValue] = React.useState("");
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	React.useEffect(() => {
		if (!searchValue) {
			(async function() {
				const res = await fetch("https://dablulite.vercel.app/");
				const data = await res.json();
				setStoreObject(data.sources);
				setColorwaySourceFiles(await DataStore.get("colorwaySourceFiles"));
			})();
		}
	}, []);
	function Container({ children }) {
		if (hasTheme) return BdApi.React.createElement("div", { className: "colorwaysModalTab", "data-theme": theme }, children);
		else return BdApi.React.createElement("div", { className: "colorwaysModalTab" }, children);
	}
	return BdApi.React.createElement(Container, null, BdApi.React.createElement("div", { style: { display: "flex", marginBottom: "8px" } }, BdApi.React.createElement(
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
			className: "colorwaysPillButton",
			style: { marginLeft: "8px", marginTop: "auto", marginBottom: "auto" },
			onClick: async function() {
				const res = await fetch("https://dablulite.vercel.app/");
				const data = await res.json();
				setStoreObject(data.sources);
				setColorwaySourceFiles(await DataStore.get("colorwaySourceFiles"));
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
	)), BdApi.React.createElement("div", { className: "colorwaysSettings-sourceScroller" }, storeObject.map(
		(item) => item.name.toLowerCase().includes(searchValue.toLowerCase()) ? BdApi.React.createElement("div", { className: `colorwaysSettings-colorwaySource`, style: { flexDirection: "column", padding: "16px", alignItems: "start" } }, BdApi.React.createElement("div", { style: { gap: ".5rem", display: "flex", marginBottom: "8px", flexDirection: "column" } }, BdApi.React.createElement("span", { className: "colorwaysSettings-colorwaySourceLabelHeader" }, item.name), BdApi.React.createElement("span", { className: "colorwaysSettings-colorwaySourceDesc" }, item.description), BdApi.React.createElement("span", { className: "colorwaysSettings-colorwaySourceDesc", style: { opacity: ".8" } }, "by ", item.authorGh)), BdApi.React.createElement("div", { style: { gap: "8px", alignItems: "center", width: "100%", display: "flex" } }, BdApi.React.createElement("a", { role: "link", target: "_blank", href: "https://github.com/" + item.authorGh }, BdApi.React.createElement("img", { src: "/assets/6a853b4c87fce386cbfef4a2efbacb09.svg", alt: "GitHub" })), BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-onSurface",
				style: { marginLeft: "auto" },
				onClick: async () => {
					if (colorwaySourceFiles.map((source) => source.name).includes(item.name)) {
						const sourcesArr = colorwaySourceFiles.filter((source) => source.name !== item.name);
						DataStore.set("colorwaySourceFiles", sourcesArr);
						setColorwaySourceFiles(sourcesArr);
					} else {
						const sourcesArr = [...colorwaySourceFiles, { name: item.name, url: item.url }];
						DataStore.set("colorwaySourceFiles", sourcesArr);
						setColorwaySourceFiles(sourcesArr);
					}
				}
			},
			colorwaySourceFiles.map((source) => source.name).includes(item.name) ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(DeleteIcon, { width: 14, height: 14 }), " Remove") : BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(DownloadIcon, { width: 14, height: 14 }), " Add to Sources")
		), BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-onSurface",
				onClick: async () => {
					openModal((props) => BdApi.React.createElement("div", { className: `colorwaysModal ${props.transitionState == 2 ? "closing" : ""} ${props.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, "Previewing colorways for ", item.name), BdApi.React.createElement("div", { className: "colorwaysModalContent colorwaysModalContent-sourcePreview" }, BdApi.React.createElement(Selector, { settings: { selectorType: "preview", previewSource: item.url } }))));
				}
			},
			BdApi.React.createElement(PalleteIcon, { width: 14, height: 14 }),
			"Preview"
		))) : BdApi.React.createElement(BdApi.React.Fragment, null)
	)));
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
	label
}) {
	return label ? BdApi.React.createElement("div", { style: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		alignItems: "center",
		cursor: "pointer"
	} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label", htmlFor: id }, label), BdApi.React.createElement("div", { className: `colorwaysSettings-switch ${value ? "checked" : ""}` }, BdApi.React.createElement("svg", { viewBox: "0 0 28 20", preserveAspectRatio: "xMinYMid meet", "aria-hidden": "true", style: {
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

function SettingsPage({
	hasTheme = false
}) {
	const [colorways, setColorways] = React.useState([]);
	const [customColorways, setCustomColorways] = React.useState([]);
	const [colorsButtonVisibility, setColorsButtonVisibility] = React.useState(false);
	const [theme, setTheme] = React.useState("discord");
	const [shouldAutoconnect, setShouldAutoconnect] = React.useState("1");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
			setShouldAutoconnect(await DataStore.get("colorwaysManagerDoAutoconnect") ? "1" : "2");
		}
		load();
	}, []);
	React.useEffect(() => {
		(async function() {
			const [
				customColorways2,
				colorwaySourceFiles,
				showColorwaysButton
			] = await DataStore.getMany([
				"customColorways",
				"colorwaySourceFiles",
				"showColorwaysButton"
			]);
			const responses = await Promise.all(
				colorwaySourceFiles.map(
					({ url }) => fetch(url)
				)
			);
			const data = await Promise.all(
				responses.map(
					(res) => res.json().catch(() => {
						return { colorways: [] };
					})
				)
			);
			const colorways2 = data.flatMap((json) => json.colorways);
			setColorways(colorways2 || fallbackColorways);
			setCustomColorways(customColorways2.map((source) => source.colorways).flat(2));
			setColorsButtonVisibility(showColorwaysButton);
		})();
	}, []);
	function Container({ children }) {
		if (hasTheme) return BdApi.React.createElement("div", { className: "colorwaysModalTab", "data-theme": theme }, children);
		else return BdApi.React.createElement("div", { className: "colorwaysModalTab" }, children);
	}
	return BdApi.React.createElement(Container, null, BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Quick Switch"), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement(
		Switch,
		{
			value: colorsButtonVisibility,
			label: "Enable Quick Switch",
			id: "showColorwaysButton",
			onChange: (v) => {
				setColorsButtonVisibility(v);
				DataStore.set("showColorwaysButton", v);
				FluxDispatcher.dispatch({
					type: "COLORWAYS_UPDATE_BUTTON_VISIBILITY",
					isVisible: v
				});
			}
		}
	), BdApi.React.createElement("span", { className: "colorwaysNote" }, "Shows a button on the top of the servers list that opens a colorway selector modal.")), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Appearance"), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		alignItems: "center",
		cursor: "pointer"
	} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "Plugin Theme"), BdApi.React.createElement(
		"select",
		{
			className: "colorwaysPillButton",
			style: { border: "none" },
			onChange: ({ currentTarget: { value } }) => {
				setTheme(value);
				DataStore.set("colorwaysPluginTheme", value);
				FluxDispatcher.dispatch({
					type: "COLORWAYS_UPDATE_THEME",
					theme: value
				});
			},
			value: theme
		},
		BdApi.React.createElement("option", { value: "discord" }, "Discord (Default)"),
		BdApi.React.createElement("option", { value: "colorish" }, "Colorish")
	))), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Manager"), BdApi.React.createElement(Setting, null, BdApi.React.createElement("div", { style: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		alignItems: "center",
		cursor: "pointer"
	} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "Automatically retry to connect to Manager"), BdApi.React.createElement(
		"select",
		{
			className: "colorwaysPillButton",
			style: { border: "none" },
			onChange: ({ currentTarget: { value } }) => {
				setShouldAutoconnect(value);
				if (value == "1") {
					DataStore.set("colorwaysManagerDoAutoconnect", true);
					if (!isWSOpen()) connect();
				} else {
					DataStore.set("colorwaysManagerDoAutoconnect", false);
				}
			},
			value: shouldAutoconnect
		},
		BdApi.React.createElement("option", { value: "1" }, "On (Default)"),
		BdApi.React.createElement("option", { value: "2" }, "Off")
	))), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		alignItems: "center",
		cursor: "pointer"
	} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "Try to connect to Manager manually"), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => connect(),
			value: shouldAutoconnect
		},
		"Try to connect..."
	))), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		alignItems: "center",
		cursor: "pointer"
	} }, BdApi.React.createElement("label", { className: "colorwaySwitch-label" }, "Reset plugin to default settings (CANNOT BE UNDONE)"), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => {
				DataStore.setMany([
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
					["colorwaysManagerDoAutoconnect", true]
				]);
			}
		},
		"Reset..."
	)), BdApi.React.createElement("span", { className: "colorwaysNote" }, "Reset the plugin to its default settings. All bound managers, sources, and colorways will be deleted. Please reload Discord after use.")), BdApi.React.createElement("div", { style: { flexDirection: "column", display: "flex" } }, BdApi.React.createElement("h1", { style: {
		fontFamily: "var(--font-headline)",
		fontSize: "24px",
		color: "var(--header-primary)",
		lineHeight: "31px",
		marginBottom: "0"
	} }, "Discord ", BdApi.React.createElement("span", { style: {
		fontFamily: "var(--font-display)",
		fontSize: "24px",
		backgroundColor: "var(--brand-500)",
		padding: "0 4px",
		borderRadius: "4px"
	} }, "Colorways")), BdApi.React.createElement(
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
	), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Plugin Version:"), BdApi.React.createElement(
		"span",
		{
			style: {
				color: "var(--text-muted)",
				fontWeight: 500,
				fontSize: "14px",
				marginBottom: "8px"
			}
		},
		PluginProps.pluginVersion,
		" (",
		PluginProps.clientMod,
		")"
	), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "UI Version:"), BdApi.React.createElement(
		"span",
		{
			style: {
				color: "var(--text-muted)",
				fontWeight: 500,
				fontSize: "14px",
				marginBottom: "8px"
			}
		},
		PluginProps.UIVersion
	), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Creator Version:"), BdApi.React.createElement(
		"span",
		{
			style: {
				color: "var(--text-muted)",
				fontWeight: 500,
				fontSize: "14px",
				marginBottom: "8px"
			}
		},
		PluginProps.creatorVersion
	), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Loaded Colorways:"), BdApi.React.createElement(
		"span",
		{
			style: {
				color: "var(--text-muted)",
				fontWeight: 500,
				fontSize: "14px",
				marginBottom: "8px"
			}
		},
		[...colorways, ...customColorways].length
	), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Project Repositories:"), BdApi.React.createElement("a", { role: "link", target: "_blank", href: "https://github.com/DaBluLite/DiscordColorways" }, "DiscordColorways"), BdApi.React.createElement("a", { role: "link", target: "_blank", href: "https://github.com/DaBluLite/ProjectColorway" }, "Project Colorway")));
}

function Selector$1({
	modalProps
}) {
	const [activeTab, setActiveTab] = React.useState("selector");
	const [theme, setTheme] = React.useState("discord");
	const [pos, setPos] = React.useState({ x: 0, y: 0 });
	const [showMenu, setShowMenu] = React.useState(false);
	const [wsConnected, setWsConnected] = React.useState(wsOpen);
	const [boundKey$1, setBoundKey] = React.useState(boundKey);
	const menuProps = React.useRef(null);
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_WS_CONNECTED", ({ isConnected }) => setWsConnected(isConnected));
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_BOUND_KEY", ({ boundKey: boundKey2 }) => setBoundKey(boundKey2));
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_THEME", ({ theme: theme2 }) => setTheme(theme2));
		load();
		return () => {
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_BOUND_KEY", ({ boundKey: boundKey2 }) => setBoundKey(boundKey2));
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_WS_CONNECTED", ({ isConnected }) => setWsConnected(isConnected));
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_THEME", ({ theme: theme2 }) => setTheme(theme2));
		};
	}, []);
	function SidebarTab({ id, title, icon, bottom }) {
		return BdApi.React.createElement("div", { className: "colorwaySelectorSidebar-tab" + (id == activeTab ? " active" : ""), style: bottom ? { marginTop: "auto" } : {}, onClick: !bottom ? () => setActiveTab(id) : rightClickContextMenu }, icon);
	}
	const rightClickContextMenu = (e) => {
		e.stopPropagation();
		window.dispatchEvent(new Event("click"));
		setShowMenu(!showMenu);
		setPos({
			x: e.currentTarget.getBoundingClientRect().x + e.currentTarget.offsetWidth + 8,
			y: e.currentTarget.getBoundingClientRect().y + e.currentTarget.offsetHeight - menuProps.current.offsetHeight
		});
	};
	function onPageClick(e) {
		setShowMenu(false);
	}
	React.useEffect(() => {
		window.addEventListener("click", onPageClick);
		return () => {
			window.removeEventListener("click", onPageClick);
		};
	}, []);
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("div", { className: `colorwaySelectorModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme, ...modalProps }, BdApi.React.createElement("div", { className: "colorwaySelectorSidebar" }, BdApi.React.createElement(SidebarTab, { icon: BdApi.React.createElement(BdApi.React.Fragment, null, "\uF30D"), id: "selector", title: "Change Colorway" }), BdApi.React.createElement(SidebarTab, { icon: BdApi.React.createElement(BdApi.React.Fragment, null, "\uF3E3"), id: "settings", title: "Settings" }), BdApi.React.createElement(SidebarTab, { icon: BdApi.React.createElement(BdApi.React.Fragment, null, "\uF2C6"), id: "sources", title: "Sources" }), BdApi.React.createElement(SidebarTab, { icon: BdApi.React.createElement(BdApi.React.Fragment, null, "\uF543"), id: "store", title: "Store" }), BdApi.React.createElement(SidebarTab, { bottom: true, icon: BdApi.React.createElement(BdApi.React.Fragment, null, "\uF3EE"), id: "ws_connection", title: "Manager Connection" })), BdApi.React.createElement("div", { className: "colorwayModalContent" }, activeTab === "selector" && BdApi.React.createElement(Selector, null), activeTab == "sources" && BdApi.React.createElement(SourceManager, null), activeTab == "store" && BdApi.React.createElement(Store, null), activeTab == "settings" && BdApi.React.createElement("div", { style: { padding: "16px" } }, BdApi.React.createElement(SettingsPage, null))), BdApi.React.createElement("div", { ref: menuProps, className: `colorwaysManagerConnectionMenu ${showMenu ? "visible" : ""}`, style: {
		position: "fixed",
		top: `${pos.y}px`,
		left: `${pos.x}px`
	} }, BdApi.React.createElement("span", null, "Manager Connection Status: ", wsConnected ? "Connected" : "Disconnected"), wsConnected ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("span", { className: "colorwaysManagerConnectionValue" }, "Bound Key: ", BdApi.React.createElement("b", null, JSON.stringify(boundKey$1))), BdApi.React.createElement("button", { className: "colorwaysPillButton", style: {
		marginTop: "4px"
	}, onClick: () => navigator.clipboard.writeText(JSON.stringify(boundKey$1)) }, "Copy Bound Key"), BdApi.React.createElement("button", { className: "colorwaysPillButton", style: {
		marginTop: "4px"
	}, onClick: restartWS }, "Reset Connection"), BdApi.React.createElement("button", { className: "colorwaysPillButton", style: {
		marginTop: "4px"
	}, onClick: updateRemoteSources }, "Update Remote Sources")) : BdApi.React.createElement(BdApi.React.Fragment, null))));
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
	return Boolean(socket && socket.readyState == socket.OPEN);
}
function connect(doAutoconnect = true, autoconnectTimeout = 3e3) {
	if (socket && socket.readyState == socket.OPEN) return;
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
						DataStore.set("activeColorwayObject", nullColorwayObj);
						ColorwayCSS.remove();
						FluxDispatcher.dispatch({
							type: "COLORWAYS_UPDATE_ACTIVE_COLORWAY",
							active: nullColorwayObj
						});
					} else {
						data.active.colors.primary ??= "313338";
						data.active.colors.secondary ??= "2b2d31";
						data.active.colors.tertiary ??= "1e1f22";
						data.active.colors.accent ??= "ffffff";
						const demandedColorway = !Object.keys(data.active).includes("linearGradient") ? generateCss(
							colorToHex("#" + data.active.colors.primary.replace("#", "")),
							colorToHex("#" + data.active.colors.secondary.replace("#", "")),
							colorToHex("#" + data.active.colors.tertiary.replace("#", "")),
							colorToHex("#" + data.active.colors.accent.replace("#", ""))
						) : gradientBase(colorToHex("#" + data.active.colors.accent.replace("#", "")), true) + `:root:root {--custom-theme-background: linear-gradient(${data.active.linearGradient})}`;
						ColorwayCSS.set(demandedColorway);
						DataStore.set("activeColorwayObject", { ...data.active, css: demandedColorway });
						FluxDispatcher.dispatch({
							type: "COLORWAYS_UPDATE_ACTIVE_COLORWAY",
							active: { ...data.active, css: demandedColorway }
						});
					}
					return;
				case "remove-colorway":
					DataStore.set("activeColorwayObject", nullColorwayObj);
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
								if (Object.keys(boundManager)[0] == data.MID) return boundManager;
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
					openModal((props) => BdApi.React.createElement(Selector$1, { modalProps: props }));
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
		if (doAutoconnect && (e.code !== 1 || hasErrored)) {
			setTimeout(() => connect(doAutoconnect, autoconnectTimeout), autoconnectTimeout);
		}
	};
	ws.onerror = () => hasErrored = true;
}

function ColorwayCreatorSettingsModal({ modalProps, onSettings, presetId, hasTintedText, hasDiscordSaturation }) {
	const [tintedText, setTintedText] = React.useState(hasTintedText);
	const [discordSaturation, setDiscordSaturation] = React.useState(hasDiscordSaturation);
	const [preset, setPreset] = React.useState(presetId);
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	return BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, "Creator Settings"), BdApi.React.createElement("div", { className: "colorwaysModalContent", style: {
		minWidth: "500px"
	} }, BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Presets:"), BdApi.React.createElement("div", { className: "colorwaysScroller", style: { paddingRight: "2px", marginBottom: "20px", maxHeight: "250px" } }, Object.values(getPreset()).map((pre) => BdApi.React.createElement(
		"div",
		{
			"aria-checked": preset === pre.id,
			className: "discordColorway",
			style: { padding: "10px", marginBottom: "8px" },
			onClick: () => {
				setPreset(pre.id);
			}
		},
		BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), preset === pre.id && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" })),
		BdApi.React.createElement("span", { className: "colorwayLabel" }, pre.name)
	))), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement(Switch, { value: tintedText, onChange: setTintedText, label: "Use colored text" })), BdApi.React.createElement(Switch, { value: discordSaturation, onChange: setDiscordSaturation, label: "Use Discord's saturation" })), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-onSurface",
			onClick: () => {
				onSettings({ presetId: preset, discordSaturation, tintedText });
				modalProps.onClose();
			}
		},
		"Finish"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => {
				modalProps.onClose();
			}
		},
		"Cancel"
	)));
}

function ConflictingColorsModal({
	modalProps,
	onFinished
}) {
	const [accentColor, setAccentColor] = React.useState(getHex(
		getComputedStyle(
			document.body
		).getPropertyValue("--brand-experiment")
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
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	return BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, "Conflicting Colors Found"), BdApi.React.createElement("div", { className: "colorwaysModalContent" }, BdApi.React.createElement("span", { className: "colorwaysConflictingColors-warning" }, "Multiple known themes have been found, select the colors you want to copy from below:"), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Colors to copy:"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreviews" }, BdApi.React.createElement("div", { className: "colorwayCreator-colorPreview", style: { backgroundColor: primaryColor, color: getFontOnBg(primaryColor) } }, "Primary"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreview", style: { backgroundColor: secondaryColor, color: getFontOnBg(secondaryColor) } }, "Secondary"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreview", style: { backgroundColor: tertiaryColor, color: getFontOnBg(tertiaryColor) } }, "Tertiary"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreview", style: { backgroundColor: accentColor, color: getFontOnBg(accentColor) } }, "Accent")), BdApi.React.createElement("div", { className: "colorwaysCreator-settingCat" }, BdApi.React.createElement("div", { className: "colorwaysCreator-settingsList" }, BdApi.React.createElement(
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
						).getPropertyValue("--brand-experiment")
					),
					color: getFontOnBg(
						getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--brand-experiment")
						)
					)
				},
				onClick: () => setAccentColor(
					getHex(
						getComputedStyle(
							document.body
						).getPropertyValue("--brand-experiment")
					)
				)
			},
			"Accent"
		))
	), Object.values(knownThemeVars).map((theme2, i) => {
		if (getComputedStyle(document.body).getPropertyValue(theme2.variable)) {
			return BdApi.React.createElement(
				"div",
				{
					id: "colorways-colorstealer-item_" + Object.keys(knownThemeVars)[i],
					className: "colorwaysCreator-settingItm colorwaysCreator-colorPreviewItm"
				},
				BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, Object.keys(knownThemeVars)[i] + (theme2.alt ? " (Main)" : "")),
				BdApi.React.createElement("div", { className: "colorwayCreator-colorPreviews" }, theme2.primary && getComputedStyle(document.body).getPropertyValue(theme2.primary).match(/^\d.*%$/) ? BdApi.React.createElement(
					"div",
					{
						className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_primary",
						style: {
							backgroundColor: getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.primary)})`),
							color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.primary)})`))
						},
						onClick: () => {
							setPrimaryColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.primary)})`));
						}
					},
					"Primary"
				) : theme2.primary ? BdApi.React.createElement(
					"div",
					{
						className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_primary",
						style: {
							backgroundColor: getHex(getComputedStyle(document.body).getPropertyValue(theme2.primary)),
							color: getFontOnBg(getHex(getComputedStyle(document.body).getPropertyValue(theme2.primary)))
						},
						onClick: () => {
							setPrimaryColor(getHex(getComputedStyle(document.body).getPropertyValue(theme2.primary)));
						}
					},
					"Primary"
				) : theme2.primaryVariables && BdApi.React.createElement(
					"div",
					{
						className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_primary",
						style: { backgroundColor: `hsl(${getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.l)})`, color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.l)})`)) },
						onClick: () => {
							setPrimaryColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.primaryVariables.l)})`));
						}
					},
					"Primary"
				), theme2.secondary && getComputedStyle(document.body).getPropertyValue(theme2.secondary).match(/^\d.*%$/) ? BdApi.React.createElement(
					"div",
					{
						className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_secondary",
						style: {
							backgroundColor: getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.secondary)})`),
							color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.secondary)})`))
						},
						onClick: () => {
							setSecondaryColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.secondary)})`));
						}
					},
					"Secondary"
				) : theme2.secondary ? BdApi.React.createElement(
					"div",
					{
						className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_secondary",
						style: {
							backgroundColor: getHex(getComputedStyle(document.body).getPropertyValue(theme2.secondary)),
							color: getFontOnBg(getHex(getComputedStyle(document.body).getPropertyValue(theme2.secondary)))
						},
						onClick: () => {
							setSecondaryColor(getHex(getComputedStyle(document.body).getPropertyValue(theme2.secondary)));
						}
					},
					"Secondary"
				) : theme2.secondaryVariables && BdApi.React.createElement(
					"div",
					{
						className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_secondary",
						style: { backgroundColor: `hsl(${getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.l)})`, color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.l)})`)) },
						onClick: () => {
							setSecondaryColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.secondaryVariables.l)})`));
						}
					},
					"Secondary"
				), theme2.tertiary && getComputedStyle(document.body).getPropertyValue(theme2.tertiary).match(/^\d.*%$/) ? BdApi.React.createElement(
					"div",
					{
						className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_tertiary",
						style: {
							backgroundColor: getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.tertiary)})`),
							color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.tertiary)})`))
						},
						onClick: () => {
							setTertiaryColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.tertiary)})`));
						}
					},
					"Tertiary"
				) : theme2.tertiary ? BdApi.React.createElement(
					"div",
					{
						className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_tertiary",
						style: {
							backgroundColor: getHex(getComputedStyle(document.body).getPropertyValue(theme2.tertiary)),
							color: getFontOnBg(getHex(getComputedStyle(document.body).getPropertyValue(theme2.tertiary)))
						},
						onClick: () => {
							setTertiaryColor(getHex(getComputedStyle(document.body).getPropertyValue(theme2.tertiary)));
						}
					},
					"Tertiary"
				) : theme2.tertiaryVariables && BdApi.React.createElement(
					"div",
					{
						className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_tertiary",
						style: { backgroundColor: `hsl(${getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.l)})`, color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.l)})`)) },
						onClick: () => {
							setTertiaryColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.tertiaryVariables.l)})`));
						}
					},
					"Tertiary"
				), theme2.accent && getComputedStyle(document.body).getPropertyValue(theme2.accent).match(/^\d.*%$/) ? BdApi.React.createElement(
					"div",
					{
						className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_accent",
						style: {
							backgroundColor: getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.accent)})`),
							color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.accent)})`))
						},
						onClick: () => {
							setAccentColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.accent)})`));
						}
					},
					"Accent"
				) : theme2.accent ? BdApi.React.createElement(
					"div",
					{
						className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_accent",
						style: {
							backgroundColor: getHex(getComputedStyle(document.body).getPropertyValue(theme2.accent)),
							color: getFontOnBg(getHex(getComputedStyle(document.body).getPropertyValue(theme2.accent)))
						},
						onClick: () => {
							setAccentColor(getHex(getComputedStyle(document.body).getPropertyValue(theme2.accent)));
						}
					},
					"Accent"
				) : theme2.accentVariables && BdApi.React.createElement(
					"div",
					{
						className: "colorwayCreator-colorPreview colorwayCreator-colorPreview_accent",
						style: { backgroundColor: `hsl(${getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.l)})`, color: getFontOnBg(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.l)})`)) },
						onClick: () => {
							setAccentColor(getHex(`hsl(${getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.h)} ${!getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.s).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.s) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.s)} ${!getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.l).includes("%") ? getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.l) + "%" : getComputedStyle(document.body).getPropertyValue(theme2.accentVariables.l)})`));
						}
					},
					"Accent"
				))
			);
		}
	})))), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-onSurface",
			onClick: () => {
				onFinished({
					accent: accentColor,
					primary: primaryColor,
					secondary: secondaryColor,
					tertiary: tertiaryColor
				});
				modalProps.onClose();
			}
		},
		"Finish"
	)));
}

function InputColorwayIdModal({ modalProps, onColorwayId }) {
	const [colorwayID, setColorwayID] = React.useState("");
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	return BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("div", { className: "colorwaysModalContent" }, BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Colorway ID:"), BdApi.React.createElement(
		"input",
		{
			type: "text",
			className: "colorwayTextBox",
			placeholder: "Enter Colorway ID",
			onInput: ({ currentTarget: { value } }) => setColorwayID(value)
		}
	)), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-onSurface",
			onClick: () => {
				if (!colorwayID) {
					throw new Error("Please enter a Colorway ID");
				} else if (!hexToString(colorwayID).includes(",")) {
					throw new Error("Invalid Colorway ID");
				} else {
					onColorwayId(colorwayID);
					modalProps.onClose();
				}
			}
		},
		"Finish"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => modalProps.onClose()
		},
		"Cancel"
	)));
}

function SaveColorwayModal({ modalProps, colorways, onFinish }) {
	const [offlineColorwayStores, setOfflineColorwayStores] = React.useState([]);
	const [storename, setStorename] = React.useState();
	const [noStoreError, setNoStoreError] = React.useState(false);
	React.useEffect(() => {
		(async () => {
			setOfflineColorwayStores(await DataStore.get("customColorways"));
		})();
	});
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	return BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, "Save to source:"), BdApi.React.createElement("div", { className: "colorwaysModalContent" }, noStoreError ? BdApi.React.createElement("span", { style: { color: "var(--text-danger)" } }, "Error: No store selected") : BdApi.React.createElement(BdApi.React.Fragment, null), offlineColorwayStores.map((store) => BdApi.React.createElement(
		"div",
		{
			className: "discordColorway",
			style: { padding: "10px" },
			"aria-checked": storename === store.name,
			onClick: () => {
				setStorename(store.name);
			}
		},
		BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), storename === store.name && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" })),
		BdApi.React.createElement("span", { className: "colorwayLabel" }, store.name)
	)), BdApi.React.createElement(
		"div",
		{
			className: "discordColorway",
			style: { padding: "10px" },
			onClick: () => {
				openModal((props) => BdApi.React.createElement(StoreNameModal, { modalProps: props, conflicting: false, originalName: "", onFinish: async (e) => {
					await DataStore.set("customColorways", [...await DataStore.get("customColorways"), { name: e, colorways: [] }]);
					setOfflineColorwayStores(await DataStore.get("customColorways"));
				} }));
			}
		},
		BdApi.React.createElement(PlusIcon, { width: 24, height: 24 }),
		BdApi.React.createElement("span", { className: "colorwayLabel" }, "Create new store...")
	)), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-onSurface",
			onClick: async () => {
				setNoStoreError(false);
				if (!storename) {
					setNoStoreError(true);
				} else {
					const oldStores = await DataStore.get("customColorways");
					const storeToModify = (await DataStore.get("customColorways")).filter((source) => source.name === storename)[0];
					colorways.map((colorway, i) => {
						if (storeToModify.colorways.map((colorway2) => colorway2.name).includes(colorway.name)) {
							openModal((props) => BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, "Duplicate Colorway"), BdApi.React.createElement("div", { className: "colorwaysModalContent" }, BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "A colorway with the same name was found in this store, what do you want to do?")), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
								"button",
								{
									className: "colorwaysPillButton colorwaysPillButton-onSurface",
									onClick: () => {
										const newStore = { name: storeToModify.name, colorways: [...storeToModify.colorways.filter((colorwayy) => colorwayy.name !== colorway.name), colorway] };
										DataStore.set("customColorways", [...oldStores.filter((source) => source.name !== storename), newStore]);
										props.onClose();
										if (i + 1 === colorways.length) {
											modalProps.onClose();
											onFinish();
										}
									}
								},
								"Override"
							), BdApi.React.createElement(
								"button",
								{
									className: "colorwaysPillButton colorwaysPillButton-onSurface",
									onClick: () => {
										function NewColorwayNameModal({ modalProps: modalProps2, onSelected }) {
											const [errorMsg, setErrorMsg] = React.useState();
											const [newColorwayName, setNewColorwayName] = React.useState("");
											return BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps2.transitionState == 2 ? "closing" : ""} ${modalProps2.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, "Select new name"), BdApi.React.createElement("div", { className: "colorwaysModalContent" }, BdApi.React.createElement(
												"input",
												{
													type: "text",
													className: "colorwayTextBox",
													value: newColorwayName,
													onInput: ({ currentTarget: { value } }) => setNewColorwayName(value),
													placeholder: "Enter valid colorway name"
												}
											)), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
												"button",
												{
													className: "colorwaysPillButton",
													onClick: () => {
														setErrorMsg("");
														if (storeToModify.colorways.map((colorway2) => colorway2.name).includes(newColorwayName)) {
															setErrorMsg("Error: Name already exists");
														} else {
															onSelected(newColorwayName);
															if (i + 1 === colorways.length) {
																modalProps2.onClose();
															}
														}
													}
												},
												"Finish"
											), BdApi.React.createElement(
												"button",
												{
													className: "colorwaysPillButton",
													onClick: () => {
														if (i + 1 === colorways.length) {
															modalProps2.onClose();
														}
													}
												},
												"Cancel"
											)));
										}
										openModal((propss) => BdApi.React.createElement(NewColorwayNameModal, { modalProps: propss, onSelected: (e) => {
											const newStore = { name: storeToModify.name, colorways: [...storeToModify.colorways, { ...colorway, name: e }] };
											DataStore.set("customColorways", [...oldStores.filter((source) => source.name !== storename), newStore]);
											props.onClose();
											if (i + 1 === colorways.length) {
												modalProps.onClose();
												onFinish();
											}
										} }));
									}
								},
								"Rename"
							), BdApi.React.createElement(
								"button",
								{
									className: "colorwaysPillButton",
									onClick: () => {
										props.onClose();
									}
								},
								"Select different store"
							))));
						} else {
							const newStore = { name: storeToModify.name, colorways: [...storeToModify.colorways, colorway] };
							DataStore.set("customColorways", [...oldStores.filter((source) => source.name !== storename), newStore]);
							if (i + 1 === colorways.length) {
								modalProps.onClose();
								onFinish();
							}
						}
					});
				}
			}
		},
		"Finish"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => {
				modalProps.onClose();
			}
		},
		"Cancel"
	)));
}

function ThemePreview({
	accent,
	primary,
	secondary,
	tertiary,
	previewCSS,
	modalProps,
	isModal
}) {
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("style", null, ".colorwaysPreview-wrapper {color: var(--header-secondary); box-shadow: var(--legacy-elevation-border);}" + previewCSS), BdApi.React.createElement(
		"div",
		{
			className: "colorwaysPreview-wrapper",
			style: { background: `var(--dc-overlay-app-frame, ${tertiary})` }
		},
		BdApi.React.createElement("div", { className: "colorwaysPreview-titlebar" }),
		BdApi.React.createElement("div", { className: "colorwaysPreview-body" }, BdApi.React.createElement("div", { className: "colorwayPreview-guilds" }, BdApi.React.createElement("div", { className: "colorwayPreview-guild" }, BdApi.React.createElement(
			"div",
			{
				className: "colorwayPreview-guildItem",
				style: { background: `var(--dc-guild-button, ${primary})` },
				onMouseEnter: (e) => e.currentTarget.style.background = accent,
				onMouseLeave: (e) => e.currentTarget.style.background = `var(--dc-guild-button, ${primary})`,
				onClick: () => {
					if (isModal) {
						modalProps?.onClose();
					} else {
						openModal((props) => BdApi.React.createElement("div", { className: `colorwaysPreview-modal ${props.transitionState == 2 ? "closing" : ""} ${props.transitionState == 4 ? "hidden" : ""}` }, BdApi.React.createElement("style", null, previewCSS), BdApi.React.createElement(ThemePreview, { accent, primary, secondary, tertiary, isModal: true, modalProps: props })));
					}
				}
			},
			isModal ? BdApi.React.createElement(CloseIcon, { style: { color: "var(--header-secondary)" } }) : BdApi.React.createElement(
				"svg",
				{
					"aria-hidden": "true",
					role: "img",
					width: "24",
					height: "24",
					viewBox: "0 0 24 24"
				},
				BdApi.React.createElement(
					"path",
					{
						fill: "currentColor",
						d: "M19,3H14V5h5v5h2V5A2,2,0,0,0,19,3Z"
					}
				),
				BdApi.React.createElement(
					"path",
					{
						fill: "currentColor",
						d: "M19,19H14v2h5a2,2,0,0,0,2-2V14H19Z"
					}
				),
				BdApi.React.createElement(
					"path",
					{
						fill: "currentColor",
						d: "M3,5v5H5V5h5V3H5A2,2,0,0,0,3,5Z"
					}
				),
				BdApi.React.createElement(
					"path",
					{
						fill: "currentColor",
						d: "M5,14H3v5a2,2,0,0,0,2,2h5V19H5Z"
					}
				)
			)
		)), BdApi.React.createElement("div", { className: "colorwayPreview-guild" }, BdApi.React.createElement("div", { className: "colorwayPreview-guildSeparator", style: { backgroundColor: primary } })), BdApi.React.createElement("div", { className: "colorwayPreview-guild" }, BdApi.React.createElement(
			"div",
			{
				className: "colorwayPreview-guildItem",
				style: { background: `var(--dc-guild-button, ${primary})` },
				onMouseEnter: (e) => e.currentTarget.style.background = accent,
				onMouseLeave: (e) => e.currentTarget.style.background = `var(--dc-guild-button, ${primary})`
			}
		)), BdApi.React.createElement("div", { className: "colorwayPreview-guild" }, BdApi.React.createElement(
			"div",
			{
				className: "colorwayPreview-guildItem",
				style: { background: `var(--dc-guild-button, ${primary})` },
				onMouseEnter: (e) => e.currentTarget.style.background = accent,
				onMouseLeave: (e) => e.currentTarget.style.background = `var(--dc-guild-button, ${primary})`
			}
		))), BdApi.React.createElement("div", { className: "colorwayPreview-channels", style: { background: `var(--dc-overlay-3, ${secondary})` } }, BdApi.React.createElement(
			"div",
			{
				className: "colorwayPreview-userArea",
				style: {
					background: `var(--dc-secondary-alt, hsl(${HexToHSL(secondary)[0]} ${HexToHSL(secondary)[1]}% ${Math.max(HexToHSL(secondary)[2] - 3.6, 0)}%))`
				}
			}
		), BdApi.React.createElement("div", { className: "colorwayPreview-filler" }, BdApi.React.createElement("div", { className: "colorwayPreview-channel", style: { backgroundColor: "var(--white-500)" } }), BdApi.React.createElement("div", { className: "colorwayPreview-channel", style: { backgroundColor: "var(--primary-360)" } }), BdApi.React.createElement("div", { className: "colorwayPreview-channel", style: { backgroundColor: "var(--primary-500)" } })), BdApi.React.createElement(
			"div",
			{
				className: "colorwayPreview-topShadow",
				style: {
					"--primary-900-hsl": `${HexToHSL(tertiary)[0]} ${HexToHSL(tertiary)[1]}% ${Math.max(HexToHSL(tertiary)[2] - 3.6 * 6, 0)}%`,
					"--primary-500-hsl": `${HexToHSL(primary)[0]} ${HexToHSL(primary)[1]}% ${Math.min(HexToHSL(primary)[2] + 3.6 * 3, 100)}%`
				}
			},
			BdApi.React.createElement("span", { style: {
				fontWeight: 700,
				color: "var(--text-normal)"
			} }, "Preview")
		)), BdApi.React.createElement("div", { className: "colorwayPreview-chat", style: { background: `var(--dc-overlay-chat, ${primary})` } }, BdApi.React.createElement(
			"div",
			{
				className: "colorwayPreview-chatBox",
				style: {
					background: `var(--dc-overlay-3, hsl(${HexToHSL(primary)[0]} ${HexToHSL(primary)[1]}% ${Math.min(HexToHSL(primary)[2] + 3.6, 100)}%))`
				}
			}
		), BdApi.React.createElement("div", { className: "colorwayPreview-filler" }), BdApi.React.createElement(
			"div",
			{
				className: "colorwayPreview-topShadow"
			}
		)))
	));
}

function CreatorModal({
	modalProps,
	loadUIProps = () => new Promise(() => {
	}),
	colorwayID
}) {
	const [colors, updateColors] = React.useReducer((colors2, action) => {
		if (action.task === "all") {
			return { ...action.colorObj };
		} else {
			return { ...colors2, [action.task]: action.color };
		}
	}, {
		accent: "5865f2",
		primary: "313338",
		secondary: "2b2d31",
		tertiary: "1e1f22"
	});
	const [colorwayName, setColorwayName] = React.useState("");
	const [tintedText, setTintedText] = React.useState(true);
	const [discordSaturation, setDiscordSaturation] = React.useState(true);
	const [preset, setPreset] = React.useState("default");
	const [presetColorArray, setPresetColorArray] = React.useState(["accent", "primary", "secondary", "tertiary"]);
	const [mutedTextBrightness, setMutedTextBrightness] = React.useState(Math.min(HexToHSL("#" + colors.primary)[2] + 3.6 * 3, 100));
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	const setColor = [
		"accent",
		"primary",
		"secondary",
		"tertiary"
	];
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
	React.useEffect(() => {
		if (colorwayID) {
			if (!colorwayID.includes(",")) {
				throw new Error("Invalid Colorway ID");
			} else {
				colorwayID.split("|").forEach((prop) => {
					if (prop.includes(",#")) {
						prop.split(/,#/).forEach((color, i) => updateColors({ task: setColor[i], color: colorToHex(color) }));
					}
					if (prop.includes("n:")) {
						setColorwayName(prop.split("n:")[1]);
					}
					if (prop.includes("p:")) {
						if (Object.values(getPreset()).map((preset2) => preset2.id).includes(prop.split("p:")[1])) {
							setPreset(prop.split("p:")[1]);
							setPresetColorArray(getPreset()[prop.split("p:")[1]].colors);
						}
					}
				});
			}
		}
	});
	const colorPickerProps = {
		suggestedColors: [
			"#313338",
			"#2b2d31",
			"#1e1f22",
			"#5865f2"
		],
		showEyeDropper: true
	};
	return BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, "Create a Colorway"), BdApi.React.createElement("div", { className: "colorwaysModalContent", style: { minWidth: 500 } }, BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Name:"), BdApi.React.createElement(
		"input",
		{
			type: "text",
			className: "colorwayTextBox",
			placeholder: "Give your Colorway a name",
			value: colorwayName,
			onInput: (e) => setColorwayName(e.currentTarget.value)
		}
	), BdApi.React.createElement("div", { className: "colorwaysCreator-settingCat" }, BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Colors & Values:"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreviews" }, colorProps.filter((color) => presetColorArray.includes(color.id) || Object.keys(getPreset()[preset].calculated || {}).includes(color.id)).map((presetColor) => {
		return BdApi.React.createElement(
			exports.ColorPicker,
			{
				label: BdApi.React.createElement("span", { className: "colorwaysPicker-colorLabel" }, Object.keys(getPreset()[preset].calculated || {}).includes(presetColor.id) ? presetColor.name + " (Calculated)" : presetColor.name),
				color: !Object.keys(
					getPreset()[preset].calculated || {}
				).includes(presetColor.id) ? parseInt(colors[presetColor.id], 16) : parseInt(
					colorToHex(
						getPreset(
							colors.primary,
							colors.secondary,
							colors.tertiary,
							colors.accent
						)[preset].calculated[presetColor.id]
					),
					16
				),
				onChange: (color) => {
					if (!Object.keys(getPreset()[preset].calculated || {}).includes(presetColor.id)) {
						let hexColor = color.toString(16);
						while (hexColor.length < 6) {
							hexColor = "0" + hexColor;
						}
						updateColors({ task: presetColor.id, color: hexColor });
					}
				},
				...colorPickerProps
			}
		);
	})), BdApi.React.createElement("div", { className: "colorwaysSettingsDivider", style: { margin: "10px 0" } }), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Muted Text Brightness:"), BdApi.React.createElement(
		exports.Slider,
		{
			minValue: 0,
			maxValue: 100,
			initialValue: mutedTextBrightness,
			onValueChange: setMutedTextBrightness
		}
	)), BdApi.React.createElement(
		"div",
		{
			className: "colorwaysCreator-setting",
			onClick: () => openModal((props) => BdApi.React.createElement(
				ColorwayCreatorSettingsModal,
				{
					modalProps: props,
					hasDiscordSaturation: discordSaturation,
					hasTintedText: tintedText,
					presetId: preset,
					onSettings: ({ presetId, tintedText: tintedText2, discordSaturation: discordSaturation2 }) => {
						setPreset(presetId);
						setPresetColorArray(getPreset()[presetId].colors);
						setDiscordSaturation(discordSaturation2);
						setTintedText(tintedText2);
					}
				}
			))
		},
		BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Settings & Presets"),
		BdApi.React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", "aria-hidden": "true", role: "img", style: { rotate: "-90deg" } }, BdApi.React.createElement("path", { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", d: "M7 10L12 15 17 10", "aria-hidden": "true" }))
	), BdApi.React.createElement(
		ThemePreview,
		{
			accent: "#" + colors.accent,
			primary: "#" + colors.primary,
			secondary: "#" + colors.secondary,
			tertiary: "#" + colors.tertiary,
			previewCSS: gradientPresetIds.includes(getPreset()[preset].id) ? pureGradientBase + `.colorwaysPreview-modal,.colorwaysPreview-wrapper {--gradient-theme-bg: linear-gradient(${getPreset(
				colors.primary,
				colors.secondary,
				colors.tertiary,
				colors.accent
			)[preset].preset(discordSaturation).base})}` : tintedText ? `.colorwaysPreview-modal,.colorwaysPreview-wrapper {
												--primary-500: hsl(${HexToHSL("#" + colors.primary)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + colors.primary)[1] / 100 * (100 + PrimarySatDiffs[500]) * 10) / 10 : HexToHSL("#" + colors.primary)[1]}%) ${mutedTextBrightness || Math.min(HexToHSL("#" + colors.primary)[2] + 3.6 * 3, 100)}%);
												--primary-360: hsl(${HexToHSL("#" + colors.secondary)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + colors.primary)[1] / 100 * (100 + PrimarySatDiffs[360]) * 10) / 10 : HexToHSL("#" + colors.primary)[1]}%) 90%);
								}` : ""
		}
	)), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-onSurface",
			onClick: async () => {
				if (preset === "default") {
					generateCss(
						colors.primary,
						colors.secondary,
						colors.tertiary,
						colors.accent,
						tintedText,
						discordSaturation,
						mutedTextBrightness,
						colorwayName || "Colorway"
					);
				} else {
					gradientPresetIds.includes(getPreset()[preset].id) ? `/**
																* @name ${colorwayName || "Colorway"}
																* @version ${PluginProps.creatorVersion}
																* @description Automatically generated Colorway.
																* @author ${exports.UserStore.getCurrentUser().username}
																* @authorId ${exports.UserStore.getCurrentUser().id}
																* @preset Gradient
																*/
															 ${getPreset(colors.primary, colors.secondary, colors.tertiary, colors.accent)[preset].preset(discordSaturation).full}` : `/**
															 * @name ${colorwayName || "Colorway"}
															 * @version ${PluginProps.creatorVersion}
															 * @description Automatically generated Colorway.
															 * @author ${exports.UserStore.getCurrentUser().username}
															 * @authorId ${exports.UserStore.getCurrentUser().id}
															 * @preset ${getPreset()[preset].name}
															 */
															 ${getPreset(colors.primary, colors.secondary, colors.tertiary, colors.accent)[preset].preset(discordSaturation)}`;
				}
				const customColorway = {
					name: colorwayName || "Colorway",
					accent: "#" + colors.accent,
					primary: "#" + colors.primary,
					secondary: "#" + colors.secondary,
					tertiary: "#" + colors.tertiary,
					colors: presetColorArray,
					author: exports.UserStore.getCurrentUser().username,
					authorID: exports.UserStore.getCurrentUser().id,
					isGradient: gradientPresetIds.includes(getPreset()[preset].id),
					linearGradient: gradientPresetIds.includes(getPreset()[preset].id) ? getPreset(
						colors.primary,
						colors.secondary,
						colors.tertiary,
						colors.accent
					)[preset].preset(discordSaturation).base : "",
					preset: getPreset()[preset].id,
					creatorVersion: PluginProps.creatorVersion
				};
				openModal((props) => BdApi.React.createElement(SaveColorwayModal, { modalProps: props, colorways: [customColorway], onFinish: () => {
					modalProps.onClose();
					loadUIProps();
					updateRemoteSources();
				} }));
			}
		},
		"Finish"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => {
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
				Object.values(knownThemeVars).map((theme2, i) => {
					if (getComputedStyle(document.body).getPropertyValue(theme2.variable)) {
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
								).getPropertyValue("--brand-experiment")
							).split("#")[1]
						}
					});
				}
			}
		},
		"Copy Current Colors"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => openModal((props) => BdApi.React.createElement(InputColorwayIdModal, { modalProps: props, onColorwayId: (colorwayID2) => {
				hexToString(colorwayID2).split(/,#/).forEach((color, i) => updateColors({ task: setColor[i], color: colorToHex(color) }));
			} }))
		},
		"Enter Colorway ID"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => {
				modalProps.onClose();
			}
		},
		"Cancel"
	)));
}

function RenameColorwayModal({ modalProps, ogName, onFinish, colorwayList }) {
	const [error, setError] = React.useState("");
	const [newName, setNewName] = React.useState(ogName);
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	return BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, "Rename Colorway..."), BdApi.React.createElement("div", { className: "colorwaysModalContent" }, BdApi.React.createElement(
		"input",
		{
			type: "text",
			className: "colorwayTextBox",
			value: newName,
			onInput: ({ currentTarget: { value } }) => {
				setNewName(value);
			}
		}
	)), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-onSurface",
			onClick: async () => {
				if (!newName) {
					return setError("Error: Please enter a valid name");
				}
				if (colorwayList.map((c) => c.name).includes(newName)) {
					return setError("Error: Name already exists");
				}
				onFinish(newName);
				modalProps.onClose();
			}
		},
		"Finish"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => modalProps.onClose()
		},
		"Cancel"
	)));
}
function InfoModal({
	modalProps,
	colorway,
	loadUIProps
}) {
	const colors = colorway.colors || [
		"accent",
		"primary",
		"secondary",
		"tertiary"
	];
	const profile = useStateFromStores([exports.UserStore], () => exports.UserStore.getUser(colorway.authorID));
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	return BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, "Colorway: ", colorway.name), BdApi.React.createElement("div", { className: "colorwaysModalContent" }, BdApi.React.createElement("div", { style: { gap: "8px", width: "100%", display: "flex", flexDirection: "column" } }, BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Creator:"), BdApi.React.createElement("div", { style: { gap: ".5rem", display: "flex" } }, BdApi.React.createElement("img", { src: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.webp?size=32`, width: 32, height: 32, style: {
		borderRadius: "32px"
	} }), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader", style: { lineHeight: "32px" }, onClick: () => {
		navigator.clipboard.writeText(profile.username);
		Toasts.show({
			message: "Copied Colorway Author Username Successfully",
			type: 1,
			id: "copy-colorway-author-username-notify"
		});
	} }, colorway.author)), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Colors:"), BdApi.React.createElement("div", { style: { gap: "8px", display: "flex" } }, colors.map((color) => BdApi.React.createElement("div", { className: "colorwayInfo-colorSwatch", style: { backgroundColor: colorway[color] } }))), BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "Actions:"), BdApi.React.createElement("div", { style: { gap: "8px", flexDirection: "column", display: "flex" } }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			style: { width: "100%" },
			onClick: () => {
				const colorwayIDArray = `${colorway.accent},${colorway.primary},${colorway.secondary},${colorway.tertiary}|n:${colorway.name}${colorway.preset ? `|p:${colorway.preset}` : ""}`;
				const colorwayID = stringToHex(colorwayIDArray);
				navigator.clipboard.writeText(colorwayID);
				Toasts.show({
					message: "Copied Colorway ID Successfully",
					type: 1,
					id: "copy-colorway-id-notify"
				});
			}
		},
		"Copy Colorway ID"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			style: { width: "100%" },
			onClick: () => {
				if (colorway["dc-import"]) {
					navigator.clipboard.writeText(colorway["dc-import"]);
					Toasts.show({
						message: "Copied CSS to Clipboard",
						type: 1,
						id: "copy-colorway-css-notify"
					});
				} else {
					Toasts.show({
						message: "Colorway did not provide CSS",
						type: 2,
						id: "copy-colorway-css-failed-notify"
					});
				}
			}
		},
		"Copy CSS"
	), colorway.sourceType === "offline" && BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			style: { width: "100%" },
			onClick: async () => {
				const offlineSources = (await DataStore.get("customColorways")).map((o) => o.colorways).filter((colorArr) => colorArr.map((color) => color.name).includes(colorway.name))[0];
				openModal((props) => BdApi.React.createElement(RenameColorwayModal, { ogName: colorway.name, colorwayList: offlineSources, modalProps: props, onFinish: async (newName) => {
					const stores = (await DataStore.get("customColorways")).map((source) => {
						if (source.name === colorway.source) {
							return {
								name: source.name,
								colorways: [...source.colorways.filter((colorway2) => colorway2.name !== colorway2.name), {
									...colorway,
									name: newName
								}]
							};
						} else return source;
					});
					DataStore.set("customColorways", stores);
					if ((await DataStore.get("activeColorwayObject")).id === colorway.name) {
						DataStore.set("activeColorwayObject", { id: newName, css: colorway.name, sourceType: "offline", source: colorway.source });
					}
					modalProps.onClose();
					loadUIProps();
				} }));
			}
		},
		"Rename"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			style: { width: "100%" },
			onClick: () => {
				if (colorway["dc-import"]) {
					if (!colorway["dc-import"].includes("@name")) {
						saveFile(new File([`/**
																				* @name ${colorway.name || "Colorway"}
																				* @version ${PluginProps.creatorVersion}
																				* @description Automatically generated Colorway.
																				* @author ${exports.UserStore.getCurrentUser().username}
																				* @authorId ${exports.UserStore.getCurrentUser().id}
																				*/
																			 ${colorway["dc-import"].replace((colorway["dc-import"].match(/\/\*.+\*\//) || [""])[0], "").replaceAll("url(//", "url(https://").replaceAll('url("//', 'url("https://')}`], `${colorway.name.replaceAll(" ", "-").toLowerCase()}.theme.css`, { type: "text/plain" }));
					} else {
						saveFile(new File([colorway["dc-import"]], `${colorway.name.replaceAll(" ", "-").toLowerCase()}.theme.css`, { type: "text/plain" }));
					}
				}
			}
		},
		"Download CSS"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			style: { width: "100%" },
			onClick: () => {
				openModal((props) => BdApi.React.createElement("div", { className: `colorwaysPreview-modal ${props.transitionState == 2 ? "closing" : ""} ${props.transitionState == 4 ? "hidden" : ""}` }, BdApi.React.createElement("style", null, colorway.isGradient ? pureGradientBase + `.colorwaysPreview-modal,.colorwaysPreview-wrapper {--gradient-theme-bg: linear-gradient(${colorway.linearGradient})}` : ""), BdApi.React.createElement(
					ThemePreview,
					{
						accent: colorway.accent,
						primary: colorway.primary,
						secondary: colorway.secondary,
						tertiary: colorway.tertiary,
						isModal: true,
						modalProps: props
					}
				)));
			}
		},
		"Show preview"
	), colorway.sourceType === "offline" && BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			style: { width: "100%" },
			onClick: async () => {
				const oldStores = (await DataStore.get("customColorways")).filter((source) => source.name !== colorway.source);
				const storeToModify = (await DataStore.get("customColorways")).filter((source) => source.name === colorway.source)[0];
				const newStore = { name: storeToModify.name, colorways: storeToModify.colorways.filter((colorway2) => colorway2.name !== colorway2.name) };
				DataStore.set("customColorways", [...oldStores, newStore]);
				if ((await DataStore.get("activeColorwayObject")).id === colorway.name) {
					DataStore.set("activeColorwayObject", { id: null, css: null, sourceType: null, source: null });
					ColorwayCSS.remove();
				}
				modalProps.onClose();
				loadUIProps();
			}
		},
		"Delete"
	)))));
}

function UseRepainterThemeModal({ modalProps, onFinish }) {
	const [colorwaySourceURL, setColorwaySourceURL] = React.useState("");
	const [URLError, setURLError] = React.useState("");
	const [theme, setTheme] = React.useState("discord");
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
	}, []);
	return BdApi.React.createElement("div", { className: `colorwaysModal ${modalProps.transitionState == 2 ? "closing" : ""} ${modalProps.transitionState == 4 ? "hidden" : ""}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "colorwaysModalHeader" }, "Use Repainter theme"), BdApi.React.createElement("div", { className: "colorwaysModalContent" }, BdApi.React.createElement("span", { className: "colorwaysModalSectionHeader" }, "URL: ", URLError ? BdApi.React.createElement("span", { className: "colorwaysModalSectionError" }, URLError) : BdApi.React.createElement(BdApi.React.Fragment, null)), BdApi.React.createElement(
		"input",
		{
			type: "text",
			placeholder: "Enter a valid URL...",
			onInput: (e) => {
				setColorwaySourceURL(e.currentTarget.value);
			},
			value: colorwaySourceURL,
			className: "colorwayTextBox"
		}
	)), BdApi.React.createElement("div", { className: "colorwaysModalFooter" }, BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton colorwaysPillButton-onSurface",
			onClick: async () => {
				getRepainterTheme(colorwaySourceURL).then((data) => {
					onFinish({ id: data.id, colors: data.colors });
					modalProps.onClose();
				}).catch((e) => setURLError("Error: " + e));
			}
		},
		"Finish"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => modalProps.onClose()
		},
		"Cancel"
	)));
}

function FiltersMenu({ sort, onSortChange }) {
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
	function onSortChange_internal(newSort) {
		onSortChange(newSort);
		setShowMenu(false);
	}
	return BdApi.React.createElement(BdApi.React.Fragment, null, showMenu ? BdApi.React.createElement("nav", { className: "colorwaysContextMenu", style: {
		position: "fixed",
		top: `${pos.y}px`,
		left: `${pos.x}px`
	} }, BdApi.React.createElement("button", { onClick: () => onSortChange_internal(1), className: "colorwaysContextMenuItm" }, "Name (A-Z)", BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "18", height: "18", viewBox: "0 0 24 24", style: {
		marginLeft: "8px"
	} }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), sort == 1 ? BdApi.React.createElement("circle", { className: "colorwaysRadioSelected", cx: "12", cy: "12", r: "5" }) : null)), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(2), className: "colorwaysContextMenuItm" }, "Name (Z-A)", BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "18", height: "18", viewBox: "0 0 24 24", style: {
		marginLeft: "8px"
	} }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), sort == 2 ? BdApi.React.createElement("circle", { className: "colorwaysRadioSelected", cx: "12", cy: "12", r: "5" }) : null)), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(3), className: "colorwaysContextMenuItm" }, "Source (A-Z)", BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "18", height: "18", viewBox: "0 0 24 24", style: {
		marginLeft: "8px"
	} }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), sort == 3 ? BdApi.React.createElement("circle", { className: "colorwaysRadioSelected", cx: "12", cy: "12", r: "5" }) : null)), BdApi.React.createElement("button", { onClick: () => onSortChange_internal(4), className: "colorwaysContextMenuItm" }, "Source (Z-A)", BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "18", height: "18", viewBox: "0 0 24 24", style: {
		marginLeft: "8px"
	} }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), sort == 4 ? BdApi.React.createElement("circle", { className: "colorwaysRadioSelected", cx: "12", cy: "12", r: "5" }) : null))) : null, BdApi.React.createElement("button", { className: "colorwaysPillButton", onClick: rightClickContextMenu }, BdApi.React.createElement(SortIcon, { width: 14, height: 14 }), " Sort By..."));
}

function SourcesMenu({ source, sources, onSourceChange }) {
	const menuProps = React.useRef(null);
	const [pos, setPos] = React.useState({ x: 0, y: 0 });
	const [showMenu, setShowMenu] = React.useState(false);
	const [current, setCurrent] = React.useState(source);
	function rightClickContextMenu(e) {
		e.stopPropagation();
		window.dispatchEvent(new Event("click"));
		setShowMenu(!showMenu);
		setPos({
			x: e.currentTarget.getBoundingClientRect().x,
			y: e.currentTarget.getBoundingClientRect().y + e.currentTarget.offsetHeight + 8
		});
	}
	function onPageClick() {
		setShowMenu(false);
	}
	React.useEffect(() => {
		window.addEventListener("click", onPageClick);
		return () => {
			window.removeEventListener("click", onPageClick);
		};
	}, []);
	function onSourceChange_internal(newSort) {
		onSourceChange(newSort.id);
		setCurrent(newSort);
		setShowMenu(false);
	}
	return BdApi.React.createElement(BdApi.React.Fragment, null, showMenu ? BdApi.React.createElement("nav", { className: "colorwaysContextMenu", ref: menuProps, style: {
		position: "fixed",
		top: `${pos.y}px`,
		left: `${pos.x}px`
	} }, sources.map(({ name, id }) => {
		return BdApi.React.createElement("button", { onClick: () => onSourceChange_internal({ name, id }), className: "colorwaysContextMenuItm" }, name, BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "18", height: "18", viewBox: "0 0 24 24", style: {
			marginLeft: "8px"
		} }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), source.id == id ? BdApi.React.createElement("circle", { className: "colorwaysRadioSelected", cx: "12", cy: "12", r: "5" }) : null));
	})) : null, BdApi.React.createElement("button", { className: "colorwaysPillButton", onClick: rightClickContextMenu }, "Source: ", current.name));
}

function ReloadButton({ onClick, onForceReload }) {
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
	function onForceReload_internal() {
		onForceReload();
		setShowMenu(false);
	}
	return BdApi.React.createElement(BdApi.React.Fragment, null, showMenu ? BdApi.React.createElement("nav", { className: "colorwaysContextMenu", ref: menuProps, style: {
		position: "fixed",
		top: `${pos.y}px`,
		left: `${pos.x}px`
	} }, BdApi.React.createElement("button", { onClick: onForceReload_internal, className: "colorwaysContextMenuItm" }, "Force Refresh", BdApi.React.createElement(
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
	))) : null, BdApi.React.createElement("button", { className: "colorwaysPillButton", onContextMenu: rightClickContextMenu, onClick }, BdApi.React.createElement(
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

function Selector({
	settings = { selectorType: "normal" },
	hasTheme = false
}) {
	const [colorwayData, setColorwayData] = React.useState([]);
	const [searchValue, setSearchValue] = React.useState("");
	const [sortBy, setSortBy] = React.useState(SortOptions.NAME_AZ);
	const [activeColorwayObject, setActiveColorwayObject] = React.useState(nullColorwayObj);
	const [customColorwayData, setCustomColorwayData] = React.useState([]);
	const [loaderHeight, setLoaderHeight] = React.useState("2px");
	const [visibleSources, setVisibleSources] = React.useState("all");
	const [selectedColorways, setSelectedColorways] = React.useState([]);
	const [errorCode, setErrorCode] = React.useState(0);
	const [wsConnected, setWsConnected] = React.useState(wsOpen);
	const [theme, setTheme] = React.useState("discord");
	const [isManager, setManager] = React.useState(hasManagerRole);
	React.useEffect(() => {
		async function load() {
			setTheme(await DataStore.get("colorwaysPluginTheme"));
		}
		load();
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_WS_CONNECTED", ({ isConnected }) => setWsConnected(isConnected));
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_ACTIVE_COLORWAY", ({ active }) => setActiveColorwayObject(active));
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_WS_MANAGER_ROLE", ({ isManager: isManager2 }) => setManager(isManager2));
		return () => {
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_WS_CONNECTED", ({ isConnected }) => setWsConnected(isConnected));
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_ACTIVE_COLORWAY", ({ active }) => setActiveColorwayObject(active));
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_WS_MANAGER_ROLE", ({ isManager: isManager2 }) => setManager(isManager2));
		};
	}, [isManager]);
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
	async function loadUI(force) {
		setActiveColorwayObject(await DataStore.get("activeColorwayObject"));
		setLoaderHeight("0px");
		if (settings.previewSource) {
			const res = await fetch(settings.previewSource);
			const dataPromise = res.json().then((data2) => data2).catch(() => ({ colorways: [], errorCode: 1, errorMsg: "Colorway Source format is invalid" }));
			const data = await dataPromise;
			if (data.errorCode) {
				setErrorCode(data.errorCode);
			}
			const colorwayList = data.css ? data.css.map((customStore) => customStore.colorways).flat() : data.colorways;
			setColorwayData([{ colorways: colorwayList || [], source: res.url, type: "online" }]);
		} else {
			setCustomColorwayData((await DataStore.get("customColorways")).map((colorSrc) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
			const onlineSources = await DataStore.get("colorwaySourceFiles");
			const responses = await Promise.all(
				onlineSources.map(
					(source) => fetch(source.url, force ? { cache: "no-store" } : {})
				)
			);
			setColorwayData(await Promise.all(
				responses.map((res, i) => ({ response: res, name: onlineSources[i].name })).map(
					(res) => res.response.json().then((dt) => ({ colorways: dt.colorways, source: res.name, type: "online" })).catch(() => ({ colorways: [], source: res.name, type: "online" }))
				)
			));
		}
	}
	React.useEffect(() => {
		loadUI();
	}, [searchValue]);
	function Header({ children }) {
		if (hasTheme) return BdApi.React.createElement("div", { className: "colorwayModal-selectorHeader", "data-theme": theme }, children);
		else return BdApi.React.createElement("div", { className: "colorwayModal-selectorHeader" }, children);
	}
	function Container({ children }) {
		if (hasTheme) return BdApi.React.createElement("div", { style: { maxHeight: settings.selectorType === "multiple-selection" ? "50%" : "unset" }, className: "ColorwaySelectorWrapper", "data-theme": theme }, children);
		else return BdApi.React.createElement("div", { style: { maxHeight: settings.selectorType === "multiple-selection" ? "50%" : "unset" }, className: "ColorwaySelectorWrapper" }, children);
	}
	return BdApi.React.createElement(BdApi.React.Fragment, null, settings.selectorType !== "preview" && (!wsConnected || wsConnected && isManager) ? BdApi.React.createElement(Header, null, BdApi.React.createElement(
		"input",
		{
			type: "text",
			className: "colorwayTextBox",
			placeholder: "Search for Colorways...",
			value: searchValue,
			autoFocus: true,
			onInput: ({ currentTarget: { value } }) => setSearchValue(value)
		}
	), BdApi.React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } }, BdApi.React.createElement(ReloadButton, { onClick: () => {
		setLoaderHeight("2px");
		loadUI().then(() => setLoaderHeight("0px"));
	}, onForceReload: () => {
		setLoaderHeight("2px");
		loadUI(true).then(() => setLoaderHeight("0px"));
	} }), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: () => {
				openModal((props) => BdApi.React.createElement(
					CreatorModal,
					{
						modalProps: props,
						loadUIProps: loadUI
					}
				));
			}
		},
		BdApi.React.createElement(PlusIcon, { width: 14, height: 14, style: { boxSizing: "content-box" } }),
		"Create"
	), BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			id: "colorway-userepaintertheme",
			onClick: () => {
				openModal((props) => BdApi.React.createElement(UseRepainterThemeModal, { modalProps: props, onFinish: async ({ id, colors }) => {
					const demandedColorway = generateCss(colors[7].replace("#", ""), colors[11].replace("#", ""), colors[14].replace("#", ""), colors[16].replace("#", ""));
					ColorwayCSS.set(demandedColorway);
					const newObj = {
						id,
						css: demandedColorway,
						sourceType: "temporary",
						source: "Repainter",
						colors: {
							accent: colors[16],
							primary: colors[2],
							secondary: colors[5],
							tertiary: colors[8]
						}
					};
					DataStore.set("activeColorwayObject", newObj);
					setActiveColorwayObject(newObj);
				} }));
			}
		},
		BdApi.React.createElement(PalleteIcon, { width: 14, height: 14, style: { boxSizing: "content-box" } }),
		"Use Repainter theme"
	), BdApi.React.createElement(FiltersMenu, { sort: sortBy, onSortChange: (newSort) => {
		setSortBy(newSort);
	} }), BdApi.React.createElement(SourcesMenu, { source: filters.filter((filter) => filter.id == visibleSources)[0], sources: filters, onSourceChange: (sourceId) => {
		setVisibleSources(sourceId);
	} }))) : BdApi.React.createElement(BdApi.React.Fragment, null), wsConnected && settings.selectorType == "normal" && !isManager ? BdApi.React.createElement("span", { style: {
		color: "#fff",
		margin: "auto",
		fontWeight: "bold",
		display: "flex",
		gap: "8px",
		alignItems: "center"
	} }, BdApi.React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "40", height: "40", fill: "currentColor", viewBox: "0 0 16 16", style: {
		transform: "scaleX(1.2)"
	} }, BdApi.React.createElement("path", { d: "M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2" })), "Manager is controlling the colorways", BdApi.React.createElement(
		"button",
		{
			className: "colorwaysPillButton",
			onClick: requestManagerRole
		},
		"Request Manager"
	)) : BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("div", { className: "colorwaysLoader-barContainer" }, BdApi.React.createElement("div", { className: "colorwaysLoader-bar", style: { height: loaderHeight } })), BdApi.React.createElement(Container, null, activeColorwayObject.sourceType === "temporary" && settings.selectorType === "normal" && settings.selectorType === "normal" && BdApi.React.createElement(
		"div",
		{
			className: "discordColorway",
			id: "colorway-Temporary",
			"aria-checked": activeColorwayObject.id === "Auto" && activeColorwayObject.source === null,
			onClick: async () => {
				DataStore.set("activeColorwayObject", nullColorwayObj);
				setActiveColorwayObject(nullColorwayObj);
				ColorwayCSS.remove();
			}
		},
		BdApi.React.createElement("div", { className: "discordColorwayPreviewColorContainer" }, BdApi.React.createElement(
			"div",
			{
				className: "discordColorwayPreviewColor",
				style: { backgroundColor: "var(--brand-500)" }
			}
		), BdApi.React.createElement(
			"div",
			{
				className: "discordColorwayPreviewColor",
				style: { backgroundColor: "var(--background-primary)" }
			}
		), BdApi.React.createElement(
			"div",
			{
				className: "discordColorwayPreviewColor",
				style: { backgroundColor: "var(--background-secondary)" }
			}
		), BdApi.React.createElement(
			"div",
			{
				className: "discordColorwayPreviewColor",
				style: { backgroundColor: "var(--background-tertiary)" }
			}
		)),
		BdApi.React.createElement("span", { className: "colorwayLabel" }, "Temporary Colorway"),
		BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-onSurface",
				onClick: async (e) => {
					e.stopPropagation();
					openModal((props) => BdApi.React.createElement(CreatorModal, { modalProps: props, colorwayID: `#${colorToHex(getHex(getComputedStyle(document.body).getPropertyValue("--brand-500")))},#${colorToHex(getHex(getComputedStyle(document.body).getPropertyValue("--primary-600")))},#${colorToHex(getHex(getComputedStyle(document.body).getPropertyValue("--primary-630")))},#${colorToHex(getHex(getComputedStyle(document.body).getPropertyValue("--primary-700")))}`, loadUIProps: loadUI }));
				}
			},
			BdApi.React.createElement(PlusIcon, { width: 20, height: 20 })
		)
	), getComputedStyle(document.body).getPropertyValue("--os-accent-color") && ["all", "official"].includes(visibleSources) && settings.selectorType === "normal" && "auto".includes(searchValue.toLowerCase()) ? BdApi.React.createElement(
		"div",
		{
			className: "discordColorway",
			id: "colorway-Auto",
			"aria-checked": activeColorwayObject.id === "Auto" && activeColorwayObject.source === null,
			onClick: async () => {
				const activeAutoPreset = await DataStore.get("activeAutoPreset");
				if (activeColorwayObject.id === "Auto") {
					if (isManager) {
						sendColorway(nullColorwayObj);
					} else {
						DataStore.set("activeColorwayObject", nullColorwayObj);
						setActiveColorwayObject(nullColorwayObj);
						ColorwayCSS.remove();
					}
				} else {
					if (!activeAutoPreset) {
						openModal((props) => BdApi.React.createElement(AutoColorwaySelector, { autoColorwayId: "", modalProps: props, onChange: (autoPresetId) => {
							const { colors } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[autoPresetId];
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
									colors.primary,
									colors.secondary,
									colors.tertiary,
									colors.accent,
									true,
									true,
									void 0,
									"Auto Colorway"
								));
								DataStore.set("activeColorwayObject", newObj);
								setActiveColorwayObject(newObj);
							}
						} }));
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
								colors.primary,
								colors.secondary,
								colors.tertiary,
								colors.accent,
								true,
								true,
								void 0,
								"Auto Colorway"
							));
							DataStore.set("activeColorwayObject", newObj);
							setActiveColorwayObject(newObj);
						}
					}
				}
			}
		},
		BdApi.React.createElement("div", { className: "discordColorwayPreviewColorContainer", style: { backgroundColor: "var(--os-accent-color)" } }),
		BdApi.React.createElement("span", { className: "colorwayLabel" }, "Auto Colorway"),
		BdApi.React.createElement(
			"button",
			{
				className: "colorwaysPillButton colorwaysPillButton-onSurface",
				onClick: async (e) => {
					e.stopPropagation();
					const activeAutoPreset = await DataStore.get("activeAutoPreset");
					openModal((props) => BdApi.React.createElement(AutoColorwaySelector, { autoColorwayId: activeAutoPreset, modalProps: props, onChange: (autoPresetId) => {
						if (activeColorwayObject.id === "Auto") {
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
									colors.primary,
									colors.secondary,
									colors.tertiary,
									colors.accent,
									true,
									true,
									void 0,
									"Auto Colorway"
								));
								DataStore.set("activeColorwayObject", newObj);
								setActiveColorwayObject(newObj);
							}
						}
					} }));
				}
			},
			BdApi.React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", style: { margin: "4px" }, viewBox: "0 0 24 24", fill: "currentColor" }, BdApi.React.createElement("path", { d: "M 21.2856,9.6 H 24 v 4.8 H 21.2868 C 20.9976,15.5172 20.52,16.5576 19.878,17.4768 L 21.6,19.2 19.2,21.6 17.478,19.8768 c -0.9216,0.642 -1.9596,1.1208 -3.078,1.4088 V 24 H 9.6 V 21.2856 C 8.4828,20.9976 7.4436,20.5188 6.5232,19.8768 L 4.8,21.6 2.4,19.2 4.1232,17.4768 C 3.4812,16.5588 3.0024,15.5184 2.7144,14.4 H 0 V 9.6 H 2.7144 C 3.0024,8.4816 3.48,7.4424 4.1232,6.5232 L 2.4,4.8 4.8,2.4 6.5232,4.1232 C 7.4424,3.48 8.4816,3.0024 9.6,2.7144 V 0 h 4.8 v 2.7132 c 1.1184,0.2892 2.1564,0.7668 3.078,1.4088 l 1.722,-1.7232 2.4,2.4 -1.7232,1.7244 c 0.642,0.9192 1.1208,1.9596 1.4088,3.0768 z M 12,16.8 c 2.65092,0 4.8,-2.14908 4.8,-4.8 0,-2.650968 -2.14908,-4.8 -4.8,-4.8 -2.650968,0 -4.8,2.149032 -4.8,4.8 0,2.65092 2.149032,4.8 4.8,4.8 z" }))
		)
	) : BdApi.React.createElement(BdApi.React.Fragment, null), (!getComputedStyle(document.body).getPropertyValue("--os-accent-color") || !["all", "official"].includes(visibleSources)) && !filters.filter((filter) => filter.id === visibleSources)[0].sources.map((source) => source.colorways).flat().length ? BdApi.React.createElement("span", { style: {
		color: "#fff",
		margin: "auto",
		fontWeight: "bold",
		display: "flex",
		gap: "8px",
		alignItems: "center"
	} }, "No colorways...") : BdApi.React.createElement(BdApi.React.Fragment, null), errorCode !== 0 && BdApi.React.createElement("span", { style: {
		color: "#fff",
		margin: "auto",
		fontWeight: "bold",
		display: "flex",
		gap: "8px",
		alignItems: "center"
	} }, errorCode === 1 && "Error: Invalid Colorway Source Format. If this error persists, contact the source author to resolve the issue."), filters.map((filter) => filter.id).includes(visibleSources) && filters.filter((filter) => filter.id === visibleSources)[0].sources.map(({ colorways, source, type }) => colorways.map((colorway) => ({ ...colorway, sourceType: type, source, preset: colorway.preset || (colorway.isGradient ? "Gradient" : "Default") }))).flat().sort((a, b) => {
		switch (sortBy) {
			case SortOptions.NAME_AZ:
				return a.name.localeCompare(b.name);
			case SortOptions.NAME_ZA:
				return b.name.localeCompare(a.name);
			case SortOptions.SOURCE_AZ:
				return a.source.localeCompare(b.source);
			case SortOptions.SOURCE_ZA:
				return b.source.localeCompare(a.source);
			default:
				return a.name.localeCompare(b.name);
		}
	}).map((color) => {
		color.primary ??= "#313338";
		color.secondary ??= "#2b2d31";
		color.tertiary ??= "#1e1f22";
		color.accent ??= "#ffffff";
		color["dc-import"] = !color.isGradient ? generateCss(
			colorToHex(color.primary),
			colorToHex(color.secondary),
			colorToHex(color.tertiary),
			colorToHex(color.accent).slice(0, 6),
			true,
			false,
			void 0,
			color.name
		) : gradientBase(colorToHex(color.accent), true) + `:root:root {--custom-theme-background: linear-gradient(${color.linearGradient})}`;
		return color.name.toLowerCase().includes(searchValue.toLowerCase()) ? BdApi.React.createElement(
			"div",
			{
				className: "discordColorway",
				id: "colorway-" + color.name,
				"aria-checked": activeColorwayObject.id === color.name && activeColorwayObject.source === color.source,
				onClick: async () => {
					if (settings.selectorType === "normal") {
						if (activeColorwayObject.id === color.name && activeColorwayObject.source === color.source) {
							if (isManager) {
								sendColorway(nullColorwayObj);
							} else {
								DataStore.set("activeColorwayObject", nullColorwayObj);
								setActiveColorwayObject(nullColorwayObj);
								ColorwayCSS.remove();
							}
						} else {
							const newObj = {
								id: color.name,
								sourceType: color.type,
								source: color.source,
								colors: {
									accent: color.accent,
									primary: color.primary,
									secondary: color.secondary,
									tertiary: color.tertiary
								}
							};
							if (color.linearGradient) newObj.linearGradient = color.linearGradient;
							if (isManager) sendColorway(newObj);
							else {
								ColorwayCSS.set(color["dc-import"]);
								setActiveColorwayObject(newObj);
								DataStore.set("activeColorwayObject", newObj);
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
			BdApi.React.createElement("span", { className: "colorwayLabel" }, color.name),
			settings.selectorType === "normal" && BdApi.React.createElement(
				"button",
				{
					className: "colorwaysPillButton colorwaysPillButton-onSurface",
					onClick: (e) => {
						e.stopPropagation();
						openModal((props) => BdApi.React.createElement(
							InfoModal,
							{
								modalProps: props,
								colorway: color,
								loadUIProps: loadUI
							}
						));
					}
				},
				BdApi.React.createElement(
					"svg",
					{
						xmlns: "http://www.w3.org/2000/svg",
						width: "20",
						height: "20",
						fill: "currentColor",
						viewBox: "0 0 16 16"
					},
					BdApi.React.createElement("path", { d: "m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" })
				)
			),
			BdApi.React.createElement(
				"button",
				{
					className: "colorwaysPillButton colorwaysPillButton-onSurface",
					onClick: async (e) => {
						e.stopPropagation();
						navigator.clipboard.writeText(color["dc-import"]);
						Toasts.show({
							message: "Copied Colorway CSS Successfully",
							type: 1,
							id: "copy-colorway-css-notify"
						});
					}
				},
				BdApi.React.createElement(CodeIcon, { width: 20, height: 20 })
			),
			BdApi.React.createElement(
				"button",
				{
					className: "colorwaysPillButton colorwaysPillButton-onSurface",
					onClick: async (e) => {
						e.stopPropagation();
						const colorwayIDArray = `${color.accent},${color.primary},${color.secondary},${color.tertiary}|n:${color.name}${color.preset ? `|p:${color.preset}` : ""}`;
						const colorwayID = stringToHex(colorwayIDArray);
						navigator.clipboard.writeText(colorwayID);
						Toasts.show({
							message: "Copied Colorway ID Successfully",
							type: 1,
							id: "copy-colorway-id-notify"
						});
					}
				},
				BdApi.React.createElement(IDIcon, { width: 20, height: 20 })
			),
			color.sourceType === "offline" && settings.selectorType !== "preview" && BdApi.React.createElement(
				"button",
				{
					className: "colorwaysPillButton colorwaysPillButton-onSurface",
					onClick: async (e) => {
						e.stopPropagation();
						const oldStores = (await DataStore.get("customColorways")).filter((sourcee) => sourcee.name !== color.source);
						const storeToModify = (await DataStore.get("customColorways")).filter((sourcee) => sourcee.name === color.source)[0];
						const newStore = { name: storeToModify.name, colorways: storeToModify.colorways.filter((colorway) => colorway.name !== color.name) };
						DataStore.set("customColorways", [...oldStores, newStore]);
						setCustomColorwayData([...oldStores, newStore].map((colorSrc) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
						if ((await DataStore.get("activeColorwayObject")).id === color.name) {
							DataStore.set("activeColorwayObject", nullColorwayObj);
							setActiveColorwayObject(nullColorwayObj);
							ColorwayCSS.remove();
						}
						updateRemoteSources();
					}
				},
				BdApi.React.createElement(DeleteIcon, { width: 20, height: 20 })
			)
		) : BdApi.React.createElement(BdApi.React.Fragment, null);
	}))));
}

async function defaultsLoader() {
	const [
		customColorways,
		colorwaySourceFiles,
		showColorwaysButton,
		activeColorwayObject,
		colorwaysPluginTheme,
		colorwaysBoundManagers,
		colorwaysManagerAutoconnectPeriod,
		colorwaysManagerDoAutoconnect
	] = await DataStore.getMany([
		"customColorways",
		"colorwaySourceFiles",
		"showColorwaysButton",
		"activeColorwayObject",
		"colorwaysPluginTheme",
		"colorwaysBoundManagers",
		"colorwaysManagerAutoconnectPeriod",
		"colorwaysManagerDoAutoconnect"
	]);
	const defaults = [
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
		}
	];
	defaults.forEach(({ name, value, default: def }) => {
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

function Tooltip({
	children,
	text,
	position = "top"
}) {
	const [visible, setVisible] = React.useState(false);
	const [pos, setPos] = React.useState({ x: 0, y: 0 });
	const btn = React.useRef(null);
	function showTooltip() {
		setPos({
			x: btn.current.children[0].getBoundingClientRect().x + btn.current.children[0].offsetWidth + 8,
			y: btn.current.children[0].getBoundingClientRect().y
		});
		setVisible(true);
	}
	function onWindowUnfocused(e) {
		e = e ? e : window.event;
		var from = e.relatedTarget || e.toElement;
		if (!from || from.nodeName == "HTML") {
			setVisible(false);
		}
	}
	React.useEffect(() => {
		document.addEventListener("mouseout", onWindowUnfocused);
		return () => {
			document.removeEventListener("mouseout", onWindowUnfocused);
		};
	}, []);
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("div", { ref: btn, style: {
		display: "contents"
	} }, children({
		onMouseEnter: () => showTooltip(),
		onMouseLeave: () => setVisible(false),
		onClick: () => setVisible(false)
	})), BdApi.React.createElement("div", { className: `colorwaysTooltip colorwaysTooltip-${position} ${!visible ? "colorwaysTooltip-hidden" : ""}`, style: {
		top: `${pos.y}px`,
		left: `${pos.x}px`
	} }, BdApi.React.createElement("div", { className: "colorwaysTooltipPointer" }), BdApi.React.createElement("div", { className: "colorwaysTooltipContent" }, text)));
}

function ColorwaysButton() {
	const [activeColorway, setActiveColorway] = React.useState("None");
	const [visibility, setVisibility] = React.useState(true);
	const [isThin, setIsThin] = React.useState(false);
	const [autoPreset, setAutoPreset] = React.useState("hueRotation");
	React.useEffect(() => {
		(async function() {
			setVisibility(await DataStore.get("showColorwaysButton"));
			setIsThin(await DataStore.get("useThinMenuButton"));
			setAutoPreset(await DataStore.get("activeAutoPreset"));
		})();
		FluxDispatcher.subscribe("COLORWAYS_UPDATE_BUTTON_VISIBILITY", ({ isVisible }) => setVisibility(isVisible));
		return () => {
			FluxDispatcher.unsubscribe("COLORWAYS_UPDATE_BUTTON_VISIBILITY", ({ isVisible }) => setVisibility(isVisible));
		};
	});
	return BdApi.React.createElement(
		Tooltip,
		{
			text: BdApi.React.createElement(BdApi.React.Fragment, null, !isThin ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("span", null, "Colorways"), BdApi.React.createElement("span", { style: { color: "var(--text-muted)", fontWeight: 500, fontSize: 12 } }, "Active Colorway: " + activeColorway)) : BdApi.React.createElement("span", null, "Active Colorway: " + activeColorway), activeColorway === "Auto" ? BdApi.React.createElement("span", { style: { color: "var(--text-muted)", fontWeight: 500, fontSize: 12 } }, "Auto Preset: " + (getAutoPresets()[autoPreset].name || "None")) : BdApi.React.createElement(BdApi.React.Fragment, null)),
			position: "right"
		},
		({ onMouseEnter, onMouseLeave, onClick }) => visibility || PluginProps.clientMod === "BetterDiscord" ? BdApi.React.createElement("div", { className: "ColorwaySelectorBtnContainer" }, BdApi.React.createElement(
			"div",
			{
				className: "ColorwaySelectorBtn" + (isThin ? " ColorwaySelectorBtn_thin" : ""),
				onMouseEnter: async () => {
					onMouseEnter();
					setActiveColorway((await DataStore.get("activeColorwayObject")).id || "None");
					setAutoPreset(await DataStore.get("activeAutoPreset"));
				},
				onMouseLeave,
				onClick: () => {
					onClick();
					openModal((props) => BdApi.React.createElement(Selector$1, { modalProps: props }));
				}
			},
			isThin ? BdApi.React.createElement("span", { style: { color: "var(--header-primary)", fontWeight: 700, fontSize: 9 } }, "Colorways") : BdApi.React.createElement(PalleteIcon, null)
		)) : BdApi.React.createElement(BdApi.React.Fragment, null)
	);
}

const DataStore = {
	get: async (key) => {
		return getSetting(key);
	},
	set: async (key, value) => {
		saveSettings({ [key]: value });
	},
	getMany: async (keys) => {
		return getBulkSetting(...keys);
	}
};
const PluginProps = {
	pluginVersion: "6.2.0",
	clientMod: "BetterDiscord",
	UIVersion: "2.1.0",
	creatorVersion: "1.20"
};
defaultsLoader();
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
	settingsSection = [
		{
			section: "DIVIDER"
		},
		{
			section: "HEADER",
			label: "Discord Colorways",
			className: "vc-settings-header"
		},
		{
			section: "ColorwaysSelector",
			label: "Colorways",
			element: () => BdApi.React.createElement(Selector, { hasTheme: true }),
			className: "dc-colorway-selector"
		},
		{
			section: "ColorwaysSettings",
			label: "Settings",
			element: () => BdApi.React.createElement(SettingsPage, { hasTheme: true }),
			className: "dc-colorway-settings"
		},
		{
			section: "ColorwaysSourceManager",
			label: "Sources",
			element: () => BdApi.React.createElement(SourceManager, { hasTheme: true }),
			className: "dc-colorway-sources-manager"
		},
		{
			section: "ColorwaysStore",
			label: "Store",
			element: () => BdApi.React.createElement(Store, { hasTheme: true }),
			className: "dc-colorway-store"
		}
	];
	async start() {
		betterdiscord.DOM.addStyle(css$1);
		betterdiscord.DOM.addStyle(css);
		ColorwayCSS$1.set(getSetting("activeColorwayObject").css);
		betterdiscord.Patcher.after(
			GuildsNav,
			"type",
			(cancel, result, ...args) => {
				const target = queryTree(args[0], (node) => node?.props?.className?.split(" ").includes(guildStyles.guilds));
				if (!target) {
					return console.error("Unable to find chain patch target");
				}
				hookFunctionComponent(target, (result2) => {
					const scroller = queryTree(result2, (node) => node?.props?.className?.split(" ").includes(treeStyles.scroller));
					if (!scroller) {
						return console.error("Unable to find scroller");
					}
					const { children } = scroller.props;
					children.splice(children.indexOf(children.filter((child) => {
						if (child !== null && !Array.isArray(child) && child.type && typeof child.type == "function" && child.type.toString().includes("guildSeparator")) {
							return true;
						}
					})[0]) + 1, 0, BdApi.React.createElement(ColorwaysButton, null));
				});
			}
		);
		betterdiscord.DOM.addStyle(css$1 + css);
		triggerRerender();
		const [colorwaysManagerAutoconnectPeriod, colorwaysManagerDoAutoconnect] = getBulkSetting("colorwaysManagerAutoconnectPeriod", "colorwaysManagerDoAutoconnect");
		connect(colorwaysManagerDoAutoconnect, colorwaysManagerAutoconnectPeriod);
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
exports.DataStore = DataStore;
exports.FluxDispatcher = FluxDispatcher;
exports.PluginProps = PluginProps;
exports.Toasts = Toasts;
exports["default"] = DiscordColorways;
exports.openModal = openModal;
exports.useStateFromStores = useStateFromStores;

/*@end@*/