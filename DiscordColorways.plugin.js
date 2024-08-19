/**
 * @name DiscordColorways
 * @author DaBluLite
 * @description A plugin that offers easy access to simple color schemes/themes for Discord, also known as Colorways
 * @version 5.7.0
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
		if (typeof m !== "function")
			return false;
		const s = Function.prototype.toString.call(m);
		for (const c of code) {
			if (!s.includes(c))
				return false;
		}
		return true;
	},
	componentByCode: (...code) => {
		const filter = Filters.byCode(...code);
		return (m) => {
			if (filter(m))
				return true;
			if (!m.$$typeof)
				return false;
			if (m.type && m.type.render)
				return filter(m.type.render);
			if (m.type)
				return filter(m.type);
			if (m.render)
				return filter(m.render);
			return false;
		};
	}
};
function findComponentByCodeLazy(...code) {
	return LazyComponent(() => {
		const res = Webpack.getModule(Filters.componentByCode(...code));
		if (!res)
			handleModuleNotFound("findComponentByCode", ...code);
		return res;
	});
}
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
		if (fromCache)
			return Promise.resolve(fromCache);
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
						if (!wrappedExport)
							continue;
						if (wrappedFilter(wrappedExport))
							foundModule = wrappedExport;
					}
				} else {
					if (exports.Z && wrappedFilter(exports.Z))
						foundModule = defaultExport ? exports.Z : exports;
					if (exports.ZP && wrappedFilter(exports.ZP))
						foundModule = defaultExport ? exports.ZP : exports;
					if (exports.__esModule && exports.default && wrappedFilter(exports.default))
						foundModule = defaultExport ? exports.default : exports;
					if (wrappedFilter(exports))
						foundModule = exports;
				}
				if (!foundModule)
					return;
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
const ColorwayCSS = {
	get: () => document.getElementById("activeColorwayCSS").textContent || "",
	set: (e) => {
		if (!document.getElementById("activeColorwayCSS")) {
			document.head.append(Object.assign(document.createElement("style"), {
				id: "activeColorwayCSS",
				textContent: e
			}));
		} else
			document.getElementById("activeColorwayCSS").textContent = e;
	},
	remove: () => document.getElementById("activeColorwayCSS").remove()
};
var DiscordNative = window.DiscordNative;
function hslToHex(h, s, l) {
	h /= 360;
	s /= 100;
	l /= 100;
	let r, g, b;
	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p2, q2, t) => {
			if (t < 0)
				t += 1;
			if (t > 1)
				t -= 1;
			if (t < 1 / 6)
				return p2 + (q2 - p2) * 6 * t;
			if (t < 1 / 2)
				return q2;
			if (t < 2 / 3)
				return p2 + (q2 - p2) * (2 / 3 - t) * 6;
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
		color = hslToHex(
			Number(color.split(" ")[0]),
			Number(color.split(" ")[1]),
			Number(color.split(" ")[2])
		);
	}
	if (colorType === "rgb") {
		color = rgbToHex(
			Number(color.split(" ")[0]),
			Number(color.split(" ")[1]),
			Number(color.split(" ")[2])
		);
	}
	return color.replace("#", "");
}
function makeLazy(factory, attempts = 5) {
	let tries = 0;
	let cache;
	return () => {
		if (!cache && attempts > tries++) {
			cache = factory();
			if (!cache && attempts === tries)
				console.error("Lazy factory failed:", factory);
		}
		return cache;
	};
}
const NoopComponent = () => null;
function LazyComponent(factory, attempts = 5) {
	const get = makeLazy(factory, attempts);
	const LazyComponent2 = (props) => {
		const Component = get() ?? NoopComponent;
		return BdApi.React.createElement(Component, { ...props });
	};
	LazyComponent2.$$vencordInternal = get;
	return LazyComponent2;
}
function handleModuleNotFound(method, ...filter) {
	const err = new Error(`webpack.${method} found no module`);
	console.error(err, "Filter:", filter);
}
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
		if (!keys.includes(key))
			keys.push(key);
	}
	return keys;
};
handler.getOwnPropertyDescriptor = (target, p) => {
	if (typeof p === "string" && unconfigurable.includes(p))
		return Reflect.getOwnPropertyDescriptor(target, p);
	const descriptor = Reflect.getOwnPropertyDescriptor(target[kGET](), p);
	if (descriptor)
		Object.defineProperty(target, p, descriptor);
	return descriptor;
};
function proxyLazy(factory, attempts = 5, isChild = false) {
	let isSameTick = true;
	if (!isChild)
		setTimeout(() => isSameTick = false, 0);
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
const {
	radioBar,
	item: radioBarItem,
	itemFilled: radioBarItemFilled,
	radioPositionLeft
} = Webpack.getByKeys("radioBar");
const {
	useStateFromStores
} = proxyLazy(() => Webpack.getModule(Filters.byProps("useStateFromStores")));
let Clipboard;
let Forms = {};
let Card;
let Button;
let Switch;
let Tooltip;
let TextInput;
let TextArea;
let Text;
let Select;
let SearchableSelect;
let Slider;
let ButtonLooks;
let Popout;
let Dialog;
let TabBar;
let Paginator;
let ScrollerThin;
let Clickable;
let Avatar;
let FocusLock;
let useToken;
Webpack.getByKeys("open", "saveAccountChanges");
const Menu = { ...Webpack.getByKeys("MenuItem", "MenuSliderControl") };
let ColorPicker$1 = () => {
	return BdApi.React.createElement(Spinner, { className: "colorways-creator-module-warning" });
};
Webpack.waitForModule(Filters.byKeys("FormItem", "Button")).then((m) => {
	({
		useToken,
		Card,
		Button,
		FormSwitch: Switch,
		Tooltip,
		TextInput,
		TextArea,
		Text,
		Select,
		SearchableSelect,
		Slider,
		ButtonLooks,
		TabBar,
		Popout,
		Dialog,
		Paginator,
		ScrollerThin,
		Clickable,
		Avatar,
		FocusLock
	} = m);
	Forms = m;
});
Webpack.waitForModule(Filters.byStrings("showEyeDropper")).then(
	(e) => ColorPicker$1 = e
);
function Flex(props) {
	props.style ??= {};
	props.style.display = "flex";
	props.style.gap ??= "1em";
	props.style.flexDirection ||= props.flexDirection;
	delete props.flexDirection;
	return BdApi.React.createElement("div", { ...props }, props.children);
}
let UserStore;
proxyLazy(
	() => Webpack.getByKeys("openUserProfileModal", "closeUserProfileModal")
);
proxyLazy(
	() => Webpack.getByKeys("getUser", "fetchCurrentUser")
);
const Modals = proxyLazy(() => Webpack.getByKeys("ModalRoot", "ModalCloseButton"));
const ModalRoot = LazyComponent(() => Modals.ModalRoot);
const ModalHeader = LazyComponent(() => Modals.ModalHeader);
const ModalContent = LazyComponent(() => Modals.ModalContent);
const ModalFooter = LazyComponent(() => Modals.ModalFooter);
const ModalCloseButton = LazyComponent(() => Modals.ModalCloseButton);
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
waitForStore("UserStore", (s) => UserStore = s);
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
	(e) => Clipboard = e
);
function SettingsTab$1({
	title,
	children,
	inModal
}) {
	return BdApi.React.createElement(Forms.FormSection, null, !inModal && BdApi.React.createElement(
		Text,
		{
			variant: "heading-lg/semibold",
			tag: "h2",
			style: { marginBottom: "16px" }
		},
		title
	), children);
}
function Link(props) {
	if (props.disabled) {
		props.style ??= {};
		props.style.pointerEvents = "none";
		props["aria-disabled"] = true;
	}
	return BdApi.React.createElement("a", { role: "link", target: "_blank", ...props }, props.children);
}
const ModalAPI = proxyLazy(() => Webpack.getByKeys("openModalLazy"));
function openModal(render, options, contextKey) {
	return ModalAPI.openModal(render, options, contextKey);
}
function closeModal(modalKey, contextKey) {
	return ModalAPI.closeModal(modalKey, contextKey);
}
let Parser;
Webpack.waitForModule(Filters.byKeys("parseTopic")).then((m) => Parser = m);
function classes(...classes2) {
	return classes2.filter(Boolean).join(" ");
}
var Theme = ((Theme2) => {
	Theme2[Theme2["Dark"] = 1] = "Dark";
	Theme2[Theme2["Light"] = 2] = "Light";
	return Theme2;
})(Theme || {});
const UserSettingsActionCreators = proxyLazy(() => Webpack.getByKeys("PreloadedUserSettingsActionCreators"));
function getTheme() {
	return UserSettingsActionCreators.PreloadedUserSettingsActionCreators.getCurrentValue()?.appearance?.theme;
}
function saveSettings(settings) {
	betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), ...settings });
}
function getSetting(setting) {
	return betterdiscord.Data.load("settings")[setting];
}
function getBulkSetting(...settings) {
	return settings.map((setting) => betterdiscord.Data.load("settings")[setting]);
}

const name = "DiscordColorways";
const author = "DaBluLite";
const description = "A plugin that offers easy access to simple color schemes/themes for Discord, also known as Colorways";
const version = "5.7.0";
const authorId = "582170007505731594";
const invite = "ZfPH6SDkMW";
const creatorVersion = "1.20";
const plugin = {
	name: name,
	author: author,
	description: description,
	version: version,
	authorId: authorId,
	invite: invite,
	creatorVersion: creatorVersion
};

function HexToHSL(H) {
	let r = 0, g = 0, b = 0;
	if (H.length === 4)
		r = "0x" + H[1] + H[1], g = "0x" + H[2] + H[2], b = "0x" + H[3] + H[3];
	else if (H.length === 7) {
		r = "0x" + H[1] + H[2];
		g = "0x" + H[3] + H[4];
		b = "0x" + H[5] + H[6];
	}
	r /= 255, g /= 255, b /= 255;
	var cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;
	if (delta === 0)
		h = 0;
	else if (cmax === r)
		h = (g - b) / delta % 6;
	else if (cmax === g)
		h = (b - r) / delta + 2;
	else
		h = (r - g) / delta + 4;
	h = Math.round(h * 60);
	if (h < 0)
		h += 360;
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

const colorVariables = [
	"brand-100",
	"brand-130",
	"brand-160",
	"brand-200",
	"brand-230",
	"brand-260",
	"brand-300",
	"brand-330",
	"brand-345",
	"brand-360",
	"brand-400",
	"brand-430",
	"brand-460",
	"brand-500",
	"brand-530",
	"brand-560",
	"brand-600",
	"brand-630",
	"brand-660",
	"brand-700",
	"brand-730",
	"brand-760",
	"brand-800",
	"brand-830",
	"brand-860",
	"brand-900",
	"primary-900",
	"primary-860",
	"primary-830",
	"primary-800",
	"primary-760",
	"primary-730",
	"primary-700",
	"primary-660",
	"primary-645",
	"primary-630",
	"primary-600",
	"primary-560",
	"primary-530",
	"primary-500",
	"primary-460",
	"primary-430",
	"primary-400",
	"primary-360",
	"primary-330",
	"primary-300",
	"primary-260",
	"primary-230",
	"primary-200",
	"primary-160",
	"primary-130",
	"primary-100",
	"white-900",
	"white-860",
	"white-830",
	"white-800",
	"white-760",
	"white-730",
	"white-700",
	"white-660",
	"white-630",
	"white-600",
	"white-560",
	"white-530",
	"white-500",
	"white-460",
	"white-430",
	"white-400",
	"white-360",
	"white-330",
	"white-300",
	"white-260",
	"white-230",
	"white-200",
	"white-160",
	"white-130",
	"white-100",
	"teal-900",
	"teal-860",
	"teal-830",
	"teal-800",
	"teal-760",
	"teal-730",
	"teal-700",
	"teal-660",
	"teal-630",
	"teal-600",
	"teal-560",
	"teal-530",
	"teal-500",
	"teal-460",
	"teal-430",
	"teal-400",
	"teal-360",
	"teal-330",
	"teal-300",
	"teal-260",
	"teal-230",
	"teal-200",
	"teal-160",
	"teal-130",
	"teal-100",
	"black-900",
	"black-860",
	"black-830",
	"black-800",
	"black-760",
	"black-730",
	"black-700",
	"black-660",
	"black-630",
	"black-600",
	"black-560",
	"black-530",
	"black-500",
	"black-460",
	"black-430",
	"black-400",
	"black-360",
	"black-330",
	"black-300",
	"black-260",
	"black-230",
	"black-200",
	"black-160",
	"black-130",
	"black-100",
	"red-900",
	"red-860",
	"red-830",
	"red-800",
	"red-760",
	"red-730",
	"red-700",
	"red-660",
	"red-630",
	"red-600",
	"red-560",
	"red-530",
	"red-500",
	"red-460",
	"red-430",
	"red-400",
	"red-360",
	"red-330",
	"red-300",
	"red-260",
	"red-230",
	"red-200",
	"red-160",
	"red-130",
	"red-100",
	"yellow-900",
	"yellow-860",
	"yellow-830",
	"yellow-800",
	"yellow-760",
	"yellow-730",
	"yellow-700",
	"yellow-660",
	"yellow-630",
	"yellow-600",
	"yellow-560",
	"yellow-530",
	"yellow-500",
	"yellow-460",
	"yellow-430",
	"yellow-400",
	"yellow-360",
	"yellow-330",
	"yellow-300",
	"yellow-260",
	"yellow-230",
	"yellow-200",
	"yellow-160",
	"yellow-130",
	"yellow-100",
	"green-900",
	"green-860",
	"green-830",
	"green-800",
	"green-760",
	"green-730",
	"green-700",
	"green-660",
	"green-630",
	"green-600",
	"green-560",
	"green-530",
	"green-500",
	"green-460",
	"green-430",
	"green-400",
	"green-360",
	"green-330",
	"green-300",
	"green-260",
	"green-230",
	"green-200",
	"green-160",
	"green-130",
	"green-100"
];
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
	return `@import url("https://dablulite.github.io/css-snippets/NitroThemesFix/import.css");
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
.children_cde9af:after, .form_d8a4a1:before {
		content: none;
}
.scroller_de945b {
		background: var(--bg-overlay-app-frame,var(--background-tertiary));
}
.expandedFolderBackground_b1385f {
		background: rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-6));
}
.wrapper__8436d:not(:hover):not(.selected_ae80f7) .childWrapper_a6ce15 {
		background: rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-6));
}
.folder__17546:has(.expandedFolderIconWrapper__324c1) {
		background: var(--bg-overlay-6,var(--background-secondary));
}
.circleIconButton__05cf2:not(.selected_aded59) {
		background: rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-6));
}
.auto_a3c0bd::-webkit-scrollbar-thumb,
.thin_b1c063::-webkit-scrollbar-thumb {
		background-size: 200vh;
		background-image: -webkit-gradient(linear,left top,left bottom,from(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-4))),to(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-4)))),var(--custom-theme-background);
		background-image: linear-gradient(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-4)),rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-4))),var(--custom-theme-background);
}
.auto_a3c0bd::-webkit-scrollbar-track {
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
function generateCss(primaryColor, secondaryColor, tertiaryColor, accentColor, tintedText, discordSaturation, mutedTextBrightness, name) {
	return `/**
 * @name ${name}
 * @version ${plugin.creatorVersion}
 * @description Automatically generated Colorway.
 * @author ${UserStore.getCurrentUser().username}
 * @authorId ${UserStore.getCurrentUser().id}
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
.emptyPage_feb902,
.scrollerContainer_dda72c,
.container__03ec9,
.header__71942 {
		background-color: unset !important;
}
.container__6b2e5,
.container__03ec9,
.header__71942 {
		background: transparent !important;
}${Math.round(HexToHSL("#" + primaryColor)[2]) > 80 ? `

/*Primary*/
.theme-dark .container_bd15da,
.theme-dark .body__616e6,
.theme-dark .toolbar__62fb5,
.theme-dark .container_e1387b,
.theme-dark .messageContent_abea64,
.theme-dark .attachButtonPlus_fd0021,
.theme-dark .username__0b0e7:not([style]),
.theme-dark .children_cde9af,
.theme-dark .buttonContainer__6de7e,
.theme-dark .listItem__48528,
.theme-dark .body__616e6 .caret__33d19,
.theme-dark .body__616e6 .titleWrapper_d6133e > h1,
.theme-dark .body__616e6 .icon_ae0b42 {
		--white-500: black !important;
		--interactive-normal: black !important;
		--text-normal: black !important;
		--text-muted: black !important;
		--header-primary: black !important;
		--header-secondary: black !important;
}

.theme-dark .contentRegionScroller__9ae20 :not(.mtk1,.mtk2,.mtk3,.mtk4,.mtk5,.mtk6,.mtk7,.mtk8,.mtk9,.monaco-editor .line-numbers) {
		--white-500: black !important;
}

.theme-dark .container__26baa {
		--channel-icon: black;
}

.theme-dark .callContainer__1477d {
		--white-500: ${HexToHSL("#" + tertiaryColor)[2] > 80 ? "black" : "white"} !important;
}

.theme-dark .channelTextArea_c2094b {
		--text-normal: ${HexToHSL("#" + primaryColor)[2] + 3.6 > 80 ? "black" : "white"};
}

.theme-dark .placeholder_dec8c7 {
		--channel-text-area-placeholder: ${HexToHSL("#" + primaryColor)[2] + 3.6 > 80 ? "black" : "white"};
		opacity: .6;
}

.theme-dark .colorwaySelectorIcon {
		background-color: black;
}

.theme-dark .root_a28985 > .header__5e5a6 > h1 {
		color: black;
}
/*End Primary*/` : ""}${HexToHSL("#" + secondaryColor)[2] > 80 ? `

/*Secondary*/
.theme-dark .wrapper__3c6d5 *,
.theme-dark .sidebar_e031be *:not(.hasBanner__04337 *),
.theme-dark .members__573eb *:not([style]),
.theme-dark .sidebarRegionScroller__8113e *,
.theme-dark .header__8e271,
.theme-dark .lookFilled__950dd.colorPrimary_ebe632 {
		--white-500: black !important;
		--channels-default: black !important;
		--channel-icon: black !important;
		--interactive-normal: var(--white-500);
		--interactive-hover: var(--white-500);
		--interactive-active: var(--white-500);
}

.theme-dark .channelRow__538ef {
		background-color: var(--background-secondary);
}

.theme-dark .channelRow__538ef * {
		--channel-icon: black;
}

.theme-dark #app-mount .activity_bafb94 {
		--channels-default: var(--white-500) !important;
}

.theme-dark .nameTag__77ab2 {
		--header-primary: black !important;
		--header-secondary: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 90%)" : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)"} !important;
}

.theme-dark .bannerVisible_ef30fe .headerContent__6fcc7 {
		color: #fff;
}

.theme-dark .embedFull__14919 {
		--text-normal: black;
}
/*End Secondary*/` : ""}${HexToHSL("#" + tertiaryColor)[2] > 80 ? `

/*Tertiary*/
.theme-dark .winButton_f17fb6,
.theme-dark .searchBar__310d8 *,
.theme-dark .wordmarkWindows_ffbc5e,
.theme-dark .searchBar__5a20a *,
.theme-dark .searchBarComponent__8f95f {
		--white-500: black !important;
}

.theme-dark [style="background-color: var(--background-secondary);"] {
		color: ${HexToHSL("#" + secondaryColor)[2] > 80 ? "black" : "white"};
}

.theme-dark .popout__24e32 > * {
		--interactive-normal: black !important;
		--header-secondary: black !important;
}

.theme-dark .tooltip__7b090 {
		--text-normal: black !important;
}
.theme-dark .children_cde9af .icon_ae0b42 {
		color: var(--interactive-active) !important;
}
/*End Tertiary*/` : ""}${HexToHSL("#" + accentColor)[2] > 80 ? `

/*Accent*/
.selected_aded59 *,
.selected_ae80f7 *,
#app-mount .lookFilled__950dd.colorBrand__27d57:not(.buttonColor__7bad9),
.colorDefault_e361cf.focused_dcafb9,
.row__9e25f:hover,
.colorwayInfoIcon,
.checkmarkCircle_b1b1cc > circle {
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
	function hueRotation() {
		return `:root:root {
		--brand-100-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[100]) * 10) / 10, 0)};
		--brand-130-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[130]) * 10) / 10, 0)}%;
		--brand-160-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[160]) * 10) / 10, 0)}%;
		--brand-200-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[200]) * 10) / 10, 0)}%;
		--brand-230-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[230]) * 10) / 10, 0)}%;
		--brand-260-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[260]) * 10) / 10, 0)}%;
		--brand-300-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[300]) * 10) / 10, 0)}%;
		--brand-330-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[330]) * 10) / 10, 0)}%;
		--brand-345-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[345]) * 10) / 10, 0)}%;
		--brand-360-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[360]) * 10) / 10, 0)}%;
		--brand-400-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[400]) * 10) / 10, 0)}%;
		--brand-430-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[430]) * 10) / 10, 0)}%;
		--brand-460-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[460]) * 10) / 10, 0)}%;
		--brand-500-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${HexToHSL("#" + accentColor)[2]}%;
		--brand-530-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[530]) * 10) / 10, 100)}%;
		--brand-560-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[560]) * 10) / 10, 100)}%;
		--brand-600-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[600]) * 10) / 10, 100)}%;
		--brand-630-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[630]) * 10) / 10, 100)}%;
		--brand-660-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[660]) * 10) / 10, 100)}%;
		--brand-700-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[700]) * 10) / 10, 100)}%;
		--brand-730-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[730]) * 10) / 10, 100)}%;
		--brand-760-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[760]) * 10) / 10, 100)}%;
		--brand-800-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[800]) * 10) / 10, 100)}%;
		--brand-830-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[830]) * 10) / 10, 100)}%;
		--brand-860-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[860]) * 10) / 10, 100)}%;
		--brand-900-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[900]) * 10) / 10, 100)}%;
		--primary-800-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*12%) 7%;
		--primary-730-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*10%) 13%;
		--primary-700-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*10%) 13%;
		--primary-660-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*11%) 15%;
		--primary-645-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*11%) 16%;
		--primary-630-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*11%) 18%;
		--primary-600-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*11%) 21%;
		--primary-560-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*11%) 24%;
		--primary-530-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*11%) 24%;
		--primary-500-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*11%) 24%;
}`;
	}
	function accentSwap() {
		return `:root:root {
		--brand-100-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[100]) * 10) / 10, 0)};
		--brand-130-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[130]) * 10) / 10, 0)}%;
		--brand-160-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[160]) * 10) / 10, 0)}%;
		--brand-200-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[200]) * 10) / 10, 0)}%;
		--brand-230-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[230]) * 10) / 10, 0)}%;
		--brand-260-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[260]) * 10) / 10, 0)}%;
		--brand-300-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[300]) * 10) / 10, 0)}%;
		--brand-330-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[330]) * 10) / 10, 0)}%;
		--brand-345-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[345]) * 10) / 10, 0)}%;
		--brand-360-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[360]) * 10) / 10, 0)}%;
		--brand-400-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[400]) * 10) / 10, 0)}%;
		--brand-430-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[430]) * 10) / 10, 0)}%;
		--brand-460-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[460]) * 10) / 10, 0)}%;
		--brand-500-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${HexToHSL("#" + accentColor)[2]}%;
		--brand-530-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[530]) * 10) / 10, 100)}%;
		--brand-560-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[560]) * 10) / 10, 100)}%;
		--brand-600-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[600]) * 10) / 10, 100)}%;
		--brand-630-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[630]) * 10) / 10, 100)}%;
		--brand-660-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[660]) * 10) / 10, 100)}%;
		--brand-700-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[700]) * 10) / 10, 100)}%;
		--brand-730-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[730]) * 10) / 10, 100)}%;
		--brand-760-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[760]) * 10) / 10, 100)}%;
		--brand-800-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[800]) * 10) / 10, 100)}%;
		--brand-830-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[830]) * 10) / 10, 100)}%;
		--brand-860-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[860]) * 10) / 10, 100)}%;
		--brand-900-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round((HexToHSL("#" + accentColor)[2] + BrandLightDiffs[900]) * 10) / 10, 100)}%;
}`;
	}
	function materialYou() {
		return `:root:root {
		--brand-100-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*90.5%) 56.5;
		--brand-130-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*102.2%) 55.2%;
		--brand-160-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*98.8%) 53.2%;
		--brand-200-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*97.3%) 51.2%;
		--brand-230-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*101.6%) 49.3%;
		--brand-260-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*100.7%) 46.9%;
		--brand-300-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*100.6%) 44.2%;
		--brand-330-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*99.4%) 39.9%;
		--brand-345-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*99.5%) 37.1%;
		--brand-360-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*100.6%) 35.8%;
		--brand-400-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*100.6%) 30.1%;
		--brand-430-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*100.1%) 28.1%;
		--brand-460-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*99.9%) 25.8%;
		--brand-500-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*100%) 23%;
		--brand-530-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*75.2%) 17.1%;
		--brand-560-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*50.1%) 10.7%;
		--brand-600-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*41.2%) 2.4%;
		--brand-630-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*41.2%) -3.5%;
		--brand-660-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*42%) -8.4%;
		--brand-700-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*41.8%) -15.8%;
		--brand-730-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*41.4%) -17.4%;
		--brand-760-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*41.6%) -19.5%;
		--brand-800-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*42.7%) -22.3%;
		--brand-830-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*42.6%) -26.8%;
		--brand-860-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*41.6%) -32.1%;
		--brand-900-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*47.5%) -38.6%;
		--primary-800-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*10%) 10.8%;
		--primary-730-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*8%) 14.4%;
		--primary-700-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*16%) 18%;
		--primary-660-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*14%) 12.4%;
		--primary-645-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*14%) 14.9%;
		--primary-630-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*12%) 16%;
		--primary-600-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*12%) 12%;
		--primary-560-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*12%) 15.6%;
		--primary-530-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*12%) 19.2%;
		--primary-500-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*12%) 22.8%;
		--primary-460-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*12%) 50%;
		--primary-430: hsl(${HexToHSL("#" + accentColor)[0]}, calc(var(--saturation-factor, 1)*12%), 90%);
		--primary-400: hsl(${HexToHSL("#" + accentColor)[0]}, calc(var(--saturation-factor, 1)*12%), 90%);
		--primary-360: hsl(${HexToHSL("#" + accentColor)[0]}, calc(var(--saturation-factor, 1)*12%), 90%);
}
.emptyPage_feb902,
.scrollerContainer_dda72c,
.container__03ec9,
.header__71942 {
		background-color: unset !important;
}`;
	}
	return {
		hueRotation: {
			name: "Hue Rotation",
			id: "hueRotation",
			preset: hueRotation
		},
		accentSwap: {
			name: "Accent Swap",
			id: "accentSwap",
			preset: accentSwap
		},
		materialYou: {
			name: "Material You",
			id: "materialYou",
			preset: materialYou
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
			preset: getAutoPresets(accentColor).hueRotation.preset,
			id: "hueRotation",
			colors: ["accent"]
		},
		accentSwap: {
			name: "Accent Swap",
			preset: getAutoPresets(accentColor).accentSwap.preset,
			id: "accentSwap",
			colors: ["accent"]
		},
		materialYou: {
			name: "Material You",
			preset: getAutoPresets(accentColor).materialYou.preset,
			id: "materialYou",
			colors: ["accent"]
		}
	};
}
const gradientPresetIds = [
	"gradientType1",
	"gradientType2"
];

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
			className: classes(props.className, "dc-id-icon"),
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				d: "M15.3 14.48c-.46.45-1.08.67-1.86.67h-1.39V9.2h1.39c.78 0 1.4.22 1.86.67.46.45.68 1.22.68 2.31 0 1.1-.22 1.86-.68 2.31Z"
			}
		),
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				"fill-rule": "evenodd",
				d: "M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm1 15h2.04V7.34H6V17Zm4-9.66V17h3.44c1.46 0 2.6-.42 3.38-1.25.8-.83 1.2-2.02 1.2-3.58s-.4-2.75-1.2-3.58c-.79-.83-1.92-1.25-3.38-1.25H10Z",
				"clip-rule": "evenodd"
			}
		)
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
function MoreIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: classes(props.className, "dc-more-icon"),
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				"fill-rule": "evenodd",
				d: "M4 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
				"clip-rule": "evenodd"
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

const defaultColorwaySource = "https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json";
const fallbackColorways = [
	{
		name: "Keyboard Purple",
		original: false,
		accent: "hsl(235 85.6% 64.7%)",
		primary: "#222456",
		secondary: "#1c1f48",
		tertiary: "#080d1d",
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/KeyboardPurple/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Eclipse/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Cyan/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Spotify/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/BrightBlue/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/StillYoung/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Sea/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Lava/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/SolidPink/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Sand/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Amoled/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Zorin/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Desaturated/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Crimson/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Jupiter/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/NeonCandy/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Wildberry/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Facebook/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/MaterialYou/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/css-snippets/DiscordTeal/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/TwilightBlossom/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/Chai/import.css");",
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
		"dc-import": "@import url("https://dablulite.github.io/DiscordColorways/CS16/import.css");",
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
const mainColors = [
	{ name: "accent", title: "Accent", var: "--brand-experiment" },
	{ name: "primary", title: "Primary", var: "--background-primary" },
	{ name: "secondary", title: "Secondary", var: "--background-secondary" },
	{ name: "tertiary", title: "Tertiary", var: "--background-tertiary" }
];

function ColorPicker({ modalProps }) {
	const [ColorVars, setColorVars] = React.useState(colorVariables);
	const [collapsedSettings, setCollapsedSettings] = React.useState(true);
	let results;
	function searchToolboxItems(e) {
		results = [];
		colorVariables.find((colorVariable) => {
			if (colorVariable.toLowerCase().includes(e.toLowerCase())) {
				results.push(colorVariable);
			}
		});
		setColorVars(results);
	}
	return BdApi.React.createElement(ModalRoot, { ...modalProps, className: "colorwayColorpicker" }, BdApi.React.createElement(Flex, { style: { gap: "8px", marginBottom: "8px" } }, BdApi.React.createElement(
		TextInput,
		{
			className: "colorwaysColorpicker-search",
			placeholder: "Search for a color:",
			onChange: (e) => {
				searchToolboxItems(e);
				if (e) {
					setCollapsedSettings(false);
				} else {
					setCollapsedSettings(true);
				}
			}
		}
	), BdApi.React.createElement(
		Button,
		{
			innerClassName: "colorwaysSettings-iconButtonInner",
			size: Button.Sizes.ICON,
			color: Button.Colors.PRIMARY,
			look: Button.Looks.OUTLINED,
			onClick: () => setCollapsedSettings(!collapsedSettings)
		},
		BdApi.React.createElement("svg", { width: "32", height: "24", viewBox: "0 0 24 24", "aria-hidden": "true", role: "img" }, BdApi.React.createElement("path", { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", d: "M7 10L12 15 17 10", "aria-hidden": "true" }))
	)), BdApi.React.createElement(ScrollerThin, { style: { color: "var(--text-normal)" }, orientation: "vertical", className: collapsedSettings ? " colorwaysColorpicker-collapsed" : "", paddingFix: true }, ColorVars.map((colorVariable) => BdApi.React.createElement(
		"div",
		{
			id: `colorways-colorstealer-item_${colorVariable}`,
			className: "colorwaysCreator-settingItm colorwaysCreator-toolboxItm",
			onClick: () => {
				Clipboard.copy(getHex(getComputedStyle(document.body).getPropertyValue("--" + colorVariable)));
				Toasts.show({ message: "Color " + colorVariable + " copied to clipboard", id: "toolbox-color-var-copied", type: 1 });
			},
			style: { "--brand-experiment": `var(--${colorVariable})` }
		},
		`Copy ${colorVariable}`
	))), BdApi.React.createElement(Flex, { style: { justifyContent: "space-between", marginTop: "8px" }, wrap: "wrap", className: collapsedSettings ? "" : " colorwaysColorpicker-collapsed" }, mainColors.map(
		(mainColor) => BdApi.React.createElement(
			"div",
			{
				id: `colorways-toolbox_copy-${mainColor.name}`,
				className: "colorwayToolbox-listItem"
			},
			BdApi.React.createElement(CopyIcon, { onClick: () => {
				Clipboard.copy(getHex(getComputedStyle(document.body).getPropertyValue(mainColor.var)));
				Toasts.show({ message: `${mainColor.title} color copied to clipboard`, id: `toolbox-${mainColor.name}-color-copied`, type: 1 });
			}, width: 20, height: 20, className: "colorwayToolbox-listItemSVG" }),
			BdApi.React.createElement("span", { className: "colorwaysToolbox-label" }, `Copy ${mainColor.title} Color`)
		)
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
	return BdApi.React.createElement(Modals.ModalRoot, { ...modalProps, className: "colorwayCreator-modal" }, BdApi.React.createElement(Modals.ModalHeader, null, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Conflicting Colors Found")), BdApi.React.createElement(Modals.ModalContent, { className: "colorwayCreator-menuWrapper" }, BdApi.React.createElement(Text, { className: "colorwaysConflictingColors-warning" }, "Multiple known themes have been found, select the colors you want to copy from below:"), BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0 } }, "Colors to copy:"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreviews" }, BdApi.React.createElement("div", { className: "colorwayCreator-colorPreview", style: { backgroundColor: primaryColor, color: getFontOnBg(primaryColor) } }, "Primary"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreview", style: { backgroundColor: secondaryColor, color: getFontOnBg(secondaryColor) } }, "Secondary"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreview", style: { backgroundColor: tertiaryColor, color: getFontOnBg(tertiaryColor) } }, "Tertiary"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreview", style: { backgroundColor: accentColor, color: getFontOnBg(accentColor) } }, "Accent")), BdApi.React.createElement("div", { className: "colorwaysCreator-settingCat" }, BdApi.React.createElement(ScrollerThin, { orientation: "vertical", className: "colorwaysCreator-settingsList", paddingFix: true }, BdApi.React.createElement(
		"div",
		{
			id: "colorways-colorstealer-item_Default",
			className: "colorwaysCreator-settingItm colorwaysCreator-colorPreviewItm"
		},
		BdApi.React.createElement(Forms.FormTitle, null, "Discord"),
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
	), Object.values(knownThemeVars).map((theme, i) => {
		if (getComputedStyle(document.body).getPropertyValue(theme.variable)) {
			return BdApi.React.createElement(
				"div",
				{
					id: "colorways-colorstealer-item_" + Object.keys(knownThemeVars)[i],
					className: "colorwaysCreator-settingItm colorwaysCreator-colorPreviewItm"
				},
				BdApi.React.createElement(Forms.FormTitle, null, Object.keys(knownThemeVars)[i] + (theme.alt ? " (Main)" : "")),
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
	})))), BdApi.React.createElement(Modals.ModalFooter, null, BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.BRAND,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.FILLED,
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
						openModal((props) => BdApi.React.createElement(ModalRoot, { className: "colorwaysPreview-modal", ...props }, BdApi.React.createElement("style", null, previewCSS), BdApi.React.createElement(ThemePreview, { accent, primary, secondary, tertiary, isModal: true, modalProps: props })));
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
			BdApi.React.createElement(
				Text,
				{
					tag: "div",
					variant: "text-md/semibold",
					lineClamp: 1,
					selectable: false
				},
				"Preview"
			)
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

function InputColorwayIdModal({ modalProps, onColorwayId }) {
	const [colorwayID, setColorwayID] = React.useState("");
	return BdApi.React.createElement(ModalRoot, { ...modalProps, className: "colorwaysCreator-noMinHeight" }, BdApi.React.createElement(ModalContent, { className: "colorwaysCreator-noHeader colorwaysCreator-noMinHeight" }, BdApi.React.createElement(Forms.FormTitle, null, "Colorway ID:"), BdApi.React.createElement(TextInput, { placeholder: "Enter Colorway ID", onInput: (e) => setColorwayID(e.currentTarget.value) })), BdApi.React.createElement(ModalFooter, null, BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.BRAND,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.FILLED,
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
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			onClick: () => modalProps.onClose()
		},
		"Cancel"
	)));
}

function ColorwayCreatorSettingsModal({ modalProps, onSettings, presetId, hasTintedText, hasDiscordSaturation }) {
	const [tintedText, setTintedText] = React.useState(hasTintedText);
	const [discordSaturation, setDiscordSaturation] = React.useState(hasDiscordSaturation);
	const [preset, setPreset] = React.useState(presetId);
	return BdApi.React.createElement(ModalRoot, { ...modalProps, className: "colorwaysPresetPicker" }, BdApi.React.createElement(ModalHeader, null, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Creator Settings")), BdApi.React.createElement(ModalContent, { className: "colorwaysPresetPicker-content" }, BdApi.React.createElement(Forms.FormTitle, null, "Presets:"), BdApi.React.createElement(ScrollerThin, { orientation: "vertical", paddingFix: true, style: { paddingRight: "2px", marginBottom: "20px", maxHeight: "250px" } }, Object.values(getPreset()).map((pre) => {
		return BdApi.React.createElement("div", { className: `${radioBarItem} ${radioBarItemFilled}`, "aria-checked": preset === pre.id }, BdApi.React.createElement(
			"div",
			{
				className: `${radioBar} ${radioPositionLeft}`,
				style: { padding: "10px" },
				onClick: () => {
					setPreset(pre.id);
				}
			},
			BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), preset === pre.id && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" })),
			BdApi.React.createElement(Text, { variant: "eyebrow", tag: "h5" }, pre.name)
		));
	})), BdApi.React.createElement(Switch, { value: tintedText, onChange: setTintedText }, "Use colored text"), BdApi.React.createElement(Switch, { value: discordSaturation, onChange: setDiscordSaturation, hideBorder: true, style: { marginBottom: "0" } }, "Use Discord's saturation")), BdApi.React.createElement(ModalFooter, null, BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.BRAND_NEW,
			size: Button.Sizes.MEDIUM,
			onClick: () => {
				onSettings({ presetId: preset, discordSaturation, tintedText });
				modalProps.onClose();
			}
		},
		"Finish"
	), BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			onClick: () => {
				modalProps.onClose();
			}
		},
		"Cancel"
	)));
}

function StoreNameModal({ modalProps, originalName, onFinish, conflicting }) {
	const [error, setError] = React.useState("");
	const [newStoreName, setNewStoreName] = React.useState(originalName);
	return BdApi.React.createElement(ModalRoot, { ...modalProps }, BdApi.React.createElement(ModalHeader, { separator: false }, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, conflicting ? "Duplicate Store Name" : "Give this store a name")), BdApi.React.createElement(ModalContent, null, conflicting ? BdApi.React.createElement(Text, null, "A store with the same name already exists. Please give a different name to the imported store:") : BdApi.React.createElement(BdApi.React.Fragment, null), BdApi.React.createElement(Forms.FormTitle, null, "Name:"), BdApi.React.createElement(TextInput, { error, value: newStoreName, onChange: (e) => setNewStoreName(e), style: { marginBottom: "16px" } })), BdApi.React.createElement(ModalFooter, null, BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.BRAND,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.FILLED,
			onClick: async () => {
				setError("");
				if (betterdiscord.Data.load("custom_colorways").map((store) => store.name).includes(newStoreName)) {
					return setError("Error: Store name already exists");
				}
				onFinish(newStoreName);
				modalProps.onClose();
			}
		},
		"Finish"
	), BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
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
	return BdApi.React.createElement(ModalRoot, { ...modalProps }, BdApi.React.createElement(ModalHeader, { separator: false }, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Add a source:")), BdApi.React.createElement(ModalContent, null, BdApi.React.createElement(Forms.FormTitle, null, "Name:"), BdApi.React.createElement(
		TextInput,
		{
			placeholder: "Enter a valid Name...",
			onChange: setColorwaySourceName,
			value: colorwaySourceName,
			error: nameError,
			readOnly: nameReadOnly,
			disabled: nameReadOnly
		}
	), BdApi.React.createElement(Forms.FormTitle, { style: { marginTop: "8px" } }, "URL:"), BdApi.React.createElement(
		TextInput,
		{
			placeholder: "Enter a valid URL...",
			onChange: (value) => {
				setColorwaySourceURL(value);
				if (value === defaultColorwaySource) {
					setNameReadOnly(true);
					setColorwaySourceName("Project Colorway");
				}
			},
			value: colorwaySourceURL,
			error: URLError,
			style: { marginBottom: "16px" }
		}
	)), BdApi.React.createElement(ModalFooter, null, BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.BRAND,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.FILLED,
			onClick: async () => {
				const sourcesArr = getSetting("colorwayLists");
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
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			onClick: () => modalProps.onClose()
		},
		"Cancel"
	)));
}
function SourceManager({ inModal }) {
	const [colorwaySourceFiles, setColorwaySourceFiles] = React.useState(getSetting("colorwayLists"));
	const [customColorwayStores, setCustomColorwayStores] = React.useState(betterdiscord.Data.load("custom_colorways"));
	const { item: radioBarItem, itemFilled: radioBarItemFilled } = Webpack.getByKeys("radioBar");
	return BdApi.React.createElement(SettingsTab$1, { title: "Sources", inModal }, BdApi.React.createElement(Flex, { style: { gap: "0", marginBottom: "8px", alignItems: "center" } }, BdApi.React.createElement(Forms.FormTitle, { tag: "h5", style: { marginBottom: 0, flexGrow: 1 } }, "Online"), BdApi.React.createElement(
		Button,
		{
			className: "colorwaysSettings-colorwaySourceAction",
			innerClassName: "colorwaysSettings-iconButtonInner",
			style: { flexShrink: "0" },
			size: Button.Sizes.SMALL,
			color: Button.Colors.TRANSPARENT,
			onClick: () => {
				openModal((props) => BdApi.React.createElement(AddOnlineStoreModal, { modalProps: props, onFinish: async (name, url) => {
					saveSettings({ colorwayLists: [...getSetting("colorwayLists"), { name, url }] });
					setColorwaySourceFiles([...getSetting("colorwayLists"), { name, url }]);
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
	)), BdApi.React.createElement(ScrollerThin, { orientation: "vertical", style: { maxHeight: "50%" }, className: "colorwaysSettings-sourceScroller" }, !colorwaySourceFiles.length && BdApi.React.createElement("div", { className: `${radioBarItem} ${radioBarItemFilled} colorwaysSettings-colorwaySource`, style: { flexDirection: "column", padding: "16px", alignItems: "start" }, onClick: () => {
		saveSettings({ colorwayLists: [{ name: "Project Colorway", url: defaultColorwaySource }] });
		setColorwaySourceFiles([{ name: "Project Colorway", url: defaultColorwaySource }]);
	} }, BdApi.React.createElement(PlusIcon, { width: 24, height: 24 }), BdApi.React.createElement(Text, { className: "colorwaysSettings-colorwaySourceLabel" }, "Add Project Colorway Source")), colorwaySourceFiles.map(
		(colorwaySourceFile, i) => BdApi.React.createElement("div", { className: `${radioBarItem} ${radioBarItemFilled} colorwaysSettings-colorwaySource`, style: { flexDirection: "column", padding: "16px", alignItems: "start" } }, BdApi.React.createElement("div", { className: "hoverRoll" }, BdApi.React.createElement(Text, { className: "colorwaysSettings-colorwaySourceLabel hoverRoll_normal" }, colorwaySourceFile.name, " ", colorwaySourceFile.url === defaultColorwaySource && BdApi.React.createElement("div", { className: "colorways-badge" }, "Built-In")), BdApi.React.createElement(Text, { className: "colorwaysSettings-colorwaySourceLabel hoverRoll_hovered" }, colorwaySourceFile.url)), BdApi.React.createElement(Flex, { style: { marginLeft: "auto", gap: "8px" } }, BdApi.React.createElement(
			Button,
			{
				innerClassName: "colorwaysSettings-iconButtonInner",
				size: Button.Sizes.SMALL,
				color: Button.Colors.PRIMARY,
				look: Button.Looks.OUTLINED,
				onClick: () => {
					Clipboard.copy(colorwaySourceFile.url);
				}
			},
			BdApi.React.createElement(CopyIcon, { width: 14, height: 14 }),
			" Copy URL"
		), colorwaySourceFile.url !== defaultColorwaySource && BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(
			Button,
			{
				innerClassName: "colorwaysSettings-iconButtonInner",
				size: Button.Sizes.SMALL,
				color: Button.Colors.PRIMARY,
				look: Button.Looks.OUTLINED,
				onClick: async () => {
					openModal((props) => BdApi.React.createElement(StoreNameModal, { conflicting: false, modalProps: props, originalName: colorwaySourceFile.name || "", onFinish: async (e) => {
						const modal = openModal((propss) => BdApi.React.createElement(ModalRoot, { ...propss, className: "colorwaysLoadingModal" }, BdApi.React.createElement(Spinner, { style: { color: "#ffffff" } })));
						const res = await fetch(colorwaySourceFile.url);
						const data = await res.json();
						betterdiscord.Data.save("custom_colorways", [...betterdiscord.Data.load("custom_colorways"), { name: e, colorways: data.colorways || [] }]);
						setCustomColorwayStores(betterdiscord.Data.load("custom_colorways"));
						closeModal(modal);
					} }));
				}
			},
			BdApi.React.createElement(DownloadIcon, { width: 14, height: 14 }),
			" Download..."
		), BdApi.React.createElement(
			Button,
			{
				innerClassName: "colorwaysSettings-iconButtonInner",
				size: Button.Sizes.SMALL,
				color: Button.Colors.RED,
				look: Button.Looks.OUTLINED,
				onClick: async () => {
					saveSettings({ colorwayLists: getSetting("colorwayLists").filter((src, ii) => ii !== i) });
					setColorwaySourceFiles(getSetting("colorwayLists").filter((src, ii) => ii !== i));
				}
			},
			BdApi.React.createElement(DeleteIcon, { width: 14, height: 14 }),
			" Remove"
		))))
	)), BdApi.React.createElement(Flex, { style: { gap: "0", marginBottom: "8px", alignItems: "center" } }, BdApi.React.createElement(Forms.FormTitle, { tag: "h5", style: { marginBottom: 0, flexGrow: 1 } }, "Offline"), BdApi.React.createElement(
		Button,
		{
			className: "colorwaysSettings-colorwaySourceAction",
			innerClassName: "colorwaysSettings-iconButtonInner",
			style: { flexShrink: "0", marginLeft: "8px" },
			size: Button.Sizes.SMALL,
			color: Button.Colors.TRANSPARENT,
			onClick: async () => {
				const [file] = await DiscordNative.fileManager.openFiles({
					filters: [
						{ name: "DiscordColorways Offline Store", extensions: ["json"] },
						{ name: "all", extensions: ["*"] }
					]
				});
				if (file) {
					try {
						if (betterdiscord.Data.load("custom_colorways").map((store) => store.name).includes(JSON.parse(new TextDecoder().decode(file.data)).name)) {
							openModal((props) => BdApi.React.createElement(StoreNameModal, { conflicting: true, modalProps: props, originalName: JSON.parse(new TextDecoder().decode(file.data)).name, onFinish: async (e) => {
								await betterdiscord.Data.save("custom_colorways", [...betterdiscord.Data.load("custom_colorways"), { name: e, colorways: JSON.parse(new TextDecoder().decode(file.data)).colorways }]);
								setCustomColorwayStores(betterdiscord.Data.load("custom_colorways"));
							} }));
						} else {
							await betterdiscord.Data.save("custom_colorways", [...betterdiscord.Data.load("custom_colorways"), JSON.parse(new TextDecoder().decode(file.data))]);
							setCustomColorwayStores(betterdiscord.Data.load("custom_colorways"));
						}
					} catch (err) {
						console.error(err);
					}
				}
			}
		},
		BdApi.React.createElement(ImportIcon, { width: 14, height: 14 }),
		"Import..."
	), BdApi.React.createElement(
		Button,
		{
			className: "colorwaysSettings-colorwaySourceAction",
			innerClassName: "colorwaysSettings-iconButtonInner",
			style: { flexShrink: "0", marginLeft: "8px" },
			size: Button.Sizes.SMALL,
			color: Button.Colors.TRANSPARENT,
			onClick: () => {
				openModal((props) => BdApi.React.createElement(StoreNameModal, { conflicting: false, modalProps: props, originalName: "", onFinish: async (e) => {
					betterdiscord.Data.save("custom_colorways", [...betterdiscord.Data.load("custom_colorways"), { name: e, colorways: [] }]);
					setCustomColorwayStores(betterdiscord.Data.load("custom_colorways"));
					props.onClose();
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
	)), BdApi.React.createElement(ScrollerThin, { orientation: "vertical", style: { maxHeight: "50%" }, className: "colorwaysSettings-sourceScroller" }, getComputedStyle(document.body).getPropertyValue("--os-accent-color") ? BdApi.React.createElement("div", { className: `${radioBarItem} ${radioBarItemFilled} colorwaysSettings-colorwaySource`, style: { flexDirection: "column", padding: "16px", alignItems: "start" } }, BdApi.React.createElement(Flex, { style: { gap: 0, alignItems: "center", width: "100%", height: "30px" } }, BdApi.React.createElement(Text, { className: "colorwaysSettings-colorwaySourceLabel" }, "OS Accent Color", " ", BdApi.React.createElement("div", { className: "colorways-badge" }, "Built-In")))) : BdApi.React.createElement(BdApi.React.Fragment, null), customColorwayStores.map(
		({ name: customColorwaySourceName, colorways: offlineStoreColorways }) => BdApi.React.createElement("div", { className: `${radioBarItem} ${radioBarItemFilled} colorwaysSettings-colorwaySource`, style: { flexDirection: "column", padding: "16px", alignItems: "start" } }, BdApi.React.createElement(Text, { className: "colorwaysSettings-colorwaySourceLabel" }, customColorwaySourceName), BdApi.React.createElement(Flex, { style: { marginLeft: "auto", gap: "8px" } }, BdApi.React.createElement(
			Button,
			{
				innerClassName: "colorwaysSettings-iconButtonInner",
				size: Button.Sizes.SMALL,
				color: Button.Colors.PRIMARY,
				look: Button.Looks.OUTLINED,
				onClick: async () => {
					DiscordNative.fileManager.saveWithDialog(JSON.stringify({ "name": customColorwaySourceName, "colorways": [...offlineStoreColorways] }), `${customColorwaySourceName.replaceAll(" ", "-").toLowerCase()}.colorways.json`);
				}
			},
			BdApi.React.createElement(DownloadIcon, { width: 14, height: 14 }),
			" Export as..."
		), BdApi.React.createElement(
			Button,
			{
				innerClassName: "colorwaysSettings-iconButtonInner",
				size: Button.Sizes.SMALL,
				color: Button.Colors.RED,
				look: Button.Looks.OUTLINED,
				onClick: async () => {
					var sourcesArr = [];
					const customColorwaySources = await betterdiscord.Data.load("custom_colorways");
					customColorwaySources.map((source) => {
						if (source.name !== customColorwaySourceName) {
							sourcesArr.push(source);
						}
					});
					betterdiscord.Data.save("custom_colorways", sourcesArr);
					setCustomColorwayStores(sourcesArr);
				}
			},
			BdApi.React.createElement(DeleteIcon, { width: 20, height: 20 }),
			" Remove"
		)))
	)));
}

function SaveColorwayModal({ modalProps, colorways, onFinish }) {
	const [offlineColorwayStores, setOfflineColorwayStores] = React.useState(betterdiscord.Data.load("custom_colorways"));
	const [storename, setStorename] = React.useState();
	const [noStoreError, setNoStoreError] = React.useState(false);
	const { radioBar, item: radioBarItem, itemFilled: radioBarItemFilled, radioPositionLeft } = Webpack.getByKeys("radioBar");
	return BdApi.React.createElement(ModalRoot, { ...modalProps }, BdApi.React.createElement(ModalHeader, { separator: false }, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Select Offline Colorway Source")), BdApi.React.createElement(ModalContent, null, noStoreError ? BdApi.React.createElement(Text, { variant: "text-xs/normal", style: { color: "var(--text-danger)" } }, "Error: No store selected") : BdApi.React.createElement(BdApi.React.Fragment, null), offlineColorwayStores.map((store) => {
		return BdApi.React.createElement("div", { className: `${radioBarItem} ${radioBarItemFilled}`, "aria-checked": storename === store.name }, BdApi.React.createElement(
			"div",
			{
				className: `${radioBar} ${radioPositionLeft}`,
				style: { padding: "10px" },
				onClick: () => {
					setStorename(store.name);
				}
			},
			BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), storename === store.name && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" })),
			BdApi.React.createElement(Text, { variant: "eyebrow", tag: "h5" }, store.name)
		));
	}), BdApi.React.createElement("div", { className: `${radioBarItem} ${radioBarItemFilled}` }, BdApi.React.createElement(
		"div",
		{
			className: `${radioBar} ${radioPositionLeft}`,
			style: { padding: "10px" },
			onClick: () => {
				openModal((props) => BdApi.React.createElement(StoreNameModal, { modalProps: props, conflicting: false, originalName: "", onFinish: async (e) => {
					betterdiscord.Data.save("custom_colorways", [...betterdiscord.Data.load("custom_colorways"), { name: e, colorways: [] }]);
					setOfflineColorwayStores(betterdiscord.Data.load("custom_colorways"));
				} }));
			}
		},
		BdApi.React.createElement(PlusIcon, { width: 24, height: 24 }),
		BdApi.React.createElement(Text, { variant: "eyebrow", tag: "h5" }, "Create new store...")
	))), BdApi.React.createElement(ModalFooter, null, BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.BRAND_NEW,
			size: Button.Sizes.MEDIUM,
			onClick: async () => {
				setNoStoreError(false);
				if (!storename) {
					setNoStoreError(true);
				} else {
					const storeToModify = betterdiscord.Data.load("custom_colorways").filter((source) => source.name === storename)[0];
					colorways.map((colorway, i) => {
						if (storeToModify.colorways.map((colorway2) => colorway2.name).includes(colorway.name)) {
							openModal((props) => BdApi.React.createElement(ModalRoot, { ...props }, BdApi.React.createElement(ModalHeader, { separator: false }, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Duplicate Colorway")), BdApi.React.createElement(ModalContent, null, BdApi.React.createElement(Text, null, "A colorway with the same name was found in this store, what do you want to do?")), BdApi.React.createElement(ModalFooter, null, BdApi.React.createElement(
								Button,
								{
									style: { marginLeft: 8 },
									color: Button.Colors.BRAND,
									size: Button.Sizes.MEDIUM,
									look: Button.Looks.FILLED,
									onClick: () => {
										const newStore = { name: storeToModify.name, colorways: [...storeToModify.colorways.filter((colorwayy) => colorwayy.name !== colorway.name), colorway] };
										betterdiscord.Data.save("custom_colorways", [...betterdiscord.Data.load("custom_colorways").filter((source) => source.name !== storename), newStore]);
										props.onClose();
										if (i + 1 === colorways.length) {
											modalProps.onClose();
											onFinish();
										}
									}
								},
								"Override"
							), BdApi.React.createElement(
								Button,
								{
									style: { marginLeft: 8 },
									color: Button.Colors.BRAND,
									size: Button.Sizes.MEDIUM,
									look: Button.Looks.FILLED,
									onClick: () => {
										function NewColorwayNameModal({ modalProps: modalProps2, onSelected }) {
											const [errorMsg, setErrorMsg] = React.useState();
											const [newColorwayName, setNewColorwayName] = React.useState("");
											return BdApi.React.createElement(ModalRoot, { ...modalProps2 }, BdApi.React.createElement(ModalHeader, { separator: false }, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Select new name")), BdApi.React.createElement(ModalContent, null, BdApi.React.createElement(TextInput, { error: errorMsg, value: newColorwayName, onChange: (e) => setNewColorwayName(e), placeholder: "Enter valid colorway name" })), BdApi.React.createElement(ModalFooter, null, BdApi.React.createElement(
												Button,
												{
													style: { marginLeft: 8 },
													color: Button.Colors.PRIMARY,
													size: Button.Sizes.MEDIUM,
													look: Button.Looks.OUTLINED,
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
												Button,
												{
													style: { marginLeft: 8 },
													color: Button.Colors.PRIMARY,
													size: Button.Sizes.MEDIUM,
													look: Button.Looks.OUTLINED,
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
											betterdiscord.Data.save("custom_colorways", [...betterdiscord.Data.load("custom_colorways").filter((source) => source.name !== storename), newStore]);
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
								Button,
								{
									style: { marginLeft: 8 },
									color: Button.Colors.PRIMARY,
									size: Button.Sizes.MEDIUM,
									look: Button.Looks.OUTLINED,
									onClick: () => {
										props.onClose();
									}
								},
								"Select different store"
							))));
						} else {
							const newStore = { name: storeToModify.name, colorways: [...storeToModify.colorways, colorway] };
							betterdiscord.Data.save("custom_colorways", [...betterdiscord.Data.load("custom_colorways").filter((source) => source.name !== storename), newStore]);
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
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			onClick: () => {
				modalProps.onClose();
			}
		},
		"Cancel"
	)));
}

function CreatorModal({
	modalProps,
	loadUIProps,
	colorwayID
}) {
	const [accentColor, setAccentColor] = React.useState("5865f2");
	const [primaryColor, setPrimaryColor] = React.useState("313338");
	const [secondaryColor, setSecondaryColor] = React.useState("2b2d31");
	const [tertiaryColor, setTertiaryColor] = React.useState("1e1f22");
	const [colorwayName, setColorwayName] = React.useState("");
	const [tintedText, setTintedText] = React.useState(true);
	const [discordSaturation, setDiscordSaturation] = React.useState(true);
	const [preset, setPreset] = React.useState("default");
	const [presetColorArray, setPresetColorArray] = React.useState(["accent", "primary", "secondary", "tertiary"]);
	const [mutedTextBrightness, setMutedTextBrightness] = React.useState(Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 3, 100));
	const colorProps = {
		accent: {
			get: accentColor,
			set: setAccentColor,
			name: "Accent"
		},
		primary: {
			get: primaryColor,
			set: setPrimaryColor,
			name: "Primary"
		},
		secondary: {
			get: secondaryColor,
			set: setSecondaryColor,
			name: "Secondary"
		},
		tertiary: {
			get: tertiaryColor,
			set: setTertiaryColor,
			name: "Tertiary"
		}
	};
	React.useEffect(() => {
	});
	React.useEffect(() => {
		if (colorwayID) {
			if (!colorwayID.includes(",")) {
				throw new Error("Invalid Colorway ID");
			} else {
				const setColor = [
					setAccentColor,
					setPrimaryColor,
					setSecondaryColor,
					setTertiaryColor
				];
				colorwayID.split("|").forEach((prop) => {
					if (prop.includes(",#")) {
						prop.split(/,#/).forEach((color, i) => setColor[i](colorToHex(color)));
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
	return BdApi.React.createElement(ModalRoot, { ...modalProps, className: "colorwayCreator-modal" }, BdApi.React.createElement(ModalHeader, null, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Create Colorway")), BdApi.React.createElement(ModalContent, { className: "colorwayCreator-menuWrapper" }, BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0 } }, "Name:"), BdApi.React.createElement(
		TextInput,
		{
			placeholder: "Give your Colorway a name",
			value: colorwayName,
			onChange: setColorwayName
		}
	), BdApi.React.createElement("div", { className: "colorwaysCreator-settingCat" }, BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: "0" } }, "Colors & Values:"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreviews" }, presetColorArray.map((presetColor) => {
		return BdApi.React.createElement(
			ColorPicker$1,
			{
				label: BdApi.React.createElement(Text, { className: "colorwaysPicker-colorLabel" }, colorProps[presetColor].name),
				color: parseInt(colorProps[presetColor].get, 16),
				onChange: (color) => {
					let hexColor = color.toString(16);
					while (hexColor.length < 6) {
						hexColor = "0" + hexColor;
					}
					colorProps[presetColor].set(hexColor);
				},
				...colorPickerProps
			}
		);
	})), BdApi.React.createElement(Forms.FormDivider, { style: { margin: "10px 0" } }), BdApi.React.createElement(Forms.FormTitle, null, "Muted Text Brightness:"), BdApi.React.createElement(
		Slider,
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
		BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0 } }, "Settings & Presets"),
		BdApi.React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", "aria-hidden": "true", role: "img", style: { rotate: "-90deg" } }, BdApi.React.createElement("path", { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", d: "M7 10L12 15 17 10", "aria-hidden": "true" }))
	), BdApi.React.createElement(
		ThemePreview,
		{
			accent: "#" + accentColor,
			primary: "#" + primaryColor,
			secondary: "#" + secondaryColor,
			tertiary: "#" + tertiaryColor,
			previewCSS: gradientPresetIds.includes(getPreset()[preset].id) ? pureGradientBase + `.colorwaysPreview-modal,.colorwaysPreview-wrapper {--gradient-theme-bg: linear-gradient(${getPreset(
				primaryColor,
				secondaryColor,
				tertiaryColor,
				accentColor
			)[preset].preset(discordSaturation).base})}` : ""
		}
	)), BdApi.React.createElement(ModalFooter, null, BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.BRAND,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.FILLED,
			onClick: (e) => {
				var customColorwayCSS = "";
				if (preset === "default") {
					customColorwayCSS = generateCss(
						primaryColor,
						secondaryColor,
						tertiaryColor,
						accentColor,
						tintedText,
						discordSaturation,
						mutedTextBrightness,
						colorwayName || "Colorway"
					);
				} else {
					gradientPresetIds.includes(getPreset()[preset].id) ? customColorwayCSS = `/**
																* @name ${colorwayName || "Colorway"}
																* @version ${plugin.creatorVersion}
																* @description Automatically generated Colorway.
																* @author ${UserStore.getCurrentUser().username}
																* @authorId ${UserStore.getCurrentUser().id}
																* @preset Gradient
																*/
															 ${getPreset(primaryColor, secondaryColor, tertiaryColor, accentColor)[preset].preset(discordSaturation).full}` : customColorwayCSS = `/**
															 * @name ${colorwayName || "Colorway"}
															 * @version ${plugin.creatorVersion}
															 * @description Automatically generated Colorway.
															 * @author ${UserStore.getCurrentUser().username}
															 * @authorId ${UserStore.getCurrentUser().id}
															 * @preset ${getPreset()[preset].name}
															 */
															 ${getPreset(primaryColor, secondaryColor, tertiaryColor, accentColor)[preset].preset(discordSaturation)}`;
				}
				const customColorway = {
					name: colorwayName || "Colorway",
					"dc-import": customColorwayCSS,
					accent: "#" + accentColor,
					primary: "#" + primaryColor,
					secondary: "#" + secondaryColor,
					tertiary: "#" + tertiaryColor,
					colors: presetColorArray,
					author: UserStore.getCurrentUser().username,
					authorID: UserStore.getCurrentUser().id,
					isGradient: gradientPresetIds.includes(getPreset()[preset].id),
					linearGradient: gradientPresetIds.includes(getPreset()[preset].id) ? getPreset(
						primaryColor,
						secondaryColor,
						tertiaryColor,
						accentColor
					)[preset].preset(discordSaturation).base : "",
					preset: getPreset()[preset].id,
					creatorVersion: plugin.creatorVersion
				};
				openModal((props) => BdApi.React.createElement(SaveColorwayModal, { modalProps: props, colorways: [customColorway], onFinish: () => {
					modalProps.onClose();
					loadUIProps();
				} }));
			}
		},
		"Finish"
	), BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			onClick: () => {
				function setAllColors({ accent, primary, secondary, tertiary }) {
					setAccentColor(accent.split("#")[1]);
					setPrimaryColor(primary.split("#")[1]);
					setSecondaryColor(secondary.split("#")[1]);
					setTertiaryColor(tertiary.split("#")[1]);
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
					setPrimaryColor(
						getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--background-primary")
						).split("#")[1]
					);
					setSecondaryColor(
						getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--background-secondary")
						).split("#")[1]
					);
					setTertiaryColor(
						getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--background-tertiary")
						).split("#")[1]
					);
					setAccentColor(
						getHex(
							getComputedStyle(
								document.body
							).getPropertyValue("--brand-experiment")
						).split("#")[1]
					);
				}
			}
		},
		"Copy Current Colors"
	), BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			onClick: () => openModal((props) => BdApi.React.createElement(InputColorwayIdModal, { modalProps: props, onColorwayId: (colorwayID2) => {
				const setColor = [
					setAccentColor,
					setPrimaryColor,
					setSecondaryColor,
					setTertiaryColor
				];
				hexToString(colorwayID2).split(/,#/).forEach((color, i) => setColor[i](colorToHex(color)));
			} }))
		},
		"Enter Colorway ID"
	), BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			onClick: () => {
				modalProps.onClose();
			}
		},
		"Cancel"
	)));
}

const CodeContainerClasses = proxyLazy(() => Webpack.getByKeys("markup", "codeContainer"));
function CodeBlock(props) {
	return BdApi.React.createElement("div", { className: CodeContainerClasses.markup }, Parser.defaultRules.codeBlock.react(props, null, {}));
}

const UserSummaryItem = findComponentByCodeLazy("defaultRenderUser", "showDefaultAvatarsForNullUsers");
function RenameColorwayModal({ modalProps, ogName, onFinish, colorwayList }) {
	const [error, setError] = React.useState("");
	const [newName, setNewName] = React.useState(ogName);
	return BdApi.React.createElement(ModalRoot, { ...modalProps }, BdApi.React.createElement(ModalHeader, { separator: false }, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1", style: { marginRight: "auto" } }, "Rename Colorway..."), BdApi.React.createElement(ModalCloseButton, { onClick: () => modalProps.onClose() })), BdApi.React.createElement(ModalContent, null, BdApi.React.createElement(
		TextInput,
		{
			value: newName,
			error,
			onChange: setNewName
		}
	)), BdApi.React.createElement(ModalFooter, null, BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.BRAND,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.FILLED,
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
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.FILLED,
			onClick: () => modalProps.onClose()
		},
		"Cancel"
	)));
}
function ColorwayInfoModal({
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
	const profile = useStateFromStores([UserStore], () => UserStore.getUser(colorway.authorID));
	return BdApi.React.createElement(ModalRoot, { ...modalProps }, BdApi.React.createElement(ModalHeader, { separator: false }, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1", style: { marginRight: "auto" } }, "Colorway: ", colorway.name), BdApi.React.createElement(ModalCloseButton, { onClick: () => modalProps.onClose() })), BdApi.React.createElement(ModalContent, null, BdApi.React.createElement(Flex, { style: { gap: "8px", width: "100%" }, flexDirection: "column" }, BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0, width: "100%" } }, "Creator:"), BdApi.React.createElement(Flex, { style: { gap: ".5rem" } }, BdApi.React.createElement(
		UserSummaryItem,
		{
			users: [profile],
			guildId: void 0,
			renderIcon: false,
			showDefaultAvatarsForNullUsers: true,
			size: 32,
			showUserPopout: true
		}
	), BdApi.React.createElement(Text, { style: { lineHeight: "32px" } }, colorway.author)), BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0, width: "100%" } }, "Colors:"), BdApi.React.createElement(Flex, { style: { gap: "8px" } }, colors.map((color) => BdApi.React.createElement("div", { className: "colorwayInfo-colorSwatch", style: { backgroundColor: colorway[color] } }))), BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0, width: "100%" } }, "Actions:"), BdApi.React.createElement(Flex, { style: { gap: "8px" }, flexDirection: "column" }, BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			style: { width: "100%" },
			onClick: () => {
				const colorwayIDArray = `${colorway.accent},${colorway.primary},${colorway.secondary},${colorway.tertiary}|n:${colorway.name}${colorway.preset ? `|p:${colorway.preset}` : ""}`;
				const colorwayID = stringToHex(colorwayIDArray);
				Clipboard.copy(colorwayID);
				Toasts.show({
					message: "Copied Colorway ID Successfully",
					type: 1,
					id: "copy-colorway-id-notify"
				});
			}
		},
		"Copy Colorway ID"
	), BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			style: { width: "100%" },
			onClick: () => {
				Clipboard.copy(colorway["dc-import"]);
				Toasts.show({
					message: "Copied CSS to Clipboard",
					type: 1,
					id: "copy-colorway-css-notify"
				});
			}
		},
		"Copy CSS"
	), BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			style: { width: "100%" },
			onClick: async () => {
				const newColorway = {
					...colorway,
					"dc-import": generateCss(colorToHex(colorway.primary) || "313338", colorToHex(colorway.secondary) || "2b2d31", colorToHex(colorway.tertiary) || "1e1f22", colorToHex(colorway.accent) || "5865f2", true, true, void 0, colorway.name)
				};
				openModal((props) => BdApi.React.createElement(SaveColorwayModal, { modalProps: props, colorways: [newColorway], onFinish: () => {
				} }));
			}
		},
		"Update CSS"
	), colorway.sourceType === "offline" && BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			style: { width: "100%" },
			onClick: () => {
				const customColorways = betterdiscord.Data.load("custom_colorways").map((o) => o.colorways).filter((colorArr) => colorArr.map((color) => color.name).includes(colorway.name))[0];
				openModal((props) => BdApi.React.createElement(RenameColorwayModal, { ogName: colorway.name, colorwayList: customColorways, modalProps: props, onFinish: async (newName) => {
					const stores = betterdiscord.Data.load("custom_colorways").map((source) => {
						if (source.name === colorway.source) {
							return {
								name: source.name,
								colorways: [...source.colorways.filter((colorway2) => colorway2.name !== colorway2.name), {
									...colorway,
									name: newName
								}]
							};
						} else
							return source;
					});
					betterdiscord.Data.save("custom_colorways", stores);
					if (betterdiscord.Data.load("settings").activeColorwayObject.id === colorway.name) {
						betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), activeColorwayObject: { id: newName, css: colorway.name, sourceType: "offline", source: colorway.source } });
					}
					modalProps.onClose();
					loadUIProps();
				} }));
			}
		},
		"Rename"
	), BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			style: { width: "100%" },
			onClick: () => {
				openModal((props) => BdApi.React.createElement(ModalRoot, { ...props, className: "colorwayInfo-cssModal" }, BdApi.React.createElement(ModalContent, null, BdApi.React.createElement(CodeBlock, { lang: "css", content: colorway["dc-import"] }))));
			}
		},
		"Show CSS"
	), BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			style: { width: "100%" },
			onClick: () => {
				if (!colorway["dc-import"].includes("@name")) {
					DiscordNative.fileManager.saveWithDialog(`/**
																		* @name ${colorway.name || "Colorway"}
																		* @version ${plugin.creatorVersion}
																		* @description Automatically generated Colorway.
																		* @author ${UserStore.getCurrentUser().username}
																		* @authorId ${UserStore.getCurrentUser().id}
																		*/
																	 ${colorway["dc-import"].replace((colorway["dc-import"].match(/\/\*.+\*\//) || [""])[0], "").replaceAll("url("https://", "url(https://").replaceAll('url("//', 'url("https://')}`, `${colorway.name.replaceAll(" ", "-").toLowerCase()}.theme.css`);
				} else {
					DiscordNative.fileManager.saveWithDialog(colorway["dc-import"], `${colorway.name.replaceAll(" ", "-").toLowerCase()}.theme.css`);
				}
			}
		},
		"Download CSS"
	), BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			style: { width: "100%" },
			onClick: () => {
				openModal((props) => BdApi.React.createElement(ModalRoot, { className: "colorwaysPreview-modal", ...props }, BdApi.React.createElement("style", null, colorway.isGradient ? pureGradientBase + `.colorwaysPreview-modal,.colorwaysPreview-wrapper {--gradient-theme-bg: linear-gradient(${colorway.linearGradient})}` : ""), BdApi.React.createElement(
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
		Button,
		{
			color: Button.Colors.RED,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.FILLED,
			style: { width: "100%" },
			onClick: async () => {
				const customColorwaysArray = [];
				betterdiscord.Data.load("custom_colorways").map((color, i) => {
					if (betterdiscord.Data.load("custom_colorways").length > 0) {
						if (color.name !== colorway.name) {
							customColorwaysArray.push(color);
						}
						if (++i === betterdiscord.Data.load("custom_colorways").length) {
							betterdiscord.Data.save("custom_colorways", customColorwaysArray);
						}
						if (getSetting("activeColorwayObject").id === colorway.name) {
							saveSettings({ activeColorwayObject: { id: null, css: null, sourceType: null, source: null } });
							ColorwayCSS.set("");
						}
						modalProps.onClose();
						loadUIProps();
					}
				});
			}
		},
		"Delete"
	))), BdApi.React.createElement("div", { style: { width: "100%", height: "20px" } })));
}

function AutoColorwaySelector({ modalProps, onChange }) {
	const [autoId, setAutoId] = React.useState(betterdiscord.Data.load("settings").activeAutoPreset);
	return BdApi.React.createElement(ModalRoot, { ...modalProps }, BdApi.React.createElement(ModalHeader, null, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Auto Preset Settings")), BdApi.React.createElement(ModalContent, null, BdApi.React.createElement("div", { className: "dc-info-card", style: { marginTop: "1em" } }, BdApi.React.createElement("strong", null, "About the Auto Colorway"), BdApi.React.createElement("span", null, "The auto colorway allows you to use your system's accent color in combination with a selection of presets that will fully utilize it.")), BdApi.React.createElement("div", { style: { marginBottom: "20px" } }, BdApi.React.createElement(Forms.FormTitle, null, "Presets:"), Object.values(getAutoPresets()).map((autoPreset) => {
		return BdApi.React.createElement("div", { className: `${radioBarItem} ${radioBarItemFilled}`, "aria-checked": autoId === autoPreset.id }, BdApi.React.createElement(
			"div",
			{
				className: `${radioBar} ${radioPositionLeft}`,
				style: { padding: "10px" },
				onClick: () => {
					setAutoId(autoPreset.id);
				}
			},
			BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), autoId === autoPreset.id && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" })),
			BdApi.React.createElement(Text, { variant: "eyebrow", tag: "h5" }, autoPreset.name)
		));
	}))), BdApi.React.createElement(ModalFooter, null, BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.BRAND_NEW,
			size: Button.Sizes.MEDIUM,
			onClick: () => {
				betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), activeAutoPreset: autoId });
				onChange(autoId);
				modalProps.onClose();
			}
		},
		"Finish"
	), BdApi.React.createElement(
		Button,
		{
			style: { marginLeft: 8 },
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			onClick: () => {
				modalProps.onClose();
			}
		},
		"Cancel"
	)));
}

function OnDemandPage({ inModal }) {
	const [onDemand, setOnDemand] = React.useState(getSetting("onDemandWays"));
	const [onDemandTinted, setOnDemandTinted] = React.useState(getSetting("onDemandWaysTintedText"));
	const [onDemandDiscordSat, setOnDemandDiscordSat] = React.useState(getSetting("onDemandWaysDiscordSaturation"));
	const [onDemandOsAccent, setOnDemandOsAccent] = React.useState(!getComputedStyle(document.body).getPropertyValue("--os-accent-color") ? false : betterdiscord.Data.load("settings").onDemandWaysOsAccentColor);
	return BdApi.React.createElement(SettingsTab$1, { title: "On-Demand", inModal }, BdApi.React.createElement(
		Switch,
		{
			value: onDemand,
			onChange: (v) => {
				setOnDemand(v);
				betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), onDemandWays: v });
			},
			note: "Always utilise the latest of what DiscordColorways has to offer. CSS is being directly generated on the device and gets applied in the place of the normal import/CSS given by the colorway."
		},
		"Enable Colorways On Demand"
	), BdApi.React.createElement(
		Switch,
		{
			value: onDemandTinted,
			onChange: (v) => {
				setOnDemandTinted(v);
				betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), onDemandWaysTintedText: v });
			},
			disabled: !onDemand
		},
		"Use tinted text"
	), BdApi.React.createElement(
		Switch,
		{
			value: onDemandDiscordSat,
			onChange: (v) => {
				setOnDemandDiscordSat(v);
				betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), onDemandWaysDiscordSaturation: v });
			},
			disabled: !onDemand
		},
		"Use Discord's saturation"
	), BdApi.React.createElement(
		Switch,
		{
			hideBorder: true,
			value: onDemandOsAccent,
			onChange: (v) => {
				setOnDemandOsAccent(v);
				betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), onDemandWaysOsAccentColor: v });
			},
			disabled: !onDemand || !getComputedStyle(document.body).getPropertyValue("--os-accent-color")
		},
		"Use Operating System's Accent Color"
	));
}

const GithubIconLight = "/assets/3ff98ad75ac94fa883af5ed62d17c459.svg";
const GithubIconDark = "/assets/6a853b4c87fce386cbfef4a2efbacb09.svg";
function GithubIcon() {
	const src = getTheme() === Theme.Light ? GithubIconLight : GithubIconDark;
	return BdApi.React.createElement("img", { src, alt: "GitHub" });
}
function Store({ inModal }) {
	const [storeObject, setStoreObject] = React.useState([]);
	const [colorwaySourceFiles, setColorwaySourceFiles] = React.useState(getSetting("colorwayLists"));
	const [searchValue, setSearchValue] = React.useState("");
	React.useEffect(() => {
		if (!searchValue) {
			(async function() {
				const res = await fetch("https://dablulite.vercel.app/");
				const data = await res.json();
				setStoreObject(data.sources);
			})();
		}
	}, []);
	const { item: radioBarItem, itemFilled: radioBarItemFilled } = Webpack.getByKeys("radioBar");
	return BdApi.React.createElement(SettingsTab$1, { title: "Colorway Store", inModal }, BdApi.React.createElement(Flex, { style: { gap: "0", marginBottom: "8px" } }, BdApi.React.createElement(
		TextInput,
		{
			className: "colorwaySelector-search",
			placeholder: "Search for sources...",
			value: searchValue,
			onChange: setSearchValue
		}
	), BdApi.React.createElement(Tooltip, { text: "Refresh..." }, ({ onMouseEnter, onMouseLeave }) => BdApi.React.createElement(
		Button,
		{
			innerClassName: "colorwaysSettings-iconButtonInner",
			size: Button.Sizes.ICON,
			color: Button.Colors.PRIMARY,
			look: Button.Looks.OUTLINED,
			style: { marginLeft: "8px" },
			onMouseEnter,
			onMouseLeave,
			onClick: async function() {
				const res = await fetch("https://dablulite.vercel.app/");
				const data = await res.json();
				setStoreObject(data.sources);
				setColorwaySourceFiles(getSetting("colorwayLists"));
			}
		},
		BdApi.React.createElement(
			"svg",
			{
				xmlns: "http://www.w3.org/2000/svg",
				x: "0px",
				y: "0px",
				width: "20",
				height: "20",
				style: { padding: "6px", boxSizing: "content-box" },
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
		)
	))), BdApi.React.createElement(ScrollerThin, { orientation: "vertical", className: "colorwaysSettings-sourceScroller" }, storeObject.map(
		(item) => item.name.toLowerCase().includes(searchValue.toLowerCase()) ? BdApi.React.createElement("div", { className: `${radioBarItem} ${radioBarItemFilled} colorwaysSettings-colorwaySource`, style: { flexDirection: "column", padding: "16px", alignItems: "start" } }, BdApi.React.createElement(Flex, { flexDirection: "column", style: { gap: ".5rem", marginBottom: "8px" } }, BdApi.React.createElement(Text, { className: "colorwaysSettings-colorwaySourceLabelHeader" }, item.name), BdApi.React.createElement(Text, { className: "colorwaysSettings-colorwaySourceDesc" }, item.description), BdApi.React.createElement(Text, { className: "colorwaysSettings-colorwaySourceDesc", style: { opacity: ".8" } }, "by ", item.authorGh)), BdApi.React.createElement(Flex, { style: { gap: "8px", alignItems: "center", width: "100%" } }, BdApi.React.createElement(Link, { href: "https://github.com/" + item.authorGh }, BdApi.React.createElement(GithubIcon, null)), BdApi.React.createElement(
			Button,
			{
				innerClassName: "colorwaysSettings-iconButtonInner",
				size: Button.Sizes.SMALL,
				color: colorwaySourceFiles.map((source) => source.name).includes(item.name) ? Button.Colors.RED : Button.Colors.PRIMARY,
				look: Button.Looks.OUTLINED,
				style: { marginLeft: "auto" },
				onClick: async () => {
					if (colorwaySourceFiles.map((source) => source.name).includes(item.name)) {
						const sourcesArr = colorwaySourceFiles.filter((source) => source.name !== item.name);
						saveSettings({ colorwayLists: sourcesArr });
						setColorwaySourceFiles(sourcesArr);
					} else {
						const sourcesArr = [...colorwaySourceFiles, { name: item.name, url: item.url }];
						saveSettings({ colorwayLists: sourcesArr });
						setColorwaySourceFiles(sourcesArr);
					}
				}
			},
			colorwaySourceFiles.map((source) => source.name).includes(item.name) ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(DeleteIcon, { width: 14, height: 14 }), " Remove") : BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(DownloadIcon, { width: 14, height: 14 }), " Add to Sources")
		), BdApi.React.createElement(
			Button,
			{
				innerClassName: "colorwaysSettings-iconButtonInner",
				size: Button.Sizes.SMALL,
				color: Button.Colors.PRIMARY,
				look: Button.Looks.OUTLINED,
				onClick: async () => {
					openModal((props) => BdApi.React.createElement(Selector, { modalProps: props, settings: { selectorType: "preview", previewSource: item.url } }));
				}
			},
			BdApi.React.createElement(PalleteIcon, { width: 14, height: 14 }),
			" ",
			"Preview"
		))) : BdApi.React.createElement(BdApi.React.Fragment, null)
	)));
}

function SettingsPage({ inModal }) {
	const [colorways, setColorways] = React.useState([]);
	const [colorsButtonVisibility, setColorsButtonVisibility] = React.useState(getSetting("showColorwaysButton"));
	const [isButtonThin, setIsButtonThin] = React.useState(getSetting("useThinMenuButton"));
	const [showLabelsInSelectorGridView, setShowLabelsInSelectorGridView] = React.useState(getSetting("showLabelsInSelectorGridView"));
	React.useEffect(() => {
		(async function() {
			const responses = await Promise.all(
				getSetting("colorwayLists").map(
					({ url }) => fetch(url)
				)
			);
			const data = await Promise.all(
				responses.map(
					(res) => res.json()
				)
			);
			const colorways2 = data.flatMap((json) => json.colorways);
			setColorways(colorways2 || fallbackColorways);
		})();
	}, []);
	return BdApi.React.createElement(SettingsTab$1, { title: "Settings", inModal }, BdApi.React.createElement("div", { className: "colorwaysSettingsPage-wrapper" }, BdApi.React.createElement(Forms.FormTitle, { tag: "h5" }, "Quick Switch"), BdApi.React.createElement(
		Switch,
		{
			value: colorsButtonVisibility,
			onChange: (v) => {
				setColorsButtonVisibility(v);
				saveSettings({ showColorwaysButton: v });
				FluxDispatcher.dispatch({
					type: "COLORWAYS_UPDATE_BUTTON_VISIBILITY",
					isVisible: v
				});
			},
			note: "Shows a button on the top of the servers list that opens a colorway selector modal."
		},
		"Enable Quick Switch"
	), BdApi.React.createElement(
		Switch,
		{
			value: isButtonThin,
			onChange: (v) => {
				setIsButtonThin(v);
				saveSettings({ useThinMenuButton: v });
				FluxDispatcher.dispatch({
					type: "COLORWAYS_UPDATE_BUTTON_HEIGHT",
					isTall: v
				});
			},
			note: "Replaces the icon on the colorways launcher button with text, making it more compact."
		},
		"Use thin Quick Switch button"
	), BdApi.React.createElement(Forms.FormTitle, { tag: "h5" }, "Selector"), BdApi.React.createElement(
		Switch,
		{
			value: showLabelsInSelectorGridView,
			onChange: (v) => {
				setShowLabelsInSelectorGridView(v);
				saveSettings({ showLabelsInSelectorGridView: v });
			}
		},
		"Show labels in Grid View"
	), BdApi.React.createElement(Flex, { flexDirection: "column", style: { gap: 0 } }, BdApi.React.createElement("h1", { style: {
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
		Text,
		{
			variant: "text-xs/normal",
			style: {
				color: "var(--text-normal)",
				fontWeight: 500,
				fontSize: "14px",
				marginBottom: "12px"
			}
		},
		"by Project Colorway"
	), BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0 } }, "Plugin Version:"), BdApi.React.createElement(
		Text,
		{
			variant: "text-xs/normal",
			style: {
				color: "var(--text-muted)",
				fontWeight: 500,
				fontSize: "14px",
				marginBottom: "8px"
			}
		},
		plugin.version
	), BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0 } }, "Creator Version:"), BdApi.React.createElement(
		Text,
		{
			variant: "text-xs/normal",
			style: {
				color: "var(--text-muted)",
				fontWeight: 500,
				fontSize: "14px",
				marginBottom: "8px"
			}
		},
		plugin.creatorVersion
	), BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0 } }, "Loaded Colorways:"), BdApi.React.createElement(
		Text,
		{
			variant: "text-xs/normal",
			style: {
				color: "var(--text-muted)",
				fontWeight: 500,
				fontSize: "14px",
				marginBottom: "8px"
			}
		},
		[...colorways, ...betterdiscord.Data.load("custom_colorways").map((source) => source.colorways).flat(2)].length + 1
	), BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0 } }, "Project Repositories:"), BdApi.React.createElement(Forms.FormText, { style: { marginBottom: "8px" } }, BdApi.React.createElement(Link, { href: "https://github.com/DaBluLite/DiscordColorways" }, "DiscordColorways"), BdApi.React.createElement("br", null), BdApi.React.createElement(Link, { href: "https://github.com/DaBluLite/ProjectColorway" }, "Project Colorway")))));
}

var SettingsTab = ((SettingsTab2) => {
	SettingsTab2[SettingsTab2["Selector"] = 0] = "Selector";
	SettingsTab2[SettingsTab2["Settings"] = 1] = "Settings";
	SettingsTab2[SettingsTab2["Sources"] = 2] = "Sources";
	SettingsTab2[SettingsTab2["OnDemand"] = 3] = "OnDemand";
	SettingsTab2[SettingsTab2["Store"] = 4] = "Store";
	return SettingsTab2;
})(SettingsTab || {});
function SettingsModal({ tab = 1 /* Settings */ }) {
	const [currentTab, setCurrentTab] = React.useState(tab);
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(
		TabBar,
		{
			type: "top",
			look: "brand",
			className: "dc-settings-tab-bar",
			selectedItem: currentTab,
			onItemSelect: setCurrentTab
		},
		BdApi.React.createElement(
			TabBar.Item,
			{
				className: "dc-settings-tab-bar-item",
				id: 0 /* Selector */
			},
			"Colorways"
		),
		BdApi.React.createElement(
			TabBar.Item,
			{
				className: "dc-settings-tab-bar-item",
				id: 1 /* Settings */
			},
			"Settings"
		),
		BdApi.React.createElement(
			TabBar.Item,
			{
				className: "dc-settings-tab-bar-item",
				id: 2 /* Sources */
			},
			"Sources"
		),
		BdApi.React.createElement(
			TabBar.Item,
			{
				className: "dc-settings-tab-bar-item",
				id: 3 /* OnDemand */
			},
			"On-Demand"
		),
		BdApi.React.createElement(
			TabBar.Item,
			{
				className: "dc-settings-tab-bar-item",
				id: 4 /* Store */
			},
			"Store"
		)
	), currentTab === 0 /* Selector */ && BdApi.React.createElement(Selector, { modalProps: { transitionState: 1, onClose: () => new Promise(() => {
	}) }, isSettings: true, inModal: true }), currentTab === 1 /* Settings */ && BdApi.React.createElement(SettingsPage, { inModal: true }), currentTab === 2 /* Sources */ && BdApi.React.createElement(SourceManager, { inModal: true }), currentTab === 3 /* OnDemand */ && BdApi.React.createElement(OnDemandPage, { inModal: true }), currentTab === 4 /* Store */ && BdApi.React.createElement(Store, { inModal: true }));
}

const { SelectionCircle } = proxyLazy(() => betterdiscord.Webpack.getByKeys("SelectionCircle"));
function SelectorContainer({ children, isSettings, modalProps, inModal }) {
	if (!isSettings) {
		return BdApi.React.createElement(ModalRoot, { ...modalProps, className: "colorwaySelectorModal" }, children);
	} else {
		return BdApi.React.createElement(SettingsTab$1, { title: "Colors", inModal }, BdApi.React.createElement("div", { className: "colorwaysSettingsSelector-wrapper" }, children));
	}
}
function SelectorHeader({ children, isSettings }) {
	if (!isSettings) {
		return BdApi.React.createElement(ModalHeader, { separator: false }, children);
	} else {
		return BdApi.React.createElement(Flex, { style: { gap: "0" } }, children);
	}
}
function SelectorContent({ children, isSettings }) {
	if (!isSettings) {
		return BdApi.React.createElement(ModalContent, { className: "colorwaySelectorModalContent" }, children);
	} else {
		return BdApi.React.createElement(BdApi.React.Fragment, null, children);
	}
}
function Selector({
	modalProps,
	isSettings,
	settings = { selectorType: "normal" },
	inModal
}) {
	const [colorwayData, setColorwayData] = React.useState([]);
	const [searchValue, setSearchValue] = React.useState("");
	const [sortBy, setSortBy] = React.useState(1 /* NAME_AZ */);
	const [activeColorwayObject, setActiveColorwayObject] = React.useState(betterdiscord.Data.load("settings").activeColorwayObject || { id: null, css: null, sourceType: null, source: null });
	const [customColorwayData, setCustomColorwayData] = React.useState(settings.previewSource ? [] : betterdiscord.Data.load("custom_colorways").map((colorSrc) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
	const [loaderHeight, setLoaderHeight] = React.useState("2px");
	const [visibleSources, setVisibleSources] = React.useState("all");
	const [showReloadMenu, setShowReloadMenu] = React.useState(false);
	const [viewMode, setViewMode] = React.useState(betterdiscord.Data.load("settings").selectorViewMode || "grid");
	const [showLabelsInSelectorGridView, setShowLabelsInSelectorGridView] = React.useState(betterdiscord.Data.load("settings").showLabelsInSelectorGridView || false);
	const [showSortingMenu, setShowSotringMenu] = React.useState(false);
	const [selectedColorways, setSelectedColorways] = React.useState([]);
	const [errorCode, setErrorCode] = React.useState(0);
	const { item: radioBarItem, itemFilled: radioBarItemFilled } = betterdiscord.Webpack.getByKeys("radioBar");
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
			const onlineSources = getSetting("colorwayLists");
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
	function ReloadPopout(onClose) {
		return BdApi.React.createElement(
			Menu.Menu,
			{
				navId: "dc-reload-menu",
				onClose
			},
			BdApi.React.createElement(
				Menu.MenuItem,
				{
					id: "dc-force-reload",
					label: "Force Reload",
					action: () => loadUI(true)
				}
			)
		);
	}
	function SortingPopout(onClose) {
		return BdApi.React.createElement(
			Menu.Menu,
			{
				navId: "dc-selector-options-menu",
				onClose
			},
			BdApi.React.createElement(Menu.MenuGroup, { label: "View" }, BdApi.React.createElement(
				Menu.MenuRadioItem,
				{
					group: "selector-viewMode",
					id: "selector-viewMode_grid",
					label: "Grid",
					checked: viewMode === "grid",
					action: () => {
						setViewMode("grid");
						betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), selectorViewMode: "grid" });
					}
				}
			), BdApi.React.createElement(
				Menu.MenuRadioItem,
				{
					group: "selector-viewMode",
					id: "selector-viewMode_list",
					label: "List",
					checked: viewMode === "list",
					action: () => {
						setViewMode("list");
						betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), selectorViewMode: "list" });
					}
				}
			)),
			BdApi.React.createElement(Menu.MenuGroup, { label: "Sort By" }, BdApi.React.createElement(
				Menu.MenuRadioItem,
				{
					group: "sort-colorways",
					id: "sort-colorways_name-az",
					label: "Name (A-Z)",
					checked: sortBy === 1 /* NAME_AZ */,
					action: () => setSortBy(1 /* NAME_AZ */)
				}
			), BdApi.React.createElement(
				Menu.MenuRadioItem,
				{
					group: "sort-colorways",
					id: "sort-colorways_name-za",
					label: "Name (Z-A)",
					checked: sortBy === 2 /* NAME_ZA */,
					action: () => setSortBy(2 /* NAME_ZA */)
				}
			), BdApi.React.createElement(
				Menu.MenuRadioItem,
				{
					group: "sort-colorways",
					id: "sort-colorways_source-az",
					label: "Source (A-Z)",
					checked: sortBy === 3 /* SOURCE_AZ */,
					action: () => setSortBy(3 /* SOURCE_AZ */)
				}
			), BdApi.React.createElement(
				Menu.MenuRadioItem,
				{
					group: "sort-colorways",
					id: "sort-colorways_source-za",
					label: "Source (Z-A)",
					checked: sortBy === 4 /* SOURCE_ZA */,
					action: () => setSortBy(4 /* SOURCE_ZA */)
				}
			))
		);
	}
	return BdApi.React.createElement(SelectorContainer, { modalProps, isSettings, inModal }, BdApi.React.createElement(SelectorHeader, { isSettings }, settings.selectorType !== "preview" ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(
		TextInput,
		{
			className: "colorwaySelector-search",
			placeholder: "Search for Colorways...",
			value: searchValue,
			onChange: setSearchValue
		}
	), BdApi.React.createElement(Tooltip, { text: "Refresh Colorways..." }, ({ onMouseEnter, onMouseLeave }) => BdApi.React.createElement(
		Popout,
		{
			position: "bottom",
			align: "right",
			animation: Popout.Animation.NONE,
			shouldShow: showReloadMenu,
			onRequestClose: () => setShowReloadMenu(false),
			renderPopout: () => ReloadPopout(() => setShowReloadMenu(false))
		},
		(_, { isShown }) => BdApi.React.createElement(
			Button,
			{
				innerClassName: "colorwaysSettings-iconButtonInner",
				size: Button.Sizes.ICON,
				color: Button.Colors.PRIMARY,
				look: Button.Looks.OUTLINED,
				style: { marginLeft: "8px" },
				id: "colorway-refreshcolorway",
				onMouseEnter: isShown ? () => {
				} : onMouseEnter,
				onMouseLeave: isShown ? () => {
				} : onMouseLeave,
				onClick: () => {
					setLoaderHeight("2px");
					loadUI().then(() => setLoaderHeight("0px"));
				},
				onContextMenu: () => {
					onMouseLeave();
					setShowReloadMenu(!showReloadMenu);
				}
			},
			BdApi.React.createElement(
				"svg",
				{
					xmlns: "http://www.w3.org/2000/svg",
					x: "0px",
					y: "0px",
					width: "20",
					height: "20",
					style: { padding: "6px", boxSizing: "content-box" },
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
			)
		)
	)), BdApi.React.createElement(Tooltip, { text: "Create Colorway..." }, ({ onMouseEnter, onMouseLeave }) => BdApi.React.createElement(
		Button,
		{
			innerClassName: "colorwaysSettings-iconButtonInner",
			size: Button.Sizes.ICON,
			color: Button.Colors.PRIMARY,
			look: Button.Looks.OUTLINED,
			style: { marginLeft: "8px" },
			onMouseEnter,
			onMouseLeave,
			onClick: () => openModal((props) => BdApi.React.createElement(
				CreatorModal,
				{
					modalProps: props,
					loadUIProps: loadUI
				}
			))
		},
		BdApi.React.createElement(PlusIcon, { width: 20, height: 20, style: { padding: "6px", boxSizing: "content-box" } })
	)), BdApi.React.createElement(Tooltip, { text: "Selector Options" }, ({ onMouseEnter, onMouseLeave }) => BdApi.React.createElement(
		Popout,
		{
			position: "bottom",
			align: "right",
			animation: Popout.Animation.NONE,
			shouldShow: showSortingMenu,
			onRequestClose: () => setShowSotringMenu(false),
			renderPopout: () => SortingPopout(() => setShowSotringMenu(false))
		},
		(_, { isShown }) => BdApi.React.createElement(
			Button,
			{
				innerClassName: "colorwaysSettings-iconButtonInner",
				size: Button.Sizes.ICON,
				color: Button.Colors.PRIMARY,
				look: Button.Looks.OUTLINED,
				style: { marginLeft: "8px" },
				onMouseEnter: isShown ? () => {
				} : onMouseEnter,
				onMouseLeave: isShown ? () => {
				} : onMouseLeave,
				onClick: () => {
					onMouseLeave();
					setShowSotringMenu(!showSortingMenu);
				}
			},
			BdApi.React.createElement(MoreIcon, { width: 20, height: 20, style: { padding: "6px", boxSizing: "content-box" } })
		)
	)), BdApi.React.createElement(Tooltip, { text: "Open Color Stealer" }, ({ onMouseEnter, onMouseLeave }) => BdApi.React.createElement(
		Button,
		{
			innerClassName: "colorwaysSettings-iconButtonInner",
			size: Button.Sizes.ICON,
			color: Button.Colors.PRIMARY,
			look: Button.Looks.OUTLINED,
			style: { marginLeft: "8px" },
			id: "colorway-opencolorstealer",
			onMouseEnter,
			onMouseLeave,
			onClick: () => openModal((props) => BdApi.React.createElement(ColorPicker, { modalProps: props }))
		},
		BdApi.React.createElement(PalleteIcon, { width: 20, height: 20, style: { padding: "6px", boxSizing: "content-box" } })
	)), isSettings ? BdApi.React.createElement(
		Select,
		{
			className: "colorwaySelector-sources " + ButtonLooks.OUTLINED + " colorwaySelector-sources_settings",
			look: 1,
			popoutClassName: "colorwaySelector-sourceSelect",
			options: filters.map((filter) => ({ label: filter.name, value: filter.id })),
			select: (value) => setVisibleSources(value),
			isSelected: (value) => visibleSources === value,
			serialize: String,
			popoutPosition: "bottom"
		}
	) : BdApi.React.createElement(BdApi.React.Fragment, null)) : BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Preview...")), BdApi.React.createElement(SelectorContent, { isSettings }, BdApi.React.createElement("div", { className: "colorwaysLoader-barContainer" }, BdApi.React.createElement("div", { className: "colorwaysLoader-bar", style: { height: loaderHeight } })), settings.selectorType === "multiple-selection" && BdApi.React.createElement(Forms.FormTitle, null, "Available"), BdApi.React.createElement(ScrollerThin, { style: { maxHeight: settings.selectorType === "multiple-selection" ? "50%" : isSettings ? "unset" : "450px" }, className: "ColorwaySelectorWrapper " + (viewMode === "grid" ? "ColorwaySelectorWrapper-grid" : "ColorwaySelectorWrapper-list") + (showLabelsInSelectorGridView ? " colorwaySelector-gridWithLabels" : "") }, activeColorwayObject.sourceType === "temporary" && settings.selectorType === "normal" && settings.selectorType === "normal" && BdApi.React.createElement(Tooltip, { text: "Temporary Colorway" }, ({ onMouseEnter, onMouseLeave }) => BdApi.React.createElement(
		"div",
		{
			className: viewMode === "grid" ? "discordColorway" : `${radioBarItem} ${radioBarItemFilled} discordColorway-listItem`,
			id: "colorway-Temporary",
			"aria-checked": activeColorwayObject.id === "Auto" && activeColorwayObject.source === null,
			onMouseEnter: viewMode === "grid" ? onMouseEnter : () => {
			},
			onMouseLeave: viewMode === "grid" ? onMouseLeave : () => {
			},
			onClick: async () => {
				betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), activeColorwayObject: { id: null, css: null, sourceType: null, source: null } });
				setActiveColorwayObject({ id: null, css: null, sourceType: null, source: null });
				ColorwayCSS.remove();
			}
		},
		viewMode === "list" && BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), activeColorwayObject.id === "Temporary Colorway" && activeColorwayObject.sourceType === "temporary" && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", fill: "currentColor" })),
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
		BdApi.React.createElement("div", { className: "colorwaySelectionCircle" }, activeColorwayObject.id === "Temporary Colorway" && activeColorwayObject.sourceType === "temporary" && viewMode === "grid" && BdApi.React.createElement(SelectionCircle, null)),
		(showLabelsInSelectorGridView || viewMode === "list") && BdApi.React.createElement(Text, { className: "colorwayLabel" + (showLabelsInSelectorGridView && viewMode === "grid" ? " labelInGrid" : "") }, "Temporary Colorway"),
		viewMode === "list" && BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(Tooltip, { text: "Add Colorway" }, ({ onMouseEnter: onMouseEnter2, onMouseLeave: onMouseLeave2 }) => BdApi.React.createElement(
			Button,
			{
				innerClassName: "colorwaysSettings-iconButtonInner",
				size: Button.Sizes.ICON,
				color: Button.Colors.PRIMARY,
				look: Button.Looks.OUTLINED,
				onMouseEnter: onMouseEnter2,
				onMouseLeave: onMouseLeave2,
				onClick: async (e) => {
					e.stopPropagation();
					const colorwayID = stringToHex(`#${colorToHex(getHex(getComputedStyle(document.body).getPropertyValue("--brand-500")))},#${colorToHex(getHex(getComputedStyle(document.body).getPropertyValue("--background-primary")))},#${colorToHex(getHex(getComputedStyle(document.body).getPropertyValue("--background-secondary")))},#${colorToHex(getHex(getComputedStyle(document.body).getPropertyValue("--background-tertiary")))}`);
					openModal((props) => BdApi.React.createElement(CreatorModal, { modalProps: props, colorwayID, loadUIProps: loadUI }));
				}
			},
			BdApi.React.createElement(PlusIcon, { width: 20, height: 20 })
		)))
	)), getComputedStyle(document.body).getPropertyValue("--os-accent-color") && ["all", "official"].includes(visibleSources) && settings.selectorType === "normal" && "auto".includes(searchValue.toLowerCase()) ? BdApi.React.createElement(Tooltip, { text: "Auto" }, ({ onMouseEnter, onMouseLeave }) => BdApi.React.createElement(
		"div",
		{
			className: viewMode === "grid" ? "discordColorway" : `${radioBarItem} ${radioBarItemFilled} discordColorway-listItem`,
			id: "colorway-Auto",
			"aria-checked": activeColorwayObject.id === "Auto" && activeColorwayObject.source === null,
			onMouseEnter: viewMode === "grid" ? onMouseEnter : () => {
			},
			onMouseLeave: viewMode === "grid" ? onMouseLeave : () => {
			},
			onClick: async () => {
				const activeAutoPreset = betterdiscord.Data.load("settings").activeAutoPreset;
				if (activeColorwayObject.id === "Auto") {
					betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), activeColorwayObject: { id: null, css: null, sourceType: null, source: null } });
					setActiveColorwayObject({ id: null, css: null, sourceType: null, source: null });
					ColorwayCSS.remove();
				} else {
					if (!activeAutoPreset) {
						openModal((props) => BdApi.React.createElement(AutoColorwaySelector, { modalProps: props, onChange: (autoPresetId) => {
							const demandedColorway = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[autoPresetId].preset();
							ColorwayCSS.set(demandedColorway);
							saveSettings({ activeColorwayObject: { id: "Auto", css: demandedColorway, sourceType: "online", source: null } });
							setActiveColorwayObject({ id: "Auto", css: demandedColorway, sourceType: "online", source: null });
						} }));
					} else {
						const autoColorway = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].preset();
						saveSettings({ activeColorwayObject: { id: "Auto", css: autoColorway, sourceType: "online", source: null } });
						setActiveColorwayObject({ id: "Auto", css: autoColorway, sourceType: "online", source: null });
						ColorwayCSS.set(autoColorway);
					}
				}
			}
		},
		viewMode === "list" && BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), activeColorwayObject.id === "Auto" && activeColorwayObject.source === null && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", fill: "currentColor" })),
		BdApi.React.createElement("div", { className: "discordColorwayPreviewColorContainer", style: { backgroundColor: "var(--os-accent-color)" } }),
		BdApi.React.createElement("div", { className: "colorwaySelectionCircle" }, activeColorwayObject.id === "Auto" && activeColorwayObject.source === null && viewMode === "grid" && BdApi.React.createElement(SelectionCircle, null)),
		(showLabelsInSelectorGridView || viewMode === "list") && BdApi.React.createElement(Text, { className: "colorwayLabel" + (showLabelsInSelectorGridView && viewMode === "grid" ? " labelInGrid" : "") }, "Auto"),
		BdApi.React.createElement(
			"div",
			{
				className: "colorwayInfoIconContainer",
				onClick: async (e) => {
					e.stopPropagation();
					openModal((props) => BdApi.React.createElement(AutoColorwaySelector, { modalProps: props, onChange: (autoPresetId) => {
						if (activeColorwayObject.id === "Auto") {
							const demandedColorway = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[autoPresetId].preset();
							saveSettings({ activeColorwayObject: { id: "Auto", css: demandedColorway, sourceType: "online", source: null } });
							setActiveColorwayObject({ id: "Auto", css: demandedColorway, sourceType: "online", source: null });
							ColorwayCSS.set(demandedColorway);
						}
					} }));
				}
			},
			BdApi.React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", style: { margin: "4px" }, viewBox: "0 0 24 24", fill: "currentColor" }, BdApi.React.createElement("path", { d: "M 21.2856,9.6 H 24 v 4.8 H 21.2868 C 20.9976,15.5172 20.52,16.5576 19.878,17.4768 L 21.6,19.2 19.2,21.6 17.478,19.8768 c -0.9216,0.642 -1.9596,1.1208 -3.078,1.4088 V 24 H 9.6 V 21.2856 C 8.4828,20.9976 7.4436,20.5188 6.5232,19.8768 L 4.8,21.6 2.4,19.2 4.1232,17.4768 C 3.4812,16.5588 3.0024,15.5184 2.7144,14.4 H 0 V 9.6 H 2.7144 C 3.0024,8.4816 3.48,7.4424 4.1232,6.5232 L 2.4,4.8 4.8,2.4 6.5232,4.1232 C 7.4424,3.48 8.4816,3.0024 9.6,2.7144 V 0 h 4.8 v 2.7132 c 1.1184,0.2892 2.1564,0.7668 3.078,1.4088 l 1.722,-1.7232 2.4,2.4 -1.7232,1.7244 c 0.642,0.9192 1.1208,1.9596 1.4088,3.0768 z M 12,16.8 c 2.65092,0 4.8,-2.14908 4.8,-4.8 0,-2.650968 -2.14908,-4.8 -4.8,-4.8 -2.650968,0 -4.8,2.149032 -4.8,4.8 0,2.65092 2.149032,4.8 4.8,4.8 z" }))
		)
	)) : BdApi.React.createElement(BdApi.React.Fragment, null), (!getComputedStyle(document.body).getPropertyValue("--os-accent-color") || !["all", "official"].includes(visibleSources)) && !filters.filter((filter) => filter.id === visibleSources)[0].sources.map((source) => source.colorways).flat().length ? BdApi.React.createElement(
		Forms.FormTitle,
		{
			style: {
				marginBottom: 0,
				width: "100%",
				textAlign: "center"
			}
		},
		"No colorways..."
	) : BdApi.React.createElement(BdApi.React.Fragment, null), errorCode !== 0 && BdApi.React.createElement(
		Forms.FormTitle,
		{
			style: {
				marginBottom: 0,
				width: "100%",
				textAlign: "center"
			}
		},
		errorCode === 1 && "Error: Invalid Colorway Source Format. If this error persists, contact the source author to resolve the issue."
	), filters.map((filter) => filter.id).includes(visibleSources) && filters.filter((filter) => filter.id === visibleSources)[0].sources.map(({ colorways, source, type }) => colorways.map((colorway) => ({ ...colorway, sourceType: type, source, preset: colorway.preset || (colorway.isGradient ? "Gradient" : "Default") }))).flat().sort((a, b) => {
		switch (sortBy) {
			case 1 /* NAME_AZ */:
				return a.name.localeCompare(b.name);
			case 2 /* NAME_ZA */:
				return b.name.localeCompare(a.name);
			case 3 /* SOURCE_AZ */:
				return a.source.localeCompare(b.source);
			case 4 /* SOURCE_ZA */:
				return b.source.localeCompare(a.source);
			default:
				return a.name.localeCompare(b.name);
		}
	}).map((color) => {
		const colors = color.colors || [
			"accent",
			"primary",
			"secondary",
			"tertiary"
		];
		return color.name.toLowerCase().includes(searchValue.toLowerCase()) ? BdApi.React.createElement(Tooltip, { text: color.name }, ({ onMouseEnter, onMouseLeave }) => {
			return BdApi.React.createElement(
				"div",
				{
					className: viewMode === "grid" ? "discordColorway" : `${radioBarItem} ${radioBarItemFilled} discordColorway-listItem`,
					id: "colorway-" + color.name,
					onMouseEnter: viewMode === "grid" ? onMouseEnter : () => {
					},
					onMouseLeave: viewMode === "grid" ? onMouseLeave : () => {
					},
					"aria-checked": activeColorwayObject.id === color.name && activeColorwayObject.source === color.source,
					onClick: async () => {
						if (settings.selectorType === "normal") {
							const [
								onDemandWays,
								onDemandWaysTintedText,
								onDemandWaysDiscordSaturation,
								onDemandWaysOsAccentColor
							] = getBulkSetting(
								"onDemandWays",
								"onDemandWaysTintedText",
								"onDemandWaysDiscordSaturation",
								"onDemandWaysOsAccentColor"
							);
							if (activeColorwayObject.id === color.name && activeColorwayObject.source === color.source) {
								saveSettings({ activeColorwayObject: { id: null, css: null, sourceType: null, source: null } });
								setActiveColorwayObject({ id: null, css: null, sourceType: null, source: null });
								ColorwayCSS.remove();
							} else {
								if (onDemandWays) {
									const demandedColorway = !color.isGradient ? generateCss(
										colorToHex(color.primary),
										colorToHex(color.secondary),
										colorToHex(color.tertiary),
										colorToHex(onDemandWaysOsAccentColor ? getComputedStyle(document.body).getPropertyValue("--os-accent-color") : color.accent).slice(0, 6),
										onDemandWaysTintedText,
										onDemandWaysDiscordSaturation,
										void 0,
										color.name
									) : gradientBase(colorToHex(onDemandWaysOsAccentColor ? getComputedStyle(document.body).getPropertyValue("--os-accent-color") : color.accent), onDemandWaysDiscordSaturation) + `:root:root {--custom-theme-background: linear-gradient(${color.linearGradient})}`;
									ColorwayCSS.set(demandedColorway);
									setActiveColorwayObject({ id: color.name, css: demandedColorway, sourceType: color.type, source: color.source });
									saveSettings({ activeColorwayObject: { id: color.name, css: demandedColorway, sourceType: color.type, source: color.source } });
								} else {
									ColorwayCSS.set(color["dc-import"]);
									setActiveColorwayObject({ id: color.name, css: color["dc-import"], sourceType: color.type, source: color.source });
									saveSettings({ activeColorwayObject: { id: color.name, css: color["dc-import"], sourceType: color.type, source: color.source } });
								}
							}
						}
						if (settings.selectorType === "multiple-selection") {
							setSelectedColorways([...selectedColorways, color]);
						}
					}
				},
				viewMode === "list" && settings.selectorType === "normal" && BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), activeColorwayObject.id === color.name && activeColorwayObject.source === color.source && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" })),
				BdApi.React.createElement("div", { className: "discordColorwayPreviewColorContainer" }, !color.isGradient ? colors.map((colorItm) => BdApi.React.createElement(
					"div",
					{
						className: "discordColorwayPreviewColor",
						style: {
							backgroundColor: color[colorItm]
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
				settings.selectorType === "normal" && BdApi.React.createElement("div", { className: "colorwaySelectionCircle" }, activeColorwayObject.id === color.name && activeColorwayObject.source === color.source && viewMode === "grid" && BdApi.React.createElement(SelectionCircle, null)),
				(showLabelsInSelectorGridView || viewMode === "list") && BdApi.React.createElement(Text, { className: "colorwayLabel" + (showLabelsInSelectorGridView && viewMode === "grid" ? " labelInGrid" : "") }, color.name),
				settings.selectorType === "normal" && BdApi.React.createElement(
					"div",
					{
						className: "colorwayInfoIconContainer",
						onClick: (e) => {
							e.stopPropagation();
							openModal((props) => BdApi.React.createElement(
								ColorwayInfoModal,
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
				viewMode === "list" && BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(Tooltip, { text: "Copy Colorway CSS" }, ({ onMouseEnter: onMouseEnter2, onMouseLeave: onMouseLeave2 }) => BdApi.React.createElement(
					Button,
					{
						innerClassName: "colorwaysSettings-iconButtonInner",
						size: Button.Sizes.ICON,
						color: Button.Colors.PRIMARY,
						look: Button.Looks.OUTLINED,
						onMouseEnter: onMouseEnter2,
						onMouseLeave: onMouseLeave2,
						onClick: async (e) => {
							e.stopPropagation();
							Clipboard.copy(color["dc-import"]);
							Toasts.show({
								message: "Copied Colorway CSS Successfully",
								type: 1,
								id: "copy-colorway-css-notify"
							});
						}
					},
					BdApi.React.createElement(CodeIcon, { width: 20, height: 20 })
				)), BdApi.React.createElement(Tooltip, { text: "Copy Colorway ID" }, ({ onMouseEnter: onMouseEnter2, onMouseLeave: onMouseLeave2 }) => BdApi.React.createElement(
					Button,
					{
						innerClassName: "colorwaysSettings-iconButtonInner",
						size: Button.Sizes.ICON,
						color: Button.Colors.PRIMARY,
						look: Button.Looks.OUTLINED,
						onMouseEnter: onMouseEnter2,
						onMouseLeave: onMouseLeave2,
						onClick: async (e) => {
							e.stopPropagation();
							const colorwayIDArray = `${color.accent},${color.primary},${color.secondary},${color.tertiary}|n:${color.name}${color.preset ? `|p:${color.preset}` : ""}`;
							const colorwayID = stringToHex(colorwayIDArray);
							Clipboard.copy(colorwayID);
							Toasts.show({
								message: "Copied Colorway ID Successfully",
								type: 1,
								id: "copy-colorway-id-notify"
							});
						}
					},
					BdApi.React.createElement(IDIcon, { width: 20, height: 20 })
				)), color.sourceType === "offline" && settings.selectorType !== "preview" && BdApi.React.createElement(Tooltip, { text: "Delete Colorway" }, ({ onMouseEnter: onMouseEnter2, onMouseLeave: onMouseLeave2 }) => BdApi.React.createElement(
					Button,
					{
						innerClassName: "colorwaysSettings-iconButtonInner",
						size: Button.Sizes.ICON,
						color: Button.Colors.RED,
						look: Button.Looks.OUTLINED,
						onMouseEnter: onMouseEnter2,
						onMouseLeave: onMouseLeave2,
						onClick: async (e) => {
							e.stopPropagation();
							const oldStores = betterdiscord.Data.load("custom_colorways").filter((sourcee) => sourcee.name !== color.source);
							const storeToModify = betterdiscord.Data.load("custom_colorways").filter((sourcee) => sourcee.name === color.source)[0];
							const newStore = { name: storeToModify.name, colorways: storeToModify.colorways.filter((colorway) => colorway.name !== color.name) };
							betterdiscord.Data.save("custom_colorways", [...oldStores, newStore]);
							setCustomColorwayData([...oldStores, newStore].map((colorSrc) => ({ type: "offline", source: colorSrc.name, colorways: colorSrc.colorways })));
							if (getSetting("activeColorwayObject").id === color.name) {
								saveSettings({ activeColorwayObject: { id: null, css: null, sourceType: null, source: null } });
								setActiveColorwayObject({ id: null, css: null, sourceType: null, source: null });
								ColorwayCSS.remove();
							}
						}
					},
					BdApi.React.createElement(DeleteIcon, { width: 20, height: 20 })
				)))
			);
		}) : BdApi.React.createElement(BdApi.React.Fragment, null);
	})), settings.selectorType === "multiple-selection" && BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(Forms.FormTitle, { style: { marginTop: "8px" } }, "Selected"), BdApi.React.createElement(ScrollerThin, { style: { maxHeight: "50%" }, className: "ColorwaySelectorWrapper " + (viewMode === "grid" ? "ColorwaySelectorWrapper-grid" : "ColorwaySelectorWrapper-list") + (showLabelsInSelectorGridView ? " colorwaySelector-gridWithLabels" : "") }, selectedColorways.map((color, i) => {
		const colors = color.colors || [
			"accent",
			"primary",
			"secondary",
			"tertiary"
		];
		return BdApi.React.createElement(Tooltip, { text: color.name }, ({ onMouseEnter, onMouseLeave }) => {
			return BdApi.React.createElement(
				"div",
				{
					className: viewMode === "grid" ? "discordColorway" : `${radioBarItem} ${radioBarItemFilled} discordColorway-listItem`,
					id: "colorway-" + color.name,
					onMouseEnter: viewMode === "grid" ? onMouseEnter : () => {
					},
					onMouseLeave: viewMode === "grid" ? onMouseLeave : () => {
					},
					"aria-checked": activeColorwayObject.id === color.name && activeColorwayObject.source === color.source,
					onClick: () => setSelectedColorways(selectedColorways.filter((colorway, ii) => ii !== i))
				},
				viewMode === "list" && BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), activeColorwayObject.id === color.name && activeColorwayObject.source === color.source && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" })),
				BdApi.React.createElement("div", { className: "discordColorwayPreviewColorContainer" }, !color.isGradient ? colors.map((colorItm) => BdApi.React.createElement(
					"div",
					{
						className: "discordColorwayPreviewColor",
						style: {
							backgroundColor: color[colorItm]
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
				BdApi.React.createElement("div", { className: "colorwaySelectionCircle" }, activeColorwayObject.id === color.name && activeColorwayObject.source === color.source && viewMode === "grid" && BdApi.React.createElement(SelectionCircle, null)),
				(showLabelsInSelectorGridView || viewMode === "list") && BdApi.React.createElement(Text, { className: "colorwayLabel" + (showLabelsInSelectorGridView && viewMode === "grid" ? " labelInGrid" : "") }, color.name),
				viewMode === "list" && BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(Tooltip, { text: "Copy Colorway CSS" }, ({ onMouseEnter: onMouseEnter2, onMouseLeave: onMouseLeave2 }) => BdApi.React.createElement(
					Button,
					{
						innerClassName: "colorwaysSettings-iconButtonInner",
						size: Button.Sizes.ICON,
						color: Button.Colors.PRIMARY,
						look: Button.Looks.OUTLINED,
						onMouseEnter: onMouseEnter2,
						onMouseLeave: onMouseLeave2,
						onClick: async (e) => {
							e.stopPropagation();
							Clipboard.copy(color["dc-import"]);
							Toasts.show({
								message: "Copied Colorway CSS Successfully",
								type: 1,
								id: "copy-colorway-css-notify"
							});
						}
					},
					BdApi.React.createElement(CodeIcon, { width: 20, height: 20 })
				)), BdApi.React.createElement(Tooltip, { text: "Copy Colorway ID" }, ({ onMouseEnter: onMouseEnter2, onMouseLeave: onMouseLeave2 }) => BdApi.React.createElement(
					Button,
					{
						innerClassName: "colorwaysSettings-iconButtonInner",
						size: Button.Sizes.ICON,
						color: Button.Colors.PRIMARY,
						look: Button.Looks.OUTLINED,
						onMouseEnter: onMouseEnter2,
						onMouseLeave: onMouseLeave2,
						onClick: async (e) => {
							e.stopPropagation();
							const colorwayIDArray = `${color.accent},${color.primary},${color.secondary},${color.tertiary}|n:${color.name}${color.preset ? `|p:${color.preset}` : ""}`;
							const colorwayID = stringToHex(colorwayIDArray);
							Clipboard.copy(colorwayID);
							Toasts.show({
								message: "Copied Colorway ID Successfully",
								type: 1,
								id: "copy-colorway-id-notify"
							});
						}
					},
					BdApi.React.createElement(IDIcon, { width: 20, height: 20 })
				)))
			);
		});
	})))), !isSettings && settings.selectorType !== "preview" ? BdApi.React.createElement(ModalFooter, null, BdApi.React.createElement(
		Button,
		{
			size: Button.Sizes.MEDIUM,
			color: Button.Colors.PRIMARY,
			look: Button.Looks.OUTLINED,
			style: { marginLeft: "8px" },
			onClick: () => openModal((props) => BdApi.React.createElement(ModalRoot, { ...props, size: "medium" }, BdApi.React.createElement(ModalHeader, { separator: false }, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Settings")), BdApi.React.createElement(ModalContent, null, BdApi.React.createElement(SettingsModal, null))))
		},
		"Settings"
	), BdApi.React.createElement(
		Button,
		{
			size: Button.Sizes.MEDIUM,
			color: Button.Colors.PRIMARY,
			look: Button.Looks.OUTLINED,
			onClick: () => modalProps.onClose()
		},
		"Close"
	), BdApi.React.createElement(
		Select,
		{
			className: "colorwaySelector-sources " + ButtonLooks.OUTLINED,
			look: 1,
			popoutClassName: "colorwaySelector-sourceSelect",
			options: filters.map((filter) => {
				return { label: filter.name, value: filter.id };
			}),
			select: (value) => setVisibleSources(value),
			isSelected: (value) => visibleSources === value,
			serialize: String,
			popoutPosition: "top"
		}
	)) : BdApi.React.createElement(BdApi.React.Fragment, null));
}

function ColorwaysButton() {
	const [activeColorway, setActiveColorway] = React.useState("None");
	const [visibility, setVisibility] = React.useState(betterdiscord.Data.load("settings").showInGuildBar);
	const [isThin, setIsThin] = React.useState(betterdiscord.Data.load("settings").isButtonThin);
	FluxDispatcher.subscribe("COLORWAYS_UPDATE_BUTTON_HEIGHT", ({ isTall }) => {
		setIsThin(isTall);
	});
	FluxDispatcher.subscribe("COLORWAYS_UPDATE_BUTTON_VISIBILITY", ({ isVisible }) => {
		setVisibility(isVisible);
	});
	return BdApi.React.createElement(
		Tooltip,
		{
			text: BdApi.React.createElement(BdApi.React.Fragment, null, !isThin ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("span", null, "Colorways"), BdApi.React.createElement(Text, { variant: "text-xs/normal", style: { color: "var(--text-muted)", fontWeight: 500 } }, "Active Colorway: " + activeColorway)) : BdApi.React.createElement("span", null, "Active Colorway: " + activeColorway), getSetting("activeColorwayObject").id === "Auto" ? BdApi.React.createElement(Text, { variant: "text-xs/normal", style: { color: "var(--text-muted)", fontWeight: 500 } }, "Auto Preset: " + getAutoPresets()[betterdiscord.Data.load("settings").activeAutoPreset].name) : BdApi.React.createElement(BdApi.React.Fragment, null)),
			position: "right",
			tooltipContentClassName: "colorwaysBtn-tooltipContent"
		},
		({ onMouseEnter, onMouseLeave, onClick }) => visibility ? BdApi.React.createElement("div", { className: "ColorwaySelectorBtnContainer" }, BdApi.React.createElement(
			"div",
			{
				className: "ColorwaySelectorBtn" + (isThin ? " ColorwaySelectorBtn_thin" : ""),
				onMouseEnter: () => {
					onMouseEnter();
					setActiveColorway(getSetting("activeColorwayObject").id || "None");
				},
				onMouseLeave,
				onClick: () => {
					onClick();
					openModal((props) => BdApi.React.createElement(Selector, { modalProps: props }));
				}
			},
			isThin ? BdApi.React.createElement(Text, { variant: "text-xs/normal", style: { color: "var(--header-primary)", fontWeight: 700, fontSize: 9 } }, "Colorways") : BdApi.React.createElement(PalleteIcon, null)
		)) : BdApi.React.createElement(BdApi.React.Fragment, null)
	);
}

const css = "/* stylelint-disable no-descending-specificity */\n/* stylelint-disable declaration-block-no-redundant-longhand-properties */\n/* stylelint-disable selector-id-pattern */\n/* stylelint-disable selector-class-pattern */\n@import url(\"https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css\");\n\n.ColorwaySelectorBtn {\n  	height: 48px;\n  	width: 48px;\n  	border-radius: 50px;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	transition: .15s ease-out;\n  	background-color: var(--background-primary);\n  	cursor: pointer;\n  	color: var(--text-normal);\n}\n\n.ColorwaySelectorBtn:hover {\n  	background-color: var(--brand-experiment);\n  	border-radius: 16px;\n}\n\n.discordColorway {\n  	width: 56px;\n  	cursor: pointer;\n  	display: flex;\n  	flex-direction: column;\n  	position: relative;\n  	align-items: center;\n  	transition: 170ms ease;\n}\n\n.discordColorway:hover {\n  	filter: brightness(.8);\n}\n\n.discordColorwayPreviewColorContainer {\n  	display: flex;\n  	flex-flow: wrap;\n  	flex-direction: row;\n  	overflow: hidden;\n  	border-radius: 50%;\n  	width: 56px;\n  	height: 56px;\n  	box-shadow: 0 0 0 1.5px var(--interactive-normal);\n  	box-sizing: border-box;\n}\n\n.discordColorwayPreviewColor {\n  	width: 50%;\n  	height: 50%;\n}\n\n.discordColorwayPreviewColorContainer:not(:has(>.discordColorwayPreviewColor:nth-child(2)))>.discordColorwayPreviewColor {\n  	height: 100%;\n  	width: 100%;\n}\n\n.discordColorwayPreviewColorContainer:not(:has(>.discordColorwayPreviewColor:nth-child(3)))>.discordColorwayPreviewColor {\n  	height: 100%;\n}\n\n.discordColorwayPreviewColorContainer:not(:has(>.discordColorwayPreviewColor:nth-child(4)))>.discordColorwayPreviewColor:nth-child(3) {\n  	width: 100%;\n}\n\n.ColorwaySelectorWrapper {\n  	position: relative;\n  	display: flex;\n  	gap: 16px 28px;\n  	width: 100%;\n  	flex-wrap: wrap;\n  	padding: 2px;\n  	scrollbar-width: none !important;\n}\n\n.ColorwaySelectorWrapper::-webkit-scrollbar {\n  	width: 0;\n}\n\n.colorwaySelectorModal {\n  	width: 100% !important;\n  	min-width: 596px !important;\n}\n\n.colorwaySelectorModalContent {\n  	display: flex;\n  	flex-direction: column;\n  	width: 100%;\n  	max-width: 596px;\n  	overflow: visible !important;\n  	padding: 0 16px !important;\n}\n\n.ColorwaySelectorBtnContainer {\n  	position: relative;\n  	margin: 0 0 8px;\n  	display: flex;\n  	-webkit-box-pack: center;\n  	-ms-flex-pack: center;\n  	justify-content: center;\n  	width: 72px;\n}\n\n.colorwayInfoIconContainer {\n  	height: 22px;\n  	width: 22px;\n  	background-color: var(--brand-500);\n  	position: absolute;\n  	top: -1px;\n  	left: -1px;\n  	border-radius: 50%;\n  	opacity: 0;\n  	z-index: +1;\n  	color: var(--white-500);\n  	padding: 1px;\n  	box-sizing: border-box;\n}\n\n.colorwayInfoIconContainer:hover {\n  	background-color: var(--brand-experiment-560);\n}\n\n.discordColorway:hover .colorwayInfoIconContainer {\n  	opacity: 1;\n  	transition: .15s;\n}\n\n.colorwayCreator-swatch {\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	height: 50px;\n  	border-radius: 4px;\n  	box-sizing: border-box;\n  	border: none;\n  	width: 100%;\n  	position: relative;\n  	color: #fff;\n}\n\n.colorwayCreator-swatchName {\n  	color: currentcolor;\n  	pointer-events: none;\n}\n\n.colorwayCreator-colorPreviews {\n  	width: 100%;\n  	height: fit-content;\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: space-between;\n  	gap: 8px;\n  	position: relative;\n  	box-sizing: border-box;\n}\n\n.colorwayCreator-colorInput {\n  	width: 1px;\n  	height: 1px;\n  	opacity: 0;\n  	position: absolute;\n  	pointer-events: none;\n}\n\n.colorwayCreator-menuWrapper {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	padding: 20px 16px !important;\n  	overflow: visible !important;\n  	min-height: unset;\n}\n\n.colorwayCreator-modal {\n  	width: 620px !important;\n  	max-width: 620px;\n  	max-height: unset !important;\n}\n\n.colorways-creator-module-warning {\n  	color: var(--brand-500);\n}\n\n.colorwayCreator-colorPreviews>[class^=\"colorSwatch\"],\n.colorwayCreator-colorPreviews>[class^=\"colorSwatch\"]>[class^=\"swatch\"] {\n  	width: 100%;\n  	border: none;\n  	position: relative;\n}\n\n.colorwaysPicker-colorLabel {\n  	position: absolute;\n  	top: 0;\n  	left: 0;\n  	width: 100%;\n  	height: 100%;\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	pointer-events: none;\n}\n\n.colorwayCreator-colorPreviews>.colorSwatch-2UxEuG:has([fill=\"var(--primary-530)\"])>.colorwaysPicker-colorLabel {\n  	color: var(--primary-530);\n}\n\n.colorwaySelector-noDisplay {\n  	display: none;\n}\n\n.colorwayInfo-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	color: var(--header-primary);\n}\n\n.colorwayInfo-colorSwatches {\n  	width: 100%;\n  	height: 46px;\n  	display: flex;\n  	flex-direction: row;\n  	align-items: center;\n  	justify-content: center;\n  	margin: 12px 0;\n  	gap: 8px;\n}\n\n.colorwayInfo-colorSwatch {\n  	display: flex;\n  	width: 100%;\n  	height: 38px;\n  	border-radius: 3px;\n  	cursor: pointer;\n  	position: relative;\n  	transition: .15s;\n}\n\n.colorwayInfo-colorSwatch:hover {\n  	filter: brightness(.8);\n}\n\n.colorwayInfo-row {\n  	font-weight: 400;\n  	font-size: 20px;\n  	color: var(--header-secondary);\n  	margin-bottom: 4px;\n  	display: flex;\n  	flex-direction: row;\n  	align-items: center;\n  	justify-content: space-between;\n  	gap: 8px;\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	padding: 8px 12px;\n}\n\n.colorwayInfo-css {\n  	flex-direction: column;\n  	align-items: start;\n}\n\n.colorwayInfo-cssCodeblock {\n  	border-radius: 4px;\n  	border: 1px solid var(--background-accent);\n  	padding: 3px 6px;\n  	white-space: pre;\n  	max-height: 400px;\n  	overflow: auto;\n  	font-size: 0.875rem;\n  	line-height: 1.125rem;\n  	width: 100%;\n  	box-sizing: border-box;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar {\n  	width: 8px;\n  	height: 8px;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-corner {\n  	background-color: transparent;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-thumb {\n  	background-color: var(--scrollbar-auto-thumb);\n  	min-height: 40px;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-thumb,\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-track {\n  	border: 2px solid transparent;\n  	background-clip: padding-box;\n  	border-radius: 8px;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-track {\n  	margin-bottom: 8px;\n}\n\n.colorwaysCreator-settingCat {\n  	display: flex;\n  	flex-direction: column;\n  	padding: 10px;\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	box-sizing: border-box;\n  	color: var(--header-secondary);\n  	max-height: 250px;\n  	overflow: hidden overlay;\n}\n\n.colorwaysColorpicker-settingCat {\n  	padding: 0;\n  	background-color: transparent;\n  	border-radius: 0;\n}\n\n.colorwaysColorpicker-search {\n  	width: 100%;\n}\n\n.colorwaysCreator-settingItm {\n  	display: flex;\n  	flex-direction: row;\n  	align-items: center;\n  	width: 100%;\n  	border-radius: 4px;\n  	cursor: pointer;\n  	box-sizing: border-box;\n  	padding: 8px;\n  	justify-content: space-between;\n}\n\n.colorwaysCreator-settingItm:hover {\n  	background-color: var(--background-modifier-hover);\n}\n\n.colorwaysCreator-settingsList .colorwaysCreator-preset {\n  	justify-content: start;\n  	gap: 8px;\n}\n\n.colorwaysCreator-settingsList {\n  	overflow: auto;\n  	max-height: 185px;\n}\n\n.colorwaysCreator-settingCat-collapsed>:is(.colorwaysCreator-settingsList, .colorwayInfo-cssCodeblock),\n.colorwaysColorpicker-collapsed {\n  	display: none !important;\n}\n\n.colorwayColorpicker {\n  	display: flex;\n  	flex-direction: column;\n  	padding: 20px 16px !important;\n  	width: 620px !important;\n  	min-height: unset;\n}\n\n.colorwaysCreator-noHeader {\n  	margin-top: 12px;\n  	margin-bottom: 12px;\n}\n\n.colorwaysCreator-noMinHeight {\n  	min-height: unset;\n  	height: fit-content;\n}\n\n.colorwaysPreview-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	width: 100%;\n  	height: 270px;\n  	flex: 1 0 auto;\n  	border-radius: 4px;\n  	overflow: hidden;\n}\n\n.colorwaysPreview-modal {\n  	max-width: unset !important;\n  	max-height: unset !important;\n  	width: fit-content;\n  	height: fit-content;\n}\n\n.colorwaysPreview-titlebar {\n  	height: 22px;\n  	width: 100%;\n  	display: flex;\n  	flex: 1 0 auto;\n}\n\n.colorwaysPreview-body {\n  	height: 100%;\n  	width: 100%;\n  	display: flex;\n}\n\n.colorwayPreview-guilds {\n  	width: 72px;\n  	height: 100%;\n  	display: flex;\n  	flex: 1 0 auto;\n  	padding-top: 4px;\n  	flex-direction: column;\n}\n\n.colorwayPreview-channels {\n  	width: 140px;\n  	height: 100%;\n  	display: flex;\n  	flex-direction: column-reverse;\n  	border-top-left-radius: 8px;\n  	flex: 1 0 auto;\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-channels {\n  	width: 240px;\n}\n\n.colorwayPreview-chat {\n  	width: 100%;\n  	height: 100%;\n  	display: flex;\n  	position: relative;\n  	flex-direction: column-reverse;\n}\n\n.colorwayPreview-userArea {\n  	width: 100%;\n  	height: 40px;\n  	display: flex;\n  	flex: 1 0 auto;\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-userArea {\n  	height: 52px;\n}\n\n.colorwaysPreview {\n  	display: flex;\n  	flex-direction: column;\n  	padding: 10px;\n  	gap: 5px;\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	box-sizing: border-box;\n  	color: var(--header-secondary);\n  	overflow: hidden overlay;\n  	margin-bottom: 4px;\n}\n\n.colorwaysPreview-collapsed .colorwaysPreview-wrapper {\n  	display: none;\n}\n\n.colorwayInfo-lastCat,\n.colorwaysCreator-lastCat {\n  	margin-bottom: 12px;\n}\n\n.colorwayPreview-guild {\n  	width: 100%;\n  	margin-bottom: 8px;\n  	display: flex;\n  	justify-content: center;\n}\n\n.colorwayPreview-guildItem {\n  	cursor: pointer;\n  	width: 48px;\n  	height: 48px;\n  	border-radius: 50px;\n  	transition: .2s ease;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n}\n\n.colorwayPreview-guildItem:hover {\n  	border-radius: 16px;\n}\n\n.colorwayPreview-guildSeparator {\n  	width: 32px;\n  	height: 2px;\n  	opacity: .48;\n  	border-radius: 1px;\n}\n\n.colorwayToolbox-listItem {\n  	align-items: center;\n  	border-radius: 4px;\n  	color: var(--interactive-normal);\n  	display: flex;\n  	flex-direction: column;\n  	gap: 12px;\n  	background-color: transparent !important;\n  	width: calc(564px / 4);\n  	cursor: default;\n  	float: left;\n  	box-sizing: border-box;\n  	margin: 0;\n  	padding: 0;\n}\n\n.colorwayToolbox-listItemSVG {\n  	padding: 19px;\n  	overflow: visible;\n  	border-radius: 50%;\n  	background-color: var(--background-tertiary);\n  	border: 1px solid transparent;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	transition: .15s ease;\n  	cursor: pointer;\n  	color: var(--interactive-normal);\n}\n\n.colorwayToolbox-listItem:hover {\n  	color: var(--interactive-normal) !important;\n}\n\n.colorwayToolbox-listItemSVG:hover {\n  	border-color: var(--brand-500);\n  	background-color: var(--brand-experiment-15a);\n  	color: var(--interactive-hover) !important;\n}\n\n.colorwayToolbox-title {\n  	align-items: center;\n  	display: flex;\n  	text-transform: uppercase;\n  	margin-top: 2px;\n  	padding-bottom: 8px;\n  	margin-bottom: 0;\n}\n\n.colorwayToolbox-list {\n  	box-sizing: border-box;\n  	height: 100%;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 12px;\n  	overflow: hidden;\n}\n\n.colorwayPreview-chatBox {\n  	height: 32px;\n  	border-radius: 6px;\n  	margin: 8px;\n  	margin-bottom: 12px;\n  	margin-top: 0;\n  	flex: 1 1 auto;\n}\n\n.colorwayPreview-filler {\n  	width: 100%;\n  	height: 100%;\n  	flex: 0 1 auto;\n}\n\n.colorwayPreview-topShadow {\n  	box-shadow: 0 1px 0 hsl(var(--primary-900-hsl)/20%), 0 1.5px 0 hsl(var(--primary-860-hsl)/5%), 0 2px 0 hsl(var(--primary-900-hsl)/5%);\n  	width: 100%;\n  	height: 32px;\n  	font-family: var(--font-display);\n  	font-weight: 500;\n  	padding: 12px 16px;\n  	box-sizing: border-box;\n  	align-items: center;\n  	display: flex;\n  	flex: 1 0 auto;\n}\n\n.colorwayPreview-channels>.colorwayPreview-topShadow {\n  	border-top-left-radius: 8px;\n}\n\n.colorwayPreview-channels>.colorwayPreview-topShadow:hover {\n  	background-color: hsl(var(--primary-500-hsl)/30%);\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-topShadow {\n  	height: 48px;\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-chatBox {\n  	height: 44px;\n  	border-radius: 8px;\n  	margin: 16px;\n  	margin-bottom: 24px;\n}\n\n.colorwaysBtn-tooltipContent {\n  	font-weight: 600;\n  	font-size: 16px;\n  	line-height: 20px;\n}\n\n.colorwaySelector-headerIcon {\n  	box-sizing: border-box;\n  	width: 100%;\n  	height: 100%;\n  	transition: transform .1s ease-out, opacity .1s ease-out;\n  	color: var(--interactive-normal);\n}\n\n.colorwaySelector-header {\n  	align-items: center;\n  	justify-content: center;\n  	padding-bottom: 0;\n  	box-shadow: none !important;\n}\n\n.colorwaySelector-search {\n  	width: 100%;\n}\n\n.colorwaySelector-sources {\n  	flex: 0 0 auto;\n  	margin-right: auto;\n  	color: var(--button-outline-primary-text);\n  	border-color: var(--button-outline-primary-border);\n}\n\n.colorwaySelector-sources:hover {\n  	background-color: var(--button-outline-primary-background-hover);\n  	border-color: var(--button-outline-primary-border-hover);\n  	color: var(--button-outline-primary-text-hover);\n}\n\n.colorwaySelector-headerBtn {\n  	position: absolute;\n  	top: 64px;\n  	right: 20px;\n}\n\n.theme-light .colorwaySelector-pill_selected {\n  	border-color: var(--brand-500) !important;\n  	background-color: var(--brand-experiment-160) !important;\n}\n\n.theme-dark .colorwaySelector-pill_selected {\n  	border-color: var(--brand-500) !important;\n  	background-color: var(--brand-experiment-15a) !important;\n}\n\n.colorwaysTooltip-tooltipPreviewRow {\n  	display: flex;\n  	align-items: center;\n  	margin-top: 8px;\n}\n\n.colorwayCreator-colorPreview {\n  	width: 100%;\n  	border-radius: 4px;\n  	height: 50px;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n}\n\n.colorwaysCreator-colorPreviewItm .colorwayCreator-colorPreviews {\n  	padding: 0;\n  	background-color: transparent;\n  	border-radius: 0;\n}\n\n.colorwaysCreator-colorPreviewItm {\n  	flex-direction: column;\n  	align-items: start;\n}\n\n.colorwaysTooltip-header {\n  	background-color: var(--background-primary);\n  	padding: 2px 8px;\n  	border-radius: 16px;\n  	height: min-content;\n  	color: var(--header-primary);\n  	margin-bottom: 2px;\n  	display: inline-flex;\n  	margin-left: -4px;\n}\n\n.colorwaySelector-pillSeparator {\n  	height: 24px;\n  	width: 1px;\n  	background-color: var(--primary-400);\n}\n\n.colorwaysSelector-changelog {\n  	font-weight: 400;\n  	font-size: 20px;\n  	color: var(--header-secondary);\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	padding: 8px 12px;\n}\n\n.colorwaysChangelog-li {\n  	position: relative;\n  	font-size: 16px;\n  	line-height: 20px;\n}\n\n.colorwaysChangelog-li::before {\n  	content: \"\";\n  	position: absolute;\n  	top: 10px;\n  	left: -15px;\n  	width: 6px;\n  	height: 6px;\n  	margin-top: -4px;\n  	margin-left: -3px;\n  	border-radius: 50%;\n  	opacity: .3;\n}\n\n.theme-dark .colorwaysChangelog-li::before {\n  	background-color: hsl(216deg calc(var(--saturation-factor, 1)*9.8%) 90%);\n}\n\n.theme-light .colorwaysChangelog-li::before {\n  	background-color: hsl(223deg calc(var(--saturation-factor, 1)*5.8%) 52.9%);\n}\n\n.ColorwaySelectorWrapper .colorwayToolbox-list {\n  	width: 100%;\n}\n\n.colorwaysToolbox-label {\n  	border-radius: 20px;\n  	box-sizing: border-box;\n  	color: var(--text-normal);\n  	transition: .15s ease;\n  	width: 100%;\n  	margin-left: 0;\n  	height: fit-content;\n  	text-align: center;\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: wrap;\n  	cursor: default;\n  	max-height: 2rem;\n  	padding: 0 8px;\n}\n\n.colorwaysSelector-changelogHeader {\n  	font-weight: 700;\n  	font-size: 16px;\n  	line-height: 20px;\n  	text-transform: uppercase;\n  	position: relative;\n  	display: flex;\n  	align-items: center;\n}\n\n.colorwaysSelector-changelogHeader::after {\n  	content: \"\";\n  	height: 1px;\n  	flex: 1 1 auto;\n  	margin-left: 4px;\n  	opacity: .6;\n  	background-color: currentcolor;\n}\n\n.colorwaysSelector-changelogHeader_added {\n  	color: var(--text-positive);\n}\n\n.colorwaysSelector-changelogHeader_fixed {\n  	color: hsl(359deg calc(var(--saturation-factor, 1)*87.3%) 59.8%);\n}\n\n.colorwaysSelector-changelogHeader_changed {\n  	color: var(--text-warning);\n}\n\n.is-mobile .colorwaySelectorModal,\n.is-mobile .colorwayCreator-modal {\n  	width: 100vw !important;\n  	box-sizing: border-box;\n  	min-width: unset;\n  	border-radius: 0;\n  	height: 100vh;\n  	max-height: unset;\n  	border: none;\n}\n\n.is-mobile .colorwaySelectorModalContent {\n  	box-sizing: border-box;\n  	width: 100vw;\n}\n\n.is-mobile .colorwaySelector-doublePillBar {\n  	flex-direction: column-reverse;\n  	align-items: end;\n}\n\n.is-mobile .colorwaySelector-doublePillBar>.colorwaySelector-pillWrapper:first-child {\n  	width: 100%;\n  	gap: 4px;\n  	overflow-x: auto;\n  	justify-content: space-between;\n}\n\n.is-mobile .colorwaySelector-doublePillBar>.colorwaySelector-pillWrapper:first-child>.colorwaySelector-pill {\n  	border-radius: 0;\n  	border-top: none;\n  	border-left: none;\n  	border-right: none;\n  	background-color: transparent;\n  	width: 100%;\n  	justify-content: center;\n  	flex: 0 0 min-content;\n}\n\n.is-mobile .colorwaySelector-doublePillBar>.colorwaySelector-pillWrapper:first-child>.colorwaySelector-pillSeparator {\n  	display: none;\n}\n\n.is-mobile .layer-fP3xEz:has(.colorwaySelectorModal, .colorwayCreator-modal) {\n  	padding: 0;\n}\n\n.is-mobile .ColorwaySelectorWrapper {\n  	justify-content: space-around;\n  	gap: 10px;\n}\n\n#colorwaySelector-pill_closeSelector {\n  	display: none !important;\n}\n\n.is-mobile #colorwaySelector-pill_closeSelector {\n  	display: flex !important;\n}\n\n.colorwaysBtn-spinner {\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	width: 100%;\n}\n\n.colorwaysBtn-spinnerInner {\n  	transform: rotate(280deg);\n  	position: relative;\n  	display: inline-block;\n  	width: 32px;\n  	height: 32px;\n  	contain: paint;\n}\n\n@keyframes spinner-spinning-circle-rotate {\n  	100% {\n  			transform: rotate(1turn);\n  	}\n}\n\n@keyframes spinner-spinning-circle-dash {\n  	0% {\n  			stroke-dasharray: 1, 200;\n  			stroke-dashoffset: 0;\n  	}\n\n  	50% {\n  			stroke-dasharray: 130, 200;\n  	}\n\n  	100% {\n  			stroke-dasharray: 130, 200;\n  			stroke-dashoffset: -124;\n  	}\n}\n\n.colorwaysBtn-spinnerCircular {\n  	animation: spinner-spinning-circle-rotate 2s linear infinite;\n  	height: 100%;\n  	width: 100%;\n}\n\n.colorwaysBtn-spinnerBeam {\n  	animation: spinner-spinning-circle-dash 2s ease-in-out infinite;\n  	stroke-dasharray: 1, 200;\n  	stroke-dashoffset: 0;\n  	fill: none;\n  	stroke-width: 6;\n  	stroke-miterlimit: 10;\n  	stroke-linecap: round;\n  	stroke: currentcolor;\n}\n\n.colorwaysBtn-spinnerBeam2 {\n  	stroke: currentcolor;\n  	opacity: 0.6;\n  	animation-delay: .15s;\n}\n\n.colorwaysBtn-spinnerBeam3 {\n  	stroke: currentcolor;\n  	opacity: 0.3;\n  	animation-delay: .23s;\n}\n\n.colorwaysSettings-colorwaySource {\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: space-between;\n  	padding: 8px;\n  	gap: 5px;\n  	border-radius: 4px;\n  	box-sizing: border-box;\n  	align-items: center;\n}\n\n.discordColorway-listItem {\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: start;\n  	padding: 0 8px;\n  	gap: 5px;\n  	border-radius: 4px;\n  	box-sizing: border-box;\n  	min-height: 44px;\n  	align-items: center;\n}\n\n.colorwaysSettings-modalRoot {\n  	min-width: 520px;\n}\n\n.colorwaysSettings-colorwaySourceLabel {\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n  	flex-grow: 1;\n  	line-height: 30px;\n}\n\n.colorwaysSettings-colorwaySourceLabelHeader {\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n  	flex-grow: 1;\n  	font-weight: 700;\n  	font-size: 16px;\n}\n\n.colorwaysSettings-colorwaySourceDesc {\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n  	flex-grow: 1;\n}\n\n.colorwaysSettings-iconButton {\n  	background-color: transparent !important;\n  	border-radius: 0;\n}\n\n.colorwaysSettings-iconButtonInner {\n  	display: flex;\n  	gap: 4px;\n  	align-items: center;\n}\n\n.colorwaysSettings-modalContent {\n  	margin: 8px 0;\n}\n\n@keyframes loading-bar {\n  	0% {\n  			left: 0;\n  			right: 100%;\n  			width: 0;\n  	}\n\n  	10% {\n  			left: 0;\n  			right: 75%;\n  			width: 25%;\n  	}\n\n  	90% {\n  			right: 0;\n  			left: 75%;\n  			width: 25%;\n  	}\n\n  	100% {\n  			left: 100%;\n  			right: 0;\n  			width: 0;\n  	}\n}\n\n.colorwaysLoader-barContainer {\n  	width: 100%;\n  	border-radius: var(--radius-round);\n  	border: 0;\n  	position: relative;\n  	padding: 0;\n}\n\n.colorwaysLoader-bar {\n  	position: absolute;\n  	border-radius: var(--radius-round);\n  	top: 0;\n  	right: 100%;\n  	bottom: 0;\n  	left: 0;\n  	background: var(--brand-500);\n  	width: 0;\n  	animation: loading-bar 2s linear infinite;\n  	transition: .2s ease;\n}\n\n.colorwaysSettingsSelector-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n}\n\n.colorwaysSettingsPage-wrapper .colorwayToolbox-listItem {\n  	gap: 8px;\n  	border-radius: 50px;\n  	padding: 12px 16px;\n  	background-color: var(--background-tertiary);\n  	transition: .15s ease;\n  	border: 1px solid transparent;\n  	color: var(--interactive-normal);\n}\n\n.colorwaysSettingsPage-wrapper .colorwayToolbox-listItem:hover {\n  	border-color: var(--brand-500);\n  	background-color: var(--brand-experiment-15a);\n  	color: var(--interactive-hover);\n}\n\n.colorwaysSettingsSelector-wrapper .colorwaySelector-doublePillBar {\n  	justify-content: start;\n}\n\n.colorwaysCreator-toolboxItm:hover {\n  	background-color: var(--brand-experiment) !important;\n}\n\n.colorwayCreator-colorPreview_primary+.colorwayCreator-colorPreview_primary,\n.colorwayCreator-colorPreview_secondary+.colorwayCreator-colorPreview_secondary,\n.colorwayCreator-colorPreview_tertiary+.colorwayCreator-colorPreview_tertiary,\n.colorwayCreator-colorPreview_accent+.colorwayCreator-colorPreview_accent {\n  	display: none;\n}\n\n.colorwaysConflictingColors-warning {\n  	width: 100%;\n  	text-align: center;\n  	justify-content: center;\n}\n\n.ColorwaySelectorBtn_thin {\n  	height: 21px !important;\n  	width: 56px !important;\n}\n\n.ColorwaySelectorBtn_thin:hover {\n  	border-radius: 8px;\n}\n\n.colorwaySelector-searchPopout {\n  	display: none !important;\n}\n\n.colorways-badge {\n  	font-size: .625rem;\n  	text-transform: uppercase;\n  	vertical-align: top;\n  	display: inline-flex;\n  	align-items: center;\n  	text-indent: 0;\n  	background: var(--brand-experiment);\n  	color: var(--white-500);\n  	flex: 0 0 auto;\n  	height: 15px;\n  	padding: 0 4px;\n  	margin-top: 7.5px;\n  	border-radius: 4px;\n}\n\n.hoverRoll {\n  	display: inline-block;\n  	vertical-align: top;\n  	cursor: default;\n  	text-align: left;\n  	box-sizing: border-box;\n  	position: relative;\n  	width: 100%;\n  	contain: paint;\n}\n\n.hoverRoll_hovered {\n  	white-space: nowrap;\n  	text-overflow: ellipsis;\n  	overflow: hidden;\n  	display: block;\n  	transition: all.22s ease;\n  	transform-style: preserve-3d;\n  	pointer-events: none;\n  	width: 100%;\n  	opacity: 0;\n  	transform: translate3d(0, 107%, 0);\n  	position: absolute;\n  	top: 0;\n  	left: 0;\n  	bottom: 0;\n  	right: 0;\n}\n\n.hoverRoll:hover .hoverRoll_hovered,\n.colorwaysSettings-colorwaySource:hover .hoverRoll_hovered {\n  	transform: translateZ(0);\n  	opacity: 1;\n}\n\n.hoverRoll_normal {\n  	white-space: nowrap;\n  	text-overflow: ellipsis;\n  	overflow: hidden;\n  	display: block;\n  	transition: all .22s ease;\n  	transform-style: preserve-3d;\n  	pointer-events: none;\n  	width: 100%;\n}\n\n.hoverRoll:hover .hoverRoll_normal,\n.colorwaysSettings-colorwaySource:hover .hoverRoll_normal {\n  	transform: translate3d(0,-107%,0);\n  	opacity: 0;\n  	user-select: none;\n}\n\n.dc-warning-card {\n  	padding: 1em;\n  	margin-bottom: 1em;\n  	background-color: var(--info-warning-background);\n  	border-color: var(--info-warning-foreground);\n  	color: var(--info-warning-text);\n}\n\n/* stylelint-disable-next-line no-duplicate-selectors */\n.colorwaysPreview-modal {\n  	width: 90vw !important;\n  	height: 90vh !important;\n  	max-height: unset !important;\n}\n\n.colorwaysPresetPicker-content {\n  	padding: 16px;\n}\n\n.colorwaysPresetPicker {\n  	width: 600px;\n}\n\n.colorwaysCreator-setting {\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: space-between;\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	box-sizing: border-box;\n  	color: var(--header-secondary);\n  	padding: 10px 18px;\n  	padding-right: 10px;\n  	cursor: pointer;\n  	align-items: center;\n}\n\n.colorwaysCreator-setting:hover {\n  	background-color: var(--background-modifier-hover);\n}\n\n.dc-colorway-selector::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--si-appearance) center/contain no-repeat !important;\n  	mask: var(--si-appearance) center/contain no-repeat !important\n}\n\n.dc-colorway-settings::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--si-vencordsettings) center/contain no-repeat !important;\n  	mask: var(--si-vencordsettings) center/contain no-repeat !important\n}\n\n.dc-colorway-ondemand::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--si-vencordupdater) center/contain no-repeat !important;\n  	mask: var(--si-vencordupdater) center/contain no-repeat !important\n}\n\n.dc-colorway-sources-manager::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--si-instantinvites) center/contain no-repeat !important;\n  	mask: var(--si-instantinvites) center/contain no-repeat !important\n}\n\n.colorwaySourceModal {\n  	min-height: unset;\n}\n\n.colorwaySelector-sourceSelect {\n  	width: fit-content !important;\n}\n\n.dc-info-card {\n  	border-radius: 5px;\n  	border: 1px solid var(--blue-345);\n  	padding: 1em;\n  	margin-bottom: 1em;\n  	display: flex;\n  	gap: 1em;\n  	flex-direction: column;\n}\n\n.theme-dark .dc-info-card {\n  	color: var(--white-500);\n}\n\n.theme-light .dc-info-card {\n  	color: var(--black-500);\n}\n\n.colorwaysSettings-sourceScroller {\n  	scrollbar-width: none;\n}\n\n.colorwaysSettings-sourceScroller::-webkit-scrollbar {\n  	width: 0;\n}\n\n.colorwayMessage {\n  	padding: 20px;\n  	border: 1px solid;\n  	border-radius: 5px;\n  	display: flex;\n}\n\n.colorwayMessage-contents {\n  	display: flex;\n  	flex-direction: column;\n}\n\n.theme-dark .colorwayMessage {\n  	background: hsl(var(--primary-630-hsl)/60%);\n  	border-color: hsl(var(--primary-630-hsl)/90%);\n}\n\n.theme-light .colorwayMessage {\n  	background: hsl(var(--primary-100-hsl)/60%);\n  	border-color: hsl(var(--primary-200-hsl)/30%);\n}\n\n.colorwaySelector-sources_settings {\n  	margin-left: 8px;\n}\n\n.colorwaysLoadingModal,\n.colorwayInfo-cssModal {\n  	width: fit-content;\n  	height: fit-content;\n  	min-width: unset;\n  	min-height: unset;\n  	background: none;\n  	box-shadow: none !important;\n  	border: none;\n}\n\n.ColorwaySelectorWrapper-list {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 0;\n  	flex-wrap: nowrap;\n  	padding-bottom: 0;\n}\n\n.discordColorway-listItem .discordColorwayPreviewColorContainer {\n  	width: 30px;\n  	height: 30px;\n}\n\n.colorwayLabel.labelInGrid {\n  	max-height: 2rem;\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	margin-top: 4px;\n  	text-align: center;\n}\n\n.discordColorway-listItem .colorwayInfoIconContainer {\n  	height: 28px;\n  	width: 28px;\n  	border-radius: 3px;\n  	position: static;\n  	opacity: 1;\n  	justify-content: center;\n  	display: flex;\n  	align-items: center;\n  	background: transparent;\n  	border: 1px solid var(--button-outline-primary-border);\n  	color: var(--button-outline-primary-text);\n  	transition: .15s;\n}\n\n.discordColorway-listItem .colorwayInfoIconContainer:hover {\n  	background-color: var(--button-outline-primary-background-hover);\n  	border-color: var(--button-outline-primary-border-hover);\n  	color: var(--button-outline-primary-text-hover);\n}\n\n.colorwayLabel:not(.labelInGrid) {\n  	margin-right: auto;\n  	margin-top: 0 !important;\n  	margin-left: .5rem;\n}\n\n.colorwaySelectionCircle {\n  	position: absolute;\n  	width: 56px;\n  	height: 56px;\n  	top: 0;\n  	left: 0;\n}\n\n.ColorwaySelectorWrapper-grid {\n  	margin-bottom: 16px;\n}\n\n.colorwaySelector-sorter {\n  	height: 50px;\n  	width: 100%;\n  	box-shadow: var(--elevation-low);\n  	margin-bottom: 8px;\n  	display: flex;\n}\n\n.colorwaySelector-sorter_selectedSpacer {\n  	width: 80px;\n  	height: 50px;\n}\n\n.colorwaySelector-sorter_text {\n  	line-height: 50px;\n  	margin: 0;\n}\n\n.colorwaySelector-sorter_name {\n  	margin-right: auto;\n  	cursor: pointer;\n}\n\n.colorwayPresetLabel {\n  	margin-right: 1rem;\n}\n\n.colorwayPreview-channel {\n  	margin: 10px;\n  	width: calc(100% - 20px);\n  	height: 8px;\n  	border-radius: 16px;\n}\n\n.dc-settings-tab-bar-item {\n  	margin-right: 32px;\n  	padding-bottom: 16px;\n  	margin-bottom: -2px;\n}\n\n.dc-settings-tab-bar {\n  	border-bottom: none;\n  	margin-bottom: 16px;\n}";

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
betterdiscord.Data.save("settings", Object.assign(
	{},
	{
		activeAutoPreset: null,
		showInGuildBar: false,
		onDemandWays: false,
		onDemandWaysTintedText: false,
		onDemandWaysDiscordSaturation: false,
		onDemandWaysOsAccentColor: false,
		isButtonThin: false,
		activeColorwayObject: { id: null, css: null, sourceType: null, source: null },
		selectorViewMode: "grid",
		showLabelsInSelectorGridView: false
	},
	betterdiscord.Data.load("settings")
));
if (getSetting("colorwayLists")) {
	if (typeof getSetting("colorwayLists")[0] === "string") {
		saveSettings({ colorwayLists: getSetting("colorwayLists").map((sourceURL, i) => {
			return { name: sourceURL === defaultColorwaySource ? "Project Colorway" : `Source #${i}`, url: sourceURL };
		}) });
	}
} else {
	saveSettings({ colorwayLists: [{
		name: "Project Colorway",
		url: defaultColorwaySource
	}] });
}
if (betterdiscord.Data.load("custom_colorways")) {
	if (!betterdiscord.Data.load("custom_colorways")[0].colorways) {
		betterdiscord.Data.save("custom_colorways", [{ name: "Custom", colorways: betterdiscord.Data.load("custom_colorways") }]);
	}
} else {
	betterdiscord.Data.save("custom_colorways", []);
}
class DiscordColorways {
	load() {
	}
	async start() {
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
		betterdiscord.DOM.addStyle(css);
		triggerRerender();
		ColorwayCSS.set(getSetting("activeColorwayObject").css");
	}
	getToolboxActions() {
		return {
			"Change Colorway": () => openModal((props) => BdApi.React.createElement(Selector, { modalProps: props })),
			"Open Colorway Creator": () => openModal((props) => BdApi.React.createElement(CreatorModal, { modalProps: props })),
			"Open Color Stealer": () => openModal((props) => BdApi.React.createElement(ColorPicker, { modalProps: props })),
			"Open Settings": () => openModal((props) => BdApi.React.createElement(ModalRoot, { ...props, size: "medium" }, BdApi.React.createElement(ModalHeader, { separator: false }, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Settings")), BdApi.React.createElement(ModalContent, null, BdApi.React.createElement(SettingsModal, null)))),
			"Open On-Demand Settings": () => openModal((props) => BdApi.React.createElement(ModalRoot, { ...props, size: "medium" }, BdApi.React.createElement(ModalHeader, { separator: false }, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Settings")), BdApi.React.createElement(ModalContent, null, BdApi.React.createElement(SettingsModal, { tab: SettingsTab.OnDemand })))),
			"Manage Colorway Sources": () => openModal((props) => BdApi.React.createElement(ModalRoot, { ...props, size: "medium" }, BdApi.React.createElement(ModalHeader, { separator: false }, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Settings")), BdApi.React.createElement(ModalContent, null, BdApi.React.createElement(SettingsModal, { tab: SettingsTab.Sources })))),
			"Open Colorway Store": () => openModal((props) => BdApi.React.createElement(ModalRoot, { ...props, size: "medium" }, BdApi.React.createElement(ModalHeader, { separator: false }, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Settings")), BdApi.React.createElement(ModalContent, null, BdApi.React.createElement(SettingsModal, { tab: SettingsTab.Store })))),
			"Change Auto Colorway Preset": async () => {
				openModal((props) => BdApi.React.createElement(AutoColorwaySelector, { modalProps: props, onChange: (autoPresetId) => {
					if (getSetting("activeColorwayObject").id === "Auto") {
						const demandedColorway = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")))[autoPresetId].preset();
						saveSettings({ activeColorwayObject: { id: "Auto", css: demandedColorway, sourceType: "online", source: null } });
						ColorwayCSS.set(demandedColorway);
					}
				} }));
			}
		};
	}
	getSettingsPanel() {
		const elem = document.createElement("div");
		ReactDOM.render(BdApi.React.createElement(SettingsModal, null), elem);
		return elem;
	}
	stop() {
		ColorwayCSS.remove();
		betterdiscord.DOM.removeStyle();
		betterdiscord.Patcher.unpatchAll();
		triggerRerender();
	}
}

module.exports = DiscordColorways;

/*@end@*/