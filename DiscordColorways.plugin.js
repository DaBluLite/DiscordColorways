/**
* @name DiscordColorways
* @displayName DiscordColorways
* @description A set of Color-Only themes for Discord, as well as a creator for said colorways. (This code is heavily based on [Platformindicators](https://github.com/Strencher/BetterDiscordStuff/tree/master/PlatformIndicators))
* @author DaBluLite
* @authorId 582170007505731594
* @invite ZfPH6SDkMW
* @version 2.1.1
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
let config = {
    info: {
        creatorVersion: "1.10"
    }
};

const {Webpack, Webpack: {Filters}, React, DOM} = BdApi;
const [ThemeEditor, HomeIcon, Toast] = Webpack.getBulk.apply(null, [
    Filters.byProps("themeEditor"),
    Filters.byProps("homeIcon"),
    Filters.byProps("createToast")
].map(fn => ({filter: fn})));

let nativeToast = (text,type) => {
    let toast = Toast.createToast(text,type);
    Toast.showToast(toast);
}

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
    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;
  
    if (delta == 0)
      h = 0;
    else if (cmax == r)
      h = ((g - b) / delta) % 6;
    else if (cmax == g)
      h = (b - r) / delta + 2;
    else
      h = (r - g) / delta + 4;
  
    h = Math.round(h * 60);
  
    if (h < 0)
      h += 360;
  
    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
  
    return [ h, s, l ];
}

const RGBToHSL = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
      ? l === r
        ? (g - b) / s
        : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
      : 0;
    let finalH = 60 * h < 0 ? 60 * h + 360 : 60 * h;
    let finalS = 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0);
    let finalL = (100 * (2 * l - s)) / 2;
    return [ finalH, finalS, finalL ];
};

const getElementByClass = (clss) => {
    return document.getElementsByClassName(clss)[0];
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
                        document.head.append(createElement("style", { id: "visibleCustomColorways" }, `
                        .customColorwaySelector {display: flex !important;}
                                                `));
                    } catch(e) {

                    }
                } else {
                    try {
                        document.getElementById("visibleCustomColorways").remove();
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

        let disableColorwayBtn = createElement("div", {
            className: "discordColorway themeSelection-2u4ce0",
            id: "colorway-disablecolorway",
            onclick: (el) => {
                if(!el.srcElement.classList.contains("active")) {
                    userSettings = {
                        activeColorway: "",
                        activeColorwayID: "disablecolorway",
                        showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar,
                        showCustomColorways: BdApi.loadData("DiscordColorways", "settings").showCustomColorways
                    }
                    BdApi.saveData("DiscordColorways", "settings", userSettings);
                    if(document.getElementById("activeColorway")) {
                        document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                    } else {
                        document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                    }
                    try {
                        if(document.querySelector(".discordColorway.active") != "colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                            document.querySelector(".discordColorway.active").classList.remove("active");
                        }
                    } catch(e) {
                        console.warn("Uncaught Exception: " + e);
                    }
                    el.srcElement.classList.add("active");
                }
                nativeToast("Disabled Colorway Successfully",1);
            }
        }, createElement("div", {
            className: "colorwayDisableIcon"
        }),
        createElement("div", {
            className: "colorwayCheckIconContainer"
        },
        createElement("div", {
            className: "colorwayCheckIcon"
        }))
        );
        BdApi.UI.createTooltip(disableColorwayBtn, "Disable Colorway", {});
        colorwayArray.push(disableColorwayBtn);



        let addColorwayBtn = createElement("div", {
            className: "discordColorway themeSelection-2u4ce0",
            id: "colorway-createcolorway",
            onclick: (el) => {
                BdApi.showConfirmationModal("Create Colorway", BdApi.React.createElement("div", {class:"colorwayCreationModal"}))
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
        BdApi.UI.createTooltip(addColorwayBtn, "Create Colorway", {});
        customcolorwayArray.push(addColorwayBtn);



        try {
            colorwayList.forEach((colorway) => {
                let colorwayElem = createElement("div", {
                    className: "discordColorway themeSelection-2u4ce0",
                    id: "colorway-" + colorway.name,
                    onclick: (el) => {
                        if(!el.srcElement.classList.contains("active")) {
                            userSettings = {
                                activeColorway: colorway.import,
                                activeColorwayID: colorway.name,
                                showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar,
                                showCustomColorways: BdApi.loadData("DiscordColorways", "settings").showCustomColorways
                            }
                            BdApi.saveData("DiscordColorways", "settings", userSettings);
                            if(document.getElementById("activeColorway")) {
                                document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                            } else {
                                document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                            }
                            try {
                                if(document.querySelector(".discordColorway.active") != "colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                                    document.querySelector(".discordColorway.active").classList.remove("active");
                                }
                            } catch(e) {
                                console.warn("Uncaught Exception: " + e);
                            }
                            el.srcElement.classList.add("active");
                        }
                        nativeToast(React.createElement("div",{class:"discordColorwayOnToast"},[React.createElement("div",{
                            class: "discordColorway themeSelection-2u4ce0"
                        },React.createElement("div",{
                            class: "discordColorwayPreviewColorContainer"
                        },[
                            React.createElement("div", {
                                className: "discordColorwayPreviewColor",
                                style: {backgroundColor: colorway.accent}
                            }),
                            React.createElement("div", {
                                className: "discordColorwayPreviewColor",
                                style: {backgroundColor: colorway.primary}
                            }),
                            React.createElement("div", {
                                className: "discordColorwayPreviewColor",
                                style: {backgroundColor: colorway.secondary}
                            }),
                            React.createElement("div", {
                                className: "discordColorwayPreviewColor",
                                style: {backgroundColor: colorway.tertiary}
                            })
                        ])),"Applied Colorway Successfully"]),0);
                    }
                },
                    createElement("div",{
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
                            let shareIconBtn = BdApi.React.createElement("div", {
                                class:"colorwayShareIcon",
                                onClick: () => {
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
                                    let original = "";
                                    if(colorway.original == true) {
                                        original = `<span style="display: flex;transform:translateY(-50%);position:absolute;top:23px;right:12px;padding: 4px 8px;border-radius: 50px;background-color: ${shadeColor(colorway.tertiary,-30)};color: #fff;font-family: Arial;">Original</span>`
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
                                    nativeToast("Copied Banner Successfully",1);
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
                                BdApi.React.createElement("span",{class: "colorwayAuthor"}, ["Author: ",BdApi.React.createElement("span",{class: "colorwayAuthorLink",onClick: (e) => {
                                    setTimeout(() => {
                                        //Popouts.showUserPopout(document.querySelector(".colorwayAuthorLink"),Webpack.getModule(Filters.byProps("getCurrentUser", "getUser")).getUser(colorway.authorID),{position:"right"});
                                    },10);
                                }},colorway.author)]),
                                BdApi.React.createElement("span",{class: "colorwayImport colorwayCodeblockWrapper"}, ["Import: ",BdApi.React.createElement("span",{class: "colorwayCodeblock"},colorway.import)])
                            ]),{
                                confirmText: "Set Theme",
                                onConfirm: () => {
                                    if(!el.path[1].parentElement.classList.contains("active")) {
                                        userSettings = {
                                            activeColorway: colorway.import,
                                            activeColorwayID: colorway.name
                                        }
                                        BdApi.saveData("DiscordColorways", "settings", userSettings);
                                        if(document.getElementById("activeColorway")) {
                                            document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                                        } else {
                                            document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                                        }
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
                        className: "colorwayInfoIcon"
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
                    className: "discordColorway themeSelection-2u4ce0",
                    id: "colorway-" + colorway.name,
                    onclick: (el) => {
                        if(!el.srcElement.classList.contains("active")) {
                            userSettings = {
                                activeColorway: colorway.import,
                                activeColorwayID: colorway.name,
                                showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar,
                                showCustomColorways: BdApi.loadData("DiscordColorways", "settings").showCustomColorways
                            }
                            BdApi.saveData("DiscordColorways", "settings", userSettings);
                            if(document.getElementById("activeColorway")) {
                                document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                            } else {
                                document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                            }
                            try {
                                if(document.querySelector(".discordColorway.active") != "colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                                    document.querySelector(".discordColorway.active").classList.remove("active");
                                }
                            } catch(e) {
                                console.warn("Uncaught Exception: " + e);
                            }
                            el.srcElement.classList.add("active");
                        }

                        nativeToast(React.createElement("div",{class:"discordColorwayOnToast"},[React.createElement("div",{
                            class: "discordColorway themeSelection-2u4ce0"
                        },React.createElement("div",{
                            class: "discordColorwayPreviewColorContainer"
                        },[
                            React.createElement("div", {
                                className: "discordColorwayPreviewColor",
                                style: {backgroundColor: colorway.accent.background}
                            }),
                            React.createElement("div", {
                                className: "discordColorwayPreviewColor",
                                style: {backgroundColor: colorway.primary.background}
                            }),
                            React.createElement("div", {
                                className: "discordColorwayPreviewColor",
                                style: {backgroundColor: colorway.secondary.background}
                            }),
                            React.createElement("div", {
                                className: "discordColorwayPreviewColor",
                                style: {backgroundColor: colorway.tertiary.background}
                            })
                        ])),"Applied Custom Colorway Successfully"]),0);
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
                            let codeblockLines = []
                            lines(colorway.import).forEach((importedLine,i) => {
                                let line = React.createElement("span",{style:{display: "flex",alignItems: "center", whiteSpace:"pre"}},React.createElement("span",{style:{width: 64, height:19, textAlign: "center", backgroundColor:"rgba(0,0,0,.4)",userSelect:"none",flexBasis:64,flexGrow:1,flexShrink:0,maxWidth:64}},i+1),importedLine);
                                codeblockLines.push(line);
                            })
                            let ColorwayCard;
                            let ColorwayCardShared;
                            if(colorway.isGradient == true) {
                                ColorwayCard = BdApi.React.createElement("img",{style: {borderRadius: 16},src:'data:image/svg+xml,' + encodeURIComponent(`
                                <svg xmlns="http://www.w3.org/2000/svg" width="408" height="150">
                                  <foreignObject width="408" height="150">
                                    <div xmlns="http://www.w3.org/1999/xhtml" style="padding-top: 8px;border-radius:8px;background:linear-gradient(-45deg, ${colorway.primary.background} 0%, ${colorway.tertiary.background} 100%);height: 150px;">
                                      <span style="display: flex;font-weight: 600;font-size: 20px; margin-top: 12px;margin-left: 12px;color: ${colorway.primary.foreground};font-family: Arial;">${colorway.name}</span>
                                      <span style="display: flex;font-weight: 500;font-size: 18px; margin-top: 4px;margin-left: 12px;color: ${colorway.primary.foreground};font-family: Arial;">By ${colorway.author}</span>
                                      <span style="display: flex;font-weight: 300;font-size: 12px; margin-top: 12px;margin-left: 12px;color: ${colorway.primary.foreground};opacity:.7;font-family: Arial;">Available in DiscordColorways</span>
                                    </div>
                                  </foreignObject>
                                </svg>
                                `)})
                                ColorwayCardShared = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
                                    <foreignObject width="300" height="150">
                                        <div xmlns="http://www.w3.org/1999/xhtml" style="padding-top: 8px;border-radius:8px;background:linear-gradient(-45deg, ${colorway.primary.background} 0%, ${colorway.tertiary.background} 100%);height: 150px;width:300px;">
                                            <span style="display: flex;font-weight: 600;font-size: 20px; margin-top: 12px;margin-left: 12px;color: ${colorway.primary.foreground};font-family: Arial;">${colorway.name}</span>
                                            <span style="display: flex;font-weight: 500;font-size: 18px; margin-top: 4px;margin-left: 12px;color: ${colorway.primary.foreground};font-family: Arial;">By ${colorway.author}</span>
                                            <span style="display: flex;font-weight: 300;font-size: 12px; margin-top: 12px;margin-left: 12px;color: ${colorway.primary.foreground};opacity:.7;font-family: Arial;">Available in DiscordColorways</span>
                                        </div>
                                    </foreignObject>
                                </svg>`
                            } else {
                                ColorwayCard = BdApi.React.createElement("img",{src:'data:image/svg+xml,' + encodeURIComponent(`
                                <svg xmlns="http://www.w3.org/2000/svg" width="408" height="150">
                                  <foreignObject width="408" height="150">
                                    <div xmlns="http://www.w3.org/1999/xhtml" style="border-radius:8px;background-color:${colorway.primary.background};height: 150px;">
                                      <div style="display: flex;width: 408px; height: 46px; flex-direction: row;"><div style="background-color: ${colorway.accent.background};height: 46px;width: 102px;border-top-left-radius: 8px;float:left;"></div><div style="background-color: ${colorway.primary.background};height: 46px; width: 102px;float:left;"></div><div style="background-color: ${colorway.secondary.background};height: 46px;width: 102px;float:left;"></div><div style="background-color: ${colorway.tertiary.background};height: 46px;width: 102px;border-top-right-radius: 8px;float:left;"></div></div>
                                      <span style="display: flex;font-weight: 600;font-size: 20px; margin-top: 12px;margin-left: 12px;color: ${colorway.primary.foreground};font-family: Arial;">${colorway.name}</span>
                                      <span style="display: flex;font-weight: 500;font-size: 18px; margin-top: 4px;margin-left: 12px;color: ${colorway.primary.foreground};font-family: Arial;">By ${colorway.author}</span>
                                      <span style="display: flex;font-weight: 300;font-size: 12px; margin-top: 12px;margin-left: 12px;color: ${colorway.primary.foreground};opacity:.7;font-family: Arial;">Available in DiscordColorways</span>
                                    </div>
                                  </foreignObject>
                                </svg>
                                `)})
                                ColorwayCardShared = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
                                    <foreignObject width="300" height="150">
                                        <div xmlns="http://www.w3.org/1999/xhtml" style="border-radius:8px;background-color:${colorway.primary.background};height: 150px;width:300px;">
                                            <div style="display: flex;width: 300px; height: 46px; flex-direction: row;"><div style="background-color: ${colorway.accent.background};height: 46px;width: 75px;border-top-left-radius: 8px;float:left;"></div><div style="background-color: ${colorway.primary.background};height: 46px; width: 75px;float:left;"></div><div style="background-color: ${colorway.secondary.background};height: 46px;width: 75px;float:left;"></div><div style="background-color: ${colorway.tertiary.background};height: 46px;width: 75px;border-top-right-radius: 8px;float:left;"></div></div>
                                            <span style="display: flex;font-weight: 600;font-size: 20px; margin-top: 12px;margin-left: 12px;color: ${colorway.primary.foreground};font-family: Arial;">${colorway.name}</span>
                                            <span style="display: flex;font-weight: 500;font-size: 18px; margin-top: 4px;margin-left: 12px;color: ${colorway.primary.foreground};font-family: Arial;">By ${colorway.author}</span>
                                            <span style="display: flex;font-weight: 300;font-size: 12px; margin-top: 12px;margin-left: 12px;color: ${colorway.primary.foreground};opacity:.7;font-family: Arial;">Available in DiscordColorways</span>
                                        </div>
                                    </foreignObject>
                                </svg>`
                            }
                            let shareIconBtn = BdApi.React.createElement("div", {
                                class:"colorwayShareIcon",
                                onClick: () => {
                                    let colorwayIDArray = `${colorway.accent.background},${colorway.primary.background},${colorway.secondary.background},${colorway.tertiary.background}`;
                                    let colorwayID = Buffer(colorwayIDArray).toString('hex');
                                    BdApi.showConfirmationModal("Share Colorway", React.createElement("div",{
                                        class: "colorwayInfoModalDetails",
                                        style: {gap: 4}
                                    },
                                    ColorwayCard,
                                    React.createElement("div",{class: "colorwayModalFooter"},
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
                                        class: "button-ejjZWC lookFilled-1H2Jvj colorBrand-2M3O3N sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                        onClick: (e) => {
                                            DiscordNative.clipboard.copy(colorwayID);
                                            nativeToast("Copied Colorway ID Successfully",1);
                                            try {
                                                e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                            } catch(e) {
            
                                            }
                                        }
                                    },"Copy Colorway ID"),
                                    BdApi.React.createElement("button",{
                                        class: "button-ejjZWC lookFilled-1H2Jvj colorBrand-2M3O3N sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                        onClick: (e) => {
                                            let canvas = document.createElement("canvas")
                                            let ctx = canvas.getContext("2d");
                                            let svg = ColorwayCardShared;

                                            var img = new Image();
                                            img.crossOrigin = "anonymous"
                                            img.onload = function() {
                                                ctx.drawImage(img, 0, 0);
                                                let buffer = Buffer.from(canvas.toDataURL().split(",")[1], 'base64');

                                                DiscordNative.clipboard.copyImage(buffer, "colorway-share")
                                            }
                                            img.src = `data:image/svg+xml,` + encodeURIComponent(svg);
                                            nativeToast("Copied Banner Successfully",1);
                                            try {
                                                e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                            } catch(e) {
            
                                            }
                                        }
                                    },"Copy Banner")
                                )
                                    ),{})
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
                                BdApi.React.createElement("span",{class: "colorwayAuthor"}, ["Author: ",BdApi.React.createElement("span",{class: "colorwayAuthorLink",onClick: (e) => {
                                    setTimeout(() => {
                                        //Popouts.showUserPopout(document.querySelector(".colorwayAuthorLink"),Webpack.getModule(Filters.byProps("getCurrentUser", "getUser")).getUser(colorway.authorID),{position:"right"});
                                    },10);
                                }},colorway.author)]),
                                BdApi.React.createElement("span",{class: "colorwayImport colorwayCodeblockWrapper"}, ["CSS: ",BdApi.React.createElement("span",{class: "colorwayCodeblock"},codeblockLines)]),
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
                                        class: "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                        onClick: (e) => {
                                            try {
                                                DiscordNative.clipboard.copy(colorway.import);
                                            } catch(e) {
            
                                            }
                                            nativeToast("Copied CSS to Clipboard",1);
                                        }
                                    },"Copy CSS"),
                                    BdApi.React.createElement("button",{
                                        class: "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                        onClick: (e) => {
                                            try {
                                                e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                            } catch(e) {
            
                                            }
                                            BdApi.showConfirmationModal("Rename Colorway:",BdApi.React.createElement("div", {
                                                class: "colorwayInfoModalDetails"
                                            },[
                                                React.createElement("input", {
                                                    type: "text",
                                                    class: "inputDefault-Ciwd-S input-3O04eu",
                                                    placeholder: "Give your colorway a new name"
                                                }),
                                                React.createElement("div",{class: "colorwayModalFooter"},[
                                                    React.createElement("button",{
                                                        class: "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                                        onClick: (e) => {
                                                            try {
                                                                e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                                            } catch(e) {
                            
                                                            }
                                                        }
                                                    },"Cancel"),
                                                    React.createElement("button",{
                                                        class: "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                                        onClick: (e) => {
                                                            if(!e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value) {
                                                                e.target.parentElement.parentElement.querySelector(`input[type="text"]`).placeholder = "C'mon, you can do better!"
                                                            } else {
                                                                let customColorwayArray = [];
                                                                BdApi.loadData("DiscordColorways", "custom_colorways").forEach(el => {
                                                                    if(el.name != colorway.name && el.name != e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value) {
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
                                                                    creatorVersion: config.info.creatorVersion
                                                                }
                                                                ];
                                                                customColorwayArray.push(customColorway[0]);
                                                                BdApi.saveData("DiscordColorways", "custom_colorways", customColorwayArray);
                                                                try {
                                                                    e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                                                } catch(e) {
                            
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
                                                    },"Finish")
                                                ])
                                            ]));
                                        }
                                    },"Rename"),
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
                                                    if(colorway.name == BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                                                        userSettings = {
                                                            activeColorway: "",
                                                            activeColorwayID: "disablecolorway",
                                                            showInGuildBar: BdApi.loadData("DiscordColorways", "settings").showInGuildBar,
                                                            showCustomColorways: BdApi.loadData("DiscordColorways", "settings").showCustomColorways
                                                        }
                                                        BdApi.saveData("DiscordColorways", "settings", userSettings);
                                                        if(document.getElementById("activeColorway")) {
                                                            document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                                                        } else {
                                                            document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                                                        }
                                                        try {
                                                            if(document.querySelector(".discordColorway.active") != "colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID) {
                                                                document.querySelector(".discordColorway.active").classList.remove("active");
                                                            }
                                                        } catch(e) {
                                                            console.warn("Uncaught Exception: " + e);
                                                        }
                                                        document.getElementById("colorway-" + BdApi.loadData("DiscordColorways", "settings").activeColorwayID).classList.add("active");
                                                    }
                                                }
                                            });
                                        }
                                    },"Delete Colorway")
                                ])
                            ]),{
                                confirmText: "Set Theme",
                                onConfirm: () => {
                                    if(!el.path[1].parentElement.classList.contains("active")) {
                                        userSettings = {
                                            activeColorway: colorway.import,
                                            activeColorwayID: colorway.name
                                        }
                                        BdApi.saveData("DiscordColorways", "settings", userSettings);
                                        if(document.getElementById("activeColorway")) {
                                            document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
                                        } else {
                                            document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
                                        }
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
                        className: "colorwayInfoIcon"
                    }))
                );

                if(colorway.isGradient == true) {
                    colorwayElem.append(createElement("div", {className: "discordColorwayPreviewGradient",style: "background: linear-gradient(-45deg, " + colorway.primary.background + " 0%, " + colorway.tertiary.background + " 100%);"}),colorwayElem.children[0]);
                } else {
                    colorwayElem.append(createElement("div",{
                        class: "discordColorwayPreviewColorContainer"
                    },
                    createElement("div", {className: "discordColorwayPreviewColor",style: "background-color: " + colorway.accent.background}),
                    createElement("div", {className: "discordColorwayPreviewColor",style: "background-color: " + colorway.primary.background}),
                    createElement("div", {className: "discordColorwayPreviewColor",style: "background-color: " + colorway.secondary.background}),
                    createElement("div", {className: "discordColorwayPreviewColor",style: "background-color: " + colorway.tertiary.background})))
                }

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
            className: "colorwayHeaderContainer"
        },
        createElement("div", {
            className: "colorwayHeaderTitle"
        }, "Colorways", createElement("div", {
            className: "colorwaySettingsIcon",
            onclick: () => {
                BdApi.showConfirmationModal("DiscordColorway Settings",[BdApi.React.createElement("div",{className: "colorwaySettingsContainer"})]);
            }
        })),
        createElement("button", {
            className: "button-ejjZWC lookFilled-1H2Jvj colorBrand-2M3O3N sizeSmall-3R2P2p grow-2T4nbg",
            type: "button",
            onclick: () => {
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
                });
            }
        }, "Refresh Colorway List")
        );

        this.customColorwayHeaderContainer = createElement("div", {
            className: "colorwayHeaderContainer customColorwaySelector"
        },
        createElement("div", {
            className: "colorwayHeaderTitle"
        }, "Custom Colorways", versionBadge("ColorwayCreator", config.info.creatorVersion)));


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
            className: "ColorwaySelectorBtnContainer",
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
            className: "ColorwaySelectorBtn",
            onclick: () => {
                BdApi.showConfirmationModal("Select Colorway:",BdApi.React.createElement("div", {class: "colorwaySelectorModal"}));
            }
        },createElement("div", {
            className: "colorwaySelectorIcon"
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

        let settingsPanel = 
            createElement("span",{className: "colorwaySetting",id: "showInGuildBar"}, "Show In Guild bar", bdSwitch(BdApi.loadData("DiscordColorways", "settings").showInGuildBar)) +
            createElement("span",{className: "colorwaySetting",id: "showCustomColorways"}, createElement("span",{},"Show Custom Colorways"), bdSwitch(BdApi.loadData("DiscordColorways", "settings").showCustomColorways))
        

        container.append(createElement("span",{className: "colorwaySetting",id: "showInGuildBar"}, "Show In Guild bar", bdSwitch(BdApi.loadData("DiscordColorways", "settings").showInGuildBar)),
        createElement("span",{className: "colorwaySetting",id: "showCustomColorways"}, createElement("span",{},"Show Custom Colorways"), bdSwitch(BdApi.loadData("DiscordColorways", "settings").showCustomColorways)));

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
                if(res.parentElement.classList.contains("data-colorway-id")) {
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
                    } catch(e) {

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

        let gradientPreview = ''

        let useGradient = false;

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
            className: "colorwayCreatorWrapperStage"
        });
        stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"

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
                                return [r,g,b]
                            }
                            let splitRGBValues = splitRGB(e.path[0].parentElement.style.backgroundColor);
                            let RgbToHex = rgbToHex(splitRGBValues[0],splitRGBValues[1],splitRGBValues[2]);
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
                                return [r,g,b]
                            }
                            let splitRGBValues = splitRGB(e.path[0].parentElement.style.backgroundColor);
                            let RgbToHex = rgbToHex(splitRGBValues[0],splitRGBValues[1],splitRGBValues[2]);
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
                            stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
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
                            let RgbToHex = rgbToHex(splitRGBValues[0],splitRGBValues[1],splitRGBValues[2]);
                            let RgbToHsl = RGBToHSL(splitRGBValues[0],splitRGBValues[1],splitRGBValues[2]);
                            secondaryAlt = shadeColor(RgbToHex, secondaryToSecondaryAltContrast);
                            backgroundSecondary = e.path[0].value;
                            document.querySelector(".colorwayPreview-channels").style = "background: var(--secondary-gradient,var(--secondary)); --secondary: " + backgroundSecondary + ";";
                            document.querySelector(".colorwayPreview-userArea").style = "background: var(--secondaryalt-gradient,var(--secondaryalt)); --secondaryalt: " + secondaryAlt + ";";
                            let RGBLuminanceCalc = Math.round(((parseInt(splitRGBValues[0]) * 299) +
                                (parseInt(splitRGBValues[1]) * 587) +
                                (parseInt(splitRGBValues[2]) * 114)) / 1000);
                            secondaryTextColor = (RGBLuminanceCalc > 125) ? 'black' : 'white';
                            if(RgbToHsl[0] == 0) {
                                secondaryMuted = 'gray'
                            } else {
                                if(secondaryTextColor == 'white') {
                                    secondaryMuted = "hsl(" + RgbToHsl[0] + ", 100%, 90%)";
                                } else if(secondaryTextColor == 'black') {
                                    secondaryMuted = "hsl(" + RgbToHsl[0] + ", 100%, 20%)";
                                }
                            }
                            e.path[0].parentElement.querySelector("span").style = "color: " + secondaryTextColor + ";";
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
                            let RgbToHex = rgbToHex(splitRGBValues[0],splitRGBValues[1],splitRGBValues[2]);
                            let RgbToHsl = RGBToHSL(splitRGBValues[0],splitRGBValues[1],splitRGBValues[2]);
                            secondaryAlt = shadeColor(RgbToHex, secondaryToSecondaryAltContrast);
                            backgroundSecondary = e.path[0].value;
                            document.querySelector(".colorwayPreview-channels").style = "background: var(--secondary-gradient,var(--secondary)); --secondary: " + backgroundSecondary + ";";
                            document.querySelector(".colorwayPreview-userArea").style = "background: var(--secondaryalt-gradient,var(--secondaryalt)); --secondaryalt: " + secondaryAlt + ";";
                            let RGBLuminanceCalc = Math.round(((parseInt(splitRGBValues[0]) * 299) +
                                (parseInt(splitRGBValues[1]) * 587) +
                                (parseInt(splitRGBValues[2]) * 114)) / 1000);
                            secondaryTextColor = (RGBLuminanceCalc > 125) ? 'black' : 'white';
                            if(RgbToHsl[0] == 0) {
                                secondaryMuted = 'gray'
                            } else {
                                if(secondaryTextColor == 'white') {
                                    secondaryMuted = "hsl(" + RgbToHsl[0] + ", 100%, 90%)";
                                } else if(secondaryTextColor == 'black') {
                                    secondaryMuted = "hsl(" + RgbToHsl[0] + ", 100%, 20%)";
                                }
                            }
                            e.path[0].parentElement.querySelector("span").style = "color: " + secondaryTextColor + ";";
                            stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
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
                            stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
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
                            stageOne.style = "--colorway-foreground-primary: " + primaryTextColor + "; --colorway-foreground-secondary: " + secondaryTextColor + "; --colorway-foreground-tertiary: " + tertiaryTextColor + "; --colorway-foreground-accent: " + accentTextColor + ";"
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
            className: "colorwayCreatorWrapperStage"
        });

        stageOne.append(modalHeader("Name:"),textInput("Give your Colorway a name","discordColorwayCreator_name"),modalHeader("Colors:"),creationPanel,createElement("div", {
            class: "settingRow"
        },
        "Gradient",createElement("div",{
            class: "choiceContainer"
        },
        createElement("div",{
            class:"choice",
            onclick: (e) => {
                if(!e.path[0].classList.contains("active")) {
                    e.path[0].parentElement.querySelector(".active").classList.remove("active");
                    e.path[0].classList.add("active");
                    useGradient = true;
                }
            }
        },"On"),
        createElement("div",{
            class:"choice active",
            onclick: (e) => {
                if(!e.path[0].classList.contains("active")) {
                    e.path[0].parentElement.querySelector(".active").classList.remove("active");
                    e.path[0].classList.add("active");
                    useGradient = false;
                }
            }
        },"Off"))),modalHeader("Preview:"),
        createElement("div",{
            class: "colorwayPreview-background",
            style: "background: " + backgroundTertiary + ";"
        },
        createElement("div",{
            class: "colorwayPreview-chat",
            style: "background: " + backgroundPrimary + ";"
        },
        createElement("div",{
            class: "colorwayPreview-channels",
            style: "background: " + backgroundSecondary + ";"
        },
        createElement("div",{
            class: "colorwayPreview-userArea",
            style: "background: " + secondaryAlt + ";"
        })
        ),
        createElement("div",{
            class: "colorwayPreview-chatbox",
            style: "background: var(--lighter-gradient,--lighter); --lighter: " + primaryLighter + ";"
        })
        ),
        createElement("div",{
            class: "colorwayPreview-guildsWrapper"
        },
        createElement("div",{
            class: "colorwayPreview-guildsIcon colorwayPreview-homeIcon",
            style: "background-color: " + backgroundPrimary + "; --background-hover: #5865f2;"
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
            style: "background-color: " + backgroundPrimary + "; --background-hover: #5865f2;"
        })
        )
        ),createElement("div",{class: "colorwayModalFooter"},
            modalBtnGray("Cancel",{
                onclick: (e) => {
                    try {
                        e.path[6].lastChild.querySelector('button[type="button"]').click();
                    } catch(e) {

                    }
                }
            }),
            modalBtnGray("Enter Colorway ID",{
                onclick: (e) => {
                    BdApi.showConfirmationModal("Enter Colorway ID:",BdApi.React.createElement("div", {
                        class: "colorwayInfoModalDetails"
                    },[
                        React.createElement("input", {
                            type: "text",
                            class: "inputDefault-Ciwd-S input-3O04eu",
                            placeholder: "Enter Colorway ID"
                        }),
                        React.createElement("div",{class: "colorwayModalFooter"},[
                            React.createElement("button",{
                                class: "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                onClick: (e) => {
                                    try {
                                        e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                    } catch(e) {
    
                                    }
                                }
                            },"Cancel"),
                            React.createElement("button",{
                                class: "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg colorwayModalBtn",
                                onClick: (e) => {
                                    if(!e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value) {
                                        e.target.parentElement.parentElement.querySelector(`input[type="text"]`).placeholder = "Invalid Colorway ID";
                                    } else {
                                        if(e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value.length < 63) {
                                            let colorwayValueArray = e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value.split(/(\w\w)/g).filter(p => !!p).map(c => String.fromCharCode(parseInt(c, 16))).join("").split(",");
                                            try {
                                                e.target.parentElement.parentElement.parentElement.parentElement.lastChild.querySelector('button[type="button"]').click();
                                            } catch(e) {
            
                                            }
                                                let changeColors = new UIEvent("change", {
                                                    "view": window,
                                                    "bubbles": true,
                                                    "cancelable": true
                                                });
                                                try {
                                                    document.getElementById("colorwayCreatorColorpicker_primary").value = colorwayValueArray[0];
                                                    document.getElementById("colorwayCreatorColorpicker_secondary").value = colorwayValueArray[1];
                                                    document.getElementById("colorwayCreatorColorpicker_tertiary").value = colorwayValueArray[2];
                                                    document.getElementById("colorwayCreatorColorpicker_accent").value = colorwayValueArray[3];
                
                                                    document.getElementById("colorwayCreatorColorpicker_primary").dispatchEvent(changeColors);
                                                    document.getElementById("colorwayCreatorColorpicker_secondary").dispatchEvent(changeColors);
                                                    document.getElementById("colorwayCreatorColorpicker_tertiary").dispatchEvent(changeColors);
                                                    document.getElementById("colorwayCreatorColorpicker_accent").dispatchEvent(changeColors);
                                                } catch(e) {
                
                                                }
                                        } else {
                                            e.target.parentElement.parentElement.querySelector(`input[type="text"]`).value = '';
                                            e.target.parentElement.parentElement.querySelector(`input[type="text"]`).placeholder = "Invalid Colorway ID";
                                        }
                                    }
                                }
                            },"Finish")
                        ])
                    ]));
                }
            }),
            modalBtnGray("Copy Current Colors",{
                onclick: (e) => {
                    let checkColorType = (color) => {
                        if(color.includes("#")) {
                            return "hex";
                        }
                        if(color.includes("hsl")) {
                            return "hsl";
                        }
                        if(color.includes("rgb")) {
                            return "rgb";
                        }
                    }
                    let HSLToHex = (h,s,l) => {
                        s /= 100;
                        l /= 100;
                      
                        let c = (1 - Math.abs(2 * l - 1)) * s,
                            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
                            m = l - c/2,
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
                    let calc = (str) => {
                        return Function(`'use strict'; return (${str})`)()
                    }
                    try {
                        if(checkColorType(getComputedStyle(document.body).getPropertyValue('--background-primary')) == "hex") {
                            if(getComputedStyle(document.body).getPropertyValue('--background-primary').includes(" ")) {
                                document.getElementById("colorwayCreatorColorpicker_primary").value = getComputedStyle(document.body).getPropertyValue('--background-primary').replace(" ","").replace(" ","").replace(" ","");
                            } else {
                                document.getElementById("colorwayCreatorColorpicker_primary").value = getComputedStyle(document.body).getPropertyValue('--background-primary');
                            }
                        } else if(checkColorType(getComputedStyle(document.body).getPropertyValue('--background-primary')) == "rgb") {
                            document.getElementById("colorwayCreatorColorpicker_primary").value = rgbToHex(getComputedStyle(document.body).getPropertyValue('--background-primary'));
                        } else if(checkColorType(getComputedStyle(document.body).getPropertyValue('--background-primary')) == "hsl") {
                            if(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[1].includes("calc")) {
                                document.getElementById("colorwayCreatorColorpicker_primary").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[0].split("(")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[2].split("%")[0].split("*")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[3].split("%")[0])));
                            } else if(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[2].includes("calc")) {
                                document.getElementById("colorwayCreatorColorpicker_primary").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[3].split("%")[0].split("*")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[4].split("%")[0])));
                            } else {
                                document.getElementById("colorwayCreatorColorpicker_primary").value = HSLToHex(getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[1],getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[2].split("%")[0],getComputedStyle(document.body).getPropertyValue('--background-primary').split(" ")[3].split("/")[0].split("%")[0]);
                            }
                        }

                        if(checkColorType(getComputedStyle(document.body).getPropertyValue('--background-secondary')) == "hex") {
                            if(getComputedStyle(document.body).getPropertyValue('--background-secondary').includes(" ")) {
                                document.getElementById("colorwayCreatorColorpicker_secondary").value = getComputedStyle(document.body).getPropertyValue('--background-secondary').replace(" ","").replace(" ","").replace(" ","");
                            } else {
                                document.getElementById("colorwayCreatorColorpicker_secondary").value = getComputedStyle(document.body).getPropertyValue('--background-secondary');
                            }
                        } else if(checkColorType(getComputedStyle(document.body).getPropertyValue('--background-secondary')) == "rgb") {
                            document.getElementById("colorwayCreatorColorpicker_secondary").value = rgbToHex(getComputedStyle(document.body).getPropertyValue('--background-secondary'));
                        } else if(checkColorType(getComputedStyle(document.body).getPropertyValue('--background-secondary')) == "hsl") {
                            if(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[1].includes("calc")) {
                                document.getElementById("colorwayCreatorColorpicker_secondary").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[0].split("(")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[2].split("%")[0].split("*")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[3].split("%")[0])));
                            } else if(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[2].includes("calc")) {
                                document.getElementById("colorwayCreatorColorpicker_secondary").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[3].split("%")[0].split("*")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[4].split("%")[0])));
                            } else {
                                document.getElementById("colorwayCreatorColorpicker_secondary").value = HSLToHex(getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[1],getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[2].split("%")[0],getComputedStyle(document.body).getPropertyValue('--background-secondary').split(" ")[3].split("/")[0].split("%")[0]);
                            }
                        }

                        if(checkColorType(getComputedStyle(document.body).getPropertyValue('--background-tertiary')) == "hex") {
                            if(getComputedStyle(document.body).getPropertyValue('--background-tertiary').includes(" ")) {
                                document.getElementById("colorwayCreatorColorpicker_tertiary").value = getComputedStyle(document.body).getPropertyValue('--background-tertiary').replace(" ","").replace(" ","").replace(" ","");
                            } else {
                                document.getElementById("colorwayCreatorColorpicker_tertiary").value = getComputedStyle(document.body).getPropertyValue('--background-tertiary');
                            }
                        } else if(checkColorType(getComputedStyle(document.body).getPropertyValue('--background-tertiary')) == "rgb") {
                            document.getElementById("colorwayCreatorColorpicker_tertiary").value = rgbToHex(getComputedStyle(document.body).getPropertyValue('--background-tertiary'));
                        } else if(checkColorType(getComputedStyle(document.body).getPropertyValue('--background-tertiary')) == "hsl") {
                            if(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[1].includes("calc")) {
                                document.getElementById("colorwayCreatorColorpicker_tertiary").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[0].split("(")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[2].split("%")[0].split("*")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[3].split("%")[0])));
                            } else if(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[2].includes("calc")) {
                                document.getElementById("colorwayCreatorColorpicker_tertiary").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[3].split("%")[0].split("*")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[4].split("%")[0])));
                            } else {
                                document.getElementById("colorwayCreatorColorpicker_tertiary").value = HSLToHex(getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[1],getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[2].split("%")[0],getComputedStyle(document.body).getPropertyValue('--background-tertiary').split(" ")[3].split("/")[0].split("%")[0]);
                            }
                        }

                        if(checkColorType(getComputedStyle(document.body).getPropertyValue('--brand-experiment')) == "hex") {
                            if(getComputedStyle(document.body).getPropertyValue('--brand-experiment').includes(" ")) {
                                document.getElementById("colorwayCreatorColorpicker_accent").value = getComputedStyle(document.body).getPropertyValue('--brand-experiment').replace(" ","").replace(" ","").replace(" ","");
                            } else {
                                document.getElementById("colorwayCreatorColorpicker_accent").value = getComputedStyle(document.body).getPropertyValue('--brand-experiment');
                            }
                        } else if(checkColorType(getComputedStyle(document.body).getPropertyValue('--brand-experiment')) == "rgb") {
                            document.getElementById("colorwayCreatorColorpicker_accent").value = rgbToHex(getComputedStyle(document.body).getPropertyValue('--brand-experiment'));
                        } else if(checkColorType(getComputedStyle(document.body).getPropertyValue('--brand-experiment')) == "hsl") {
                            if(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[1].includes("calc")) {
                                document.getElementById("colorwayCreatorColorpicker_accent").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[0].split("(")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[2].split("%")[0].split("*")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[3].split("%")[0])));
                            } else if(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[2].includes("calc")) {
                                document.getElementById("colorwayCreatorColorpicker_accent").value = String(HSLToHex(parseFloat(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[3].split("%")[0].split("*")[1]),parseFloat(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[4].split("%")[0])));
                            } else {
                                document.getElementById("colorwayCreatorColorpicker_accent").value = HSLToHex(getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[1],getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[2].split("%")[0],getComputedStyle(document.body).getPropertyValue('--brand-experiment').split(" ")[3].split("/")[0].split("%")[0]);
                            }
                        }

                        document.getElementById("colorwayCreatorColorpicker_primary").dispatchEvent(changeColors);
                        document.getElementById("colorwayCreatorColorpicker_secondary").dispatchEvent(changeColors);
                        document.getElementById("colorwayCreatorColorpicker_tertiary").dispatchEvent(changeColors);
                        document.getElementById("colorwayCreatorColorpicker_accent").dispatchEvent(changeColors);
                    } catch(e) {

                    }
                }
            }),
            modalBtn("Finish",{
                onclick: (e) => {
                    let gradientCSS = ``;
                    if(!document.getElementById("discordColorwayCreator_name").value) {
                        document.getElementById("discordColorwayCreator_name").value = "defaultColorwayName";
                    }
                    if(useGradient == true) {
                        gradientCSS = `:root {
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
--custom-theme-background: linear-gradient(-45deg, var(--primary-400) 0%, var(--primary-630) 20%, var(--primary-800) 80%, var(--primary-800) 100%);
}
                        .guilds-2JjMmN {
background: var(--bg-overlay-app-frame,--background-tertiary);
}
.sidebarRegionScroller-FXiQOh {
background: var(--bg-overlay-1,--background-secondary);
}
.contentRegionScroller-2_GT_N {
background: var(--bg-overlay-chat,--background-primary);
}`
                    }
                    let customColorwayCSS = `/*Automatically Generated - Colorway Creator V${config.info.creatorVersion}*/
:root {
--brand-100-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6*13)}%;
--brand-140-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6*12)}%;
--brand-160-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6*11)}%;
--brand-200-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6*10)}%;
--brand-230-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6*9)}%;
--brand-260-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6*8)}%;
--brand-300-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6*7)}%;
--brand-330-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6*6)}%;
--brand-345-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6*5)}%;
--brand-360-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6*4)}%;
--brand-400-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6*3)}%;
--brand-430-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + (3.6*2)}%;
--brand-460-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] + 3.6}%;
--brand-500-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2]}%;
--brand-530-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - 3.6}%;
--brand-560-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6*2)}%;
--brand-600-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6*3)}%;
--brand-630-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6*4)}%;
--brand-660-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6*5)}%;
--brand-700-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6*6)}%;
--brand-730-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6*7)}%;
--brand-760-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6*8)}%;
--brand-800-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6*9)}%;
--brand-830-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6*10)}%;
--brand-860-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6*11)}%;
--brand-900-hsl: ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[0]} ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[1]}% ${HexToHSL(document.getElementById("colorwayCreatorColorpicker_accent").value)[2] - (3.6*12)}%;
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
${gradientCSS}
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
                        isGradient: useGradient,
                        import: customColorwayCSS,
                        author: currentUserProps.username,
                        authorID: currentUserProps.id,
                        creatorVersion: config.info.creatorVersion
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
        border-radius: 8px;
        background-color: var(--background-primary);
        box-shadow: 0 0 0 1px var(--background-secondary-alt);
        height: 40px;
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
    .discordColorwayPreviewColorContainer {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        overflow: hidden;
        border-radius: 50%;
        height: 56px;
        width: 56px;
        margin: 2px;
        pointer-events: none;
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
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
    }
    #colorway-disablecolorway > .colorwayDisableIcon {
        height: 60px;
        width: 60px;
        background-color: var(--header-primary);
        -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' role='img' class='closeIcon-pSJDFz' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z'%3E%3C/path%3E%3C/svg%3E");
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
        width: 28px;
        height: 28px;
    }
    .discordColorwayPreviewGradient {
        width: 54px;
        height: 54px;
        margin: 3px;
        border-radius: 50%;
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
        max-width: 915px;
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
        max-width: 564px;
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
        border-radius: 4px;
        -webkit-text-size-adjust: none;
        -moz-text-size-adjust: none;
        -ms-text-size-adjust: none;
        text-size-adjust: none;
        color: var(--text-normal);
        background: var(--background-secondary);
        user-select: text;
        max-height: 200px;
        overflow: auto;
        white-space: nowrap;
    }

    .colorwayCodeblock::-webkit-scrollbar {
        width: 16px;
        height: 16px;
    }
    .colorwayCodeblock::-webkit-scrollbar-corner {
        background-color: transparent;
    }
    .colorwayCodeblock::-webkit-scrollbar-thumb {
        background-color: var(--scrollbar-auto-thumb);
        min-height: 40px;
    }
    .colorwayCodeblock::-webkit-scrollbar-thumb, .colorwayCodeblock::-webkit-scrollbar-track {
        border: 4px solid transparent;
        background-clip: padding-box;
        border-radius: 8px;
    }
    .scroller-kQBbkU::-webkit-scrollbar-track {
        margin-bottom: 8px;
    }
    .colorwayCodeblock::-webkit-scrollbar-thumb, .colorwayCodeblock::-webkit-scrollbar-track {
        border: 4px solid transparent;
        background-clip: padding-box;
        border-radius: 8px;
    }
    .colorwayCodeblock::-webkit-scrollbar-track {
        background-color: var(--scrollbar-auto-track);
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
        gap: 8px;
        margin-top: 4px;
    }
    .customColorwaySelector {
        display: none;
    }
    code.inline[data-origin-content] {
        display: flex;
        background-color: transparent;
        width: fit-content;
        float: left;
    }
    `;
    load() {}
    start() {
        colorwayList = fetch("https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json").then(res => res.json()).then(colors => colorwayList = colors.colorways);
        document.head.append(createElement("style", { id: "DiscordColorways" }, this.css));

        if(BdApi.loadData("DiscordColorways","settings").showCustomColorways == true) {
            document.head.append(createElement("style", { id: "visibleCustomColorways" }, `
                                .customColorwaySelector {display: flex !important;}
                                                        `));
        }

        for (const className in ElementInjections) {
            const elements = Array.from(document.body.getElementsByClassName(className));

            if (elements.length) {
                ElementInjections[className](elements);
            }
        }
        document.querySelectorAll("code.inline").forEach(el => {
            if(el.innerText.includes("colorway:")) {
                el.parentElement.innerHTML = el.parentElement.innerHTML + `<button class="inlineCreateColorwayBtn button-ejjZWC lookFilled-1H2Jvj colorBrand-2M3O3N sizeSmall-3R2P2p grow-2T4nbg" type="button" onclick="BdApi.showConfirmationModal('Create Colorway', BdApi.React.createElement('div', {class:'colorwayCreationModal data-colorway-id data-colorway-id-${el.innerText.split(":")[1]}'}))">Add This Colorway</button>`;
            }
        })
        try {
            if(document.getElementById("activeColorway")) {
                document.getElementById("activeColorway").innerHTML = BdApi.loadData("DiscordColorways", "settings").activeColorway;
            } else {
                document.head.append(createElement("style", { id: "activeColorway" }, BdApi.loadData("DiscordColorways", "settings").activeColorway));
            }
        } catch(e) {
            console.log("No active colorway, moving on");
        }
    }
    observer({addedNodes}) {
        for (const added of addedNodes) {
            if (added.nodeType === Node.TEXT_NODE) continue;
            if(added.outerHTML.includes(`<code class="inline">`)) {
                added.querySelectorAll("code.inline").forEach(el => {
                    if(el.innerText.includes("colorway:")) {
                        el.parentElement.innerHTML = el.parentElement.innerHTML + `<button class="inlineCreateColorwayBtn button-ejjZWC lookFilled-1H2Jvj colorBrand-2M3O3N sizeSmall-3R2P2p grow-2T4nbg" type="button" onclick="BdApi.showConfirmationModal('Create Colorway', BdApi.React.createElement('div', {class:'colorwayCreationModal data-colorway-id data-colorway-id-${el.innerText.split(":")[1]}'}))">Add This Colorway</button>`;
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
        document.getElementById("visibleCustomColorways").remove();
        document.querySelectorAll("ColorwaySelector").forEach(el => el._unmount?.());
        document.querySelectorAll("ColorwaySelectorBtnContainer").forEach(el => el._unmount?.());
        BdApi.saveData("DiscordColorways", "settings", userSettings);
        document.querySelectorAll(".inlineCreateColorwayBtn").forEach(el => {
            el.remove();
        });
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
/*@end@*/
