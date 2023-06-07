/**
* @name DiscordLayouts
* @displayName Discord Layouts
* @authorId 582170007505731594
* @invite ZfPH6SDkMW
* @version 1.0.0
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

let layoutlist;
let defaultSettings = {
    activeLayout: "",
    activeLayoutID: "Default"
};
let userSettings = {};
let completeSettings = Object.assign(userSettings, defaultSettings, BdApi.loadData("DiscordLayouts", "settings"));
BdApi.saveData("DiscordLayouts", "settings", completeSettings);
module.exports = (() => {
    const config = {
        info: {
            name: "Discord Layouts",
            authors: [
                {
                    name: "DaBluLite",
                    discord_id: "582170007505731594",
                    github_username: "DaBluLite"
                }
            ],
            version: "1.0.0",
            description: "A set of Layouts for Discord, to go alongside DiscordColorways (DiscordColorways plugin is REQUIRED) (This code is heavily based on [Platformindicators](https://github.com/Strencher/BetterDiscordStuff/tree/master/PlatformIndicators))"
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
            const {DiscordClasses, DOMTools, Utilities, WebpackModules, PluginUtilities, ReactTools, Components, Popouts, DiscordModules: {LocaleManager: {Messages}, UserStatusStore, UserStore}} = Api;
            const Dispatcher = WebpackModules.getByProps("dispatch", "register");
            const Flux = Object.assign({}, WebpackModules.getByProps("Store", "connectStores"), WebpackModules.getByProps("useStateFromStores"));
            const SessionsStore = WebpackModules.getByProps("getSessions", "_dispatchToken");
 
            const {Webpack, Webpack: {Filters}, React} = BdApi;
            const Toast = Webpack.getModule(m => m.createToast);
            
            let nativeToast = (text,type) => {
                let toast = Toast.createToast(text,type);
                Toast.showToast(toast);
            }

            let modalBtn = (text,options) => {
                options['class'] = "button-ejjZWC lookFilled-1H2Jvj colorBrand-2M3O3N sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn";
                return createElement("button", options, text);
            }
            let modalBtnGray = (text,options) => {
                options['class'] = "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn";
                return createElement("button", options, text);
            }
            let betaBadge = () => {
                return createElement("div", {
                    class: "textBadge-1fdDPJ base-3IDx3L eyebrow-132Xza baseShapeRound-3epLEv",
                    style: "background-color: var(--brand-500);"
                }, "Beta");
            }
            let alphaBadge = () => {
                return createElement("div", {
                    class: "textBadge-1fdDPJ base-3IDx3L eyebrow-132Xza baseShapeRound-3epLEv",
                    style: "background-color: var(--background-secondary);"
                }, "Alpha");
            }
            let versionBadge = (text,ver) => {
                return createElement("div", {
                    class: "textBadge-1fdDPJ base-3IDx3L eyebrow-132Xza baseShapeRound-3epLEv",
                    style: "background-color: var(--background-secondary);"
                }, text + " V" + ver);
            }
            let primaryBadge = (text) => {
                return createElement("div", {
                    class: "textBadge-1fdDPJ base-3IDx3L eyebrow-132Xza baseShapeRound-3epLEv",
                    style: "background-color: var(--background-secondary);"
                }, text);
            }
            let unstableBadge = () => {
                return createElement("div", {
                    class: "textBadge-1fdDPJ base-3IDx3L eyebrow-132Xza baseShapeRound-3epLEv",
                    style: "background-color: var(--red-430);"
                }, "Unstable");
            }

            const StoreWatcher = {
                _stores: [UserStatusStore, UserStore, SessionsStore],
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

                node.getElementByClass = (clss) => {
                    return node.getElementsByClassName(clss)[0];
                }

                return node;
            };

            const bdSwitch = (status,options) => {
                let _checked;
                options['class'] = "bd-switch";
                this.switch = createElement("div", options);
                
                if(status==true) {
                    _checked = "checked";
                }

                this.switch.innerHTML = `<input type="checkbox" ${_checked}><div class="bd-switch-body"><svg class="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet"><rect class="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect><svg class="bd-switch-symbol" viewBox="0 0 20 20" fill="none"><path></path><path></path></svg></svg></div>`;
            
                return this.switch;
            }

            class LayoutSelector {
                constructor(target) {
                    this.ref = null;
                    this.target = target;
                    this._destroyed = false;

                    target._patched = true;

                    this.container = createElement("div", {
                        className: Utilities.className("LayoutSelectorWrapperContainer"),
                    });


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
                    let layoutArray = [];
                    let layoutwrapper = createElement("div", {
                        className: Utilities.className("LayoutSelectorWrapper"),
                    });

                    try {
                        layoutlist.forEach((layout) => {
                            let layoutElem = createElement("div", {
                                className: Utilities.className("discordColorway-layout"),
                                id: "layout-" + layout.name,
                                onclick: (el) => {
                                    if(!el.path[0].classList.contains("active")) {
                                        try {
                                            PluginUtilities.removeStyle("activeLayout")
                                        } catch(e) {
                                            console.log("No active layout, moving on");
                                        }
                                        userSettings = {
                                            activeLayout: layout.import,
                                            activeLayoutID: layout.name
                                        }
                                        BdApi.saveData("DiscordLayouts", "settings", userSettings);
                                        PluginUtilities.addStyle("activeLayout", BdApi.loadData("DiscordLayouts", "settings").activeLayout);
                                        try {
                                            if(document.querySelector(".discordColorway-layout.active") != "layout-" + BdApi.loadData("DiscordLayouts", "settings").activeLayoutID) {
                                                document.querySelector(".discordColorway-layout.active").classList.remove("active");
                                            }
                                        } catch(e) {
                                            console.warn("Uncaught Exception: " + e);
                                        }
                                        el.path[0].classList.add("active");
                                    }
                                    nativeToast("Applied Layout Successfully",1);
                                }
                            },
                                createElement("div", {
                                    className: Utilities.className("colorwayCheckIconContainer")
                                },
                                createElement("div", {
                                    className: Utilities.className("colorwayCheckIcon")
                                })),
                            );

                            layoutElem.innerHTML = layout.smallPreview + layoutElem.innerHTML;
                            BdApi.UI.createTooltip(layoutElem, layout.name, {});
                            layoutArray.push(layoutElem);
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
                    }, "Layouts"),
                    createElement("button", {
                        className: Utilities.className("button-ejjZWC lookFilled-1H2Jvj colorBrand-2M3O3N sizeSmall-3R2P2p grow-2T4nbg"),
                        type: "button",
                        onclick: () => {
                            layoutlist = fetch("https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json").then(res => res.json()).then(layouts => {
                                layoutlist = layouts.layouts;
                                const elements = Array.from(document.body.getElementsByClassName("ColorwaySelectorWrapperContainer"));
                                if (elements.length) {
                                    for (const el of elements) {
                                        document.querySelector(".LayoutSelectorWrapperContainer").remove();
                                        new LayoutSelector(el).mount();
                                    }
                                }
                            });
                        }
                    }, "Refresh Layout List")
                    );


                    container.append(this.colorwayHeaderContainer,layoutwrapper);

                    layoutArray.forEach(elem => {
                        layoutwrapper.append(elem);
                        if(elem.id == `layout-${BdApi.loadData("DiscordLayouts", "settings").activeLayoutID}`) {
                            elem.classList.add("active");
                        }
                    });


                    if(!document.querySelector(".discordColorway-layout.active")) {
                        try {
                            document.getElementById("layout-" + BdApi.loadData("DiscordLayouts", "settings").activeLayoutID).classList.add("active");
                        } catch(e) {
                            console.warn("Uncaught Exception: " + e);
                        }
                    }

                    return container;
                }
            }

            const ElementInjections = {
                "ColorwaySelectorWrapperContainer": elements => {
                    for (const el of elements) {
                        if (el.getElementsByClassName("LayoutSelectorWrapperContainer").length || el._patched) continue;

                        new LayoutSelector(el).mount();
                    }
                }
            };
            return class DiscordLayouts extends Plugin {
                css = `
                .discordColorway-layout {
                    height: 100px;
                    width: 176px;
                    border-radius: 8px;
                    display: flex;
                    padding: 3px;
                    overflow: hidden;
                    box-shadow: inset 0 0 0 1px var(--interactive-normal);
                    cursor: pointer;
                    position: relative;
                }
                .discordColorway-layout > * {
                    border-radius: 6px;
                    overflow: hidden;
                }
                .LayoutSelectorWrapper {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .discordColorwayOnToast {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 8px;
                    font-size: 18px;
                }
                .discordColorwayOnToast > .discordColorway {
                    box-shadow: none;
                }
                .discordColorwayOnToast > .discordColorway > .discordColorwayPreviewColor {
                    margin: 0;
                    width: 30px;
                    height: 30px;
                }
                .toast-2sz4eO:has(.discordColorwayOnToast) {
                    border-radius: 100px;
                }
                .colorwaySettingsContainer {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .colorwayPreview-background {
                    width: 564px;
                    height: 270px;
                    border-radius: 8px;
                    position: relative;
                }
                .discordColorway-layout.active {
                    box-shadow: inset 0 0 0 2px var(--brand-500),inset 0 0 0 4px var(--background-primary);
                }
                .discordColorway-layout.active .colorwayCheckIconContainer {
                    opacity: 1;
                }
                .discordColorway-layout .colorwayCheckIconContainer {
                    top: 4px;
                    right: 4px;
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
                .LayoutSelectorWrapper {
                    display: flex;
                    gap: 8px;
                    position: relative;
                    width: 100%;
                    flex-wrap: wrap;
                }
                .LayoutSelectorWrapperContainer {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    width: 100%;
                }
                .colorwayHeaderContainer {
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
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 4px;
                }
                .editorBody-1rnOXH > .LayoutSelectorWrapperContainer > .LayoutSelectorWrapper {
                    width: 228px;
                    flex-wrap: wrap;
                    display: inline-flex;
                    height: fit-content;
                }
                .editorBody-1rnOXH > .LayoutSelectorWrapperContainer {
                    width: 228px;
                }
                `;
                onStart() {
                    if(!BdApi.Plugins.get("DiscordColorways")) {
                        BdApi.showConfirmationModal("Base plugin is needed", [`The base plugin (DiscordColorways) is missing. Please click Download Now to install it.`], {
                            confirmText: "Download",
                            cancelText: "Cancel",
                            onConfirm: () => {
                                require("request").get("https://dablulite.github.io/DiscordColorways/DiscordColorways.plugin.js", async (error, response, body) => {
                                    if (error) {
                                        BdApi.Plugins.disable("DiscordLayouts")
                                        return require("electron").shell.openExternal("https://dablulite.github.io/DiscordColorways/DiscordColorways.plugin.js");
                                    }
                                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "DiscordColorways.plugin.js"), body, r));
                                });
                            },
                            onCancel: () => {
                                BdApi.Plugins.disable("DiscordLayouts")
                            }
                        });
                    } else if(BdApi.Plugins.get("DiscordColorways").instance._enabled == false) {
                        BdApi.showConfirmationModal("Base plugin is needed", [`It Seems that you have DiscordColorways Downloaded, please enable it to use this plugin`], {
                            confirmText: "Enable",
                            cancelText: "Cancel",
                            onConfirm: () => {
                                BdApi.Plugins.enable("DiscordColorways");
                            },
                            onCancel: () => {
                                BdApi.Plugins.disable("DiscordLayouts")
                            }
                        });
                    } else if(BdApi.Plugins.get("DiscordColorways").instance._enabled == true) {
                        layoutlist = fetch("https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json").then(res => res.json()).then(layouts => layoutlist = layouts.layouts);
                        PluginUtilities.addStyle(config.info.name, this.css);

                        StoreWatcher._init();

                        for (const className in ElementInjections) {
                            const elements = Array.from(document.body.getElementsByClassName(className));

                            if (elements.length) {
                                ElementInjections[className](elements);
                            }
                        }
                        try {
                            PluginUtilities.removeStyle("activeLayout")
                        } catch(e) {
                            console.log("No active colorway, moving on");
                        }
                        try {
                            PluginUtilities.addStyle("activeLayout", BdApi.loadData("DiscordLayouts", "settings").activeLayout);
                        } catch(e) {
                            console.log("No active colorway, moving on");
                        }
                    }
                }

                observer({addedNodes}) {
                    if(BdApi.Plugins.get("DiscordColorways").instance._enabled == true) {
                        for (const added of addedNodes) {
                            if (added.nodeType === Node.TEXT_NODE) continue;
    
                            for (const className in ElementInjections) {
                                const elements = Array.from(added.getElementsByClassName(className));
    
                                if (elements.length) {
                                    ElementInjections[className](elements);
                                }
                            }
                        }
                    }
                }

                onStop() {
                    if(BdApi.Plugins.get("DiscordColorways").instance._enabled == true) {
                        StoreWatcher._stop();
                        StoreWatcher._listeners.clear();
                        PluginUtilities.removeStyle(config.info.name);
                        PluginUtilities.removeStyle("activeLayout");
                        document.querySelectorAll("LayoutSelectorWrapperContainer").forEach(el => el._unmount?.());
                        BdApi.saveData("DiscordLayouts", "settings", userSettings);
                    }
                }
            };
        };
        return plugin(Plugin, Api);
        //@ts-ignore
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
