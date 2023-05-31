/**
* @name DiscordColorways
* @displayName Discord Colorways
* @authorId 582170007505731594
* @invite ZfPH6SDkMW
* @version 1.0.2
*/
/*@cc_on
@if (@_jscript)
     
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you"ve mistakenly tried to run me directly. \n(Don"t do that!)", 0, "I"m a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I"m in the correct folder already.", 0, "I"m already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can"t find the BetterDiscord plugins folder.\nAre you sure it"s even installed?", 0, "Can"t install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord"s plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I"m installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();
@else@*/

let colorwayList;
let defaultSettings = {
    activeColorway: "",
    activeColorwayID: "disablecolorway"
};
let userSettings = {};
let completeSettings = Object.assign(userSettings, defaultSettings, BdApi.loadData("DiscordColorways", "settings"));
BdApi.saveData("DiscordColorways", "settings", completeSettings);
module.exports = (() => {
    const config = {
        info: {
            name: "Discord Colorways",
            authors: [
                {
                    name: "DaBluLite",
                    discord_id: "582170007505731594",
                    github_username: "DaBluLite"
                }
            ],
            version: "1.0.2",
            description: "A set of Color-Only themes for Discord, because who doesn't like a little color? (This code is heavily based on [Platformindicators](https://github.com/Strencher/BetterDiscordStuff/tree/master/PlatformIndicators))",
            github: "https://github.com/DaBluLite/DiscordColorways/blob/master/DiscordColorways.plugin.js",
            github_raw: "https://github.com/DaBluLite/DiscordColorways/raw/master/DiscordColorways.plugin.js"
        }
    };
    
    return !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config;
        }
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library plugin is needed", [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`], {
                confirmText: "Download",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error)
                            return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
            const {DiscordClasses, DOMTools, Utilities, WebpackModules, PluginUtilities, ReactTools, DiscordModules: {LocaleManager: {Messages}, UserStatusStore, UserStore}} = Api;
            const Dispatcher = WebpackModules.getByProps("dispatch", "register");
            const Flux = Object.assign({}, WebpackModules.getByProps("Store", "connectStores"), WebpackModules.getByProps("useStateFromStores"));
            const SessionsStore = WebpackModules.getByProps("getSessions", "_dispatchToken");
 
            const {Webpack, Webpack: {Filters}} = BdApi;
            const [BasicThemeSelector, ThemeEditor] = Webpack.getBulk.apply(null, [
                Filters.byProps("basicThemeSelectors"),
                Filters.byProps("themeEditor")
            ].map(fn => ({filter: fn})));


            const Settings = new class Settings extends Flux.Store {
                constructor() {super(Dispatcher, {});}
                _settings = PluginUtilities.loadSettings(config.info.name, {});
 
                get(key, def) {
                    return this._settings[key] ?? def;
                }
 
                set(key, value) {
                    this._settings[key] = value;
                    this.emitChange();
                }
            };

            const StoreWatcher = {
                _stores: [Settings, UserStatusStore, UserStore, SessionsStore],
                _listeners: new Set,
                onChange(callback) {
                    this._listeners.add(callback);
                },
                offChange(callback) {
                    this._listeners.add(callback);
                },
                _alertListeners() {
                    StoreWatcher._listeners.forEach(l => l());
                },
                _init() {
                    this._stores.forEach(store => store.addChangeListener(this._alertListeners));
                },
                _stop() {
                    this._stores.forEach(store => store.addChangeListener(this._alertListeners));
                }
            };

            const createElement = (type, props, ...children) => {
                if (typeof type === "function") return type({...props, children: [].concat()})

                const node = document.createElement(type);

                for (const key of Object.keys(props)) {
                    if (key.indexOf("on") === 0) node.addEventListener(key.slice(2).toLowerCase(), props[key]);
                    else if (key === "children") {
                        node.append(...(Array.isArray(props[key]) ? props[key] : [].concat(props[key])));
                    } else {
                        node.setAttribute(key === "className" ? "class" : key, props[key]);
                    }
                }

                if (children.length) node.append(...children);

                return node;
            };

            class ColorwaySelector {
                constructor(target) {
                    this.ref = null;
                    this.target = target;
                    this._destroyed = false;

                    target._patched = true;

                    this.container = createElement("div", {
                        className: Utilities.className("ColorwaySelectorWrapper"),
                    },);


                    DOMTools.onRemoved(target, () => this.unmount());

                    StoreWatcher.onChange(this.handleChange);
                }

                unmount() {
                    this.ref?.remove();
                    this._destroyed = true;
                    StoreWatcher.offChange(this.handleChange);
                    this.target._patched = false;
                }

                mount() {
                    if (this._destroyed) return false;

                    const res = this.render();
                    if (!res) this.ref?.remove();
                    else {
                        if (this.ref) {
                            this.ref.replaceWith(res);
                        } else {
                            this.target.appendChild(res);
                        }
                        
                        this.ref = res;
                    }
                }

                handleChange = () => {
                    if (this._destroyed) return false;

                    if (this.state && _.isEqual(this.state, this.getState())) return;

                    this.mount();
                }

                getState() {
                    
                }

                render() {
                    let colorwayArray = [];
                    colorwayArray.push(createElement("div", {
                        className: Utilities.className("discordColorway"),
                        id: "colorway-disablecolorway",
                        onclick: (el) => {
                            try {
                                PluginUtilities.removeStyle("activeColorway")
                            } catch(e) {
                                console.log("No active colorway, moving on");
                            }
                            userSettings = {
                                activeColorway: "",
                                activeColorwayID: "disablecolorway"
                            }
                            BdApi.saveData("DiscordColorways", "settings", userSettings);
                            PluginUtilities.addStyle("activeColorway", BdApi.loadData("DiscordColorways", "settings").activeColorway);
                            try {
                                if(document.querySelector(".discordColorway.active") != "colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                                    document.querySelector(".discordColorway.active").classList.remove("active");
                                }
                            } catch(e) {
                                console.warn("Uncaught Exception: " + e);
                            }
                            el.path[1].classList.add("active");
                        }
                    }, createElement("div", {
                        className: Utilities.className("colorwayDisableIcon")
                    }),
                    createElement("div", {
                        className: Utilities.className("colorwayCheckIconContainer")
                    },
                    createElement("div", {
                        className: Utilities.className("colorwayCheckIcon")
                    }))
                    ));
                    try {
                        colorwayList.forEach((colorway) => {
                            let colorwayElem = createElement("div", {
                                className: Utilities.className("discordColorway"),
                                id: "colorway-" + colorway.name,
                                onclick: (el) => {
                                    try {
                                        PluginUtilities.removeStyle("activeColorway")
                                    } catch(e) {
                                        console.log("No active colorway, moving on");
                                    }
                                    userSettings = {
                                        activeColorway: colorway.import,
                                        activeColorwayID: colorway.name
                                    }
                                    BdApi.saveData("DiscordColorways", "settings", userSettings);
                                    PluginUtilities.addStyle("activeColorway", BdApi.loadData("DiscordColorways", "settings").activeColorway);
                                    try {
                                        if(document.querySelector(".discordColorway.active") != "colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                                            document.querySelector(".discordColorway.active").classList.remove("active");
                                        }
                                    } catch(e) {
                                        console.warn("Uncaught Exception: " + e);
                                    }
                                    el.path[1].classList.add("active");
                                }
                            },
                                createElement("div", {
                                    className: Utilities.className("discordColorwayPreviewColor"),
                                    style: "background-color: " + colorway.accent
                                }),
                                createElement("div", {
                                    className: Utilities.className("discordColorwayPreviewColor"),
                                    style: "background-color: " + colorway.primary
                                }),
                                createElement("div", {
                                    className: Utilities.className("discordColorwayPreviewColor"),
                                    style: "background-color: " + colorway.secondary
                                }),
                                createElement("div", {
                                    className: Utilities.className("discordColorwayPreviewColor"),
                                    style: "background-color: " + colorway.tertiary
                                }),
                                createElement("div", {
                                    className: Utilities.className("colorwayCheckIconContainer")
                                },
                                createElement("div", {
                                    className: Utilities.className("colorwayCheckIcon")
                                }))
                            );
                            colorwayArray.push(colorwayElem);
                        });
                    } catch(e) {
                        console.warn("Unexpected error: " + e);
                    }

                    const container = this.container.cloneNode(true);
                    const state = this.state = this.getState();

                    container._unmount = this.unmount.bind(this);

                    this.colorwayHeaderContainer = createElement("div", {
                        className: Utilities.className("colorwayHeaderContainer")
                    },
                    createElement("div", {
                        className: Utilities.className("colorwayHeaderTitle")
                    }, "Colorways"),
                    createElement("button", {
                        className: Utilities.className("button-ejjZWC lookFilled-1H2Jvj colorBrand-2M3O3N sizeSmall-3R2P2p grow-2T4nbg"),
                        type: "button",
                        onclick: () => {
                            colorwayList = fetch("https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json").then(res => res.json()).then(colors => {
                                colorwayList = colors.colorways;
                                document.querySelectorAll("ColorwaySelector").forEach(el => el._unmount?.());
                                for (const className in ElementInjections) {
                                    const elements = Array.from(document.body.getElementsByClassName(className));
        
                                    if (elements.length) {
                                        ElementInjections[className](elements);
                                    }
                                }
                            });
                        }
                    }, "Refresh Colorway List")
                    );
                    container.append(this.colorwayHeaderContainer);

                    colorwayArray.forEach(elem => {
                        container.append(elem);
                        if(elem.id == `colorway-${BdApi.loadData("DiscordColorways", "settings").activeColorwayID}`) {
                            elem.classList.add("active");
                        }
                    });

                    if(!document.querySelector(".discordColorway.active")) {
                        try {
                            document.getElementById("colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID).classList.add("active");
                        } catch(e) {
                            console.warn("Uncaught Exception: " + e);
                        }
                    }

                    return container;
                }
            }

            const ElementInjections = {
                "basicThemeSelectors-2wNKs6": elements => {
                    for (const el of elements) {
                        if (el.getElementsByClassName("ColorwaySelectorWrapper").length || el._patched) continue;

                        new ColorwaySelector(el).mount();
                    }
                },
                [ThemeEditor?.editorBody]: elements => {
                    console.log(ThemeEditor.editorBody);
                    for (const el of elements) {
                        if (el.getElementsByClassName("ColorwaySelectorWrapper").length || el._patched) continue;

                        new ColorwaySelector(el).mount();
                    }
                }
            };
            return class DiscordColorways extends Plugin {
                css = `
                .discordColorway {
                    height: 60px;
                    width: 60px;
                    border-radius: 50%;
                    box-shadow: inset 0 0 0 1px var(--interactive-normal);
                    cursor: pointer;
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    position: relative;
                }
                .discordColorway.active {
                    box-shadow: inset 0 0 0 2px var(--brand-500),inset 0 0 0 4px var(--background-primary);
                }
                #colorway-disablecolorway > .colorwayDisableIcon {
                    height: 60px;
                    width: 60px;
                    background-color: var(--header-primary);
                    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' role='img' class='closeIcon-pSJDFz' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z'%3E%3C/path%3E%3C/svg%3E");
                    -webkit-mask-size: 24px;
                    -webkit-mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                }
                .colorwayCheckIconContainer {
                    height: 20px;
                    width: 20px;
                    background-color: var(--brand-500);
                    position: absolute;
                    top: 0;
                    right: 0;
                    border-radius: 50%;
                    opacity: 0;
                }
                .discordColorway.active .colorwayCheckIconContainer {
                    opacity: 1;
                }
                .colorwayCheckIcon {
                    height: 20px;
                    width: 20px;
                    background-color: var(--white-500);
                    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' role='img' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath fill='var(--white-500)' fill-rule='evenodd' clip-rule='evenodd' d='M8.99991 16.17L4.82991 12L3.40991 13.41L8.99991 19L20.9999 7.00003L19.5899 5.59003L8.99991 16.17Z'%3E%3C/path%3E%3C/svg%3E");
                    -webkit-mask-size: 18px;
                    -webkit-mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                }
                .discordColorwayPreviewColor {
                    width: 27px;
                    height: 27px;
                }
                .discordColorwayPreviewColor:first-of-type {
                    border-radius: 50px 0 0 0;
                    margin-top: 3px;
                    margin-left: 3px;
                }
                .discordColorwayPreviewColor:nth-of-type(2) {
                    border-radius: 0 50px 0 0;
                    margin-top: 3px;
                    margin-right: 3px;
                }
                .discordColorwayPreviewColor:nth-of-type(3) {
                    border-radius: 0 0 0 50px;
                    margin-bottom: 3px;
                    margin-left: 3px;
                }
                .discordColorwayPreviewColor:nth-of-type(4) {
                    border-radius: 0 0 50px 0;
                    margin-bottom: 3px;
                    margin-right: 3px;
                }

                .discordColorway.active > .discordColorwayPreviewColor {
                    width: 26px;
                    height: 26px;
                }
                .discordColorway.active > .discordColorwayPreviewColor:first-of-type {
                    margin-top: 4px;
                    margin-left: 4px;
                }
                .discordColorway.active > .discordColorwayPreviewColor:nth-of-type(2) {
                    margin-top: 4px;
                    margin-right: 4px;
                }
                .discordColorway.active > .discordColorwayPreviewColor:nth-of-type(3) {
                    margin-bottom: 4px;
                    margin-left: 4px;
                }
                .discordColorway.active > .discordColorwayPreviewColor:nth-of-type(4) {
                    margin-bottom: 4px;
                    margin-right: 4px;
                }
                .ColorwaySelectorWrapper {
                    display: flex;
                    gap: 16px 24px;
                    position: relative;
                    margin-top: 40px;
                    width: 100%;
                }
                .colorwayHeaderContainer {
                    position: absolute;
                    top: -40px;
                    left: 0;
                    height: 32px;
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                }
                .colorwayHeaderTitle {
                    color: var(--header-secondary);
                    font-family: var(--font-display);
                    font-size: 12px;
                    line-height: 16px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: .02em;
                }
                .editorBody-1rnOXH > .ColorwaySelectorWrapper {
                    width: 228px;
                    flex-wrap: wrap;
                }
                .editorBody-1rnOXH .colorwayHeaderContainer button {
                    display: none;
                }
                `;
                onStart() {
                    colorwayList = fetch("https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json").then(res => res.json()).then(colors => colorwayList = colors.colorways);
                    PluginUtilities.addStyle(config.info.name, this.css);
                    StoreWatcher._init();

                    for (const className in ElementInjections) {
                        const elements = Array.from(document.body.getElementsByClassName(className));

                        if (elements.length) {
                            console.log(elements);
                            ElementInjections[className](elements);
                        }
                    }
                    try {
                        PluginUtilities.removeStyle("activeColorway")
                    } catch(e) {
                        console.log("No active colorway, moving on");
                    }
                    try {
                        PluginUtilities.addStyle("activeColorway", BdApi.loadData("DiscordColorways", "settings").activeColorway);
                    } catch(e) {
                        console.log("No active colorway, moving on");
                    }
                }

                observer({addedNodes}) {
                    for (const added of addedNodes) {
                        if (added.nodeType === Node.TEXT_NODE) continue;

                        for (const className in ElementInjections) {
                            const elements = Array.from(added.getElementsByClassName(className));

                            if (elements.length) {
                                console.log(className);
                                ElementInjections[className](elements);
                            }
                        }
                    }
                }

                onStop() {
                    StoreWatcher._stop();
                    StoreWatcher._listeners.clear();
                    PluginUtilities.removeStyle(config.info.name);
                    PluginUtilities.removeStyle("activeColorway");
                    document.querySelectorAll("ColorwaySelector").forEach(el => el._unmount?.());
                    BdApi.saveData("DiscordColorways", "settings", userSettings);
                }
            };
        };
        return plugin(Plugin, Api);
        //@ts-ignore
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
