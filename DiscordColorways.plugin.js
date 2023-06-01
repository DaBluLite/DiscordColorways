/**
* @name DiscordColorways
* @displayName Discord Colorways
* @authorId 582170007505731594
* @invite ZfPH6SDkMW
* @version 1.2.0
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
    activeColorwayID: "disablecolorway",
    showInGuildBar: false
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
            version: "1.2.0",
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
            const [BasicThemeSelector, ThemeEditor, HomeIcon] = Webpack.getBulk.apply(null, [
                Filters.byProps("basicThemeSelectors"),
                Filters.byProps("themeEditor"),
                Filters.byProps("homeIcon")
            ].map(fn => ({filter: fn})));

            this.discordColorwayAPI = {
                showModalSelector: () => {
                    BdApi.showConfirmationModal("Select Colorway:",BdApi.React.createElement("div", {class: "colorwaySelectorModal"}));
                }
            }

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

            const bdSwitch = (status) => {
                let _checked;
                this.switch = createElement("div", {
                    className: "bd-switch",
                    onclick: (e) => {
                        if(e.path[1].parentElement.id == "showInGuildBar") {
                            userSettings = {
                                activeColorway: BdApi.loadData("DiscordColorways", "settings").activeColorway,
                                activeColorwayID: BdApi.loadData("DiscordColorways", "settings").activeColorwayID,
                                showInGuildBar: e.path[1].querySelector("input").checked
                            }
                            BdApi.saveData("DiscordColorways", "settings", userSettings);
                            const className = HomeIcon?.tutorialContainer;
                            const elements = Array.from(document.getElementsByClassName(className));

                            if (elements.length) {
                                if(e.path[1].querySelector("input").checked) {
                                    new BelowHomeColorwaySelector(document.getElementsByClassName(HomeIcon?.tutorialContainer)[0]).mount();
                                } else {
                                    document.querySelector(".ColorwaySelectorBtnContainer").remove();
                                }
                            }
                        }
                    }
                });
                
                if(status==true) {
                    _checked = "checked";
                }

                this.switch.innerHTML = `<input type="checkbox" ${_checked}><div class="bd-switch-body"><svg class="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet"><rect class="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect><svg class="bd-switch-symbol" viewBox="0 0 20 20" fill="none"><path></path><path></path></svg></svg></div>`;
            
                return this.switch;
            }

            class ColorwaySelector {
                constructor(target) {
                    this.ref = null;
                    this.target = target;
                    this._destroyed = false;

                    target._patched = true;

                    this.container = createElement("div", {
                        className: Utilities.className("ColorwaySelectorWrapperContainer"),
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
                    let customcolorwayArray = [];
                    let wrapper = createElement("div", {
                        className: Utilities.className("ColorwaySelectorWrapper"),
                    });
                    let customwrapper = createElement("div", {
                        className: Utilities.className("ColorwaySelectorWrapper"),
                    });
                    let disableColorwayBtn = createElement("div", {
                        className: Utilities.className("discordColorway"),
                        id: "colorway-disablecolorway",
                        onclick: (el) => {
                            if(!el.path[1].classList.contains("active")) {
                                try {
                                    PluginUtilities.removeStyle("activeColorway")
                                } catch(e) {
                                    console.log("No active colorway, moving on");
                                }
                                userSettings = {
                                    activeColorway: "",
                                    activeColorwayID: "disablecolorway",
                                    showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar
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
                    );
                    BdApi.UI.createTooltip(disableColorwayBtn, "Disable Colorway", {});
                    colorwayArray.push(disableColorwayBtn);



                    let addColorwayBtn = createElement("div", {
                        className: Utilities.className("discordColorway"),
                        id: "colorway-createcolorway",
                        onclick: (el) => {
                        }
                    }, createElement("div", {
                        className: Utilities.className("colorwayCreateIcon")
                    }),
                    createElement("div", {
                        className: Utilities.className("colorwayCheckIconContainer")
                    },
                    createElement("div", {
                        className: Utilities.className("colorwayCheckIcon")
                    }))
                    );
                    BdApi.UI.createTooltip(addColorwayBtn, "Coming Soon...", {});
                    customcolorwayArray.push(addColorwayBtn);



                    try {
                        colorwayList.forEach((colorway) => {
                            let colorwayElem = createElement("div", {
                                className: Utilities.className("discordColorway"),
                                id: "colorway-" + colorway.name,
                                onclick: (el) => {
                                    if(!el.path[1].classList.contains("active")) {
                                        try {
                                            PluginUtilities.removeStyle("activeColorway")
                                        } catch(e) {
                                            console.log("No active colorway, moving on");
                                        }
                                        userSettings = {
                                            activeColorway: colorway.import,
                                            activeColorwayID: colorway.name,
                                            showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar
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
                                })),
                                createElement("div", {
                                    className: Utilities.className("colorwayInfoIconContainer"),
                                    onclick: (el) => {
                                        el.stopPropagation();
                                        let shareIconBtn = BdApi.React.createElement("div", {
                                            class:"colorwayShareIcon",
                                            onClick: () => {
                                                let original = "";
                                                    if(colorway.original == true) {
                                                        original = `<span style="display: flex;transform:translateY(-50%);position:absolute;top:23px;right:12px;padding: 4px 8px;border-radius: 50px;background-color: #0a0a0a;color: #fff;font-family: Arial;">Original</span>`
                                                    }
                                                BdApi.showConfirmationModal("Share Colorway", BdApi.React.createElement("img",{src:'data:image/svg+xml,' + encodeURIComponent(`
                                                <svg xmlns="http://www.w3.org/2000/svg" width="408" height="150">
                                                  <foreignObject width="408" height="150">
                                                    <div xmlns="http://www.w3.org/1999/xhtml" style="border-radius:8px;background-color:${colorway.primary};height: 150px;">
                                                      <div style="display: flex;width: 408px; height: 46px; flex-direction: row;"><div style="background-color: ${colorway.accent};height: 46px;width: 102px;border-top-left-radius: 8px;float:left;"></div><div style="background-color: ${colorway.primary};height: 46px; width: 102px;float:left;"></div><div style="background-color: ${colorway.secondary};height: 46px;width: 102px;float:left;"></div><div style="background-color: ${colorway.tertiary};height: 46px;width: 102px;border-top-right-radius: 8px;float:left;"></div>${original}</div>
                                                      <span style="display: flex;font-weight: 600;font-size: 20px; margin-top: 12px;margin-left: 12px;color: #fff;font-family: Arial;">${colorway.name}</span>
                                                      <span style="display: flex;font-weight: 500;font-size: 18px; margin-top: 4px;margin-left: 12px;color: #dadada;font-family: Arial;">By ${colorway.author}</span>
                                                      <span style="display: flex;font-weight: 300;font-size: 12px; margin-top: 12px;margin-left: 12px;color: #aaa;font-family: Arial;">Available in DiscordColorways</span>
                                                    </div>
                                                  </foreignObject>
                                                </svg>
                                              `)}),{
                                                onConfirm: () => {
                                                    let canvas = document.createElement("canvas")
                                                    let ctx = canvas.getContext("2d");
                                                    let original = "";
                                                    if(colorway.original == true) {
                                                        original = `<span style="display: flex;transform:translateY(-50%);position:absolute;top:23px;right:12px;padding: 4px 8px;border-radius: 50px;background-color: #0a0a0a;color: #fff;font-family: Arial;">Original</span>`
                                                    }
                                                    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
                                                  <foreignObject width="300" height="150">
                                                    <div xmlns="http://www.w3.org/1999/xhtml" style="border-radius:8px;background-color:${colorway.primary};height: 150px;width:300px;">
                                                      <div style="display: flex;width: 300px; height: 46px; flex-direction: row;"><div style="background-color: ${colorway.accent};height: 46px;width: 75px;border-top-left-radius: 8px;float:left;"></div><div style="background-color: ${colorway.primary};height: 46px; width: 75px;float:left;"></div><div style="background-color: ${colorway.secondary};height: 46px;width: 75px;float:left;"></div><div style="background-color: ${colorway.tertiary};height: 46px;width: 75px;border-top-right-radius: 8px;float:left;"></div>${original}</div>
                                                      <span style="display: flex;font-weight: 600;font-size: 20px; margin-top: 12px;margin-left: 12px;color: #fff;font-family: Arial;">${colorway.name}</span>
                                                      <span style="display: flex;font-weight: 500;font-size: 18px; margin-top: 4px;margin-left: 12px;color: #dadada;font-family: Arial;">By ${colorway.author}</span>
                                                      <span style="display: flex;font-weight: 300;font-size: 12px; margin-top: 12px;margin-left: 12px;color: #aaa;font-family: Arial;">Available in DiscordColorways</span>
                                                    </div>
                                                  </foreignObject>
                                                </svg>`
 
                                                var img = new Image();
                                                img.crossOrigin = "anonymous"
                                                img.onload = function() {
                                                    ctx.drawImage(img, 0, 0);
                                                    let buffer = Buffer.from(canvas.toDataURL().split(",")[1], 'base64');
 
                                                    DiscordNative.clipboard.copyImage(buffer, "colorway-share")
                                                }
                                                img.src = `data:image/svg+xml,` + encodeURIComponent(svg);
                                                },
                                                confirmText: "Copy Banner"
                                              })
                                            }
                                        });
                                        BdApi.showConfirmationModal(["Colorway Details: " + colorway.name,shareIconBtn],BdApi.React.createElement("div", {
                                            class: "colorwayInfoModalDetails"
                                        },[
                                            BdApi.React.createElement("div",{class: "colorwayColors"},[
                                                BdApi.React.createElement("div",{class: "colorwayColor colorwayColor-accent", style:{backgroundColor: colorway.accent}}),
                                                BdApi.React.createElement("div",{class: "colorwayColor colorwayColor-primary", style:{backgroundColor: colorway.primary}}),
                                                BdApi.React.createElement("div",{class: "colorwayColor colorwayColor-secondary", style:{backgroundColor: colorway.secondary}}),
                                                BdApi.React.createElement("div",{class: "colorwayColor colorwayColor-tertiary", style:{backgroundColor: colorway.tertiary}})
                                            ]),
                                            BdApi.React.createElement("span",{class: "colorwayAuthor"}, ["Author: ",BdApi.React.createElement("span",{class: "colorwayAuthorLink"},colorway.author)]),
                                            BdApi.React.createElement("span",{class: "colorwayImport colorwayCodeblockWrapper"}, ["Import: ",BdApi.React.createElement("span",{class: "colorwayCodeblock"},colorway.import)])
                                        ]),{
                                            confirmText: "Set Theme",
                                            onConfirm: () => {
                                                if(!el.path[1].parentElement.classList.contains("active")) {
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
                                                    el.path[1].parentElement.classList.add("active");
                                                }
                                            }
                                        });
                                    }
                                },
                                createElement("div", {
                                    className: Utilities.className("colorwayInfoIcon")
                                }))
                            );
                            BdApi.UI.createTooltip(colorwayElem, colorway.name, {});
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
                    }, "Colorways", createElement("div", {
                        className: "colorwaySettingsIcon",
                        onclick: () => {
                            BdApi.showConfirmationModal("DiscordColorway Settings",[BdApi.React.createElement("div",{className: "colorwaySettingsContainer"})]);
                        }
                    })),
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

                    this.customColorwayHeaderContainer = createElement("div", {
                        className: Utilities.className("colorwayHeaderContainer")
                    },
                    createElement("div", {
                        className: Utilities.className("colorwayHeaderTitle")
                    }, "Custom Colorways"));


                    container.append(this.colorwayHeaderContainer,wrapper/*,this.customColorwayHeaderContainer,customwrapper*/);

                    colorwayArray.forEach(elem => {
                        wrapper.append(elem);
                        if(elem.id == `colorway-${BdApi.loadData("DiscordColorways", "settings").activeColorwayID}`) {
                            elem.classList.add("active");
                        }
                    });

                    customcolorwayArray.forEach(elem => {
                        customwrapper.append(elem);
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



            class BelowHomeColorwaySelector {
                constructor(target) {
                    this.ref = null;
                    this.target = target;
                    this._destroyed = false;

                    target._patched = true;

                    this.container = createElement("div", {
                        className: Utilities.className("ColorwaySelectorBtnContainer"),
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
                    const container = this.container.cloneNode(true);
                    const state = this.state = this.getState();

                    container._unmount = this.unmount.bind(this);

                    let ColorwaySelectorBtn = createElement("div", {
                        className: Utilities.className("ColorwaySelectorBtn"),
                        onclick: () => {
                            BdApi.showConfirmationModal("Select Colorway:",BdApi.React.createElement("div", {class: "colorwaySelectorModal"}));
                        }
                    },createElement("div", {
                        className: Utilities.className("colorwaySelectorIcon")
                    }));

                    BdApi.UI.createTooltip(ColorwaySelectorBtn, "Colorways", {
                        side: "right"
                    });

                    container.append(ColorwaySelectorBtn);

                    return container;
                }
            }


            class SettingsRenderer {
                constructor(target) {
                    this.ref = null;
                    this.target = target;
                    this._destroyed = false;

                    target._patched = true;

                    this.container = createElement("div", {
                        className: Utilities.className("colorwaySettingsWrapper"),
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
                    const container = this.container.cloneNode(true);
                    const state = this.state = this.getState();

                    container._unmount = this.unmount.bind(this);

                    let settingsPanel = (
                        createElement("span",{className: "colorwaySetting",id: "showInGuildBar"}, "Show In Guild bar", bdSwitch(BdApi.loadData("DiscordColorways", "settings").showInGuildBar))
                    )

                    container.append(settingsPanel);

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
                },
                "colorwaySelectorModal": elements => {
                    for (const el of elements) {
                        if (el.getElementsByClassName("ColorwaySelectorWrapper").length || el._patched) continue;

                        new ColorwaySelector(el).mount();
                    }
                },
                [HomeIcon?.tutorialContainer]: elements => {
                    for (const el of elements) {
                        if (el.getElementsByClassName("ColorwaySelectorWrapper").length || el._patched) continue;

                        if(BdApi.loadData("DiscordColorways", "settings").showInGuildBar == true) {
                            new BelowHomeColorwaySelector(el).mount();
                        }
                    }
                },
                "colorwaySettingsContainer": elements => {
                    for (const el of elements) {
                        if (el.getElementsByClassName("ColorwaySelectorWrapper").length || el._patched) continue;

                        new SettingsRenderer(el).mount();
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
                .colorwayAuthor {
                    font-weight: 400;
                    font-size: 20px;
                    color: var(--header-secondary);
                    margin-bottom: 4px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--header-secondary);
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
                #colorway-createcolorway {
                    opacity: .5;
                }
                .colorwayImport {
                    font-weight: 400;
                    font-size: 20px;
                    color: var(--header-secondary);
                    margin-bottom: 4px;
                }
                #colorway-createcolorway > .colorwayCreateIcon {
                    height: 60px;
                    width: 60px;
                    background-color: var(--header-primary);
                    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='circleIcon-3489FI' aria-hidden='true' role='img' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z'%3E%3C/path%3E%3C/svg%3E");
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
                .colorwayInfoIconContainer {
                    height: 20px;
                    width: 20px;
                    background-color: var(--brand-500);
                    position: absolute;
                    top: 0;
                    left: 0;
                    border-radius: 50%;
                    opacity: 0;
                }
                .colorwayInfoIconContainer:hover {
                    background-color: var(--brand-700);
                }
                .discordColorway:hover .colorwayInfoIconContainer {
                    opacity: 1;
                    transition: .15s;
                }
                .colorwayInfoIcon {
                    height: 20px;
                    width: 20px;
                    background-color: var(--white-500);
                    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-info' viewBox='0 0 16 16'%3E%3Cpath d='m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z'/%3E%3C/svg%3E");
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
                    width: 100%;
                }
                .ColorwaySelectorWrapperContainer {
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
                .editorBody-1rnOXH > .ColorwaySelectorWrapperContainer > .ColorwaySelectorWrapper {
                    width: 228px;
                    flex-wrap: wrap;
                    display: inline-flex;
                    height: fit-content;
                }
                .editorBody-1rnOXH > .ColorwaySelectorWrapperContainer {
                    width: 228px;
                }
                .editorBody-1rnOXH .colorwayHeaderContainer button {
                    display: none;
                }
                .colorwayInfoModalDetails {
                    color: var(--header-primary);
                    display: flex;
                    flex-direction: column;
                    border-radius: 8px;
                    background-color: var(--background-floating);
                    padding: 12px;
                }
                .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper) {
                    width: fit-content;
                    min-width: 620px;
                }
                .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper) .footer-IubaaS {
                    display: none;
                }
                .root-1CAIjD:has(.colorwaySelectorModal) {
                    width: fit-content;
                }
                .root-1CAIjD:has(.colorwaySelectorModal) .footer-IubaaS {
                    display: none;
                }
                .colorwaySelectorModal {
                    padding: 12px;
                    border-radius: 8px;
                    background-color: var(--background-floating);
                }
                .colorwayColors {
                    width: calc(100% + 24px);
                    margin-left: -12px;
                    margin-top: -12px;
                    height: 46px;
                    display: flex;
                    flex-direction: row;
                    margin-bottom: 12px;
                }
                .colorwayColor {
                    width: calc(100%/4);
                    height: 46px;
                }
                .colorwayColor:first-child {
                    border-top-left-radius: 8px;
                }
                .colorwayColor:last-child {
                    border-top-right-radius: 8px;
                }
                .colorwayCodeblock {
                    font-size: 0.875rem;
                    line-height: 1.125rem;
                    text-indent: 0;
                    white-space: pre-wrap;
                    scrollbar-width: thin;
                    scrollbar-color: var(--background-tertiary) var(--background-secondary);
                    background: var(--background-secondary);
                    border: 1px solid var(--background-tertiary);
                    display: block;
                    overflow-x: auto;
                    padding: 0.5em;
                    border-radius: 4px;
                    -webkit-text-size-adjust: none;
                    -moz-text-size-adjust: none;
                    -ms-text-size-adjust: none;
                    text-size-adjust: none;
                    color: var(--text-normal);
                    background: var(--background-secondary);
                    user-select: text;
                }
                .colorwayCodeblockWrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .colorwaySettingsIcon {
                    height: 20px;
                    width: 20px;
                    background-color: var(--header-secondary);
                    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' role='img' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' fill-rule='evenodd' clip-rule='evenodd' d='M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z'%3E%3C/path%3E%3C/svg%3E");
                    -webkit-mask-size: 18px;
                    -webkit-mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                    cursor: pointer;
                }
                .colorwaySettingsIcon:hover {
                    background-color: var(--header-primary);
                }
                .colorwayShareIcon {
                    height: 24px;
                    width: 24px;
                    background-color: var(--header-secondary);
                    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-share-fill' viewBox='0 0 16 16'%3E%3Cpath d='M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z'/%3E%3C/svg%3E");
                    -webkit-mask-size: 16px;
                    -webkit-mask-repeat: no-repeat;
                    -webkit-mask-position: center 6px;
                    cursor: pointer;
                    float: left;
                }
                .colorwayShareIcon:hover {
                    background-color: var(--header-primary);
                }
                .header-1ffhsl > h1:has(.colorwayShareIcon) {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 8px;
                }
                .colorwaySelectorIcon {
                    height: 24px;
                    width: 24px;
                    background-color: var(--text-normal);
                    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-palette-fill' viewBox='0 0 16 16'%3E%3Cpath d='M12.433 10.07C14.133 10.585 16 11.15 16 8a8 8 0 1 0-8 8c1.996 0 1.826-1.504 1.649-3.08-.124-1.101-.252-2.237.351-2.92.465-.527 1.42-.237 2.433.07zM8 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z'/%3E%3C/svg%3E");
                    -webkit-mask-size: 24px;
                    -webkit-mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                }
                .ColorwaySelectorBtnContainer {
                    position: relative;
                    margin: 0 0 8px;
                    display: -webkit-box;
                    display: -ms-flexbox;
                    display: flex;
                    -webkit-box-pack: center;
                    -ms-flex-pack: center;
                    justify-content: center;
                    width: 72px;
                    height: 48px;
                }
                .ColorwaySelectorBtn {
                    height: 48px;
                    width: 48px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: .15s ease-out;
                    background-color: var(--background-primary);
                    cursor: pointer;
                }
                .ColorwaySelectorBtn:hover {
                    background-color: var(--brand-experiment);
                    border-radius: 16px;
                }
                .ColorwaySelectorBtn:hover .colorwaySelectorIcon {
                    background-color: var(--white-500);
                }
                .colorwaySettingsWrapper {
                    border-radius: 8px;
                    background-color: var(--background-floating);
                    padding: 12px;
                    margin-top: 12px;
                }
                .colorwaySetting {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    color: var(--header-primary);
                    font-weight: 600;
                }
                `;
                onStart() {
                    colorwayList = fetch("https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json").then(res => res.json()).then(colors => colorwayList = colors.colorways);
                    PluginUtilities.addStyle(config.info.name, this.css);
                    StoreWatcher._init();

                    for (const className in ElementInjections) {
                        const elements = Array.from(document.body.getElementsByClassName(className));

                        if (elements.length) {
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
                    if(!document.documentElement.classList.contains("theme-colorway")) {
                        document.documentElement.classList.add("theme-colorway")
                    }
                }

                observer({addedNodes}) {
                    for (const added of addedNodes) {
                        if (added.nodeType === Node.TEXT_NODE) continue;

                        for (const className in ElementInjections) {
                            const elements = Array.from(added.getElementsByClassName(className));

                            if (elements.length) {
                                ElementInjections[className](elements);
                            }
                        }
                    }
                    if(!document.documentElement.classList.contains("theme-colorway")) {
                        document.documentElement.classList.add("theme-colorway")
                    }
                }

                onStop() {
                    StoreWatcher._stop();
                    StoreWatcher._listeners.clear();
                    PluginUtilities.removeStyle(config.info.name);
                    PluginUtilities.removeStyle("activeColorway");
                    document.querySelectorAll("ColorwaySelector").forEach(el => el._unmount?.());
                    document.querySelectorAll("ColorwaySelectorBtnContainer").forEach(el => el._unmount?.());
                    BdApi.saveData("DiscordColorways", "settings", userSettings);
                    if(document.documentElement.classList.contains("theme-colorway")) {
                        document.documentElement.classList.remove("theme-colorway")
                    }
                }

                getSettingsPanel() {
                    let _container = createElement("div",{className: "colorwaySettingsContainer"});

                    _container.append(createElement("div", {class: "colorwaySelectorModal"}));

                    let settingsWrapper = createElement("div",{
                        className: "colorwaySettingsContainer"
                    });

                    _container.append(settingsWrapper);

                    new SettingsRenderer(settingsWrapper).mount();

                    return _container;
                }
            };
        };
        return plugin(Plugin, Api);
        //@ts-ignore
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
