/**
* @name DiscordColorways
* @displayName DiscordColorways
* @description The Definitive way of styling Discord. Create, use and share the colors that fit you. (This code is partially based on [Platformindicators](https://github.com/Strencher/BetterDiscordStuff/tree/master/PlatformIndicators))
* @author DaBluLite
* @authorId 582170007505731594
* @invite ZfPH6SDkMW
* @version 3.5.2
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
let defaultSettings = { activeColorway: "", activeColorwayID: "disablecolorway", showInGuildBar: false };
let userSettings = {};
let completeSettings = Object.assign(userSettings, defaultSettings, BdApi.loadData("DiscordColorways", "settings"));
BdApi.saveData("DiscordColorways", "settings", completeSettings);
let config = { info: { creatorVersion: "1.11" } };

const { Webpack, Webpack: { Filters }, React, DOM, Patcher } = BdApi;
const [ThemeEditor, HomeIcon, Toast, TextBadge, InputDefault] = Webpack.getBulk.apply(null, [Filters.byProps("themeEditor"), Filters.byProps("homeIcon"), Filters.byProps("createToast"), Filters.byProps("textBadge"), Filters.byProps("inputDefault")].map(fn => ({ filter: fn })));
//const Flux = Object.assign({}, Webpack.getByKeys("Store", "connectStores"), Webpack.getByKeys("useStateFromStores"));
//const UserStore = Webpack.getByKeys("getCurrentUser");
const H5 = Webpack.getByKeys("h5")['h5'];
const TextBadgeClassName = TextBadge['textBadge'] + " " + TextBadge['baseShapeRound'];
const ButtonBrandClass = Webpack.getByKeys("colorBrand")['button'] + " " + Webpack.getByKeys("colorBrand")['lookFilled'] + " " + Webpack.getByKeys("colorBrand")['colorBrand'] + " " + Webpack.getByKeys("colorBrand")['sizeMedium'] + " " + Webpack.getByKeys("colorBrand")['grow'];
const ButtonPrimaryClass = Webpack.getByKeys("colorBrand")['button'] + " " + Webpack.getByKeys("colorBrand")['lookFilled'] + " " + Webpack.getByKeys("colorBrand")['colorPrimary'] + " " + Webpack.getByKeys("colorBrand")['sizeMedium'] + " " + Webpack.getByKeys("colorBrand")['grow'];
const ButtonRedClass = Webpack.getByKeys("colorBrand")['button'] + " " + Webpack.getByKeys("colorBrand")['lookFilled'] + " " + Webpack.getByKeys("colorBrand")['colorRed'] + " " + Webpack.getByKeys("colorBrand")['sizeMedium'] + " " + Webpack.getByKeys("colorBrand")['grow'];
const Swatch = Webpack.getByKeys("colorSwatch")['swatch'];
const GuildsListItem = Webpack.getAllByKeys("listItem")[1].listItem;
const GuildsListItemWrapper = Webpack.getAllByKeys("listItemWrapper")[1].listItemWrapper;
const HeadingSemibold = Webpack.getAllByKeys("heading-lg/semibold")[2]['heading-lg/semibold'];

let nativeToast = (e, t) => Toast.showToast(Toast.createToast(e, t));
let textInput = (e, t) => { let n = { type: "text", class: InputDefault['inputDefault'] }; if (e) n['placeholder'] = e; if (t) n['id'] = t; return createElement("input", n); };
let modalBtn = (e, t) => { if (!t) t = {}; t['class'] = ButtonBrandClass + " colorwayModalBtn"; return createElement("button", t, e); }
let modalBtnGray = (e, t) => { if (!t) t = {}; t['class'] = ButtonPrimaryClass + " colorwayModalBtn"; return createElement("button", t, e); }
let modalBtnRed = (e, t) => { if (!t) t = {}; t['class'] = ButtonRedClass + " colorwayModalBtn"; return createElement("button", t, e); }
let modalBtnReact = (e, t) => { if (!t) t = {}; t['class'] = ButtonBrandClass + " colorwayModalBtn"; return React.createElement("button", t, e); }
let modalBtnGrayReact = (e, t) => { if (!t) t = {}; t['class'] = ButtonPrimaryClass + " colorwayModalBtn"; return React.createElement("button", t, e); }
let modalBtnRedReact = (e, t) => { if (!t) t = {}; t['class'] = ButtonRedClass + " colorwayModalBtn"; return React.createElement("button", t, e); }
let modalHeader = (e) => createElement("h2", { class: H5 }, e);
let modalHeading = (e) => createElement("h1", { class: HeadingSemibold+" customModalHeading" }, e);
let modalHeaderReact = (e) => React.createElement("h2", { class: H5 }, e);
let betaBadge = () => createElement("div", { class: TextBadgeClassName, style: "background-color: var(--brand-500);" }, "Beta");
//let alphaBadge = () => createElement("div", { class: TextBadgeClassName, style: "background-color: var(--background-secondary);" }, "Alpha");
let versionBadge = (e, t) => createElement("div", { class: TextBadgeClassName, style: "background-color: var(--background-secondary);" }, `${e} V${t}`);
let primaryBadge = (e) => createElement("div", { class: TextBadgeClassName, style: "background-color: var(--background-secondary);" },e);
//let unstableBadge = () => createElement("div", { class: TextBadgeClassName, style: "background-color: var(--red-430);" }, "Unstable");
const bdSwitch = (e, t) => { t['class'] = "bd-switch"; this.switch = createElement("div", t, new DOMParser().parseFromString('<input type="checkbox" ' + (() => { if (e == true) return "checked" })() + '><div class="bd-switch-body"><svg class="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet"><rect class="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect><svg class="bd-switch-symbol" viewBox="0 0 20 20" fill="none"><path></path><path></path></svg></svg></div>', 'text/html').body.children[0], new DOMParser().parseFromString('<input type="checkbox" ' + (() => { if (e == true) return "checked" })() + '><div class="bd-switch-body"><svg class="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet"><rect class="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect><svg class="bd-switch-symbol" viewBox="0 0 20 20" fill="none"><path></path><path></path></svg></svg></div>', 'text/html').body.children[1]); return this.switch; }

const createElement = (type, props, ...children) => {
    if (typeof type === "function") return type({ ...props, children: [].concat() })

    const node = document.createElement(type);

    for (const key of Object.keys(props)) {
        if (key.indexOf("on") === 0) node.addEventListener(key.slice(2).toLowerCase(), props[key]);
        else if (key === "children") {
            node.append(...(Array.isArray(props[key]) ? props[key] : [].concat(props[key])));
        } else if (key === "view-box") {
            node.setAttribute(key.replace("-b", "B"), props[key]);
        } else {
            node.setAttribute(key === "className" ? "class" : key, props[key]);
        }
    }

    if (children.length) node.append(...children);

    return node;
};

function HexToHSL(H) {
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;

    if (delta == 0) h = 0;
    else if (cmax == r) h = ((g - b) / delta) % 6;
    else if (cmax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [h, s, l];
}

const RGBToHSL = (r, g, b) => { r /= 255; g /= 255; b /= 255; const l = Math.max(r, g, b); const s = l - Math.min(r, g, b); const h = s ? l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s : 0; let finalH = 60 * h < 0 ? 60 * h + 360 : 60 * h; let finalS = 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0); let finalL = (100 * (2 * l - s)) / 2; return [finalH, finalS, finalL]; };

class ColorwaySelector {
    constructor(target) {
        this.ref = null;
        this.target = target;
        this._destroyed = false;

        target._patched = true;

        this.container = createElement("div", {
            className: "ColorwaySelectorWrapperContainer",
        });


        DOM.onRemoved(target, () => this.unmount());
    }

    unmount() {
        this.ref?.remove();
        this._destroyed = true;
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
        let colorwayArray = [];
        let customcolorwayArray = [];

        let wrapper = createElement("div", {
            className: "ColorwaySelectorWrapper",
        });

        let customwrapper = createElement("div", {
            className: "ColorwaySelectorWrapper customColorwaySelector",
        });

        let refreshColorwayBtn = createElement("div", {
            className: "discordColorway themeSelection-2u4ce0",
            id: "colorway-refreshcolorway",
            onclick: (e) => {
                e.srcElement.parentElement.previousElementSibling.append("span",{id:"colorwayRefreshStatus"},"Refreshing...")
                colorwayList = fetch("https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json").then(res => res.json()).then(colors => {
                    colorwayList = colors.colorways;
                    const elements = Array.from(document.body.getElementsByClassName("colorwaySelectorModal"));
                    if (elements.length) {
                        for (const el of elements) {
                            document.querySelector(".ColorwaySelectorWrapperContainer").remove();
                            new ColorwaySelector(el).mount();
                        }
                    }
                    const elements2 = Array.from(document.body.getElementsByClassName("basicThemeSelectors-2wNKs6"));
                    if (elements2.length) {
                        for (const el of elements2) {
                            document.querySelector(".ColorwaySelectorWrapperContainer").remove();
                            new ColorwaySelector(el).mount();
                        }
                    }
                    document.getElementById("colorwayRefreshStatus").remove();
                });
            }
        }, createElement("div", {
            className: "colorwayRefreshIcon"
        }));

        BdApi.UI.createTooltip(refreshColorwayBtn, "Refresh Colorways", {});
        colorwayArray.push(refreshColorwayBtn);


        let addColorwayBtn = createElement("div", {
            className: "discordColorway themeSelection-2u4ce0",
            id: "colorway-createcolorway",
            onclick: (el) => {
                BdApi.showConfirmationModal("Create Colorway", React.createElement("div", { class: "colorwayCreationModal" }))
            }
        }, createElement("div", {
            className: "colorwayCreateIcon"
        }),
            createElement("div", {
                className: "colorwayCheckIconContainer"
            },
                createElement("div", {
                    className: "colorwayCheckIcon"
                }))
        );
        BdApi.UI.createTooltip(addColorwayBtn, "Create Colorway...", {});
        colorwayArray.push(addColorwayBtn);
        
        let settingsBtn = createElement("div", {
            className: "discordColorway themeSelection-2u4ce0",
            id: "colorway-settings",
            onclick: (el) => {
                BdApi.showConfirmationModal("DiscordColorway Settings", [React.createElement("div", { className: "colorwaySettingsContainer" })]);
            }
        }, createElement("div", {
            className: "colorwaySettingsIcon"
        }));
        BdApi.UI.createTooltip(settingsBtn, "Settings", {});
        colorwayArray.push(settingsBtn);

        try {
            colorwayList.forEach((colorway, ind) => {
                let colorwayElem = createElement("div", {
                    className: "discordColorway themeSelection-2u4ce0",
                    id: "colorway-" + colorway.name,
                    "data-last-official": ind+1 == colorwayList.length ? true:false,
                    onclick: (el) => {
                        if (!el.srcElement.classList.contains("active")) {
                            userSettings = {
                                activeColorway: colorway.import,
                                activeColorwayID: colorway.name,
                                showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar
                            }
                            BdApi.saveData("DiscordColorways", "settings", userSettings);
                            if (document.getElementById("activeColorway")) {
                                document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                            } else {
                                document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                            }
                            try {
                                if (document.querySelector(".discordColorway.active") != "colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                                    document.querySelector(".discordColorway.active").classList.remove("active");
                                }
                            } catch (e) {
                                console.warn("Uncaught Exception: " + e);
                            }
                            el.srcElement.classList.add("active");
                            nativeToast(React.createElement("div", { class: "discordColorwayOnToast" }, [React.createElement("div", {
                                class: "discordColorway themeSelection-2u4ce0"
                            }, React.createElement("div", {
                                class: "discordColorwayPreviewColorContainer"
                            }, [
                                React.createElement("div", {
                                    className: "discordColorwayPreviewColor",
                                    style: { backgroundColor: colorway.accent }
                                }),
                                React.createElement("div", {
                                    className: "discordColorwayPreviewColor",
                                    style: { backgroundColor: colorway.primary }
                                }),
                                React.createElement("div", {
                                    className: "discordColorwayPreviewColor",
                                    style: { backgroundColor: colorway.secondary }
                                }),
                                React.createElement("div", {
                                    className: "discordColorwayPreviewColor",
                                    style: { backgroundColor: colorway.tertiary }
                                })
                            ])), "Applied Colorway Successfully"]), 0);
                        } else {
                            userSettings = {
                                activeColorway: "",
                                activeColorwayID: "disablecolorway",
                                showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar
                            }
                            BdApi.saveData("DiscordColorways", "settings", userSettings);
                            if (document.getElementById("activeColorway")) {
                                document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                            } else {
                                document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                            }
                            try {
                                if (document.querySelector(".discordColorway.active")) {
                                    document.querySelector(".discordColorway.active").classList.remove("active");
                                }
                            } catch (e) {
                                console.warn("Uncaught Exception: " + e);
                            }
                            nativeToast("Disabled Colorway Successfully", 1);
                        }
                    }
                },
                    createElement("div", {
                        class: "discordColorwayPreviewColorContainer"
                    },
                        createElement("div", {
                            className: "discordColorwayPreviewColor",
                            style: "background-color: " + colorway.accent
                        }),
                        createElement("div", {
                            className: "discordColorwayPreviewColor",
                            style: "background-color: " + colorway.primary
                        }),
                        createElement("div", {
                            className: "discordColorwayPreviewColor",
                            style: "background-color: " + colorway.secondary
                        }),
                        createElement("div", {
                            className: "discordColorwayPreviewColor",
                            style: "background-color: " + colorway.tertiary
                        })),
                    createElement("div", {
                        className: "colorwayCheckIconContainer"
                    },
                        createElement("div", {
                            className: "colorwayCheckIcon"
                        })),
                    createElement("div", {
                        className: "colorwayInfoIconContainer",
                        onclick: (el) => {
                            el.stopPropagation();
                            BdApi.showConfirmationModal(["Colorway Details: " + colorway.name], React.createElement("div", {
                                class: "colorwayInfoModalDetails"
                            }, [
                                React.createElement("div", { class: "colorwayColors" }, [
                                    React.createElement("div", { class: Swatch, style: { backgroundColor: colorway.accent }, onClick: ()=>{
                                        DiscordNative.clipboard.copy(colorway.accent);
                                        nativeToast("Copied color successfully",1);
                                    } }),
                                    React.createElement("div", { class: Swatch, style: { backgroundColor: colorway.primary }, onClick: ()=>{
                                        DiscordNative.clipboard.copy(colorway.primary);
                                        nativeToast("Copied color successfully",1);
                                    } }),
                                    React.createElement("div", { class: Swatch, style: { backgroundColor: colorway.secondary }, onClick: ()=>{
                                        DiscordNative.clipboard.copy(colorway.secondary);
                                        nativeToast("Copied color successfully",1);
                                    } }),
                                    React.createElement("div", { class: Swatch, style: { backgroundColor: colorway.tertiary }, onClick: ()=>{
                                        DiscordNative.clipboard.copy(colorway.tertiary);
                                        nativeToast("Copied color successfully",1);
                                    } })
                                ]),
                                React.createElement("span", { class: "colorwayAuthor" }, [modalHeaderReact("Author: "), modalBtnGrayReact(colorway.author, {
                                    class: "colorwayAuthorLink", onClick: (e) => {
                                        (async (userId) => {
                                            const find = BdApi.Webpack.getModule;
                                            const findByCode = (...codes) => find(BdApi.Webpack.Filters.byStrings(...codes), {searchExports: true});
                                            const findStore = name => find(m => m.constructor?.displayName === name)
                                            
                                            const getUser = findByCode("USER(");
                                            const openProfile = findByCode("friendToken", "USER_PROFILE_MODAL_OPEN");
                                            const guildId = findStore("SelectedGuildStore").getGuildId()
                                            const channelId = findStore("SelectedChannelStore").getChannelId()
                                            
                                            const user = await getUser(userId);
                                            openProfile({
                                                userId,
                                                guildId,
                                                channelId,
                                                analyticsLocation: {
                                                    page: guildId ? "Guild Channel" : "DM Channel",
                                                    section: "Profile Popout"
                                                }
                                            })
                                        })(colorway.authorID)
                                    }
                                })]),
                                React.createElement("span", { class: "colorwayImport colorwayCodeblockWrapper" }, [modalHeaderReact("Import: "), React.createElement("span", { class: "colorwayCodeblock" }, colorway.import)])
                            ]), {
                                confirmText: "Set Theme",
                                onConfirm: () => {
                                    if (!el.path[1].parentElement.classList.contains("active")) {
                                        userSettings = {
                                            activeColorway: colorway.import,
                                            activeColorwayID: colorway.name
                                        }
                                        BdApi.saveData("DiscordColorways", "settings", userSettings);
                                        if (document.getElementById("activeColorway")) {
                                            document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                                        } else {
                                            document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                                        }
                                        try {
                                            if (document.querySelector(".discordColorway.active") != "colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                                                document.querySelector(".discordColorway.active").classList.remove("active");
                                            }
                                        } catch (e) {
                                            console.warn("Uncaught Exception: " + e);
                                        }
                                        el.path[1].parentElement.classList.add("active");
                                    }
                                }
                            });
                        }
                    },
                        createElement("div", {
                            className: "colorwayInfoIcon"
                        }))
                );
                BdApi.UI.createTooltip(colorwayElem, colorway.name, {});
                colorwayArray.push(colorwayElem);
            });
        } catch (e) {
            console.warn("Unexpected error: " + e);
        }


        try {
            BdApi.loadData("DiscordColorways", "custom_colorways").forEach((colorway) => {

                let colorwayElem = createElement("div", {
                    className: "discordColorway themeSelection-2u4ce0",
                    id: "colorway-" + colorway.name,
                    onclick: (el) => {
                        if (!el.srcElement.classList.contains("active")) {
                            userSettings = {
                                activeColorway: colorway.import,
                                activeColorwayID: colorway.name,
                                showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar
                            }
                            BdApi.saveData("DiscordColorways", "settings", userSettings);
                            if (document.getElementById("activeColorway")) {
                                document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                            } else {
                                document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                            }
                            try {
                                if (document.querySelector(".discordColorway.active") != "colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                                    document.querySelector(".discordColorway.active").classList.remove("active");
                                }
                            } catch (e) {
                                console.warn("Uncaught Exception: " + e);
                            }
                            el.srcElement.classList.add("active");
                            nativeToast(React.createElement("div", { class: "discordColorwayOnToast" }, [React.createElement("div", {
                                class: "discordColorway themeSelection-2u4ce0"
                            }, React.createElement("div", {
                                class: "discordColorwayPreviewColorContainer"
                            }, [
                                React.createElement("div", {
                                    className: "discordColorwayPreviewColor",
                                    style: { backgroundColor: colorway.accent.background }
                                }),
                                React.createElement("div", {
                                    className: "discordColorwayPreviewColor",
                                    style: { backgroundColor: colorway.primary.background }
                                }),
                                React.createElement("div", {
                                    className: "discordColorwayPreviewColor",
                                    style: { backgroundColor: colorway.secondary.background }
                                }),
                                React.createElement("div", {
                                    className: "discordColorwayPreviewColor",
                                    style: { backgroundColor: colorway.tertiary.background }
                                })
                            ])), "Applied Custom Colorway Successfully"]), 0);
                        } else {
                            userSettings = {
                                activeColorway: "",
                                activeColorwayID: "disablecolorway",
                                showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar
                            }
                            BdApi.saveData("DiscordColorways", "settings", userSettings);
                            if (document.getElementById("activeColorway")) {
                                document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                            } else {
                                document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                            }
                            try {
                                if (document.querySelector(".discordColorway.active")) {
                                    document.querySelector(".discordColorway.active").classList.remove("active");
                                }
                            } catch (e) {
                                console.warn("Uncaught Exception: " + e);
                            }
                            nativeToast("Disabled Colorway Successfully", 1);
                        }
                    }
                },
                    createElement("div", {
                        className: "colorwayCheckIconContainer"
                    },
                        createElement("div", {
                            className: "colorwayCheckIcon"
                        })),
                    createElement("div", {
                        className: "colorwayInfoIconContainer",
                        onclick: (el) => {
                            el.stopPropagation();
                            function lines(text) {
                                return text.split('\n')
                            }
                            let colorwayIDArray = `${colorway.accent.background},${colorway.primary.background},${colorway.secondary.background},${colorway.tertiary.background}`;
                            let colorwayID = Buffer(colorwayIDArray).toString('hex');
                            let codeblockLines = [];
                            lines(colorway.import).forEach((importedLine, i) => {
                                let line = React.createElement("span", { style: { display: "flex", alignItems: "center", whiteSpace: "pre", gap: 4 } }, React.createElement("span", { style: { width: 64, height: 19, textAlign: "center", backgroundColor: "rgba(0,0,0,.4)", userSelect: "none", flexBasis: 64, flexGrow: 1, flexShrink: 0, maxWidth: 64 } }, i + 1), importedLine);
                                codeblockLines.push(line);
                            })
                            BdApi.showConfirmationModal(["Colorway Details: " + colorway.name], React.createElement("div", {
                                class: "colorwayInfoModalDetails"
                            }, [
                                React.createElement("div", { class: "colorwayColors" }, [
                                    React.createElement("div", { class: Swatch, style: { backgroundColor: colorway.accent.background }, onClick: ()=>{
                                        DiscordNative.clipboard.copy(colorway.accent.background);
                                        nativeToast("Copied color successfully",1);
                                    } }),
                                    React.createElement("div", { class: Swatch, style: { backgroundColor: colorway.primary.background }, onClick: ()=>{
                                        DiscordNative.clipboard.copy(colorway.primary.background);
                                        nativeToast("Copied color successfully",1);
                                    } }),
                                    React.createElement("div", { class: Swatch, style: { backgroundColor: colorway.secondary.background }, onClick: ()=>{
                                        DiscordNative.clipboard.copy(colorway.secondary.background);
                                        nativeToast("Copied color successfully",1);
                                    } }),
                                    React.createElement("div", { class: Swatch, style: { backgroundColor: colorway.tertiary.background }, onClick: ()=>{
                                        DiscordNative.clipboard.copy(colorway.tertiary.background);
                                        nativeToast("Copied color successfully",1);
                                    } })
                                ]),
                                React.createElement("span", { class: "colorwayAuthor" }, [modalHeaderReact("Author: "), modalBtnGrayReact(colorway.author, {
                                    class: "colorwayAuthorLink", onClick: (e) => {
                                        (async (userId) => {
                                            const find = BdApi.Webpack.getModule;
                                            const findByCode = (...codes) => find(BdApi.Webpack.Filters.byStrings(...codes), {searchExports: true});
                                            const findStore = name => find(m => m.constructor?.displayName === name)
                                            
                                            const getUser = findByCode("USER(");
                                            const openProfile = findByCode("friendToken", "USER_PROFILE_MODAL_OPEN");
                                            const guildId = findStore("SelectedGuildStore").getGuildId()
                                            const channelId = findStore("SelectedChannelStore").getChannelId()
                                            
                                            const user = await getUser(userId);
                                            openProfile({
                                                userId,
                                                guildId,
                                                channelId,
                                                analyticsLocation: {
                                                    page: guildId ? "Guild Channel" : "DM Channel",
                                                    section: "Profile Popout"
                                                }
                                            })
                                        })(colorway.authorID)
                                    }
                                })]),
                                React.createElement("span", { class: "colorwayImport colorwayCodeblockWrapper" }, [modalHeaderReact("CSS: "), React.createElement("span", { class: "colorwayCodeblock" }, codeblockLines)]),
                                React.createElement("div", { class: "colorwayModalFooter footer-IubaaS" }, [
                                    modalBtnGrayReact("Close", {
                                        onClick: (e) => {
                                            try {
                                                e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                            } catch (e) {

                                            }
                                        }
                                    }),
                                    modalBtnGrayReact("Rename", {
                                        onClick: (e) => {
                                            try {
                                                e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                            } catch (e) {

                                            }
                                            BdApi.showConfirmationModal("Rename Colorway:", React.createElement("div", {
                                                class: "colorwayInfoModalDetails"
                                            }, [
                                                React.createElement("input", {
                                                    type: "text",
                                                    class: "inputDefault-Ciwd-S input-3O04eu",
                                                    placeholder: "Give your colorway a new name"
                                                }),
                                                React.createElement("div", { class: "colorwayModalFooter footer-IubaaS" }, [
                                                    React.createElement("button", {
                                                        class: "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                                        onClick: (e) => {
                                                            try {
                                                                e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                                            } catch (e) {

                                                            }
                                                        }
                                                    }, "Cancel"),
                                                    React.createElement("button", {
                                                        class: "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                                        onClick: (e) => {
                                                            if (!e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value) {
                                                                e.target.parentElement.parentElement.querySelector(`input[type="text"]`).placeholder = "C'mon, you can do better!"
                                                            } else {
                                                                let customColorwayArray = [];
                                                                BdApi.loadData("DiscordColorways", "custom_colorways").forEach(el => {
                                                                    if (el.name != colorway.name && el.name != e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value) {
                                                                        customColorwayArray.push(el);
                                                                    }
                                                                })
                                                                let customColorway = [
                                                                    {
                                                                        name: e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value,
                                                                        primary: {
                                                                            background: colorway.primary.background,
                                                                            foreground: colorway.primary.foreground
                                                                        },
                                                                        secondary: {
                                                                            background: colorway.secondary.background,
                                                                            foreground: colorway.secondary.foreground
                                                                        },
                                                                        secondaryAlt: {
                                                                            background: colorway.secondaryAlt.background,
                                                                            foreground: colorway.secondaryAlt.foreground
                                                                        },
                                                                        tertiary: {
                                                                            background: colorway.tertiary.background,
                                                                            foreground: colorway.tertiary.foreground
                                                                        },
                                                                        accent: {
                                                                            background: colorway.accent.background,
                                                                            foreground: colorway.accent.foreground
                                                                        },
                                                                        isGradient: colorway.isGradient || false,
                                                                        import: colorway.import,
                                                                        author: colorway.author,
                                                                        authorID: colorway.authorID,
                                                                        colors: colorway.colors || ["accent", "primary", "secondary", "tertiary"],
                                                                        creatorVersion: config.info.creatorVersion
                                                                    }
                                                                ];
                                                                customColorwayArray.push(customColorway[0]);
                                                                BdApi.saveData("DiscordColorways", "custom_colorways", customColorwayArray);
                                                                try {
                                                                    e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                                                } catch (e) {

                                                                }
                                                                const elements = Array.from(document.body.getElementsByClassName("colorwaySelectorModal"));
                                                                if (elements.length) {
                                                                    for (const el of elements) {
                                                                        document.querySelector(".ColorwaySelectorWrapperContainer").remove();
                                                                        new ColorwaySelector(el).mount();
                                                                    }
                                                                }
                                                                const elements2 = Array.from(document.body.getElementsByClassName("basicThemeSelectors-2wNKs6"));
                                                                if (elements2.length) {
                                                                    for (const el of elements2) {
                                                                        document.querySelector(".ColorwaySelectorWrapperContainer").remove();
                                                                        new ColorwaySelector(el).mount();
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }, "Finish")
                                                ])
                                            ]));
                                        }
                                    }),
                                    modalBtnReact("Copy CSS", {
                                        onClick: (e) => {
                                            try {
                                                DiscordNative.clipboard.copy(colorway.import);
                                            } catch (e) {

                                            }
                                            nativeToast("Copied CSS to Clipboard", 1);
                                        }
                                    }),
                                    modalBtnReact("Copy Colorway ID", {
                                        onClick: (e) => {
                                            DiscordNative.clipboard.copy(colorwayID);
                                            nativeToast("Copied Colorway ID Successfully", 1);
                                            try {
                                                e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                            } catch (e) {

                                            }
                                        }
                                    }),
                                    modalBtnRedReact("Delete Colorway", {
                                        onClick: (e) => {
                                            try {
                                                e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                            } catch (e) {

                                            }
                                            BdApi.showConfirmationModal("Delete Colorway", "Are you sure you want to delete this Colorway?", {
                                                danger: true,
                                                confirmText: "Delete",
                                                onConfirm: () => {
                                                    let customColorwayArray = [];
                                                    BdApi.loadData("DiscordColorways", "custom_colorways").forEach(el => {
                                                        if (el.name != colorway.name) {
                                                            customColorwayArray.push(el);
                                                        }
                                                    })
                                                    BdApi.saveData("DiscordColorways", "custom_colorways", customColorwayArray);
                                                    customColorwayArray = [];
                                                    const elements = Array.from(document.body.getElementsByClassName("colorwaySelectorModal"));
                                                    if (elements.length) {
                                                        for (const el of elements) {
                                                            document.querySelector(".ColorwaySelectorWrapperContainer").remove();
                                                            new ColorwaySelector(el).mount();
                                                        }
                                                    }
                                                    const elements2 = Array.from(document.body.getElementsByClassName("basicThemeSelectors-2wNKs6"));
                                                    if (elements2.length) {
                                                        for (const el of elements2) {
                                                            document.querySelector(".ColorwaySelectorWrapperContainer").remove();
                                                            new ColorwaySelector(el).mount();
                                                        }
                                                    }
                                                    if (colorway.name == BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                                                        userSettings = {
                                                            activeColorway: "",
                                                            activeColorwayID: "disablecolorway",
                                                            showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar
                                                        }
                                                        BdApi.saveData("DiscordColorways", "settings", userSettings);
                                                        if (document.getElementById("activeColorway")) {
                                                            document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                                                        } else {
                                                            document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                                                        }
                                                        try {
                                                            if (document.querySelector(".discordColorway.active") != "colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                                                                document.querySelector(".discordColorway.active").classList.remove("active");
                                                            }
                                                        } catch (e) {
                                                            console.warn("Uncaught Exception: " + e);
                                                        }
                                                        if(BdApi.loadData("DiscordColorways", "settings").activeColorwayID != "disablecolorway")
                                                            document.getElementById("colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID).classList.add("active");
                                                    }
                                                }
                                            });
                                        }
                                    })
                                ])
                            ]), {
                                confirmText: "Set Theme",
                                onConfirm: () => {
                                    if (!el.path[1].parentElement.classList.contains("active")) {
                                        userSettings = {
                                            activeColorway: colorway.import,
                                            activeColorwayID: colorway.name
                                        }
                                        BdApi.saveData("DiscordColorways", "settings", userSettings);
                                        if (document.getElementById("activeColorway")) {
                                            document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                                        } else {
                                            document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                                        }
                                        try {
                                            if (document.querySelector(".discordColorway.active") != "colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                                                document.querySelector(".discordColorway.active").classList.remove("active");
                                            }
                                        } catch (e) {
                                            console.warn("Uncaught Exception: " + e);
                                        }
                                        el.path[1].parentElement.classList.add("active");
                                    }
                                }
                            });
                        }
                    },
                        createElement("div", {
                            className: "colorwayInfoIcon"
                        }))
                );

                if (colorway.isGradient == true) {
                    colorwayElem.append(createElement("div", { className: "discordColorwayPreviewGradient", style: "background: linear-gradient(-45deg, " + colorway.primary.background + " 0%, " + colorway.tertiary.background + " 100%);" }), colorwayElem.children[0]);
                } else {
                    if(!colorway.colors) {
                        colorwayElem.append(createElement("div", {
                            class: "discordColorwayPreviewColorContainer"
                        },
                            createElement("div", { className: "discordColorwayPreviewColor", style: "background-color: " + colorway.accent.background }),
                            createElement("div", { className: "discordColorwayPreviewColor", style: "background-color: " + colorway.primary.background }),
                            createElement("div", { className: "discordColorwayPreviewColor", style: "background-color: " + colorway.secondary.background }),
                            createElement("div", { className: "discordColorwayPreviewColor", style: "background-color: " + colorway.tertiary.background })))
                    } else {
                        let PreviewElem = createElement("div", {
                            class: "discordColorwayPreviewColorContainer"
                        })
                        colorway.colors.forEach(color => {
                            PreviewElem.append(createElement("div", { className: "discordColorwayPreviewColor", style: "background-color: " + colorway[color].background }))
                        })
                        colorwayElem.append(PreviewElem);
                    }
                }

                BdApi.UI.createTooltip(colorwayElem, colorway.name, {});
                customcolorwayArray.push(colorwayElem);
            });
        } catch (e) {
            console.warn("Unexpected error: " + e);
        }



        const container = this.container.cloneNode(true);
        const state = this.state = this.getState();

        container._unmount = this.unmount.bind(this);

        container.append(modalHeader("Colorways"),wrapper,modalHeader("Custom Colorways"),customwrapper);

        colorwayArray.forEach(elem => {
            wrapper.append(elem);
            if (elem.id == `colorway-${BdApi.loadData("DiscordColorways", "settings").activeColorwayID}`) {
                elem.classList.add("active");
            }
        });

        customcolorwayArray.forEach(elem => {
            customwrapper.append(elem);
            if (elem.id == `colorway-${BdApi.loadData("DiscordColorways", "settings").activeColorwayID}`) {
                elem.classList.add("active");
            }
        });

        if (!document.querySelector(".discordColorway.active")) {
            try {
                document.getElementById("colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID).classList.add("active");
            } catch (e) {
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
            className: GuildsListItem+" ColorwaySelectorBtnContainer",
        },);

        DOM.onRemoved(target, () => this.unmount());
    }

    unmount() {
        this.ref?.remove();
        this._destroyed = true;
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
            className: GuildsListItemWrapper + " ColorwaySelectorBtn",
            onclick: () => {
                BdApi.showConfirmationModal(React.createElement("div",{class:"colorways-hideHeader"}), React.createElement("div", { class: "colorwaySelectorModal" }));
            },
            onmouseenter: (e) => {
                e.srcElement.previousElementSibling.append(createElement("span",{class:"item-2LIpTv"}))
            },
            onmouseleave: (e) => {
                e.srcElement.previousElementSibling.children[0].style = "animation: colorwayPillLeave .3s;"
                setTimeout(() => {
                    e.srcElement.previousElementSibling.children[0].remove();
                },300)
            }
        }, createElement("div", {
            className: "colorwaySelectorIcon"
        }));

        BdApi.UI.createTooltip(ColorwaySelectorBtn, "Colorways", {
            side: "right"
        });

        container.append(createElement("div",{
            class: HomeIcon?.pill + " colorwaysBtnPill"
        }),ColorwaySelectorBtn);

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
            className: "colorwaySettingsWrapper",
        },);

        DOM.onRemoved(target, () => this.unmount());
    }

    unmount() {
        this.ref?.remove();
        this._destroyed = true;
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

        container.append(createElement("span", { className: "colorwaySetting", id: "showInGuildBar" }, "Show In Guild bar", bdSwitch(BdApi.loadData("DiscordColorways", "settings").showInGuildBar, {
            onclick: (e) => {
                userSettings = {
                    activeColorway: BdApi.loadData("DiscordColorways", "settings").activeColorway,
                    activeColorwayID: BdApi.loadData("DiscordColorways", "settings").activeColorwayID,
                    showInGuildBar: e.path[1].querySelector("input").checked
                }
                BdApi.saveData("DiscordColorways", "settings", userSettings);
                const className = HomeIcon?.tutorialContainer;
                const elements = Array.from(document.getElementsByClassName(className));

                if (elements.length) {
                    if (e.path[1].querySelector("input").checked) {
                        new BelowHomeColorwaySelector(document.getElementsByClassName(className)[0]).mount();
                    } else {
                        document.querySelector(".ColorwaySelectorBtnContainer").remove();
                    }
                }
            }
        })));

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
            className: "colorwayCreatorWrapper",
        });

        DOM.onRemoved(target, () => this.unmount());
    }

    unmount() {
        this.ref?.remove();
        this._destroyed = true;
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
                if (res.parentElement.classList.contains("data-colorway-id")) {
                    let changeColors = new UIEvent("change", {
                        "view": window,
                        "bubbles": true,
                        "cancelable": true
                    });
                    let colorwayValueArray = res.parentElement.classList[2].split("-")[3].split(/(\w\w)/g).filter(p => !!p).map(c => String.fromCharCode(parseInt(c, 16))).join("").split(",");
                    try {
                        document.getElementById("colorwayCreatorColorpicker_primary").value = colorwayValueArray[1];
                        document.getElementById("colorwayCreatorColorpicker_secondary").value = colorwayValueArray[2];
                        document.getElementById("colorwayCreatorColorpicker_tertiary").value = colorwayValueArray[3];
                        document.getElementById("colorwayCreatorColorpicker_accent").value = colorwayValueArray[0];

                        document.getElementById("colorwayCreatorColorpicker_primary").dispatchEvent(changeColors);
                        document.getElementById("colorwayCreatorColorpicker_secondary").dispatchEvent(changeColors);
                        document.getElementById("colorwayCreatorColorpicker_tertiary").dispatchEvent(changeColors);
                        document.getElementById("colorwayCreatorColorpicker_accent").dispatchEvent(changeColors);
                    } catch (e) {

                    }
                }
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

        let primaryTextColor = 'hsl(210 9.1% 87.1%)';
        let primaryLighterTextColor = 'hsl(210 9.1% 87.1%)';
        let secondaryTextColor = 'white';
        let tertiaryTextColor = 'white';
        let accentTextColor = 'white';
        let customColorway;
        let secondaryToSecondaryAltContrast = -20;

        let backgroundPrimary = "#313338";
        let backgroundSecondary = "#2b2d31";
        let backgroundTertiary = "#1e1f22";
        let accent = "#5865f2";

        let secondaryAlt = "#232428";
        let primaryLighter = "#383a40";
        let secondaryMuted = "gray";
        let currentUserProps = Webpack.getModule(Filters.byProps("getCurrentUser", "getUser")).getCurrentUser();
        let backgroundFloating = [220, 8, 7];

        let useGradient = false;


        const themePresetsArray = [
            /**
             * @name {string} The name of the theme
             * @developer {string} The name of the developer
             * @developerID {int as string} The Discord user ID of the developer
             * @colors {array} An array of up to 4 colors to be previewed (accent, primary, secondary, tertiary)
             * @import {template string} The base config of the colorway, with lines being separated with "\n", use variable names from list in line 2079, with format {{variable}}, {{variable-hsl}} or {{variable-hsl:0}}
            */
            {
                name: "Default",
                developer: "Discord",
                default: true
            },
            {
                name: "Cyan",
                developer: "DaBluLite",
                developerID: "582170007505731594",
                colors: ["accent", "primary", "tertiary"],
                import: `:root {\n    --cyan-accent-color: {{brand-500}};\n    --cyan-background-primary: hsl({{primary-600-hsl}}/40%);\n    --cyan-background-secondary: {{primary-800}};\n}`
            },
            {
                name: "Virtual Boy",
                developer: "Riddim_GLiTCH",
                developerID: "801089753038061669",
                colors: ["accent"],
                import: `:root {\n    --VBaccent: {{brand-500-hsl}};\n    --VBaccent-muted: {{brand-700-hsl}};\n    --VBaccent-dimmest: {{brand-800-hsl}};\n}`
            },
            {
                name: "Modular",
                developer: "aoithesceneryhoarder",
                developerID: "518795791318384647",
                colors: ["accent"],
                import: `:root:root {\n    --h1: {{brand-500-hsl:0}};\n    --s1: {{brand-500-hsl:1}};\n    --l1: {{brand-500-hsl:2}};\n    --h2: {{brand-700-hsl:0}};\n    --s2: {{brand-700-hsl:1}};\n    --l2: {{brand-700-hsl:2}};\n}`
            },
            // Preset Disabled until further notice
            /*{
                name: "Solana",
                developer: "maenDisease",
                developerID: "678469587444170762",
                colors: ["accent", "primary"],
                import: `:root {\n    --accent-hue: {{brand-500-hsl:0}};\n    --accent-saturation: {{brand-500-hsl:1}};\n    --accent-brightness: {{brand-500-hsl:2}};\n    --background-accent-hue: {{primary-600-hsl:0}};\n    --background-accent-saturation: {{primary-600-hsl:1}};\n    --background-accent-brightness: {{primary-600-hsl:2}};\n    --background-overlay-opacity: 0%;\n}`
            }*/
        ]

        let themePresets = createElement("div", {
            class: "colorwayPresetContainer collapsed"
        },
            createElement("div", { class: "colorwayPresetContainerHeader colorwayPresetContainerItem", onclick: (e) => e.srcElement.parentElement.classList.toggle("collapsed") }, modalHeader("Theme Presets "), betaBadge(), new DOMParser().parseFromString(`<svg style="margin-left: auto;" class="expand-3Nh1P5 transition-30IQBn directionDown-2w0MZz" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="img"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10" aria-hidden="true"></path></svg>`, 'text/html').body.children[0])
        );

        themePresetsArray.forEach(e => {
            themePresets.append(createElement("div", {
                class: e.default ? `colorwayPreset colorwayPresetContainerItem selected` : `colorwayPreset colorwayPresetContainerItem`,
                onclick: (e) => {
                    e.srcElement.parentElement.querySelector(".colorwayPreset.selected").classList.remove("selected");
                    e.srcElement.classList.add("selected");
                }
            },
                new DOMParser().parseFromString(`<svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"></path><circle cx="12" cy="12" r="5" class="radioIconForeground-3wH3aU" fill="currentColor"></circle></svg>`, 'text/html').body.children[0],
                createElement("span",{class:"presetName"},e.name),e.name!="Default" ? primaryBadge("by " + e.developer) : ''));
        })

        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }
        function shadeColor(color, percent) {

            var R = parseInt(color.substring(1, 3), 16);
            var G = parseInt(color.substring(3, 5), 16);
            var B = parseInt(color.substring(5, 7), 16);

            R = parseInt(R * (100 + percent) / 100);
            G = parseInt(G * (100 + percent) / 100);
            B = parseInt(B * (100 + percent) / 100);

            R = (R < 255) ? R : 255;
            G = (G < 255) ? G : 255;
            B = (B < 255) ? B : 255;

            R = Math.round(R)
            G = Math.round(G)
            B = Math.round(B)

            var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
            var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
            var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

            return "#" + RR + GG + BB;
        }

        let stageOne = createElement("div", {
            className: "colorwayCreatorWrapperStage"
        });
        stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"

        let creationPanel = (
            createElement("div", {
                className: "colorwayCreator-colorPreviews"
            },
                createElement("div", {
                    className: Swatch,
                    onclick: (e) => {
                        try { e.path[0].querySelector("input").click(); } catch (e) { }
                    },
                    style: "background-color: #313338;"
                },
                    new DOMParser().parseFromString(`<svg class="editPencilIcon-22tRaH" aria-hidden="true" role="img" width="14" height="14" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z" fill="currentColor"></path></svg>`, 'text/html').body.children[0],
                    createElement("input", {
                        type: "color",
                        value: "#313338",
                        id: "colorwayCreatorColorpicker_primary",
                        oninput: (e) => {
                            e.path[0].parentElement.style = "background-color: " + e.path[0].value + ";";
                            let splitRGB = (color) => {
                                if (color.indexOf('rgba') === -1)
                                    color += ',1';
                                return color.match(/[\.\d]+/g).map(function (a) {
                                    return +a
                                });
                            }
                            function hexToRgb(hex) {
                                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                                let r = parseInt(result[1], 16)
                                let g = parseInt(result[2], 16)
                                let b = parseInt(result[3], 16)
                                return [r, g, b]
                            }
                            let splitRGBValues = splitRGB(e.path[0].parentElement.style.backgroundColor);
                            let RgbToHex = rgbToHex(splitRGBValues[0], splitRGBValues[1], splitRGBValues[2]);
                            primaryLighter = shadeColor(RgbToHex, 20);
                            let splitRGBValuesLighter = hexToRgb(primaryLighter);
                            backgroundPrimary = e.path[0].value;
                            document.querySelector(".colorwayPreview-chat").style = "background: var(--primary-gradient,var(--primary)); --primary: " + backgroundPrimary + ";";
                            document.querySelector(".colorwayPreview-chatbox").style = "background: var(--lighter-gradient,var(--lighter)); --lighter: " + primaryLighter + ";";
                            document.querySelectorAll(".colorwayPreview-guildsIcon").forEach(el => {
                                el.style = "background-color: " + backgroundPrimary + "; --background-hover: " + accent + ";";
                            })
                            let RGBLuminanceCalc = Math.round(((parseInt(splitRGBValues[0]) * 299) +
                                (parseInt(splitRGBValues[1]) * 587) +
                                (parseInt(splitRGBValues[2]) * 114)) / 1000);
                            let RGBLuminanceCalcLighter = Math.round(((parseInt(splitRGBValuesLighter[0]) * 299) +
                                (parseInt(splitRGBValuesLighter[1]) * 587) +
                                (parseInt(splitRGBValuesLighter[2]) * 114)) / 1000);
                            primaryTextColor = (RGBLuminanceCalc > 125) ? 'black' : 'white';
                            primaryLighterTextColor = (RGBLuminanceCalcLighter > 125) ? 'black' : 'white';
                            e.path[0].parentElement.querySelector("span").style = "color: " + primaryTextColor + ";";
                            e.path[0].parentElement.querySelector("svg").style = "color: " + primaryTextColor + ";";
                            stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
                        },
                        onchange: (e) => {
                            e.path[0].parentElement.style = "background-color: " + e.path[0].value + ";";
                            let splitRGB = (color) => {
                                if (color.indexOf('rgba') === -1)
                                    color += ',1';
                                return color.match(/[\.\d]+/g).map(function (a) {
                                    return +a
                                });
                            }
                            function hexToRgb(hex) {
                                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                                let r = parseInt(result[1], 16)
                                let g = parseInt(result[2], 16)
                                let b = parseInt(result[3], 16)
                                return [r, g, b]
                            }
                            let splitRGBValues = splitRGB(e.path[0].parentElement.style.backgroundColor);
                            let RgbToHex = rgbToHex(splitRGBValues[0], splitRGBValues[1], splitRGBValues[2]);
                            primaryLighter = shadeColor(RgbToHex, 20);
                            let splitRGBValuesLighter = hexToRgb(primaryLighter);
                            backgroundPrimary = e.path[0].value;
                            document.querySelector(".colorwayPreview-chat").style = "background: var(--primary-gradient,var(--primary)); --primary: " + backgroundPrimary + ";";
                            document.querySelector(".colorwayPreview-chatbox").style = "background: var(--lighter-gradient,var(--lighter)); --lighter: " + primaryLighter + ";";
                            document.querySelectorAll(".colorwayPreview-guildsIcon").forEach(el => {
                                el.style = "background-color: " + backgroundPrimary + "; --background-hover: " + accent + ";";
                            })
                            let RGBLuminanceCalc = Math.round(((parseInt(splitRGBValues[0]) * 299) +
                                (parseInt(splitRGBValues[1]) * 587) +
                                (parseInt(splitRGBValues[2]) * 114)) / 1000);
                            let RGBLuminanceCalcLighter = Math.round(((parseInt(splitRGBValuesLighter[0]) * 299) +
                                (parseInt(splitRGBValuesLighter[1]) * 587) +
                                (parseInt(splitRGBValuesLighter[2]) * 114)) / 1000);
                            primaryTextColor = (RGBLuminanceCalc > 125) ? 'black' : 'hsl(210 9.1% 87.1%)';
                            primaryLighterTextColor = (RGBLuminanceCalcLighter > 125) ? 'black' : 'hsl(210 9.1% 87.1%)';
                            e.path[0].parentElement.querySelector("span").style = "color: " + primaryTextColor + ";";
                            e.path[0].parentElement.querySelector("svg").style = "color: " + primaryTextColor + ";";
                            stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
                        }
                    }),
                    createElement("span", {}, "Primary")
                ),
                createElement("div", {
                    className: Swatch,
                    onclick: (e) => {
                        try { e.path[0].querySelector("input").click(); } catch (e) { }
                    },
                    style: "background-color: #2b2d31;"
                },
                    new DOMParser().parseFromString(`<svg class="editPencilIcon-22tRaH" aria-hidden="true" role="img" width="14" height="14" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z" fill="currentColor"></path></svg>`, 'text/html').body.children[0],
                    createElement("input", {
                        type: "color",
                        value: "#2b2d31",
                        id: "colorwayCreatorColorpicker_secondary",
                        oninput: (e) => {
                            e.path[0].parentElement.style = "background-color: " + e.path[0].value + ";";
                            let splitRGB = (color) => {
                                if (color.indexOf('rgba') === -1)
                                    color += ',1';
                                return color.match(/[\.\d]+/g).map(function (a) {
                                    return +a
                                });
                            }
                            let splitRGBValues = splitRGB(e.path[0].parentElement.style.backgroundColor);
                            let RgbToHex = rgbToHex(splitRGBValues[0], splitRGBValues[1], splitRGBValues[2]);
                            let RgbToHsl = RGBToHSL(splitRGBValues[0], splitRGBValues[1], splitRGBValues[2]);
                            secondaryAlt = shadeColor(RgbToHex, secondaryToSecondaryAltContrast);
                            backgroundSecondary = e.path[0].value;
                            document.querySelector(".colorwayPreview-channels").style = "background: var(--secondary-gradient,var(--secondary)); --secondary: " + backgroundSecondary + ";";
                            document.querySelector(".colorwayPreview-userArea").style = "background: var(--secondaryalt-gradient,var(--secondaryalt)); --secondaryalt: " + secondaryAlt + ";";
                            let RGBLuminanceCalc = Math.round(((parseInt(splitRGBValues[0]) * 299) +
                                (parseInt(splitRGBValues[1]) * 587) +
                                (parseInt(splitRGBValues[2]) * 114)) / 1000);
                            secondaryTextColor = (RGBLuminanceCalc > 125) ? 'black' : 'white';
                            if (RgbToHsl[0] == 0) {
                                secondaryMuted = 'gray'
                            } else {
                                if (secondaryTextColor == 'white') {
                                    secondaryMuted = "hsl(" + RgbToHsl[0] + ", 100%, 90%)";
                                } else if (secondaryTextColor == 'black') {
                                    secondaryMuted = "hsl(" + RgbToHsl[0] + ", 100%, 20%)";
                                }
                            }
                            e.path[0].parentElement.querySelector("span").style = "color: " + secondaryTextColor + ";";
                            e.path[0].parentElement.querySelector("svg").style = "color: " + secondaryTextColor + ";";
                            stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
                        },
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
                            let RgbToHex = rgbToHex(splitRGBValues[0], splitRGBValues[1], splitRGBValues[2]);
                            let RgbToHsl = RGBToHSL(splitRGBValues[0], splitRGBValues[1], splitRGBValues[2]);
                            secondaryAlt = shadeColor(RgbToHex, secondaryToSecondaryAltContrast);
                            backgroundSecondary = e.path[0].value;
                            document.querySelector(".colorwayPreview-channels").style = "background: var(--secondary-gradient,var(--secondary)); --secondary: " + backgroundSecondary + ";";
                            document.querySelector(".colorwayPreview-userArea").style = "background: var(--secondaryalt-gradient,var(--secondaryalt)); --secondaryalt: " + secondaryAlt + ";";
                            let RGBLuminanceCalc = Math.round(((parseInt(splitRGBValues[0]) * 299) +
                                (parseInt(splitRGBValues[1]) * 587) +
                                (parseInt(splitRGBValues[2]) * 114)) / 1000);
                            secondaryTextColor = (RGBLuminanceCalc > 125) ? 'black' : 'white';
                            if (RgbToHsl[0] == 0) {
                                secondaryMuted = 'gray'
                            } else {
                                if (secondaryTextColor == 'white') {
                                    secondaryMuted = "hsl(" + RgbToHsl[0] + ", 100%, 90%)";
                                } else if (secondaryTextColor == 'black') {
                                    secondaryMuted = "hsl(" + RgbToHsl[0] + ", 100%, 20%)";
                                }
                            }
                            e.path[0].parentElement.querySelector("span").style = "color: " + secondaryTextColor + ";";
                            e.path[0].parentElement.querySelector("svg").style = "color: " + secondaryTextColor + ";";
                            stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
                        }
                    }),
                    createElement("span", {}, "Secondary")
                ),
                createElement("div", {
                    className: Swatch,
                    onclick: (e) => {
                        try { e.path[0].querySelector("input").click(); } catch (e) { }
                    },
                    style: "background-color: #1e1f22;"
                },
                    new DOMParser().parseFromString(`<svg class="editPencilIcon-22tRaH" aria-hidden="true" role="img" width="14" height="14" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z" fill="currentColor"></path></svg>`, 'text/html').body.children[0],
                    createElement("input", {
                        type: "color",
                        value: "#1e1f22",
                        id: "colorwayCreatorColorpicker_tertiary",
                        oninput: (e) => {
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
                            backgroundTertiary = e.path[0].value;
                            let backgroundFloatingBefore = shadeColor(e.path[0].value, -30);
                            backgroundFloating = HexToHSL(backgroundFloatingBefore);
                            document.querySelector(".colorwayPreview-background").style = "background: var(--tertiary-gradient,var(--tertiary)); --tertiary: " + backgroundTertiary + ";";
                            e.path[0].parentElement.querySelector("span").style = "color: " + tertiaryTextColor + ";";
                            e.path[0].parentElement.querySelector("svg").style = "color: " + tertiaryTextColor + ";";
                            stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
                        },
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
                            backgroundTertiary = e.path[0].value;
                            let backgroundFloatingBefore = shadeColor(e.path[0].value, -30);
                            backgroundFloating = HexToHSL(backgroundFloatingBefore);
                            document.querySelector(".colorwayPreview-background").style = "background: var(--tertiary-gradient,var(--tertiary)); --tertiary: " + backgroundTertiary + ";";
                            e.path[0].parentElement.querySelector("span").style = "color: " + tertiaryTextColor + ";";
                            e.path[0].parentElement.querySelector("svg").style = "color: " + tertiaryTextColor + ";";
                            stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
                        }
                    }),
                    createElement("span", {}, "Tertiary")
                ),
                createElement("div", {
                    className: Swatch,
                    onclick: (e) => {
                        try { e.path[0].querySelector("input").click(); } catch (e) { }
                    },
                    style: "background-color: hsl(235 85.6% 64.7%);"
                },
                    new DOMParser().parseFromString(`<svg class="editPencilIcon-22tRaH" aria-hidden="true" role="img" width="14" height="14" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z" fill="currentColor"></path></svg>`, 'text/html').body.children[0],
                    createElement("input", {
                        type: "color",
                        value: "#5865f2",
                        id: "colorwayCreatorColorpicker_accent",
                        oninput: (e) => {
                            e.path[0].parentElement.style = "background-color: " + e.path[0].value + ";";
                            let splitRGB = (color) => {
                                if (color.indexOf('rgba') === -1)
                                    color += ',1';
                                return color.match(/[\.\d]+/g).map(function (a) {
                                    return +a
                                });
                            }
                            accent = e.path[0].value;
                            document.querySelectorAll(".colorwayPreview-guildsIcon").forEach(el => {
                                el.style = "background-color: " + backgroundPrimary + "; --background-hover: " + accent + ";";
                            })
                            let splitRGBValues = splitRGB(e.path[0].parentElement.style.backgroundColor);
                            let RGBLuminanceCalc = Math.round(((parseInt(splitRGBValues[0]) * 299) +
                                (parseInt(splitRGBValues[1]) * 587) +
                                (parseInt(splitRGBValues[2]) * 114)) / 1000);
                            accentTextColor = (RGBLuminanceCalc > 125) ? 'black' : 'white';
                            e.path[0].parentElement.querySelector("span").style = "color: " + accentTextColor + ";";
                            e.path[0].parentElement.querySelector("svg").style = "color: " + accentTextColor + ";";
                            stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
                        },
                        onchange: (e) => {
                            e.path[0].parentElement.style = "background-color: " + e.path[0].value + ";";
                            let splitRGB = (color) => {
                                if (color.indexOf('rgba') === -1)
                                    color += ',1';
                                return color.match(/[\.\d]+/g).map(function (a) {
                                    return +a
                                });
                            }
                            accent = e.path[0].value;
                            document.querySelectorAll(".colorwayPreview-guildsIcon").forEach(el => {
                                el.style = "background-color: " + backgroundPrimary + "; --background-hover: " + accent + ";";
                            })
                            let splitRGBValues = splitRGB(e.path[0].parentElement.style.backgroundColor);
                            let RGBLuminanceCalc = Math.round(((parseInt(splitRGBValues[0]) * 299) +
                                (parseInt(splitRGBValues[1]) * 587) +
                                (parseInt(splitRGBValues[2]) * 114)) / 1000);
                            accentTextColor = (RGBLuminanceCalc > 125) ? 'black' : 'white';
                            e.path[0].parentElement.querySelector("span").style = "color: " + accentTextColor + ";";
                            e.path[0].parentElement.querySelector("svg").style = "color: " + accentTextColor + ";";
                            stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
                        }
                    }),
                    createElement("span", {}, "Accent")
                )
            )
        )

        stageOne.append(modalHeader("Name:"), textInput("Give your Colorway a name", "discordColorwayCreator_name"), modalHeader("Colors:"), creationPanel, themePresets, createElement("div", {
            class: "settingRow"
        },
            modalHeader("Gradient:"), createElement("div", {
                class: "choiceContainer"
            },
                createElement("div", {
                    class: "choice",
                    onclick: (e) => {
                        if (!e.path[0].classList.contains("active")) {
                            e.path[0].parentElement.querySelector(".active").classList.remove("active");
                            e.path[0].classList.add("active");
                            useGradient = true;
                        }
                    }
                }, "On"),
                createElement("div", {
                    class: "choice active",
                    onclick: (e) => {
                        if (!e.path[0].classList.contains("active")) {
                            e.path[0].parentElement.querySelector(".active").classList.remove("active");
                            e.path[0].classList.add("active");
                            useGradient = false;
                        }
                    }
                }, "Off"))),
            createElement("div", {
                class: "colorwayCreatorPreviewPanel collapsed"
            }, modalHeader(createElement("div",{
                onclick: (e) => {
                    e.srcElement.parentElement.parentElement.classList.toggle("collapsed");
                }
            },"Preview",new DOMParser().parseFromString(`<svg style="margin-left: auto;" class="expand-3Nh1P5 transition-30IQBn directionDown-2w0MZz" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="img"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10" aria-hidden="true"></path></svg>`, 'text/html').body.children[0])),
                createElement("div", {
                    class: "colorwayPreview-background",
                    style: "background: " + backgroundTertiary + ";"
                },
                    createElement("div", {
                        class: "colorwayPreview-chat",
                        style: "background: " + backgroundPrimary + ";"
                    },
                        createElement("div", {
                            class: "colorwayPreview-channels",
                            style: "background: " + backgroundSecondary + ";"
                        },
                            createElement("div", {
                                class: "colorwayPreview-userArea",
                                style: "background: " + secondaryAlt + ";"
                            })
                        ),
                        createElement("div", {
                            class: "colorwayPreview-chatbox",
                            style: "background: var(--lighter-gradient,--lighter); --lighter: " + primaryLighter + ";"
                        })
                    ),
                    createElement("div", {
                        class: "colorwayPreview-guildsWrapper"
                    },
                        createElement("div", {
                            class: "colorwayPreview-guildsIcon colorwayPreview-homeIcon",
                            style: "background-color: " + backgroundPrimary + "; --background-hover: #5865f2;"
                        },
                            createElement("div", {
                                class: "colorways-discordIcon"
                            })
                        ),
                        createElement("div", {
                            class: "colorwayPreview-guildsSeparator"
                        }),
                        createElement("div", {
                            class: "colorwayPreview-guildsIcon",
                            style: "background-color: " + backgroundPrimary + "; --background-hover: #5865f2;"
                        })
                    )
                )),
            createElement("div", { class: "colorwayModalFooter footer-IubaaS" },
                modalBtnGray("Cancel", {
                    onclick: (e) => {
                        try {
                            e.path[6].lastChild.querySelector('button[type="button"]').click();
                        } catch (e) {

                        }
                    }
                }),
                modalBtnGray("Enter Colorway ID", {
                    onclick: (e) => {
                        BdApi.showConfirmationModal("Enter Colorway ID:", React.createElement("div", {
                            class: "colorwayInfoModalDetails"
                        }, [
                            React.createElement("input", {
                                type: "text",
                                class: "inputDefault-Ciwd-S input-3O04eu",
                                placeholder: "Enter Colorway ID"
                            }),
                            React.createElement("div", { class: "colorwayModalFooter footer-IubaaS" }, [
                                React.createElement("button", {
                                    class: "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                    onClick: (e) => {
                                        try {
                                            e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                        } catch (e) {

                                        }
                                    }
                                }, "Cancel"),
                                React.createElement("button", {
                                    class: "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                    onClick: (e) => {
                                        if (!e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value) {
                                            e.target.parentElement.parentElement.querySelector(`input[type="text"]`).placeholder = "Invalid Colorway ID";
                                        } else {
                                            if (e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value.length < 63) {
                                                let colorwayValueArray = e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value.split(/(\w\w)/g).filter(p => !!p).map(c => String.fromCharCode(parseInt(c, 16))).join("").split(",");
                                                try {
                                                    e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                                } catch (e) {

                                                }
                                                let changeColors = new UIEvent("change", {
                                                    "view": window,
                                                    "bubbles": true,
                                                    "cancelable": true
                                                });
                                                try {
                                                    document.getElementById("colorwayCreatorColorpicker_primary").value = colorwayValueArray[1];
                                                    document.getElementById("colorwayCreatorColorpicker_secondary").value = colorwayValueArray[2];
                                                    document.getElementById("colorwayCreatorColorpicker_tertiary").value = colorwayValueArray[3];
                                                    document.getElementById("colorwayCreatorColorpicker_accent").value = colorwayValueArray[0];

                                                    document.getElementById("colorwayCreatorColorpicker_primary").dispatchEvent(changeColors);
                                                    document.getElementById("colorwayCreatorColorpicker_secondary").dispatchEvent(changeColors);
                                                    document.getElementById("colorwayCreatorColorpicker_tertiary").dispatchEvent(changeColors);
                                                    document.getElementById("colorwayCreatorColorpicker_accent").dispatchEvent(changeColors);
                                                } catch (e) {

                                                }
                                            } else {
                                                e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value = '';
                                                e.target.parentElement.parentElement.querySelector(`input[type="text"]`).placeholder = "Invalid Colorway ID";
                                            }
                                        }
                                    }
                                }, "Finish")
                            ])
                        ]));
                    }
                }),
                modalBtnGray("Copy Current Colors", {
                    onclick: (e) => {
                        let checkColorType = (color) => {
                            if (color.includes("#")) {
                                return "hex";
                            }
                            if (color.includes("hsl")) {
                                return "hsl";
                            }
                            if (color.includes("rgb")) {
                                return "rgb";
                            }
                        }
                        let HSLToHex = (h, s, l) => {
                            s /= 100;
                            l /= 100;

                            let c = (1 - Math.abs(2 * l - 1)) * s,
                                x = c * (1 - Math.abs((h / 60) % 2 - 1)),
                                m = l - c / 2,
                                r = 0,
                                g = 0,
                                b = 0;

                            if (0 <= h && h < 60) {
                                r = c; g = x; b = 0;
                            } else if (60 <= h && h < 120) {
                                r = x; g = c; b = 0;
                            } else if (120 <= h && h < 180) {
                                r = 0; g = c; b = x;
                            } else if (180 <= h && h < 240) {
                                r = 0; g = x; b = c;
                            } else if (240 <= h && h < 300) {
                                r = x; g = 0; b = c;
                            } else if (300 <= h && h < 360) {
                                r = c; g = 0; b = x;
                            }
                            // Having obtained RGB, convert channels to hex
                            r = Math.round((r + m) * 255).toString(16);
                            g = Math.round((g + m) * 255).toString(16);
                            b = Math.round((b + m) * 255).toString(16);

                            // Prepend 0s, if necessary
                            if (r.length == 1)
                                r = "0" + r;
                            if (g.length == 1)
                                g = "0" + g;
                            if (b.length == 1)
                                b = "0" + b;

                            return "#" + r + g + b;
                        }
                        let changeColors = new UIEvent("change", {
                            "view": window,
                            "bubbles": true,
                            "cancelable": true
                        });
                        try {
                            if (checkColorType(getComputedStyle(document.body).getPropertyValue('--background-primary')) == "hex") {
                                if (getComputedStyle(document.body).getPropertyValue('--background-primary').includes(" ")) {
                                    document.getElementById("colorwayCreatorColorpicker_primary").value = getComputedStyle(document.body).getPropertyValue('--background-primary').replace(" ", "").replace(" ", "").replace(" ", "");
                                } else {
                                    document.getElementById("colorwayCreatorColorpicker_primary").value = getComputedStyle(document.body).getPropertyValue('--background-primary');
                                }
                            } else if (checkColorType(getComputedStyle(document.body).getPropertyValue('--background-primary')) == "rgb") {
                                document.getElementById("colorwayCreatorColorpicker_primary").value = rgbToHex(getComputedStyle(document.body).getPropertyValue('--background-primary'));
                            } else if (checkColorType(getComputedStyle(document.body).getPropertyValue('--background-primary')) == "hsl") {
                                if (getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[1].includes("calc")) {
                                    document.getElementById("colorwayCreatorColorpicker_primary").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[0].split("(")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[2].split("%")[0].split("*")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[3].split("%")[0])));
                                } else if (getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[2].includes("calc")) {
                                    document.getElementById("colorwayCreatorColorpicker_primary").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[3].split("%")[0].split("*")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[4].split("%")[0])));
                                } else {
                                    document.getElementById("colorwayCreatorColorpicker_primary").value = HSLToHex(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[1], getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[2].split("%")[0], getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[3].split("/")[0].split("%")[0]);
                                }
                            }

                            if (checkColorType(getComputedStyle(document.body).getPropertyValue('--background-secondary')) == "hex") {
                                if (getComputedStyle(document.body).getPropertyValue('--background-secondary').includes(" ")) {
                                    document.getElementById("colorwayCreatorColorpicker_secondary").value = getComputedStyle(document.body).getPropertyValue('--background-secondary').replace(" ", "").replace(" ", "").replace(" ", "");
                                } else {
                                    document.getElementById("colorwayCreatorColorpicker_secondary").value = getComputedStyle(document.body).getPropertyValue('--background-secondary');
                                }
                            } else if (checkColorType(getComputedStyle(document.body).getPropertyValue('--background-secondary')) == "rgb") {
                                document.getElementById("colorwayCreatorColorpicker_secondary").value = rgbToHex(getComputedStyle(document.body).getPropertyValue('--background-secondary'));
                            } else if (checkColorType(getComputedStyle(document.body).getPropertyValue('--background-secondary')) == "hsl") {
                                if (getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[1].includes("calc")) {
                                    document.getElementById("colorwayCreatorColorpicker_secondary").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[0].split("(")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[2].split("%")[0].split("*")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[3].split("%")[0])));
                                } else if (getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[2].includes("calc")) {
                                    document.getElementById("colorwayCreatorColorpicker_secondary").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[3].split("%")[0].split("*")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[4].split("%")[0])));
                                } else {
                                    document.getElementById("colorwayCreatorColorpicker_secondary").value = HSLToHex(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[1], getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[2].split("%")[0], getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[3].split("/")[0].split("%")[0]);
                                }
                            }

                            if (checkColorType(getComputedStyle(document.body).getPropertyValue('--background-tertiary')) == "hex") {
                                if (getComputedStyle(document.body).getPropertyValue('--background-tertiary').includes(" ")) {
                                    document.getElementById("colorwayCreatorColorpicker_tertiary").value = getComputedStyle(document.body).getPropertyValue('--background-tertiary').replace(" ", "").replace(" ", "").replace(" ", "");
                                } else {
                                    document.getElementById("colorwayCreatorColorpicker_tertiary").value = getComputedStyle(document.body).getPropertyValue('--background-tertiary');
                                }
                            } else if (checkColorType(getComputedStyle(document.body).getPropertyValue('--background-tertiary')) == "rgb") {
                                document.getElementById("colorwayCreatorColorpicker_tertiary").value = rgbToHex(getComputedStyle(document.body).getPropertyValue('--background-tertiary'));
                            } else if (checkColorType(getComputedStyle(document.body).getPropertyValue('--background-tertiary')) == "hsl") {
                                if (getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[1].includes("calc")) {
                                    document.getElementById("colorwayCreatorColorpicker_tertiary").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[0].split("(")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[2].split("%")[0].split("*")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[3].split("%")[0])));
                                } else if (getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[2].includes("calc")) {
                                    document.getElementById("colorwayCreatorColorpicker_tertiary").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[3].split("%")[0].split("*")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[4].split("%")[0])));
                                } else {
                                    document.getElementById("colorwayCreatorColorpicker_tertiary").value = HSLToHex(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[1], getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[2].split("%")[0], getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[3].split("/")[0].split("%")[0]);
                                }
                            }

                            if (checkColorType(getComputedStyle(document.body).getPropertyValue('--brand-experiment')) == "hex") {
                                if (getComputedStyle(document.body).getPropertyValue('--brand-experiment').includes(" ")) {
                                    document.getElementById("colorwayCreatorColorpicker_accent").value = getComputedStyle(document.body).getPropertyValue('--brand-experiment').replace(" ", "").replace(" ", "").replace(" ", "");
                                } else {
                                    document.getElementById("colorwayCreatorColorpicker_accent").value = getComputedStyle(document.body).getPropertyValue('--brand-experiment');
                                }
                            } else if (checkColorType(getComputedStyle(document.body).getPropertyValue('--brand-experiment')) == "rgb") {
                                document.getElementById("colorwayCreatorColorpicker_accent").value = rgbToHex(getComputedStyle(document.body).getPropertyValue('--brand-experiment'));
                            } else if (checkColorType(getComputedStyle(document.body).getPropertyValue('--brand-experiment')) == "hsl") {
                                if (getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[1].includes("calc")) {
                                    document.getElementById("colorwayCreatorColorpicker_accent").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[0].split("(")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[2].split("%")[0].split("*")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[3].split("%")[0])));
                                } else if (getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[2].includes("calc")) {
                                    document.getElementById("colorwayCreatorColorpicker_accent").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[3].split("%")[0].split("*")[1]), parseFloat(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[4].split("%")[0])));
                                } else {
                                    document.getElementById("colorwayCreatorColorpicker_accent").value = HSLToHex(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[1], getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[2].split("%")[0], getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[3].split("/")[0].split("%")[0]);
                                }
                            }

                            document.getElementById("colorwayCreatorColorpicker_primary").dispatchEvent(changeColors);
                            document.getElementById("colorwayCreatorColorpicker_secondary").dispatchEvent(changeColors);
                            document.getElementById("colorwayCreatorColorpicker_tertiary").dispatchEvent(changeColors);
                            document.getElementById("colorwayCreatorColorpicker_accent").dispatchEvent(changeColors);
                        } catch (e) {

                        }
                    }
                }),
                modalBtn("Finish", {
                    onclick: (e) => {
                        console.log("hi")
                        let gradientCSS = ``;
                        if (!document.getElementById("discordColorwayCreator_name").value) {
                            document.getElementById("discordColorwayCreator_name").value = "defaultColorwayName";
                        }
                        if (useGradient == true) {
                            gradientCSS = `
:root {
    --bg-overlay-color: 0 0 0;
    --bg-overlay-color-inverse: 255 255 255;
    --bg-overlay-opacity-1: 0.2;
    --bg-overlay-opacity-2: 0;
    --bg-overlay-opacity-3: 0.3;
    --bg-overlay-opacity-4: 0.5;
    --bg-overlay-opacity-5: 0.4;
    --bg-overlay-opacity-6: 0.1;
    --bg-overlay-opacity-hover: 0.5;
    --bg-overlay-opacity-hover-inverse: 0.08;
    --bg-overlay-opacity-active: 0.45;
    --bg-overlay-opacity-active-inverse: 0.1;
    --bg-overlay-opacity-selected: 0.4;
    --bg-overlay-opacity-selected-inverse: 0.15;
    --bg-overlay-opacity-chat: 0;
    --bg-overlay-opacity-home: 0.85;
    --bg-overlay-opacity-home-card: 0.8;
    --bg-overlay-opacity-app-frame: var(--bg-overlay-opacity-4);
    --bg-overlay-1: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-1)), rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-1))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --bg-overlay-2: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-2)), rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-2))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --bg-overlay-3: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-3)), rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-3))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --bg-overlay-4: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-4)), rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-4))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --bg-overlay-5: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-5)), rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-5))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --bg-overlay-6: linear-gradient(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-6)), rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-6))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --bg-overlay-hover: linear-gradient(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-hover-inverse)), rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-hover-inverse))) fixed 0 0/cover, linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-hover)), rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-hover))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --bg-overlay-active: linear-gradient(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-active-inverse)), rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-active-inverse))) fixed 0 0/cover, linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-active)), rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-active))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --bg-overlay-selected: linear-gradient(rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-selected-inverse)), rgb(var(--bg-overlay-color-inverse)/var(--bg-overlay-opacity-selected-inverse))) fixed 0 0/cover, linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-selected)), rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-selected))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --bg-overlay-chat: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-chat)), rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-chat))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --bg-overlay-home: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-home)), rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-home))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --bg-overlay-home-card: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-home-card)), rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-home-card))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --bg-overlay-app-frame: linear-gradient(rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-app-frame)), rgb(var(--bg-overlay-color)/var(--bg-overlay-opacity-app-frame))) fixed 0 0/cover, var(--custom-theme-background) fixed 0 0/cover;
    --custom-theme-background: linear-gradient(-45deg, var(--primary-400) 0%, var(--primary-630) 20%, var(--primary-800) 80%, var(--primary-800) 100%);
}

.guilds-2JjMmN {
    background: var(--bg-overlay-app-frame, --background-tertiary);
}

.sidebarRegionScroller-FXiQOh {
    background: var(--bg-overlay-1, --background-secondary);
}

.contentRegionScroller-2_GT_N {
    background: var(--bg-overlay-chat, --background-primary);
}`
                        }
                        let customColorwayCSS = `/*Automatically Generated - Colorway Creator V${config.info.creatorVersion}*/
:root {
    --brand-100-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6 * 13)}%;
    --brand-130-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6 * 12)}%;
    --brand-160-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6 * 11)}%;
    --brand-200-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6 * 10)}%;
    --brand-230-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6 * 9)}%;
    --brand-260-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6 * 8)}%;
    --brand-300-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6 * 7)}%;
    --brand-330-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6 * 6)}%;
    --brand-345-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6 * 5)}%;
    --brand-360-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6 * 4)}%;
    --brand-400-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6 * 3)}%;
    --brand-430-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6 * 2)}%;
    --brand-460-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + 3.6}%;
    --brand-500-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2]}%;
    --brand-530-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - 3.6}%;
    --brand-560-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6 * 2)}%;
    --brand-600-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6 * 3)}%;
    --brand-630-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6 * 4)}%;
    --brand-660-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6 * 5)}%;
    --brand-700-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6 * 6)}%;
    --brand-730-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6 * 7)}%;
    --brand-760-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6 * 8)}%;
    --brand-800-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6 * 9)}%;
    --brand-830-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6 * 10)}%;
    --brand-860-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6 * 11)}%;
    --brand-900-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6 * 12)}%;
    --primary-460: gray;
    --mention-foreground: ${accentTextColor} !important;
    --primary-800-hsl: ${backgroundFloating[0]} ${backgroundFloating[1]}% ${backgroundFloating[2]}%;
    --primary-730-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_tertiary").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_tertiary").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_tertiary").value)[2]}%;
    --primary-700-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_tertiary").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_tertiary").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_tertiary").value)[2]}%;
    --primary-660-hsl: ${HexToHSL(secondaryAlt)[0]} ${HexToHSL(secondaryAlt)[1]}% ${HexToHSL(secondaryAlt)[2]}%;
    --primary-645-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_primary").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_primary").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_primary").value)[2] - 5}%;
    --primary-630-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_secondary").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_secondary").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_secondary").value)[2]}%;
    --primary-600-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_primary").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_primary").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_primary").value)[2]}%;
    --primary-560-hsl: ${HexToHSL(primaryLighter)[0]} ${HexToHSL(primaryLighter)[1]}% ${HexToHSL(primaryLighter)[2]}%;
    --primary-530-hsl: ${HexToHSL(primaryLighter)[0]} ${HexToHSL(primaryLighter)[1]}% ${HexToHSL(primaryLighter)[2]}%;
    --primary-500-hsl: ${HexToHSL(primaryLighter)[0]} ${HexToHSL(primaryLighter)[1]}% ${HexToHSL(primaryLighter)[2]}%;
    --primary-430-hsl: ${HexToHSL(primaryLighter)[0]} ${HexToHSL(primaryLighter)[1]}% ${HexToHSL(primaryLighter)[2] - 7.2}%;
    --primary-400-hsl: ${HexToHSL(primaryLighter)[0]} ${HexToHSL(primaryLighter)[1]}% ${HexToHSL(primaryLighter)[2] - 10.8}%;
}

/*Primary*/
.theme-dark .container-2cd8Mz *,
.theme-dark .body-16rSsp *,
.theme-dark .toolbar-3_r2xA *,
.theme-dark .container-89zvna *,
.theme-dark .messageContent-2t3eCI,
.theme-dark .attachButtonPlus-3IYelE,
.theme-dark .username-h_Y3Us:not([style]),
.theme-dark .children-3xh0VB *,
.theme-dark .buttonContainer-1502pf *,
.theme-dark .listItem-3SmSlK * {
    --white-500: ${primaryTextColor} !important;
    --text-normal: ${primaryTextColor} !important;
    --header-primary: ${primaryTextColor} !important;
}

.theme-dark .contentRegionScroller-2_GT_N *:not(.mtk1,.mtk2,.mtk3,.mtk4,.mtk5,.mtk6,.mtk7,.mtk8,.mtk9,.monaco-editor .line-numbers) {
    --white-500: ${primaryTextColor} !important;
}

.theme-dark .container-1um7CU,
.theme-dark .container-2IKOsH,
.theme-dark .header-3xB4vB {
    background: transparent;
}

.theme-dark .header-3xB4vB *,
.theme-dark .title-31SJ6t * {
    --channel-icon: ${primaryTextColor};
}

.theme-dark .callContainer-HtHELf * {
    --white-500: ${tertiaryTextColor} !important;
}

.theme-dark .channelTextArea-1FufC0 * {
    --text-normal: ${primaryLighterTextColor};
}

.theme-dark .placeholder-1rCBhr {
    --channel-text-area-placeholder: ${primaryLighterTextColor};
    opacity: .6;
}

.theme-dark .colorwaySelectorIcon {
    background-color: ${primaryTextColor};
}

.theme-dark .root-1CAIjD > .header-1ffhsl > h1 {
    color: ${primaryTextColor};
}
/*End Primary*/

/*Secondary*/
.theme-dark .wrapper-2RrXDg *,
.theme-dark .sidebar-1tnWFu *:not(.hasBanner-2IrYih *),
.theme-dark .members-3WRCEx *:not([style]),
.theme-dark .sidebarRegionScroller-FXiQOh *,
.theme-dark .header-1XpmZs,
.theme-dark .lookFilled-1H2Jvj.colorPrimary-2-Lusz {
    --white-500: ${secondaryTextColor} !important;
    --channels-default: ${secondaryMuted} !important;
    --channel-icon: ${secondaryMuted} !important;
    --interactive-normal: var(--white-500);
    --interactive-hover: var(--white-500);
    --interactive-active: var(--white-500);
}

.theme-dark .channelRow-4X_3fi {
    background-color: var(--background-secondary);
}

.theme-dark .channelRow-4X_3fi * {
    --channel-icon: ${secondaryTextColor};
}

.theme-dark #app-mount .activity-2EQDZv,
.theme-dark #app-mount .activity-2EQDZv * {
    --channels-default: var(--white-500) !important;
}

.theme-dark .nameTag-sc-gpq {
    --header-primary: ${secondaryTextColor} !important;
    --header-secondary: ${secondaryMuted} !important;
}

.theme-dark .bannerVisible-Vkyg1I .headerContent-2SNbie {
    color: #fff;
}

.theme-dark .embedFull-1HGV2S {
    --text-normal: ${secondaryTextColor};
}
/*End Secondary*/

/*Tertiary*/
.theme-dark .winButton-3UMjdg,
.theme-dark .searchBar-2aylmZ *,
.theme-dark .wordmarkWindows-2dq6rw,
.theme-dark .searchBar-jGtisZ *,
.theme-dark .searchBarComponent-3N7dCG {
    --white-500: ${tertiaryTextColor} !important;
}

.theme-dark [style="background-color: var(--background-secondary);"] {
    color: ${secondaryTextColor};
}

.theme-dark .popout-TdhJ6Z > *,
.theme-dark .colorwayHeaderTitle {
    --interactive-normal: ${tertiaryTextColor} !important;
    --header-secondary: ${tertiaryTextColor} !important;
}

.theme-dark .tooltip-33Jwqe {
    --text-normal: ${tertiaryTextColor} !important;
}
/*End Tertiary*/

/*Accent*/
.selected-2r1Hvo *,
.selected-1Drb7Z *,
#app-mount .lookFilled-1H2Jvj.colorBrand-2M3O3N:not(.buttonColor-3bP3fX),
.colorDefault-2_rLdz.focused-3LIdPu,
.row-1qtctT:hover,
.colorwayInfoIcon,
.colorwayCheckIcon {
    --white-500: ${accentTextColor} !important;
}

.ColorwaySelectorBtn:hover .colorwaySelectorIcon {
    background-color: ${accentTextColor} !important;
}
/*End Accent*/${gradientCSS}`
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
                                isGradient: useGradient,
                                import: customColorwayCSS,
                                author: currentUserProps.username,
                                authorID: currentUserProps.id,
                                creatorVersion: config.info.creatorVersion
                            }];

                        let customColorwayArray = [];
                        function arrayContains(needle, arrhaystack) {
                            return arrhaystack.indexOf(needle);
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
                            "primary-800",
                            "primary-730",
                            "primary-700",
                            "primary-660",
                            "primary-645",
                            "primary-630",
                            "primary-600",
                            "primary-560",
                            "primary-530",
                            "primary-500",
                            "primary-430",
                            "primary-400",
                            "primary-460",
                            "primary-800",
                            "primary-730",
                            "primary-700",
                            "primary-660",
                            "primary-645",
                            "primary-630",
                            "primary-600",
                            "primary-560",
                            "primary-530",
                            "primary-500",
                            "primary-430",
                            "primary-400",
                            "brand-100-hsl",
                            "brand-130-hsl",
                            "brand-160-hsl",
                            "brand-200-hsl",
                            "brand-230-hsl",
                            "brand-260-hsl",
                            "brand-300-hsl",
                            "brand-330-hsl",
                            "brand-345-hsl",
                            "brand-360-hsl",
                            "brand-400-hsl",
                            "brand-430-hsl",
                            "brand-460-hsl",
                            "brand-500-hsl",
                            "brand-530-hsl",
                            "brand-560-hsl",
                            "brand-600-hsl",
                            "brand-630-hsl",
                            "brand-660-hsl",
                            "brand-700-hsl",
                            "brand-730-hsl",
                            "brand-760-hsl",
                            "brand-800-hsl",
                            "brand-830-hsl",
                            "brand-860-hsl",
                            "brand-900-hsl",
                            "primary-800-hsl",
                            "primary-730-hsl",
                            "primary-700-hsl",
                            "primary-660-hsl",
                            "primary-645-hsl",
                            "primary-630-hsl",
                            "primary-600-hsl",
                            "primary-560-hsl",
                            "primary-530-hsl",
                            "primary-500-hsl",
                            "primary-430-hsl",
                            "primary-400-hsl",
                            "primary-460-hsl",
                            "primary-800-hsl",
                            "primary-730-hsl",
                            "primary-700-hsl",
                            "primary-660-hsl",
                            "primary-645-hsl",
                            "primary-630-hsl",
                            "primary-600-hsl",
                            "primary-560-hsl",
                            "primary-530-hsl",
                            "primary-500-hsl",
                            "primary-430-hsl",
                            "primary-400-hsl"
                        ]
                        if (e.srcElement.parentElement.parentElement.querySelector(".colorwayPreset.selected").innerText != "Default") {
                            themePresetsArray.forEach(e => {
                                if (e.name == document.querySelector(".colorwayPreset.selected .presetName").innerText) {
                                    let preseImport = `/*Automatically Generated - Colorway Creator V${config.info.creatorVersion} - Preset: ${e.name}*/\n`;
                                    e.import.split("\n").forEach(ln => {
                                        if (ln.includes("{{")) {
                                            if(ln.split("{{")[1].split("}}")[0].includes(":")) {
                                                if (arrayContains(ln.split("{{")[1].split("}}")[0].split(":")[0], colorVariables) != -1) {
                                                    preseImport += ln.replace("{{" + ln.split("{{")[1].split("}}")[0] + "}}", ln.split("{{")[1].split("}}")[0].split(":")[1] == 2 ? customColorwayCSS.split(ln.split("{{")[1].split("}}")[0].split(":")[0]+": ")[1].split(" ")[ln.split("{{")[1].split("}}")[0].split(":")[1]].split(";")[0]:customColorwayCSS.split(ln.split("{{")[1].split("}}")[0].split(":")[0]+": ")[1].split(" ")[ln.split("{{")[1].split("}}")[0].split(":")[1]]) + "\n";
                                                } else {
                                                    preseImport += ln + "\n";
                                                }
                                            } else if(ln.split("{{")[1].split("}}")[0].includes(":") == false) {
                                                if (arrayContains(ln.split("{{")[1].split("}}")[0], colorVariables) != -1) {
                                                    preseImport += ln.replace("{{" + ln.split("{{")[1].split("}}")[0] + "}}", ln.split("{{")[1].split("}}")[0].includes("-hsl") ? customColorwayCSS.split((ln.split("{{")[1].split("}}")[0].includes("-hsl") ? ln.split("{{")[1].split("}}")[0] : ln.split("{{")[1].split("}}")[0] + "-hsl") + ": ")[1].split(";")[0] : "hsl(" + customColorwayCSS.split((ln.split("{{")[1].split("}}")[0].includes("-hsl") ? ln.split("{{")[1].split("}}")[0] : ln.split("{{")[1].split("}}")[0] + "-hsl") + ": ")[1].split(";")[0] + ")") + "\n";
                                                } else {
                                                    preseImport += ln + "\n";
                                                }
                                            } else {
                                                preseImport += ln + "\n";
                                            }
                                        } else {
                                            preseImport += ln + "\n";
                                        }
                                    })
                                    let presetCustomColorway = [
                                        {
                                            name: document.getElementById("discordColorwayCreator_name").value + ": Made for " + e.name,
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
                                            isGradient: useGradient,
                                            import: preseImport,
                                            author: e.developer,
                                            authorID: e.developerID,
                                            colors: e.colors,
                                            creatorVersion: config.info.creatorVersion
                                        }];
                                    customColorwayArray.push(presetCustomColorway[0]);
                                    if (!BdApi.loadData("DiscordColorways", "custom_colorways") || BdApi.loadData("DiscordColorways", "custom_colorways") == []) {

                                    } else {
                                        BdApi.loadData("DiscordColorways", "custom_colorways").forEach(el => {
                                            if (el.name != document.getElementById("discordColorwayCreator_name").value + ": Made for " + e.name) {
                                                customColorwayArray.push(el);
                                            }
                                        })
                                    }
                                }
                            })
                        } else {
                            customColorwayArray.push(customColorway[0]);
                            if (!BdApi.loadData("DiscordColorways", "custom_colorways") || BdApi.loadData("DiscordColorways", "custom_colorways") == []) {

                            } else {
                                BdApi.loadData("DiscordColorways", "custom_colorways").forEach(el => {
                                    if (el.name != document.getElementById("discordColorwayCreator_name").value) {
                                        customColorwayArray.push(el);
                                    }
                                })
                            }
                        }
                        BdApi.saveData("DiscordColorways", "custom_colorways", customColorwayArray);
                        customColorwayArray = [];
                        try {
                            e.path[6].lastChild.querySelector('button[type="button"]').click();
                        } catch (e) {

                        }
                        const elements = Array.from(document.body.getElementsByClassName("colorwaySelectorModal"));
                        if (elements.length) {
                            for (const el of elements) {
                                document.querySelector(".ColorwaySelectorWrapperContainer").remove();
                                new ColorwaySelector(el).mount();
                            }
                        }
                        const elements2 = Array.from(document.body.getElementsByClassName("basicThemeSelectors-2wNKs6"));
                        if (elements2.length) {
                            for (const el of elements2) {
                                document.querySelector(".ColorwaySelectorWrapperContainer").remove();
                                new ColorwaySelector(el).mount();
                            }
                        }
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

            if (BdApi.loadData("DiscordColorways", "settings").showInGuildBar == true) {
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
module.exports = class DiscordColorways {
    constructor() {
        this._config = config;
    }
    css = `
    .sparkles-32w-Af {
        z-index: 50;
    }
    .choiceContainer {
        display: flex;
        flex-direction: row;
        border-radius: 4px;
        background-color: var(--background-primary);
        box-shadow: 0 0 0 1px var(--background-secondary-alt);
        height: 30px;
        overflow: hidden;
        width: fit-content;
    }
    .choiceContainer > .choice {
        display: flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        padding: 0 24px;
        cursor: pointer;
        transition: .15s;
    }
    .choiceContainer > .choice:hover {
        background-color: var(--background-accent);
    }
    .choiceContainer > .choice:active {
        background-color: var(--background-secondary-alt);
    }
    .choiceContainer > .choice.active {
        background-color: var(--background-secondary);
    }
    .settingRow {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        color: var(--header-primary);
        line-height: 36px;
        align-items: center;
        border-radius: 4px;
        background-color: var(--background-secondary);
        box-sizing: border-box;
        padding: 10px 18px;
    }
    .settingRow > h2 {
        height: fit-content;
    }
    .colorwayPreview-chatbox {
        position: absolute;
        width: 332px;
        bottom: 10px;
        right: 10px;
        height: 32px;
        border-radius: 8px;
    }
    .colorwayAuthorLink {
        padding: 4px 8px;
        border-radius: 4px;
        background-color: var(--background-primary);
        transition: .15s;
        cursor: pointer;
    }
    .colorwayAuthorLink:hover {
        background-color: var(--background-accent);
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
    .colorwaySettingsContainer:has(>.colorwaySelectorModal) {
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow: visible !important;
        padding-right: 0 !important;
        min-width: unset;
        width: fit-content;
    }
    .bd-addon-settings-wrap:has(>.colorwaySettingsContainer),
    .bd-addon-modal-settings:has(.colorwaySettingsContainer),
    .bd-addon-modal:has(.colorwaySettingsContainer) {
        min-width: unset !important;
        width: fit-content;
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
        cursor: pointer;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        position: relative;
        align-items: center;
        justify-content: center;
        transition: .1s;
        box-shadow: inset 0 0 0 1px var(--interactive-normal);
    }
    .discordColorway:hover {
        box-shadow: inset 0 0 0 1px var(--interactive-active);
    }
    .discordColorwayPreviewColorContainer {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        overflow: hidden;
        border-radius: 50%;
        width: 56px;
        height: 56px;
        pointer-events: none;
    }
    .discordColorway.active {
        box-shadow: inset 0 0 0 2px var(--brand-500),inset 0 0 0 4px var(--background-primary);
    }
    .discordColorway.active .discordColorwayPreviewColorContainer {
        width: 52px;
        height: 52px;
    }
    .discordColorwayPreviewColorContainer:not(:has(>.discordColorwayPreviewColor:nth-child(4))) > .discordColorwayPreviewColor:nth-child(3) {
        width: 100%;
    }
    .discordColorwayPreviewColorContainer:not(:has(>.discordColorwayPreviewColor:nth-child(3))) > .discordColorwayPreviewColor {
        height: 100%;
    }
    .discordColorwayPreviewColorContainer:not(:has(>.discordColorwayPreviewColor:nth-child(2))) > .discordColorwayPreviewColor {
        height: 100%;
        width: 100%;
    }
    .colorwayAuthor {
        font-weight: 400;
        font-size: 20px;
        color: var(--header-secondary);
        margin-bottom: 4px;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        justify-content: space-between;
        border-radius: 4px;
        background-color: var(--background-secondary);
        padding: 8px 12px;
    }
    #colorway-refreshcolorway > .colorwayRefreshIcon {
        height: 60px;
        width: 60px;
        background-color: var(--modal-background);
        -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='24' height='24' viewBox='0 0 24 24' fill='var(--white-500)'%3E%3Cg id='Frame_-_24px'%3E%3Crect y='0' fill='none' width='24' height='24'%3E%3C/rect%3E%3C/g%3E%3Cg id='Filled_Icons'%3E%3Cg%3E%3Cpath fill='var(--white-500)' d='M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z'%3E%3C/path%3E%3Cpath fill='var(--white-500)' d='M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        -webkit-mask-size: 24px;
        -webkit-mask-repeat: no-repeat;
        -webkit-mask-position: center;
        pointer-events: none;
    }
    #colorway-createcolorway {
        box-shadow: inset 0 0 0 1px var(--interactive-normal);
    }
    .colorwayImport {
        font-weight: 400;
        font-size: 20px;
        color: var(--header-secondary);
        margin-bottom: 4px;
        border-radius: 4px;
        background-color: var(--background-secondary);
        padding: 8px 12px;
    }
    #colorway-refreshcolorway,
    #colorway-createcolorway,
    #colorway-settings {
        background-color: var(--interactive-normal);
        box-shadow: none;
        transition: .1s;
    }
    #colorway-refreshcolorway:hover,
    #colorway-createcolorway:hover,
    #colorway-settings:hover {
        background-color: var(--interactive-hover);
    }
    #colorway-createcolorway > .colorwayCreateIcon {
        height: 60px;
        width: 60px;
        background-color: var(--modal-background);
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
        z-index: +1;
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
        width: 50%;
        height: 50%;
    }
    .discordColorwayPreviewGradient {
        width: 54px;
        height: 54px;
        margin: 3px;
        border-radius: 50%;
        pointer-events: none;
    }

    .discordColorway.active > .discordColorwayPreviewColor {
        width: 30px;
        height: 30px;
    }
    .ColorwaySelectorWrapper {
        display: flex;
        gap: 16px 24px;
        position: relative;
        width: 100%;
        flex-wrap: wrap;
    }
    .ColorwaySelectorWrapperContainer {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        padding-top: 16px;
    }
    .colorwayHeaderContainer {
        height: 38px;
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
    }
    .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper, .colorwayCreationModal) {
        width: fit-content;
        min-width: 620px;
        max-width: 915px;
        height: fit-content;
        max-height: unset;
        overflow: overlay;
    }
    .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper, .colorwayCreationModal) > .footer-IubaaS {
        display: none;
    }
    .root-1CAIjD:has(.colorwaySettingsWrapper),
    .root-1CAIjD:has(.colorwaySettingsWrapper) > .content-1OG56Q {
        height: fit-content;
        min-height: unset;
    }
    .root-1CAIjD:has(.colorwaySelectorModal) {
        width: fit-content;
    }
    .root-1CAIjD:has(.colorwaySelectorModal) > .footer-IubaaS {
        display: none;
    }
    .colorwaySelectorModal {
        max-width: 564px;
    }
    .colorwayColors {
        width: 100%;
        height: 46px;
        display: flex;
        flex-direction: row;
        margin-bottom: 12px;
        gap: 8px;
    }
    .colorwayColors > div {
        border: none;
        width: 100%;
        cursor: pointer;
        position: relative;
    }
    .colorwayColors > div::before {
        content: "Copy Color";
        background-color: rgb(0,0,0,.4);
        color: #fff;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: .1s ease;
    }
    .colorwayColors > div:hover::before {
        opacity: 1;
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
        border-radius: 4px;
        -webkit-text-size-adjust: none;
        -moz-text-size-adjust: none;
        -ms-text-size-adjust: none;
        text-size-adjust: none;
        color: var(--text-normal);
        background: var(--background-secondary);
        user-select: text;
        max-height: 400px;
        overflow: auto;
        white-space: nowrap;
        font-family: var(--font-code);
        font-size: 14px;
        line-height: 16px;
    }
    .colorwayCodeblock::-webkit-scrollbar,
    .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper, .colorwayCreationModal)::-webkit-scrollbar {
        width: 16px;
        height: 16px;
    }
    .colorwayCodeblock::-webkit-scrollbar-corner,
    .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper, .colorwayCreationModal)::-webkit-scrollbar-corner {
        background-color: transparent;
    }
    .colorwayCodeblock::-webkit-scrollbar-thumb,
    .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper, .colorwayCreationModal)::-webkit-scrollbar-thumb {
        background-color: var(--scrollbar-auto-thumb);
        min-height: 40px;
    }
    .colorwayCodeblock::-webkit-scrollbar-thumb, .colorwayCodeblock::-webkit-scrollbar-track,
    .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper, .colorwayCreationModal)::-webkit-scrollbar-thumb {
        border: 4px solid transparent;
        background-clip: padding-box;
        border-radius: 8px;
    }
    .scroller-kQBbkU::-webkit-scrollbar-track,
    .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper, .colorwayCreationModal)::-webkit-scrollbar-track {
        margin-bottom: 8px;
    }
    .colorwayCodeblock::-webkit-scrollbar-thumb, .colorwayCodeblock::-webkit-scrollbar-track,
    .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper, .colorwayCreationModal)::-webkit-scrollbar-track {
        border: 4px solid transparent;
        background-clip: padding-box;
        border-radius: 8px;
    }
    .colorwayCodeblock::-webkit-scrollbar-track,
    .root-1CAIjD:has(.colorwayInfoModalDetails, .colorwaySettingsWrapper, .colorwayCreationModal)::-webkit-scrollbar-track {
        background-color: var(--scrollbar-auto-track);
    }
    .colorwayCodeblockWrapper {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .colorwaySettingsIcon {
        height: 100%;
        width: 100%;
        background-color: var(--modal-background);
        -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' role='img' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' fill-rule='evenodd' clip-rule='evenodd' d='M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z'%3E%3C/path%3E%3C/svg%3E");
        -webkit-mask-size: 24px;
        -webkit-mask-repeat: no-repeat;
        -webkit-mask-position: center;
        cursor: pointer;
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
        height: fit-content;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        gap: 8px;
        position: relative;
    }
    .colorwayCreator-colorPreviews > div {
        border: none;
        width: 100%;
        position: relative;
        color: #fff;
    }
    .colorwayCreator-colorPreviews input[type="color"] {
        width: 1px;
        height: 1px;
        opacity: 0;
        position: absolute;
        pointer-events: none;
    }
    .colorwayCreator-colorPreviews span {
        color: currentColor;
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
        gap: 8px;
        margin-top: 4px;
        margin-bottom: -20px;
        margin-left: -16px;
        margin-right: -16px;
        padding: 16px;
        border-radius: 0 0 4px 4px;
    }
    .customColorwaySelector {
        display: flex;
    }
    code.inline[data-origin-content] {
        display: flex;
        background-color: transparent;
        width: fit-content;
        float: left;
    }
    .colorwayPresetContainer {
        display: flex;
        flex-direction: column;
        padding: 10px;
        gap: 5px;
        border-radius: 4px;
        background-color: var(--background-secondary);
        box-sizing: border-box;
        color: var(--header-secondary);
    }
    .colorwayPreset * {
        pointer-events: none;
    }
    .collapsed > .colorwayPreset,
    .collapsed > .colorwayPreview-background {
        display: none;
    }
    .colorwayPreset:not(.selected) circle {
        display: none;
    }
    .colorwayPresetContainerItem {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        padding: 5px;
        border-radius: 4px;
        cursor: pointer;
        box-sizing: border-box;
        padding: 8px;
    }
    .colorwayPreset {
        justify-content: start;
        gap: 5px;
    }
    .colorwayPresetContainerHeader {
        justify-content: start;
        gap: 5px;
    }
    .colorwayPresetContainerHeader * {
        pointer-events: none;
    }
    .colorwayPresetContainer:not(.collapsed) svg,
    .colorwayCreatorPreviewPanel:not(.collapsed) svg {
        transform: rotate3d(0,0,-1,180deg);
    }
    .colorwayPresetContainerItem:hover,
    .colorwayCreatorPreviewPanel > h2 > div:hover {
        background-color: var(--background-modifier-hover);
    }
    div:has(>.colorwayCreationModal,>.colorwayInfoModalDetails,>.colorwaySelectorModal) {
        overflow: visible !important;
        padding-right: 16px !important;
        width: 100%;
        max-width: 620px;
    }
    .colorwayCreatorPreviewPanel > h2 > div * {
        pointer-events: none;
    }
    div:has(>.colorwayInfoModalDetails .colorwayImport) {
        max-width: 750px;
    }
    .root-1CAIjD:has(.colorwaySelectorModal) {
        max-width: unset;
    }
    .colorwaySelectorModal .colorwayModalFooter {
        margin-left: -16px;
        margin-right: -16px;
        margin-bottom: -20px;
    }
    .colorwaySelectorModal > .ColorwaySelectorWrapperContainer {
        padding-top: 0;
    }
    .basicThemeSelectors-2wNKs6 .colorwayModalFooter {
        margin: 0;
        border-radius: 0;
        background-color: transparent;
        order: -1;
        padding: 0;
        margin-bottom: -46px;
    }
    input[type="text"] + .colorwayModalFooter {
        margin-top: 34px;
    }
    .colorwayCreatorPreviewPanel {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        border-radius: 4px;
        background-color: var(--background-secondary);
        gap: 8px;
    }
    .colorwayCreatorPreviewPanel > h2 {
        align-self: start;
        width: 100%;
    }
    .colorwayCreatorPreviewPanel > h2 > div {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        border-radius: 4px;
        cursor: pointer;
        box-sizing: border-box;
        padding: 8px;
    }
    .colorwaySettingsContainer .colorwayModalFooter {
        margin: 0;
        border-radius: 0;
        background-color: transparent;
        order: -1;
        padding: 0;
        margin-bottom: -46px;
    }
    @keyframes colorwayPill {
        from {
            height: 8px;
            opacity: 0;
            width: 4px;
        }
        to {
            width: 8px;
            height: 20px;
            opacity: 1;
        }
    }
    @keyframes colorwayPillLeave {
        from {
            width: 8px;
            height: 20px;
            opacity: 1;
        }
        to {
            height: 8px;
            opacity: 0;
            width: 4px;
        }
    }
    .colorwaysBtnPill {
        overflow: hidden;
        width: 8px;
        height: 48px;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-pack: start;
        -ms-flex-pack: start;
        justify-content: flex-start;
        contain: layout size;
    }
    .colorwaysBtnPill > span {
        position: absolute;
        display: block;
        width: 8px;
        border-radius: 0 4px 4px 0;
        margin-left: -4px;
        height: 20px;
        opacity: 1;
        animation: colorwayPill .3s;
        transition: .3s;
    }
    .bd-tooltip-content {
        max-width: 196px;
        font-size: 16px;
        line-height: 20px;
        font-weight: 600;
        word-wrap: break-word;
    }
    @keyframes animateBdTooltip {
        from {
            opacity: 0;
            scale: .95;
        }
        to {
            opacity: 1;
            scale: 1;
        }
    }
    .bd-tooltip {
        animation: animateBdTooltip .1s ease;
    }
    div[data-last-official="true"] {
        position: relative;
    }
    #colorway-settings::after {
        content: "";
        position: absolute;
        height: 32px;
        width: 1px;
        background-color: var(--interactive-normal);
        bottom: 14px;
        right: -12px;
    }
    .customModalHeading {
        color: var(--header-primary);
    }
    .ColorwaySelectorWrapper {
        position: relative
    }
    .ColorwaySelectorWrapper::before {
        content: "";
        position: absolute;
        top: -9px;
        width: 100%;
        height: 1px;
        background-color: var(--interactive-muted);
        left: 0;
        /*transform: translateX(-50%);*/
        border-radius: 4px;
    }
    .themeEditor-1Ebyfp .ColorwaySelectorWrapper::before,
    .basicThemeSelectors-2wNKs6 .ColorwaySelectorWrapper::before {
        content: none;
    }
    .header-1ffhsl:has(>h1>.colorways-hideHeader) {
        display: none;
    }
    .root-1CAIjD:has(.colorwaySelectorModal) > .content-131fQL {
        padding-top: 16px;
    }
    `;
    load() { }
    start() {
        colorwayList = fetch("https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json").then(res => res.json()).then(colors => colorwayList = colors.colorways);
        document.head.append(createElement("style", { id: "DiscordColorways" }, this.css));

        for (const className in ElementInjections) {
            const elements = Array.from(document.body.getElementsByClassName(className));

            if (elements.length) {
                ElementInjections[className](elements);
            }
        }
        document.querySelectorAll("code.inline").forEach(el => {
            if (el.innerText.includes("colorway:")) {
                el.parentElement.append(modalBtnGray("Add This Colorway", {
                    onclick: () => {
                        BdApi.showConfirmationModal('Create Colorway', React.createElement('div', { class: 'colorwayCreationModal data-colorway-id data-colorway-id-' + el.innerText.split(":")[1] }))
                    }
                }))
            }
        })
        try {
            if (document.getElementById("activeColorway")) {
                document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
            } else {
                document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
            }
        } catch (e) {
            console.log("No active colorway, moving on");
        }
    }
    observer({ addedNodes }) {
        for (const added of addedNodes) {
            if (added.nodeType === Node.TEXT_NODE) continue;
            if (added.outerHTML.includes(`<code class="inline">`)) {
                added.querySelectorAll("code.inline").forEach(el => {
                    if (el.innerText.includes("colorway:")) {
                        el.parentElement.append(modalBtnGray("Add This Colorway", {
                            onclick: () => {
                                BdApi.showConfirmationModal('Create Colorway', React.createElement('div', { class: 'colorwayCreationModal data-colorway-id data-colorway-id-' + el.innerText.split(":")[1] }))
                            }
                        }))
                    }
                })
            }

            for (const className in ElementInjections) {
                const elements = Array.from(added.getElementsByClassName(className));

                if (elements.length) {
                    ElementInjections[className](elements);
                }
            }
        }
    }
    stop() {
        document.getElementById("DiscordColorways").remove();
        document.getElementById("activeColorway").remove();
        document.querySelectorAll("ColorwaySelector").forEach(el => el._unmount?.());
        document.querySelectorAll("ColorwaySelectorBtnContainer").forEach(el => el._unmount?.());
        BdApi.saveData("DiscordColorways", "settings", userSettings);
        document.querySelectorAll(".inlineCreateColorwayBtn").forEach(el => {
            el.remove();
        });
    }
    getSettingsPanel() {
        let _container = createElement("div", { className: "colorwaySettingsContainer" });

        _container.append(createElement("div", { class: "colorwaySelectorModal" }));

        let settingsWrapper = createElement("div", {
            className: "colorwaySettingsContainer"
        });

        _container.append(settingsWrapper);

        new SettingsRenderer(settingsWrapper).mount();

        return _container;
    }
    // Public API
    spawnColorwayCreator(e) {
        BdApi.showConfirmationModal('Create Colorway', React.createElement('div', { class: e ? 'colorwayCreationModal data-colorway-id data-colorway-id-' + e : 'colorwayCreationModal' }));
    }
    spawnColorwaySelector() {
        BdApi.showConfirmationModal(React.createElement("div",{class:"colorways-hideHeader"}), React.createElement('div', { class: 'colorwaySelectorModal' }));
    }
};
/*@end@*/
