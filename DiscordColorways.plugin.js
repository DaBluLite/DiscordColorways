/**
 * @name DiscordColorways
 * @author DaBluLite
 * @description A plugin that offers easy access to simple color schemes/themes for Discord, also known as Colorways
 * @version 5.6.6
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
				return fragments.every((fragment) => typeof fragment === "string" ? source.includes(fragment) || renderSource?.includes(fragment) : fragment(source) || renderSource && fragment(renderSource));
			} else {
				return false;
			}
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
			console.warn("WebpackModules~getModule", "Module filter threw an exception.", filter, err);
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
		const { signal: abortSignal, defaultExport = true, searchExports = false } = options;
		const fromCache = Webpack.getModule(filter, { defaultExport, searchExports });
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
const [getInstanceFromNode, getNodeFromInstance, getFiberCurrentPropsFromNode, enqueueStateRestore, restoreStateIfNeeded, batchedUpdates] = ReactDOMInternals;
const FCHook = ({ children: { type, props }, callback }) => {
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
	return queryFiber(fiber, (node) => node?.stateNode instanceof React.Component, "up", depth);
};
const ColorwayCSS = {
	get: () => document.getElementById("activeColorwayCSS")?.textContent || "",
	set: (e) => {
		if (e == "") {
			betterdiscord.DOM.removeStyle("activeColorwayCSS");
		} else {
			if (!document.getElementById("activeColorwayCSS")) {
				betterdiscord.DOM.addStyle("activeColorwayCSS", e);
			} else
				document.getElementById("activeColorwayCSS").textContent = e;
		}
	},
	remove: () => betterdiscord.DOM.removeStyle("activeColorwayCSS")
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
		color = hslToHex(Number(color.split(" ")[0]), Number(color.split(" ")[1]), Number(color.split(" ")[2]));
	}
	if (colorType === "rgb") {
		color = rgbToHex(Number(color.split(" ")[0]), Number(color.split(" ")[1]), Number(color.split(" ")[2]));
	}
	return color.replace("#", "");
}

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
function waitForStore(storeName, callback) {
	betterdiscord.Webpack.waitForModule(Filters.byStoreName(storeName)).then((e) => callback(e));
}

function Spinner({ className, children }) {
	return BdApi.React.createElement("div", { className: "colorwaysBtn-spinner" + (className ? " " + className : ""), role: "img", "aria-label": "Loading" }, BdApi.React.createElement("div", { className: "colorwaysBtn-spinnerInner" }, BdApi.React.createElement("svg", { className: "colorwaysBtn-spinnerCircular", viewBox: "25 25 50 50", fill: "currentColor" }, BdApi.React.createElement("circle", { className: "colorwaysBtn-spinnerBeam colorwaysBtn-spinnerBeam3", cx: "50", cy: "50", r: "20" }), BdApi.React.createElement("circle", { className: "colorwaysBtn-spinnerBeam colorwaysBtn-spinnerBeam2", cx: "50", cy: "50", r: "20" }), BdApi.React.createElement("circle", { className: "colorwaysBtn-spinnerBeam", cx: "50", cy: "50", r: "20" }))));
}

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
const SettingsRouter = betterdiscord.Webpack.getByKeys("open", "saveAccountChanges");
const Menu = {
	Menu: betterdiscord.Webpack.getByKeys("Menu").Menu,
	MenuItem: betterdiscord.Webpack.getByKeys("Menu").MenuItem
};
let ColorPicker$1 = () => {
	return BdApi.React.createElement(Spinner, { className: "colorways-creator-module-warning" });
};
betterdiscord.Webpack.waitForModule(Filters.byKeys("FormItem", "Button")).then((m) => {
	({ useToken, Card, Button, FormSwitch: Switch, Tooltip, TextInput, TextArea, Text, Select, SearchableSelect, Slider, ButtonLooks, TabBar, Popout, Dialog, Paginator, ScrollerThin, Clickable, Avatar, FocusLock } = m);
	Forms = m;
});
betterdiscord.Webpack.waitForModule(Filters.byStrings("showEyeDropper")).then((e) => ColorPicker$1 = e);
function Flex(props) {
	props.style ??= {};
	props.style.display = "flex";
	props.style.gap ??= "1em";
	props.style.flexDirection ||= props.flexDirection;
	delete props.flexDirection;
	return BdApi.React.createElement("div", { ...props }, props.children);
}
let UserStore;
let SelectedChannelStore;
let SelectedGuildStore;
const UserProfileActions = proxyLazy(() => betterdiscord.Webpack.getByKeys("openUserProfileModal", "closeUserProfileModal"));
const UserUtils = proxyLazy(() => betterdiscord.Webpack.getByKeys("getUser", "fetchCurrentUser"));
const Modals = {
	openModal: betterdiscord.Webpack.getByKeys("openModal", "ModalHeader").openModal,
	ModalRoot: betterdiscord.Webpack.getByKeys("ModalRoot").ModalRoot,
	ModalHeader: betterdiscord.Webpack.getByKeys("ModalRoot").ModalHeader,
	ModalContent: betterdiscord.Webpack.getByKeys("ModalRoot").ModalContent,
	ModalFooter: betterdiscord.Webpack.getByKeys("ModalRoot").ModalFooter
};
const Toasts = {
	show: betterdiscord.Webpack.getByKeys("showToast")["showToast"],
	pop: betterdiscord.Webpack.getByKeys("popToast")["popToast"],
	useToastStore: betterdiscord.Webpack.getByKeys("useToastStore")["useToastStore"],
	create: betterdiscord.Webpack.getByKeys("createToast")["createToast"]
};
const FluxDispatcher = betterdiscord.Webpack.getModule((m) => m.dispatch && m.subscribe);
async function openUserProfile(id) {
	const user = await UserUtils.getUser(id);
	if (!user)
		throw new Error("No such user: " + id);
	const guildId = SelectedGuildStore.getGuildId();
	UserProfileActions.openUserProfileModal({
		userId: id,
		guildId,
		channelId: SelectedChannelStore.getChannelId(),
		analyticsLocation: {
			page: guildId ? "Guild Channel" : "DM Channel",
			section: "Profile Popout"
		}
	});
}
waitForStore("DraftStore", (s) => s);
waitForStore("UserStore", (s) => UserStore = s);
waitForStore("SelectedChannelStore", (s) => SelectedChannelStore = s);
waitForStore("SelectedGuildStore", (s) => SelectedGuildStore = s);
waitForStore("UserProfileStore", (m) => m);
waitForStore("ChannelStore", (m) => m);
waitForStore("GuildStore", (m) => m);
waitForStore("GuildMemberStore", (m) => m);
waitForStore("RelationshipStore", (m) => m);
waitForStore("PermissionStore", (m) => m);
waitForStore("PresenceStore", (m) => m);
waitForStore("ReadStateStore", (m) => m);
waitForStore("GuildChannelStore", (m) => m);
waitForStore("MessageStore", (m) => m);
waitForStore("WindowStore", (m) => m);
waitForStore("EmojiStore", (m) => m);
betterdiscord.Webpack.waitForModule(Filters.byKeys("SUPPORTS_COPY", "copy")).then((e) => Clipboard = e);
function SettingsTab({ title, children }) {
	return BdApi.React.createElement(Forms.FormSection, null, BdApi.React.createElement(
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

const defaultColorwaySource = "https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json";
const knownColorwaySources = [
	{
		name: "Project Colorway",
		url: "https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json"
	},
	{
		name: "DaBluLite's Personal Colorways",
		url: "https://raw.githubusercontent.com/DaBluLite/dablulite.github.io/master/colorways/index.json"
	}
];
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
const mainColors = [
	{ name: "accent", title: "Accent", var: "--brand-experiment" },
	{ name: "primary", title: "Primary", var: "--background-primary" },
	{ name: "secondary", title: "Secondary", var: "--background-secondary" },
	{ name: "tertiary", title: "Tertiary", var: "--background-tertiary" }
];

const name = "DiscordColorways";
const author = "DaBluLite";
const description = "A plugin that offers easy access to simple color schemes/themes for Discord, also known as Colorways";
const version = "5.6.6";
const authorId = "582170007505731594";
const invite = "ZfPH6SDkMW";
const creatorVersion = "1.19";
const plugin = {
	name: name,
	author: author,
	description: description,
	version: version,
	authorId: authorId,
	invite: invite,
	creatorVersion: creatorVersion
};

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
function generateCss(primaryColor, secondaryColor, tertiaryColor, accentColor, tintedText, discordSaturation) {
	const colorwayCss = `/*Automatically Generated - Colorway Creator V${plugin.creatorVersion}*/
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
		--primary-800-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[800]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6 * 2, 0)}%;
		--primary-730-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + tertiaryColor)[1] / 100 * (100 + PrimarySatDiffs[730]) * 10) / 10 : HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 3.6, 0)}%;
		--primary-700-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${HexToHSL("#" + tertiaryColor)[2]}%;
		--primary-660-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[660]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.max(HexToHSL("#" + secondaryColor)[2] - 3.6, 0)}%;
		--primary-645-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + secondaryColor)[1] / 100 * (100 + PrimarySatDiffs[645]) * 10) / 10 : HexToHSL("#" + secondaryColor)[1]}%) ${Math.max(HexToHSL("#" + secondaryColor)[2] - 1.1, 0)}%;
		--primary-630-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${HexToHSL("#" + secondaryColor)[2]}%;
		--primary-600-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%;
		--primary-560-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6, 100)}%;
		--primary-530-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[530]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 2, 100)}%;
		--primary-500-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[500]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6 * 3, 100)}%;${tintedText ? `
		--primary-460-hsl: 0 calc(var(--saturation-factor, 1)*0%) 50%;
		--primary-430: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[430]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%), 90%)` : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)"};
		--primary-400: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[400]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%), 90%)` : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)"};
		--primary-360: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : HexToHSL("#" + secondaryColor)[2] < 80 ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + `, calc(var(--saturation-factor, 1)*${discordSaturation ? Math.round(HexToHSL("#" + primaryColor)[1] / 100 * (100 + PrimarySatDiffs[360]) * 10) / 10 : HexToHSL("#" + primaryColor)[1]}%), 90%)` : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)"};` : ""}
}
.emptyPage_feb902,
.scrollerContainer_dda72c,
.container__03ec9,
.header__71942 {
		background-color: unset !important;
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

.theme-dark .container__6b2e5,
.theme-dark .container__03ec9,
.theme-dark .header__71942 {
		background: transparent;
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
	return colorwayCss;
}
function getPreset(primaryColor, secondaryColor, tertiaryColor, accentColor) {
	function cyan(discordSaturation = false) {
		return `:root:root {
		--cyan-accent-color: ${"#" + accentColor};
		--cyan-background-primary: hsl(${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%/40%);
		--cyan-background-secondary: hsl(${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 3.6 * 2, 100)}%);
}`;
	}
	function cyan2(discordSaturation = false) {
		return `:root:root {
		--cyan-accent-color: ${"#" + accentColor};
		--cyan-background-primary: hsl(${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%/60%);
		--cyan-second-layer: hsl(${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 3.6 * 2, 100)}%/60%);
}`;
	}
	function virtualBoy(discordSaturation = false) {
		return `:root:root {
		--VBaccent: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${HexToHSL("#" + accentColor)[2]}%;
		--VBaccent-muted: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(HexToHSL("#" + tertiaryColor)[2] - 10, 0)}%;
		--VBaccent-dimmest: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 3.6 * 5 - 3, 100)}%;
}`;
	}
	function modular(discordSaturation = false) {
		return `:root:root {
		--modular-hue: ${HexToHSL("#" + accentColor)[0]};
		--modular-saturation: calc(var(--saturation-factor, 1)${HexToHSL("#" + accentColor)[1]}%);
		--modular-lightness: ${HexToHSL("#" + accentColor)[2]}%;
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
	function hueRotation(discordSaturation = false) {
		return `:root:root {
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
	function accentSwap(discordSaturation = false) {
		return `:root:root {
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
}`;
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
		cyan2: {
			name: "Cyan 2",
			preset: cyan2,
			id: "cyan2",
			colors: ["accent", "primary", "secondary"]
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
			colors: ["accent"]
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
			preset: hueRotation,
			id: "hueRotation",
			colors: ["accent"]
		},
		accentSwap: {
			name: "Accent Swap",
			preset: accentSwap,
			id: "accentSwap",
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
			className,
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
			className: props.className,
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement(
			"path",
			{
				fill: "currentColor",
				d: "M 12 7.5 C 13.242188 7.5 14.25 6.492188 14.25 5.25 C 14.25 4.007812 13.242188 3 12 3 C 10.757812 3 9.75 4.007812 9.75 5.25 C 9.75 6.492188 10.757812 7.5 12 7.5 Z M 18 12 C 19.242188 12 20.25 10.992188 20.25 9.75 C 20.25 8.507812 19.242188 7.5 18 7.5 C 16.757812 7.5 15.75 8.507812 15.75 9.75 C 15.75 10.992188 16.757812 12 18 12 Z M 8.25 10.5 C 8.25 11.742188 7.242188 12.75 6 12.75 C 4.757812 12.75 3.75 11.742188 3.75 10.5 C 3.75 9.257812 4.757812 8.25 6 8.25 C 7.242188 8.25 8.25 9.257812 8.25 10.5 Z M 9 19.5 C 10.242188 19.5 11.25 18.492188 11.25 17.25 C 11.25 16.007812 10.242188 15 9 15 C 7.757812 15 6.75 16.007812 6.75 17.25 C 6.75 18.492188 7.757812 19.5 9 19.5 Z M 9 19.5 M 24 12 C 24 16.726562 21.199219 15.878906 18.648438 15.105469 C 17.128906 14.644531 15.699219 14.210938 15 15 C 14.09375 16.023438 14.289062 17.726562 14.472656 19.378906 C 14.738281 21.742188 14.992188 24 12 24 C 5.371094 24 0 18.628906 0 12 C 0 5.371094 5.371094 0 12 0 C 18.628906 0 24 5.371094 24 12 Z M 12 22.5 C 12.917969 22.5 12.980469 22.242188 12.984375 22.234375 C 13.097656 22.015625 13.167969 21.539062 13.085938 20.558594 C 13.066406 20.304688 13.03125 20.003906 12.996094 19.671875 C 12.917969 18.976562 12.828125 18.164062 12.820312 17.476562 C 12.804688 16.417969 12.945312 15.0625 13.875 14.007812 C 14.429688 13.382812 15.140625 13.140625 15.78125 13.078125 C 16.390625 13.023438 17 13.117188 17.523438 13.234375 C 18.039062 13.351562 18.574219 13.515625 19.058594 13.660156 L 19.101562 13.675781 C 19.621094 13.832031 20.089844 13.972656 20.53125 14.074219 C 21.511719 14.296875 21.886719 14.199219 22.019531 14.109375 C 22.074219 14.070312 22.5 13.742188 22.5 12 C 22.5 6.199219 17.800781 1.5 12 1.5 C 6.199219 1.5 1.5 6.199219 1.5 12 C 1.5 17.800781 6.199219 22.5 12 22.5 Z M 12 22.5"
			}
		)
	);
}
function CloseIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: props.className,
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
function CopyIcon(props) {
	return BdApi.React.createElement(
		Icon,
		{
			...props,
			className: props.className,
			viewBox: "0 0 24 24"
		},
		BdApi.React.createElement("g", { fill: "currentColor" }, BdApi.React.createElement("path", { d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z" }), BdApi.React.createElement("path", { d: "M15 5H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z" }))
	);
}

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
	return BdApi.React.createElement(Modals.ModalRoot, { ...modalProps, className: "colorwayColorpicker" }, BdApi.React.createElement(Flex, { style: { gap: "8px", marginBottom: "8px" } }, BdApi.React.createElement(
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

function ThemePreviewCategory({
	accent,
	primary,
	secondary,
	tertiary,
	className,
	isCollapsed,
	previewCSS,
	noContainer
}) {
	function ThemePreview({
		accent: accent2,
		primary: primary2,
		secondary: secondary2,
		tertiary: tertiary2,
		isModal,
		modalProps
	}) {
		return BdApi.React.createElement(
			"div",
			{
				className: "colorwaysPreview-wrapper",
				style: { background: `var(--dc-overlay-app-frame, ${tertiary2})` }
			},
			BdApi.React.createElement("div", { className: "colorwaysPreview-titlebar" }),
			BdApi.React.createElement("div", { className: "colorwaysPreview-body" }, BdApi.React.createElement("div", { className: "colorwayPreview-guilds" }, BdApi.React.createElement("div", { className: "colorwayPreview-guild" }, BdApi.React.createElement(
				"div",
				{
					className: "colorwayPreview-guildItem",
					style: { background: `var(--dc-guild-button, ${primary2})` },
					onMouseEnter: (e) => e.currentTarget.style.background = accent2,
					onMouseLeave: (e) => e.currentTarget.style.background = `var(--dc-guild-button, ${primary2})`,
					onClick: () => {
						if (isModal) {
							modalProps?.onClose();
						} else {
							Modals.openModal((props) => BdApi.React.createElement(Modals.ModalRoot, { className: "colorwaysPreview-modal", ...props }, BdApi.React.createElement("style", null, previewCSS), BdApi.React.createElement(ThemePreview, { accent: accent2, primary: primary2, secondary: secondary2, tertiary: tertiary2, isModal: true, modalProps: props })));
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
			)), BdApi.React.createElement("div", { className: "colorwayPreview-guild" }, BdApi.React.createElement("div", { className: "colorwayPreview-guildSeparator", style: { backgroundColor: primary2 } })), BdApi.React.createElement("div", { className: "colorwayPreview-guild" }, BdApi.React.createElement(
				"div",
				{
					className: "colorwayPreview-guildItem",
					style: { background: `var(--dc-guild-button, ${primary2})` },
					onMouseEnter: (e) => e.currentTarget.style.background = accent2,
					onMouseLeave: (e) => e.currentTarget.style.background = `var(--dc-guild-button, ${primary2})`
				}
			)), BdApi.React.createElement("div", { className: "colorwayPreview-guild" }, BdApi.React.createElement(
				"div",
				{
					className: "colorwayPreview-guildItem",
					style: { background: `var(--dc-guild-button, ${primary2})` },
					onMouseEnter: (e) => e.currentTarget.style.background = accent2,
					onMouseLeave: (e) => e.currentTarget.style.background = `var(--dc-guild-button, ${primary2})`
				}
			))), BdApi.React.createElement("div", { className: "colorwayPreview-channels", style: { background: `var(--dc-overlay-3, ${secondary2})` } }, BdApi.React.createElement(
				"div",
				{
					className: "colorwayPreview-userArea",
					style: {
						background: `var(--dc-secondary-alt, hsl(${HexToHSL(secondary2)[0]} ${HexToHSL(secondary2)[1]}% ${Math.max(HexToHSL(secondary2)[2] - 3.6, 0)}%))`
					}
				}
			), BdApi.React.createElement("div", { className: "colorwayPreview-filler" }), BdApi.React.createElement(
				"div",
				{
					className: "colorwayPreview-topShadow",
					style: {
						"--primary-900-hsl": `${HexToHSL(tertiary2)[0]} ${HexToHSL(tertiary2)[1]}% ${Math.max(HexToHSL(tertiary2)[2] - 3.6 * 6, 0)}%`,
						"--primary-500-hsl": `${HexToHSL(primary2)[0]} ${HexToHSL(primary2)[1]}% ${Math.min(HexToHSL(primary2)[2] + 3.6 * 3, 100)}%`
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
			)), BdApi.React.createElement("div", { className: "colorwayPreview-chat", style: { background: `var(--dc-overlay-chat, ${primary2})` } }, BdApi.React.createElement(
				"div",
				{
					className: "colorwayPreview-chatBox",
					style: {
						background: `var(--dc-overlay-3, hsl(${HexToHSL(primary2)[0]} ${HexToHSL(primary2)[1]}% ${Math.min(HexToHSL(primary2)[2] + 3.6, 100)}%))`
					}
				}
			), BdApi.React.createElement("div", { className: "colorwayPreview-filler" }), BdApi.React.createElement(
				"div",
				{
					className: "colorwayPreview-topShadow"
				}
			)))
		);
	}
	return !noContainer ? BdApi.React.createElement("div", { className: "colorwaysPreview" }, BdApi.React.createElement(
		Forms.FormTitle,
		{
			style: { marginBottom: 0 }
		},
		"Preview"
	), BdApi.React.createElement("style", null, previewCSS), BdApi.React.createElement(
		ThemePreview,
		{
			accent,
			primary,
			secondary,
			tertiary
		}
	)) : BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("style", null, `.colorwaysPreview-wrapper {color: var(--header-secondary); box-shadow: var(--legacy-elevation-border);}` + previewCSS), BdApi.React.createElement(
		ThemePreview,
		{
			accent,
			primary,
			secondary,
			tertiary
		}
	));
}

function InputColorwayIdModal({ modalProps, onColorwayId }) {
	const [colorwayID, setColorwayID] = React.useState("");
	return BdApi.React.createElement(Modals.ModalRoot, { ...modalProps, className: "colorwaysCreator-noMinHeight" }, BdApi.React.createElement(Modals.ModalContent, { className: "colorwaysCreator-noHeader colorwaysCreator-noMinHeight" }, BdApi.React.createElement(Forms.FormTitle, null, "Colorway ID:"), BdApi.React.createElement(TextInput, { placeholder: "Enter Colorway ID", onInput: (e) => setColorwayID(e.currentTarget.value) })), BdApi.React.createElement(Modals.ModalFooter, null, BdApi.React.createElement(
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
	return BdApi.React.createElement(Modals.ModalRoot, { ...modalProps, className: "colorwaysPresetPicker" }, BdApi.React.createElement(Modals.ModalHeader, null, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Creator Settings")), BdApi.React.createElement(Modals.ModalContent, { className: "colorwaysPresetPicker-content" }, BdApi.React.createElement("div", { className: "colorwaysCreator-settingCat", style: { marginBottom: "20px" } }, BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: "0" } }, "Presets:"), BdApi.React.createElement(ScrollerThin, { orientation: "vertical", className: "colorwaysCreator-settingsList", paddingFix: true, style: { paddingRight: "2px" } }, Object.values(getPreset()).map((pre) => {
		return BdApi.React.createElement("div", { className: "colorwaysCreator-settingItm colorwaysCreator-preset", onClick: () => {
			setPreset(pre.id);
		} }, BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), preset === pre.id && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" })), BdApi.React.createElement(Text, { variant: "eyebrow", tag: "h5" }, pre.name));
	}))), BdApi.React.createElement(Switch, { value: tintedText, onChange: setTintedText }, "Use colored text"), BdApi.React.createElement(Switch, { value: discordSaturation, onChange: setDiscordSaturation, hideBorder: true, style: { marginBottom: "0" } }, "Use Discord's saturation")), BdApi.React.createElement(Modals.ModalFooter, null, BdApi.React.createElement(
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
		const parsedID = colorwayID?.split("colorway:")[1];
		if (parsedID) {
			if (!parsedID) {
				throw new Error("Please enter a Colorway ID");
			} else if (!hexToString(parsedID).includes(",")) {
				throw new Error("Invalid Colorway ID");
			} else {
				const setColor = [
					setAccentColor,
					setPrimaryColor,
					setSecondaryColor,
					setTertiaryColor
				];
				hexToString(parsedID).split(/,#/).forEach((color, i) => setColor[i](colorToHex(color)));
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
	return BdApi.React.createElement(Modals.ModalRoot, { ...modalProps, className: "colorwayCreator-modal" }, BdApi.React.createElement(Modals.ModalHeader, null, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Create Colorway")), BdApi.React.createElement(Modals.ModalContent, { className: "colorwayCreator-menuWrapper" }, BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0 } }, "Name:"), BdApi.React.createElement(
		TextInput,
		{
			placeholder: "Give your Colorway a name",
			value: colorwayName,
			onChange: setColorwayName
		}
	), BdApi.React.createElement("div", { className: "colorwaysCreator-settingCat" }, BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: "0" } }, "Colors:"), BdApi.React.createElement("div", { className: "colorwayCreator-colorPreviews" }, presetColorArray.map((presetColor) => {
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
	}))), BdApi.React.createElement(
		"div",
		{
			className: "colorwaysCreator-setting",
			onClick: () => Modals.openModal((props) => BdApi.React.createElement(
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
		ThemePreviewCategory,
		{
			isCollapsed: false,
			accent: "#" + accentColor,
			primary: "#" + primaryColor,
			secondary: "#" + secondaryColor,
			tertiary: "#" + tertiaryColor,
			noContainer: true,
			previewCSS: gradientPresetIds.includes(getPreset()[preset].id) ? pureGradientBase + `.colorwaysPreview-modal,.colorwaysPreview-wrapper {--gradient-theme-bg: linear-gradient(${getPreset(
				primaryColor,
				secondaryColor,
				tertiaryColor,
				accentColor
			)[preset].preset(discordSaturation).base})}` : ""
		}
	)), BdApi.React.createElement(Modals.ModalFooter, null, BdApi.React.createElement(
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
						discordSaturation
					);
				} else {
					gradientPresetIds.includes(getPreset()[preset].id) ? customColorwayCSS = getPreset(
						primaryColor,
						secondaryColor,
						tertiaryColor,
						accentColor
					)[preset].preset(discordSaturation).full : customColorwayCSS = getPreset(
						primaryColor,
						secondaryColor,
						tertiaryColor,
						accentColor
					)[preset].preset(discordSaturation);
				}
				const customColorway = {
					name: (colorwayName || "Colorway") + (preset === "default" ? "" : ": Made for " + getPreset()[preset].name),
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
					)[preset].preset(discordSaturation).base : ""
				};
				const customColorwaysArray = [customColorway];
				betterdiscord.Data.load("custom_colorways").forEach(
					(color) => {
						if (color.name !== customColorway.name) {
							customColorwaysArray.push(color);
						}
					}
				);
				betterdiscord.Data.save("custom_colorways", customColorwaysArray);
				modalProps.onClose();
				loadUIProps();
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
					Modals.openModal((props) => BdApi.React.createElement(ConflictingColorsModal, { modalProps: props, onFinished: setAllColors }));
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
			onClick: () => Modals.openModal((props) => BdApi.React.createElement(InputColorwayIdModal, { modalProps: props, onColorwayId: (colorwayID2) => {
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

function ColorwayInfoModal({
	modalProps,
	colorwayProps,
	discrimProps = false,
	loadUIProps
}) {
	const colors = colorwayProps.colors || [
		"accent",
		"primary",
		"secondary",
		"tertiary"
	];
	const [collapsedCSS, setCollapsedCSS] = React.useState(true);
	return BdApi.React.createElement(Modals.ModalRoot, { ...modalProps, className: "colorwayCreator-modal" }, BdApi.React.createElement(Modals.ModalHeader, null, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Colorway Details: ", colorwayProps.name)), BdApi.React.createElement(Modals.ModalContent, null, BdApi.React.createElement("div", { className: "colorwayInfo-wrapper" }, BdApi.React.createElement("div", { className: "colorwayInfo-colorSwatches" }, colors.map((color) => {
		return BdApi.React.createElement(
			"div",
			{
				className: "colorwayInfo-colorSwatch",
				style: {
					backgroundColor: colorwayProps[color]
				},
				onClick: () => {
					Clipboard.copy(colorwayProps[color]);
					Toasts.show({
						message: "Copied color successfully",
						type: 1,
						id: "copy-colorway-color-notify"
					});
				}
			}
		);
	})), BdApi.React.createElement("div", { className: "colorwayInfo-row colorwayInfo-author" }, BdApi.React.createElement(Flex, { style: { gap: "10px", width: "100%", alignItems: "center" } }, BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0, width: "100%" } }, "Properties:"), BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			style: { flex: "0 0 auto", maxWidth: "236px" },
			onClick: () => {
				openUserProfile(colorwayProps.authorID);
			}
		},
		"Author: ",
		colorwayProps.author
	), BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			style: { flex: "0 0 auto" },
			onClick: () => {
				const colorwayIDArray = `${colorwayProps.accent},${colorwayProps.primary},${colorwayProps.secondary},${colorwayProps.tertiary}`;
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
	), discrimProps && BdApi.React.createElement(
		Button,
		{
			style: { flex: "0 0 auto" },
			color: Button.Colors.RED,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.FILLED,
			onClick: async () => {
				const customColorwaysArray = [];
				betterdiscord.Data.load("custom_colorways").map((color, i) => {
					if (betterdiscord.Data.load("custom_colorways").length > 0) {
						if (color.name !== colorwayProps.name) {
							customColorwaysArray.push(color);
						}
						if (++i === betterdiscord.Data.load("custom_colorways").length) {
							betterdiscord.Data.save("custom_colorways", customColorwaysArray);
						}
						if (betterdiscord.Data.load("settings").activeColorwayID === colorwayProps.name) {
							betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), activeColorway: null, activeColorwayID: null });
							ColorwayCSS.set("");
						}
						modalProps.onClose();
						loadUIProps();
					}
				});
			}
		},
		"Delete"
	))), BdApi.React.createElement("div", { className: "colorwayInfo-row colorwayInfo-css" + (collapsedCSS ? " colorwaysCreator-settingCat-collapsed" : "") }, BdApi.React.createElement(Flex, { style: { gap: "10px", width: "100%", alignItems: "center" } }, BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0, width: "100%" } }, "CSS:"), BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			onClick: () => setCollapsedCSS(!collapsedCSS)
		},
		collapsedCSS ? "Show" : "Hide"
	), BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			onClick: () => {
				Clipboard.copy(colorwayProps["dc-import"]);
				Toasts.show({
					message: "Copied CSS to Clipboard",
					type: 1,
					id: "copy-colorway-css-notify"
				});
			}
		},
		"Copy"
	), discrimProps ? BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			onClick: async () => {
				const customColorwaysArray = [];
				betterdiscord.Data.load("custom_colorways").map((color, i) => {
					if (betterdiscord.Data.load("custom_colorways").length > 0) {
						if (color.name === colorwayProps.name) {
							color["dc-import"] = generateCss(colorToHex(color.primary) || "313338", colorToHex(color.secondary) || "2b2d31", colorToHex(color.tertiary) || "1e1f22", colorToHex(color.accent) || "5865f2", true, true);
							customColorwaysArray.push(color);
						} else {
							customColorwaysArray.push(color);
						}
						if (++i === betterdiscord.Data.load("custom_colorways").length) {
							betterdiscord.Data.save("custom_colorways", customColorwaysArray);
						}
						modalProps.onClose();
						loadUIProps();
					}
				});
			}
		},
		"Update"
	) : BdApi.React.createElement(
		Button,
		{
			color: Button.Colors.PRIMARY,
			size: Button.Sizes.MEDIUM,
			look: Button.Looks.OUTLINED,
			onClick: async () => {
				const responses = await Promise.all(
					betterdiscord.Data.load("settings").colorwayLists.map(
						(url) => fetch(url)
					)
				);
				const data = await Promise.all(
					responses.map(
						(res) => res.json().then((dt) => {
							return { colorways: dt.colorways, url: res.url };
						}).catch(() => {
							return { colorways: [], url: res.url };
						})
					)
				);
				const colorways = data.flatMap((json) => json.colorways);
				const customColorwaysArray = [];
				colorways.map((color, i) => {
					if (colorways.length > 0) {
						if (color.name === colorwayProps.name) {
							color.name += " (Custom)";
							color["dc-import"] = generateCss(colorToHex(color.primary) || "313338", colorToHex(color.secondary) || "2b2d31", colorToHex(color.tertiary) || "1e1f22", colorToHex(color.accent) || "5865f2", true, true);
							customColorwaysArray.push(color);
						}
						if (++i === colorways.length) {
							betterdiscord.Data.save("custom_colorways", [...betterdiscord.Data.load("custom_colorways"), ...customColorwaysArray]);
						}
						modalProps.onClose();
						loadUIProps();
					}
				});
			}
		},
		"Update"
	)), BdApi.React.createElement(
		Text,
		{
			variant: "code",
			selectable: true,
			className: "colorwayInfo-cssCodeblock"
		},
		colorwayProps["dc-import"]
	)), BdApi.React.createElement(
		ThemePreviewCategory,
		{
			isCollapsed: true,
			className: "colorwayInfo-lastCat",
			accent: colorwayProps.accent,
			primary: colorwayProps.primary,
			secondary: colorwayProps.secondary,
			tertiary: colorwayProps.tertiary,
			noContainer: true,
			previewCSS: colorwayProps.isGradient ? pureGradientBase + `.colorwaysPreview-modal,.colorwaysPreview-wrapper {--gradient-theme-bg: linear-gradient(${colorwayProps.linearGradient})}` : ""
		}
	), BdApi.React.createElement("div", { style: { width: "100%", height: "20px" } }))));
}

const { SelectionCircle } = proxyLazy(() => betterdiscord.Webpack.getByKeys("SelectionCircle"));
function SelectorContainer({ children, isSettings, modalProps }) {
	if (!isSettings) {
		return BdApi.React.createElement(Modals.ModalRoot, { ...modalProps, className: "colorwaySelectorModal" }, children);
	} else {
		return BdApi.React.createElement(SettingsTab, { title: "Colors" }, BdApi.React.createElement("div", { className: "colorwaysSettingsSelector-wrapper" }, children));
	}
}
function SelectorHeader({ children, isSettings }) {
	if (!isSettings) {
		return BdApi.React.createElement(Modals.ModalHeader, null, children);
	} else {
		return BdApi.React.createElement(Flex, { style: { gap: "0" } }, children);
	}
}
function SelectorContent({ children, isSettings }) {
	if (!isSettings) {
		return BdApi.React.createElement(Modals.ModalContent, { className: "colorwaySelectorModalContent" }, children);
	} else {
		return BdApi.React.createElement(BdApi.React.Fragment, null, children);
	}
}
function Selector({
	modalProps,
	isSettings
}) {
	const [currentColorway, setCurrentColorway] = React.useState("");
	const [colorways, setColorways] = React.useState([]);
	const [thirdPartyColorways, setThirdPartyColorways] = React.useState([]);
	const [customColorways, setCustomColorways] = React.useState([]);
	const [searchString, setSearchString] = React.useState("");
	const [loaderHeight, setLoaderHeight] = React.useState("2px");
	const [visibility, setVisibility] = React.useState("all");
	const [showReloadMenu, setShowReloadMenu] = React.useState(false);
	let visibleColorwayArray;
	switch (visibility) {
		case "all":
			visibleColorwayArray = [...colorways, ...thirdPartyColorways, ...customColorways];
			break;
		case "official":
			visibleColorwayArray = [...colorways];
			break;
		case "3rdparty":
			visibleColorwayArray = [...thirdPartyColorways];
			break;
		case "custom":
			visibleColorwayArray = [...customColorways];
			break;
		default:
			visibleColorwayArray = [...colorways, ...thirdPartyColorways, ...customColorways];
			break;
	}
	async function loadUI(disableCache = false) {
		const responses = await Promise.all(
			betterdiscord.Data.load("settings").colorwayLists.map(
				(url) => fetch(url, disableCache ? { cache: "no-store" } : {})
			)
		);
		const data = await Promise.all(
			responses.map(
				(res) => res.json().then((dt) => {
					return { colorways: dt.colorways, url: res.url };
				}).catch(() => {
					return { colorways: [], url: res.url };
				})
			)
		);
		const colorways2 = data.flatMap((json) => json.url === defaultColorwaySource ? json.colorways : []);
		const thirdPartyColorwaysArr = data.flatMap((json) => json.url !== defaultColorwaySource ? json.colorways : []);
		setColorways(colorways2 || fallbackColorways);
		setThirdPartyColorways(thirdPartyColorwaysArr);
		setCustomColorways(betterdiscord.Data.load("custom_colorways"));
		setCurrentColorway(betterdiscord.Data.load("settings").activeColorwayID);
	}
	const cached_loadUI = React.useCallback(loadUI, [setColorways, setCustomColorways, setCurrentColorway]);
	async function searchColorways(e) {
		if (!e) {
			cached_loadUI();
			return;
		}
		const data = await Promise.all(
			betterdiscord.Data.load("settings").colorwayLists.map(
				(url) => fetch(url).then((res) => res.json().then((dt) => {
					return { colorways: dt.colorways, url: res.url };
				}).catch(() => {
					return { colorways: [], url: res.url };
				}))
			)
		);
		const colorways2 = data.flatMap((json) => json.url === defaultColorwaySource ? json.colorways : []);
		const thirdPartyColorwaysArr = data.flatMap((json) => json.url !== defaultColorwaySource ? json.colorways : []);
		var results = [];
		(colorways2 || fallbackColorways).find((Colorway) => {
			if (Colorway.name.toLowerCase().includes(e.toLowerCase()))
				results.push(Colorway);
		});
		var thirdPartyResults = [];
		thirdPartyColorwaysArr.find((Colorway) => {
			if (Colorway.name.toLowerCase().includes(e.toLowerCase()))
				thirdPartyResults.push(Colorway);
		});
		var customResults = [];
		betterdiscord.Data.load("custom_colorways").find((Colorway) => {
			if (Colorway.name.toLowerCase().includes(e.toLowerCase()))
				customResults.push(Colorway);
		});
		setColorways(results);
		setThirdPartyColorways(thirdPartyResults);
		setCustomColorways(customResults);
	}
	React.useEffect(() => {
		if (!searchString) {
			cached_loadUI();
		}
		setLoaderHeight("0px");
	}, [searchString]);
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
					action: () => {
						setLoaderHeight("2px");
						cached_loadUI(true).then(() => setLoaderHeight("0px"));
					}
				}
			)
		);
	}
	return BdApi.React.createElement(SelectorContainer, { modalProps, isSettings }, BdApi.React.createElement(SelectorHeader, { isSettings }, BdApi.React.createElement(
		TextInput,
		{
			className: "colorwaySelector-search",
			placeholder: "Search for Colorways...",
			value: searchString,
			onChange: (e) => [searchColorways, setSearchString].forEach((t) => t(e))
		}
	), BdApi.React.createElement(Tooltip, { text: "Refresh Colorways..." }, ({ onMouseEnter, onMouseLeave }) => {
		return BdApi.React.createElement(
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
						cached_loadUI().then(() => setLoaderHeight("0px"));
					},
					onContextMenu: () => {
						onMouseLeave();
						setShowReloadMenu((v) => !v);
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
					BdApi.React.createElement("path", { d: "M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z" }),
					BdApi.React.createElement("path", { d: "M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z" })
				)
			)
		);
	}), !isSettings ? BdApi.React.createElement(Tooltip, { text: "Open Settings" }, ({ onMouseEnter, onMouseLeave }) => BdApi.React.createElement(
		Button,
		{
			innerClassName: "colorwaysSettings-iconButtonInner",
			size: Button.Sizes.ICON,
			color: Button.Colors.PRIMARY,
			look: Button.Looks.OUTLINED,
			style: { marginLeft: "8px" },
			id: "colorway-opensettings",
			onMouseEnter,
			onMouseLeave,
			onClick: () => {
				SettingsRouter.open("ColorwaysSettings");
				modalProps.onClose();
			}
		},
		BdApi.React.createElement(
			"svg",
			{
				"aria-hidden": "true",
				role: "img",
				width: "20",
				height: "20",
				style: { padding: "6px", boxSizing: "content-box" },
				viewBox: "0 0 24 24"
			},
			BdApi.React.createElement("path", { fill: "currentColor", "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" })
		)
	)) : BdApi.React.createElement(BdApi.React.Fragment, null), BdApi.React.createElement(Tooltip, { text: "Create Colorway..." }, ({ onMouseEnter, onMouseLeave }) => BdApi.React.createElement(
		Button,
		{
			innerClassName: "colorwaysSettings-iconButtonInner",
			size: Button.Sizes.ICON,
			color: Button.Colors.PRIMARY,
			look: Button.Looks.OUTLINED,
			style: { marginLeft: "8px" },
			onMouseEnter,
			onMouseLeave,
			onClick: () => Modals.openModal((props) => BdApi.React.createElement(
				CreatorModal,
				{
					modalProps: props,
					loadUIProps: cached_loadUI
				}
			))
		},
		BdApi.React.createElement(
			"svg",
			{
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": "true",
				role: "img",
				width: "20",
				height: "20",
				style: { padding: "6px", boxSizing: "content-box" },
				viewBox: "0 0 24 24"
			},
			BdApi.React.createElement(
				"path",
				{
					fill: "currentColor",
					d: "M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z"
				}
			)
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
			onClick: () => Modals.openModal((props) => BdApi.React.createElement(ColorPicker, { modalProps: props }))
		},
		BdApi.React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", style: { padding: "6px", boxSizing: "content-box" }, fill: "currentColor", viewBox: "0 0 16 16" }, BdApi.React.createElement("path", { d: "M12.433 10.07C14.133 10.585 16 11.15 16 8a8 8 0 1 0-8 8c1.996 0 1.826-1.504 1.649-3.08-.124-1.101-.252-2.237.351-2.92.465-.527 1.42-.237 2.433.07zM8 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" }))
	)), !isSettings ? BdApi.React.createElement(Tooltip, { text: "Close" }, ({ onMouseEnter, onMouseLeave }) => BdApi.React.createElement(
		Button,
		{
			innerClassName: "colorwaysSettings-iconButtonInner",
			size: Button.Sizes.ICON,
			color: Button.Colors.PRIMARY,
			look: Button.Looks.OUTLINED,
			id: "colorwaySelector-pill_closeSelector",
			onMouseEnter,
			onMouseLeave,
			onClick: () => modalProps.onClose()
		},
		BdApi.React.createElement(CloseIcon, { style: { padding: "6px", boxSizing: "content-box" }, width: 20, height: 20 })
	)) : BdApi.React.createElement(BdApi.React.Fragment, null)), BdApi.React.createElement(SelectorContent, { isSettings }, BdApi.React.createElement("div", { className: "colorwaysLoader-barContainer" }, BdApi.React.createElement("div", { className: "colorwaysLoader-bar", style: { height: loaderHeight } })), BdApi.React.createElement(ScrollerThin, { style: { maxHeight: "450px" }, className: "ColorwaySelectorWrapper" }, visibleColorwayArray.length === 0 && BdApi.React.createElement(
		Forms.FormTitle,
		{
			style: {
				marginBottom: 0,
				width: "100%",
				textAlign: "center"
			}
		},
		"No colorways..."
	), ["all", "official", "3rdparty", "custom"].includes(visibility) && visibleColorwayArray.map((color, ind) => {
		var colors = color.colors || [
			"accent",
			"primary",
			"secondary",
			"tertiary"
		];
		return BdApi.React.createElement(Tooltip, { text: color.name }, ({ onMouseEnter, onMouseLeave }) => BdApi.React.createElement(
			"div",
			{
				className: "discordColorway",
				id: "colorway-" + color.name,
				"data-last-official": ind + 1 === colorways.length,
				onMouseEnter,
				onMouseLeave,
				onClick: () => {
					if (currentColorway === color.name) {
						betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), activeColorway: null });
						betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), activeColorwayID: null });
						setCurrentColorway("");
						ColorwayCSS.remove();
					} else {
						betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), activeColorwayColors: color.colors });
						betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), activeColorwayID: color.name });
						setCurrentColorway(color.name);
						if (betterdiscord.Data.load("settings").onDemandWays) {
							const demandedColorway = !color.isGradient ? generateCss(
								colorToHex(color.primary),
								colorToHex(color.secondary),
								colorToHex(color.tertiary),
								colorToHex(color.accent),
								betterdiscord.Data.load("settings").onDemandWaysTintedText,
								betterdiscord.Data.load("settings").onDemandWaysDiscordSaturation
							) : gradientBase(colorToHex(color.accent), betterdiscord.Data.load("settings").onDemandWaysDiscordSaturation) + `:root:root {--custom-theme-background: linear-gradient(${color.linearGradient})}`;
							betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), activeColorway: demandedColorway });
							ColorwayCSS.set(demandedColorway);
						} else {
							betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), activeColorway: color["dc-import"] });
							ColorwayCSS.set(color["dc-import"]);
						}
					}
				}
			},
			BdApi.React.createElement(
				"div",
				{
					className: "colorwayInfoIconContainer",
					onClick: (e) => {
						e.stopPropagation();
						Modals.openModal((props) => BdApi.React.createElement(
							ColorwayInfoModal,
							{
								modalProps: props,
								colorwayProps: color,
								discrimProps: customColorways.includes(color),
								loadUIProps: cached_loadUI
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
			currentColorway === color.name && BdApi.React.createElement(SelectionCircle, null)
		));
	}))), !isSettings ? BdApi.React.createElement(Modals.ModalFooter, null, BdApi.React.createElement(
		Button,
		{
			size: Button.Sizes.MEDIUM,
			color: Button.Colors.PRIMARY,
			look: Button.Looks.OUTLINED,
			style: { marginLeft: "8px" },
			onClick: () => {
				SettingsRouter.open("ColorwaysSettings");
				modalProps.onClose();
			}
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
	), BdApi.React.createElement(Select, { className: "colorwaySelector-sources " + ButtonLooks.OUTLINED, look: 1, popoutClassName: "colorwaySelector-sourceSelect", options: [
		{
			value: "all",
			label: "All"
		},
		{
			value: "official",
			label: "Official"
		},
		{
			value: "3rdparty",
			label: "3rd-Party"
		},
		{
			value: "custom",
			label: "Custom"
		}
	], select: (value) => {
		setVisibility(value);
	}, isSelected: (value) => visibility === value, serialize: String, popoutPosition: "top" })) : BdApi.React.createElement(BdApi.React.Fragment, null));
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
			text: !isThin ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("span", null, "Colorways"), BdApi.React.createElement(Text, { variant: "text-xs/normal", style: { color: "var(--text-muted)", fontWeight: 500 } }, "Active Colorway: " + activeColorway)) : BdApi.React.createElement("span", null, "Active Colorway: " + activeColorway),
			position: "right",
			tooltipContentClassName: "colorwaysBtn-tooltipContent"
		},
		({ onMouseEnter, onMouseLeave, onClick }) => visibility ? BdApi.React.createElement("div", { className: "ColorwaySelectorBtnContainer" }, BdApi.React.createElement(
			"div",
			{
				className: "ColorwaySelectorBtn" + (isThin ? " ColorwaySelectorBtn_thin" : ""),
				onMouseEnter: () => {
					onMouseEnter();
					setActiveColorway(betterdiscord.Data.load("settings").activeColorwayID || "None");
				},
				onMouseLeave,
				onClick: () => {
					onClick();
					Modals.openModal((props) => BdApi.React.createElement(Selector, { modalProps: props }));
				}
			},
			isThin ? BdApi.React.createElement(Text, { variant: "text-xs/normal", style: { color: "var(--header-primary)", fontWeight: 700, fontSize: 9 } }, "Colorways") : BdApi.React.createElement(PalleteIcon, null)
		)) : BdApi.React.createElement(BdApi.React.Fragment, null)
	);
}

const css = "/* stylelint-disable no-descending-specificity */\n/* stylelint-disable declaration-block-no-redundant-longhand-properties */\n/* stylelint-disable selector-id-pattern */\n/* stylelint-disable selector-class-pattern */\n@import url(\"https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css\");\n\n.ColorwaySelectorBtn {\n  	height: 48px;\n  	width: 48px;\n  	border-radius: 50px;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	transition: .15s ease-out;\n  	background-color: var(--background-primary);\n  	cursor: pointer;\n  	color: var(--text-normal);\n}\n\n.ColorwaySelectorBtn:hover {\n  	background-color: var(--brand-experiment);\n  	border-radius: 16px;\n}\n\n.discordColorway {\n  	height: 60px;\n  	width: 60px;\n  	cursor: pointer;\n  	display: flex;\n  	flex-flow: wrap;\n  	flex-direction: row;\n  	position: relative;\n  	align-items: center;\n  	justify-content: center;\n  	transition: 170ms ease;\n}\n\n.discordColorway:hover {\n  	filter: brightness(.8);\n}\n\n.discordColorwayPreviewColorContainer {\n  	display: flex;\n  	flex-flow: wrap;\n  	flex-direction: row;\n  	overflow: hidden;\n  	border-radius: 50%;\n  	width: 56px;\n  	height: 56px;\n  	box-shadow: 0 0 0 1.5px var(--interactive-normal);\n  	box-sizing: border-box;\n}\n\n.discordColorwayPreviewColor {\n  	width: 50%;\n  	height: 50%;\n}\n\n.discordColorwayPreviewColorContainer:not(:has(>.discordColorwayPreviewColor:nth-child(2)))>.discordColorwayPreviewColor {\n  	height: 100%;\n  	width: 100%;\n}\n\n.discordColorwayPreviewColorContainer:not(:has(>.discordColorwayPreviewColor:nth-child(3)))>.discordColorwayPreviewColor {\n  	height: 100%;\n}\n\n.discordColorwayPreviewColorContainer:not(:has(>.discordColorwayPreviewColor:nth-child(4)))>.discordColorwayPreviewColor:nth-child(3) {\n  	width: 100%;\n}\n\n.ColorwaySelectorWrapper {\n  	position: relative;\n  	display: flex;\n  	gap: 16px 23px;\n  	width: 100%;\n  	flex-wrap: wrap;\n  	padding: 2px;\n  	scrollbar-width: none !important;\n}\n\n.ColorwaySelectorWrapper::-webkit-scrollbar {\n  	width: 0;\n}\n\n.colorwaySelectorModal {\n  	width: 100% !important;\n  	min-width: 596px !important;\n}\n\n.colorwaySelectorModalContent {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	width: 100%;\n  	max-width: 596px;\n  	overflow: visible !important;\n  	padding: 0 16px 16px !important;\n}\n\n.ColorwaySelectorBtnContainer {\n  	position: relative;\n  	margin: 0 0 8px;\n  	display: flex;\n  	-webkit-box-pack: center;\n  	-ms-flex-pack: center;\n  	justify-content: center;\n  	width: 72px;\n}\n\n.colorwayInfoIconContainer {\n  	height: 22px;\n  	width: 22px;\n  	background-color: var(--brand-500);\n  	position: absolute;\n  	top: -1px;\n  	left: -1px;\n  	border-radius: 50%;\n  	opacity: 0;\n  	z-index: +1;\n  	color: var(--white-500);\n  	padding: 1px;\n  	box-sizing: border-box;\n}\n\n.colorwayInfoIconContainer:hover {\n  	background-color: var(--brand-experiment-560);\n}\n\n.discordColorway:hover .colorwayInfoIconContainer {\n  	opacity: 1;\n  	transition: .15s;\n}\n\n.colorwayCreator-swatch {\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	height: 50px;\n  	border-radius: 4px;\n  	box-sizing: border-box;\n  	border: none;\n  	width: 100%;\n  	position: relative;\n  	color: #fff;\n}\n\n.colorwayCreator-swatchName {\n  	color: currentcolor;\n  	pointer-events: none;\n}\n\n.colorwayCreator-colorPreviews {\n  	width: 100%;\n  	height: fit-content;\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: space-between;\n  	gap: 8px;\n  	position: relative;\n  	box-sizing: border-box;\n}\n\n.colorwayCreator-colorInput {\n  	width: 1px;\n  	height: 1px;\n  	opacity: 0;\n  	position: absolute;\n  	pointer-events: none;\n}\n\n.colorwayCreator-menuWrapper {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	padding: 20px 16px !important;\n  	overflow: visible !important;\n  	min-height: unset;\n}\n\n.colorwayCreator-modal {\n  	width: 620px !important;\n  	max-width: 620px;\n  	max-height: unset !important;\n}\n\n.colorways-creator-module-warning {\n  	color: var(--brand-500);\n}\n\n.colorwayCreator-colorPreviews>[class^=\"colorSwatch\"],\n.colorwayCreator-colorPreviews>[class^=\"colorSwatch\"]>[class^=\"swatch\"] {\n  	width: 100%;\n  	border: none;\n  	position: relative;\n}\n\n.colorwaysPicker-colorLabel {\n  	position: absolute;\n  	top: 0;\n  	left: 0;\n  	width: 100%;\n  	height: 100%;\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	pointer-events: none;\n}\n\n.colorwayCreator-colorPreviews>.colorSwatch-2UxEuG:has([fill=\"var(--primary-530)\"])>.colorwaysPicker-colorLabel {\n  	color: var(--primary-530);\n}\n\n.colorwaySelector-noDisplay {\n  	display: none;\n}\n\n.colorwayInfo-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	color: var(--header-primary);\n}\n\n.colorwayInfo-colorSwatches {\n  	width: 100%;\n  	height: 46px;\n  	display: flex;\n  	flex-direction: row;\n  	margin: 12px 0;\n  	gap: 8px;\n}\n\n.colorwayInfo-colorSwatch {\n  	display: flex;\n  	width: 100%;\n  	height: 46px;\n  	border-radius: 4px;\n  	cursor: pointer;\n  	position: relative;\n}\n\n.colorwayInfo-row {\n  	font-weight: 400;\n  	font-size: 20px;\n  	color: var(--header-secondary);\n  	margin-bottom: 4px;\n  	display: flex;\n  	flex-direction: row;\n  	align-items: center;\n  	justify-content: space-between;\n  	gap: 8px;\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	padding: 8px 12px;\n}\n\n.colorwayInfo-css {\n  	flex-direction: column;\n  	align-items: start;\n}\n\n.colorwayInfo-cssCodeblock {\n  	border-radius: 4px;\n  	border: 1px solid var(--background-accent);\n  	padding: 3px 6px;\n  	white-space: pre;\n  	max-height: 400px;\n  	overflow: auto;\n  	font-size: 0.875rem;\n  	line-height: 1.125rem;\n  	width: 100%;\n  	box-sizing: border-box;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar {\n  	width: 8px;\n  	height: 8px;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-corner {\n  	background-color: transparent;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-thumb {\n  	background-color: var(--scrollbar-auto-thumb);\n  	min-height: 40px;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-thumb,\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-track {\n  	border: 2px solid transparent;\n  	background-clip: padding-box;\n  	border-radius: 8px;\n}\n\n.colorwayInfo-cssCodeblock::-webkit-scrollbar-track {\n  	margin-bottom: 8px;\n}\n\n.colorwaysCreator-settingCat {\n  	display: flex;\n  	flex-direction: column;\n  	padding: 10px;\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	box-sizing: border-box;\n  	color: var(--header-secondary);\n  	max-height: 250px;\n  	overflow: hidden overlay;\n}\n\n.colorwaysColorpicker-settingCat {\n  	padding: 0;\n  	background-color: transparent;\n  	border-radius: 0;\n}\n\n.colorwaysColorpicker-search {\n  	width: 100%;\n}\n\n.colorwaysCreator-settingItm {\n  	display: flex;\n  	flex-direction: row;\n  	align-items: center;\n  	width: 100%;\n  	border-radius: 4px;\n  	cursor: pointer;\n  	box-sizing: border-box;\n  	padding: 8px;\n  	justify-content: space-between;\n}\n\n.colorwaysCreator-settingItm:hover {\n  	background-color: var(--background-modifier-hover);\n}\n\n.colorwaysCreator-settingsList .colorwaysCreator-preset {\n  	justify-content: start;\n  	gap: 8px;\n}\n\n.colorwaysCreator-settingsList {\n  	overflow: auto;\n  	max-height: 185px;\n}\n\n.colorwaysCreator-settingCat-collapsed>:is(.colorwaysCreator-settingsList, .colorwayInfo-cssCodeblock),\n.colorwaysColorpicker-collapsed {\n  	display: none !important;\n}\n\n.colorwayColorpicker {\n  	display: flex;\n  	flex-direction: column;\n  	padding: 20px 16px !important;\n  	width: 620px !important;\n  	min-height: unset;\n}\n\n.colorwaysCreator-noHeader {\n  	margin-top: 12px;\n  	margin-bottom: 12px;\n}\n\n.colorwaysCreator-noMinHeight {\n  	min-height: unset;\n  	height: fit-content;\n}\n\n.colorwaysPreview-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	width: 100%;\n  	height: 270px;\n  	flex: 1 0 auto;\n  	border-radius: 4px;\n  	overflow: hidden;\n}\n\n.colorwaysPreview-modal {\n  	max-width: unset !important;\n  	max-height: unset !important;\n  	width: fit-content;\n  	height: fit-content;\n}\n\n.colorwaysPreview-titlebar {\n  	height: 22px;\n  	width: 100%;\n  	display: flex;\n  	flex: 1 0 auto;\n}\n\n.colorwaysPreview-body {\n  	height: 100%;\n  	width: 100%;\n  	display: flex;\n}\n\n.colorwayPreview-guilds {\n  	width: 72px;\n  	height: 100%;\n  	display: flex;\n  	flex: 1 0 auto;\n  	padding-top: 4px;\n  	flex-direction: column;\n}\n\n.colorwayPreview-channels {\n  	width: 140px;\n  	height: 100%;\n  	display: flex;\n  	flex-direction: column-reverse;\n  	border-top-left-radius: 8px;\n  	flex: 1 0 auto;\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-channels {\n  	width: 240px;\n}\n\n.colorwayPreview-chat {\n  	width: 100%;\n  	height: 100%;\n  	display: flex;\n  	position: relative;\n  	flex-direction: column-reverse;\n}\n\n.colorwayPreview-userArea {\n  	width: 100%;\n  	height: 40px;\n  	display: flex;\n  	flex: 1 0 auto;\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-userArea {\n  	height: 52px;\n}\n\n.colorwaysPreview {\n  	display: flex;\n  	flex-direction: column;\n  	padding: 10px;\n  	gap: 5px;\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	box-sizing: border-box;\n  	color: var(--header-secondary);\n  	overflow: hidden overlay;\n  	margin-bottom: 4px;\n}\n\n.colorwaysPreview-collapsed .colorwaysPreview-wrapper {\n  	display: none;\n}\n\n.colorwayInfo-lastCat,\n.colorwaysCreator-lastCat {\n  	margin-bottom: 12px;\n}\n\n.colorwayPreview-guild {\n  	width: 100%;\n  	margin-bottom: 8px;\n  	display: flex;\n  	justify-content: center;\n}\n\n.colorwayPreview-guildItem {\n  	cursor: pointer;\n  	width: 48px;\n  	height: 48px;\n  	border-radius: 50px;\n  	transition: .2s ease;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n}\n\n.colorwayPreview-guildItem:hover {\n  	border-radius: 16px;\n}\n\n.colorwayPreview-guildSeparator {\n  	width: 32px;\n  	height: 2px;\n  	opacity: .48;\n  	border-radius: 1px;\n}\n\n.colorwayToolbox-listItem {\n  	align-items: center;\n  	border-radius: 4px;\n  	color: var(--interactive-normal);\n  	display: flex;\n  	flex-direction: column;\n  	gap: 12px;\n  	background-color: transparent !important;\n  	width: calc(564px / 4);\n  	cursor: default;\n  	float: left;\n  	box-sizing: border-box;\n  	margin: 0;\n  	padding: 0;\n}\n\n.colorwayToolbox-listItemSVG {\n  	padding: 19px;\n  	overflow: visible;\n  	border-radius: 50%;\n  	background-color: var(--background-tertiary);\n  	border: 1px solid transparent;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	transition: .15s ease;\n  	cursor: pointer;\n  	color: var(--interactive-normal);\n}\n\n.colorwayToolbox-listItem:hover {\n  	color: var(--interactive-normal) !important;\n}\n\n.colorwayToolbox-listItemSVG:hover {\n  	border-color: var(--brand-500);\n  	background-color: var(--brand-experiment-15a);\n  	color: var(--interactive-hover) !important;\n}\n\n.colorwayToolbox-title {\n  	align-items: center;\n  	display: flex;\n  	text-transform: uppercase;\n  	margin-top: 2px;\n  	padding-bottom: 8px;\n  	margin-bottom: 0;\n}\n\n.colorwayToolbox-list {\n  	box-sizing: border-box;\n  	height: 100%;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 12px;\n  	overflow: hidden;\n}\n\n.colorwayPreview-chatBox {\n  	height: 32px;\n  	border-radius: 6px;\n  	margin: 8px;\n  	margin-bottom: 12px;\n  	margin-top: 0;\n  	flex: 1 1 auto;\n}\n\n.colorwayPreview-filler {\n  	width: 100%;\n  	height: 100%;\n  	flex: 0 1 auto;\n}\n\n.colorwayPreview-topShadow {\n  	box-shadow: 0 1px 0 hsl(var(--primary-900-hsl)/20%), 0 1.5px 0 hsl(var(--primary-860-hsl)/5%), 0 2px 0 hsl(var(--primary-900-hsl)/5%);\n  	width: 100%;\n  	height: 32px;\n  	font-family: var(--font-display);\n  	font-weight: 500;\n  	padding: 12px 16px;\n  	box-sizing: border-box;\n  	align-items: center;\n  	display: flex;\n  	flex: 1 0 auto;\n}\n\n.colorwayPreview-channels>.colorwayPreview-topShadow {\n  	border-top-left-radius: 8px;\n}\n\n.colorwayPreview-channels>.colorwayPreview-topShadow:hover {\n  	background-color: hsl(var(--primary-500-hsl)/30%);\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-topShadow {\n  	height: 48px;\n}\n\n.colorwaysPreview-wrapper:fullscreen .colorwayPreview-chatBox {\n  	height: 44px;\n  	border-radius: 8px;\n  	margin: 16px;\n  	margin-bottom: 24px;\n}\n\n.colorwaysBtn-tooltipContent {\n  	font-weight: 600;\n  	font-size: 16px;\n  	line-height: 20px;\n}\n\n.colorwaySelector-headerIcon {\n  	box-sizing: border-box;\n  	width: 100%;\n  	height: 100%;\n  	transition: transform .1s ease-out, opacity .1s ease-out;\n  	color: var(--interactive-normal);\n}\n\n.colorwaySelector-header {\n  	align-items: center;\n  	justify-content: center;\n  	padding-bottom: 0;\n  	box-shadow: none !important;\n}\n\n.colorwaySelector-search {\n  	width: 100%;\n}\n\n.colorwaySelector-sources {\n  	flex: 0 0 auto;\n  	margin-right: auto;\n  	color: var(--button-outline-primary-text);\n  	border-color: var(--button-outline-primary-border);\n}\n\n.colorwaySelector-sources:hover {\n  	background-color: var(--button-outline-primary-background-hover);\n  	border-color: var(--button-outline-primary-border-hover);\n  	color: var(--button-outline-primary-text-hover);\n}\n\n.colorwaySelector-headerBtn {\n  	position: absolute;\n  	top: 64px;\n  	right: 20px;\n}\n\n.theme-light .colorwaySelector-pill_selected {\n  	border-color: var(--brand-500) !important;\n  	background-color: var(--brand-experiment-160) !important;\n}\n\n.theme-dark .colorwaySelector-pill_selected {\n  	border-color: var(--brand-500) !important;\n  	background-color: var(--brand-experiment-15a) !important;\n}\n\n.colorwaysTooltip-tooltipPreviewRow {\n  	display: flex;\n  	align-items: center;\n  	margin-top: 8px;\n}\n\n.colorwayCreator-colorPreview {\n  	width: 100%;\n  	border-radius: 4px;\n  	height: 50px;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n}\n\n.colorwaysCreator-colorPreviewItm .colorwayCreator-colorPreviews {\n  	padding: 0;\n  	background-color: transparent;\n  	border-radius: 0;\n}\n\n.colorwaysCreator-colorPreviewItm {\n  	flex-direction: column;\n  	align-items: start;\n}\n\n.colorwaysTooltip-header {\n  	background-color: var(--background-primary);\n  	padding: 2px 8px;\n  	border-radius: 16px;\n  	height: min-content;\n  	color: var(--header-primary);\n  	margin-bottom: 2px;\n  	display: inline-flex;\n  	margin-left: -4px;\n}\n\n.colorwaySelector-pillSeparator {\n  	height: 24px;\n  	width: 1px;\n  	background-color: var(--primary-400);\n}\n\n.colorwaysSelector-changelog {\n  	font-weight: 400;\n  	font-size: 20px;\n  	color: var(--header-secondary);\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	padding: 8px 12px;\n}\n\n.colorwaysChangelog-li {\n  	position: relative;\n  	font-size: 16px;\n  	line-height: 20px;\n}\n\n.colorwaysChangelog-li::before {\n  	content: \"\";\n  	position: absolute;\n  	top: 10px;\n  	left: -15px;\n  	width: 6px;\n  	height: 6px;\n  	margin-top: -4px;\n  	margin-left: -3px;\n  	border-radius: 50%;\n  	opacity: .3;\n}\n\n.theme-dark .colorwaysChangelog-li::before {\n  	background-color: hsl(216deg calc(var(--saturation-factor, 1)*9.8%) 90%);\n}\n\n.theme-light .colorwaysChangelog-li::before {\n  	background-color: hsl(223deg calc(var(--saturation-factor, 1)*5.8%) 52.9%);\n}\n\n.ColorwaySelectorWrapper .colorwayToolbox-list {\n  	width: 100%;\n}\n\n.colorwaysToolbox-label {\n  	border-radius: 20px;\n  	box-sizing: border-box;\n  	color: var(--text-normal);\n  	transition: .15s ease;\n  	width: 100%;\n  	margin-left: 0;\n  	height: fit-content;\n  	text-align: center;\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: wrap;\n  	cursor: default;\n  	max-height: 2rem;\n  	padding: 0 8px;\n}\n\n.colorwaysSelector-changelogHeader {\n  	font-weight: 700;\n  	font-size: 16px;\n  	line-height: 20px;\n  	text-transform: uppercase;\n  	position: relative;\n  	display: flex;\n  	align-items: center;\n}\n\n.colorwaysSelector-changelogHeader::after {\n  	content: \"\";\n  	height: 1px;\n  	flex: 1 1 auto;\n  	margin-left: 4px;\n  	opacity: .6;\n  	background-color: currentcolor;\n}\n\n.colorwaysSelector-changelogHeader_added {\n  	color: var(--text-positive);\n}\n\n.colorwaysSelector-changelogHeader_fixed {\n  	color: hsl(359deg calc(var(--saturation-factor, 1)*87.3%) 59.8%);\n}\n\n.colorwaysSelector-changelogHeader_changed {\n  	color: var(--text-warning);\n}\n\n.is-mobile .colorwaySelectorModal,\n.is-mobile .colorwayCreator-modal {\n  	width: 100vw !important;\n  	box-sizing: border-box;\n  	min-width: unset;\n  	border-radius: 0;\n  	height: 100vh;\n  	max-height: unset;\n  	border: none;\n}\n\n.is-mobile .colorwaySelectorModalContent {\n  	box-sizing: border-box;\n  	width: 100vw;\n}\n\n.is-mobile .colorwaySelector-doublePillBar {\n  	flex-direction: column-reverse;\n  	align-items: end;\n}\n\n.is-mobile .colorwaySelector-doublePillBar>.colorwaySelector-pillWrapper:first-child {\n  	width: 100%;\n  	gap: 4px;\n  	overflow-x: auto;\n  	justify-content: space-between;\n}\n\n.is-mobile .colorwaySelector-doublePillBar>.colorwaySelector-pillWrapper:first-child>.colorwaySelector-pill {\n  	border-radius: 0;\n  	border-top: none;\n  	border-left: none;\n  	border-right: none;\n  	background-color: transparent;\n  	width: 100%;\n  	justify-content: center;\n  	flex: 0 0 min-content;\n}\n\n.is-mobile .colorwaySelector-doublePillBar>.colorwaySelector-pillWrapper:first-child>.colorwaySelector-pillSeparator {\n  	display: none;\n}\n\n.is-mobile .layer-fP3xEz:has(.colorwaySelectorModal, .colorwayCreator-modal) {\n  	padding: 0;\n}\n\n.is-mobile .ColorwaySelectorWrapper {\n  	justify-content: space-around;\n  	gap: 10px;\n}\n\n#colorwaySelector-pill_closeSelector {\n  	display: none !important;\n}\n\n.is-mobile #colorwaySelector-pill_closeSelector {\n  	display: flex !important;\n}\n\n.colorwaysBtn-spinner {\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	width: 100%;\n}\n\n.colorwaysBtn-spinnerInner {\n  	transform: rotate(280deg);\n  	position: relative;\n  	display: inline-block;\n  	width: 32px;\n  	height: 32px;\n  	contain: paint;\n}\n\n@keyframes spinner-spinning-circle-rotate {\n  	100% {\n  			transform: rotate(1turn);\n  	}\n}\n\n@keyframes spinner-spinning-circle-dash {\n  	0% {\n  			stroke-dasharray: 1, 200;\n  			stroke-dashoffset: 0;\n  	}\n\n  	50% {\n  			stroke-dasharray: 130, 200;\n  	}\n\n  	100% {\n  			stroke-dasharray: 130, 200;\n  			stroke-dashoffset: -124;\n  	}\n}\n\n.colorwaysBtn-spinnerCircular {\n  	animation: spinner-spinning-circle-rotate 2s linear infinite;\n  	height: 100%;\n  	width: 100%;\n}\n\n.colorwaysBtn-spinnerBeam {\n  	animation: spinner-spinning-circle-dash 2s ease-in-out infinite;\n  	stroke-dasharray: 1, 200;\n  	stroke-dashoffset: 0;\n  	fill: none;\n  	stroke-width: 6;\n  	stroke-miterlimit: 10;\n  	stroke-linecap: round;\n  	stroke: currentcolor;\n}\n\n.colorwaysBtn-spinnerBeam2 {\n  	stroke: currentcolor;\n  	opacity: 0.6;\n  	animation-delay: .15s;\n}\n\n.colorwaysBtn-spinnerBeam3 {\n  	stroke: currentcolor;\n  	opacity: 0.3;\n  	animation-delay: .23s;\n}\n\n.colorwaysSettings-colorwaySource {\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: space-between;\n  	padding: 0 8px;\n  	gap: 5px;\n  	border-radius: 4px;\n  	box-sizing: border-box;\n  	min-height: 44px;\n  	align-items: center;\n}\n\n.theme-dark .colorwaysSettings-colorwaySource {\n  	background: var(--bg-overlay-3,var(--background-secondary));\n}\n\n.theme-light .colorwaysSettings-colorwaySource {\n  	background: var(--bg-overlay-2,var(--background-secondary));\n}\n\n.colorwaysSettings-colorwaySource:hover {\n  	background-color: var(--background-secondary-alt);\n}\n\n.theme-dark .colorwaysSettings-colorwaySource:hover {\n  	background: var(--bg-overlay-1,var(--background-secondary-alt));\n}\n\n.theme-light .colorwaysSettings-colorwaySource:hover {\n  	background: var(--bg-overlay-3,var(--background-secondary-alt));\n}\n\n.colorwaysSettings-modalRoot {\n  	min-width: 520px;\n}\n\n.colorwaysSettings-colorwaySourceLabel {\n  	overflow: hidden;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n}\n\n.colorwaysSettings-iconButton {\n  	background-color: transparent !important;\n  	border-radius: 0;\n}\n\n.colorwaysSettings-iconButtonInner {\n  	display: flex;\n  	gap: 4px;\n  	align-items: center;\n}\n\n.colorwaysSettings-modalContent {\n  	margin: 8px 0;\n}\n\n@keyframes loading-bar {\n  	0% {\n  			left: 0;\n  			right: 100%;\n  			width: 0;\n  	}\n\n  	10% {\n  			left: 0;\n  			right: 75%;\n  			width: 25%;\n  	}\n\n  	90% {\n  			right: 0;\n  			left: 75%;\n  			width: 25%;\n  	}\n\n  	100% {\n  			left: 100%;\n  			right: 0;\n  			width: 0;\n  	}\n}\n\n.colorwaysLoader-barContainer {\n  	width: 100%;\n  	border-radius: var(--radius-round);\n  	border: 0;\n  	position: relative;\n  	padding: 0;\n}\n\n.colorwaysLoader-bar {\n  	position: absolute;\n  	border-radius: var(--radius-round);\n  	top: 0;\n  	right: 100%;\n  	bottom: 0;\n  	left: 0;\n  	background: var(--brand-500);\n  	width: 0;\n  	animation: loading-bar 2s linear infinite;\n  	transition: .2s ease;\n}\n\n.colorwaysSettingsSelector-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n}\n\n.colorwaysSettingsPage-wrapper .colorwayToolbox-listItem {\n  	gap: 8px;\n  	border-radius: 50px;\n  	padding: 12px 16px;\n  	background-color: var(--background-tertiary);\n  	transition: .15s ease;\n  	border: 1px solid transparent;\n  	color: var(--interactive-normal);\n}\n\n.colorwaysSettingsPage-wrapper .colorwayToolbox-listItem:hover {\n  	border-color: var(--brand-500);\n  	background-color: var(--brand-experiment-15a);\n  	color: var(--interactive-hover);\n}\n\n.colorwaysSettingsSelector-wrapper .colorwaySelector-doublePillBar {\n  	justify-content: start;\n}\n\n.colorwaysCreator-toolboxItm:hover {\n  	background-color: var(--brand-experiment) !important;\n}\n\n.colorwayCreator-colorPreview_primary+.colorwayCreator-colorPreview_primary,\n.colorwayCreator-colorPreview_secondary+.colorwayCreator-colorPreview_secondary,\n.colorwayCreator-colorPreview_tertiary+.colorwayCreator-colorPreview_tertiary,\n.colorwayCreator-colorPreview_accent+.colorwayCreator-colorPreview_accent {\n  	display: none;\n}\n\n.colorwaysConflictingColors-warning {\n  	width: 100%;\n  	text-align: center;\n  	justify-content: center;\n}\n\n.ColorwaySelectorBtn_thin {\n  	height: 21px !important;\n  	width: 56px !important;\n}\n\n.ColorwaySelectorBtn_thin:hover {\n  	border-radius: 8px;\n}\n\n.colorwaySelector-searchPopout {\n  	display: none !important;\n}\n\n.colorways-badge {\n  	font-size: .625rem;\n  	text-transform: uppercase;\n  	vertical-align: top;\n  	display: inline-flex;\n  	align-items: center;\n  	text-indent: 0;\n  	background: var(--brand-experiment);\n  	color: var(--white-500);\n  	flex: 0 0 auto;\n  	height: 15px;\n  	padding: 0 4px;\n  	margin-top: 1px;\n  	border-radius: 4px;\n}\n\n.hoverRoll {\n  	display: inline-block;\n  	vertical-align: top;\n  	cursor: default;\n  	text-align: left;\n  	box-sizing: border-box;\n  	position: relative;\n  	width: 100%;\n  	contain: paint;\n}\n\n.hoverRoll_hovered {\n  	white-space: nowrap;\n  	text-overflow: ellipsis;\n  	overflow: hidden;\n  	display: block;\n  	transition: all.22s ease;\n  	transform-style: preserve-3d;\n  	pointer-events: none;\n  	width: 100%;\n  	opacity: 0;\n  	transform: translate3d(0, 107%, 0);\n  	position: absolute;\n  	top: 0;\n  	left: 0;\n  	bottom: 0;\n  	right: 0;\n}\n\n.hoverRoll:hover .hoverRoll_hovered,\n.colorwaysSettings-colorwaySource:hover .hoverRoll_hovered {\n  	transform: translateZ(0);\n  	opacity: 1;\n}\n\n.hoverRoll_normal {\n  	white-space: nowrap;\n  	text-overflow: ellipsis;\n  	overflow: hidden;\n  	display: block;\n  	transition: all .22s ease;\n  	transform-style: preserve-3d;\n  	pointer-events: none;\n  	width: 100%;\n}\n\n.hoverRoll:hover .hoverRoll_normal,\n.colorwaysSettings-colorwaySource:hover .hoverRoll_normal {\n  	transform: translate3d(0,-107%,0);\n  	opacity: 0;\n  	user-select: none;\n}\n\n.dc-warning-card {\n  	padding: 1em;\n  	margin-bottom: 1em;\n  	background-color: var(--info-warning-background);\n  	border-color: var(--info-warning-foreground);\n  	color: var(--info-warning-text);\n}\n\n/* stylelint-disable-next-line no-duplicate-selectors */\n.colorwaysPreview-modal {\n  	width: 90vw !important;\n  	height: 90vh !important;\n  	max-height: unset !important;\n}\n\n.colorwaysPresetPicker-content {\n  	padding: 16px;\n}\n\n.colorwaysPresetPicker {\n  	width: 600px;\n}\n\n.colorwaysCreator-setting {\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: space-between;\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	box-sizing: border-box;\n  	color: var(--header-secondary);\n  	padding: 10px 18px;\n  	padding-right: 10px;\n  	cursor: pointer;\n  	align-items: center;\n}\n\n.colorwaysCreator-setting:hover {\n  	background-color: var(--background-modifier-hover);\n}\n\n:root {\n  	--dc-picker-svg: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='vc-pallete-icon vc-icon' role='img' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M 12 7.5 C 13.242188 7.5 14.25 6.492188 14.25 5.25 C 14.25 4.007812 13.242188 3 12 3 C 10.757812 3 9.75 4.007812 9.75 5.25 C 9.75 6.492188 10.757812 7.5 12 7.5 Z M 18 12 C 19.242188 12 20.25 10.992188 20.25 9.75 C 20.25 8.507812 19.242188 7.5 18 7.5 C 16.757812 7.5 15.75 8.507812 15.75 9.75 C 15.75 10.992188 16.757812 12 18 12 Z M 8.25 10.5 C 8.25 11.742188 7.242188 12.75 6 12.75 C 4.757812 12.75 3.75 11.742188 3.75 10.5 C 3.75 9.257812 4.757812 8.25 6 8.25 C 7.242188 8.25 8.25 9.257812 8.25 10.5 Z M 9 19.5 C 10.242188 19.5 11.25 18.492188 11.25 17.25 C 11.25 16.007812 10.242188 15 9 15 C 7.757812 15 6.75 16.007812 6.75 17.25 C 6.75 18.492188 7.757812 19.5 9 19.5 Z M 9 19.5 M 24 12 C 24 16.726562 21.199219 15.878906 18.648438 15.105469 C 17.128906 14.644531 15.699219 14.210938 15 15 C 14.09375 16.023438 14.289062 17.726562 14.472656 19.378906 C 14.738281 21.742188 14.992188 24 12 24 C 5.371094 24 0 18.628906 0 12 C 0 5.371094 5.371094 0 12 0 C 18.628906 0 24 5.371094 24 12 Z M 12 22.5 C 12.917969 22.5 12.980469 22.242188 12.984375 22.234375 C 13.097656 22.015625 13.167969 21.539062 13.085938 20.558594 C 13.066406 20.304688 13.03125 20.003906 12.996094 19.671875 C 12.917969 18.976562 12.828125 18.164062 12.820312 17.476562 C 12.804688 16.417969 12.945312 15.0625 13.875 14.007812 C 14.429688 13.382812 15.140625 13.140625 15.78125 13.078125 C 16.390625 13.023438 17 13.117188 17.523438 13.234375 C 18.039062 13.351562 18.574219 13.515625 19.058594 13.660156 L 19.101562 13.675781 C 19.621094 13.832031 20.089844 13.972656 20.53125 14.074219 C 21.511719 14.296875 21.886719 14.199219 22.019531 14.109375 C 22.074219 14.070312 22.5 13.742188 22.5 12 C 22.5 6.199219 17.800781 1.5 12 1.5 C 6.199219 1.5 1.5 6.199219 1.5 12 C 1.5 17.800781 6.199219 22.5 12 22.5 Z M 12 22.5'%3E%3C/path%3E%3C/svg%3E\");\n  	--dc-settings-svg : url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 24 24' width='24' height='24' preserveAspectRatio='xMidYMid meet' style='width: 100%25; height: 100%25; transform: translate3d(0px, 0px, 0px); content-visibility: visible;'%3E%3Cdefs%3E%3CclipPath id='__lottie_element_97'%3E%3Crect width='24' height='24' x='0' y='0'%3E%3C/rect%3E%3C/clipPath%3E%3CclipPath id='__lottie_element_99'%3E%3Cpath d='M0,0 L600,0 L600,600 L0,600z'%3E%3C/path%3E%3C/clipPath%3E%3C/defs%3E%3Cg clip-path='url(%23__lottie_element_97)'%3E%3Cg clip-path='url(%23__lottie_element_99)' transform='matrix(0.03999999910593033,0,0,0.03999999910593033,0,0)' opacity='1' style='display: block;'%3E%3Cg transform='matrix(25,0,0,25,300,300)' opacity='1' style='display: block;'%3E%3Cg opacity='1' transform='matrix(1,0,0,1,0,0)'%3E%3Cpath fill='rgb(88,101,242)' fill-opacity='1' d=' M-1.4420000314712524,-10.906000137329102 C-1.8949999809265137,-10.847000122070312 -2.1470000743865967,-10.375 -2.078000068664551,-9.92300033569336 C-1.899999976158142,-8.756999969482422 -2.265000104904175,-7.7210001945495605 -3.061000108718872,-7.390999794006348 C-3.8570001125335693,-7.060999870300293 -4.8480000495910645,-7.534999847412109 -5.546000003814697,-8.484999656677246 C-5.816999912261963,-8.852999687194824 -6.329999923706055,-9.008999824523926 -6.691999912261963,-8.730999946594238 C-7.458000183105469,-8.142999649047852 -8.142999649047852,-7.458000183105469 -8.730999946594238,-6.691999912261963 C-9.008999824523926,-6.329999923706055 -8.852999687194824,-5.816999912261963 -8.484999656677246,-5.546000003814697 C-7.534999847412109,-4.8480000495910645 -7.060999870300293,-3.8570001125335693 -7.390999794006348,-3.061000108718872 C-7.7210001945495605,-2.265000104904175 -8.756999969482422,-1.899999976158142 -9.92300033569336,-2.078000068664551 C-10.375,-2.1470000743865967 -10.847000122070312,-1.8949999809265137 -10.906000137329102,-1.4420000314712524 C-10.968000411987305,-0.9700000286102295 -11,-0.48899999260902405 -11,0 C-11,0.48899999260902405 -10.968000411987305,0.9700000286102295 -10.906000137329102,1.4420000314712524 C-10.847000122070312,1.8949999809265137 -10.375,2.1470000743865967 -9.92300033569336,2.078000068664551 C-8.756999969482422,1.899999976158142 -7.7210001945495605,2.265000104904175 -7.390999794006348,3.061000108718872 C-7.060999870300293,3.8570001125335693 -7.534999847412109,4.8470001220703125 -8.484999656677246,5.546000003814697 C-8.852999687194824,5.816999912261963 -9.008999824523926,6.328999996185303 -8.730999946594238,6.691999912261963 C-8.142999649047852,7.458000183105469 -7.458000183105469,8.142999649047852 -6.691999912261963,8.730999946594238 C-6.329999923706055,9.008999824523926 -5.816999912261963,8.852999687194824 -5.546000003814697,8.484999656677246 C-4.8480000495910645,7.534999847412109 -3.8570001125335693,7.060999870300293 -3.061000108718872,7.390999794006348 C-2.265000104904175,7.7210001945495605 -1.899999976158142,8.756999969482422 -2.078000068664551,9.92300033569336 C-2.1470000743865967,10.375 -1.8949999809265137,10.847000122070312 -1.4420000314712524,10.906000137329102 C-0.9700000286102295,10.968000411987305 -0.48899999260902405,11 0,11 C0.48899999260902405,11 0.9700000286102295,10.968000411987305 1.4420000314712524,10.906000137329102 C1.8949999809265137,10.847000122070312 2.1470000743865967,10.375 2.078000068664551,9.92300033569336 C1.899999976158142,8.756999969482422 2.2660000324249268,7.7210001945495605 3.062000036239624,7.390999794006348 C3.8580000400543213,7.060999870300293 4.8480000495910645,7.534999847412109 5.546000003814697,8.484999656677246 C5.816999912261963,8.852999687194824 6.328999996185303,9.008999824523926 6.691999912261963,8.730999946594238 C7.458000183105469,8.142999649047852 8.142999649047852,7.458000183105469 8.730999946594238,6.691999912261963 C9.008999824523926,6.328999996185303 8.852999687194824,5.816999912261963 8.484999656677246,5.546000003814697 C7.534999847412109,4.8480000495910645 7.060999870300293,3.8570001125335693 7.390999794006348,3.061000108718872 C7.7210001945495605,2.265000104904175 8.756999969482422,1.899999976158142 9.92300033569336,2.078000068664551 C10.375,2.1470000743865967 10.847000122070312,1.8949999809265137 10.906000137329102,1.4420000314712524 C10.968000411987305,0.9700000286102295 11,0.48899999260902405 11,0 C11,-0.48899999260902405 10.968000411987305,-0.9700000286102295 10.906000137329102,-1.4420000314712524 C10.847000122070312,-1.8949999809265137 10.375,-2.1470000743865967 9.92300033569336,-2.078000068664551 C8.756999969482422,-1.899999976158142 7.7210001945495605,-2.265000104904175 7.390999794006348,-3.061000108718872 C7.060999870300293,-3.8570001125335693 7.534999847412109,-4.8480000495910645 8.484999656677246,-5.546000003814697 C8.852999687194824,-5.816999912261963 9.008999824523926,-6.329999923706055 8.730999946594238,-6.691999912261963 C8.142999649047852,-7.458000183105469 7.458000183105469,-8.142999649047852 6.691999912261963,-8.730999946594238 C6.328999996185303,-9.008999824523926 5.817999839782715,-8.852999687194824 5.546999931335449,-8.484999656677246 C4.848999977111816,-7.534999847412109 3.8580000400543213,-7.060999870300293 3.062000036239624,-7.390999794006348 C2.2660000324249268,-7.7210001945495605 1.9010000228881836,-8.756999969482422 2.0789999961853027,-9.92300033569336 C2.1480000019073486,-10.375 1.8949999809265137,-10.847000122070312 1.4420000314712524,-10.906000137329102 C0.9700000286102295,-10.968000411987305 0.48899999260902405,-11 0,-11 C-0.48899999260902405,-11 -0.9700000286102295,-10.968000411987305 -1.4420000314712524,-10.906000137329102z M4,0 C4,2.2090001106262207 2.2090001106262207,4 0,4 C-2.2090001106262207,4 -4,2.2090001106262207 -4,0 C-4,-2.2090001106262207 -2.2090001106262207,-4 0,-4 C2.2090001106262207,-4 4,-2.2090001106262207 4,0z'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E\");\n  	--dc-ondemand-svg: url(\"https://icons.getbootstrap.com/assets/icons/check-circle.svg\");\n}\n\n.dc-colorway-selector::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--dc-picker-svg) center/contain no-repeat !important;\n  	mask: var(--dc-picker-svg) center/contain no-repeat !important\n}\n\n.dc-colorway-settings::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--dc-settings-svg) center/contain no-repeat !important;\n  	mask: var(--dc-settings-svg) center/contain no-repeat !important\n}\n\n.dc-colorway-ondemand::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--dc-ondemand-svg) center/contain no-repeat !important;\n  	mask: var(--dc-ondemand-svg) center/contain no-repeat !important\n}\n\n.dc-colorway-management::before {\n  	/* stylelint-disable-next-line property-no-vendor-prefix */\n  	-webkit-mask: var(--dc-settings-svg) center/contain no-repeat !important;\n  	mask: var(--dc-settings-svg) center/contain no-repeat !important\n}\n\n.colorwaySourceModal {\n  	min-height: unset;\n}\n\n.colorwaySelectorModal-header {\n  	box-shadow: none !important;\n  	padding-bottom: 8px;\n}\n\n.colorwaySelector-sourceSelect {\n  	width: fit-content !important;\n}\n";

function SettingsPage() {
	const [colorways, setColorways] = React.useState([]);
	const [colorwaySourceFiles, setColorwaySourceFiles] = React.useState(betterdiscord.Data.load("settings").colorwayLists);
	const [colorsButtonVisibility, setColorsButtonVisibility] = React.useState(betterdiscord.Data.load("settings").showInGuildBar);
	const [isButtonThin, setIsButtonThin] = React.useState(betterdiscord.Data.load("settings").isButtonThin);
	async function loadUI() {
		const responses = await Promise.all(
			betterdiscord.Data.load("settings").colorwayLists.map(
				(url) => fetch(url)
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
	}
	const cached_loadUI = React.useCallback(loadUI, []);
	React.useEffect(() => {
		cached_loadUI();
	}, []);
	return BdApi.React.createElement(SettingsTab, { title: "Settings" }, BdApi.React.createElement("div", { className: "colorwaysSettingsPage-wrapper" }, BdApi.React.createElement(Flex, { style: { gap: "0", marginBottom: "8px" } }, BdApi.React.createElement(Forms.FormTitle, { tag: "h5", style: { width: "100%", marginBottom: "0", lineHeight: "32px" } }, "Sources"), BdApi.React.createElement(
		Button,
		{
			className: "colorwaysSettings-colorwaySourceAction",
			innerClassName: "colorwaysSettings-iconButtonInner",
			style: { flexShrink: "0" },
			size: Button.Sizes.SMALL,
			color: Button.Colors.TRANSPARENT,
			onClick: () => {
				Modals.openModal((props) => {
					var colorwaySource = "";
					return BdApi.React.createElement(Modals.ModalRoot, { ...props, className: "colorwaySourceModal" }, BdApi.React.createElement(Modals.ModalHeader, null, BdApi.React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Add a source:")), BdApi.React.createElement(
						TextInput,
						{
							placeholder: "Enter a valid URL...",
							onChange: (e) => colorwaySource = e,
							style: { margin: "8px", width: "calc(100% - 16px)" }
						}
					), BdApi.React.createElement(Modals.ModalFooter, null, BdApi.React.createElement(
						Button,
						{
							style: { marginLeft: 8 },
							color: Button.Colors.BRAND,
							size: Button.Sizes.MEDIUM,
							look: Button.Looks.FILLED,
							onClick: () => {
								var sourcesArr = [];
								betterdiscord.Data.load("settings").colorwayLists.map((source) => sourcesArr.push(source));
								if (colorwaySource !== defaultColorwaySource) {
									sourcesArr.push(colorwaySource);
								}
								betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), colorwayLists: sourcesArr });
								setColorwaySourceFiles(sourcesArr);
								props.onClose();
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
							onClick: () => props.onClose()
						},
						"Cancel"
					)));
				});
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
		"Add a source..."
	)), BdApi.React.createElement(Flex, { flexDirection: "column" }, colorwaySourceFiles?.map(
		(colorwaySourceFile) => BdApi.React.createElement("div", { className: "colorwaysSettings-colorwaySource" }, knownColorwaySources.find((o) => o.url === colorwaySourceFile) ? BdApi.React.createElement("div", { className: "hoverRoll" }, BdApi.React.createElement(Text, { className: "colorwaysSettings-colorwaySourceLabel hoverRoll_normal" }, knownColorwaySources.find((o) => o.url === colorwaySourceFile).name, " ", colorwaySourceFile === defaultColorwaySource && BdApi.React.createElement("div", { className: "colorways-badge" }, "DEFAULT")), BdApi.React.createElement(Text, { className: "colorwaysSettings-colorwaySourceLabel hoverRoll_hovered" }, colorwaySourceFile)) : BdApi.React.createElement(Text, { className: "colorwaysSettings-colorwaySourceLabel" }, colorwaySourceFile), colorwaySourceFile !== defaultColorwaySource && BdApi.React.createElement(
			Button,
			{
				innerClassName: "colorwaysSettings-iconButtonInner",
				size: Button.Sizes.ICON,
				color: Button.Colors.PRIMARY,
				look: Button.Looks.OUTLINED,
				onClick: async () => {
					var sourcesArr = [];
					betterdiscord.Data.load("settings").colorwayLists.map((source) => {
						if (source !== colorwaySourceFile) {
							sourcesArr.push(source);
						}
					});
					betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), colorwayLists: sourcesArr });
					setColorwaySourceFiles(sourcesArr);
				}
			},
			BdApi.React.createElement(CloseIcon, { width: 20, height: 20 })
		), BdApi.React.createElement(
			Button,
			{
				innerClassName: "colorwaysSettings-iconButtonInner",
				size: Button.Sizes.ICON,
				color: Button.Colors.PRIMARY,
				look: Button.Looks.OUTLINED,
				onClick: () => {
					Clipboard.copy(colorwaySourceFile);
				}
			},
			BdApi.React.createElement(CopyIcon, { width: 20, height: 20 })
		))
	)), BdApi.React.createElement(Forms.FormDivider, { style: { margin: "20px 0" } }), BdApi.React.createElement(Forms.FormTitle, { tag: "h5" }, "Quick Switch"), BdApi.React.createElement(
		Switch,
		{
			value: colorsButtonVisibility,
			onChange: (v) => {
				setColorsButtonVisibility(v);
				betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), showInGuildBar: v });
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
				betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), isButtonThin: v });
				FluxDispatcher.dispatch({
					type: "COLORWAYS_UPDATE_BUTTON_HEIGHT",
					isTall: v
				});
			},
			note: "Replaces the icon on the colorways launcher button with text, making it more compact."
		},
		"Use thin Quick Switch button"
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
		plugin.creatorVersion,
		" ",
		"(Stable)"
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
		[...colorways, ...betterdiscord.Data.load("custom_colorways")].length
	), BdApi.React.createElement(Forms.FormTitle, { style: { marginBottom: 0 } }, "Project Repositories:"), BdApi.React.createElement(Forms.FormText, { style: { marginBottom: "8px" } }, BdApi.React.createElement(Link, { href: "https://github.com/DaBluLite/DiscordColorways" }, "DiscordColorways"), BdApi.React.createElement("br", null), BdApi.React.createElement(Link, { href: "https://github.com/DaBluLite/ProjectColorway" }, "Project Colorway")))));
}

function OnDemandPage() {
	const [onDemand, setOnDemand] = React.useState(false);
	const [onDemandTinted, setOnDemandTinted] = React.useState(false);
	const [onDemandDiscordSat, setOnDemandDiscordSat] = React.useState(false);
	async function loadUI() {
		setOnDemand(betterdiscord.Data.load("settings").onDemandWays);
		setOnDemandTinted(betterdiscord.Data.load("settings").onDemandWaysTintedText);
		setOnDemandDiscordSat(betterdiscord.Data.load("settings").onDemandWaysDiscordSaturation);
	}
	const cached_loadUI = React.useCallback(loadUI, []);
	React.useEffect(() => {
		cached_loadUI();
	}, []);
	return BdApi.React.createElement(SettingsTab, { title: "On-Demand" }, BdApi.React.createElement(
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
			hideBorder: true,
			value: onDemandDiscordSat,
			onChange: (v) => {
				setOnDemandDiscordSat(v);
				betterdiscord.Data.save("settings", { ...betterdiscord.Data.load("settings"), onDemandWaysDiscordSaturation: v });
			},
			disabled: !onDemand
		},
		"Use Discord's saturation"
	));
}

function ManageColorwaysPage() {
	return BdApi.React.createElement(SettingsTab, { title: "Manage Colorways" }, BdApi.React.createElement(Forms.FormSection, { title: "Import/Export" }, BdApi.React.createElement(Card, { className: "dc-warning-card" }, BdApi.React.createElement(Flex, { flexDirection: "column" }, BdApi.React.createElement("strong", null, "Warning"), BdApi.React.createElement("span", null, "Importing a colorways file will overwrite your current custom colorways."))), BdApi.React.createElement(Text, { variant: "text-md/normal", style: { marginBottom: "8px" } }, "You can import and export your custom colorways as a JSON file. This allows you to easily transfer them to another device/installation."), BdApi.React.createElement(Flex, null, BdApi.React.createElement(
		Button,
		{
			size: Button.Sizes.SMALL,
			onClick: async () => {
				const data = await DiscordNative.fileManager.openFiles({
					filters: [
						{ name: "Discord Colorways List", extensions: ["json"] },
						{ name: "all", extensions: ["*"] }
					]
				});
				const file = data.file;
				if (file) {
					try {
						betterdiscord.Data.save("custom_colorways", JSON.parse(new TextDecoder().decode(file.data)));
					} catch (err) {
						throw new Error(`(DiscordColorways) ${err}`);
					}
				}
			}
		},
		"Import Colorways"
	), BdApi.React.createElement(
		Button,
		{
			size: Button.Sizes.SMALL,
			onClick: () => DiscordNative.fileManager.saveWithDialog(JSON.stringify(betterdiscord.Data.load("custom_colorways")), "colorways.json")
		},
		"Export Colorways"
	))), BdApi.React.createElement(Forms.FormDivider, { style: { marginTop: "8px", marginBottom: "8px" } }), BdApi.React.createElement(Forms.FormSection, { title: "Transfer 3rd Party Colorways to local index (3rd-Party > Custom):" }, BdApi.React.createElement(Flex, null, BdApi.React.createElement(
		Button,
		{
			size: Button.Sizes.SMALL,
			onClick: async () => {
				const responses = await Promise.all(
					betterdiscord.Data.load("settings").colorwayLists.map(
						(url) => fetch(url)
					)
				);
				const data = await Promise.all(
					responses.map(
						(res) => res.json().then((dt) => {
							return { colorways: dt.colorways, url: res.url };
						}).catch(() => {
							return { colorways: [], url: res.url };
						})
					)
				);
				const thirdPartyColorwaysArr = data.flatMap((json) => json.url !== defaultColorwaySource ? json.colorways : []);
				betterdiscord.Data.save("custom_colorways", [...betterdiscord.Data.load("custom_colorways"), ...thirdPartyColorwaysArr.map(({ name: nameOld, ...rest }) => ({ name: nameOld + " (Custom)", ...rest }))]);
			}
		},
		"As-Is"
	), BdApi.React.createElement(
		Button,
		{
			size: Button.Sizes.SMALL,
			onClick: async () => {
				const responses = await Promise.all(
					betterdiscord.Data.load("settings").colorwayLists.map(
						(url) => fetch(url)
					)
				);
				const data = await Promise.all(
					responses.map(
						(res) => res.json().then((dt) => {
							return { colorways: dt.colorways, url: res.url };
						}).catch(() => {
							return { colorways: [], url: res.url };
						})
					)
				);
				const thirdPartyColorwaysArr = data.flatMap((json) => json.url !== defaultColorwaySource ? json.colorways : []);
				betterdiscord.Data.save("custom_colorways", [...betterdiscord.Data.load("custom_colorways"), ...thirdPartyColorwaysArr.map(({ name: nameOld, "dc-import": oldImport, ...rest }) => ({ name: nameOld + " (Custom)", "dc-import": generateCss(colorToHex(rest.primary) || "313338", colorToHex(rest.secondary) || "2b2d31", colorToHex(rest.tertiary) || "1e1f22", colorToHex(rest.accent) || "5865f2", true, true), ...rest }))]);
			}
		},
		"With Updated CSS"
	))));
}

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
		activeColorway: null,
		activeColorwayID: null,
		showInGuildBar: false,
		colorwayLists: ["https://raw.githubusercontent.com/DaBluLite/ProjectColorway/master/index.json"],
		onDemandWays: false,
		onDemandWaysTintedText: false,
		onDemandWaysDiscordSaturation: false,
		isButtonThin: false
	},
	betterdiscord.Data.load("settings")
));
betterdiscord.Data.save("custom_colorways", Object.assign([], betterdiscord.Data.load("custom_colorways")));
const SettingsSection = [
	{
		section: "HEADER",
		label: "Discord Colorways",
		className: "vc-settings-header"
	},
	{
		section: "ColorwaysSelector",
		label: "Colorways",
		element: () => BdApi.React.createElement(Selector, { modalProps: { onClose: () => new Promise(() => {
		}), transitionState: 1 }, isSettings: true }),
		className: "dc-colorway-selector"
	},
	{
		section: "ColorwaysSettings",
		label: "Settings",
		element: SettingsPage,
		className: "dc-colorway-settings"
	},
	{
		section: "ColorwaysOnDemand",
		label: "On-Demand",
		element: OnDemandPage,
		className: "dc-colorway-ondemand"
	},
	{
		section: "ColorwaysManagement",
		label: "Manage...",
		element: ManageColorwaysPage,
		className: "dc-colorway-management"
	},
	{
		section: "DIVIDER"
	}
].filter(Boolean);
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
		ColorwayCSS.set(betterdiscord.Data.load("settings").activeColorway);
		Webpack.waitForModule(Filters.byStrings("Messages.ACTIVITY_SETTINGS"), { defaultExport: false }).then((SettingsComponent) => {
			betterdiscord.Patcher.after(
				SettingsComponent,
				"default",
				(cancel, result, returnValue) => {
					let location = returnValue.findIndex((s) => s.section.toLowerCase() == "appearance") - 1;
					returnValue.splice(0, returnValue.length, ...[...[...returnValue].splice(0, location), ...SettingsSection, ...[...returnValue].splice(location, returnValue.length - 1)]);
				}
			);
		});
	}
	getToolboxActions() {
		return {
			"Change Colorway": () => Modals.openModal((props) => BdApi.React.createElement(Selector, { modalProps: props })),
			"Open Colorway Creator": () => Modals.openModal((props) => BdApi.React.createElement(CreatorModal, { modalProps: props })),
			"Open Color Stealer": () => Modals.openModal((props) => BdApi.React.createElement(ColorPicker, { modalProps: props })),
			"Open Settings": () => SettingsRouter.open("ColorwaysSettings"),
			"Open On-Demand Settings": () => SettingsRouter.open("ColorwaysOnDemand"),
			"Manage Colorways...": () => SettingsRouter.open("ColorwaysManagement")
		};
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