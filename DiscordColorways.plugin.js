/**
* @name DiscordColorways
* @displayName Discord Colorways
* @authorId 582170007505731594
* @invite ZfPH6SDkMW
* @version 1.3.0
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
    showInGuildBar: false,
    showCustomColorways: true
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
            version: "1.3.0",
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
            const {DiscordClasses, DOMTools, Utilities, WebpackModules, PluginUtilities, ReactTools, Components, DiscordModules: {LocaleManager: {Messages}, UserStatusStore, UserStore}} = Api;
            const Dispatcher = WebpackModules.getByProps("dispatch", "register");
            const Flux = Object.assign({}, WebpackModules.getByProps("Store", "connectStores"), WebpackModules.getByProps("useStateFromStores"));
            const SessionsStore = WebpackModules.getByProps("getSessions", "_dispatchToken");
 
            const {Webpack, Webpack: {Filters}} = BdApi;
            const [BasicThemeSelector, ThemeEditor, HomeIcon, TextInput] = Webpack.getBulk.apply(null, [
                Filters.byProps("basicThemeSelectors"),
                Filters.byProps("themeEditor"),
                Filters.byProps("homeIcon"),
                Filters.byProps("input")
            ].map(fn => ({filter: fn})));

            let textInput = (placeholdr, idd) => {
                if(placeholdr) {
                    return createElement("input", {
                        type: "text",
                        class: "inputDefault-Ciwd-S input-3O04eu",
                        placeholder: placeholdr,
                        id: idd
                    })
                } else {
                    return createElement("input", {
                        type: "text",
                        class: "inputDefault-Ciwd-S input-3O04eu"
                    })
                }
            };

            let modalHeader = (text) => {
                return createElement("h2", {
                    class: "h5-2feg8J eyebrow-2wJAoF"
                },text);
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
                    style: "background-color: var(--primary-730);"
                }, "Alpha");
            }
            let versionBadge = (text,ver) => {
                return createElement("div", {
                    class: "textBadge-1fdDPJ base-3IDx3L eyebrow-132Xza baseShapeRound-3epLEv",
                    style: "background-color: var(--primary-730);"
                }, text + " V" + ver);
            }
            let unstableBadge = () => {
                return createElement("div", {
                    class: "textBadge-1fdDPJ base-3IDx3L eyebrow-132Xza baseShapeRound-3epLEv",
                    style: "background-color: var(--red-430);"
                }, "Unstable");
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
                                showInGuildBar: e.path[1].querySelector("input").checked,
                                showCustomColorways: BdApi.loadData("DiscordColorways", "settings").showCustomColorways
                            }
                            BdApi.saveData("DiscordColorways", "settings", userSettings);
                            const className = HomeIcon?.tutorialContainer;
                            const elements = Array.from(document.getElementsByClassName(className));

                            if (elements.length) {
                                if(e.path[1].querySelector("input").checked) {
                                    new BelowHomeColorwaySelector(document.getElementsByClassName(className)[0]).mount();
                                } else {
                                    document.querySelector(".ColorwaySelectorBtnContainer").remove();
                                }
                            }
                        }
                        if(e.path[1].parentElement.id == "showCustomColorways") {
                            userSettings = {
                                activeColorway: BdApi.loadData("DiscordColorways", "settings").activeColorway,
                                activeColorwayID: BdApi.loadData("DiscordColorways", "settings").activeColorwayID,
                                showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar,
                                showCustomColorways: e.path[1].querySelector("input").checked
                            }
                            BdApi.saveData("DiscordColorways", "settings", userSettings);
                            if(e.path[1].querySelector("input").checked) {
                                try {
                                    PluginUtilities.addStyle("visibleCustomColorways", `
.customColorwaySelector {display: flex !important;}
                        `);
                                } catch(e) {

                                }
                            } else {
                                try {
                                    PluginUtilities.removeStyle("visibleCustomColorways");
                                } catch(e) {

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
                            /*this.ref.replaceWith(res);*/
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
                        className: Utilities.className("ColorwaySelectorWrapper customColorwaySelector"),
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
                                    showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar,
                                    showCustomColorways: BdApi.loadData("DiscordColorways", "settings").showCustomColorways
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
                            BdApi.showConfirmationModal("Create Colorway", BdApi.React.createElement("div", {class:"colorwayCreationModal"}))
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
                    BdApi.UI.createTooltip(addColorwayBtn, "Create Colorway", {});
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
                                            showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar,
                                            showCustomColorways: BdApi.loadData("DiscordColorways", "settings").showCustomColorways
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
                                                BdApi.showToast("Copied Banner Successfully", {
                                                    type: "success"
                                                })
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


                    try {
                        BdApi.loadData("DiscordColorways", "custom_colorways").forEach((colorway) => {
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
                                            showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar,
                                            showCustomColorways: BdApi.loadData("DiscordColorways", "settings").showCustomColorways
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
                                    style: "background-color: " + colorway.accent.background
                                }),
                                createElement("div", {
                                    className: Utilities.className("discordColorwayPreviewColor"),
                                    style: "background-color: " + colorway.primary.background
                                }),
                                createElement("div", {
                                    className: Utilities.className("discordColorwayPreviewColor"),
                                    style: "background-color: " + colorway.secondary.background
                                }),
                                createElement("div", {
                                    className: Utilities.className("discordColorwayPreviewColor"),
                                    style: "background-color: " + colorway.tertiary.background
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
                                                    <div xmlns="http://www.w3.org/1999/xhtml" style="border-radius:8px;background-color:${colorway.primary.background};height: 150px;">
                                                      <div style="display: flex;width: 408px; height: 46px; flex-direction: row;"><div style="background-color: ${colorway.accent.background};height: 46px;width: 102px;border-top-left-radius: 8px;float:left;"></div><div style="background-color: ${colorway.primary.background};height: 46px; width: 102px;float:left;"></div><div style="background-color: ${colorway.secondary.background};height: 46px;width: 102px;float:left;"></div><div style="background-color: ${colorway.tertiary.background};height: 46px;width: 102px;border-top-right-radius: 8px;float:left;"></div></div>
                                                      <span style="display: flex;font-weight: 600;font-size: 20px; margin-top: 12px;margin-left: 12px;color: ${colorway.primary.foreground};font-family: Arial;">${colorway.name}</span>
                                                      <span style="display: flex;font-weight: 300;font-size: 12px; margin-top: 12px;margin-left: 12px;color: ${colorway.primary.foreground};opacity:.7;font-family: Arial;">Available in DiscordColorways</span>
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
                                                    <div xmlns="http://www.w3.org/1999/xhtml" style="border-radius:8px;background-color:${colorway.primary.background};height: 150px;width:300px;">
                                                      <div style="display: flex;width: 300px; height: 46px; flex-direction: row;"><div style="background-color: ${colorway.accent.background};height: 46px;width: 75px;border-top-left-radius: 8px;float:left;"></div><div style="background-color: ${colorway.primary.background};height: 46px; width: 75px;float:left;"></div><div style="background-color: ${colorway.secondary.background};height: 46px;width: 75px;float:left;"></div><div style="background-color: ${colorway.tertiary.background};height: 46px;width: 75px;border-top-right-radius: 8px;float:left;"></div></div>
                                                      <span style="display: flex;font-weight: 600;font-size: 20px; margin-top: 12px;margin-left: 12px;color: ${colorway.primary.foreground};font-family: Arial;">${colorway.name}</span>
                                                      <span style="display: flex;font-weight: 300;font-size: 12px; margin-top: 12px;margin-left: 12px;color: ${colorway.primary.foreground};opacity:.7;font-family: Arial;">Available in DiscordColorways</span>
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
                                                BdApi.showToast("Copied Banner Successfully", {
                                                    type: "success"
                                                })
                                                },
                                                confirmText: "Copy Banner"
                                              })
                                            }
                                        });
                                        BdApi.showConfirmationModal(["Colorway Details: " + colorway.name,shareIconBtn],BdApi.React.createElement("div", {
                                            class: "colorwayInfoModalDetails"
                                        },[
                                            BdApi.React.createElement("div",{class: "colorwayColors"},[
                                                BdApi.React.createElement("div",{class: "colorwayColor colorwayColor-accent", style:{backgroundColor: colorway.accent.background}}),
                                                BdApi.React.createElement("div",{class: "colorwayColor colorwayColor-primary", style:{backgroundColor: colorway.primary.background}}),
                                                BdApi.React.createElement("div",{class: "colorwayColor colorwayColor-secondary", style:{backgroundColor: colorway.secondary.background}}),
                                                BdApi.React.createElement("div",{class: "colorwayColor colorwayColor-tertiary", style:{backgroundColor: colorway.tertiary.background}})
                                            ]),
                                            BdApi.React.createElement("span",{class: "colorwayImport colorwayCodeblockWrapper"}, ["CSS: ",BdApi.React.createElement("span",{class: "colorwayCodeblock"},colorway.import)]),
                                            BdApi.React.createElement("div",{class: "colorwayModalFooter"}, [
                                                BdApi.React.createElement("button",{
                                                    class: "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                                    onClick: (e) => {
                                                        try {
                                                            e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                                        } catch(e) {
                        
                                                        }
                                                    }
                                                },"Close"),
                                                BdApi.React.createElement("button",{
                                                    class: "button-ejjZWC lookFilled-1H2Jvj colorRed-2VFhM4 sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                                    onClick: (e) => {
                                                        try {
                                                            e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                                        } catch(e) {
                        
                                                        }
                                                        BdApi.showConfirmationModal("Delete Colorway","Are you sure you want to delete this Colorway?", {
                                                            danger: true,
                                                            confirmText: "Delete",
                                                            onConfirm: () => {
                                                                let customColorwayArray = [];
                                                                BdApi.loadData("DiscordColorways", "custom_colorways").forEach(el => {
                                                                    if(el.name != colorway.name) {
                                                                        customColorwayArray.push(el);
                                                                    }
                                                                })
                                                                BdApi.saveData("DiscordColorways", "custom_colorways", customColorwayArray);
                                                                customColorwayArray = [];
                                                            }
                                                        });
                                                    }
                                                },"Delete Colorway")
                                            ])
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
                            customcolorwayArray.push(colorwayElem);
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
                        className: Utilities.className("colorwayHeaderContainer customColorwaySelector")
                    },
                    createElement("div", {
                        className: Utilities.className("colorwayHeaderTitle")
                    }, "Custom Colorways", versionBadge("ColorwayCreator", "0.1"), alphaBadge(), unstableBadge()));


                    container.append(this.colorwayHeaderContainer,wrapper,this.customColorwayHeaderContainer,customwrapper);

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
                            /*this.ref.replaceWith(res);*/
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
                            /*this.ref.replaceWith(res);*/
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

                    let settingsPanel = 
                        createElement("span",{className: "colorwaySetting",id: "showInGuildBar"}, "Show In Guild bar", bdSwitch(BdApi.loadData("DiscordColorways", "settings").showInGuildBar)) +
                        createElement("span",{className: "colorwaySetting",id: "showCustomColorways"}, createElement("span",{},"Show Custom Colorways",unstableBadge()), bdSwitch(BdApi.loadData("DiscordColorways", "settings").showCustomColorways))
                    

                    container.append(createElement("span",{className: "colorwaySetting",id: "showInGuildBar"}, "Show In Guild bar", bdSwitch(BdApi.loadData("DiscordColorways", "settings").showInGuildBar)),
                    createElement("span",{className: "colorwaySetting",id: "showCustomColorways"}, createElement("span",{},"Show Custom Colorways",unstableBadge()), bdSwitch(BdApi.loadData("DiscordColorways", "settings").showCustomColorways)));

                    return container;
                }
            }

            class ColorwayCreator {
                constructor(target) {
                    this.ref = null;
                    this.target = target;
                    this._destroyed = false;

                    target._patched = true;

                    this.container = createElement("div", {
                        className: Utilities.className("colorwayCreatorWrapper"),
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
                    const container = this.container.cloneNode(true);
                    const state = this.state = this.getState();

                    container._unmount = this.unmount.bind(this);

                    let primaryTextColor = 'white';
                    let secondaryTextColor = 'white';
                    let tertiaryTextColor = 'white';
                    let accentTextColor = 'white';
                    let customColorway;
                    let primaryToAccentContrast = 3.6;
                    let secondaryToSecondaryAltContrast = -3.6;
                    let secondaryAlt = "#232428";
                    let primaryLighter = "#383a40";

                    function componentToHex(c) {
                        var hex = c.toString(16);
                        return hex.length == 1 ? "0" + hex : hex;
                    }
                    function rgbToHex(r, g, b) {
                        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
                    }
                    function shadeColor(color, percent) {

                        var R = parseInt(color.substring(1,3),16);
                        var G = parseInt(color.substring(3,5),16);
                        var B = parseInt(color.substring(5,7),16);
                    
                        R = parseInt(R * (100 + percent) / 100);
                        G = parseInt(G * (100 + percent) / 100);
                        B = parseInt(B * (100 + percent) / 100);
                    
                        R = (R<255)?R:255;  
                        G = (G<255)?G:255;  
                        B = (B<255)?B:255;  
                    
                        R = Math.round(R)
                        G = Math.round(G)
                        B = Math.round(B)
                    
                        var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
                        var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
                        var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
                    
                        return "#"+RR+GG+BB;
                    }

                    let stageOne = createElement("div", {
                        className: Utilities.className("colorwayCreatorWrapperStage")
                    });

                    let creationPanel = (
                        createElement("div",{
                            className: "colorwayCreator-colorPreviews"
                        },
                            
                            createElement("div",{
                                className: "colorwayCreator-colorPreview",
                                onclick: (e) => {
                                    try{e.path[0].querySelector("input").click();}catch(e){}
                                },
                                style: "background-color: #313338;"
                            },
                                createElement("input",{
                                    type: "color",
                                    value: "#313338",
                                    id: "colorwayCreatorColorpicker_primary",
                                    onchange: (e) => {
                                        e.path[0].parentElement.style = "background-color: " + e.path[0].value + ";";
                                        let splitRGB = (color) => {
                                            if (color.indexOf('rgba') === -1)
                                            color += ',1';
                                            return color.match(/[\.\d]+/g).map(function (a) {
                                                return +a
                                            });
                                        }
                                        let splitRGBValues = splitRGB(e.path[0].parentElement.style.backgroundColor);
                                        let RgbToHex = rgbToHex(splitRGBValues[0],splitRGBValues[1],splitRGBValues[2]);
                                        primaryLighter = shadeColor(RgbToHex, primaryToAccentContrast);
                                        let RGBLuminanceCalc = Math.round(((parseInt(splitRGBValues[0]) * 299) +
                                            (parseInt(splitRGBValues[1]) * 587) +
                                            (parseInt(splitRGBValues[2]) * 114)) / 1000);
                                        primaryTextColor = (RGBLuminanceCalc > 125) ? 'black' : 'white';
                                        e.path[0].parentElement.querySelector("span").style = "color: " + primaryTextColor + ";";
                                    }
                                }),
                                createElement("span",{},"Primary")
                            ),
                            createElement("div",{
                                className: "colorwayCreator-colorPreview",
                                onclick: (e) => {
                                    try{e.path[0].querySelector("input").click();}catch(e){}
                                },
                                style: "background-color: #2b2d31;"
                            },
                                createElement("input",{
                                    type: "color",
                                    value: "#2b2d31",
                                    id: "colorwayCreatorColorpicker_secondary",
                                    onchange: (e) => {
                                        e.path[0].parentElement.style = "background-color: " + e.path[0].value + ";";
                                        let splitRGB = (color) => {
                                            if (color.indexOf('rgba') === -1)
                                            color += ',1';
                                            return color.match(/[\.\d]+/g).map(function (a) {
                                                return +a
                                            });
                                        }
                                        let splitRGBValues = splitRGB(e.path[0].parentElement.style.backgroundColor);
                                        let RgbToHex = rgbToHex(splitRGBValues[0],splitRGBValues[1],splitRGBValues[2]);
                                        secondaryAlt = shadeColor(RgbToHex, secondaryToSecondaryAltContrast);
                                        let RGBLuminanceCalc = Math.round(((parseInt(splitRGBValues[0]) * 299) +
                                            (parseInt(splitRGBValues[1]) * 587) +
                                            (parseInt(splitRGBValues[2]) * 114)) / 1000);
                                        secondaryTextColor = (RGBLuminanceCalc > 125) ? 'black' : 'white';
                                        e.path[0].parentElement.querySelector("span").style = "color: " + secondaryTextColor + ";";
                                    }
                                }),
                                createElement("span",{},"Secondary")
                            ),
                            createElement("div",{
                                className: "colorwayCreator-colorPreview",
                                onclick: (e) => {
                                    try{e.path[0].querySelector("input").click();}catch(e){}
                                },
                                style: "background-color: #1e1f22;"
                            },
                                createElement("input",{
                                    type: "color",
                                    value: "#1e1f22",
                                    id: "colorwayCreatorColorpicker_tertiary",
                                    onchange: (e) => {
                                        e.path[0].parentElement.style = "background-color: " + e.path[0].value + ";";
                                        let splitRGB = (color) => {
                                            if (color.indexOf('rgba') === -1)
                                            color += ',1';
                                            return color.match(/[\.\d]+/g).map(function (a) {
                                                return +a
                                            });
                                        }
                                        let splitRGBValues = splitRGB(e.path[0].parentElement.style.backgroundColor);
                                        let RGBLuminanceCalc = Math.round(((parseInt(splitRGBValues[0]) * 299) +
                                            (parseInt(splitRGBValues[1]) * 587) +
                                            (parseInt(splitRGBValues[2]) * 114)) / 1000);
                                        tertiaryTextColor = (RGBLuminanceCalc > 125) ? 'black' : 'white';
                                        e.path[0].parentElement.querySelector("span").style = "color: " + tertiaryTextColor + ";";
                                    }
                                }),
                                createElement("span",{},"Tertiary")
                            ),
                            createElement("div",{
                                className: "colorwayCreator-colorPreview",
                                onclick: (e) => {
                                    try{e.path[0].querySelector("input").click();}catch(e){}
                                },
                                style: "background-color: hsl(235 85.6% 64.7%);"
                            },
                                createElement("input",{
                                    type: "color",
                                    value: "#5865f2",
                                    id: "colorwayCreatorColorpicker_accent",
                                    onchange: (e) => {
                                        e.path[0].parentElement.style = "background-color: " + e.path[0].value + ";";
                                        let splitRGB = (color) => {
                                            if (color.indexOf('rgba') === -1)
                                            color += ',1';
                                            return color.match(/[\.\d]+/g).map(function (a) {
                                                return +a
                                            });
                                        }
                                        let splitRGBValues = splitRGB(e.path[0].parentElement.style.backgroundColor);
                                        let RGBLuminanceCalc = Math.round(((parseInt(splitRGBValues[0]) * 299) +
                                            (parseInt(splitRGBValues[1]) * 587) +
                                            (parseInt(splitRGBValues[2]) * 114)) / 1000);
                                        accentTextColor = (RGBLuminanceCalc > 125) ? 'black' : 'white';
                                        e.path[0].parentElement.querySelector("span").style = "color: " + accentTextColor + ";";
                                    }
                                }),
                                createElement("span",{},"Accent")
                            )
                            
                        )
                    )

                    let bulkRemoveAttribute = (el, attr) => {
                        if(attr.isArray) {
                            attr.forEach(attra => {
                                el.removeAttribute(attra);
                            })
                        } else {
                            el.removeAttribute(attr);
                        }
                    }

                    let stageTwo = createElement("div", {
                        className: Utilities.className("colorwayCreatorWrapperStage")
                    });

                    stageOne.append(modalHeader("Name:"),textInput("Give your Colorway a name","discordColorwayCreator_name"),modalHeader("Colors:"),creationPanel,createElement("div",{class: "colorwayModalFooter"},
                        modalBtnGray("Cancel",{
                            onclick: (e) => {
                                try {
                                    e.path[6].lastChild.querySelector('button[type="button"]').click();
                                } catch(e) {

                                }
                            }
                        }),
                        modalBtn("Next",{
                            onclick: (e) => {
                                stageOne.style = "display: none";
                                if(!document.getElementById("discordColorwayCreator_name").value) {
                                    document.getElementById("discordColorwayCreator_name").value = "defaultColorwayName";
                                }
                                stageTwo.append(modalHeader("Preview:"),createElement("div",{
                                    class: "colorwayPreview-background",
                                    style: "background-color: " + document.getElementById("colorwayCreatorColorpicker_tertiary").value + ";"
                                },
                                createElement("div",{
                                    class: "colorwayPreview-chat",
                                    style: "background-color: " + document.getElementById("colorwayCreatorColorpicker_primary").value + ";"
                                },
                                createElement("div",{
                                    class: "colorwayPreview-channels",
                                    style: "background-color: " + document.getElementById("colorwayCreatorColorpicker_secondary").value + ";"
                                },
                                createElement("div",{
                                    class: "colorwayPreview-userArea",
                                    style: "background-color: " + secondaryAlt + ";"
                                })
                                )
                                ),
                                createElement("div",{
                                    class: "colorwayPreview-guildsWrapper"
                                },
                                createElement("div",{
                                    class: "colorwayPreview-guildsIcon colorwayPreview-homeIcon",
                                    style: "background-color: " + document.getElementById("colorwayCreatorColorpicker_primary").value + "; --background-hover: " + document.getElementById("colorwayCreatorColorpicker_accent").value + ";"
                                },
                                createElement("div",{
                                    class: "colorways-discordIcon"
                                })
                                ),
                                createElement("div",{
                                    class: "colorwayPreview-guildsSeparator"
                                }),
                                createElement("div",{
                                    class: "colorwayPreview-guildsIcon",
                                    style: "background-color: " + document.getElementById("colorwayCreatorColorpicker_primary").value + "; --background-hover: " + document.getElementById("colorwayCreatorColorpicker_accent").value + ";"
                                })
                                )
                                ),
                                createElement("div",{class: "colorwayModalFooter"},
                                    modalBtnGray("Cancel",{
                                        onclick: (e) => {
                                            try {
                                                e.path[6].lastChild.querySelector('button[type="button"]').click();
                                            } catch(e) {
            
                                            }
                                        }
                                    }),
                                    modalBtn("Finish",{
                                        onclick: (e) => {
                                            let customColorwayCSS = `
:root {
    --scrollbar-auto-track: var(--background-secondary);
    --scrollbar-auto-thumb: var(--background-tertiary);
    --scrollbar-thin-thumb: var(--background-tertiary);
    --button-secondary-background: var(--background-secondary);
    --button-secondary-background-active: var(--background-secondary);
    --button-secondary-background-hover: var(--background-secondary-alt);
    --background-modifier-selected: var(--background-secondary-alt);
    --background-modifier-hover: var(--background-primary);
    --background-modifier-active: var(--background-tertiary);
    --brand-100: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-140: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-160: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-200: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-230: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-260: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-300: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-330: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-345: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-360: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-400: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-430: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-460: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-500: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-530: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-560: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-600: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-630: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-660: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-700: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-730: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-760: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-800: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-830: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-860: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --brand-900: ${document.getElementById("colorwayCreatorColorpicker_accent").value};
    --modal-background: var(--background-primary);
    --modal-footer-background: var(--background-secondary);
}
.theme-dark {
    --background-floating: #000000;
    --background-tertiary: ${document.getElementById("colorwayCreatorColorpicker_tertiary").value};
    --background-secondary-alt: ${secondaryAlt};
    --background-secondary: ${document.getElementById("colorwayCreatorColorpicker_secondary").value};
    --background-primary: ${document.getElementById("colorwayCreatorColorpicker_primary").value};
    --background-accent: ${primaryLighter};
    --input-background: var(--background-accent);
    --channeltextarea-background: var(--background-accent);
}

/*Primary*/
.theme-dark .container-2cd8Mz *,
.theme-dark .body-16rSsp *,
.theme-dark .toolbar-3_r2xA *,
.theme-dark .container-89zvna *,
.theme-dark .messageContent-2t3eCI,
.theme-dark .channelTextArea-1FufC0 *,
.theme-dark .attachButtonPlus-3IYelE,
.theme-dark .username-h_Y3Us:not([style]),
.theme-dark .children-3xh0VB *,
.theme-dark .buttonContainer-1502pf * {
    color: ${primaryTextColor} !important;
}
.theme-dark .contentRegionScroller-2_GT_N *:not(.mtk1,.mtk2,.mtk3,.mtk4,.mtk5,.mtk6,.mtk7,.mtk8,.mtk9,.monaco-editor .line-numbers) {
    color: ${primaryTextColor} !important;
}
.theme-dark .callContainer-HtHELf * {
    color: white !important;
    fill: white !important;
}
/*Secondary*/
.theme-dark .wrapper-2RrXDg *,
.theme-dark .sidebar-1tnWFu *:not(.hasBanner-2IrYih *),
.theme-dark .members-3WRCEx *:not([style]),
.theme-dark .sidebarRegionScroller-FXiQOh *,
.theme-dark .header-1XpmZs {
    color: ${secondaryTextColor} !important;
}
/*Tertiary*/
.theme-dark .winButton-3UMjdg,
.theme-dark .listItem-3SmSlK *,
.theme-dark .searchBar-2aylmZ *,
.theme-dark .wordmarkWindows-2dq6rw,
.theme-dark .searchBar-jGtisZ *,
.theme-dark .searchBarComponent-3N7dCG {
    color: ${tertiaryTextColor} !important;
    fill: ${tertiaryTextColor} !important;
}
/*Accent*/
.theme-dark .selected-2r1Hvo *,
.theme-dark .selected-1Drb7Z * {
    color: ${accentTextColor} !important;
    fill: ${accentTextColor} !important;
}
`
                                            customColorway = [
                                                {
                                                name: document.getElementById("discordColorwayCreator_name").value,
                                                primary: {
                                                    background: document.getElementById("colorwayCreatorColorpicker_primary").value,
                                                    foreground: primaryTextColor
                                                },
                                                secondary: {
                                                    background: document.getElementById("colorwayCreatorColorpicker_secondary").value,
                                                    foreground: secondaryTextColor
                                                },
                                                secondaryAlt: {
                                                    background: secondaryAlt,
                                                    foreground: secondaryTextColor
                                                },
                                                tertiary: {
                                                    background: document.getElementById("colorwayCreatorColorpicker_tertiary").value,
                                                    foreground: tertiaryTextColor
                                                },
                                                accent: {
                                                    background: document.getElementById("colorwayCreatorColorpicker_accent").value,
                                                    foreground: accentTextColor
                                                },
                                                import: customColorwayCSS
                                            }];

                                            let customColorwayArray = [];
                                            customColorwayArray.push(customColorway[0]);
                                            if(!BdApi.loadData("DiscordColorways", "custom_colorways") || BdApi.loadData("DiscordColorways", "custom_colorways") == []) {
                                                
                                            } else {
                                                BdApi.loadData("DiscordColorways", "custom_colorways").forEach(el => {
                                                    if(el.name != document.getElementById("discordColorwayCreator_name").value) {
                                                        customColorwayArray.push(el);
                                                    }
                                                })
                                            }
                                            BdApi.saveData("DiscordColorways", "custom_colorways", customColorwayArray);
                                            customColorwayArray = [];
                                            try {
                                                e.path[6].lastChild.querySelector('button[type="button"]').click();
                                            } catch(e) {
            
                                            }
                                        }
                                    })
                                ));
                                stageTwo.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
                                container.append(stageTwo);
                            }
                        })
                    ));

                    container.append(stageOne);

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
                },
                "colorwayCreationModal": elements => {
                    for (const el of elements) {
                        if (el.getElementsByClassName("ColorwaySelectorWrapper").length || el._patched) continue;

                        new ColorwayCreator(el).mount();
                    }
                }
            };
            return class DiscordColorways extends Plugin {
                css = `
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
                .colorwayPreview-chat {
                    border-top-left-radius: 4px;
                    border-bottom-right-radius: 8px;
                    width: calc(564px - 72px);
                    height: calc(270px - 22px);
                    margin-top: 22px;
                    margin-left: 72px;
                    float: right;
                }
                .colorwayPreview-channels {
                    width: 140px;
                    height: 100%;
                    border-top-left-radius: 4px;
                    position: relative;
                }
                .colorwayPreview-userArea {
                    width: 140px;
                    height: 40px;
                    position: absolute;
                    bottom: 0;
                }
                .colorwayPreview-guildsWrapper {
                    height: calc(270px - 26px);
                    width: 72px;
                    display: flex;
                    gap: 8px;
                    flex-direction: column;
                    align-items: center;
                    position: absolute;
                    top: 26px;
                    left: 0;
                }
                .colorwayPreview-guildsIcon {
                    cursor: pointer;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    transition: .15s ease-out;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: var(--colorway-foreground-primary);
                }
                .colorwayPreview-guildsIcon:hover {
                    background-color: var(--background-hover) !important;
                    color: var(--colorway-foreground-accent);
                    border-radius: 16px;
                }
                .colorwayPreview-guildsSeparator {
                    width: 32px;
                    height: 2px;
                    border-radius: 1px;
                    background-color: var(--background-modifier-accent);
                }
                #showCustomColorways > span {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 8px;
                }
                .colorways-discordIcon {
                    width: 26px;
                    height: 20px;
                    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='homeIcon-r0w4ny' aria-hidden='true' role='img' width='28' height='20' viewBox='0 0 28 20'%3E%3Cpath fill='currentColor' d='M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4062 0.461742 17.1749 0.934541 16.9708 1.4184C15.003 1.12145 12.9974 1.12145 11.0283 1.4184C10.819 0.934541 10.589 0.461744 10.3368 0.00546311C8.48074 0.324393 6.67795 0.885118 4.96746 1.68231C1.56727 6.77853 0.649666 11.7538 1.11108 16.652C3.10102 18.1418 5.3262 19.2743 7.69177 20C8.22338 19.2743 8.69519 18.4993 9.09812 17.691C8.32996 17.3997 7.58522 17.0424 6.87684 16.6135C7.06531 16.4762 7.24726 16.3387 7.42403 16.1847C11.5911 18.1749 16.408 18.1749 20.5763 16.1847C20.7531 16.3332 20.9351 16.4762 21.1171 16.6135C20.41 17.0369 19.6639 17.3997 18.897 17.691C19.3052 18.4993 19.7718 19.2689 20.3021 19.9945C22.6677 19.2689 24.8929 18.1364 26.8828 16.6466H26.8893C27.43 10.9731 25.9665 6.04728 23.0212 1.67671ZM9.68041 13.6383C8.39754 13.6383 7.34085 12.4453 7.34085 10.994C7.34085 9.54272 8.37155 8.34973 9.68041 8.34973C10.9893 8.34973 12.0395 9.54272 12.0187 10.994C12.0187 12.4453 10.9828 13.6383 9.68041 13.6383ZM18.3161 13.6383C17.0332 13.6383 15.9765 12.4453 15.9765 10.994C15.9765 9.54272 17.0124 8.34973 18.3161 8.34973C19.6184 8.34973 20.6751 9.54272 20.6543 10.994C20.6543 12.4453 19.6184 13.6383 18.3161 13.6383Z'%3E%3C/path%3E%3C/svg%3E");
                    -webkit-mask-size: 100%;
                    -webkit-mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                    background-color: currentColor;
                }
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
                .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper, .colorwayCreationModal) {
                    width: fit-content;
                    min-width: 620px;
                }
                .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper, .colorwayCreationModal) .footer-IubaaS {
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
                .colorwaySettingsWrapper, .colorwayCreatorWrapper {
                    border-radius: 8px;
                    background-color: var(--background-floating);
                    padding: 12px;
                }
                .colorwayCreatorWrapper, .colorwayCreatorWrapperStage {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .colorwaySettingsWrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .colorwaySetting {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    color: var(--header-primary);
                    font-weight: 600;
                }
                .colorwayCreator-colorPreviews {
                    width: 100%;
                    height: 46px;
                    border-radius: 8px;
                    background-color: #000;
                    display: flex;
                    flex-direction: row;
                    overflow: hidden;
                }
                .colorwayCreator-colorPreview {
                    display: flex;
                    width: calc(100%/4);
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }
                .colorwayCreator-colorPreview > input[type="color"] {
                    width: 1px;
                    height: 1px;
                    opacity: 0;
                    position: absolute;
                    pointer-events: none;
                }
                .colorwayCreator-colorPreview > span {
                    color: #fff;
                    pointer-events: none;
                }
                .colorwayCreatorWrapper > h2 {
                    margin-bottom: 0 !important;
                }
                .colorwayModalBtn {
                    width: fit-content;
                }
                .colorwayModalFooter {
                    display: flex;
                    flex-direction: row;
                    justify-content: end;
                    gap: 4px;
                }
                .customColorwaySelector {
                    display: none;
                }
                `;
                onStart() {
                    colorwayList = fetch("https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json").then(res => res.json()).then(colors => colorwayList = colors.colorways);
                    PluginUtilities.addStyle(config.info.name, this.css);

                    if(BdApi.loadData("DiscordColorways","settings").showCustomColorways == true) {
                        PluginUtilities.addStyle("visibleCustomColorways", `
.customColorwaySelector {display: flex !important;}
                        `);
                    }

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
                    PluginUtilities.removeStyle("visibleCustomColorways");
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
