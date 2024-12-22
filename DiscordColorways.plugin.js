/**
 * @name DiscordColorways
 * @author DaBluLite
 * @description A plugin that offers easy access to simple color schemes/themes for Discord, also known as Colorways
 * @version 8.0.1
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

function useContextualState(context, save = true) {
	const [get, set] = useState(contexts[context]);
	useEffect(() => {
		Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", ({ c, value }) => {
			if (context === c) {
				set(value);
			}
		});
		return () => {
			Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", ({ c, value }) => {
				if (context === c) {
					set(value);
				}
			});
		};
	}, []);
	const setCustom = (value) => {
		let newValue;
		function getVal(val) {
			if (typeof value === "function") {
				setContext(context, value(val), save);
				return value(val);
			} else {
				setContext(context, value, save);
				return value;
			}
		}
		set((v) => {
			newValue = getVal(v);
			return newValue;
		});
		return newValue;
	};
	return [get, setCustom];
}
function useContexts() {
	const [get, set] = useReducer(function(state, action) {
		return {
			...state,
			[action.c]: action.value
		};
	}, contexts);
	useEffect(() => {
		Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", ({ c, value }) => {
			set({ c, value });
		});
		return () => {
			Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", ({ c, value }) => {
				set({ c, value });
			});
		};
	}, []);
	return get;
}
function simpleContext(context, options = { save: true, listen: true }) {
	let val = contexts[context];
	let events = {};
	const set = (value) => {
		val = setContext(context, value, options.save);
	};
	function callEvts({ c, value }) {
		if (context === c) {
			val = value;
			if (events[c]) {
				events[c].forEach((callback) => callback(c, value));
			}
		}
	}
	Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", (params) => callEvts(params));
	return [
		() => val,
		set,
		() => {
			Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", (params) => callEvts(params));
			events = {};
		},
		(context2, callback) => {
			if (!events[context2]) {
				events[context2] = [];
			}
			events[context2].push(callback);
		}
	];
}
function simpleContexts() {
	const val = contexts;
	Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", ({ c, value }) => {
		val[c] = value;
		if (events[c]) {
			events[c].forEach((callback) => callback(c, value));
		}
	});
	let events = {};
	return [
		() => val,
		() => {
			Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", ({ c, value }) => {
				val[c] = value;
				if (events[c]) {
					events[c].forEach((callback) => callback(c, value));
				}
			});
			events = {};
		},
		(context, callback) => {
			if (!events[context]) {
				events[context] = [];
			}
			events[context].push(callback);
		}
	];
}
function simpleContextsObject() {
	const val = contexts;
	Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", ({ c, value }) => {
		val[c] = value;
		if (events[c]) {
			events[c].forEach((callback) => callback(c, value));
		}
	});
	let events = {};
	return {
		contexts: () => val,
		destroyContexts: () => {
			Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", ({ c, value }) => {
				val[c] = value;
				if (events[c]) {
					events[c].forEach((callback) => callback(c, value));
				}
			});
			events = {};
		},
		addContextListener: (context, callback) => {
			if (!events[context]) {
				events[context] = [];
			}
			events[context].push(callback);
		}
	};
}
function useTheme() {
	const [theme] = useContextualState("colorwaysPluginTheme", false);
	return theme;
}
function useTimedState(initialState, resetEvery) {
	const init = initialState;
	const [get, set] = useState(initialState);
	let timer;
	const setCustom = (value) => {
		let newValue = void 0;
		function getVal(val) {
			if (typeof value === "function") {
				return value(val);
			} else {
				return value;
			}
		}
		set((v) => {
			newValue = getVal(v);
			clearTimeout(timer);
			timer = setTimeout(() => {
				set(init);
			}, resetEvery);
			return newValue;
		});
		return newValue;
	};
	return [get, setCustom];
}

const $Hooks = /*#__PURE__*/Object.freeze({
		__proto__: null,
		useContextualState,
		useContexts,
		simpleContext,
		simpleContexts,
		simpleContextsObject,
		useTheme,
		useTimedState
});

function openModal$1(render, options, contextKey) {
	return ModalAPI.openModal(render, options, contextKey);
}

const changelog = {
	description: "DiscordColorways is rapidly growing into a very complex app that has a lot of things to take care of. This update will keep things running smoothly.",
	changes: [
		{
			title: "Added",
			type: "added",
			items: [
				"Online sources now report the number of their colorways and presets"
			]
		},
		{
			title: "Bug Fixes",
			type: "fixed",
			items: [
				"Fixed various bugs with the new Dispatcher API",
				'Fixed "Save Preset As..." modal'
			]
		},
		{
			title: "Changes",
			type: "improved",
			items: [
				"Moved location of project links below logo",
				"Removed total colorway counter from settings"
			]
		}
	]
};

const copy = (text) => navigator.clipboard.writeText(text);

const index$2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		copy
});

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
const canonicalizeHex = (hex) => {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = hex;
	hex = ctx.fillStyle;
	canvas.remove();
	return hex;
};
function getHSLIndex(a) {
	if (a === "h") return 0;
	if (a === "s") return 1;
	if (a === "l") return 2;
	return 0;
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

const index$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		HexToHSL,
		canonicalizeHex,
		getHSLIndex,
		stringToHex,
		hexToString,
		getHex,
		getFontOnBg,
		hslToHex,
		rgbToHex,
		colorToHex,
		parseClr
});

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
		document.body.removeChild(input);
	});
}
function saveFile(file) {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(file);
	a.download = file.name;
	document.body.appendChild(a);
	a.click();
	URL.revokeObjectURL(a.href);
	document.body.removeChild(a);
}

const index = /*#__PURE__*/Object.freeze({
		__proto__: null,
		chooseFile,
		saveFile
});

function compareColorwayObjects(obj1, obj2) {
	return obj1.id === obj2.id && obj1.source === obj2.source && obj1.sourceType === obj2.sourceType && obj1.colors.accent === obj2.colors.accent && obj1.colors.primary === obj2.colors.primary && obj1.colors.secondary === obj2.colors.secondary && obj1.colors.tertiary === obj2.colors.tertiary;
}
const kebabCase = (string) => string.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s_]+/g, "_").replace(/\./g, "_").toLowerCase();
function classes(...classes2) {
	return classes2.filter(Boolean).join(" ");
}
function getWsClientIdentity() {
	if (window.Vencord) return "vencord";
	if (window.BdApi) return "betterdiscord";
	return "discord";
}

const $Utils = /*#__PURE__*/Object.freeze({
		__proto__: null,
		compareColorwayObjects,
		kebabCase,
		classes,
		getWsClientIdentity,
		Clipboard: index$2,
		Colors: index$1,
		Fs: index
});

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
function WirelessErrorIcon({ height = 24, width = 24, className, ...svgProps }) {
	return BdApi.React.createElement(
		Icon,
		{
			width,
			height,
			viewBox: "0 0 24 24",
			...svgProps
		},
		BdApi.React.createElement("path", { fill: "currentColor", d: "M2 3a1 1 0 0 1 1-1c6.92 0 12.97 3.7 16.3 9.22.22.37-.15.86-.6.9-.2.02-.4.06-.6.12a.58.58 0 0 1-.67-.22C14.43 7.2 9.1 4 3 4a1 1 0 0 1-1-1ZM15.48 15.15a.5.5 0 0 0 .02-.47A14 14 0 0 0 3 7a1 1 0 0 0 0 2 12 12 0 0 1 10.95 7.09c.18.39.74.44.96.07l.57-1.01ZM2 13a1 1 0 0 1 1-1 9 9 0 0 1 9 9 1 1 0 1 1-2 0 7 7 0 0 0-7-7 1 1 0 0 1-1-1ZM2 17.83c0-.46.37-.83.83-.83C5.13 17 7 18.87 7 21.17c0 .46-.37.83-.83.83H3a1 1 0 0 1-1-1v-3.17Z" }),
		BdApi.React.createElement("path", { fill: "currentColor", "fill-rule": "evenodd", d: "M18.09 14.63c.4-.7 1.43-.7 1.82 0l3.96 6.9c.38.66-.12 1.47-.91 1.47h-7.92c-.79 0-1.3-.81-.91-1.48l3.96-6.9Zm.46 1.87h.9c.3 0 .52.26.5.55l-.22 2.02c-.01.16-.17.26-.33.23a1.93 1.93 0 0 0-.8 0c-.16.03-.32-.07-.33-.23l-.21-2.02a.5.5 0 0 1 .5-.55ZM19 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z", "clip-rule": "evenodd" })
	);
}
function SelectorsIcon({ height = 24, width = 24, className, ...svgProps }) {
	return BdApi.React.createElement(
		Icon,
		{
			width,
			height,
			viewBox: "0 0 24 24",
			...svgProps
		},
		BdApi.React.createElement("path", { fill: "currentColor", d: "M18.45 1.85a3 3 0 0 0-4.1 1.1l-1.5 2.6a3 3 0 0 0 1.1 4.1l2.6 1.5a3 3 0 0 0 4.1-1.1l1.5-2.6a3 3 0 0 0-1.1-4.1l-2.6-1.5ZM5 2a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5ZM5 13a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3H5ZM13 16a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3v-3Z" })
	);
}
function WidgetsPlusIcon({ height = 24, width = 24, className, ...svgProps }) {
	return BdApi.React.createElement(
		Icon,
		{
			width,
			height,
			viewBox: "0 0 24 24",
			...svgProps
		},
		BdApi.React.createElement("path", { fill: "currentColor", d: "M18.45 1.85a3 3 0 0 0-4.1 1.1l-1.5 2.6a3 3 0 0 0 1.1 4.1l2.6 1.5a3 3 0 0 0 4.1-1.1l1.5-2.6a3 3 0 0 0-1.1-4.1l-2.6-1.5ZM2 5a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5ZM2 16a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-3ZM19 14a1 1 0 0 1 1 1v3h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-2 0v-3h-3a1 1 0 1 1 0-2h3v-3a1 1 0 0 1 1-1Z" })
	);
}
function DiscordIcon({ height = 24, width = 24, className, ...svgProps }) {
	return BdApi.React.createElement(
		Icon,
		{
			width,
			height,
			viewBox: "0 0 16 16",
			...svgProps
		},
		BdApi.React.createElement("path", { fill: "currentColor", d: "M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" })
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

const defaultColorwaySource = "https://raw.githubusercontent.com/ProjectColorway/ProjectColorway/master/index.json";
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
const themes = [
	{
		name: "Discord (Default)",
		id: "discord",
		preview: "#313338"
	},
	{
		name: "Colorish",
		id: "colorish",
		preview: "#000000"
	},
	{
		name: "Discord (Visual Refresh)",
		id: "discord-vr",
		preview: "#26262a",
		classes: ["visual-refresh"]
	}
];
const colorwayVarRegex = /@colorwayVar [a-z-]* (colorway\((accent|primary|secondary|tertiary)(|-(h|s|l))\)|\{\{(accent|primary|secondary|tertiary)(|-(h|s|l))\}\}|.)+/g;
const functs = [
	{ name: "Equal To", value: "equal" },
	{ name: "Greater Than", value: "greaterThan" },
	{ name: "Lesser Than", value: "lowerThan" }
];
const colorVals = [
	{ name: "Accent Hue", value: "accent-h" },
	{ name: "Accent Saturation", value: "accent-s" },
	{ name: "Accent Lightness", value: "accent-l" },
	{ name: "Primary Hue", value: "primary-h" },
	{ name: "Primary Saturation", value: "primary-s" },
	{ name: "Primary Lightness", value: "primary-l" },
	{ name: "Secondary Hue", value: "secondary-h" },
	{ name: "Secondary Saturation", value: "secondary-s" },
	{ name: "Secondary Lightness", value: "secondary-l" },
	{ name: "Tertiary Hue", value: "tertiary-h" },
	{ name: "Tertiary Saturation", value: "tertiary-s" },
	{ name: "Tertiary Lightness", value: "tertiary-l" }
];

function Modal({
	modalProps,
	onFinish,
	title,
	children,
	type = "normal",
	confirmMsg = "Finish",
	additionalButtons = [],
	cancelMsg = "Cancel",
	style = {},
	divider = true,
	footer
}) {
	const theme = Hooks.useTheme();
	const cont = useRef(null);
	return BdApi.React.createElement(exports.FocusLock, { containerRef: cont }, BdApi.React.createElement("div", { style, ref: cont, className: `dc-modal theme-${exports.ThemeStore.theme} ${modalProps.transitionState === 2 ? "closing" : ""} ${modalProps.transitionState === 4 ? "hidden" : ""} ${(themes.find((t) => t.id === theme)?.classes || []).join(" ")}`, "data-theme": theme }, BdApi.React.createElement("h2", { className: "dc-modal-header", style: !divider ? { boxShadow: "none" } : {} }, title), BdApi.React.createElement("div", { className: "dc-modal-content", style: { minWidth: "500px" } }, children), BdApi.React.createElement("div", { className: "dc-modal-footer" }, footer || BdApi.React.createElement(BdApi.React.Fragment, null, onFinish ? BdApi.React.createElement(
		"button",
		{
			className: "dc-button dc-button-md" + (type === "danger" ? " dc-button-danger" : " dc-button-brand"),
			onClick: () => onFinish({ closeModal: modalProps.onClose })
		},
		confirmMsg
	) : null, additionalButtons.map(({ type: type2, action, text }) => BdApi.React.createElement(
		"button",
		{
			className: `dc-button dc-button-md dc-button-${type2}`,
			onClick: () => action({ closeModal: modalProps.onClose })
		},
		text
	)), BdApi.React.createElement(
		"button",
		{
			className: "dc-button dc-button-md dc-button-primary",
			onClick: () => modalProps.onClose()
		},
		cancelMsg
	)))));
}

function YoutubeEmbed({ src }) {
	return BdApi.React.createElement(
		"iframe",
		{
			src,
			title: "YouTube video player",
			frameBorder: "0",
			allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
			allowFullScreen: true
		}
	);
}
function Video({ src, poster }) {
	if (src.toLowerCase().includes("youtube.com")) return BdApi.React.createElement(YoutubeEmbed, { src });
	return BdApi.React.createElement("video", { src, poster, controls: true, className: "bd-changelog-poster" });
}
function ChangelogModal({
	modalProps,
	title,
	video,
	poster,
	image,
	description,
	changes
}) {
	const [discordColorwaysData] = useContextualState("discordColorwaysData");
	const Footer = () => BdApi.React.createElement("div", { style: { display: "flex", marginRight: "auto" } }, BdApi.React.createElement("a", { "aria-label": "Discord", className: "dc-footer-social-link", href: "https://discord.gg/67VRpSjzxU", rel: "noreferrer noopener", target: "_blank" }, BdApi.React.createElement(DiscordIcon, { width: 16, height: 16 })), BdApi.React.createElement("div", { className: "dc-footer-note" }, "Join our Discord Server for more updates!"));
	return BdApi.React.createElement(Modal, { divider: false, style: { width: "532px" }, title: BdApi.React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, title, BdApi.React.createElement("span", { className: "dc-modal-header-subtitle" }, "Version ", discordColorwaysData.version)), type: "normal", modalProps, onFinish: ({ closeModal }) => closeModal(), footer: BdApi.React.createElement(Footer, null) }, video ? BdApi.React.createElement(Video, { src: video, poster }) : BdApi.React.createElement("img", { src: image, className: "bd-changelog-poster" }), description.split("\n").map((d) => BdApi.React.createElement("p", { className: "dc-changelog-desc" }, d)), changes.map((change) => BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("h2", { className: `dc-changelog-title dc-changelog-title-${change.type}` }, BdApi.React.createElement("span", null, change.title, " ")), BdApi.React.createElement("ul", { className: "dc-changes-list" }, change.items.map((item) => BdApi.React.createElement("li", { className: "dc-change" }, item))))));
}
const openChangelogModal = () => openModal$1((props) => BdApi.React.createElement(ChangelogModal, { modalProps: props, title: "What's new", image: "https://repository-images.githubusercontent.com/788805704/225292b3-b134-4a0f-902d-7ef90143e64f", ...changelog }));

const defaultPreset = {
	name: "Discord",
	source: "Built-In",
	sourceType: "builtin",
	author: "DaBluLite",
	css: `:root:root {
		--brand-100-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 33.5%), 0);
		--brand-130-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 32.2%), 0%);
		--brand-160-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 30.2%), 0%);
		--brand-200-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 28.2%), 0%);
		--brand-230-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 26.2999%), 0%);
		--brand-260-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 23.8999%), 0%);
		--brand-300-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 21.2%), 0%);
		--brand-330-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 16.8999%), 0%);
		--brand-345-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 14.0999%), 0%);
		--brand-360-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 12.7999%), 0%);
		--brand-400-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 7.0999%), 0%);
		--brand-430-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 5.0999%), 0%);
		--brand-460-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) max(calc(colorway(accent-l)% + 2.7999%), 0%);
		--brand-500-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) colorway(accent-l)%;
		--brand-530-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 5.9%), 100%);
		--brand-560-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 12.3%), 100%);
		--brand-600-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 20.6%), 100%);
		--brand-630-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 26.5%), 100%);
		--brand-660-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 31.4%), 100%);
		--brand-700-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 38.8%), 100%);
		--brand-730-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 40.4%), 100%);
		--brand-760-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 42.5%), 100%);
		--brand-800-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 45.3%), 100%);
		--brand-830-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 49.8%), 100%);
		--brand-860-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 55.1%), 100%);
		--brand-900-hsl: colorway(accent-h) calc(var(--saturation-factor, 1)*colorway(accent-s)%) min(calc(colorway(accent-l)% - 61.6%), 100%);
}

.theme-dark {
		--primary-800-hsl: colorway(tertiary-h) calc(var(--saturation-factor, 1)*colorway(tertiary-s)%) max(calc(colorway(tertiary-l)% - 7.2%), 0%);
		--primary-730-hsl: colorway(tertiary-h) calc(var(--saturation-factor, 1)*colorway(tertiary-s)%) max(calc(colorway(tertiary-l)% - 3.6%), 0%);
		--primary-700-hsl: colorway(tertiary-h) calc(var(--saturation-factor, 1)*colorway(tertiary-s)%) colorway(tertiary-l)%;
		--primary-660-hsl: colorway(secondary-h) calc(var(--saturation-factor, 1)*colorway(secondary-s)%) max(calc(colorway(secondary-l)% - 3.6%), 0%);
		--primary-645-hsl: colorway(secondary-h) calc(var(--saturation-factor, 1)*colorway(secondary-s)%) max(calc(colorway(secondary-l)% - 1.1%), 0%);
		--primary-630-hsl: colorway(secondary-h) calc(var(--saturation-factor, 1)*colorway(secondary-s)%) colorway(secondary-l)%;
		--primary-600-hsl: colorway(primary-h) calc(var(--saturation-factor, 1)*colorway(primary-s)%) colorway(primary-l)%;
		--primary-560-hsl: colorway(primary-h) calc(var(--saturation-factor, 1)*colorway(primary-s)%) min(calc(colorway(primary-l)% + 3.6%), 100%);
		--primary-530-hsl: colorway(primary-h) calc(var(--saturation-factor, 1)*colorway(primary-s)%) min(calc(colorway(primary-l)% + 7.2%), 100%);
		--primary-500-hsl: colorway(primary-h) calc(var(--saturation-factor, 1)*colorway(primary-s)%) min(calc(colorway(primary-l)% + 10.8%), 100%);
		--interactive-muted: hsl(colorway(primary-h) calc(colorway(primary-s)%/2) max(min(calc(colorway(primary-l)% - 5%), 100%), 45%));
		--primary-460-hsl: 0 calc(var(--saturation-factor, 1)*0%) 50%;
}

.theme-light {
		--white-500-hsl: colorway(primary-h) calc(var(--saturation-factor, 1)*colorway(primary-s)%) min(calc(colorway(primary-l)% + 80%), 90%);
		--primary-130-hsl: colorway(secondary-h) calc(var(--saturation-factor, 1)*colorway(secondary-s)%) min(calc(colorway(secondary-l)% + 80%), 85%);
		--primary-160-hsl: colorway(secondary-h) calc(var(--saturation-factor, 1)*colorway(secondary-s)%) min(calc(colorway(secondary-l)% + 76.4%), 82.5%);
		--primary-200-hsl: colorway(tertiary-h) calc(var(--saturation-factor, 1)*colorway(tertiary-s)%) min(calc(colorway(tertiary-l)% + 80%), 80%);
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
}`,
	conditions: [
		{
			if: "primary-l",
			is: "greaterThan",
			than: "80",
			onCondition: `/*Primary*/
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

.theme-dark .channelTextArea_a7d72e {
		--text-normal: black;
}

.theme-dark .placeholder_a552a6 {
		--channel-text-area-placeholder: black;
}

.theme-dark .placeholder_a552a6 {
		opacity: .6;
}

.theme-dark .root_f9a4c9 > .header_f9a4c9 > h1 {
		color: black;
}
/*End Primary*/`
		},
		{
			if: "secondary-l",
			is: "greaterThan",
			than: "80",
			onCondition: `/*Secondary*/
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
}

.theme-dark .bannerVisible_fd6364 .headerContent_fd6364 {
		color: #fff;
}

.theme-dark .embedFull_b0068a {
		--text-normal: black;
}
/*End Secondary*/`
		},
		{
			if: "secondary-h",
			is: "equal",
			than: "0",
			onCondition: `.theme-dark .nameTag_b2ca13 {
		--header-secondary: gray !important;
}
:root:root {
		--primary-430: gray;
		--neutral-36: gray;
		--primary-400: gray;
		--neutral-31: gray;
		--primary-360: gray;
		--neutral-24: gray;
}`,
			onConditionElse: `.theme-dark .nameTag_b2ca13 {
		--header-secondary: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*100%), 90%) !important;
}
:root:root {
		--primary-430: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*colorway(primary-s)%), 90%);
		--neutral-36: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*colorway(primary-s)%), 90%);
		--primary-400: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*colorway(primary-s)%), 90%);
		--neutral-31: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*colorway(primary-s)%), 90%);
		--primary-360: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*colorway(primary-s)%), 90%);
		--neutral-24: hsl(colorway(secondary-h), calc(var(--saturation-factor, 1)*colorway(primary-s)%), 90%);
}`
		},
		{
			if: "tertiary-l",
			is: "greaterThan",
			than: "80",
			onCondition: `/*Tertiary*/
.theme-dark .winButton_a934d8,
.theme-dark .searchBar_e0840f *,
.theme-dark .wordmarkWindows_a934d8,
.theme-dark .searchBar_a46bef *,
.theme-dark .searchBarComponent_f0963d {
		--white-500: black !important;
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
.theme-dark .callContainer_d880dc {
		--white-500: black !important;
}
/*End Tertiary*/`,
			onConditionElse: `.theme-dark .callContainer_d880dc {
		--white-500: white !important;
}`
		},
		{
			if: "accent-l",
			is: "greaterThan",
			than: "80",
			onCondition: `/*Accent*/
.selected_db6521 *,
.selected_ae80f7 *,
#app-mount .lookFilled_dd4f85.colorBrand_dd4f85:not(.buttonColor_adcaac),
.colorDefault_d90b3d.focused_d90b3d,
.row_c5b389:hover,
.checkmarkCircle_cb7c27 > circle {
		--white-500: black !important;
}

.dc-app-launcher:hover .vc-pallete-icon {
		color: #000 !important;
}

:root:root {
		--mention-foreground: black !important;
}
/*End Accent*/`
		}
	]
};
const contexts = {
	colorwaysPluginTheme: "discord",
	colorwaySourceFiles: [],
	customColorways: [],
	activeColorwayObject: nullColorwayObj,
	activeAutoPreset: "hueRotation",
	colorwayData: [],
	showColorwaysButton: false,
	colorwayUsageMetrics: [],
	colorwaysManagerDoAutoconnect: true,
	colorwaysManagerAutoconnectPeriod: 3e3,
	hasManagerRole: false,
	isConnected: false,
	boundKey: { "00000000": `discord.${Math.random().toString(16).slice(2)}.${( new Date()).getUTCMilliseconds()}` },
	colorwaysBoundManagers: [],
	discordColorwaysData: {
		version: "8.0.1",
		UIVersion: "3.0.0"
	},
	themePresets: [],
	activePresetObject: { id: defaultPreset.name, source: defaultPreset.source, sourceType: defaultPreset.sourceType, css: defaultPreset.css, conditions: defaultPreset.conditions },
	colorwaysDiscordPreset: defaultPreset
};
const unsavedContexts = ["themePresets", "isConnected", "boundKey", "hasManagerRole", "colorwayData"];
const contextKeys = Object.keys(contexts).filter((key) => unsavedContexts.includes(key) === false);
async function initContexts() {
	const data = await DataStore.getMany(contextKeys);
	contextKeys.forEach(async (key, i) => {
		if (data[i] === void 0) {
			DataStore.set(key, contexts[key]);
			if (key === "discordColorwaysData") {
				openChangelogModal();
			}
		} else {
			if (key === "discordColorwaysData" && data[i].version !== contexts.discordColorwaysData.version) {
				await DataStore.set(key, { ...data[i], version: contexts.discordColorwaysData.version });
				openChangelogModal();
			} else {
				contexts[key] = data[i];
			}
		}
	});
	const responses = await Promise.all(
		contexts.colorwaySourceFiles.map(
			(source) => fetch(source.url)
		)
	);
	const themes = await getThemesList();
	themes.forEach(async (theme) => {
		const css = await getThemeData(theme.fileName);
		if (css && css.match(colorwayVarRegex)) {
			setContext("themePresets", [
				...contexts.themePresets,
				{
					name: theme.name,
					css: `:root:root {
 ${[
						...(css.match(colorwayVarRegex) || []).map((decl) => `--${decl.split(" ")[1]}: ${decl.split("@colorwayVar " + decl.split(" ")[1] + " ")[1]};`)
					].join("\n  ")}
}`,
					author: theme.author,
					sourceType: "theme",
					source: theme.name
				}
			], false);
		}
	});
	contexts.colorwayData = await Promise.all(
		responses.map((res, i) => ({ response: res, name: contexts.colorwaySourceFiles[i].name })).map(
			(res) => res.response.json().then((dt) => ({
				colorways: dt.colorways || [],
				presets: (dt.presets || []).filter((preset) => {
					if (preset.name === "Discord" && preset.author === "DaBluLite" && res.response.url === defaultColorwaySource) {
						contexts.colorwaysDiscordPreset = {
							name: "Discord",
							source: "Built-In",
							sourceType: "builtin",
							author: "DaBluLite",
							css: preset.css,
							conditions: preset.conditions
						};
						return false;
					}
					return true;
				}),
				source: res.name,
				type: "online"
			})).catch(() => ({ colorways: [], presets: [], source: res.name, type: "online" }))
		)
	);
	Object.keys(contexts).forEach((c) => {
		Dispatcher.dispatch("COLORWAYS_CONTEXT_UPDATED", {
			c,
			value: contexts[c]
		});
	});
	return contexts;
}
function setContext(context, value, save = true) {
	contexts[context] = value;
	Dispatcher.dispatch("COLORWAYS_CONTEXT_UPDATED", {
		c: context,
		value
	});
	save && DataStore.set(context, value);
	return value;
}
function setContexts(...conts) {
	conts.forEach((context) => {
		if (context[2]) {
			setContext(context[0], context[1], context[2]);
		}
	});
}

const $Contexts = /*#__PURE__*/Object.freeze({
		__proto__: null,
		contexts,
		unsavedContexts,
		initContexts,
		setContext,
		setContexts
});

function promisifyRequest(request) {
	return new Promise((resolve, reject) => {
		request.oncomplete = request.onsuccess = () => resolve(request.result);
		request.onabort = request.onerror = () => reject(request.error);
	});
}
function createStore(dbName, storeName) {
	const request = indexedDB.open(dbName);
	request.onupgradeneeded = () => request.result.createObjectStore(storeName);
	const dbp = promisifyRequest(request);
	return (txMode, callback) => dbp.then(
		(db) => callback(db.transaction(storeName, txMode).objectStore(storeName))
	);
}
let defaultGetStoreFunc;
function defaultGetStore() {
	if (!defaultGetStoreFunc) {
		defaultGetStoreFunc = createStore(window.Vencord ? "VencordData" : "ColorwaysData", window.Vencord ? "VencordStore" : "ColorwaysStore");
	}
	return defaultGetStoreFunc;
}
function get(key, customStore = defaultGetStore()) {
	if (window.BdApi) return window.BdApi.Data.load("DiscordColorways", key);
	else return customStore("readonly", (store) => promisifyRequest(store.get(key)));
}
function set(key, value, customStore = defaultGetStore()) {
	if (window.BdApi) return window.BdApi.Data.save("DiscordColorways", key, value);
	else return customStore("readwrite", (store) => {
		store.put(value, key);
		return promisifyRequest(store.transaction);
	});
}
function setMany(entries2, customStore = defaultGetStore()) {
	if (window.BdApi) {
		entries2.map((entry) => window.BdApi.Data.save("DiscordColorways", entry[0], entry[1]));
		return new Promise(() => void 0);
	} else return customStore("readwrite", (store) => {
		entries2.forEach((entry) => store.put(entry[1], entry[0]));
		return promisifyRequest(store.transaction);
	});
}
function getMany(keys2, customStore = defaultGetStore()) {
	if (window.BdApi) return Promise.all(keys2.map((key) => window.BdApi.Data.load("DiscordColorways", key)));
	else return customStore(
		"readonly",
		(store) => Promise.all(keys2.map((key) => promisifyRequest(store.get(key))))
	);
}
function update(key, updater, customStore = defaultGetStore()) {
	return customStore(
		"readwrite",
		(store) => (
			// Need to create the promise manually.
			// If I try to chain promises, the transaction closes in browsers
			// that use a promise polyfill (IE10/11).
			new Promise((resolve, reject) => {
				store.get(key).onsuccess = function() {
					try {
						store.put(updater(this.result), key);
						resolve(promisifyRequest(store.transaction));
					} catch (err) {
						reject(err);
					}
				};
			})
		)
	);
}
function del(key, customStore = defaultGetStore()) {
	if (window.BdApi) return window.BdApi.Data.delete("DiscordColorways", key);
	else return customStore("readwrite", (store) => {
		store.delete(key);
		return promisifyRequest(store.transaction);
	});
}
function delMany(keys2, customStore = defaultGetStore()) {
	if (window.BdApi) {
		Promise.all(keys2.map((key) => window.BdApi.Data.delete("DiscordColorways", key)));
		return new Promise((resolve) => resolve(void 0));
	} else return customStore("readwrite", (store) => {
		keys2.forEach((key) => store.delete(key));
		return promisifyRequest(store.transaction);
	});
}
function clear(customStore = defaultGetStore()) {
	return customStore("readwrite", (store) => {
		store.clear();
		return promisifyRequest(store.transaction);
	});
}
function eachCursor(store, callback) {
	store.openCursor().onsuccess = function() {
		if (!this.result) return;
		callback(this.result);
		this.result.continue();
	};
	return promisifyRequest(store.transaction);
}
function keys(customStore = defaultGetStore()) {
	return customStore("readonly", (store) => {
		if (store.getAllKeys) {
			return promisifyRequest(
				store.getAllKeys()
			);
		}
		const items = [];
		return eachCursor(
			store,
			(cursor) => items.push(cursor.key)
		).then(() => items);
	});
}
function values(customStore = defaultGetStore()) {
	return customStore("readonly", (store) => {
		if (store.getAll) {
			return promisifyRequest(store.getAll());
		}
		const items = [];
		return eachCursor(store, (cursor) => items.push(cursor.value)).then(
			() => items
		);
	});
}
function entries(customStore = defaultGetStore()) {
	return customStore("readonly", (store) => {
		if (store.getAll && store.getAllKeys) {
			return Promise.all([
				promisifyRequest(
					store.getAllKeys()
				),
				promisifyRequest(store.getAll())
			]).then(([keys2, values2]) => keys2.map((key, i) => [key, values2[i]]));
		}
		const items = [];
		return customStore(
			"readonly",
			(store2) => eachCursor(
				store2,
				(cursor) => items.push([cursor.key, cursor.value])
			).then(() => items)
		);
	});
}

const $DataStore = /*#__PURE__*/Object.freeze({
		__proto__: null,
		promisifyRequest,
		createStore,
		get,
		set,
		setMany,
		getMany,
		update,
		del,
		delMany,
		clear,
		keys,
		values,
		entries
});

const css$2 = "/* stylelint-disable unknownAtRules */\n/* stylelint-disable property-no-vendor-prefix */\n/* stylelint-disable function-linear-gradient-no-nonstandard-direction */\n/* stylelint-disable color-function-notation */\n/* stylelint-disable alpha-value-notation */\n/* stylelint-disable value-no-vendor-prefix */\n/* stylelint-disable color-hex-length */\n/* stylelint-disable no-descending-specificity */\n/* stylelint-disable declaration-block-no-redundant-longhand-properties */\n/* stylelint-disable selector-id-pattern */\n/* stylelint-disable selector-class-pattern */\n@import url(\"https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css\");\n@import url(\"https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Edu+AU+VIC+WA+NT+Hand:wght@400..700&display=swap\");\n\n.dc-app-launcher {\n  	height: 48px;\n  	width: 48px;\n  	border-radius: 50px;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	transition: 0.15s ease-out;\n  	background-color: var(--background-primary);\n  	cursor: pointer;\n  	color: var(--text-normal);\n}\n\n.dc-app-launcher:hover {\n  	background-color: var(--brand-500);\n  	color: var(--white);\n  	border-radius: 16px;\n}\n\n.dc-tooltip-normal-text {\n  	font-weight: 500;\n  	font-size: 14px;\n  	line-height: 16px;\n  	word-wrap: break-word;\n}\n\n.dc-color-swatch {\n  	display: flex;\n  	flex-flow: wrap;\n  	flex-direction: row;\n  	overflow: hidden;\n  	border-radius: 50%;\n  	width: 38px;\n  	height: 38px;\n  	box-shadow: 0 0 0 1.5px var(--interactive-normal);\n  	box-sizing: border-box;\n  	flex-shrink: 0;\n}\n\n.dc-color-swatch-part {\n  	width: 50%;\n  	height: 50%;\n}\n\n.dc-color-swatch:not(:has(> .dc-color-swatch-part:nth-child(2)))\n  	> .dc-color-swatch-part {\n  	height: 100%;\n  	width: 100%;\n}\n\n.dc-color-swatch:not(:has(> .dc-color-swatch-part:nth-child(3)))\n  	> .dc-color-swatch-part {\n  	height: 100%;\n}\n\n.dc-color-swatch:not(:has(> .dc-color-swatch-part:nth-child(4)))\n  	> .dc-color-swatch-part:nth-child(3) {\n  	width: 100%;\n}\n\n.dc-selector {\n  	position: relative;\n  	display: grid;\n  	grid-template-columns: repeat(2, calc(50% - 4px));\n  	grid-auto-rows: max-content;\n  	gap: 8px;\n  	width: 100%;\n  	scrollbar-width: none !important;\n  	box-sizing: border-box;\n  	overflow: hidden auto;\n}\n\n.dc-selector[data-layout=\"compact\"] {\n  	grid-template-columns: repeat(3, calc((100%/3) - 5.3333px));\n}\n\n.dc-selector[data-layout=\"compact\"] > .dc-colorway {\n  	padding: 4px 6px;\n  	min-height: 38px;\n}\n\n.dc-selector[data-layout=\"compact\"] > .dc-colorway .dc-subnote {\n  	display: none;\n}\n\n.dc-selector::-webkit-scrollbar {\n  	width: 0;\n}\n\n.dc-app-root {\n  	width: 100% !important;\n  	height: 100% !important;\n  	display: flex;\n  	flex-direction: row;\n  	background-color: #0a0a0c;\n  	margin: 0 auto;\n  	pointer-events: all;\n  	position: relative;\n}\n\n.theme-light .dc-app-root {\n  	background-color: #f5f5f5;\n  	border-color: #d6d6d6;\n}\n\n@keyframes reveal-modal {\n  	from {\n  			translate: 0 -20px;\n  	}\n\n  	to {\n  			translate: 0;\n  	}\n}\n\n@keyframes reveal-modal-backdrop {\n  	from {\n  			opacity: 0;\n  	}\n\n  	to {\n  			opacity: 0.75;\n  	}\n}\n\n.dc-modal.closing {\n  	animation: close-modal 0.2s ease-in-out;\n  	transform: scale(0.5);\n  	opacity: 0;\n}\n\n.dc-modal.hidden {\n  	animation: close-modal 0.2s ease-in-out;\n  	transform: scale(0.5);\n  	opacity: 0;\n}\n\n@keyframes show-modal {\n  	0% {\n  			transform: scale(0.7);\n  			opacity: 0;\n  	}\n\n  	75% {\n  			transform: scale(1.009);\n  			opacity: 1;\n  	}\n\n  	100% {\n  			transform: scale(1);\n  			opacity: 1;\n  	}\n}\n\n@keyframes close-modal {\n  	from {\n  			transform: scale(1);\n  			opacity: 1;\n  	}\n\n  	to {\n  			transform: scale(0.7);\n  			opacity: 0;\n  	}\n}\n\n.dc-divider {\n  	width: 100%;\n  	height: 1px;\n  	border-top: thin solid #fff;\n  	margin-top: 20px;\n}\n\n.dc-switch {\n  	background-color: rgb(85 87 94);\n  	flex: 0 0 auto;\n  	position: relative;\n  	border-radius: 14px;\n  	width: 40px;\n  	height: 24px;\n  	cursor: pointer;\n  	transition: 0.15s ease;\n}\n\n.dc-switch.checked {\n  	background-color: #fff;\n}\n\n.dc-switch-label {\n  	flex: 1;\n  	display: block;\n  	overflow: hidden;\n  	margin-top: 0;\n  	margin-bottom: 0;\n  	color: var(--header-primary);\n  	line-height: 24px;\n  	font-size: 16px;\n  	font-weight: 500;\n  	word-wrap: break-word;\n  	cursor: pointer;\n}\n\n.dc-note {\n  	color: var(--header-secondary);\n  	font-size: 14px;\n  	line-height: 20px;\n  	font-weight: 400;\n  	margin-top: 8px;\n}\n\n.dc-button {\n  	padding: 4px 12px;\n  	border-radius: 6px;\n  	background-color: transparent;\n  	transition: 0.2s ease;\n  	cursor: pointer;\n  	display: flex;\n  	gap: 0.5rem;\n  	justify-content: center;\n  	align-items: center;\n  	height: var(--custom-button-button-sm-height);\n  	min-width: var(--custom-button-button-sm-width);\n  	min-height: var(--custom-button-button-sm-height);\n  	box-sizing: border-box;\n  	width: auto;\n}\n\n.dc-button:hover {\n  	background-color: hsl(var(--white-500-hsl)/5%);\n}\n\n.dc-button:active {\n  	background-color: hsl(var(--white-500-hsl)/1%);\n}\n\n.dc-button-outlined {\n  	transition: color var(--custom-button-transition-duration) ease,background-color var(--custom-button-transition-duration)ease,border-color var(--custom-button-transition-duration)ease !important;\n  	border-width: 1px !important;\n  	border-style: solid !important;\n}\n\n.dc-button:not(.dc-button-outlined).dc-button-primary {\n  	color: #fff;\n  	background-color: #202028;\n}\n\n.theme-light .dc-button:not(.dc-button-outlined).dc-button-primary {\n  	color: #000;\n  	background-color: #f0f0f0;\n}\n\n.dc-button:not(.dc-button-outlined).dc-button-secondary {\n  	color: #fff;\n  	background-color: #141416;\n}\n\n.theme-light.dc-button:not(.dc-button-outlined).dc-button-secondary {\n  	color: #000;\n  	background-color: #e6e6e6;\n}\n\n.dc-button:not(.dc-button-outlined).dc-button-danger {\n  	color: #fff;\n  	background-color: #e80808;\n}\n\n.dc-button:not(.dc-button-outlined).dc-button-brand {\n  	color: #000;\n  	background-color: #fff;\n}\n\n.dc-button.dc-button-outlined.dc-button-primary {\n  	color: #fff;\n  	border-color: #202028;\n}\n\n.dc-button.dc-button-outlined.dc-button-secondary {\n  	color: #fff;\n  	border-color: #141416;\n}\n\n.dc-button.dc-button-outlined.dc-button-danger {\n  	color: #fff;\n  	border-color: #e80808;\n}\n\n.dc-button.dc-button-outlined.dc-button-brand {\n  	color: #fff;\n  	border-color: #fff;\n}\n\n.theme-light .dc-button.dc-button-outlined {\n  	color: #000;\n}\n\n.dc-button.dc-button-icon {\n  	padding: 4px;\n  	min-width: var(--custom-button-button-sm-height);\n}\n\n.dc-button.dc-button-primary:hover,\n.dc-button.dc-button-secondary:hover,\n.theme-light .dc-button.dc-button-brand:hover {\n  	background-color: #2a2a2f;\n  	border-color: #2a2a2f;\n  	color: #fff;\n}\n\n.dc-button.dc-button-primary:active,\n.dc-button.dc-button-secondary:active,\n.theme-light .dc-button.dc-button-brand:active {\n  	background-color: #0a0a0a;\n  	border-color: #0a0a0a;\n  	color: #fff;\n}\n\n.theme-light .dc-button.dc-button-primary:hover,\n.theme-light .dc-button.dc-button-secondary:hover {\n  	background-color: #d6d6d6;\n  	border-color: #d6d6d6;\n  	color: #000;\n}\n\n.theme-light .dc-button.dc-button-primary:active,\n.theme-light .dc-button.dc-button-secondary:active {\n  	background-color: #919191;\n  	border-color: #919191;\n  	color: #000;\n}\n\n.dc-button.dc-button-danger:hover {\n  	background-color: #c70707;\n  	border-color: #c70707;\n  	color: #fff;\n}\n\n.dc-button.dc-button-danger:active {\n  	background-color: #b10606;\n  	border-color: #b10606;\n  	color: #fff;\n}\n\n.dc-button.dc-button-brand:hover {\n  	background-color: #e1e1e1;\n  	border-color: #e1e1e1;\n  	color: #000;\n}\n\n.dc-button.dc-button-brand:active {\n  	background-color: #919191;\n  	border-color: #919191;\n  	color: #000;\n}\n\n.theme-light .dc-button.dc-button-brand:hover {\n  	background-color: #2a2a2f;\n  	border-color: #2a2a2f;\n  	color: #fff;\n}\n\n.theme-light .dc-button.dc-button-brand:active {\n  	background-color: #0a0a0a;\n  	border-color: #0a0a0a;\n  	color: #fff;\n}\n\n.dc-button-md {\n  	height: var(--custom-button-button-md-height);\n  	min-width: var(--custom-button-button-md-width);\n  	min-height: var(--custom-button-button-md-height);\n}\n\n.dc-button-lg {\n  	height: var(--custom-button-button-lg-height);\n  	min-width: var(--custom-button-button-lg-width);\n  	min-height: var(--custom-button-button-lg-height);\n}\n\n.dc-button-xl {\n  	height: var(--custom-button-button-xl-height);\n  	min-width: var(--custom-button-button-xl-width);\n  	min-height: var(--custom-button-button-xl-height);\n}\n\n.dc-button-tn {\n  	height: var(--custom-button-button-tn-height);\n  	min-width: var(--custom-button-button-tn-width);\n  	min-height: var(--custom-button-button-tn-height);\n}\n\n.dc-button-md.dc-button-icon {\n  	min-width: var(--custom-button-button-md-height);\n}\n\n.dc-button-lg.dc-button-icon {\n  	min-width: var(--custom-button-button-lg-height);\n}\n\n.dc-button-xl.dc-button-icon {\n  	min-width: var(--custom-button-button-xl-height);\n}\n\n.dc-button-tn.dc-button-icon {\n  	min-width: var(--custom-button-button-tn-height);\n}\n\n.dc-page-header {\n  	color: #fff;\n  	font-weight: normal;\n  	padding-left: 16px;\n  	box-sizing: border-box;\n  	border-radius: 8px;\n  	background-color: #101012;\n  	display: flex;\n  	gap: 16px;\n  	align-items: center;\n  	height: 50px;\n  	flex-shrink: 0;\n}\n\n.theme-light .dc-page-header {\n  	background-color: #f0f0f0;\n  	color: #000;\n}\n\n.dc-app-sidebar {\n  	background-color: #101012;\n  	color: #fff;\n  	box-sizing: border-box;\n  	height: fit-content;\n  	border-radius: 8px;\n  	flex: 0 0 auto;\n  	padding: 8px;\n  	margin: auto 8px;\n  	margin-right: 0;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	border-top-left-radius: 8px;\n  	border-bottom-left-radius: 8px;\n}\n\n.theme-light .dc-app-sidebar {\n  	background-color: #e6e6e6;\n  	color: #000;\n}\n\n.dc-discordserverlist-listitem {\n  	position: relative;\n  	margin: 0 0 8px;\n  	display: flex;\n  	-webkit-box-pack: center;\n  	-ms-flex-pack: center;\n  	justify-content: center;\n  	width: 72px;\n}\n\n.dc-textbox {\n  	width: 100%;\n  	border-radius: 6px;\n  	background-color: #101012;\n  	transition: 0.2s ease;\n  	border: 1px solid transparent;\n  	padding-left: 12px;\n  	color: #fff;\n  	height: 40px;\n  	box-sizing: border-box;\n}\n\n.dc-codeblock {\n  	border-radius: 6px;\n  	background-color: #101012;\n  	transition: 0.2s ease;\n  	padding: 10px;\n  	border: 1px solid transparent;\n  	display: block;\n}\n\n.dc-textbox::-webkit-outer-spin-button,\n.dc-textbox::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n\n.theme-light .dc-textbox {\n  	color: #000;\n  	background-color: #f0f0f0;\n}\n\n.theme-light .dc-codeblock {\n  	background-color: #f0f0f0;\n}\n\n.dc-textbox:hover,\n.dc-textbox:focus,\n.dc-textbox:has(:focus),\n.dc-codeblock:hover,\n.dc-codeblock:focus {\n  	background-color: #1a1a1a;\n}\n\n.theme-light .dc-textbox:hover,\n.theme-light .dc-textbox:focus,\n.theme-light .dc-textbox:has(:focus),\n.theme-light .dc-codeblock:hover,\n.theme-light .dc-codeblock:focus {\n  	background-color: #e6e6e6;\n}\n\n.dc-textbox:focus,\n.dc-textbox:has(:focus),\n.dc-codeblock:focus {\n  	border-color: #a6a6a6;\n}\n\n.theme-light .dc-textbox:focus,\n.theme-light .dc-textbox:has(:focus),\n.theme-light .dc-codeblock:focus {\n  	border-color: #595959;\n}\n\n.dc-tooltip-header {\n  	background-color: var(--background-primary);\n  	padding: 2px 8px;\n  	border-radius: 16px;\n  	height: min-content;\n  	color: var(--header-primary);\n  	margin-bottom: 2px;\n  	display: inline-flex;\n  	margin-left: -4px;\n}\n\n.is-mobile .dc-selector {\n  	justify-content: space-around;\n  	gap: 10px;\n}\n\n.dc-spinner {\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	width: 100%;\n}\n\n.dc-spinner-inner {\n  	transform: rotate(280deg);\n  	position: relative;\n  	display: inline-block;\n  	width: 32px;\n  	height: 32px;\n  	contain: paint;\n}\n\n@keyframes spinner-spinning-circle-rotate {\n  	100% {\n  			transform: rotate(1turn);\n  	}\n}\n\n@keyframes spinner-spinning-circle-dash {\n  	0% {\n  			stroke-dasharray: 1, 200;\n  			stroke-dashoffset: 0;\n  	}\n\n  	50% {\n  			stroke-dasharray: 130, 200;\n  	}\n\n  	100% {\n  			stroke-dasharray: 130, 200;\n  			stroke-dashoffset: -124;\n  	}\n}\n\n.dc-spinner-svg {\n  	animation: spinner-spinning-circle-rotate 2s linear infinite;\n  	height: 100%;\n  	width: 100%;\n}\n\n.dc-spinner-beam {\n  	animation: spinner-spinning-circle-dash 2s ease-in-out infinite;\n  	stroke-dasharray: 1, 200;\n  	stroke-dashoffset: 0;\n  	fill: none;\n  	stroke-width: 6;\n  	stroke-miterlimit: 10;\n  	stroke-linecap: round;\n  	stroke: currentcolor;\n}\n\n.dc-spinner-beam2 {\n  	stroke: currentcolor;\n  	opacity: 0.6;\n  	animation-delay: 0.15s;\n}\n\n.dc-spinner-beam3 {\n  	stroke: currentcolor;\n  	opacity: 0.3;\n  	animation-delay: 0.23s;\n}\n\n.dc-colorway {\n  	display: flex;\n  	flex-direction: row;\n  	justify-content: start;\n  	padding: 11px 8px;\n  	padding-left: 11px;\n  	gap: 2px;\n  	border-radius: 6px;\n  	background-color: #101012;\n  	box-sizing: border-box;\n  	min-height: 56px;\n  	align-items: center;\n  	border: 1px solid transparent;\n  	cursor: pointer;\n  	transition:\n  			background-color 0.1s ease-in-out,\n  			border-color 0.1s ease-in-out;\n}\n\n.theme-light .dc-colorway {\n  	background-color: #f0f0f0;\n}\n\n.dc-colorway:hover,\n.dc-colorway:focus,\n.dc-colorway[aria-checked=\"true\"] {\n  	background-color: #2a2a2f;\n}\n\n.theme-light .dc-colorway:hover,\n.theme-light .dc-colorway:focus,\n.theme-light .dc-colorway[aria-checked=\"true\"] {\n  	background-color: #d6d6d6;\n}\n\n.dc-colorway[aria-checked=\"true\"] {\n  	border-color: #a6a6a6;\n}\n\n.theme-light .dc-colorway[aria-checked=\"true\"] {\n  	border-color: #595959;\n}\n\n.dc-colorway[aria-invalid=\"true\"] {\n  	background-color: #e80808;\n}\n\n.dc-colorway[aria-invalid=\"true\"]:hover {\n  	background-color: #c70707;\n}\n\n@keyframes loading-bar {\n  	0% {\n  			left: 0;\n  			right: 100%;\n  			width: 0;\n  	}\n\n  	10% {\n  			left: 0;\n  			right: 75%;\n  			width: 25%;\n  	}\n\n  	90% {\n  			right: 0;\n  			left: 75%;\n  			width: 25%;\n  	}\n\n  	100% {\n  			left: 100%;\n  			right: 0;\n  			width: 0;\n  	}\n}\n\n.dc-badge {\n  	font-size: 0.625rem;\n  	text-transform: uppercase;\n  	vertical-align: top;\n  	display: inline-flex;\n  	align-items: center;\n  	text-indent: 0;\n  	background: #fff;\n  	color: #000;\n  	flex: 0 0 auto;\n  	height: 15px;\n  	padding: 0 4px;\n  	margin-top: 5px;\n  	border-radius: 16px;\n}\n\n.theme-light .dc-badge {\n  	background-color: #000;\n  	color: #fff;\n}\n\n.dc-warning-card {\n  	padding: 1em;\n  	margin-bottom: 1em;\n  	background-color: var(--info-warning-background);\n  	border-color: var(--info-warning-foreground);\n  	color: var(--info-warning-text);\n}\n\n.dc-colorway-selector::before {\n  	-webkit-mask: var(--si-appearance) center/contain no-repeat !important;\n  	mask: var(--si-appearance) center/contain no-repeat !important;\n}\n\n.dc-colorway-settings::before {\n  	-webkit-mask: var(--si-vencordsettings) center/contain no-repeat !important;\n  	mask: var(--si-vencordsettings) center/contain no-repeat !important;\n}\n\n.dc-colorway-sources-manager::before {\n  	-webkit-mask: var(--si-instantinvites) center/contain no-repeat !important;\n  	mask: var(--si-instantinvites) center/contain no-repeat !important;\n}\n\n.dc-colorway-store::before {\n  	-webkit-mask: var(--si-discovery) center/contain no-repeat !important;\n  	mask: var(--si-discovery) center/contain no-repeat !important;\n}\n\n.dc-info-card {\n  	border-radius: 5px;\n  	border: 1px solid var(--blue-345);\n  	padding: 1em;\n  	margin-bottom: 1em;\n  	display: flex;\n  	gap: 1em;\n  	flex-direction: column;\n}\n\n.theme-dark .dc-info-card {\n  	color: var(--white-500);\n}\n\n.theme-light .dc-info-card {\n  	color: var(--black-500);\n}\n\n.dc-label {\n  	margin-right: auto;\n  	margin-top: 0 !important;\n  	margin-left: 0.5rem;\n  	color: var(--header-primary);\n  	font-family: bootstrap-icons, var(--font-primary);\n  	/* stylelint-disable-next-line value-keyword-case */\n  	text-rendering: optimizeLegibility;\n}\n\n.dc-subnote {\n  	color: var(--header-secondary);\n  	overflow: hidden overlay;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n  	width: 100%;\n  	height: 23px;\n}\n\n.dc-label-wrapper {\n  	min-width: 0;\n  	display: flex;\n  	flex-direction: column;\n  	margin-right: 8px;\n  	width: 100%;\n}\n\n.dc-modal {\n  	border-radius: 16px;\n  	background-color: #000;\n  	color: #fff;\n  	height: fit-content;\n  	min-height: unset;\n  	width: fit-content;\n  	border: none;\n  	padding: 0;\n  	margin: 0;\n  	transition: 0.4s ease;\n  	animation: show-modal 0.4s ease;\n  	pointer-events: all;\n  	min-width: 400px;\n  	position: relative;\n}\n\n.dc-modal-content {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 4px;\n  	padding: 16px;\n  	overflow: hidden auto;\n}\n\n.dc-modal-content::-webkit-scrollbar {\n  	width: 0;\n}\n\n.dc-menu-tabs {\n  	width: 100%;\n  	height: 24px;\n  	box-sizing: content-box !important;\n}\n\n.dc-menu-tab {\n  	color: #fff;\n  	text-decoration: none;\n  	padding: 4px 12px;\n  	border-radius: 32px;\n  	transition: 0.2s ease;\n  	margin-right: 8px;\n  	display: inline-block;\n}\n\n.theme-light .dc-menu-tab {\n  	color: #000;\n}\n\n.dc-menu-tab:hover {\n  	background-color: #1f1f1f;\n}\n\n.theme-light .dc-menu-tab:hover {\n  	background-color: #e0e0e0;\n}\n\n.dc-menu-tab.active {\n  	color: #000;\n  	background-color: #fff;\n}\n\n.theme-light .dc-menu-tab.active {\n  	color: #fff;\n  	background-color: #000;\n}\n\n.dc-modal-footer {\n  	border-radius: 6px;\n  	padding: 4px;\n  	margin: 4px;\n  	display: flex;\n  	flex-direction: row-reverse;\n  	background-color: #101012;\n  	width: calc(100% - 16px);\n  	gap: 4px;\n}\n\n.dc-modal-header {\n  	margin: 0;\n  	font-weight: normal;\n  	font-size: 1.25em;\n  	padding: 16px;\n  	color: var(--text-normal);\n}\n\n.dc-field-header {\n  	margin-bottom: 8px;\n  	display: block;\n  	font-family: var(--font-display);\n  	font-size: 12px;\n  	line-height: 1.3333;\n  	font-weight: 700;\n  	text-transform: uppercase;\n  	letter-spacing: .02em;\n  	color: var(--header-secondary);\n}\n\n.dc-field-header-error {\n  	color: #FF0000;\n}\n\n.dc-field-header-errormsg {\n  	font-size: 12px;\n  	font-weight: 500;\n  	font-style: italic;\n  	text-transform: none;\n}\n\n.dc-field-header-errordiv {\n  	padding-left: 4px;\n  	padding-right: 4px;\n}\n\n.dc-cid-wrapper {\n  	display: flex;\n  	flex-direction: column;\n  	gap: 8px;\n  	max-width: 500px;\n  	width: 100%;\n}\n\n.dc-cid-wrapper > .dc-colorway {\n  	width: 100%;\n}\n\n.dc-contextmenu {\n  	border-radius: 8px;\n  	border: 1px solid #dfdfdf;\n  	background-color: #000;\n  	padding: 4px;\n  	display: flex;\n  	flex-direction: column;\n  	gap: 4px;\n  	position: relative;\n  	z-index: 5;\n}\n\n.dc-contextmenu-item {\n  	box-sizing: border-box;\n  	display: flex;\n  	justify-content: space-between;\n  	align-items: center;\n  	min-height: 32px;\n  	padding: 6px 8px;\n  	border-radius: 6px;\n  	background-color: #101012;\n  	border: 1px solid transparent;\n  	transition: 0.2s ease;\n  	cursor: pointer;\n  	color: #dfdfdf;\n}\n\n.dc-contextmenu-divider {\n  	box-sizing: border-box;\n  	margin: 4px;\n  	border-bottom: 1px solid var(--background-modifier-accent);\n}\n\n.dc-contextmenu-item:hover {\n  	background-color: #2a2a2f;\n  	border-color: #a6a6a6;\n}\n\n.dc-radio-selected {\n  	fill: #fff;\n}\n\n.dc-tooltip {\n  	background-color: var(--background-floating);\n  	box-shadow: var(--shadow-high);\n  	color: var(--text-normal);\n  	pointer-events: none;\n  	border-radius: 5px;\n  	font-weight: 500;\n  	font-size: 14px;\n  	line-height: 16px;\n  	max-width: 190px;\n  	box-sizing: border-box;\n  	word-wrap: break-word;\n  	z-index: 1002;\n  	will-change: opacity, transform;\n  	transition:\n  			transform 0.1s ease,\n  			opacity 0.1s ease;\n  	position: fixed;\n}\n\n.dc-tooltip.dc-tooltip-hidden {\n  	transform: scale(0.95);\n  	opacity: 0;\n}\n\n.dc-tooltip-right {\n  	transform-origin: 0% 50%;\n}\n\n.dc-tooltip-pointer {\n  	width: 0;\n  	height: 0;\n  	border: 0 solid transparent;\n  	border-width: 5px;\n  	pointer-events: none;\n  	border-top-color: var(--background-floating);\n}\n\n.dc-tooltip-right > .dc-tooltip-pointer {\n  	position: absolute;\n  	right: 100%;\n  	top: 50%;\n  	margin-top: -5px;\n  	border-left-width: 5px;\n  	transform: rotate(90deg);\n}\n\n.dc-tooltip-top > .dc-tooltip-pointer {\n  	position: absolute;\n  	right: 50%;\n  	top: 100%;\n  	margin-right: -5px;\n  	border-bottom-width: 5px;\n  	transform: rotate(0deg);\n}\n\n.dc-tooltip-content {\n  	padding: 8px 12px;\n  	overflow: hidden;\n  	font-weight: 600;\n  	font-size: 16px;\n  	line-height: 20px;\n  	display: flex;\n  	flex-direction: column;\n}\n\n.dc-wordmark {\n  	font-family: var(--font-headline);\n  	font-size: 24px;\n  	color: var(--header-primary);\n  	line-height: 31px;\n  	margin-bottom: 0;\n}\n\n.dc-wordmark-colorways {\n  	font-family: var(--font-display);\n  	font-size: 24px;\n  	background-color: var(--brand-500);\n  	padding: 0 4px;\n  	border-radius: 4px;\n}\n\n.visual-refresh .dc-wordmark-colorways {\n  	border-radius: 8px;\n  	padding: 0 8px;\n  	border: 1px solid var(--border-strong);\n  	font-family: \"Edu AU VIC WA NT Hand\", cursive;\n  	line-height: 32px;\n  	display: inline-block;\n}\n\n.visual-refresh .dc-app-launcher {\n  	width: 44px;\n  	height: 44px;\n}\n\n.dc-discordserverlist-listitem-pill {\n  	width: 4px;\n  	margin-left: -4px;\n  	height: 0;\n  	position: absolute;\n  	top: 50%;\n  	left: 0;\n  	transform: translateY(-50%);\n  	background-color: var(--header-primary);\n  	border-radius: 0 4px 4px 0;\n  	transition: 0.2s ease-in-out;\n}\n\n.dc-discordserverlist-listitem-pill[data-status=\"hover\"],\n.dc-discordserverlist-listitem-pill[data-status=\"active\"] {\n  	margin-left: 0;\n  	height: 20px;\n}\n\n.dc-discordserverlist-listitem-pill[data-status=\"active\"] {\n  	height: 40px;\n}\n\n.dc-manager-active {\n  	color: #fff;\n  	margin: auto;\n  	font-size: 20px;\n  	display: flex;\n  	justify-content: center;\n  	gap: 8px;\n  	align-items: center;\n  	position: absolute;\n  	top: 0;\n  	left: 0;\n  	height: 100%;\n  	width: 100%;\n  	backdrop-filter: blur(16px);\n  	z-index: 1;\n}\n\n.dc-selector-spinner {\n  	width: 32px;\n  	color: #fff;\n  	transform: scale(.8);\n}\n\n.dc-selector-spinner-hidden {\n  	display: none;\n}\n\n.dc-selector-header {\n  	display: flex !important;\n  	gap: 4px !important;\n  	padding: 4px !important;\n  	height: fit-content !important;\n}\n\n.dc-selector-header .dc-button {\n  	flex: 0 0 auto;\n}\n\n.dc-selector-header .dc-textbox {\n  	height: 32px !important;\n  	background-color: transparent !important;\n  	border: none !important;\n}\n\n.dc-contextmenu-colors {\n  	display: flex;\n  	justify-items: center;\n  	align-items: center;\n  	gap: 4px;\n  	padding: 8px;\n}\n\n.dc-contextmenu-color {\n  	border-radius: 8px;\n  	min-width: 44px;\n  	width: 100%;\n  	height: 44px;\n  	cursor: pointer;\n  	transition: .2s ease;\n}\n\n.dc-contextmenu-color:hover {\n  	filter: brightness(.8);\n}\n\n.dc-switch-handle {\n  	transition: 0.2s;\n  	display: block;\n  	position: absolute;\n  	width: 28px;\n  	height: 18px;\n  	margin: 3px;\n}\n\n.colorwaysFeatureIconContainer {\n  	padding: 16px;\n  	background-color: #0a0a0a;\n  	border-radius: 100%;\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	width: fit-content;\n  	margin: 0 32px;\n}\n\n.colorwaysFeatureIconLabel {\n  	text-align: center;\n  	height: fit-content;\n  	padding-top: 16px;\n}\n\n.colorwaysFeaturePresent {\n  	display: grid;\n  	grid-template-columns: repeat(3, 144px);\n  	grid-template-rows: repeat(2, 1fr);\n  	justify-content: space-evenly;\n  	height: fit-content;\n  	min-height: unset;\n  	align-items: center;\n}\n\n.saturation-white {\n  	background: -webkit-linear-gradient(to right, #fff, rgba(255,255,255,0));\n  	background: linear-gradient(to right, #fff, rgba(255,255,255,0));\n}\n\n.saturation-black {\n  	background: -webkit-linear-gradient(to top, #000, rgba(0,0,0,0));\n  	background: linear-gradient(to top, #000, rgba(0,0,0,0));\n}\n\n.hue-horizontal {\n  	background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0\n  		33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n  	background: -webkit-linear-gradient(to right, #f00 0%, #ff0\n  		17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n}\n\n.hue-vertical {\n  	background: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%,\n  		#0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n  	background: -webkit-linear-gradient(to top, #f00 0%, #ff0 17%,\n  		#0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n}\n\n.colorwaysSaveAsSwatch {\n  	width: 50px;\n  	height: 50px;\n  	border: none;\n  	position: relative;\n  	border-radius: 0;\n  	cursor: pointer;\n}\n\n.colorwayCustomColorpicker {\n  	display: flex;\n  	flex-direction: column;\n  	width: 220px;\n  	padding: 16px;\n  	gap: 16px;\n  	border: 1px solid var(--border-subtle);\n  	background-color: var(--background-primary);\n  	border-radius: 4px;\n  	box-shadow: var(--elevation-high);\n}\n\n.colorwayCustomColorpicker-suggestedColor {\n  	width: 32px;\n  	height: 32px;\n  	border-radius: 4px;\n  	cursor: pointer;\n  	border: 1px solid var(--primary-400);\n}\n\n.colorwayCustomColorpicker-suggestedColors {\n  	display: flex;\n  	justify-content: center;\n  	flex-wrap: wrap;\n  	gap: 12px;\n}\n\n.colorwayCustomColorpicker-inputContainer {\n  	display: flex;\n  	align-items: center;\n  	gap: 12px;\n}\n\n.colorwayCustomColorpicker-eyeDropper {\n  	display: flex;\n  	align-items: center;\n  	justify-content: center;\n  	cursor: pointer;\n  	width: 16px;\n  	height: 16px;\n  	margin: 0;\n}\n\n.colorwayCustomColorpicker-inputWrapper {\n  	display: flex;\n  	flex-direction: column;\n  	flex: 1;\n}\n\n.colorwaysDoubleSetting {\n  	display: flex;\n  	flex-direction: row;\n}\n\n.colour-input {\n  	width: 100%;\n  	height: 100%;\n  	cursor: pointer;\n  	transition: 0ms;\n}\n\n.dc-discordsettings-itm {\n  	padding: 6px 10px;\n  	border-radius: 4px;\n  	color: var(--interactive-normal);\n  	position: relative;\n  	font-size: 16px;\n  	line-height: 20px;\n  	cursor: pointer;\n  	font-weight: 500;\n  	white-space: nowrap;\n  	text-overflow: ellipsis;\n  	overflow: hidden;\n  	flex-shrink: 0;\n}\n\n.dc-discordsettings-itm:hover {\n  	background-color: var(--background-modifier-hover);\n}\n\n.visual-refresh .dc-discordsettings-itm {\n  	transition: background-color.3s ease;\n}\n\n.visual-refresh .dc-discordsettings-itm:hover {\n  	background-color: var(--button-secondary-background-hover);\n}\n\n.dc-discordsettings-itm .dc-label-Settings {\n  	font-family: var(--font-display);\n  	font-size: 12px;\n  	line-height: 1.3333;\n  	font-weight: 700;\n  	text-transform: uppercase;\n  	letter-spacing: .02em;\n  	color: var(--channels-default);\n}\n\n.dc-circle-selection {\n  	box-sizing: border-box;\n  	border-radius: 50%;\n  	width: calc(100% + 4px);\n  	height: calc(100% + 4px);\n  	position: absolute;\n  	top: -2px;\n  	left: -2px;\n  	cursor: default;\n  	pointer-events: none;\n  	box-shadow: inset 0 0 0 2px var(--brand-500),inset 0 0 0 4px var(--background-primary);\n}\n\n.dc-circle-selection-check {\n  	position: absolute;\n  	right: 0;\n}\n\n.dc-color-swatch-selectable {\n  	box-sizing: border-box;\n  	position: relative;\n  	height: 60px;\n  	width: 60px;\n  	cursor: pointer;\n}\n\n.dc-color-swatch-selectable > .dc-color-swatch {\n  	height: 60px;\n  	width: 60px;\n}\n\n.dc-changelog-title {\n  	font-weight: 700;\n  	font-size: 16px;\n  	line-height: 20px;\n  	text-transform: uppercase;\n  	display: flex;\n  	align-items: center;\n  	margin-top: 40px;\n}\n\n.dc-changelog-title::after {\n  	content: \"\";\n  	height: 1px;\n  	flex: 1 1 auto;\n  	margin-left: 4px;\n  	opacity: .6;\n}\n\n.dc-changelog-title-improved {\n  	color: var(--text-brand);\n}\n\n.dc-changelog-title-improved::after {\n  	background-color: var(--text-brand);\n}\n\n.dc-changelog-title-added {\n  	color: var(--text-positive);\n}\n\n.dc-changelog-title-added::after {\n  	background-color: var(--text-positive);\n}\n\n.dc-changelog-title-fixed {\n  	color: var(--text-danger);\n}\n\n.dc-changelog-title-fixed::after {\n  	background-color: var(--text-danger);\n}\n\n.dc-changelog-title-progress {\n  	color: var(--text-warning);\n}\n\n.dc-changelog-title-progress::after {\n  	background-color: var(--text-warning);\n}\n\n.dc-changes-list {\n  	margin: 20px 0 8px 20px;\n}\n\n.dc-change {\n  	position: relative;\n  	list-style: none;\n  	margin-bottom: 8px;\n  	-webkit-user-select: text;\n  	-moz-user-select: text;\n  	user-select: text;\n}\n\n.dc-change::before {\n  	content: \"\";\n  	position: absolute;\n  	top: 10px;\n  	left: -15px;\n  	width: 6px;\n  	height: 6px;\n  	margin-top: -4px;\n  	margin-left: -3px;\n  	border-radius: 50%;\n  	opacity: .3;\n}\n\n.theme-dark .dc-change::before {\n  	background-color: #e3e5e8;\n}\n\n@supports (color:rgba(0,0,0,0))and (top:var(--f)) {\n  	.theme-dark .dc-change::before {\n  			background-color: hsl(216deg calc(9.8%* 1) 90%);\n  	}\n}\n\n.theme-light .dc-change::before {\n  	background-color: #80848e;\n}\n\n@supports (color:rgba(0,0,0,0))and (top:var(--f)) {\n  	.theme-light .dc-change::before {\n  			background-color: hsl(223deg calc(5.8%* 1)52.9%);\n  	}\n}\n\n.dc-footer-social-link {\n  	margin-right: 16px;\n  	color: var(--text-link);\n  	text-decoration: var(--link-decoration);\n}\n\n.theme-dark .dc-footer-social-link {\n  	color: var(--primary-300);\n}\n\n.theme-light .dc-footer-social-link {\n  	color: var(--black-500);\n}\n\n.dc-footer-note {\n  	font-family: var(--font-primary);\n  	font-size: 12px;\n  	line-height: 1.3333;\n  	font-weight: 400;\n  	color: var(--text-normal);\n}\n\n.dc-modal-header-subtitle {\n  	font-family: var(--font-primary);\n  	font-size: 12px;\n  	line-height: 1.3333;\n  	font-weight: 400;\n  	color: var(--text-normal);\n}\n\n.theme-dark .dc-changelog-desc,\n.theme-dark .dc-change {\n  	color: #c4c9ce;\n}\n\n@supports (color:rgba(0,0,0,0))and (top:var(--f)) {\n  	.theme-dark .dc-changelog-desc,\n  	.theme-dark .dc-change {\n  			color: hsl(210deg calc(9.3%* 1)78.8%);\n  	}\n}\n\n.theme-ight .dc-changelog-desc,\n.theme-light .dc-change {\n  	color: #80848e;\n}\n\n@supports (color:rgba(0,0,0,0))and (top:var(--f)) {\n  	.theme-ight .dc-changelog-desc,\n  	.theme-light .dc-change  {\n  			color: hsl(223deg calc(5.8%* 1)52.9%);\n  	}\n}\n\n.dc-select-popout {\n  	position: absolute;\n  	min-height: 0;\n  	flex: 1 1 auto;\n  	box-sizing: border-box;\n  	border: 1px solid var(--background-tertiary);\n  	background: var(--background-secondary);\n  	border-radius: 0 0 4px 4px;\n  	overflow: hidden scroll;\n  	scrollbar-width: none;\n  	top: 36px;\n  	left: 0;\n  	z-index: 10000;\n}\n\n.dc-select-option {\n  	padding: 12px;\n  	cursor: pointer;\n  	color: var(--interactive-normal);\n  	display: grid;\n  	grid-template-columns: 1fr auto;\n  	align-items: center;\n  	font-weight: 500;\n  	box-sizing: border-box;\n}\n\n.dc-select-option[aria-selected=\"true\"] {\n  	color: var(--interactive-active);\n  	background-color: var(--background-modifier-selected);\n}\n\n.dc-select-selected {\n  	display: flex;\n  	align-items: center;\n  	gap: 8px;\n  	text-overflow: ellipsis;\n  	white-space: nowrap;\n  	overflow: hidden;\n}\n\n.dc-select-caret {\n  	display: flex;\n  	align-items: center;\n  	gap: 4px;\n}\n\n.dc-select {\n  	background-color: var(--input-background);\n  	color: var(--text-normal);\n  	font-weight: 500;\n  	border: 1px solid var(--input-background);\n  	padding: 8px 8px 8px 12px;\n  	cursor: pointer;\n  	box-sizing: border-box;\n  	display: grid;\n  	grid-template-columns: 1fr auto;\n  	align-items: center;\n  	border-radius: 4px;\n  	position: relative;\n}\n";

const css$1 = "/* stylelint-disable color-function-notation */\n/* stylelint-disable custom-property-pattern */\n/* stylelint-disable no-descending-specificity */\n.dc-app-root[data-theme=\"discord\"] {\n  	background-color: var(--modal-background);\n}\n\n[data-theme=\"discord\"] .dc-divider {\n  	border-color: var(--background-modifier-accent);\n}\n\n[data-theme=\"discord\"] .dc-switch-thumb {\n  	fill: #fff !important;\n}\n\n[data-theme=\"discord\"] .dc-switch {\n  	background-color: rgb(128 132 142);\n}\n\n[data-theme=\"discord\"] .dc-switch.checked {\n  	background-color: #23a55a;\n}\n\n[data-theme=\"discord\"] .dc-button {\n  	transition:\n  			background-color var(--custom-button-transition-duration) ease,\n  			color var(--custom-button-transition-duration) ease;\n  	position: relative;\n  	display: flex;\n  	justify-content: center;\n  	align-items: center;\n  	box-sizing: border-box;\n  	border: none;\n  	border-radius: 3px;\n  	font-size: 14px;\n  	font-weight: 500;\n  	line-height: 16px;\n  	padding: 2px 16px;\n  	user-select: none;\n}\n\n[data-theme=\"discord\"] .dc-button.dc-button-icon {\n  	padding: 4px;\n}\n\n[data-theme=\"discord\"] > .dc-app-sidebar {\n  	background-color: var(--background-tertiary);\n  	box-shadow: inset 0 1px 0 hsl(var(--primary-630-hsl) / 60%);\n  	padding: 12px;\n  	border-radius: 4px;\n}\n\n.theme-light [data-theme=\"discord\"] > .dc-app-sidebar {\n  	box-shadow: inset 0 1px 0 hsl(var(--primary-100-hsl) / 60%);\n}\n\n[data-theme=\"discord\"] .dc-textbox {\n  	border-radius: 3px;\n  	color: var(--text-normal);\n  	background-color: var(--input-background);\n  	height: 40px;\n  	padding: 10px;\n  	transition: none;\n  	font-size: 16px;\n  	border: none;\n}\n\n[data-theme=\"discord\"] .dc-colorway {\n  	border-radius: 4px;\n  	background-color: var(--background-secondary);\n  	border: none;\n  	color: var(--header-primary);\n  	transition:\n  			background-color 0.1s ease-in-out,\n  			border-color 0.1s ease-in-out;\n}\n\n[data-theme=\"discord\"] .dc-colorway:hover,\n[data-theme=\"discord\"] .dc-colorway:focus {\n  	filter: none;\n  	background-color: var(--background-modifier-hover);\n}\n\n[data-theme=\"discord\"] .dc-colorway[aria-checked=\"true\"] {\n  	background-color: var(--background-modifier-selected);\n}\n\n[data-theme=\"discord\"] .dc-colorway[aria-invalid=\"true\"] {\n  	background-color: var(--button-danger-background);\n}\n\n[data-theme=\"discord\"] .dc-colorway[aria-invalid=\"true\"]:hover {\n  	background-color: var(--button-danger-background-hover);\n}\n\n[data-theme=\"discord\"] .dc-colorway[aria-invalid=\"true\"]:active {\n  	background-color: var(--button-danger-background-active);\n}\n\n[data-theme=\"discord\"] .dc-badge {\n  	height: 16px;\n  	padding: 0 4px;\n  	border-radius: 4px;\n  	flex: 0 0 auto;\n  	background: var(--bg-brand);\n  	color: var(--white);\n  	text-transform: uppercase;\n  	vertical-align: top;\n  	display: inline-flex;\n  	align-items: start;\n  	text-indent: 0;\n  	font-weight: 600;\n  	font-size: 12px;\n  	line-height: 12px;\n}\n\n.dc-modal[data-theme=\"discord\"] {\n  	box-shadow: var(--legacy-elevation-border), var(--legacy-elevation-high);\n  	background-color: var(--modal-background);\n  	border-radius: 4px;\n  	display: flex;\n  	flex-direction: column;\n  	margin: 0 auto;\n  	pointer-events: all;\n  	position: relative;\n}\n\n[data-theme=\"discord\"] .dc-menu-tabs {\n  	padding-bottom: 16px;\n}\n\n[data-theme=\"discord\"] .dc-menu-tab {\n  	padding: 0;\n  	padding-bottom: 16px;\n  	margin-right: 32px;\n  	margin-bottom: -2px;\n  	border-bottom: 2px solid transparent;\n  	transition: none;\n  	border-radius: 0;\n  	background-color: transparent !important;\n  	font-size: 16px;\n  	line-height: 20px;\n  	cursor: pointer;\n  	font-weight: 500;\n}\n\n[data-theme=\"discord\"] .dc-menu-tab:hover {\n  	color: var(--interactive-hover);\n  	border-bottom-color: var(--brand-500);\n}\n\n[data-theme=\"discord\"] .dc-menu-tab.active {\n  	cursor: default;\n  	color: var(--interactive-active);\n  	border-bottom-color: var(--control-brand-foreground);\n}\n\n[data-theme=\"discord\"] .dc-modal-footer {\n  	border-radius: 0 0 5px 5px;\n  	background-color: var(--modal-footer-background);\n  	padding: 16px;\n  	box-shadow: inset 0 1px 0 hsl(var(--primary-630-hsl) / 60%);\n  	gap: 0;\n  	margin: 0;\n  	width: 100%;\n  	box-sizing: border-box;\n}\n\n.theme-light [data-theme=\"discord\"] > .dc-modal-footer {\n  	box-shadow: inset 0 1px 0 hsl(var(--primary-100-hsl) / 60%);\n}\n\n[data-theme=\"discord\"] .dc-modal-footer > .dc-button {\n  	margin-left: 8px;\n}\n\n[data-theme=\"discord\"] .dc-modal-header {\n  	box-shadow:\n  			0 1px 0 0 hsl(var(--primary-800-hsl) / 30%),\n  			0 1px 2px 0 hsl(var(--primary-800-hsl) / 30%);\n  	border-radius: 4px 4px 0 0;\n  	transition: box-shadow 0.1s ease-out;\n  	word-wrap: break-word;\n  	font-family: var(--font-display);\n  	font-size: 20px;\n  	line-height: 1.2;\n  	font-weight: 600;\n}\n\n.theme-light [data-theme=\"discord\"] .dc-modal-header {\n  	box-shadow: 0 1px 0 0 hsl(var(--primary-300-hsl)/ 30%);\n}\n\n[data-theme=\"discord\"] .dc-contextmenu,\n.dc-contextmenu[data-theme=\"discord\"] {\n  	background: var(--background-floating);\n  	box-shadow: var(--shadow-high);\n  	border-radius: 4px;\n  	padding: 6px 8px;\n  	border: none;\n  	gap: 0;\n  	min-width: 188px;\n  	max-width: 320px;\n  	box-sizing: border-box;\n}\n\n[data-theme=\"discord\"] .dc-contextmenu-item {\n  	border: none;\n  	transition: none;\n  	margin: 2px 0;\n  	border-radius: 2px;\n  	font-size: 14px;\n  	font-weight: 500;\n  	line-height: 18px;\n  	color: var(--interactive-normal);\n  	background-color: transparent;\n}\n\n[data-theme=\"discord\"] .dc-contextmenu-item:hover {\n  	background-color: var(--menu-item-default-hover-bg);\n  	color: var(--white);\n}\n\n[data-theme=\"discord\"] .dc-contextmenu-item:active {\n  	background-color: var(--menu-item-default-active-bg);\n  	color: var(--white);\n}\n\n[data-theme=\"discord\"] .dc-radio-selected {\n  	fill: var(--control-brand-foreground-new);\n}\n\n[data-theme=\"discord\"] .dc-page-header {\n  	border-radius: 0;\n  	border-top-right-radius: 4px;\n  	padding: 0;\n  	margin: 0;\n  	background-color: transparent;\n}\n\n[data-theme=\"discord\"] .dc-contextmenu-item-danger {\n  	color: var(--status-danger);\n}\n\n[data-theme=\"discord\"] .dc-contextmenu-item-danger:hover {\n  	background-color: var(--menu-item-danger-hover-bg);\n  	color: var(--white);\n}\n\n[data-theme=\"discord\"] .dc-contextmenu-item:hover > svg {\n  	color: var(--white);\n}\n\n[data-theme=\"discord\"] .dc-contextmenu-color {\n  	border-radius: 4px;\n}\n\n.dc-radio-redesign {\n  	box-sizing: border-box;\n  	width: 20px;\n  	height: 20px;\n  	border-radius: 50%;\n  	background: transparent;\n  	display: none;\n}\n\n[data-theme=\"discord\"] .dc-field-header {\n  	font-family: var(--font-display);\n  	font-size: 12px;\n  	line-height: 1.3333;\n  	font-weight: 700;\n  	text-transform: uppercase;\n  	letter-spacing: .02em;\n  	color: var(--header-secondary);\n}\n\n[data-theme=\"discord\"] .dc-field-header-error {\n  	color: var(--text-danger);\n}\n\n[data-theme=\"discord\"] .colorwaysFeatureIconContainer {\n  	background-color: var(--modal-footer-background);\n}\n\n[data-theme=\"discord\"] .dc-button.dc-button-primary,\n[data-theme=\"discord\"] .dc-button.dc-button-secondary {\n  	border-color: var(--button-secondary-background);\n  	color: var(--button-outline-primary-text);\n}\n\n[data-theme=\"discord\"] .dc-button:not(.dc-button-outlined).dc-button-primary,\n[data-theme=\"discord\"] .dc-button:not(.dc-button-outlined).dc-button-secondary {\n  	background-color: var(--button-secondary-background);\n  	color: var(--white-500);\n}\n\n[data-theme=\"discord\"] .dc-button.dc-button-primary:hover,\n[data-theme=\"discord\"] .dc-button.dc-button-secondary:hover {\n  	background-color: var(--button-secondary-background-hover);\n  	border-color: var(--button-secondary-background-hover);\n  	color: var(--button-outline-primary-text-hover);\n}\n\n[data-theme=\"discord\"] .dc-button.dc-button-primary:active,\n[data-theme=\"discord\"] .dc-button.dc-button-secondary:active {\n  	background-color: var(--button-secondary-background-active);\n  	border-color: var(--button-secondary-background-active);\n  	color: var(--button-outline-primary-text-active);\n}\n\n[data-theme=\"discord\"] .dc-button.dc-button-brand {\n  	color: var(--button-outline-brand-text);\n  	border-color: var(--brand-500);\n}\n\n[data-theme=\"discord\"] .dc-button:not(.dc-button-outlined).dc-button-brand {\n  	color: var(--white-500);\n  	background-color: var(--brand-500);\n}\n\n[data-theme=\"discord\"] .dc-button.dc-button-brand:hover {\n  	background-color: var(--brand-560);\n  	border-color: var(--brand-560);\n}\n\n[data-theme=\"discord\"] .dc-button.dc-button-brand:active {\n  	background-color: var(--brand-600);\n  	border-color: var(--brand-600);\n}\n\n[data-theme=\"discord\"] .dc-button.dc-button-danger {\n  	color: var(--button-outline-danger-text);\n  	border-color: var(--button-danger-background);\n}\n\n[data-theme=\"discord\"] .dc-button:not(.dc-button-outlined).dc-button-danger {\n  	color: var(--white-500);\n  	background-color: var(--button-danger-background);\n}\n\n[data-theme=\"discord\"] .dc-button.dc-button-danger:hover {\n  	background-color: var(--button-danger-background-hover);\n  	border-color: var(--button-danger-background-hover);\n}\n\n[data-theme=\"discord\"] .dc-button.dc-button-danger:active {\n  	background-color: var(--button-danger-background-active);\n  	border-color: var(--button-danger-background-active);\n}\n\n[data-theme=\"discord\"] .dc-codeblock {\n  	background-color: var(--input-background);\n  	border-radius: 3px;\n  	padding: 10px;\n  	border: none;\n}\n\n[data-theme=\"discord\"] .dc-select-popout {\n  	min-height: 0;\n  	flex: 1 1 auto;\n  	box-sizing: border-box;\n  	border: 1px solid var(--background-tertiary);\n  	background: var(--background-secondary);\n  	border-radius: 0 0 4px 4px;\n}\n\n[data-theme=\"discord\"] .dc-select-option {\n  	padding: 12px;\n  	cursor: pointer;\n  	color: var(--interactive-normal);\n  	display: grid;\n  	grid-template-columns: 1fr auto;\n  	align-items: center;\n  	font-weight: 500;\n  	box-sizing: border-box;\n}\n\n[data-theme=\"discord\"] .dc-select-option[aria-selected=\"true\"] {\n  	color: var(--interactive-active);\n  	background-color: var(--background-modifier-selected);\n}\n";

const css = "[data-theme=\"discord-vr\"] .dc-switch {\n  	height: 28px;\n  	border-radius: 16px;\n  	width: 44px;\n  	box-sizing: border-box;\n  	border: 1px solid transparent;\n}\n\n[data-theme=\"discord-vr\"] .dc-button {\n  	border-radius: 8px;\n  	transition-duration: .3s;\n}\n\n[data-theme=\"discord-vr\"] .dc-button.dc-button-primary,\n[data-theme=\"discord-vr\"] .dc-button.dc-button-secondary {\n  	border-color: var(--button-secondary-background);\n  	color: var(--button-outline-primary-text);\n}\n\n[data-theme=\"discord-vr\"] .dc-button:not(.dc-button-outlined).dc-button-primary,\n[data-theme=\"discord-vr\"] .dc-button:not(.dc-button-outlined).dc-button-secondary {\n  	background-color: var(--button-secondary-background);\n  	color: var(--white-500);\n}\n\n[data-theme=\"discord-vr\"] .dc-button.dc-button-primary:hover,\n[data-theme=\"discord-vr\"] .dc-button.dc-button-secondary:hover {\n  	background-color: var(--button-secondary-background-hover);\n  	border-color: var(--button-secondary-background-hover);\n  	color: var(--button-outline-primary-text-hover);\n}\n\n[data-theme=\"discord-vr\"] .dc-button.dc-button-primary:active,\n[data-theme=\"discord-vr\"] .dc-button.dc-button-secondary:active {\n  	background-color: var(--button-secondary-background-active);\n  	border-color: var(--button-secondary-background-active);\n  	color: var(--button-outline-primary-text-active);\n}\n\n[data-theme=\"discord-vr\"] .dc-button.dc-button-brand {\n  	color: var(--button-outline-brand-text);\n  	border-color: var(--brand-500);\n}\n\n[data-theme=\"discord-vr\"] .dc-button:not(.dc-button-outlined).dc-button-brand {\n  	color: var(--white-500);\n  	background-color: var(--brand-500);\n}\n\n[data-theme=\"discord-vr\"] .dc-button.dc-button-brand:hover {\n  	background-color: var(--brand-560);\n  	border-color: var(--brand-560);\n}\n\n[data-theme=\"discord-vr\"] .dc-button.dc-button-brand:active {\n  	background-color: var(--brand-600);\n  	border-color: var(--brand-600);\n}\n\n[data-theme=\"discord-vr\"] .dc-button.dc-button-danger {\n  	color: var(--button-outline-danger-text);\n  	border-color: var(--button-danger-background);\n}\n\n[data-theme=\"discord-vr\"] .dc-button:not(.dc-button-outlined).dc-button-danger {\n  	color: var(--white-500);\n  	background-color: var(--button-danger-background);\n}\n\n[data-theme=\"discord-vr\"] .dc-button.dc-button-danger:hover {\n  	background-color: var(--button-danger-background-hover);\n  	border-color: var(--button-danger-background-hover);\n}\n\n[data-theme=\"discord-vr\"] .dc-button.dc-button-danger:active {\n  	background-color: var(--button-danger-background-active);\n  	border-color: var(--button-danger-background-active);\n}\n\n[data-theme=\"discord-vr\"] .dc-switch.checked {\n  	border-color: var(--input-border);\n  	background-color: var(--brand-500);\n}\n\n[data-theme=\"discord-vr\"] .dc-switch-handle {\n  	display: block;\n  	position: absolute;\n  	left: 0;\n  	width: 28px;\n  	height: 20px;\n  	margin: 3px;\n}\n\n[data-theme=\"discord-vr\"] .dc-radio-redesign {\n  	display: inline;\n}\n\n[data-theme=\"discord-vr\"] .dc-radio {\n  	display: none;\n}\n\n[data-theme=\"discord-vr\"] .dc-menu-caret {\n  	width: 20px;\n  	height: 20px;\n}\n\n[data-theme=\"discord-vr\"] .dc-modal-content {\n  	padding: var(--spacing-24);\n}\n\n[data-theme=\"discord-vr\"] .dc-modal-footer {\n  	border-radius: 0 0 5px 5px;\n  	padding: 16px;\n  	gap: 0;\n  	margin: 0;\n  	width: 100%;\n  	box-sizing: border-box;\n  	padding-left: var(--spacing-24);\n  	padding-right: var(--spacing-24);\n  	padding-top: 0;\n  	background: none;\n  	box-shadow: none;\n}\n\n[data-theme=\"discord-vr\"] .dc-modal-header {\n  	border-radius: 4px 4px 0 0;\n  	word-wrap: break-word;\n  	font-family: var(--font-display);\n  	font-size: 20px;\n  	line-height: 1.2;\n  	font-weight: 600;\n  	box-shadow: none;\n  	padding-bottom: 0;\n}\n\n[data-theme=\"discord-vr\"] .dc-modal-footer > .dc-button {\n  	margin-left: 8px;\n}\n\n.dc-modal[data-theme=\"discord-vr\"] {\n  	background-color: var(--bg-base-primary);\n  	border-radius: var(--radius-md);\n  	border: 1px solid var(--border-subtle);\n}\n\n[data-theme=\"discord-vr\"] .dc-field-header {\n  	color: var(--header-primary);\n  	font-size: 16px;\n  	line-height: 20px;\n  	font-weight: 500;\n  	margin-bottom: 8px;\n  	text-transform: capitalize;\n}\n\n[data-theme=\"discord-vr\"] .dc-switch-thumb {\n  	fill: #fff !important;\n}\n\n[data-theme=\"discord-vr\"] .dc-contextmenu,\n.dc-contextmenu[data-theme=\"discord-vr\"] {\n  	background: var(--background-floating);\n  	padding: 6px 8px;\n  	gap: 0;\n  	min-width: 188px;\n  	max-width: 320px;\n  	box-sizing: border-box;\n  	background-color: var(--background-surface-higher);\n  	border-radius: 8px;\n  	border: 1px solid var(--border-subtle);\n  	box-shadow: var(--shadow-high);\n}\n\n[data-theme=\"discord-vr\"] .dc-contextmenu-item {\n  	border: none;\n  	transition: none;\n  	font-size: 14px;\n  	font-weight: 500;\n  	line-height: 18px;\n  	color: var(--interactive-normal);\n  	background-color: transparent;\n  	border-radius: 4px;\n  	margin: 0;\n  	padding: 8px;\n}\n\n[data-theme=\"discord-vr\"] .dc-contextmenu-item:hover,\n[data-theme=\"discord-vr\"] .dc-contextmenu-item:active {\n  	background-color: var(--bg-mod-subtle);\n  	color: var(--header-primary);\n}\n\n[data-theme=\"discord-vr\"] .dc-contextmenu-item-danger {\n  	color: var(--text-danger);\n}\n\n[data-theme=\"discord-vr\"] .dc-contextmenu-item-danger:hover {\n  	background-color: var(--info-danger-background);\n  	color: var(--text-danger);\n}\n\n[data-theme=\"discord-vr\"] .dc-contextmenu-item > svg {\n  	width: 20px;\n  	height: 20px;\n}\n\n[data-theme=\"discord-vr\"] .dc-contextmenu-color {\n  	border-radius: 8px;\n}\n\n.dc-app-root[data-theme=\"discord-vr\"] {\n  	background-color: var(--bg-base-primary);\n}\n\n.dc-app-root[data-theme=\"discord-vr\"] > .dc-app-sidebar {\n  	border-radius: var(--radius-md);\n  	background: var(--bg-overlay-3,var(--bg-base-secondary));\n  	border: 1px solid rgba(255 255 255 / 10%);\n  	padding: 8px;\n}\n\n[data-theme=\"discord-vr\"] .dc-colorway {\n  	background: var(--bg-mod-faint);\n  	border-radius: 8px;\n  	border: 1px solid rgba(255 255 255 / 10%) !important;\n  	transition:\n  			background-color 0.1s ease-in-out,\n  			border-color 0.1s ease-in-out;\n}\n\n[data-theme=\"discord-vr\"] .dc-colorway:hover,\n[data-theme=\"discord-vr\"] .dc-colorway:focus {\n  	background: var(--bg-mod-subtle);\n}\n\n[data-theme=\"discord-vr\"] .dc-colorway[aria-checked=\"true\"] {\n  	border-color: var(--border-faint);\n  	background: var(--bg-mod-strong);\n}\n\n[data-theme=\"discord-vr\"] .dc-colorway[aria-invalid=\"true\"] {\n  	background-color: var(--button-danger-background);\n  	border-color: var(--button-outline-danger-text);\n}\n\n[data-theme=\"discord-vr\"] .dc-colorway[aria-invalid=\"true\"]:hover {\n  	background-color: var(--button-danger-background-hover);\n}\n\n[data-theme=\"discord-vr\"] .dc-colorway[aria-invalid=\"true\"]:active {\n  	background-color: var(--button-danger-background-active);\n}\n\n[data-theme=\"discord-vr\"] .dc-textbox {\n  	background: rgba(0 0 0 / 8%);\n  	border-radius: 8px;\n  	border: 1px solid var(--input-border);\n}\n\n[data-theme=\"discord-vr\"] .dc-codeblock {\n  	background: rgba(0 0 0 / 8%);\n  	border-radius: 8px;\n  	border: 1px solid var(--input-border);\n}\n\n[data-theme=\"discord-vr\"] .dc-textbox:focus,\n[data-theme=\"discord-vr\"] .dc-textbox:has(:focus),\n[data-theme=\"discord-vr\"] .dc-codeblock:focus {\n  	border-color: var(--text-link);\n}\n\n[data-theme=\"discord-vr\"] .dc-button:not(.dc-button-outlined) {\n  	border: 1px solid rgba(255 255 255 / 10%);\n}\n\n[data-theme=\"discord-vr\"] .dc-page-header {\n  	border-radius: 0;\n  	border-top-right-radius: 4px;\n  	padding: 0;\n  	margin: 0;\n  	background-color: transparent;\n}\n\n[data-theme=\"discord-vr\"] .dc-menu-tabs {\n  	padding-bottom: 16px;\n}\n\n[data-theme=\"discord-vr\"] .dc-menu-tab {\n  	padding: 0;\n  	padding-bottom: 16px;\n  	margin-right: 32px;\n  	margin-bottom: -2px;\n  	border-bottom: 2px solid transparent;\n  	transition: none;\n  	border-radius: 0;\n  	background-color: transparent !important;\n  	font-size: 16px;\n  	line-height: 20px;\n  	cursor: pointer;\n  	font-weight: 500;\n}\n\n[data-theme=\"discord-vr\"] .dc-menu-tab:hover {\n  	color: var(--interactive-hover);\n  	border-bottom-color: var(--brand-500);\n}\n\n[data-theme=\"discord-vr\"] .dc-menu-tab.active {\n  	cursor: default;\n  	color: var(--interactive-active);\n  	border-bottom-color: var(--control-brand-foreground);\n}\n\n[data-theme=\"discord-vr\"] .dc-divider {\n  	border-color: var(--background-modifier-accent);\n}\n\n[data-theme=\"discord-vr\"] .dc-select-popout {\n  	min-height: 0;\n  	flex: 1 1 auto;\n  	box-sizing: border-box;\n  	border: 1px solid var(--background-tertiary);\n  	background: var(--background-secondary);\n  	border-radius: 0 0 4px 4px;\n}\n\n[data-theme=\"discord-vr\"] .dc-select-option {\n  	padding: 12px;\n  	cursor: pointer;\n  	color: var(--interactive-normal);\n  	display: grid;\n  	grid-template-columns: 1fr auto;\n  	align-items: center;\n  	font-weight: 500;\n  	box-sizing: border-box;\n}\n\n[data-theme=\"discord-vr\"] .dc-select-option[aria-selected=\"true\"] {\n  	color: var(--interactive-active);\n  	background-color: var(--background-modifier-selected);\n}\n";

var Tabs = ((Tabs2) => {
	Tabs2[Tabs2["Selector"] = 0] = "Selector";
	Tabs2[Tabs2["Settings"] = 1] = "Settings";
	Tabs2[Tabs2["Sources"] = 2] = "Sources";
	Tabs2[Tabs2["WsConnection"] = 3] = "WsConnection";
	Tabs2[Tabs2["ExpandSidebar"] = 4] = "ExpandSidebar";
	return Tabs2;
})(Tabs || {});
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
var SourceActions = ((SourceActions2) => {
	SourceActions2[SourceActions2["AddColorway"] = 0] = "AddColorway";
	SourceActions2[SourceActions2["RemoveColorway"] = 1] = "RemoveColorway";
	SourceActions2[SourceActions2["AddPreset"] = 2] = "AddPreset";
	SourceActions2[SourceActions2["RemovePreset"] = 3] = "RemovePreset";
	return SourceActions2;
})(SourceActions || {});

function RightClickContextMenu({
	children,
	menu
}) {
	const theme = Hooks.useTheme();
	function Menu() {
		useEffect(() => {
			window.addEventListener("click", () => FluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" }));
			return () => {
				window.removeEventListener("click", () => FluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" }));
			};
		}, []);
		return BdApi.React.createElement("nav", { "data-theme": theme, className: "dc-contextmenu" }, menu);
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
function generateCss(colors, tintedText = true, discordSaturation = true, mutedTextBrightness, name) {
	colors.primary ??= "#313338";
	colors.secondary ??= "#2b2d31";
	colors.tertiary ??= "#1e1f22";
	colors.accent ??= "#ffffff";
	const primaryColor = colors.primary.replace("#", "");
	const secondaryColor = colors.secondary.replace("#", "");
	const tertiaryColor = colors.tertiary.replace("#", "");
	const accentColor = colors.accent.replace("#", "");
	return `:root:root {
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
				accent: "#" + accentColor,
				primary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 11% 21%)`),
				secondary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 11% 18%)`),
				tertiary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 10% 13%)`)
			}
		},
		accentSwap: {
			name: "Accent Swap",
			id: "accentSwap",
			colors: {
				accent: "#" + accentColor,
				primary: "#313338",
				secondary: "#2b2d31",
				tertiary: "#1e1f22"
			}
		},
		AMOLED: {
			name: "AMOLED",
			id: "AMOLED",
			colors: {
				accent: "#" + accentColor,
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

function Button$1(props) {
	return BdApi.React.createElement(
		"button",
		{
			className: `dc-button ${props.color ? "dc-button-" + props.color : ""} ${props.size ? "dc-button-" + props.size : ""} ${(props.props || []).map((prop) => "dc-button-" + prop).join(" ")}`,
			onClick: props.onClick
		},
		props.children
	);
}

function ColorwayItem(props) {
	return BdApi.React.createElement(RightClickContextMenu, { menu: props.menu }, ({ onContextMenu: ocm }) => BdApi.React.createElement(
		"div",
		{
			...props,
			className: "dc-colorway",
			role: "button",
			onContextMenu: (e) => {
				if (props.menu) ocm(e);
				props.onContextMenu && props.onContextMenu(e);
			}
		},
		props.colors ? BdApi.React.createElement("div", { className: "dc-color-swatch" }, props.colors.map((colorStr) => BdApi.React.createElement(
			"div",
			{
				className: "dc-color-swatch-part",
				style: {
					backgroundColor: `#${colorToHex(colorStr)}`
				}
			}
		))) : null,
		BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label" }, props.text), props.descriptions ? BdApi.React.createElement("span", { className: "dc-label dc-subnote dc-note" }, props.descriptions.join(" \u2022 ")) : null),
		(props.actions || []).map((action) => BdApi.React.createElement(Button$1, { color: action.type, onClick: action.onClick }, BdApi.React.createElement(action.Icon, { width: 20, height: 20 })))
	));
}

function ComboTextBox({ value = "", onInput = () => {
}, placeholder = "", children = BdApi.React.createElement(BdApi.React.Fragment, null), disabled = false, readOnly = false, style = {} }) {
	return BdApi.React.createElement("div", { className: "dc-selector-header dc-textbox", style }, BdApi.React.createElement(
		"input",
		{
			type: "text",
			className: "dc-textbox",
			style: { paddingRight: "6px" },
			placeholder,
			disabled,
			readOnly,
			value,
			autoFocus: true,
			onInput: ({ currentTarget: { value: value2 } }) => onInput(value2)
		}
	), children);
}

function CPicker({ onChange, onClose, color, suggestedColors, showEyeDropper, children }) {
	const Form = exports.Forms;
	return BdApi.React.createElement(
		exports.Popout,
		{
			positionKey: crypto.randomUUID(),
			renderPopout: (e) => BdApi.React.createElement(
				Form.CustomColorPicker,
				{
					...e,
					value: parseClr(color),
					onChange: (color2) => onChange(color2),
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

function Setting({
	children,
	divider = false,
	disabled = false,
	style = {}
}) {
	return BdApi.React.createElement("div", { style: {
		display: "flex",
		flexDirection: "column",
		marginBottom: "20px",
		...style
	} }, disabled ? BdApi.React.createElement("div", { style: {
		pointerEvents: "none",
		opacity: 0.5,
		cursor: "not-allowed"
	} }, children) : children, divider && BdApi.React.createElement("div", { className: "dc-divider" }));
}

function Switch$1({
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
	} }, BdApi.React.createElement("label", { className: "dc-switch-label", htmlFor: id }, label), BdApi.React.createElement("div", { className: `dc-switch ${value ? "checked" : ""}` }, BdApi.React.createElement("svg", { viewBox: "0 0 28 20", preserveAspectRatio: "xMinYMid meet", "aria-hidden": "true", className: "dc-switch-handle", style: {
		left: value ? "12px" : "-3px"
	} }, BdApi.React.createElement("rect", { className: "dc-switch-thumb", fill: "#000", x: "4", y: "0", height: "20", width: "20", rx: "10" })), BdApi.React.createElement("input", { checked: value, id, type: "checkbox", style: {
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
	} }))) : BdApi.React.createElement("div", { className: `dc-switch ${value ? "checked" : ""}` }, BdApi.React.createElement("svg", { viewBox: "0 0 28 20", preserveAspectRatio: "xMinYMid meet", "aria-hidden": "true", style: {
		left: value ? "12px" : "-3px",
		transition: ".2s ease",
		display: "block",
		position: "absolute",
		width: "28px",
		height: "18px",
		margin: "3px"
	} }, BdApi.React.createElement("rect", { className: "dc-switch-thumb", fill: "#000", x: "4", y: "0", height: "20", width: "20", rx: "10" })), BdApi.React.createElement("input", { checked: value, id, type: "checkbox", style: {
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

function NewStoreModal({ modalProps, onOnline = () => {
}, onOffline, offlineOnly = false, name = "" }) {
	const [colorwaySourceName, setColorwaySourceName] = useState(name);
	const [colorwaySourceURL, setColorwaySourceURL] = useState("");
	const [nameError, setNameError] = useState("");
	const [URLError, setURLError] = useState("");
	const [nameReadOnly, setNameReadOnly] = useState(false);
	const [isOnline, setIsOnline] = useState(false);
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
			Switch$1,
			{
				label: "Online",
				id: "dc-is-new-source-online",
				value: isOnline,
				onChange: setIsOnline
			}
		), BdApi.React.createElement("span", { className: "dc-note" }, "Immutable, and always up-to-date")) : null,
		BdApi.React.createElement("span", { className: `dc-field-header${nameError ? " dc-field-header-error" : ""}`, style: { marginBottom: "4px", width: "100%" } }, "Name", nameError ? BdApi.React.createElement("span", { className: "dc-field-header-errormsg" }, BdApi.React.createElement("span", { className: "dc-field-header-errordiv" }, "-"), nameError) : BdApi.React.createElement(BdApi.React.Fragment, null)),
		BdApi.React.createElement(
			"input",
			{
				type: "text",
				className: "dc-textbox",
				placeholder: "Enter a valid Name...",
				onInput: (e) => setColorwaySourceName(e.currentTarget.value),
				value: colorwaySourceName,
				readOnly: nameReadOnly && isOnline && !offlineOnly,
				disabled: nameReadOnly && isOnline && !offlineOnly
			}
		),
		isOnline && !offlineOnly ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("span", { className: `dc-field-header${URLError ? " dc-field-header-error" : ""}`, style: { marginBottom: "4px", marginTop: "16px" } }, "URL", URLError ? BdApi.React.createElement("span", { className: "dc-field-header-errormsg" }, BdApi.React.createElement("span", { className: "dc-field-header-errordiv" }, "-"), URLError) : BdApi.React.createElement(BdApi.React.Fragment, null)), BdApi.React.createElement(
			"input",
			{
				type: "text",
				className: "dc-textbox",
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
	colorwayID: colorID,
	colorwayObject,
	store = ""
}) {
	const [colors, updateColors] = useReducer((colors2, action) => {
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
	const [offlineColorwayStores, setOfflineColorwayStores] = useContextualState("customColorways");
	const [colorwayName, setColorwayName] = useState(colorwayObject ? colorwayObject.id : "");
	const [noStoreError, setNoStoreError] = useState(false);
	const [duplicateError, setDuplicateError] = useState(false);
	const [storename, setStorename] = useState(store);
	const [colorwayID, setColorwayID] = useState(colorID);
	const [colorwayIDError, setColorwayIDError] = useState("");
	const setColor = [
		"accent",
		"primary",
		"secondary",
		"tertiary"
	];
	useEffect(() => {
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
				setDuplicateError(false);
				if (!storename && !store) {
					return setNoStoreError(true);
				}
				const customColorway = {
					name: colorwayName || "Colorway",
					accent: "#" + colors.accent,
					primary: "#" + colors.primary,
					secondary: "#" + colors.secondary,
					tertiary: "#" + colors.tertiary,
					author: exports.UserStore.getCurrentUser().username,
					authorID: exports.UserStore.getCurrentUser().id
				};
				if ((offlineColorwayStores.find((s) => s.name === storename).colorways || []).find((colorway) => colorway.name === customColorway.name) && !store) {
					return setDuplicateError(true);
				} else {
					setOfflineColorwayStores((stores) => stores.map((s) => {
						if (s.name === storename) {
							return { name: s.name, colorways: [...(s.colorways || []).filter((c) => c.name !== (colorwayObject || { id: "" }).id), customColorway], presets: s.presets || [] };
						}
						return s;
					}));
				}
				closeModal();
			},
			additionalButtons: [
				...!store ? [{
					text: "Create New Store...",
					type: "brand",
					action: () => openModal$1((props) => BdApi.React.createElement(
						NewStoreModal,
						{
							modalProps: props,
							offlineOnly: true,
							onOffline: async ({ name }) => {
								setOfflineColorwayStores((prev) => [...prev, { name, presets: [], colorways: [] }]);
							}
						}
					))
				}] : [],
				{
					text: "Copy Current Colors",
					type: "brand",
					action: () => {
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
				},
				{
					text: "Enter Colorway ID",
					type: "primary",
					action: () => openModal$1((props) => BdApi.React.createElement(
						Modal,
						{
							modalProps: props,
							onFinish: ({ closeModal }) => {
								setColorwayIDError("");
								if (!colorwayID) {
									return setColorwayIDError("Please enter a Colorway ID");
								} else if (!hexToString(colorwayID).includes(",")) {
									return setColorwayIDError("Invalid Colorway ID");
								} else {
									hexToString(colorwayID).split(/,#/).forEach((color, i) => updateColors({ task: setColor[i], color: colorToHex(color) }));
									setColorwayIDError("");
									closeModal();
								}
							},
							title: "Enter Colorway ID"
						},
						BdApi.React.createElement("span", { className: `dc-field-header${colorwayIDError ? " dc-field-header-error" : ""}`, style: { marginBottom: "4px" } }, "Colorway ID", colorwayIDError ? BdApi.React.createElement("span", { className: "dc-field-header-errormsg" }, BdApi.React.createElement("span", { className: "dc-field-header-errordiv" }, "-"), colorwayIDError) : null),
						BdApi.React.createElement(
							"input",
							{
								type: "text",
								className: "dc-textbox",
								placeholder: "Enter Colorway ID",
								onInput: ({ currentTarget: { value } }) => setColorwayID(value)
							}
						)
					))
				}
			]
		},
		BdApi.React.createElement("div", { style: { display: "flex", gap: "20px" } }, BdApi.React.createElement("div", { className: "dc-color-swatch", style: { width: "100px", height: "100px" } }, colorProps.map((presetColor) => {
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
		})), BdApi.React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px", width: "100%" } }, BdApi.React.createElement("span", { style: { marginTop: "8px" }, className: `dc-field-header${duplicateError ? " dc-field-header-error" : ""}` }, "Name", duplicateError ? BdApi.React.createElement("span", { className: "dc-field-header-errormsg" }, BdApi.React.createElement("span", { className: "dc-field-header-errordiv" }, "-"), "A colorway with this name already exists") : BdApi.React.createElement(BdApi.React.Fragment, null)), BdApi.React.createElement(
			"input",
			{
				type: "text",
				className: "dc-textbox",
				placeholder: "Give your Colorway a name",
				value: colorwayName,
				autoFocus: true,
				onInput: (e) => setColorwayName(e.currentTarget.value)
			}
		), !store ? BdApi.React.createElement(BdApi.React.Fragment, null, !offlineColorwayStores.length ? BdApi.React.createElement(
			"button",
			{
				className: "dc-button dc-button-primary",
				style: { marginTop: "8px" },
				onClick: () => {
					openModal$1((props) => BdApi.React.createElement(
						NewStoreModal,
						{
							modalProps: props,
							offlineOnly: true,
							onOffline: async ({ name }) => {
								setOfflineColorwayStores((prev) => [...prev, { name, presets: [], colorways: [] }]);
							}
						}
					));
				}
			},
			BdApi.React.createElement(PlusIcon, { width: 14, height: 14, style: { boxSizing: "content-box" } }),
			"Create new store..."
		) : BdApi.React.createElement("span", { style: { marginTop: "8px" }, className: `dc-field-header${noStoreError ? " dc-field-header-error" : ""}` }, "Source", noStoreError ? BdApi.React.createElement("span", { className: "dc-field-header-errormsg" }, BdApi.React.createElement("span", { className: "dc-field-header-errordiv" }, "-"), "No store selected") : BdApi.React.createElement(BdApi.React.Fragment, null)), BdApi.React.createElement("div", { className: "dc-selector" }, offlineColorwayStores.map((store2) => BdApi.React.createElement(
			"div",
			{
				className: "dc-colorway",
				"aria-checked": storename === store2.name,
				onClick: () => {
					setStorename(store2.name);
				}
			},
			BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), storename === store2.name && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" })),
			BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label" }, store2.name), BdApi.React.createElement("span", { className: "dc-label dc-subnote dc-note" }, (store2.colorways || []).length, " colorways \u2022 ", (store2.presets || []).length, " presets"))
		)))) : null))
	);
}

function CodeInput({ lang = "css", onChange = () => {
}, value = "" }) {
	useEffect(() => {
		document.querySelectorAll(".dc-codeblock").forEach((el) => hljs.highlightElement(el));
	}, [value]);
	return BdApi.React.createElement("pre", null, BdApi.React.createElement(
		"code",
		{
			className: `dc-codeblock language-${lang}`,
			contentEditable: true,
			style: { outline: "none" },
			spellCheck: false,
			onKeyDown: function(e) {
				if (e.keyCode === 9) {
					e.preventDefault();
					var editor = e.currentTarget;
					var doc = editor.ownerDocument.defaultView;
					var sel = doc.getSelection();
					var range = sel.getRangeAt(0);
					var tabNode = document.createTextNode("\xA0\xA0\xA0\xA0");
					range.insertNode(tabNode);
					range.setStartAfter(tabNode);
					range.setEndAfter(tabNode);
					sel.removeAllRanges();
					sel.addRange(range);
				}
			},
			onBlur: (e) => {
				onChange(e.currentTarget.textContent.replaceAll("\xA0", " "));
			}
		},
		value
	));
}

function Select$1({ items, selected, onChange }) {
	const [open, setOpen] = useState(false);
	function SelectPopout() {
		useEffect(() => {
			window.addEventListener("click", () => setOpen(false));
			return () => {
				window.removeEventListener("click", () => setOpen(false));
			};
		}, []);
		return BdApi.React.createElement("div", { className: "dc-select-popout", dir: "ltr", role: "listbox" }, items.map((itm, i) => BdApi.React.createElement("div", { className: "dc-select-option", role: "option", tabIndex: i, "aria-selected": itm.value === selected.value, onClick: () => onChange(itm.value) }, itm.name, itm.value === selected.value ? BdApi.React.createElement("svg", { style: { color: "var(--brand-500)" }, "aria-hidden": "true", role: "img", xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", fill: "none", viewBox: "0 0 24 24" }, BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "10", fill: "white" }), BdApi.React.createElement("path", { fill: "currentColor", "fill-rule": "evenodd", d: "M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm5.7-13.3a1 1 0 0 0-1.4-1.4L10 14.58l-2.3-2.3a1 1 0 0 0-1.4 1.42l3 3a1 1 0 0 0 1.4 0l7-7Z", "clip-rule": "evenodd" })) : null)));
	}
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("div", { className: "dc-select", role: "button", "aria-disabled": "false", "aria-expanded": "true", "aria-haspopup": "listbox", onClick: (e) => {
		e.stopPropagation();
		setOpen(!open);
	} }, BdApi.React.createElement("span", { className: "dc-select-selected" }, selected.name), BdApi.React.createElement("div", { className: "dc-select-caret" }, BdApi.React.createElement(CaretIcon, { width: 18, height: 18, style: open ? { rotate: "-90deg" } : { rotate: "90deg" } })), open ? BdApi.React.createElement(SelectPopout, null) : null));
}

function PresetConditionModal({ modalProps, onCondition = "", onConditionElse = "", colorValue = "accent-h", is = "equal", than: thanVal = 80, onConditionFinish = () => {
} }) {
	const [conditionFunc, setConditionFunc] = useState(is);
	const [colorVal, setColorVal] = useState(colorValue);
	const [noCSSError, setNoCSSError] = useState(false);
	const [CSS, setCSS] = useState(onCondition);
	const [elseCSS, setElseCSS] = useState(onConditionElse);
	const [than, setThan] = useState(thanVal);
	return BdApi.React.createElement(
		Modal,
		{
			modalProps,
			title: "Editing Condition...",
			type: "normal",
			onFinish: ({ closeModal }) => {
				if (!CSS) return setNoCSSError(true);
				onConditionFinish({ if: colorVal, is: conditionFunc, than: String(than), onCondition: CSS, onConditionElse: elseCSS });
				closeModal();
			}
		},
		BdApi.React.createElement("span", { style: { marginTop: "8px" }, className: "dc-field-header" }, "If"),
		BdApi.React.createElement(Select$1, { items: colorVals, selected: colorVals.find(({ value }) => value === colorVal), onChange: (val) => setColorVal(val) }),
		BdApi.React.createElement("span", { style: { marginTop: "8px" }, className: "dc-field-header" }, "Is"),
		BdApi.React.createElement(Select$1, { items: functs, selected: functs.find(({ value }) => value === conditionFunc), onChange: (val) => setConditionFunc(val) }),
		BdApi.React.createElement("span", { style: { marginTop: "8px" }, className: "dc-field-header" }, "Than"),
		BdApi.React.createElement(
			"input",
			{
				type: "number",
				className: "dc-textbox",
				style: { paddingRight: "6px" },
				placeholder: "Enter comparative number",
				value: than,
				autoFocus: true,
				onInput: ({ currentTarget: { value } }) => setThan(Number(value))
			}
		),
		BdApi.React.createElement("span", { style: { marginTop: "8px" }, className: `dc-field-header${noCSSError ? " dc-field-header-error" : ""}` }, "Then", noCSSError ? BdApi.React.createElement("span", { className: "dc-field-header-errormsg" }, BdApi.React.createElement("span", { className: "dc-field-header-errordiv" }, "-"), "Main condition cannot be empty") : BdApi.React.createElement(BdApi.React.Fragment, null)),
		BdApi.React.createElement(CodeInput, { value: CSS, lang: "css", onChange: setCSS }),
		BdApi.React.createElement("span", { style: { marginTop: "8px" }, className: "dc-field-header" }, "Else"),
		BdApi.React.createElement(CodeInput, { value: elseCSS, lang: "css", onChange: setElseCSS })
	);
}

function SavePresetAsModal({
	modalProps,
	presetObject,
	store = ""
}) {
	const [CSS, setCSS] = useState(presetObject ? presetObject.css : "");
	const [offlineColorwayStores, setOfflineColorwayStores] = useContextualState("customColorways");
	const [colorwayName, setColorwayName] = useState(presetObject ? presetObject.id : "");
	const [noStoreError, setNoStoreError] = useState(false);
	const [noCSSError, setNoCSSError] = useState(false);
	const [duplicateError, setDuplicateError] = useState(false);
	const [storename, setStorename] = useState(store);
	const [conditions, setConditions] = useState(presetObject ? presetObject.conditions || [] : []);
	return BdApi.React.createElement(
		Modal,
		{
			modalProps,
			title: (() => {
				if (presetObject && !store) return "Save";
				if (presetObject && store) return "Edit";
				return "Create";
			})() + " Preset",
			onFinish: async ({ closeModal }) => {
				setNoStoreError(false);
				setDuplicateError(false);
				setNoCSSError(false);
				if (!storename) {
					return setNoStoreError(true);
				}
				if (!CSS) {
					return setNoCSSError(true);
				}
				const customPreset = {
					name: colorwayName || "Preset",
					author: exports.UserStore.getCurrentUser().username,
					css: CSS,
					conditions,
					sourceType: "offline",
					source: store || storename
				};
				if (offlineColorwayStores.find((s) => s.name === storename) && (offlineColorwayStores.find((s) => s.name === storename).presets || []).find((preset) => preset.name === customPreset.name) && !store) {
					return setDuplicateError(true);
				} else {
					setOfflineColorwayStores((stores) => stores.map((s) => {
						if (s.name === storename) {
							return { name: s.name, presets: [...(s.presets || []).filter((p) => p.name !== customPreset.name), customPreset], colorways: s.colorways || [] };
						}
						return s;
					}));
				}
				closeModal();
			},
			additionalButtons: [
				...!store ? [{
					text: "Create New Store...",
					type: "brand",
					action: () => openModal$1((props) => BdApi.React.createElement(
						NewStoreModal,
						{
							modalProps: props,
							offlineOnly: true,
							onOffline: async ({ name }) => {
								setOfflineColorwayStores((prev) => [...prev, { name, presets: [], colorways: [] }]);
							}
						}
					))
				}] : []
			]
		},
		BdApi.React.createElement("span", { style: { marginTop: "8px" }, className: `dc-field-header${duplicateError ? " dc-field-header-error" : ""}` }, "Name", duplicateError ? BdApi.React.createElement("span", { className: "dc-field-header-errormsg" }, BdApi.React.createElement("span", { className: "dc-field-header-errordiv" }, "-"), "A preset with this name already exists") : BdApi.React.createElement(BdApi.React.Fragment, null)),
		BdApi.React.createElement(
			"input",
			{
				type: "text",
				className: "dc-textbox",
				placeholder: "Give your preset a name",
				value: colorwayName,
				autoFocus: true,
				onInput: (e) => setColorwayName(e.currentTarget.value)
			}
		),
		BdApi.React.createElement("span", { style: { marginTop: "8px" }, className: `dc-field-header${noCSSError ? " dc-field-header-error" : ""}` }, "CSS", noCSSError ? BdApi.React.createElement("span", { className: "dc-field-header-errormsg" }, BdApi.React.createElement("span", { className: "dc-field-header-errordiv" }, "-"), "CSS cannot be empty") : BdApi.React.createElement(BdApi.React.Fragment, null)),
		BdApi.React.createElement(CodeInput, { lang: "css", onChange: setCSS, value: CSS }),
		BdApi.React.createElement("span", { style: { marginTop: "8px" }, className: "dc-field-header" }, "Conditions"),
		BdApi.React.createElement("div", { className: "dc-selector", style: { gridTemplateColumns: "100%" } }, conditions.map(({ if: colorValue, is, than, onCondition, onConditionElse }, i) => BdApi.React.createElement(
			"div",
			{
				className: "dc-colorway",
				onClick: () => {
					openModal$1((props) => BdApi.React.createElement(PresetConditionModal, { modalProps: props, onCondition, onConditionElse, is, colorValue, than: Number(than), onConditionFinish: (newCondition) => {
						setConditions((conds) => {
							const arr = [...conds];
							arr[i] = newCondition;
							return arr;
						});
					} }));
				}
			},
			BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label" }, colorVals.find((cv) => cv.value === colorValue).name, " ", functs.find((cf) => cf.value === is).name, " ", than))
		)), BdApi.React.createElement(
			"div",
			{
				className: "dc-colorway",
				onClick: () => {
					openModal$1((props) => BdApi.React.createElement(PresetConditionModal, { modalProps: props, onConditionFinish: (newCondition) => {
						setConditions((conds) => [...conds, newCondition]);
					} }));
				}
			},
			BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label" }, "Add new condition"))
		)),
		!store ? BdApi.React.createElement(BdApi.React.Fragment, null, !offlineColorwayStores.length ? BdApi.React.createElement(
			"button",
			{
				className: "dc-button dc-button-primary",
				style: { marginTop: "8px" },
				onClick: () => {
					openModal$1((props) => BdApi.React.createElement(
						NewStoreModal,
						{
							modalProps: props,
							offlineOnly: true,
							onOffline: async ({ name }) => {
								setOfflineColorwayStores((prev) => [...prev, { name, presets: [], colorways: [] }]);
							}
						}
					));
				}
			},
			BdApi.React.createElement(PlusIcon, { width: 14, height: 14, style: { boxSizing: "content-box" } }),
			"Create new store..."
		) : BdApi.React.createElement("span", { style: { marginTop: "8px" }, className: `dc-field-header${noStoreError ? " dc-field-header-error" : ""}` }, "Source", noStoreError ? BdApi.React.createElement("span", { className: "dc-field-header-errormsg" }, BdApi.React.createElement("span", { className: "dc-field-header-errordiv" }, "-"), "No store selected") : BdApi.React.createElement(BdApi.React.Fragment, null)), BdApi.React.createElement("div", { className: "dc-selector" }, offlineColorwayStores.map((store2) => BdApi.React.createElement(
			"div",
			{
				className: "dc-colorway",
				"aria-checked": storename === store2.name,
				onClick: () => {
					setStorename(store2.name);
				}
			},
			BdApi.React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), storename === store2.name && BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" })),
			BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label" }, store2.name), BdApi.React.createElement("span", { className: "dc-label dc-subnote dc-note" }, (store2.presets || []).length, " presets"))
		)))) : null
	);
}

function Radio({ checked = false, style = {} }) {
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("svg", { className: "dc-radio", "aria-hidden": "true", role: "img", width: "18", height: "18", viewBox: "0 0 24 24", style }, BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }), checked ? BdApi.React.createElement("circle", { className: "dc-radio-selected", cx: "12", cy: "12", r: "5" }) : null), BdApi.React.createElement("svg", { className: "dc-radio-redesign", viewBox: "0 0 24 24", style }, checked ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "12", fill: "var(--redesign-input-control-selected)" }), BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "5", fill: "white" })) : null, BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "12", "stroke-width": "2", stroke: "rgba(255, 255, 255, 0.1)", fill: "none" })));
}

function StaticOptionsMenu({
	children,
	menu,
	xPos = "left",
	yPos = "bottom"
}) {
	const [pos, setPos] = useState({ x: 0, y: 0 });
	const [showMenu, setShowMenu] = useState(false);
	function rightClickContextMenu(e) {
		e.stopPropagation();
		window.dispatchEvent(new Event("click"));
		setShowMenu(!showMenu);
		setPos({
			x: (() => {
				switch (xPos) {
					case "left":
						return e.currentTarget.getBoundingClientRect().x;
					case "right":
						return window.innerWidth - e.currentTarget.getBoundingClientRect().x - e.currentTarget.offsetWidth;
				}
			})(),
			y: e.currentTarget.getBoundingClientRect().y + e.currentTarget.offsetHeight + 8
		});
		return;
	}
	function onPageClick(e) {
		setShowMenu(false);
	}
	const theme = Hooks.useTheme();
	function Menu() {
		useEffect(() => {
			window.addEventListener("click", onPageClick);
			return () => {
				window.removeEventListener("click", onPageClick);
			};
		}, []);
		return BdApi.React.createElement("nav", { "data-theme": theme, className: "dc-contextmenu", style: {
			position: "fixed",
			top: `${pos.y}px`,
			...xPos === "left" ? { left: `${pos.x}px` } : { right: `${pos.x}px` }
		} }, menu);
	}
	return BdApi.React.createElement(BdApi.React.Fragment, null, showMenu ? BdApi.React.createElement(Menu, null) : null, children({
		onClick: (e) => {
			rightClickContextMenu(e);
		}
	}));
}

function ReloadButton({
	setShowSpinner
}) {
	const [colorwaySourceFiles] = Hooks.useContextualState("colorwaySourceFiles");
	const [colorwayData, setColorwayData] = Hooks.useContextualState("colorwayData", false);
	async function onReload_internal(force = false) {
		setShowSpinner(true);
		const responses = await Promise.all(
			colorwaySourceFiles.map(
				(source) => fetch(source.url, force ? { "cache": "no-store" } : {})
			)
		);
		setColorwayData(await Promise.all(
			responses.map((res, i) => ({ response: res, name: colorwaySourceFiles[i].name })).map(
				(res) => res.response.json().then((dt) => ({
					colorways: dt.colorways || [],
					presets: (dt.presets || []).filter((preset) => {
						if (preset.name === "Discord" && preset.author === "DaBluLite" && res.response.url === defaultColorwaySource) {
							Contexts.setContext("colorwaysDiscordPreset", {
								name: "Discord",
								source: "Built-In",
								sourceType: "builtin",
								author: "DaBluLite",
								css: preset.css,
								conditions: preset.conditions
							});
							return false;
						}
						return true;
					}),
					source: res.name,
					type: "online"
				})).catch(() => ({ colorways: [], presets: [], source: res.name, type: "online" }))
			)
		));
		colorwayData.find((d) => d.source === "Project Colorway").presets?.forEach((preset) => {
			if (preset.name === "Discord" && preset.author === "DaBluLite") Contexts.setContext("colorwaysDiscordPreset", {
				name: "Discord",
				source: "Built-In",
				sourceType: "builtin",
				author: "DaBluLite",
				css: preset.css,
				conditions: preset.conditions
			});
		});
		setShowSpinner(false);
	}
	return BdApi.React.createElement(StaticOptionsMenu, { menu: BdApi.React.createElement("button", { onClick: () => onReload_internal(true), className: "dc-contextmenu-item" }, "Force Refresh", BdApi.React.createElement(
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
	)) }, ({ onClick }) => BdApi.React.createElement("button", { className: "dc-button dc-button-primary", onContextMenu: onClick, onClick: () => onReload_internal() }, BdApi.React.createElement(
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

function Spinner({ className = "", style }) {
	return BdApi.React.createElement("div", { className: `dc-spinner ${className}`, role: "img", "aria-label": "Loading", style }, BdApi.React.createElement("div", { className: "dc-spinner-inner" }, BdApi.React.createElement("svg", { className: "dc-spinner-svg", viewBox: "25 25 50 50", fill: "currentColor" }, BdApi.React.createElement("circle", { className: "dc-spinner-beam dc-spinner-beam3", cx: "50", cy: "50", r: "20" }), BdApi.React.createElement("circle", { className: "dc-spinner-beam dc-spinner-beam2", cx: "50", cy: "50", r: "20" }), BdApi.React.createElement("circle", { className: "dc-spinner-beam", cx: "50", cy: "50", r: "20" }))));
}

function TabBar$1({
	items = [],
	container = ({ children }) => BdApi.React.createElement(BdApi.React.Fragment, null, children),
	onChange,
	active = ""
}) {
	return BdApi.React.createElement(BdApi.React.Fragment, null, container({
		children: BdApi.React.createElement("div", { className: "dc-menu-tabs" }, items.map((item) => {
			return BdApi.React.createElement("div", { className: `dc-menu-tab ${active === item.name ? "active" : ""}`, onClick: () => onChange(item.name) }, item.name);
		}))
	}), items.map((item) => active === item.name ? item.component() : null));
}

function get_updateCustomSource(customColorwayData, setCustomColorwayData) {
	return function updateCustomSource(props) {
		if (props.type === SourceActions.AddColorway) {
			const srcList = customColorwayData.map((s) => {
				if (s.name === props.source) {
					return { name: s.name, colorways: [...s.colorways || [], props.colorway], presets: s.presets || [] };
				}
				return s;
			});
			setCustomColorwayData(srcList);
		}
		if (props.type === SourceActions.RemoveColorway) {
			const srcList = customColorwayData.map((s) => {
				if (s.name === props.source) {
					return { name: s.name, colorways: (s.colorways || []).filter((c) => c.name !== props.colorway.name), presets: s.presets || [] };
				}
				return s;
			});
			setCustomColorwayData(srcList);
		}
		if (props.type === SourceActions.AddPreset) {
			const srcList = customColorwayData.map((s) => {
				if (s.name === props.source) {
					return { name: s.name, colorways: s.colorways || [], presets: [...s.presets || [], props.preset] };
				}
				return s;
			});
			setCustomColorwayData(srcList);
		}
		if (props.type === SourceActions.RemovePreset) {
			const srcList = customColorwayData.map((s) => {
				if (s.name === props.source) {
					return { name: s.name, colorways: s.colorways || [], presets: (s.presets || []).filter((p) => p.name !== props.preset.name) };
				}
				return s;
			});
			setCustomColorwayData(srcList);
		}
	};
}
function Colorways() {
	const [colorwayData] = Hooks.useContextualState("colorwayData", false);
	const [customColorwayData, setCustomColorwayData] = Hooks.useContextualState("customColorways");
	const [activeColorwayObject, setActiveColorwayObject] = Hooks.useContextualState("activeColorwayObject");
	const [wsConnected] = Hooks.useContextualState("isConnected");
	const [isManager] = Hooks.useContextualState("hasManagerRole");
	const [usageMetrics, setUsageMetrics] = Hooks.useContextualState("colorwayUsageMetrics");
	const [activeAutoPreset] = Hooks.useContextualState("activeAutoPreset");
	const [invalidColorwayClicked, setInvalidColorwayClicked] = useTimedState("", 2e3);
	const [searchValue, setSearchValue] = useState("");
	const [sortBy, setSortBy] = useState(SortOptions.MOST_USED);
	const [showSpinner, setShowSpinner] = useState(false);
	const [visibleSources, setVisibleSources] = useState("all");
	const [layout, setLayout] = useState("normal");
	const updateCustomSource = get_updateCustomSource(customColorwayData, setCustomColorwayData);
	const layouts = [{ name: "Normal", id: "normal" }, { name: "Compact", id: "compact" }];
	const filters = [
		{
			name: "All",
			id: "all",
			sources: [...colorwayData, ...customColorwayData.map((source) => ({ source: source.name, colorways: source.colorways, type: "offline" }))]
		},
		...colorwayData.map((source) => ({
			name: source.source,
			id: source.source.toLowerCase().replaceAll(" ", "-"),
			sources: [source]
		})),
		...customColorwayData.map((source) => ({
			name: source.name,
			id: source.name.toLowerCase().replaceAll(" ", "-"),
			sources: [{ source: source.name, colorways: source.colorways, type: "offline" }]
		}))
	];
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(
		ComboTextBox,
		{
			placeholder: "Search for Colorways...",
			value: searchValue,
			onInput: setSearchValue
		},
		BdApi.React.createElement(Spinner, { className: `dc-selector-spinner${!showSpinner ? " dc-selector-spinner-hidden" : ""}` }),
		BdApi.React.createElement(ReloadButton, { setShowSpinner }),
		BdApi.React.createElement(
			"button",
			{
				className: "dc-button dc-button-primary",
				onClick: () => openModal$1((props) => BdApi.React.createElement(SaveColorwayAsModal, { modalProps: props }))
			},
			BdApi.React.createElement(PlusIcon, { width: 14, height: 14, style: { boxSizing: "content-box" } }),
			"Add..."
		),
		BdApi.React.createElement(
			StaticOptionsMenu,
			{
				xPos: "right",
				menu: BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: () => setSortBy(9), className: "dc-contextmenu-item" }, "Most Used", BdApi.React.createElement(Radio, { checked: sortBy === 9, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(10), className: "dc-contextmenu-item" }, "Least Used", BdApi.React.createElement(Radio, { checked: sortBy === 10, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(1), className: "dc-contextmenu-item" }, "Name (A-Z)", BdApi.React.createElement(Radio, { checked: sortBy === 1, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(2), className: "dc-contextmenu-item" }, "Name (Z-A)", BdApi.React.createElement(Radio, { checked: sortBy === 2, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(3), className: "dc-contextmenu-item" }, "Source (A-Z)", BdApi.React.createElement(Radio, { checked: sortBy === 3, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(4), className: "dc-contextmenu-item" }, "Source (Z-A)", BdApi.React.createElement(Radio, { checked: sortBy === 4, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(5), className: "dc-contextmenu-item" }, "Source Type (Online First)", BdApi.React.createElement(Radio, { checked: sortBy === 5, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(6), className: "dc-contextmenu-item" }, "Source Type (Offline First)", BdApi.React.createElement(Radio, { checked: sortBy === 6, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(7), className: "dc-contextmenu-item" }, "Color Count (Ascending)", BdApi.React.createElement(Radio, { checked: sortBy === 7, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(8), className: "dc-contextmenu-item" }, "Color Count (Descending)", BdApi.React.createElement(Radio, { checked: sortBy === 8, style: {
					marginLeft: "8px"
				} })))
			},
			({ onClick }) => BdApi.React.createElement(
				"button",
				{
					onClick,
					className: "dc-button dc-button-primary"
				},
				"Sort By: ",
				(() => {
					switch (sortBy) {
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
				})()
			)
		),
		BdApi.React.createElement(
			StaticOptionsMenu,
			{
				xPos: "right",
				menu: BdApi.React.createElement(BdApi.React.Fragment, null, filters.map(({ name, id }) => {
					return BdApi.React.createElement("button", { onClick: () => setVisibleSources(id), className: "dc-contextmenu-item" }, name, BdApi.React.createElement(Radio, { checked: visibleSources === id, style: {
						marginLeft: "8px"
					} }));
				}))
			},
			({ onClick }) => BdApi.React.createElement(
				"button",
				{
					onClick,
					className: "dc-button dc-button-primary"
				},
				"Source: ",
				filters.find((filter) => filter.id === visibleSources).name
			)
		),
		BdApi.React.createElement(
			"button",
			{
				className: "dc-button dc-button-primary",
				onClick: () => {
					if (layout === "normal") return setLayout("compact");
					else return setLayout("normal");
				}
			},
			"Layout: ",
			layouts.find((l) => l.id === layout)?.name
		)
	), BdApi.React.createElement("div", { style: { maxHeight: "unset" }, className: "dc-selector", "data-layout": layout }, activeColorwayObject.sourceType === "temporary" && BdApi.React.createElement(
		"div",
		{
			className: "dc-colorway",
			id: "colorway-Temporary",
			role: "button",
			"aria-checked": activeColorwayObject.sourceType === "temporary",
			"aria-invalid": invalidColorwayClicked === "colorway-Temporary",
			onClick: async () => {
				if (wsConnected) {
					if (!isManager) {
						setInvalidColorwayClicked("colorway-Temporary");
					} else {
						setActiveColorwayObject(nullColorwayObj);
					}
				} else {
					setActiveColorwayObject(nullColorwayObj);
				}
			}
		},
		BdApi.React.createElement("div", { className: "dc-color-swatch" }, BdApi.React.createElement(
			"div",
			{
				className: "dc-color-swatch-part",
				style: { backgroundColor: "#" + activeColorwayObject.colors.accent }
			}
		), BdApi.React.createElement(
			"div",
			{
				className: "dc-color-swatch-part",
				style: { backgroundColor: "#" + activeColorwayObject.colors.primary }
			}
		), BdApi.React.createElement(
			"div",
			{
				className: "dc-color-swatch-part",
				style: { backgroundColor: "#" + activeColorwayObject.colors.secondary }
			}
		), BdApi.React.createElement(
			"div",
			{
				className: "dc-color-swatch-part",
				style: { backgroundColor: "#" + activeColorwayObject.colors.tertiary }
			}
		)),
		BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label" }, activeColorwayObject.id), BdApi.React.createElement("span", { className: "dc-label dc-subnote dc-note" }, "Temporary Colorway")),
		BdApi.React.createElement(
			"button",
			{
				className: "dc-button dc-button-secondary",
				onClick: async (e) => {
					e.stopPropagation();
					openModal$1((props) => BdApi.React.createElement(
						SaveColorwayAsModal,
						{
							modalProps: props,
							colorwayObject: activeColorwayObject
						}
					));
				}
			},
			BdApi.React.createElement(PlusIcon, { width: 20, height: 20 })
		)
	), getComputedStyle(document.body).getPropertyValue("--os-accent-color") && "auto".includes(searchValue.toLowerCase()) ? BdApi.React.createElement(
		ColorwayItem,
		{
			id: "colorway-Auto",
			text: "Auto Colorway",
			descriptions: [`Active preset: ${Object.values(getAutoPresets()).find((pr) => pr.id === activeAutoPreset)?.name}`],
			colors: [
				getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].colors.accent,
				getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].colors.primary,
				getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].colors.secondary,
				getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].colors.tertiary
			],
			"aria-checked": activeColorwayObject.id === "Auto" && activeColorwayObject.sourceType === "auto",
			"aria-invalid": invalidColorwayClicked === "colorway-Auto",
			onClick: async () => {
				if (activeColorwayObject.id === "Auto" && activeColorwayObject.sourceType === "auto") {
					setActiveColorwayObject(nullColorwayObj);
				} else {
					const { colors } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset];
					const newObj = {
						id: "Auto",
						sourceType: "auto",
						source: null,
						colors
					};
					if (!wsConnected) {
						setActiveColorwayObject(newObj);
					} else {
						if (!isManager) {
							setInvalidColorwayClicked("colorway-Auto");
						} else {
							Dispatcher.dispatch("COLORWAYS_SEND_COLORWAY", {
								active: newObj
							});
						}
					}
				}
			}
		}
	) : BdApi.React.createElement(BdApi.React.Fragment, null), (filters.find((filter) => filter.id === visibleSources) || { name: "null", id: "null", sources: [] }).sources.map(({ colorways, source, type }) => (colorways || []).map((colorway) => ({ ...colorway, sourceType: type, source, preset: colorway.preset || (colorway.isGradient ? "Gradient" : "Default") }))).flat().sort((a, b) => {
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
		const aMetric = usageMetrics.filter((metric) => compareColorwayObjects(metric, objA))[0] || { ...objA, uses: 0 };
		const bMetric = usageMetrics.filter((metric) => compareColorwayObjects(metric, objB))[0] || { ...objB, uses: 0 };
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
	}).filter(({ name }) => name.toLowerCase().includes(searchValue.toLowerCase())).map((color) => BdApi.React.createElement(
		ColorwayItem,
		{
			id: "colorway-" + color.name,
			"aria-invalid": invalidColorwayClicked === "colorway-" + color.name,
			"aria-checked": activeColorwayObject.id === color.name && activeColorwayObject.source === color.source,
			onClick: async () => {
				if (activeColorwayObject.id === color.name && activeColorwayObject.source === color.source) {
					setActiveColorwayObject(nullColorwayObj);
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
					color.linearGradient ? newObj.linearGradient = color.linearGradient : void 0;
					if (!wsConnected) {
						setActiveColorwayObject(newObj);
						if (usageMetrics.filter((metric) => compareColorwayObjects(metric, newObj)).length) {
							setUsageMetrics((m) => m.map((metric) => {
								if (compareColorwayObjects(metric, newObj)) {
									return { ...metric, uses: metric.uses + 1 };
								}
								return metric;
							}));
						} else {
							setUsageMetrics((m) => [...m, { ...newObj, uses: 1 }]);
						}
					} else {
						if (!isManager) {
							setInvalidColorwayClicked(`colorway-${color.name}`);
						} else {
							Dispatcher.dispatch("COLORWAYS_SEND_COLORWAY", {
								active: newObj
							});
						}
					}
				}
			},
			menu: BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("div", { className: "dc-contextmenu-colors" }, (color.colors || [
				"accent",
				"primary",
				"secondary",
				"tertiary"
			]).map((c) => BdApi.React.createElement("div", { className: "dc-contextmenu-color", style: { backgroundColor: "#" + colorToHex(color[c]) }, onClick: () => {
				copy("#" + colorToHex(color[c]));
				Toasts.show({
					message: "Copied Color Successfully",
					type: 1,
					id: "copy-color-notify"
				});
			} }))), BdApi.React.createElement("button", { onClick: () => {
				const colorwayIDArray = `${color.accent},${color.primary},${color.secondary},${color.tertiary}|n:${color.name}${color.preset ? `|p:${color.preset}` : ""}`;
				const colorwayID = stringToHex(colorwayIDArray);
				copy(colorwayID);
				Toasts.show({
					message: "Copied Colorway ID Successfully",
					type: 1,
					id: "copy-colorway-id-notify"
				});
			}, className: "dc-contextmenu-item" }, "Copy Colorway ID", BdApi.React.createElement(IDIcon, { width: 16, height: 16, style: {
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
				saveFile(new File([generateCss(
					newObj.colors,
					true,
					true,
					void 0)], `${color.name.replaceAll(" ", "-").toLowerCase()}.theme.css`, { type: "text/plain" }));
			}, className: "dc-contextmenu-item" }, "Download CSS as Theme", BdApi.React.createElement(DownloadIcon, { width: 16, height: 16, style: {
				marginLeft: "8px"
			} })), color.sourceType === "offline" ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: async () => {
				openModal$1((props) => BdApi.React.createElement(
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
						modalProps: props
					}
				));
			}, className: "dc-contextmenu-item" }, "Edit Colorway", BdApi.React.createElement(PencilIcon, { width: 16, height: 16, style: {
				marginLeft: "8px"
			} })), BdApi.React.createElement("button", { onClick: () => {
				openModal$1((props) => BdApi.React.createElement(
					Modal,
					{
						modalProps: props,
						title: "Delete Colorway",
						onFinish: async ({ closeModal }) => {
							if (activeColorwayObject.id === color.name) {
								setActiveColorwayObject(nullColorwayObj);
							}
							updateCustomSource({ type: SourceActions.RemoveColorway, colorway: color, source: color.source });
							closeModal();
						},
						confirmMsg: "Delete",
						type: "danger"
					},
					"Are you sure you want to delete this colorway? This cannot be undone!"
				));
			}, className: "dc-contextmenu-item dc-contextmenu-item-danger" }, "Delete Colorway...", BdApi.React.createElement(DeleteIcon, { width: 16, height: 16, style: {
				marginLeft: "8px"
			} }))) : null, color.sourceType === "online" ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: async () => {
				openModal$1((props) => BdApi.React.createElement(
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
						modalProps: props
					}
				));
			}, className: "dc-contextmenu-item" }, "Edit Colorway Locally", BdApi.React.createElement(PencilIcon, { width: 16, height: 16, style: {
				marginLeft: "8px"
			} }))) : null),
			colors: Object.values({
				accent: color.accent,
				primary: color.primary,
				secondary: color.secondary,
				tertiary: color.tertiary
			}),
			text: color.name,
			descriptions: [`by ${color.author}`, `from ${color.source}`]
		}
	)), !filters.flatMap((f) => f.sources.map((s) => s.colorways)).flat().length ? BdApi.React.createElement(ColorwayItem, { text: "It's quite emty in here.", descriptions: ["Try searching for something else, or add another source"], id: "colorway-nocolorways" }) : null));
}
function Presets$1() {
	const [colorwayData] = Hooks.useContextualState("colorwayData", false);
	const [customColorwayData, setCustomColorwayData] = Hooks.useContextualState("customColorways");
	const [activePresetObject, setActivePresetObject] = Hooks.useContextualState("activePresetObject");
	const [colorwaysDiscordPreset] = Hooks.useContextualState("colorwaysDiscordPreset");
	const [themePresets] = Hooks.useContextualState("themePresets");
	const [searchValue, setSearchValue] = useState("");
	const [sortBy, setSortBy] = useState(SortOptions.NAME_AZ);
	const [showSpinner, setShowSpinner] = useState(false);
	const [visibleSources, setVisibleSources] = useState("all");
	const [layout, setLayout] = useState("normal");
	const layouts = [{ name: "Normal", id: "normal" }, { name: "Compact", id: "compact" }];
	const updateCustomSource = get_updateCustomSource(customColorwayData, setCustomColorwayData);
	const filters = [
		{
			name: "All",
			id: "all",
			sources: [
				...colorwayData.filter((s) => (s.presets || []).length).map((s) => ({ source: s.source, presets: s.presets, type: "online" })),
				...customColorwayData.filter((s) => (s.presets || []).length).map((source) => ({ source: source.name, presets: source.presets, type: "offline" })),
				...themePresets.map((theme) => ({ source: theme.source, type: "theme", presets: [theme] })),
				{ source: "Built-In", type: "builtin", presets: [colorwaysDiscordPreset] }
			]
		},
		{
			name: colorwaysDiscordPreset.source,
			id: colorwaysDiscordPreset.sourceType,
			sources: [{ source: colorwaysDiscordPreset.source, type: colorwaysDiscordPreset.sourceType, presets: [colorwaysDiscordPreset] }]
		},
		...colorwayData.map((source) => ({
			name: source.source,
			id: source.source.toLowerCase().replaceAll(" ", "-"),
			sources: [{ source: source.source, presets: source.presets || [], type: "online" }]
		})),
		...customColorwayData.map((source) => ({
			name: source.name,
			id: source.name.toLowerCase().replaceAll(" ", "-"),
			sources: [{ source: source.name, presets: source.presets || [], type: "offline" }]
		})),
		{
			name: "Themes",
			id: "themes",
			sources: themePresets.map((preset) => ({ source: preset.name, presets: [preset], type: "theme" }))
		}
	];
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(
		ComboTextBox,
		{
			placeholder: "Search for Presets...",
			value: searchValue,
			onInput: setSearchValue
		},
		BdApi.React.createElement(Spinner, { className: `dc-selector-spinner${!showSpinner ? " dc-selector-spinner-hidden" : ""}` }),
		BdApi.React.createElement(ReloadButton, { setShowSpinner }),
		BdApi.React.createElement(
			"button",
			{
				className: "dc-button dc-button-primary",
				onClick: () => openModal$1((props) => BdApi.React.createElement(SavePresetAsModal, { modalProps: props }))
			},
			BdApi.React.createElement(PlusIcon, { width: 14, height: 14, style: { boxSizing: "content-box" } }),
			"Add..."
		),
		BdApi.React.createElement(
			StaticOptionsMenu,
			{
				xPos: "right",
				menu: BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: () => setSortBy(1), className: "dc-contextmenu-item" }, "Name (A-Z)", BdApi.React.createElement(Radio, { checked: sortBy === 1, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(2), className: "dc-contextmenu-item" }, "Name (Z-A)", BdApi.React.createElement(Radio, { checked: sortBy === 2, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(3), className: "dc-contextmenu-item" }, "Source (A-Z)", BdApi.React.createElement(Radio, { checked: sortBy === 3, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(4), className: "dc-contextmenu-item" }, "Source (Z-A)", BdApi.React.createElement(Radio, { checked: sortBy === 4, style: {
					marginLeft: "8px"
				} })))
			},
			({ onClick }) => BdApi.React.createElement(
				"button",
				{
					onClick,
					className: "dc-button dc-button-primary"
				},
				"Sort By: ",
				(() => {
					switch (sortBy) {
						case 1:
							return "Name (A-Z)";
						case 2:
							return "Name (Z-A)";
						case 3:
							return "Source (A-Z)";
						case 4:
							return "Source (Z-A)";
						default:
							return "Name (A-Z)";
					}
				})()
			)
		),
		BdApi.React.createElement(
			StaticOptionsMenu,
			{
				xPos: "right",
				menu: BdApi.React.createElement(BdApi.React.Fragment, null, filters.filter((f) => f.sources.filter((s) => (s.presets || []).length).length).map(({ name, id }) => {
					return BdApi.React.createElement("button", { onClick: () => setVisibleSources(id), className: "dc-contextmenu-item" }, name, BdApi.React.createElement(Radio, { checked: visibleSources === id, style: {
						marginLeft: "8px"
					} }));
				}))
			},
			({ onClick }) => BdApi.React.createElement(
				"button",
				{
					onClick,
					className: "dc-button dc-button-primary"
				},
				"Source: ",
				filters.find((filter) => filter.id === visibleSources).name
			)
		),
		BdApi.React.createElement(
			"button",
			{
				className: "dc-button dc-button-primary",
				onClick: () => {
					if (layout === "normal") return setLayout("compact");
					else return setLayout("normal");
				}
			},
			"Layout: ",
			layouts.find((l) => l.id === layout)?.name
		)
	), BdApi.React.createElement("div", { style: { maxHeight: "unset" }, className: "dc-selector", "data-layout": layout }, (filters.find((filter) => filter.id === visibleSources) || { name: "null", id: "null", sources: [] }).sources.map(({ presets, source, type }) => (presets || []).map((preset) => ({ ...preset, sourceType: type, source }))).flat().sort((a, b) => {
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
			default:
				return a.name.localeCompare(b.name);
		}
	}).filter(({ name }) => name.toLowerCase().includes(searchValue.toLowerCase())).map((preset) => BdApi.React.createElement(
		ColorwayItem,
		{
			id: "preset-" + preset.name,
			menu: BdApi.React.createElement(BdApi.React.Fragment, null, preset.sourceType === "offline" ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: async () => {
				openModal$1((props) => BdApi.React.createElement(
					SavePresetAsModal,
					{
						store: preset.source,
						presetObject: {
							id: preset.name,
							source: preset.source,
							sourceType: preset.sourceType,
							css: preset.css,
							conditions: preset.conditions || []
						},
						modalProps: props
					}
				));
			}, className: "dc-contextmenu-item" }, "Edit Preset", BdApi.React.createElement(PencilIcon, { width: 16, height: 16, style: {
				marginLeft: "8px"
			} })), BdApi.React.createElement("button", { onClick: () => {
				openModal$1((props) => BdApi.React.createElement(
					Modal,
					{
						modalProps: props,
						title: "Delete Preset",
						onFinish: async ({ closeModal }) => {
							if (activePresetObject.id === preset.name) {
								setActivePresetObject({ id: colorwaysDiscordPreset.name, source: colorwaysDiscordPreset.source, sourceType: colorwaysDiscordPreset.sourceType, css: colorwaysDiscordPreset.css, conditions: colorwaysDiscordPreset.conditions || [] });
							}
							updateCustomSource({ type: SourceActions.RemovePreset, preset, source: preset.source });
							closeModal();
						},
						confirmMsg: "Delete",
						type: "danger"
					},
					"Are you sure you want to delete this colorway? This cannot be undone!"
				));
			}, className: "dc-contextmenu-item dc-contextmenu-item-danger" }, "Delete Preset...", BdApi.React.createElement(DeleteIcon, { width: 16, height: 16, style: {
				marginLeft: "8px"
			} }))) : null, preset.sourceType === "online" ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: async () => {
				openModal$1((props) => BdApi.React.createElement(
					SavePresetAsModal,
					{
						presetObject: {
							id: preset.name,
							source: preset.source,
							sourceType: preset.sourceType,
							css: preset.css,
							conditions: preset.conditions || []
						},
						modalProps: props
					}
				));
			}, className: "dc-contextmenu-item" }, "Edit Preset Locally", BdApi.React.createElement(PencilIcon, { width: 16, height: 16, style: {
				marginLeft: "8px"
			} }))) : null),
			"aria-checked": activePresetObject.id === preset.name && activePresetObject.source === preset.source,
			descriptions: [`by ${preset.author}`, `from ${preset.source}`],
			text: preset.name,
			onClick: async () => {
				const newObj = {
					id: preset.name,
					sourceType: preset.sourceType,
					source: preset.source,
					conditions: preset.conditions || [],
					css: preset.css
				};
				setActivePresetObject(newObj);
			}
		}
	)), !filters.flatMap((f) => f.sources.map((s) => s.presets)).flat().length ? BdApi.React.createElement(
		"div",
		{
			className: "dc-colorway",
			role: "button",
			id: "preset-nopresets"
		},
		BdApi.React.createElement(WirelessIcon, { width: 30, height: 30, style: { color: "var(--interactive-active)" } }),
		BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label" }, "It's quite emty in here."), BdApi.React.createElement("span", { className: "dc-label dc-subnote dc-note" }, "Try searching for something else, or add another source"))
	) : null));
}
function Selector() {
	const [active, setActive] = useState("Colorways");
	return BdApi.React.createElement(
		TabBar$1,
		{
			active,
			onChange: setActive,
			container: ({ children }) => BdApi.React.createElement("div", { className: "dc-page-header" }, children),
			items: [
				{
					name: "Colorways",
					component: () => BdApi.React.createElement(Colorways, null)
				},
				{
					name: "Presets",
					component: () => BdApi.React.createElement(Presets$1, null)
				}
			]
		}
	);
}

function connect() {
	const [context, destroyContexts, addContextListener] = simpleContexts();
	if (context().isConnected) return;
	const ws = new WebSocket("ws://localhost:6124");
	let hasErrored = false;
	ws.onopen = function() {
		setContext("hasManagerRole", false, false);
		setContext("isConnected", true, false);
		Dispatcher.addListener("COLORWAYS_CLOSE_WS", () => ws?.close(3001, "Connection severed manually"));
		Dispatcher.addListener("COLORWAYS_RESTART_WS", () => {
			ws?.close(3001, "Connection severed manually");
			connect();
		});
	};
	ws.onmessage = function({ data: raw }) {
		const data = JSON.parse(raw);
		if (data.type === "change-colorway") {
			if (data.active.id === null) {
				setContext("activeColorwayObject", nullColorwayObj);
			} else {
				if (data.active.id !== context().activeColorwayObject.id) {
					if (context().colorwayUsageMetrics.filter((metric) => compareColorwayObjects(metric, data.active)).length) {
						const foundMetric = context().colorwayUsageMetrics.find((metric) => compareColorwayObjects(metric, data.active));
						const newMetrics = [...context().colorwayUsageMetrics.filter((metric) => !compareColorwayObjects(metric, data.active)), { ...foundMetric, uses: (foundMetric?.uses || 0) + 1 }];
						setContext("colorwayUsageMetrics", newMetrics);
					} else {
						const newMetrics = [...context().colorwayUsageMetrics, { ...data.active, uses: 1 }];
						setContext("colorwayUsageMetrics", newMetrics);
					}
					setContext("activeColorwayObject", data.active);
				}
			}
		}
		if (data.type === "remove-colorway") {
			if (context().activeColorwayObject.id !== null) {
				setContext("activeColorwayObject", nullColorwayObj);
			}
		}
		if (data.type === "manager-connection-established") {
			if (data.MID) {
				const boundSearch = context().colorwaysBoundManagers.filter((boundManager) => {
					if (Object.keys(boundManager)[0] === data.MID) return boundManager;
				});
				if (boundSearch.length) {
					setContext("boundKey", boundSearch[0], false);
				} else {
					const id = { [data.MID]: `${getWsClientIdentity()}.${Math.random().toString(16).slice(2)}.${( new Date()).getUTCMilliseconds()}` };
					setContext("colorwaysBoundManagers", [...context().colorwaysBoundManagers, id]);
					setContext("boundKey", id, false);
				}
				ws?.send(JSON.stringify({
					type: "client-sync-established",
					boundKey: context().boundKey,
					complications: [
						"remote-sources",
						"manager-role",
						"ui-summon"
					]
				}));
				ws?.send(JSON.stringify({
					type: "complication:remote-sources:init",
					boundKey: context().boundKey,
					online: context().colorwaySourceFiles,
					offline: context().customColorways
				}));
				addContextListener("customColorways", (c, value) => {
					ws?.send(JSON.stringify({
						type: "complication:remote-sources:init",
						boundKey: context().boundKey,
						online: context().colorwaySourceFiles,
						offline: value
					}));
				});
				addContextListener("colorwaySourceFiles", (c, value) => {
					ws?.send(JSON.stringify({
						type: "complication:remote-sources:init",
						boundKey: context().boundKey,
						online: value,
						offline: context().customColorways
					}));
				});
				Dispatcher.addListener("COLORWAYS_SEND_COLORWAY", function({ active }) {
					ws?.send(JSON.stringify({
						type: "complication:manager-role:send-colorway",
						active,
						boundKey: context().boundKey
					}));
				});
				Dispatcher.addListener("COLORWAYS_REQUEST_MANAGER", () => {
					ws?.send(JSON.stringify({
						type: "complication:manager-role:request",
						boundKey: context().boundKey
					}));
				});
			}
		}
		if (data.type === "complication:manager-role:granted") {
			setContext("hasManagerRole", true, false);
		}
		if (data.type === "complication:manager-role:revoked") {
			setContext("hasManagerRole", false, false);
		}
		if (data.type === "complication:ui-summon:summon") {
			LayerManager.pushLayer(MainUI);
		}
	};
	ws.onclose = function(e) {
		setContext("boundKey", { "00000000": `${getWsClientIdentity()}.${Math.random().toString(16).slice(2)}.${( new Date()).getUTCMilliseconds()}` }, false);
		setContext("hasManagerRole", false, false);
		setContext("isConnected", false, false);
		destroyContexts();
		Dispatcher.removeListener("COLORWAYS_SEND_COLORWAY", function({ active }) {
			ws?.send(JSON.stringify({
				type: "complication:manager-role:send-colorway",
				active,
				boundKey: context().boundKey
			}));
		});
		Dispatcher.removeListener("COLORWAYS_REQUEST_MANAGER", () => {
			ws?.send(JSON.stringify({
				type: "complication:manager-role:request",
				boundKey: context().boundKey
			}));
		});
		if (context().colorwaysManagerDoAutoconnect && (e.code !== 3001 || hasErrored)) {
			setTimeout(() => connect(), context().colorwaysManagerAutoconnectPeriod);
		}
	};
	ws.onerror = () => hasErrored = true;
}

const $WebSocket = /*#__PURE__*/Object.freeze({
		__proto__: null,
		connect
});

function FeaturePresenter({ items, ...props }) {
	return BdApi.React.createElement("div", { ...props, className: "colorwaysFeaturePresent" }, items.map(({ Icon }) => BdApi.React.createElement("div", { className: "colorwaysFeatureIconContainer" }, BdApi.React.createElement(Icon, { width: 48, height: 48 }))), items.map(({ title }) => BdApi.React.createElement("span", { className: "colorwaysFeatureIconLabel" }, title)));
}

function SelectionCircle() {
	return BdApi.React.createElement("div", { className: "dc-circle-selection" }, BdApi.React.createElement("svg", { className: "dc-circle-selection-check", "aria-hidden": "true", role: "img", xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", fill: "none", viewBox: "0 0 24 24" }, BdApi.React.createElement("circle", { cx: "12", cy: "12", r: "10", fill: "var(--white-500)" }), BdApi.React.createElement("path", { fill: "currentColor", "fill-rule": "evenodd", d: "M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm5.7-13.3a1 1 0 0 0-1.4-1.4L10 14.58l-2.3-2.3a1 1 0 0 0-1.4 1.42l3 3a1 1 0 0 0 1.4 0l7-7Z", "clip-rule": "evenodd", className: "checkmark_cb7c27" })));
}

function Tooltip$1({
	children,
	text,
	position = "top"
}) {
	const [visible, setVisible] = useState(false);
	const [pos, setPos] = useState({ x: 0, y: 0 });
	const tooltip = useRef(null);
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
	useEffect(() => {
		document.addEventListener("mouseout", onWindowUnfocused);
		return () => {
			document.removeEventListener("mouseout", onWindowUnfocused);
		};
	}, []);
	return BdApi.React.createElement(BdApi.React.Fragment, null, children({
		onMouseEnter: (e) => showTooltip(e),
		onMouseLeave: () => setVisible(false),
		onClick: () => setVisible(false)
	}), BdApi.React.createElement("div", { ref: tooltip, className: `dc-tooltip dc-tooltip-${position} ${!visible ? "dc-tooltip-hidden" : ""}`, style: {
		top: `${pos.y}px`,
		left: `${pos.x}px`
	} }, BdApi.React.createElement("div", { className: "dc-tooltip-pointer" }), BdApi.React.createElement("div", { className: "dc-tooltip-content" }, text)));
}

function SettingsPage() {
	const items = [
		{
			name: "Settings",
			component: () => BdApi.React.createElement(Settings$1, null)
		},
		{
			name: "History",
			component: () => BdApi.React.createElement(History, null)
		}
	];
	const [active, setActive] = useState(items[0].name);
	return BdApi.React.createElement(
		TabBar$1,
		{
			active,
			container: ({ children }) => BdApi.React.createElement("div", { className: "dc-page-header" }, children),
			items,
			onChange: setActive
		}
	);
}
function History() {
	const [searchValue, setSearchValue] = useState("");
	const [colorwayUsageMetrics] = useContextualState("colorwayUsageMetrics");
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(
		ComboTextBox,
		{
			value: searchValue,
			onInput: setSearchValue,
			placeholder: "Search for a Colorway..."
		},
		BdApi.React.createElement(
			"button",
			{
				className: "dc-button dc-button-primary",
				style: { flexShrink: "0", width: "fit-content" },
				onClick: async () => {
					saveFile(new File([JSON.stringify(colorwayUsageMetrics)], "colorways_usage_metrics.json", { type: "application/json" }));
				}
			},
			BdApi.React.createElement(DownloadIcon, { width: 14, height: 14 }),
			"Export usage data"
		)
	), BdApi.React.createElement("div", { className: "dc-selector", style: { gridTemplateColumns: "unset", flexGrow: "1" } }, colorwayUsageMetrics.filter(({ id }) => id?.toLowerCase().includes(searchValue.toLowerCase())).map((color) => BdApi.React.createElement("div", { className: "dc-colorway" }, BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label" }, color.id), BdApi.React.createElement("span", { className: "dc-label dc-subnote dc-note" }, "in ", color.source, " \u2022 ", color.uses, " uses"))))));
}
function Settings$1() {
	const contexts = useContexts();
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("span", { className: "dc-field-header" }, "General"), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement(
		Switch$1,
		{
			value: contexts.showColorwaysButton,
			label: "Enable Quick Step",
			id: "showColorwaysButton",
			onChange: (v) => {
				setContext("showColorwaysButton", v);
			}
		}
	), BdApi.React.createElement("span", { className: "dc-note" }, "Shows a button on the top of the servers list that launches the DiscordColorways App.")), BdApi.React.createElement("span", { className: "dc-field-header" }, "App theme"), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
		display: "flex",
		gap: "24px"
	} }, themes.map(({ name, id, preview }) => BdApi.React.createElement(
		Tooltip$1,
		{
			text: name,
			position: "top"
		},
		({ onClick, onMouseEnter, onMouseLeave }) => BdApi.React.createElement("div", { className: "dc-color-swatch-selectable" }, BdApi.React.createElement(
			"div",
			{
				className: "dc-color-swatch",
				onMouseEnter,
				onMouseLeave,
				onClick: (e) => {
					onClick(e);
					setContext("colorwaysPluginTheme", id);
				},
				style: { backgroundColor: preview }
			}
		), contexts.colorwaysPluginTheme === id ? BdApi.React.createElement(SelectionCircle, null) : null)
	)))), BdApi.React.createElement("span", { className: "dc-field-header" }, "Auto Colors"), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
		display: "flex",
		gap: "24px"
	} }, Object.values(getAutoPresets("5865f2")).map(({ name, id, colors }) => BdApi.React.createElement(
		Tooltip$1,
		{
			text: name,
			position: "top"
		},
		({ onClick, onMouseEnter, onMouseLeave }) => BdApi.React.createElement("div", { className: "dc-color-swatch-selectable" }, BdApi.React.createElement(
			"div",
			{
				className: "dc-color-swatch",
				onMouseEnter,
				onMouseLeave,
				onClick: (e) => {
					onClick(e);
					setContext("activeAutoPreset", id);
					if (contexts.activeColorwayObject.id === "Auto" && contexts.activeColorwayObject.sourceType === "auto") {
						const { colors: colors2 } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[id];
						const newObj = {
							id: "Auto",
							sourceType: "auto",
							source: null,
							colors: colors2
						};
						if (!contexts.isConnected) {
							setContext("activeColorwayObject", newObj);
						} else {
							if (!contexts.hasManagerRole) ; else {
								Dispatcher.dispatch("COLORWAYS_SEND_COLORWAY", {
									active: newObj
								});
							}
						}
					}
				}
			},
			BdApi.React.createElement("div", { className: "dc-color-swatch-part", style: { backgroundColor: colors.accent } }),
			BdApi.React.createElement("div", { className: "dc-color-swatch-part", style: { backgroundColor: colors.primary } }),
			BdApi.React.createElement("div", { className: "dc-color-swatch-part", style: { backgroundColor: colors.secondary } }),
			BdApi.React.createElement("div", { className: "dc-color-swatch-part", style: { backgroundColor: colors.tertiary } })
		), contexts.activeAutoPreset === id ? BdApi.React.createElement(SelectionCircle, null) : null)
	))), BdApi.React.createElement("span", { className: "dc-note" }, "The auto colorway allows you to turn your system's accent color into a fully fledged colorway through various Auto Presets.")), BdApi.React.createElement("span", { className: "dc-field-header" }, "Manager"), BdApi.React.createElement(Setting, null, BdApi.React.createElement(
		Switch$1,
		{
			value: contexts.colorwaysManagerDoAutoconnect,
			label: "Automatically retry to connect to Manager",
			id: "autoReconnect",
			onChange: (v) => {
				setContext("colorwaysManagerDoAutoconnect", v);
				if (!contexts.isConnected && v) connect();
			}
		}
	)), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		alignItems: "center",
		cursor: "pointer"
	} }, BdApi.React.createElement("label", { className: "dc-switch-label" }, "Reconnection Delay (in ms)"), BdApi.React.createElement(
		"input",
		{
			type: "number",
			className: "dc-textbox",
			style: {
				width: "100px",
				textAlign: "end"
			},
			value: contexts.colorwaysManagerAutoconnectPeriod,
			autoFocus: true,
			onInput: ({ currentTarget: { value } }) => {
				setContext("colorwaysManagerAutoconnectPeriod", Number(value || "0"));
			}
		}
	))), BdApi.React.createElement("span", { className: "dc-field-header" }, "Manage Settings..."), BdApi.React.createElement(Setting, { divider: true }, BdApi.React.createElement("div", { style: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		alignItems: "center",
		cursor: "pointer"
	} }, BdApi.React.createElement(
		"button",
		{
			className: "dc-button dc-button-primary",
			onClick: () => {
				const data = { ...contexts };
				unsavedContexts.forEach((key) => {
					delete data[key];
				});
				saveFile(new File([JSON.stringify(data)], "DiscordColorways.settings.json", { type: "application/json" }));
			}
		},
		"Export Settings..."
	), BdApi.React.createElement(
		"button",
		{
			className: "dc-button dc-button-danger",
			style: {
				marginLeft: "8px"
			},
			onClick: () => {
				openModal$1((props) => BdApi.React.createElement(
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
								Object.keys(settings).forEach((key) => {
									setContext(key, settings[key], !unsavedContexts.includes(key));
								});
								closeModal();
								initContexts();
							};
						},
						confirmMsg: "Import File...",
						type: "danger"
					},
					"Are you sure you want to import a settings file? Current settings will be overwritten!"
				));
			}
		},
		"Import from JSON file..."
	), BdApi.React.createElement(
		"button",
		{
			className: "dc-button dc-button-danger",
			style: {
				marginLeft: "8px"
			},
			onClick: () => {
				openModal$1((props) => BdApi.React.createElement(
					Modal,
					{
						modalProps: props,
						title: "Reset DiscordColorways",
						onFinish: async ({ closeModal }) => {
							const resetValues = [
								["colorwaysPluginTheme", "discord"],
								["colorwaySourceFiles", []],
								["customColorways", []],
								["activeColorwayObject", nullColorwayObj],
								["activeAutoPreset", "hueRotation"],
								["colorwayData", [], false],
								["showColorwaysButton", false],
								["colorwayUsageMetrics", []],
								["colorwaysManagerDoAutoconnect", true],
								["colorwaysManagerAutoconnectPeriod", 3e3],
								["hasManagerRole", false, false],
								["isConnected", false, false],
								["boundKey", { "00000000": `discord.${Math.random().toString(16).slice(2)}.${( new Date()).getUTCMilliseconds()}` }, false],
								["colorwaysBoundManagers", []]
							];
							setContexts(...resetValues);
							initContexts();
							closeModal();
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
									title: "Your Colorways and presets"
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
		"Reset DiscordColorways"
	))), BdApi.React.createElement("span", { className: "dc-field-header" }, "About"), BdApi.React.createElement("h1", { className: "dc-wordmark" }, "Discord ", BdApi.React.createElement("span", { className: "dc-wordmark-colorways" }, "Colorways")), BdApi.React.createElement(
		"span",
		{
			style: {
				color: "var(--text-normal)",
				fontWeight: 500,
				fontSize: "14px"
			}
		},
		"by Project Colorway"
	), BdApi.React.createElement(
		"span",
		{
			className: "dc-note",
			style: {
				color: "var(--text-normal)",
				fontWeight: 500,
				fontSize: "14px",
				marginBottom: "12px"
			}
		},
		"Version ",
		contexts.discordColorwaysData.version.split(".")[0],
		contexts.discordColorwaysData.version.split(".")[1] !== "0" ? `.${contexts.discordColorwaysData.version.split(".")[1]}` : "",
		contexts.discordColorwaysData.version.split(".")[2] !== "0" ? ` (Patch ${contexts.discordColorwaysData.version.split(".")[2]})` : ""
	), BdApi.React.createElement("div", { style: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		alignItems: "center",
		cursor: "pointer"
	} }, BdApi.React.createElement("a", { role: "link", target: "_blank", className: "dc-button dc-button-primary", style: { width: "fit-content" }, href: "https://github.com/DaBluLite/DiscordColorways" }, "DiscordColorways ", BdApi.React.createElement(OpenExternalIcon, { width: 16, height: 16 })), BdApi.React.createElement("a", { role: "link", target: "_blank", className: "dc-button dc-button-primary", style: { width: "fit-content", marginLeft: "8px" }, href: "https://github.com/DaBluLite/ProjectColorway" }, "Project Colorway ", BdApi.React.createElement(OpenExternalIcon, { width: 16, height: 16 }))));
}

function OnlineSourceMeta({ source, onComplete, fallback = "loading" }) {
	const [data, setData] = useState({ colorways: [], presets: [] });
	const [loaded, setLoaded] = useState(false);
	useEffect(() => {
		(async () => {
			const res = await fetch(source);
			try {
				setData(await res.json());
				setLoaded(true);
			} catch (e) {
				setData({ colorways: [], presets: [] });
				setLoaded(true);
			}
		})();
	}, []);
	return BdApi.React.createElement(BdApi.React.Fragment, null, loaded ? onComplete(data) : fallback);
}
function SourceManager() {
	const [active, setActive] = useState("Installed");
	return BdApi.React.createElement(TabBar$1, { active, container: ({ children }) => BdApi.React.createElement("div", { className: "dc-page-header" }, children), onChange: setActive, items: [
		{
			name: "Installed",
			component: () => BdApi.React.createElement(Installed, null)
		},
		{
			name: "Discover",
			component: () => BdApi.React.createElement(Discover, null)
		}
	] });
}
function Installed() {
	const [colorwaySourceFiles, setColorwaySourceFiles] = useContextualState("colorwaySourceFiles");
	const [customColorwayStores, setCustomColorwayStores] = useContextualState("customColorways");
	const [searchValue, setSearchValue] = useState("");
	const [sortBy, setSortBy] = useState(SortOptions.NAME_AZ);
	const [layout, setLayout] = useState("normal");
	const [showSpinner, setShowSpinner] = useState(false);
	async function setOnline(obj, action) {
		if (action === "add") {
			setColorwaySourceFiles((srcList) => [...srcList, obj]);
		}
		if (action === "remove") {
			setColorwaySourceFiles((srcList) => srcList.filter((src) => src.name !== obj.name && src.url !== obj.url));
		}
		const responses = await Promise.all(
			colorwaySourceFiles.map(
				(source) => fetch(source.url)
			)
		);
		setContext("colorwayData", await Promise.all(
			responses.map((res, i) => ({ response: res, name: colorwaySourceFiles[i].name })).map(
				(res) => res.response.json().then((dt) => ({ colorways: dt.colorways || [], presets: dt.presets || [], source: res.name, type: "online" })).catch(() => ({ colorways: [], presets: [], source: res.name, type: "online" }))
			)
		), false);
	}
	const layouts = [{ name: "Normal", id: "normal" }, { name: "Compact", id: "compact" }];
	function setOffline(obj, action) {
		if (action === "add") {
			setCustomColorwayStores((srcList) => [...srcList, obj]);
		}
		if (action === "remove") {
			setCustomColorwayStores((srcList) => srcList.filter((src) => src.name !== obj.name));
		}
	}
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(
		ComboTextBox,
		{
			placeholder: "Search for sources...",
			value: searchValue,
			onInput: setSearchValue
		},
		BdApi.React.createElement(Spinner, { className: `dc-selector-spinner${!showSpinner ? " dc-selector-spinner-hidden" : ""}` }),
		BdApi.React.createElement(
			"button",
			{
				className: "dc-button dc-button-primary",
				style: { flexShrink: "0" },
				onClick: () => {
					openModal$1((props) => BdApi.React.createElement(
						NewStoreModal,
						{
							modalProps: props,
							onOnline: async ({ name, url }) => setOnline({ name, url }, "add"),
							onOffline: async ({ name }) => setOffline({ name, presets: [], colorways: [] }, "add")
						}
					));
				}
			},
			BdApi.React.createElement(PlusIcon, { width: 14, height: 14 }),
			"New..."
		),
		BdApi.React.createElement(
			StaticOptionsMenu,
			{
				menu: BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: () => setSortBy(1), className: "dc-contextmenu-item" }, "Name (A-Z)", BdApi.React.createElement(Radio, { checked: sortBy === 1, style: {
					marginLeft: "8px"
				} })), BdApi.React.createElement("button", { onClick: () => setSortBy(2), className: "dc-contextmenu-item" }, "Name (Z-A)", BdApi.React.createElement(Radio, { checked: sortBy === 2, style: {
					marginLeft: "8px"
				} })))
			},
			({ onClick }) => BdApi.React.createElement(
				"button",
				{
					onClick,
					className: "dc-button dc-button-primary"
				},
				"Sort By: ",
				(() => {
					switch (sortBy) {
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
				})()
			)
		),
		BdApi.React.createElement(
			"button",
			{
				className: "dc-button dc-button-primary",
				onClick: () => {
					if (layout === "normal") return setLayout("compact");
					else return setLayout("normal");
				}
			},
			"Layout: ",
			layouts.find((l) => l.id === layout)?.name
		),
		BdApi.React.createElement(
			"button",
			{
				className: "dc-button dc-button-primary",
				style: { flexShrink: "0" },
				onClick: async () => {
					const file = await chooseFile("application/json");
					if (!file) return;
					const reader = new FileReader();
					reader.onload = () => {
						try {
							openModal$1((props) => BdApi.React.createElement(
								NewStoreModal,
								{
									modalProps: props,
									offlineOnly: true,
									name: JSON.parse(reader.result).name,
									onOffline: async ({ name }) => {
										setOffline({ name, colorways: JSON.parse(reader.result).colorways || [], presets: JSON.parse(reader.result).presets || [] }, "add");
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
		)
	), BdApi.React.createElement("div", { className: "dc-selector", "data-layout": layout }, getComputedStyle(document.body).getPropertyValue("--os-accent-color") ? BdApi.React.createElement(
		"div",
		{
			className: "dc-colorway",
			style: { cursor: "default" },
			id: "colorwaySource-auto"
		},
		BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label" }, "OS Accent Color"), BdApi.React.createElement("span", { className: "dc-label dc-subnote dc-note" }, BdApi.React.createElement("div", { className: "dc-badge" }, "Offline \u2022 Built-In"), " \u2022 Auto Colorway"))
	) : BdApi.React.createElement(BdApi.React.Fragment, null), ![
		...colorwaySourceFiles.map((src) => ({ ...src, type: "online" })),
		...customColorwayStores.map((src) => ({ ...src, type: "offline" }))
	].length && !getComputedStyle(document.body).getPropertyValue("--os-accent-color") ? BdApi.React.createElement(
		"div",
		{
			className: "dc-colorway",
			id: "colorwaySource-missingSource",
			onClick: async () => setOnline({ name: "Project Colorway", url: defaultColorwaySource }, "add")
		},
		BdApi.React.createElement(WirelessIcon, { width: 30, height: 30, style: { color: "var(--interactive-active)" } }),
		BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label" }, "It's quite emty in here."), BdApi.React.createElement("span", { className: "dc-label dc-subnote dc-note" }, "Click here to add the Project Colorway source"))
	) : null, [
		...colorwaySourceFiles.map((src) => ({ ...src, type: "online" })),
		...customColorwayStores.map((src) => ({ ...src, type: "offline" }))
	].filter((src) => src.name.toLowerCase().includes(searchValue.toLowerCase())).sort((a, b) => {
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
			copy(src.url);
			Toasts.show({
				message: "Copied URL Successfully",
				type: 1,
				id: "copy-url-notify"
			});
		}, className: "dc-contextmenu-item" }, "Copy URL", BdApi.React.createElement(CopyIcon, { width: 16, height: 16, style: {
			marginLeft: "8px"
		} })), BdApi.React.createElement(
			"button",
			{
				className: "dc-contextmenu-item",
				onClick: async () => {
					openModal$1((props) => BdApi.React.createElement(
						NewStoreModal,
						{
							modalProps: props,
							offlineOnly: true,
							name: src.name,
							onOffline: async ({ name }) => {
								const res = await fetch(src.url);
								const data = await res.json();
								setOffline({ name, colorways: data.colorways || [], presets: data.presets || [] }, "add");
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
				className: "dc-contextmenu-item",
				onClick: async () => {
					saveFile(new File([JSON.stringify({ "name": src.name, "colorways": [...src.colorways || []], "presets": [...src.presets || []] })], `${src.name.replaceAll(" ", "-").toLowerCase()}.colorways.json`, { type: "application/json" }));
				}
			},
			"Export as...",
			BdApi.React.createElement(DownloadIcon, { width: 14, height: 14 })
		), BdApi.React.createElement(
			"button",
			{
				className: "dc-contextmenu-item dc-contextmenu-item-danger",
				onClick: async () => {
					openModal$1((props) => BdApi.React.createElement(
						Modal,
						{
							modalProps: props,
							title: "Remove Source",
							onFinish: async ({ closeModal }) => {
								if (src.type === "online") {
									setOnline({ name: src.name, url: src.url }, "remove");
								} else {
									setOffline({ name: src.name, colorways: [], presets: [] }, "remove");
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
				className: "dc-colorway",
				style: { cursor: "default" },
				id: "colorwaySource" + src.name,
				onContextMenu
			},
			BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label" }, src.name), src.type === "online" ? BdApi.React.createElement("span", { className: "dc-label dc-subnote dc-note" }, "Online \u2022 ", BdApi.React.createElement(OnlineSourceMeta, { source: src.url, onComplete: ({ colorways, presets }) => `${(colorways || []).length} colorways \u2022 ${(presets || []).length} presets` })) : BdApi.React.createElement("span", { className: "dc-label dc-subnote dc-note" }, "Offline \u2022 ", (src.colorways || []).length, " colorways \u2022 ", (src.presets || []).length, " presets")),
			BdApi.React.createElement("div", { style: { marginRight: "auto" } }),
			BdApi.React.createElement(
				"button",
				{
					className: "dc-button dc-button-danger",
					onClick: async () => {
						openModal$1((props) => BdApi.React.createElement(
							Modal,
							{
								modalProps: props,
								title: "Remove Source",
								onFinish: async ({ closeModal }) => {
									if (src.type === "online") {
										setOnline({ name: src.name, url: src.url }, "remove");
									} else {
										setOffline({ name: src.name, colorways: [], presets: [] }, "remove");
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
	)));
}
function Discover() {
	const [storeObject, setStoreObject] = useState([]);
	const [searchValue, setSearchValue] = useState("");
	const [colorwaySourceFiles, setColorwaySourceFiles] = useContextualState("colorwaySourceFiles");
	function setOnline(obj, action) {
		if (action === "add") {
			setColorwaySourceFiles((srcList) => [...srcList, obj]);
		}
		if (action === "remove") {
			setColorwaySourceFiles((srcList) => srcList.filter((src) => src.name !== obj.name && src.url !== obj.url));
		}
	}
	useEffect(() => {
		(async function() {
			const res = await fetch("https://dablulite.vercel.app/?q=" + encodeURI(searchValue));
			const data = await res.json();
			setStoreObject(data.sources);
		})();
	}, []);
	return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement(
		ComboTextBox,
		{
			placeholder: "Search for sources...",
			value: searchValue,
			onInput: setSearchValue
		},
		BdApi.React.createElement(
			"button",
			{
				className: "dc-button dc-button-primary",
				style: { marginLeft: "8px", marginTop: "auto", marginBottom: "auto" },
				onClick: async function() {
					const res = await fetch("https://dablulite.vercel.app/");
					const data = await res.json();
					setStoreObject(data.sources);
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
		)
	), BdApi.React.createElement("div", { className: "dc-selector" }, storeObject.map(
		(item) => item.name.toLowerCase().includes(searchValue.toLowerCase()) ? BdApi.React.createElement(RightClickContextMenu, { menu: BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: () => {
			copy(item.url);
			Toasts.show({
				message: "Copied URL Successfully",
				type: 1,
				id: "copy-url-notify"
			});
		}, className: "dc-contextmenu-item" }, "Copy URL", BdApi.React.createElement(CopyIcon, { width: 16, height: 16, style: {
			marginLeft: "8px"
		} })), BdApi.React.createElement(
			"button",
			{
				className: `dc-contextmenu-item${colorwaySourceFiles.map((source) => source.name).includes(item.name) ? " dc-contextmenu-item-danger" : ""}`,
				onClick: async () => {
					if (colorwaySourceFiles.map((source) => source.name).includes(item.name)) {
						openModal$1((props) => BdApi.React.createElement(
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
				className: "dc-colorway",
				style: { cursor: "default" },
				id: "colorwaySource" + item.name,
				onContextMenu
			},
			BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label" }, item.name), BdApi.React.createElement("span", { className: "dc-label dc-subnote dc-note" }, item.description, " \u2022 by ", item.authorGh)),
			BdApi.React.createElement("div", { style: { marginRight: "auto" } }),
			BdApi.React.createElement(
				"button",
				{
					className: `dc-button ${colorwaySourceFiles.map((source) => source.name).includes(item.name) ? "dc-button-danger" : "dc-button-secondary"}`,
					onClick: async () => {
						if (colorwaySourceFiles.map((source) => source.name).includes(item.name)) {
							openModal$1((props) => BdApi.React.createElement(
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
			BdApi.React.createElement("a", { role: "link", className: "dc-button dc-button-secondary", target: "_blank", href: "https://github.com/" + item.authorGh }, BdApi.React.createElement("img", { src: "/assets/6a853b4c87fce386cbfef4a2efbacb09.svg", width: 16, height: 16, alt: "GitHub" }))
		)) : BdApi.React.createElement(BdApi.React.Fragment, null)
	)));
}

function SidebarTab({ id, title, Icon, bottom, onSelect, activeTab, expanded = false, onContextMenu = () => {
}, onMouseEnter = () => {
}, onMouseLeave = () => {
} }) {
	return BdApi.React.createElement(
		"div",
		{
			className: `dc-button ${expanded ? "dc-button-md" : "dc-button-xl dc-button-icon"}${id === activeTab ? " dc-button-secondary" : ""}`,
			onClick: (e) => {
				onSelect(id, e);
			},
			style: {
				...bottom ? { marginTop: "auto" } : {},
				...expanded ? { justifyContent: "start" } : {},
				borderColor: "transparent"
			},
			onContextMenu,
			onMouseEnter,
			onMouseLeave
		},
		BdApi.React.createElement(Icon, { width: expanded ? 18 : 24, height: expanded ? 18 : 24 }),
		expanded && title ? BdApi.React.createElement("span", { style: { marginLeft: "8px" } }, title) : null
	);
}

function MainUI() {
	const [activeTab, setActiveTab] = useState(Tabs.Selector);
	const cont = useRef(null);
	const contexts = Hooks.useContexts();
	const [expanded, setExpanded] = useState(false);
	const ConnectionIcon = contexts.isConnected ? WirelessIcon : WirelessErrorIcon;
	return BdApi.React.createElement(exports.FocusLock, { containerRef: cont }, BdApi.React.createElement("div", { ref: cont, className: `dc-app-root theme-${exports.ThemeStore.theme} ${(themes.find((t) => t.id === contexts.colorwaysPluginTheme)?.classes || []).join(" ")}`, "data-theme": contexts.colorwaysPluginTheme }, BdApi.React.createElement("div", { className: "dc-app-sidebar" }, BdApi.React.createElement(
		"div",
		{
			style: {
				height: "24px",
				minHeight: "unset",
				width: "50px"
			},
			className: `dc-button dc-button-icon ${expanded ? "dc-button-md" : "dc-button-xl"}`,
			onClick: () => setExpanded(!expanded)
		},
		BdApi.React.createElement(CaretIcon, { width: expanded ? 18 : 24, height: expanded ? 18 : 24 })
	), BdApi.React.createElement(
		SidebarTab,
		{
			activeTab,
			onSelect: (id) => {
				setActiveTab(id);
				setExpanded(false);
			},
			Icon: SelectorsIcon,
			id: Tabs.Selector,
			title: "Change Colorway/Preset",
			expanded
		}
	), BdApi.React.createElement(
		SidebarTab,
		{
			activeTab,
			onSelect: (id) => {
				setActiveTab(id);
				setExpanded(false);
			},
			Icon: CogIcon,
			id: Tabs.Settings,
			title: "Settings",
			expanded
		}
	), BdApi.React.createElement(
		SidebarTab,
		{
			activeTab,
			onSelect: (id) => {
				setActiveTab(id);
				setExpanded(false);
			},
			Icon: WidgetsPlusIcon,
			id: Tabs.Sources,
			title: "Sources",
			expanded
		}
	), BdApi.React.createElement("div", { className: "dc-divider", style: { margin: "0" } }), BdApi.React.createElement("div", { style: {
		display: "flex",
		flexDirection: expanded ? "row" : "column",
		gap: "8px"
	} }, BdApi.React.createElement(
		Tooltip$1,
		{
			position: "right",
			text: BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("span", null, contexts.isConnected ? "Connected to manager" : "No manager connected"), contexts.isConnected ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("span", { style: { color: "var(--text-muted)", fontWeight: 500, fontSize: 12 } }, "Bound Key: ", JSON.stringify(contexts.boundKey)), BdApi.React.createElement("span", { style: { color: "var(--text-muted)", fontWeight: 500, fontSize: 12 } }, "Right click for options")) : null)
		},
		({ onMouseEnter, onMouseLeave, onClick }) => BdApi.React.createElement(
			RightClickContextMenu,
			{
				menu: BdApi.React.createElement(BdApi.React.Fragment, null, contexts.isConnected ? BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("button", { onClick: () => copy(JSON.stringify(contexts.boundKey)), className: "dc-contextmenu-item" }, "Copy Bound Key"), BdApi.React.createElement("button", { onClick: () => Dispatcher.dispatch("COLORWAYS_RESTART_WS", {}), className: "dc-contextmenu-item" }, "Reset Connection"), !contexts.hasManagerRole ? BdApi.React.createElement("button", { onClick: () => Dispatcher.dispatch("COLORWAYS_REQUEST_MANAGER", {}), className: "dc-contextmenu-item" }, "Request manager role") : null) : null)
			},
			({ onContextMenu }) => BdApi.React.createElement(
				"div",
				{
					className: `dc-button dc-button-icon ${expanded ? "dc-button-md" : "dc-button-xl"}`,
					onContextMenu: (e) => {
						if (contexts.isConnected) {
							onClick(e);
							onContextMenu(e);
						}
					},
					onMouseEnter,
					onMouseLeave
				},
				BdApi.React.createElement(ConnectionIcon, { width: expanded ? 18 : 24, height: expanded ? 18 : 24, style: contexts.isConnected ? { color: "var(--status-positive)" } : {} })
			)
		)
	), BdApi.React.createElement(
		"div",
		{
			className: `dc-button dc-button-icon ${expanded ? "dc-button-md" : "dc-button-xl"}`,
			onClick: () => LayerManager.popLayer()
		},
		BdApi.React.createElement(CloseIcon, { width: expanded ? 18 : 24, height: expanded ? 18 : 24 })
	))), BdApi.React.createElement("div", { className: "dc-modal-content", style: { width: "100%" } }, activeTab === Tabs.Selector && BdApi.React.createElement(Selector, null), activeTab === Tabs.Sources && BdApi.React.createElement(SourceManager, null), activeTab === Tabs.Settings && BdApi.React.createElement(SettingsPage, null))));
}

function SettingsListButton() {
	const [activeColorwayObject] = Hooks.useContextualState("activeColorwayObject");
	return BdApi.React.createElement("div", { className: "dc-discordsettings-itm", onClick: () => LayerManager.pushLayer(MainUI) }, BdApi.React.createElement("div", { className: "dc-label-wrapper" }, BdApi.React.createElement("span", { className: "dc-label dc-label-Settings", style: { margin: 0 } }, "Discord Colorways"), BdApi.React.createElement("span", { className: "dc-label dc-subnote dc-note", style: { margin: 0 } }, "Active colorway: ", activeColorwayObject.id ? activeColorwayObject.id : "None")));
}

const sections = [
	{
		section: "CUSTOM",
		element: () => BdApi.React.createElement(SettingsListButton, null)
	},
	{
		section: "DIVIDER"
	}
];

const $Settings = /*#__PURE__*/Object.freeze({
		__proto__: null,
		sections
});

const Settings = $Settings;
function start(callback = () => {
}) {
	Styles.setStyle("dc-css-main", css$2);
	Styles.setStyle("dc-css-theme-discord", css$1);
	Styles.setStyle("dc-css-theme-discordvr", css);
	Contexts.initContexts().then((contexts) => {
		window.customElements.define("active-colorway", HTMLColorwayElement, { extends: "style" });
		document.head.append(Object.assign(document.createElement("style", { is: "active-colorway" })));
		WebSocket$1.connect();
		callback(contexts);
	});
}
function stop() {
	Styles.removeStyle("dc-css-main");
	Styles.removeStyle("dc-css-theme-discord");
	Styles.removeStyle("dc-css-theme-discordvr");
	Dispatcher.dispatch("COLORWAYS_CLOSE_WS", {});
	Dispatcher.dispatch("COLORWAYS_REMOVE_ACTIVE_COLORWAY_CSS", {});
}

const $Discord = /*#__PURE__*/Object.freeze({
		__proto__: null,
		Settings,
		start,
		stop
});

const events = {};
function addListener(event, callback) {
	FluxDispatcher.subscribe(event, callback);
}
function removeListener(event, callback) {
	FluxDispatcher.unsubscribe(event, callback);
}
function dispatch(event, details) {
	FluxDispatcher.dispatch({
		type: event,
		...details
	});
}

const $Dispatcher = /*#__PURE__*/Object.freeze({
		__proto__: null,
		events,
		addListener,
		removeListener,
		dispatch
});

class $HTMLColorwayElement extends HTMLStyleElement {
	constructor() {
		super();
		this.updateCSS();
		this.id = "active-colorway";
	}
	logger = new Logger("Colorway CSS");
	connectedCallback() {
		Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", () => this.updateCSS());
		Dispatcher.addListener("COLORWAYS_REMOVE_ACTIVE_COLORWAY_CSS", () => this.remove());
	}
	disconnectedCallback() {
		Dispatcher.removeListener("COLORWAYS_CONTEXT_UPDATED", () => this.updateCSS());
		Dispatcher.removeListener("COLORWAYS_REMOVE_ACTIVE_COLORWAY_CSS", () => this.remove());
	}
	updateCSS(obj) {
		const [contexts, destroyContexts] = Hooks.simpleContexts();
		if (contexts().activeColorwayObject.id) {
			const { colors } = contexts().activeColorwayObject;
			const css = Styles.compileColorwayCSS(contexts().activePresetObject.css, colors);
			const conditions = (contexts().activePresetObject.conditions || []).map(({ if: val1, is, than, onCondition, onConditionElse }) => {
				if (Presets.conditionFunctions[is](HexToHSL(colors[val1.split("-")[0]])[getHSLIndex(val1.split("-")[1])], Number(than))) return Styles.compileColorwayCSS(onCondition, colors);
				else return Styles.compileColorwayCSS(onConditionElse || "", colors);
			}).join("\n");
			this.textContent = css + "\n" + conditions;
		}
		if (contexts().activeColorwayObject.id === null) {
			this.textContent = null;
		}
		return destroyContexts();
	}
}

function pushLayer(component) {
	FluxDispatcher.dispatch({
		type: "LAYER_PUSH",
		component
	});
}
function popLayer() {
	FluxDispatcher.dispatch({
		type: "LAYER_POP"
	});
}
function popAllLayers() {
	FluxDispatcher.dispatch({
		type: "LAYER_POP_ALL"
	});
}

const $LayerManager = /*#__PURE__*/Object.freeze({
		__proto__: null,
		pushLayer,
		popLayer,
		popAllLayers
});

const conditionFunctions = {
	equal(val1, val2) {
		return val1 === val2;
	},
	greaterThan(val1, val2) {
		return val1 > val2;
	},
	lowerThan(val1, val2) {
		return val1 < val2;
	}
};

const $Presets = /*#__PURE__*/Object.freeze({
		__proto__: null,
		conditionFunctions
});

function setStyle(id, css) {
	if (!document.getElementById(id)) {
		document.head.append(Object.assign(document.createElement("style"), {
			id,
			textContent: css
		}));
	} else {
		document.getElementById(id).textContent = css;
	}
}
function removeStyle(id) {
	if (!document.getElementById(id)) {
		return false;
	} else {
		if (document.getElementById(id).tagName === "STYLE") {
			document.getElementById(id).remove();
			return true;
		} else {
			return false;
		}
	}
}
function compileColorwayCSS(css, colors) {
	return css.replaceAll(/(colorway\((accent|primary|secondary|tertiary)(|-(h|s|l))\)|\{\{(accent|primary|secondary|tertiary)(|-(h|s|l))\}\})/g, (a, b, c, d, e, f, g, h) => h ? HexToHSL(colors[c])[getHSLIndex(h)] : e ? HexToHSL(colors[c])[getHSLIndex(e)] : colors[c]);
}

const $Styles = /*#__PURE__*/Object.freeze({
		__proto__: null,
		setStyle,
		removeStyle,
		compileColorwayCSS
});

const DataStore = $DataStore;
const Styles = $Styles;
const Dispatcher = $Dispatcher;
const Contexts = $Contexts;
const Hooks = $Hooks;
const WebSocket$1 = $WebSocket;
const Utils = $Utils;
const LayerManager = $LayerManager;
const Discord = $Discord;
const Presets = $Presets;
class HTMLColorwayElement extends $HTMLColorwayElement {
}
class Logger {
	constructor(name) {
		this.name = name;
	}
	static makeTitle(color, title) {
		return ["%c %c %s ", "", `background: ${color}; color: black; font-weight: bold; border-radius: 5px;`, title];
	}
	_log(level, levelColor, args) {
		console[level](
			`%c DiscordColorways %c %c ${this.name} %c`,
			"background-color: #5865f2; color: #fff; font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0 4px; border-radius: 4px;",
			"",
			"background-color: #5865f2; color: #fff; font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0 4px; border-radius: 4px;",
			"",
			...args
		);
	}
	log(...args) {
		this._log("log", "#a6d189", args);
	}
	info(...args) {
		this._log("info", "#a6d189", args);
	}
	error(...args) {
		this._log("error", "#e78284", args);
	}
	warn(...args) {
		this._log("warn", "#e5c890", args);
	}
	debug(...args) {
		this._log("debug", "#eebebe", args);
	}
}

const API = /*#__PURE__*/Object.freeze({
		__proto__: null,
		DataStore,
		Styles,
		Dispatcher,
		Contexts,
		Hooks,
		WebSocket: WebSocket$1,
		Utils,
		LayerManager,
		Discord,
		Presets,
		HTMLColorwayElement,
		Logger
});

function SwatchLauncher() {
	return BdApi.React.createElement(
		Tooltip$1,
		{
			text: BdApi.React.createElement("span", { className: "dc-tooltip-normal-text" }, "Explore Discord Colorways"),
			position: "top"
		},
		({ onClick, onMouseEnter, onMouseLeave }) => BdApi.React.createElement("div", { className: "dc-color-swatch-selectable" }, BdApi.React.createElement(
			"div",
			{
				className: "dc-color-swatch",
				onMouseEnter,
				onMouseLeave,
				onClick: (e) => {
					onClick(e);
					LayerManager.pushLayer(() => BdApi.React.createElement(MainUI, null));
				},
				style: { justifyContent: "center", alignItems: "center", boxShadow: "inset 0 0 0 1px var(--interactive-normal)" }
			},
			BdApi.React.createElement(PalleteIcon, { style: { color: "var(--header-primary)" } })
		))
	);
}

const unconfigurable = ["arguments", "caller", "prototype"];
const handler = {};
const SYM_LAZY_GET = Symbol.for("dc.lazy.get");
const SYM_LAZY_CACHED = Symbol.for("dc.lazy.cached");
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
	handler[method] = (target, ...args) => Reflect[method](target[SYM_LAZY_GET](), ...args);
}
handler.ownKeys = (target) => {
	const v = target[SYM_LAZY_GET]();
	const keys = Reflect.ownKeys(v);
	for (const key of unconfigurable) {
		if (!keys.includes(key)) keys.push(key);
	}
	return keys;
};
handler.getOwnPropertyDescriptor = (target, p) => {
	if (typeof p === "string" && unconfigurable.includes(p))
		return Reflect.getOwnPropertyDescriptor(target, p);
	const descriptor = Reflect.getOwnPropertyDescriptor(target[SYM_LAZY_GET](), p);
	if (descriptor) Object.defineProperty(target, p, descriptor);
	return descriptor;
};
function proxyLazy(factory, attempts = 5, isChild = false) {
	let isSameTick = true;
	if (!isChild)
		setTimeout(() => isSameTick = false, 0);
	let tries = 0;
	const proxyDummy = Object.assign(function() {
	}, {
		[SYM_LAZY_CACHED]: void 0,
		[SYM_LAZY_GET]() {
			if (!proxyDummy[SYM_LAZY_CACHED] && attempts > tries++) {
				proxyDummy[SYM_LAZY_CACHED] = factory();
				if (!proxyDummy[SYM_LAZY_CACHED] && attempts === tries)
					console.error("Lazy factory failed:", factory);
			}
			return proxyDummy[SYM_LAZY_CACHED];
		}
	});
	return new Proxy(proxyDummy, {
		...handler,
		get(target, p, receiver) {
			if (p === SYM_LAZY_CACHED || p === SYM_LAZY_GET)
				return Reflect.get(target, p, receiver);
			if (!isChild && isSameTick)
				return proxyLazy(
					() => Reflect.get(target[SYM_LAZY_GET](), p, receiver),
					attempts,
					true
				);
			const lazyTarget = target[SYM_LAZY_GET]();
			if (typeof lazyTarget === "object" || typeof lazyTarget === "function") {
				return Reflect.get(lazyTarget, p, receiver);
			}
			throw new Error("proxyLazy called on a primitive value");
		}
	});
}

function getByKeysLazy(...props) {
	return proxyLazy(() => betterdiscord.Webpack.getByKeys(...props));
}
function getByPrototypeKeysLazy(...props) {
	return proxyLazy(() => betterdiscord.Webpack.getByPrototypeKeys(...props));
}
function getByStringsLazy(...props) {
	return proxyLazy(() => betterdiscord.Webpack.getByStrings(...props));
}
function getLazy(filter, options) {
	return proxyLazy(() => betterdiscord.Webpack.getModule(filter, options));
}
const Filters$1 = {
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
		const filter = Filters$1.byCode(...code);
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

const $Webpack = /*#__PURE__*/Object.freeze({
		__proto__: null,
		getByKeysLazy,
		getByPrototypeKeysLazy,
		getByStringsLazy,
		getLazy,
		Filters: Filters$1
});

const Webpack = {
	...$Webpack,
	...BdApi.Webpack,
	Filters: {
		...BdApi.Webpack.Filters,
		byName(name) {
			return (target) => (target?.displayName ?? target?.constructor?.displayName) === name;
		},
		byKeys(...keys) {
			return (target) => target instanceof Object && keys.every((key) => key in target);
		},
		byProtos(...protos) {
			return (target) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
		},
		bySource(...fragments) {
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
		byCode(...code) {
			return (m) => {
				if (typeof m !== "function") return false;
				const s = Function.prototype.toString.call(m);
				for (const c of code) {
					if (!s.includes(c)) return false;
				}
				return true;
			};
		},
		componentByCode(...code) {
			const filter = this.byCode(...code);
			return (m) => {
				if (filter(m)) return true;
				if (!m.$$typeof) return false;
				if (m.type && m.type.render) return filter(m.type.render);
				if (m.type) return filter(m.type);
				if (m.render) return filter(m.render);
				return false;
			};
		}
	}
};

const { Filters } = Webpack;
betterdiscord.ReactDOM?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.Events ?? [];
const {
	useStateFromStores
} = proxyLazy(() => Webpack.getModule(Filters.byProps("useStateFromStores")));
exports.Forms = {};
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
exports.Popout = void 0;
let Dialog;
let TabBar;
let Paginator;
let ScrollerThin;
let Clickable;
let Avatar;
exports.FocusLock = void 0;
let useToken;
exports.CustomColorPicker = void 0;
Webpack.getByKeys("open", "saveAccountChanges");
({ ...Webpack.getByKeys("MenuItem", "MenuSliderControl") });
const Toasts = {
	...{}
};
Webpack.waitForModule(Filters.byKeys("showToast")).then((m) => {
	Toasts.show = m.showToast;
	Toasts.pop = m.popToast;
	Toasts.create = m.createToast;
});
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
		Popout: exports.Popout,
		Dialog,
		Paginator,
		ScrollerThin,
		Clickable,
		Avatar,
		FocusLock: exports.FocusLock,
		CustomColorPicker: exports.CustomColorPicker
	} = m);
	exports.Forms = m;
});
exports.UserStore = void 0;
exports.ThemeStore = void 0;
proxyLazy(
	() => Webpack.getByKeys("openUserProfileModal", "closeUserProfileModal")
);
proxyLazy(
	() => Webpack.getByKeys("getUser", "fetchCurrentUser")
);
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
waitForStore("ThemeStore", (s) => exports.ThemeStore = s);
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
({
	closeContextMenu: betterdiscord.ContextMenu.close,
	openContextMenu: betterdiscord.ContextMenu.open
});
const hljs = Webpack.getByKeysLazy("highlight", "registerLanguage");

const getThemesList = async () => betterdiscord.Themes.getAll();
const getThemeData = async (themeName) => betterdiscord.Themes.getAll().find((theme) => theme.filename === themeName).CSS;
let DiscordThemeSelector;
const ContextMenuApi = {
	...betterdiscord.ContextMenu,
	closeContextMenu() {
		this.close();
	},
	openContextMenu(event, menuComponent, config) {
		this.open(event, menuComponent, config);
	}
};
const { useState, useEffect, useRef, useReducer, useCallback } = betterdiscord.React;
class DiscordColorways {
	ProjectColorway = API;
	load() {
		DiscordThemeSelector = betterdiscord.Webpack.getByKeys("Basic");
	}
	start() {
		betterdiscord.Patcher.after(DiscordThemeSelector, "Basic", (_, props, child) => {
			const oldChild = child.props.children;
			child.props.children = [oldChild, BdApi.React.createElement(SwatchLauncher, null)];
		});
		Discord.start();
	}
	stop() {
		betterdiscord.Patcher.unpatchAll();
		Discord.stop();
	}
}

exports.ContextMenuApi = ContextMenuApi;
exports.FluxDispatcher = FluxDispatcher;
exports.ModalAPI = ModalAPI;
exports.Toasts = Toasts;
exports["default"] = DiscordColorways;
exports.getThemeData = getThemeData;
exports.getThemesList = getThemesList;
exports.hljs = hljs;
exports.openModal = openModal;
exports.useCallback = useCallback;
exports.useEffect = useEffect;
exports.useReducer = useReducer;
exports.useRef = useRef;
exports.useState = useState;
exports.useStateFromStores = useStateFromStores;

/*@end@*/