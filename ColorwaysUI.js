var _mods_unparsed = webpackChunkdiscord_app.push([[Symbol("DiscordColorways")], {}, e => e]);
var _mods_cache = _mods_unparsed.c;
var _mods = Object.values(_mods_cache);
webpackChunkdiscord_app.pop();

function find(filter, { isIndirect = false, isWaitFor = false } = {}) {
    if (typeof filter !== "function")
        throw new Error("Invalid filter. Expected a function got " + typeof filter);

    for (const key in _mods_cache) {
        const mod = _mods_cache[key];
        if (!mod?.exports) continue;

        if (filter(mod.exports)) {
            return isWaitFor ? [mod.exports, Number(key)] : mod.exports;
        }

        if (typeof mod.exports !== "object") continue;

        if (mod.exports.default && filter(mod.exports.default)) {
            const found = mod.exports.default;
            return isWaitFor ? [found, Number(key)] : found;
        }

        // the length check makes search about 20% faster
        for (const nestedMod in mod.exports) if (nestedMod.length <= 3) {
            const nested = mod.exports[nestedMod];
            if (nested && filter(nested)) {
                return isWaitFor ? [nested, Number(key)] : nested;
            }
        }
    }

    if (!isIndirect) {
        console.error('"find" found no module');
        return null;
    }

    return isWaitFor ? [null, null] : null;
}

const filters = {
    byProps: (...props) =>
        props.length === 1
            ? m => m[props[0]] !== void 0
            : m => props.every(p => m[p] !== void 0),

    byCode: (...code) => m => {
        if (typeof m !== "function") return false;
        const s = Function.prototype.toString.call(m);
        for (const c of code) {
            if (!s.includes(c)) return false;
        }
        return true;
    },
    byStoreName: (name) => m =>
        m.constructor?.displayName === name
};

function findByCode(...code) {
    const res = find(filters.byCode(...code), { isIndirect: true });
    if (!res) {
        console.error('"findByCode" found no module');
        return null;
    }
    return res;
}

function findByProps(...props) {
    const res = find(filters.byProps(...props), { isIndirect: true });
    if (!res) {
        console.error('"findByProps" found no module');
        return null;
    }
    return res;
}

function waitFor(filter, callback) {
    if (typeof filter === "string")
        filter = filters.byProps(filter);
    else if (Array.isArray(filter))
        filter = filters.byProps(...filter);
    else if (typeof filter !== "function")
        throw new Error("filter must be a string, string[] or function, got " + typeof filter);

    const [existing, id] = find(filter, { isIndirect: true, isWaitFor: true });
    if (existing) return void callback(existing, id);

    subscriptions.set(filter, callback);
}

function waitForStore(name, cb) {
    waitFor(filters.byStoreName(name), cb);
}

const { ModalRoot, ModalContent, ModalHeader, ModalFooter, openModal, TextInput, Tooltip, FormTitle, Text, Button, Switch, showToast } = findByProps("ModalRoot");
const ModalText = findByProps("ModalRoot").Text;
const React = findByProps("createContext");
const ReactDOM = findByProps("createRoot");
const { StrictMode } = findByProps("StrictMode");
const subscriptions = new Map();
const listeners = new Set();

const plugin = {
    name: "DiscordColorways",
    description:
        "A plugin that offers easy access to simple color schemes/themes for Discord, also known as Colorways",
    pluginVersion: "5.3.0",
    creatorVersion: "1.15",
    makeSettingsCategories: ({ ID }) => {
        return [
            {
                section: ID.HEADER,
                label: "Discord Colorways",
                className: "vc-settings-header"
            },
            {
                section: "ColorwaysSelector",
                label: "Colors",
                element: ColorwaySelectorBtn,
                className: "dc-colorway-selector"
            },
            {
                section: "ColorwaysSettings",
                label: "Settings & Tools",
                element: ColorwaySelectorBtn,
                className: "dc-colorway-settings"
            },
            {
                section: ID.DIVIDER
            }
        ].filter(Boolean);
    },
    ColorwaysBtn: [React.createElement(ColorwaySelectorBtn)],
    patches: [
        {
            find: "Messages.ACTIVITY_SETTINGS",
            replacement: [{
                match: /\{section:([a-zA-Z])\.ID\.HEADER,\s*label:([a-zA-Z])\.[a-zA-Z]\.Messages\.BILLING_SETTINGS\}/,
                replace: "...DiscordColorways_plugin.makeSettingsCategories($1),$&"
            }],
            plugin: "DiscordColorways"
        },
        {
            find: "Messages.SERVERS,children",
            replacement: [{
                match: /(Messages\.SERVERS,children:)(.+?default:return null\}\}\)\))/,
                replace: "$1DiscordColorways_plugin.ColorwaysBtn.concat($2)"
            }],
            plugin: "DiscordColorways"
        }
    ]
};

globalThis.DiscordColorways_plugin = { ...plugin };

class DataStore {
    defaultGetStoreFunc;
    promisifyRequest = (request) => {
        return new Promise((resolve, reject) => {
            request.oncomplete = request.onsuccess = () => resolve(request.result);
            request.onabort = request.onerror = () => reject(request.error);
        });
    };
    createStore = (dbName, storeName) => {
        const request = indexedDB.open(dbName);
        request.onupgradeneeded = () => request.result.createObjectStore(storeName);
        const dbp = this.promisifyRequest(request);

        return (txMode, callback) =>
            dbp.then(db =>
                callback(db.transaction(storeName, txMode).objectStore(storeName))
            );
    };
    defaultGetStore = () => {
        if (!this.defaultGetStoreFunc) {
            this.defaultGetStoreFunc = this.createStore("ColorwaysData", "ColorwaysStore");
        }
        return this.defaultGetStoreFunc;
    };
    get = (key, customStore = this.defaultGetStore()) => {
        return customStore("readonly", store => this.promisifyRequest(store.get(key)));
    };
    set = (key, value, customStore = this.defaultGetStore()) => {
        return customStore("readwrite", store => {
            store.put(value, key);
            return this.promisifyRequest(store.transaction);
        });
    };
    setMany = (entries, customStore = this.defaultGetStore()) => {
        return customStore("readwrite", store => {
            entries.forEach(entry => store.put(entry[1], entry[0]));
            return this.promisifyRequest(store.transaction);
        });
    };
    getMany = (keys, customStore = this.defaultGetStore()) => {
        return customStore("readonly", store =>
            Promise.all(keys.map(key => this.promisifyRequest(store.get(key))))
        );
    };
    update = (key, updater, customStore = this.defaultGetStore()) => {
        return customStore(
            "readwrite",
            store =>
                new Promise((resolve, reject) => {
                    store.get(key).onsuccess = function () {
                        try {
                            store.put(updater(this.result), key);
                            resolve(this.promisifyRequest(store.transaction));
                        } catch (err) {
                            reject(err);
                        }
                    };
                })
        );
    };
    del = (key, customStore = this.defaultGetStore()) => {
        return customStore("readwrite", store => {
            store.delete(key);
            return this.promisifyRequest(store.transaction);
        });
    };
    delMany = (keys, customStore = this.defaultGetStore()) => {
        return customStore("readwrite", store => {
            keys.forEach(key => store.delete(key));
            return this.promisifyRequest(store.transaction);
        });
    };
    clear = (customStore = this.defaultGetStore()) => {
        return customStore("readwrite", store => {
            store.clear();
            return this.promisifyRequest(store.transaction);
        });
    };
    eachCursor = (store, callback) => {
        store.openCursor().onsuccess = function () {
            if (!this.result) return;
            callback(this.result);
            this.result.continue();
        };
        return this.promisifyRequest(store.transaction);
    };
    keys = (customStore = this.defaultGetStore()) => {
        return customStore("readonly", store => {
            // Fast path for modern browsers
            if (store.getAllKeys) {
                return this.promisifyRequest(store.getAllKeys());
            }

            const items = [];

            return this.eachCursor(store, cursor => items.push(cursor.key)).then(() => items);
        });
    };
    values = (customStore = this.defaultGetStore()) => {
        return customStore("readonly", store => {
            if (store.getAll) {
                return this.promisifyRequest(store.getAll());
            }

            const items = [];

            return this.eachCursor(store, cursor => items.push(cursor.value)).then(
                () => items
            );
        });
    };
    entries = (customStore = this.defaultGetStore()) => {
        return customStore("readonly", store => {
            if (store.getAll && store.getAllKeys) {
                return Promise.all([
                    this.promisifyRequest(store.getAllKeys()),
                    this.promisifyRequest(store.getAll())
                ]).then(([keys, values]) => keys.map((key, i) => [key, values[i]]));
            }

            const items = [];

            return customStore("readonly", store =>
                this.eachCursor(store, cursor => items.push([cursor.key, cursor.value])).then(
                    () => items
                )
            );
        });
    };
}

class ColorwayCSS {
    get = () => { return { name: document.getElementById("activeColorwayCSS")?.getAttribute("data-colorway-id") || "", css: document.getElementById("activeColorwayCSS")?.textContent || "" }; };
    set = (e, t) => {
        if (!document.getElementById("activeColorwayCSS")) {
            var activeColorwayCSS = document.createElement("style");
            activeColorwayCSS.id = "activeColorwayCSS";
            activeColorwayCSS.textContent = e;
            activeColorwayCSS.setAttribute("data-colorway-id", t);
            document.head.append(activeColorwayCSS);
        } else {
            document.getElementById("activeColorwayCSS").textContent = e;
            document.getElementById("activeColorwayCSS").setAttribute("data-colorway-id", t);
        }
    };
    remove = () => document.getElementById("activeColorwayCSS").remove();
    openSelectorModal = () => {
        fetch("https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json")
            .then(response => response.json())
            .then((data) => {
                if (!data) return;
                if (!data.colorways?.length) return;
                openModal(props => React.createElement(SelectorModal, { modalProps: props, colorwayProps: data.colorways }));
            })
            .catch(err => {
                console.log(err);
                return null;
            });
    };
};

const [colorwayCSS, dataStore] = [new ColorwayCSS(), new DataStore()];

var SelectedChannelStore, SelectedGuildStore;

const WEBPACK_CHUNK = "webpackChunkdiscord_app";
function canonicalizeReplacement(replacement, plugin) {
    const descriptors = Object.getOwnPropertyDescriptors(replacement);
    descriptors.match = canonicalizeDescriptor(descriptors.match, canonicalizeMatch);
    descriptors.replace = canonicalizeDescriptor(
        descriptors.replace,
        replace => canonicalizeReplace(replace, plugin),
    );
    Object.defineProperties(replacement, descriptors);
}

const traceFunction = (name, f, mapper) => f;

let webpackChunk;

if (window[WEBPACK_CHUNK]) {
    patchPush();
} else {
    Object.defineProperty(window, WEBPACK_CHUNK, {
        get: () => webpackChunk,
        set: v => {
            if (v?.push !== Array.prototype.push) {
                console.info(`Patching ${WEBPACK_CHUNK}.push`);
                _mods_unparsed = v.push([[Symbol("DiscordColorways")], {}, e => e]);
                patchPush();
                // @ts-ignore
                delete window[WEBPACK_CHUNK];
                window[WEBPACK_CHUNK] = v;
            }
            webpackChunk = v;
        },
        configurable: true
    });
}

function patchPush() {
    function handlePush(chunk) {
        try {
            const modules = chunk[1];
            const patches = plugin.patches;

            for (const id in modules) {
                let mod = modules[id];
                let code = mod.toString().replaceAll("\n", "");
                if (code.startsWith("function(")) {
                    code = "0," + code;
                }
                const originalMod = mod;
                const patchedBy = new Set();

                const factory = modules[id] = function (module, exports, require) {
                    try {
                        mod(module, exports, require);
                    } catch (err) {
                        // Just rethrow discord errors
                        if (mod === originalMod) throw err;

                        console.error("Error in patched chunk", err);
                        return void originalMod(module, exports, require);
                    }

                    if (module.exports === window) {
                        Object.defineProperty(require.c, id, {
                            value: require.c[id],
                            enumerable: false,
                            configurable: true,
                            writable: true
                        });
                        return;
                    }

                    const numberId = Number(id);

                    for (const callback of listeners) {
                        try {
                            callback(exports, numberId);
                        } catch (err) {
                            console.error("Error in webpack listener", err);
                        }
                    }

                    for (const [filter, callback] of subscriptions) {
                        try {
                            if (filter(exports)) {
                                subscriptions.delete(filter);
                                callback(exports, numberId);
                            } else if (typeof exports === "object") {
                                if (exports.default && filter(exports.default)) {
                                    subscriptions.delete(filter);
                                    callback(exports.default, numberId);
                                }

                                for (const nested in exports) if (nested.length <= 3) {
                                    if (exports[nested] && filter(exports[nested])) {
                                        subscriptions.delete(filter);
                                        callback(exports[nested], numberId);
                                    }
                                }
                            }
                        } catch (err) {
                            console.error("Error while firing callback for webpack chunk", err);
                        }
                    }
                };

                // for some reason throws some error on which calling .toString() leads to infinite recursion
                // when you force load all chunks???
                try {
                    factory.toString = () => mod.toString();
                    factory.original = originalMod;
                } catch { }

                for (let i = 0; i < patches.length; i++) {
                    const patch = patches[i];
                    if (patch.predicate && !patch.predicate()) continue;

                    if (code.includes(patch.find)) {
                        patchedBy.add(patch.plugin);

                        // we change all patch.replacement to array in plugins/index
                        for (const replacement of patch.replacement) {
                            if (replacement.predicate && !replacement.predicate()) continue;
                            const lastMod = mod;
                            const lastCode = code;

                            try {
                                const newCode = code.replace(replacement.match, replacement.replace);
                                if (newCode === code && !patch.noWarn) {
                                    console.warn(`Patch by ${patch.plugin} had no effect (Module id is ${id}): ${replacement.match}`);
                                } else {
                                    code = newCode;
                                    mod = (0, eval)(`// Webpack Module ${id} - Patched by ${[...patchedBy].join(", ")}\n${newCode}\n//# sourceURL=WebpackModule${id}`);
                                }
                            } catch (err) {
                                console.error(`Patch by ${patch.plugin} errored (Module id is ${id}): ${replacement.match}\n`, err);

                                code = lastCode;
                                mod = lastMod;
                                patchedBy.delete(patch.plugin);
                            }
                        }

                        if (!patch.all) patches.splice(i--, 1);
                    }
                }
            }
        } catch (err) {
            console.error("Error in handlePush", err);
        }

        return handlePush.original.call(window[WEBPACK_CHUNK], chunk);
    }

    handlePush.original = window[WEBPACK_CHUNK].push;
    Object.defineProperty(window[WEBPACK_CHUNK], "push", {
        get: () => handlePush,
        set: v => (handlePush.original = v),
        configurable: true
    });
}

waitForStore("SelectedChannelStore", m => SelectedChannelStore = m);
waitForStore("SelectedGuildStore", m => SelectedGuildStore = m);

async function openUserProfile(userId) {
    const getUser = findByCode(".USER(");
    const openProfile = findByCode("friendToken", "USER_PROFILE_MODAL_OPEN");
    const guildId = SelectedGuildStore.getGuildId();
    const channelId = SelectedChannelStore.getChannelId();

    await getUser(userId);
    openProfile({
        userId,
        guildId,
        channelId,
        analyticsLocation: {
            page: guildId ? "Guild Channel" : "DM Channel",
            section: "Profile Popout"
        }
    });
}

var pluginCSS = `
/* stylelint-disable selector-class-pattern */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css");

.colorwaySelectorIcon {
    height: 24px;
    width: 24px;
    background-color: currentcolor;
    clip-path: path('M 12 7.5 C 13.242188 7.5 14.25 6.492188 14.25 5.25 C 14.25 4.007812 13.242188 3 12 3 C 10.757812 3 9.75 4.007812 9.75 5.25 C 9.75 6.492188 10.757812 7.5 12 7.5 Z M 18 12 C 19.242188 12 20.25 10.992188 20.25 9.75 C 20.25 8.507812 19.242188 7.5 18 7.5 C 16.757812 7.5 15.75 8.507812 15.75 9.75 C 15.75 10.992188 16.757812 12 18 12 Z M 8.25 10.5 C 8.25 11.742188 7.242188 12.75 6 12.75 C 4.757812 12.75 3.75 11.742188 3.75 10.5 C 3.75 9.257812 4.757812 8.25 6 8.25 C 7.242188 8.25 8.25 9.257812 8.25 10.5 Z M 9 19.5 C 10.242188 19.5 11.25 18.492188 11.25 17.25 C 11.25 16.007812 10.242188 15 9 15 C 7.757812 15 6.75 16.007812 6.75 17.25 C 6.75 18.492188 7.757812 19.5 9 19.5 Z M 9 19.5 M 24 12 C 24 16.726562 21.199219 15.878906 18.648438 15.105469 C 17.128906 14.644531 15.699219 14.210938 15 15 C 14.09375 16.023438 14.289062 17.726562 14.472656 19.378906 C 14.738281 21.742188 14.992188 24 12 24 C 5.371094 24 0 18.628906 0 12 C 0 5.371094 5.371094 0 12 0 C 18.628906 0 24 5.371094 24 12 Z M 12 22.5 C 12.917969 22.5 12.980469 22.242188 12.984375 22.234375 C 13.097656 22.015625 13.167969 21.539062 13.085938 20.558594 C 13.066406 20.304688 13.03125 20.003906 12.996094 19.671875 C 12.917969 18.976562 12.828125 18.164062 12.820312 17.476562 C 12.804688 16.417969 12.945312 15.0625 13.875 14.007812 C 14.429688 13.382812 15.140625 13.140625 15.78125 13.078125 C 16.390625 13.023438 17 13.117188 17.523438 13.234375 C 18.039062 13.351562 18.574219 13.515625 19.058594 13.660156 L 19.101562 13.675781 C 19.621094 13.832031 20.089844 13.972656 20.53125 14.074219 C 21.511719 14.296875 21.886719 14.199219 22.019531 14.109375 C 22.074219 14.070312 22.5 13.742188 22.5 12 C 22.5 6.199219 17.800781 1.5 12 1.5 C 6.199219 1.5 1.5 6.199219 1.5 12 C 1.5 17.800781 6.199219 22.5 12 22.5 Z M 12 22.5 ');
}

.ColorwaySelectorBtn {
    height: 48px;
    width: 48px;
    border-radius: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: .15s ease-out;
    background-color: var(--background-primary);
    cursor: pointer;
    color: var(--text-normal);
}

.ColorwaySelectorBtn:hover {
    background-color: var(--brand-experiment);
    border-radius: 16px;
}

.discordColorway {
    height: 60px;
    width: 60px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    flex-flow: wrap;
    flex-direction: row;
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
    flex-flow: wrap;
    flex-direction: row;
    overflow: hidden;
    border-radius: 50%;
    width: 56px;
    height: 56px;
}

.discordColorway.active {
    box-shadow: inset 0 0 0 2px var(--brand-500), inset 0 0 0 4px var(--background-primary);
}

.discordColorway.active .discordColorwayPreviewColorContainer {
    width: 52px;
    height: 52px;
}

.discordColorwayPreviewColor {
    width: 50%;
    height: 50%;
}

.discordColorway.active>.discordColorwayPreviewColor {
    width: 30px;
    height: 30px;
}

.discordColorwayPreviewColorContainer:not(:has(>.discordColorwayPreviewColor:nth-child(2)))>.discordColorwayPreviewColor {
    height: 100%;
    width: 100%;
}

.discordColorwayPreviewColorContainer:not(:has(>.discordColorwayPreviewColor:nth-child(3)))>.discordColorwayPreviewColor {
    height: 100%;
}

.discordColorwayPreviewColorContainer:not(:has(>.discordColorwayPreviewColor:nth-child(4)))>.discordColorwayPreviewColor:nth-child(3) {
    width: 100%;
}

.ColorwaySelectorWrapper {
    position: relative;
    display: flex;
    gap: 16px 24px;
    width: 100%;
    flex-wrap: wrap;
}

.colorwaySelectorModal {
    width: 100%;
    border-radius: 12px;
    border: 1px solid var(--background-tertiary);
    box-shadow: var(--dark-elevation-high) !important;
    min-width: 596px;
}

.colorwaySelectorModalContent {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 596px;
    overflow: visible !important;
    padding: 16px !important;
    padding-right: 16px !important;
}

.ColorwaySelectorBtnContainer {
    position: relative;
    margin: 0 0 8px;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    width: 72px;
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
    z-index: +1;
}

.discordColorway.active .colorwayCheckIconContainer {
    opacity: 1;
}

.colorwayCheckIcon {
    height: 20px;
    width: 20px;
    color: var(--white-500);
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
    color: var(--white-500);
    padding: 2px;
}

.colorwayCreator-swatch {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    border-radius: 4px;
    box-sizing: border-box;
    border: none;
    width: 100%;
    position: relative;
    color: #fff;
}

.colorwayCreator-swatchName {
    color: currentcolor;
    pointer-events: none;
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

.colorwayCreator-colorInput {
    width: 1px;
    height: 1px;
    opacity: 0;
    position: absolute;
    pointer-events: none;
}

.colorwayCreator-menuWrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 20px 16px !important;
    overflow: visible !important;
}

.colorwayCreator-modal {
    width: 620px;
    max-width: 620px;
    max-height: unset !important;
}

.colorways-creator-module-warning~.colorways-creator-module-warning {
    display: none;
}

.colorwayCreator-colorPreviews>.colorSwatch-2UxEuG,
.colorwayCreator-colorPreviews>.colorSwatch-2UxEuG>.swatch-efj8wq {
    width: 100%;
    border: none;
    position: relative;
}

.colorwayCreator-colorPreviews>.colorSwatch-2UxEuG::before {
    content: "";
    display: flex;
    position: absolute;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    z-index: +1;
    color: var(--white-500);
    pointer-events: none;
}

.colorwayCreator-colorPreviews>.colorSwatch-2UxEuG:nth-child(1)::before {
    content: "Primary";
}

.colorwayCreator-colorPreviews>.colorSwatch-2UxEuG:nth-child(2)::before {
    content: "Secondary";
}

.colorwayCreator-colorPreviews>.colorSwatch-2UxEuG:nth-child(3)::before {
    content: "Tertiary";
}

.colorwayCreator-colorPreviews>.colorSwatch-2UxEuG:nth-child(4)::before {
    content: "Accent";
}

.colorwayCreator-colorPreviews>.colorSwatch-2UxEuG:has(.editPencilIcon-22tRaH>path[fill="var(--primary-530)"])::before {
    color: var(--primary-530);
}

.colorwaySelector-noDisplay {
    display: none;
}

.colorwayInfo-wrapper {
    display: flex;
    flex-direction: column;
    color: var(--header-primary);
}

.colorwayInfo-colorSwatches {
    width: 100%;
    height: 46px;
    display: flex;
    flex-direction: row;
    margin: 12px 0;
    gap: 8px;
}

.colorwayInfo-colorSwatch {
    display: flex;
    width: 100%;
    height: 46px;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
}

.colorwayInfo-row {
    font-weight: 400;
    font-size: 20px;
    color: var(--header-secondary);
    margin-bottom: 4px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border-radius: 4px;
    background-color: var(--background-secondary);
    padding: 8px 12px;
}

.colorwayInfo-css {
    flex-direction: column;
    align-items: start;
}

.colorwayInfo-cssCodeblock {
    border-radius: 4px;
    border: 1px solid var(--background-accent);
    padding: 3px 6px;
    white-space: pre;
    max-height: 400px;
    overflow: auto;
    font-size: 0.875rem;
    line-height: 1.125rem;
    width: 100%;
    box-sizing: border-box;
}

.colorwayInfo-cssCodeblock::-webkit-scrollbar,
.colorwayToolbox-itemList::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.colorwayInfo-cssCodeblock::-webkit-scrollbar-corner,
.colorwayToolbox-itemList::-webkit-scrollbar-corner {
    background-color: transparent;
}

.colorwayInfo-cssCodeblock::-webkit-scrollbar-thumb,
.colorwayToolbox-itemList::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-auto-thumb);
    min-height: 40px;
}

.colorwayInfo-cssCodeblock::-webkit-scrollbar-thumb,
.colorwayInfo-cssCodeblock::-webkit-scrollbar-track,
.colorwayToolbox-itemList::-webkit-scrollbar-thumb,
.colorwayToolbox-itemList::-webkit-scrollbar-track {
    border: 2px solid transparent;
    background-clip: padding-box;
    border-radius: 8px;
}

.colorwayInfo-cssCodeblock::-webkit-scrollbar-track,
.colorwayToolbox-itemList::-webkit-scrollbar-track {
    margin-bottom: 8px;
}

.colorwaysCreator-settingCat {
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 5px;
    border-radius: 4px;
    background-color: var(--background-secondary);
    box-sizing: border-box;
    color: var(--header-secondary);
    max-height: 250px;
    overflow: hidden overlay;
}

.colorwaysCreator-settingItm {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    border-radius: 4px;
    cursor: pointer;
    box-sizing: border-box;
    padding: 8px;
    justify-content: space-between;
}

.colorwaysCreator-settingItm:hover {
    background-color: var(--background-modifier-hover);
}

.colorwaysCreator-settingsList .colorwaysCreator-settingItm {
    justify-content: start;
    gap: 8px;
}

.colorwaysCreator-settingCat-collapsed>.colorwaysCreator-settingItm:not(.colorwaysCreator-settingHeader),
.colorwaysCreator-settingCat-collapsed>.colorwaysCreator-settingsList {
    display: none;
}

.colorwaysCreator-noHeader {
    margin-top: 12px;
    margin-bottom: 12px;
}

.colorwaysCreator-noMinHeight {
    min-height: unset;
    height: fit-content;
}

.colorwaysPreview-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 270px;
    flex: 1 0 auto;
    border-radius: 4px;
    overflow: hidden;
}

.colorwaysPreview-modal {
    max-width: unset !important;
    max-height: unset !important;
    width: fit-content;
    height: fit-content;
}

.colorwaysPreview-titlebar {
    height: 22px;
    width: 100%;
    display: flex;
    flex: 1 0 auto;
}

.colorwaysPreview-body {
    height: 100%;
    width: 100%;
    display: flex;
}

.colorwayPreview-guilds {
    width: 72px;
    height: 100%;
    display: flex;
    flex: 1 0 auto;
    padding-top: 4px;
    flex-direction: column;
}

.colorwayPreview-channels {
    width: 140px;
    height: 100%;
    display: flex;
    flex-direction: column-reverse;
    border-top-left-radius: 8px;
    flex: 1 0 auto;
}

.colorwaysPreview-wrapper:fullscreen .colorwayPreview-channels {
    width: 240px;
}

.colorwayPreview-chat {
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;
    flex-direction: column-reverse;
}

.colorwayPreview-userArea {
    width: 100%;
    height: 40px;
    display: flex;
    flex: 1 0 auto;
}

.colorwaysPreview-wrapper:fullscreen .colorwayPreview-userArea {
    height: 52px;
}

.colorwaysPreview {
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 5px;
    border-radius: 4px;
    background-color: var(--background-secondary);
    box-sizing: border-box;
    color: var(--header-secondary);
    overflow: hidden overlay;
    margin-bottom: 4px;
}

.colorwaysPreview-collapsed .colorwaysPreview-container {
    display: none;
}

.colorwayInfo-lastCat,
.colorwaysCreator-lastCat {
    margin-bottom: 12px;
}

.colorwayPreview-guild {
    width: 100%;
    margin-bottom: 8px;
    display: flex;
    justify-content: center;
}

.colorwayPreview-guildItem {
    cursor: pointer;
    width: 48px;
    height: 48px;
    border-radius: 50px;
    transition: .2s ease;
    display: flex;
    justify-content: center;
    align-items: center;
}

.colorwayPreview-guildItem:hover {
    border-radius: 16px;
}

.colorwayPreview-guildSeparator {
    width: 32px;
    height: 2px;
    opacity: .48;
    border-radius: 1px;
}

.colorwayToolbox-listItem {
    align-items: center;
    display: flex;
    border-radius: 4px;
    color: var(--interactive-normal);
    padding: 8px;
    margin: 0 -4px;
}

.colorwayToolbox-listItem:hover {
    background-color: var(--brand-experiment);
    color: var(--white-500);
    cursor: pointer;
}

.colorwayToolbox-title {
    align-items: center;
    display: flex;
    text-transform: uppercase;
    margin-top: 2px;
    padding-bottom: 8px;
    margin-bottom: 0;
}

.colorwayToolbox-list {
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.colorwayToolbox-itemList {
    overflow: hidden auto;
    height: 100%;
    padding: 12px;
    padding-top: 0;
}

.colorwayToolbox-search {
    margin: 12px;
    margin-bottom: 0;
}

.colorwayToolbox-itemList::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
}

.colorwayPreview-chatBox {
    height: 32px;
    border-radius: 6px;
    margin: 8px;
    margin-bottom: 12px;
    margin-top: 0;
    flex: 1 0 auto;
}

.colorwayPreview-filler {
    width: 100%;
    height: 100%;
}

.colorwayPreview-topShadow {
    box-shadow: 0 1px 0 hsl(var(--primary-900-hsl)/20%), 0 1.5px 0 hsl(var(--primary-860-hsl)/5%), 0 2px 0 hsl(var(--primary-900-hsl)/5%);
    width: 100%;
    height: 32px;
    flex: 1 0 auto;
    transition: background-color .1s linear;
    font-family: var(--font-display);
    font-weight: 500;
    padding: 12px 16px;
    box-sizing: border-box;
    align-items: center;
    display: flex;
}

.colorwayPreview-channels>.colorwayPreview-topShadow {
    border-top-left-radius: 8px;
}

.colorwayPreview-channels>.colorwayPreview-topShadow:hover {
    background-color: hsl(var(--primary-500-hsl)/30%);
}

.colorwaysPreview-wrapper:fullscreen .colorwayPreview-topShadow {
    height: 48px;
}

.colorwaysPreview-wrapper:fullscreen .colorwayPreview-chatBox {
    height: 44px;
    border-radius: 8px;
    margin: 16px;
    margin-bottom: 24px;
}

.colorwaysBtn-tooltipContent {
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
}

.colorwaySelector-headerIcon {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    transition: transform .1s ease-out, opacity .1s ease-out;
    color: var(--interactive-normal);
}

.colorwaySelector-header {
    align-items: center;
    justify-content: center;
    padding-bottom: 0;
    box-shadow: none !important;
}

.colorwaySelector-search {
    width: 100%;
    height: 32px;
}

.colorwaySelector-searchInput {
    height: 32px;
    border-radius: 50px;
    border: 1px solid transparent;
    transition: .15s ease;
    padding: 0 12px;
}

.colorwaySelector-searchInput:hover {
    border-color: transparent;
}

.colorwaySelector-headerBtn {
    position: absolute;
    top: 64px;
    right: 20px;
}

.colorwaySelector-pill {
    border-radius: 20px;
    background-color: var(--background-tertiary);
    border: 1px solid transparent;
    box-sizing: border-box;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    height: 32px;
    overflow: hidden;
    color: var(--text-normal);
    cursor: pointer;
    transition: .15s ease
}

.colorwaySelector-pillWrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.colorwaySelector-doublePillBar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}

.theme-light .colorwaySelector-pill_selected,
.theme-light .colorwaySelector-pill:hover,
.theme-light .colorwaySelector-searchInput:focus {
    border-color: var(--brand-500);
    background-color: var(--brand-experiment-160);
}

.theme-dark .colorwaySelector-pill_selected,
.theme-dark .colorwaySelector-pill:hover,
.theme-dark .colorwaySelector-searchInput:focus {
    border-color: var(--brand-500);
    background-color: var(--brand-experiment-15a);
}

.colorwaysTooltip-tooltipPreviewRow {
    display: flex;
    align-items: center;
    margin-top: 8px;
}

.colorwaysTooltip-header {
    background-color: var(--background-primary);
    padding: 2px 8px;
    border-radius: 16px;
    height: min-content;
    color: var(--header-primary);
    margin-bottom: 2px;
    display: inline-flex;
    margin-left: -4px;
}

.colorwaySelector-pillSeparator {
    height: 24px;
    width: 1px;
    background-color: var(--primary-400);
}

.colorwaysSelector-infoRow {
    display: flex;
    justify-content: center;
    width: 100%;
    flex-direction: column;
}

.colorwaysSelector-changelog {
    font-weight: 400;
    font-size: 20px;
    color: var(--header-secondary);
    border-radius: 4px;
    background-color: var(--background-secondary);
    padding: 8px 12px;
}

.colorwaysChangelog-li {
    position: relative;
    font-size: 16px;
    line-height: 20px;
}

.colorwaysChangelog-li::before {
    content: "";
    position: absolute;
    top: 10px;
    left: -15px;
    width: 6px;
    height: 6px;
    margin-top: -4px;
    margin-left: -3px;
    border-radius: 50%;
    opacity: .3;
}

.theme-dark .colorwaysChangelog-li::before {
    background-color: hsl(216deg calc(var(--saturation-factor, 1)*9.8%) 90%);
}

.theme-light .colorwaysChangelog-li::before {
    background-color: hsl(223deg calc(var(--saturation-factor, 1)*5.8%) 52.9%);
}

.ColorwaySelectorWrapper .colorwayToolbox-list {
    width: 100%;
}

.ColorwaySelectorWrapper .colorwayToolbox-list .colorwaysToolbox-label {
    border-radius: 20px;
    box-sizing: border-box;
    color: var(--text-normal);
    transition: .15s ease;
    width: 100%;
    margin-left: 0;
    height: fit-content;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: wrap;
    cursor: default;
    max-height: 2rem;
    padding: 0 8px;
}

.ColorwaySelectorWrapper .colorwayToolbox-itemList {
    padding: 0;
    overflow: visible !important;
    display: flex;
    flex-wrap: wrap;
    gap: 16px 0;
}

.ColorwaySelectorWrapper .colorwayToolbox-listItem {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: transparent !important;
    width: calc(564px / 4);
    cursor: default;
    float: left;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.ColorwaySelectorWrapper .colorwayToolbox-listItem .bi {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background-color: var(--background-tertiary);
    border: 1px solid transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: .15s ease;
    cursor: pointer;
    color: var(--interactive-normal);
}

.ColorwaySelectorWrapper .colorwayToolbox-listItem:hover {
    color: var(--interactive-normal) !important;
}

.ColorwaySelectorWrapper .colorwayToolbox-list .colorwayToolbox-listItem .bi:hover {
    border-color: var(--brand-500);
    background-color: var(--brand-experiment-15a);
    color: var(--interactive-hover) !important;
}

.colorwaysSelector-changelogHeader {
    font-weight: 700;
    font-size: 16px;
    line-height: 20px;
    text-transform: uppercase;
    position: relative;
    display: flex;
    align-items: center;
}

.colorwaysSelector-changelogHeader::after {
    content: "";
    height: 1px;
    flex: 1 1 auto;
    margin-left: 4px;
    opacity: .6;
    background-color: currentcolor;
}

.colorwaysSelector-changelogHeader_added {
    color: var(--text-positive);
}

.colorwaysSelector-changelogHeader_fixed {
    color: hsl(359deg calc(var(--saturation-factor, 1)*87.3%) 59.8%);
}

.colorwaysSelector-changelogHeader_changed {
    color: var(--text-warning);
}
`;

const fallbackColorways = [
    {
        "name": "Keyboard Purple",
        "original": false,
        "accent": "hsl(235 85.6% 64.7%)",
        "primary": "#222456",
        "secondary": "#1c1f48",
        "tertiary": "#080d1d",
        "import": "@import url(//dablulite.github.io/DiscordColorways/KeyboardPurple/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Eclipse",
        "original": false,
        "accent": "hsl(87 85.6% 64.7%)",
        "primary": "#000000",
        "secondary": "#181818",
        "tertiary": "#0a0a0a",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Eclipse/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Cyan",
        "original": false,
        "accent": "#009f88",
        "primary": "#202226",
        "secondary": "#1c1e21",
        "tertiary": "#141517",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Cyan/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Spotify",
        "original": false,
        "accent": "hsl(141 76% 48%)",
        "primary": "#121212",
        "secondary": "#090909",
        "tertiary": "#090909",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Spotify/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Bright n' Blue",
        "original": true,
        "accent": "hsl(234, 68%, 33%)",
        "primary": "#394aae",
        "secondary": "#29379d",
        "tertiary": "#1b278d",
        "import": "@import url(//dablulite.github.io/DiscordColorways/BrightBlue/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Still Young",
        "original": true,
        "accent": "hsl(58 85.6% 89%)",
        "primary": "#443a31",
        "secondary": "#7c3d3e",
        "tertiary": "#207578",
        "import": "@import url(//dablulite.github.io/DiscordColorways/StillYoung/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Sea",
        "original": true,
        "accent": "hsl(184, 100%, 50%)",
        "primary": "#07353b",
        "secondary": "#0b5e60",
        "tertiary": "#08201d",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Sea/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Lava",
        "original": true,
        "accent": "hsl(4, 80.4%, 32%)",
        "primary": "#401b17",
        "secondary": "#351917",
        "tertiary": "#230b0b",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Lava/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Solid Pink",
        "original": true,
        "accent": "hsl(340, 55.2%, 56.3%)",
        "primary": "#1e151c",
        "secondary": "#21181f",
        "tertiary": "#291e27",
        "import": "@import url(//dablulite.github.io/DiscordColorways/SolidPink/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Sand",
        "original": true,
        "accent": "hsl(41, 31%, 45%)",
        "primary": "#7f6c43",
        "secondary": "#665b33",
        "tertiary": "#5c5733",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Sand/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "AMOLED",
        "original": true,
        "accent": "hsl(235 85.6% 64.7%)",
        "primary": "#000000",
        "secondary": "#000000",
        "tertiary": "#000000",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Amoled/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Zorin",
        "original": false,
        "accent": "hsl(200, 89%, 86%)",
        "primary": "#171d20",
        "secondary": "#171d20",
        "tertiary": "#1e2529",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Zorin/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Desaturated",
        "original": false,
        "accent": "hsl(227, 58%, 65%)",
        "primary": "#35383d",
        "secondary": "#2c2f34",
        "tertiary": "#1e1f24",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Desaturated/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Crimson",
        "original": false,
        "accent": "hsl(0, 100%, 50%)",
        "primary": "#050000",
        "secondary": "#0a0000",
        "tertiary": "#0f0000",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Crimson/import.css);",
        "author": "Riddim_GLiTCH",
        "authorID": "801089753038061669"
    },
    {
        "name": "Jupiter",
        "original": true,
        "accent": "#ffd89b",
        "primary": "#ffd89b",
        "secondary": "#19547b",
        "tertiary": "#1e1f22",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Jupiter/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594",
        "isGradient": true,
        "colors": ["accent", "primary", "secondary"]
    },
    {
        "name": "Neon Candy",
        "original": true,
        "accent": "#FC00FF",
        "primary": "#00DBDE",
        "secondary": "#00DBDE",
        "tertiary": "#00DBDE",
        "import": "@import url(//dablulite.github.io/DiscordColorways/NeonCandy/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594",
        "isGradient": true,
        "colors": ["accent", "primary"]
    },
    {
        "name": "Wildberry",
        "original": false,
        "accent": "#f40172",
        "primary": "#180029",
        "secondary": "#340057",
        "tertiary": "#4b007a",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Wildberry/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Facebook",
        "original": false,
        "accent": "#2375e1",
        "primary": "#18191a",
        "secondary": "#242526",
        "tertiary": "#3a3b3c",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Facebook/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Material You",
        "original": false,
        "accent": "#004977",
        "primary": "#1f1f1f",
        "secondary": "#28292a",
        "tertiary": "#2d2f31",
        "import": "@import url(//dablulite.github.io/DiscordColorways/MaterialYou/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "Discord Teal",
        "original": false,
        "accent": "#175f6d",
        "primary": "#313338",
        "secondary": "#2b2d31",
        "tertiary": "#1e1f22",
        "import": "@import url(//dablulite.github.io/css-snippets/DiscordTeal/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594",
        "colors": ["accent"]
    },
    {
        "name": "黄昏の花 (Twilight Blossom)",
        "original": true,
        "accent": "#e100ff",
        "primary": "#04000a",
        "secondary": "#0b0024",
        "tertiary": "#210042",
        "import": "@import url(//dablulite.github.io/DiscordColorways/TwilightBlossom/import.css);",
        "author": "Riddim_GLiTCH",
        "authorID": "801089753038061669"
    },
    {
        "name": "Chai",
        "original": true,
        "accent": "#59cd51",
        "primary": "#1c1e15",
        "secondary": "#1e2118",
        "tertiary": "#24291e",
        "import": "@import url(//dablulite.github.io/DiscordColorways/Chai/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    },
    {
        "name": "CS1.6",
        "original": false,
        "accent": "#929a8d",
        "primary": "#3f4738",
        "secondary": "#5b6c51",
        "tertiary": "#4d5945",
        "import": "@import url(//dablulite.github.io/DiscordColorways/CS16/import.css);",
        "author": "DaBluLite",
        "authorID": "582170007505731594"
    }
];

function generateCss(primaryColor, secondaryColor, tertiaryColor, accentColor, tintedText) {
    const colorwayCss = `/*Automatically Generated - Colorway Creator V${plugin.creatorVersion}*/
:root {
    --brand-100-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + (3.6 * 13)), 100)}%;
    --brand-130-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + (3.6 * 12)), 100)}%;
    --brand-160-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + (3.6 * 11)), 100)}%;
    --brand-200-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + (3.6 * 10)), 100)}%;
    --brand-230-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + (3.6 * 9)), 100)}%;
    --brand-260-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + (3.6 * 8)), 100)}%;
    --brand-300-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + (3.6 * 7)), 100)}%;
    --brand-330-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + (3.6 * 6)), 100)}%;
    --brand-345-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + (3.6 * 5)), 100)}%;
    --brand-360-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + (3.6 * 4)), 100)}%;
    --brand-400-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + (3.6 * 3)), 100)}%;
    --brand-430-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + (3.6 * 2)), 100)}%;
    --brand-460-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.min(Math.round(HexToHSL("#" + accentColor)[2] + 3.6), 100)}%;
    --brand-500-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${HexToHSL("#" + accentColor)[2]}%;
    --brand-530-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round(HexToHSL("#" + accentColor)[2] - 3.6), 0)}%;
    --brand-560-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round(HexToHSL("#" + accentColor)[2] - (3.6 * 2)), 0)}%;
    --brand-600-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round(HexToHSL("#" + accentColor)[2] - (3.6 * 3)), 0)}%;
    --brand-630-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round(HexToHSL("#" + accentColor)[2] - (3.6 * 4)), 0)}%;
    --brand-660-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round(HexToHSL("#" + accentColor)[2] - (3.6 * 5)), 0)}%;
    --brand-700-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round(HexToHSL("#" + accentColor)[2] - (3.6 * 6)), 0)}%;
    --brand-730-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round(HexToHSL("#" + accentColor)[2] - (3.6 * 7)), 0)}%;
    --brand-760-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round(HexToHSL("#" + accentColor)[2] - (3.6 * 8)), 0)}%;
    --brand-800-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round(HexToHSL("#" + accentColor)[2] - (3.6 * 9)), 0)}%;
    --brand-830-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round(HexToHSL("#" + accentColor)[2] - (3.6 * 10)), 0)}%;
    --brand-860-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round(HexToHSL("#" + accentColor)[2] - (3.6 * 11)), 0)}%;
    --brand-900-hsl: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${Math.max(Math.round(HexToHSL("#" + accentColor)[2] - (3.6 * 12)), 0)}%;
    --primary-800-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + (3.6 * 2), 100)}%;
    --primary-730-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + 3.6, 100)}%;
    --primary-700-hsl: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${HexToHSL("#" + tertiaryColor)[2]}%;
    --primary-660-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${Math.min(HexToHSL("#" + secondaryColor)[2] + 3.6, 100)}%;
    --primary-645-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.max(HexToHSL("#" + primaryColor)[2] - 5, 0)}%;
    --primary-630-hsl: ${HexToHSL("#" + secondaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + secondaryColor)[1]}%) ${HexToHSL("#" + secondaryColor)[2]}%;
    --primary-600-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%;
    --primary-560-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + 3.6, 100)}%;
    --primary-530-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + (3.6 * 2), 100)}%;
    --primary-500-hsl: ${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${Math.min(HexToHSL("#" + primaryColor)[2] + (3.6 * 3), 100)}%;${tintedText ? `\n    --primary-460-hsl: 0 calc(var(--saturation-factor, 1)*0%) 50%;
    --primary-430: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : ((HexToHSL("#" + secondaryColor)[2] < 80) ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 90%)" : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)")};
    --primary-400: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : ((HexToHSL("#" + secondaryColor)[2] < 80) ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 90%)" : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)")};
    --primary-360: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : ((HexToHSL("#" + secondaryColor)[2] < 80) ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 90%)" : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)")};` : ""}
}
.emptyPage-2TGR7j,
.scrollerContainer-y16Rs9,
.container-2IKOsH,
.header-3xB4vB {
    background-color: unset !important;
}${(Math.round(HexToHSL("#" + primaryColor)[2]) > 80) ? `\n\n/*Primary*/
.theme-dark .container-2cd8Mz,
.theme-dark .body-16rSsp,
.theme-dark .toolbar-3_r2xA,
.theme-dark .container-89zvna,
.theme-dark .messageContent-2t3eCI,
.theme-dark .attachButtonPlus-3IYelE,
.theme-dark .username-h_Y3Us:not([style]),
.theme-dark .children-3xh0VB,
.theme-dark .buttonContainer-1502pf,
.theme-dark .listItem-3SmSlK,
.theme-dark .body-16rSsp .caret-1le2LN,
.theme-dark .body-16rSsp .titleWrapper-24Kyzc > h1,
.theme-dark .body-16rSsp .icon-2xnN2Y {
    --white-500: black !important;
    --interactive-normal: black !important;
    --text-normal: black !important;
    --text-muted: black !important;
    --header-primary: black !important;
    --header-secondary: black !important;
}

.theme-dark .contentRegionScroller-2_GT_N :not(.mtk1,.mtk2,.mtk3,.mtk4,.mtk5,.mtk6,.mtk7,.mtk8,.mtk9,.monaco-editor .line-numbers) {
    --white-500: black !important;
}

.theme-dark .container-1um7CU,
.theme-dark .container-2IKOsH,
.theme-dark .header-3xB4vB {
    background: transparent;
}

.theme-dark .container-ZMc96U {
    --channel-icon: black;
}

.theme-dark .callContainer-HtHELf {
    --white-500: ${(HexToHSL("#" + tertiaryColor)[2] > 80) ? "black" : "white"} !important;
}

.theme-dark .channelTextArea-1FufC0 {
    --text-normal: ${(HexToHSL("#" + primaryColor)[2] + 3.6 > 80) ? "black" : "white"};
}

.theme-dark .placeholder-1rCBhr {
    --channel-text-area-placeholder: ${(HexToHSL("#" + primaryColor)[2] + 3.6 > 80) ? "black" : "white"};
    opacity: .6;
}

.theme-dark .colorwaySelectorIcon {
    background-color: black;
}

.theme-dark .root-1CAIjD > .header-1ffhsl > h1 {
    color: black;
}
/*End Primary*/`: ""}${(HexToHSL("#" + secondaryColor)[2] > 80) ? `\n\n/*Secondary*/
.theme-dark .wrapper-2RrXDg *,
.theme-dark .sidebar-1tnWFu *:not(.hasBanner-2IrYih *),
.theme-dark .members-3WRCEx *:not([style]),
.theme-dark .sidebarRegionScroller-FXiQOh *,
.theme-dark .header-1XpmZs,
.theme-dark .lookFilled-1H2Jvj.colorPrimary-2-Lusz {
    --white-500: black !important;
    --channels-default: black !important;
    --channel-icon: black !important;
    --interactive-normal: var(--white-500);
    --interactive-hover: var(--white-500);
    --interactive-active: var(--white-500);
}

.theme-dark .channelRow-4X_3fi {
    background-color: var(--background-secondary);
}

.theme-dark .channelRow-4X_3fi * {
    --channel-icon: black;
}

.theme-dark #app-mount .activity-2EQDZv {
    --channels-default: var(--white-500) !important;
}

.theme-dark .nameTag-sc-gpq {
    --header-primary: black !important;
    --header-secondary: ${HexToHSL("#" + secondaryColor)[0] === 0 ? "gray" : ((HexToHSL("#" + secondaryColor)[2] < 80) ? "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 90%)" : "hsl(" + HexToHSL("#" + secondaryColor)[0] + ", calc(var(--saturation-factor, 1)*100%), 20%)")} !important;
}

.theme-dark .bannerVisible-Vkyg1I .headerContent-2SNbie {
    color: #fff;
}

.theme-dark .embedFull-1HGV2S {
    --text-normal: black;
}
/*End Secondary*/`: ""}${HexToHSL("#" + tertiaryColor)[2] > 80 ? `\n\n/*Tertiary*/
.theme-dark .winButton-3UMjdg,
.theme-dark .searchBar-2aylmZ *,
.theme-dark .wordmarkWindows-2dq6rw,
.theme-dark .searchBar-jGtisZ *,
.theme-dark .searchBarComponent-3N7dCG {
    --white-500: black !important;
}

.theme-dark [style="background-color: var(--background-secondary);"] {
    color: ${HexToHSL("#" + secondaryColor)[2] > 80 ? "black" : "white"};
}

.theme-dark .popout-TdhJ6Z > *,
.theme-dark .colorwayHeaderTitle {
    --interactive-normal: black !important;
    --header-secondary: black !important;
}

.theme-dark .tooltip-33Jwqe {
    --text-normal: black !important;
}
/*End Tertiary*/`: ""}${HexToHSL("#" + accentColor)[2] > 80 ? `\n\n/*Accent*/
.selected-2r1Hvo *,
.selected-1Drb7Z *,
#app-mount .lookFilled-1H2Jvj.colorBrand-2M3O3N:not(.buttonColor-3bP3fX),
.colorDefault-2_rLdz.focused-3LIdPu,
.row-1qtctT:hover,
.colorwayInfoIcon,
.colorwayCheckIcon {
    --white-500: black !important;
}

.ColorwaySelectorBtn:hover .colorwaySelectorIcon {
    background-color: black !important;
}

:root {
    --mention-foreground: black !important;
}
/*End Accent*/`: ""}`;
    return colorwayCss;
}

function getPreset(primaryColor, secondaryColor, tertiaryColor, accentColor) {
    function cyan() {
        return `:root {
    --cyan-accent-color: ${"#" + accentColor};
    --cyan-background-primary: hsl(${HexToHSL("#" + primaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + primaryColor)[1]}%) ${HexToHSL("#" + primaryColor)[2]}%/40%);
    --cyan-background-secondary: hsl(${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min(HexToHSL("#" + tertiaryColor)[2] + (3.6 * 2), 100)}%);
}`;
    }

    function virtualBoy() {
        return `:root {
    --VBaccent: ${HexToHSL("#" + accentColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + accentColor)[1]}%) ${HexToHSL("#" + accentColor)[2]}%;
    --VBaccent-muted: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.max(((HexToHSL("#" + tertiaryColor)[2]) - 10), 0)}%;
    --VBaccent-dimmest: ${HexToHSL("#" + tertiaryColor)[0]} calc(var(--saturation-factor, 1)*${HexToHSL("#" + tertiaryColor)[1]}%) ${Math.min((HexToHSL("#" + tertiaryColor)[2] + (3.6 * 5) - 3), 100)}%;
}`;
    }

    return {
        cyan: {
            name: "Cyan",
            preset: cyan
        },
        virtualBoy: {
            name: "Virtual Boy",
            preset: virtualBoy
        }
    };
}

function HexToHSL(H) {
    let r = 0, g = 0, b = 0;
    if (H.length === 4) r = "0x" + H[1] + H[1], g = "0x" + H[2] + H[2], b = "0x" + H[3] + H[3];
    else if (H.length === 7) r = "0x" + H[1] + H[2], g = "0x" + H[3] + H[4], b = "0x" + H[5] + H[6];
    r /= 255, g /= 255, b /= 255;
    var cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;
    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    l = (cmax + cmin) / 2, s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1)), s = +(s * 100).toFixed(1), l = +(l * 100).toFixed(1);

    return [Math.round(h), Math.round(s), Math.round(l)];
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
    "green-100",
];

var pluginCSSElem = document.createElement("style");
pluginCSSElem.textContent = pluginCSS;
document.head.append(pluginCSSElem);

dataStore.getMany(["actveColorway", "actveColorwayID"]).then(store => {
    colorwayCSS.set(store[0], store[1]);
});

dataStore.get("colorwaySourceFiles").then(e => { if (!e) dataStore.set("colorwaySourceFiles", ["https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json"]); });
dataStore.get("customColorways").then(e => { if (!e) dataStore.set("customColorways", []); });

function ColorwaySelectorBtn() {
    return React.createElement(Tooltip, { text: "Colorways", position: "right", tooltipContentClassName: "colorwaysBtn-tooltipContent", shouldShowTooltip: true },
        ({ onMouseEnter, onMouseLeave }) => {
            return React.createElement("div", {
                className: "ColorwaySelectorBtnContainer",
            },
                React.createElement("div", {
                    className: "ColorwaySelectorBtn",
                    onClick: () => openModal(props => React.createElement(SelectorModal, { modalProps: props })),
                    onContextMenu: () => openModal(props => React.createElement(SelectorModal, { modalProps: props, visibleTabProps: "toolbox" })),
                    onMouseEnter: onMouseEnter,
                    onMouseLeave: onMouseLeave
                }, React.createElement("div", { className: "colorwaySelectorIcon" }))
            );
        }
    );
};

function canonicalizeMatch(match) {
    if (typeof match === "string") return match;
    const canonSource = match.source
        .replaceAll("\\i", "[A-Za-z_$][\\w$]*");
    return new RegExp(canonSource, match.flags);
}

async function extractAndRequireModuleIds(code) {
    const chunksAndModule = code.toString()
        .match(canonicalizeMatch(/Promise\.all\(\[((?:\i\.\i\(\d+\),?)+)\]\).then\(\i\.bind\(\i,(\d+)\)\)/));

    if (!chunksAndModule) throw new Error("Couldn't extract anything of relevance");
    else if (!chunksAndModule[1]) throw new Error("Couldn't extract any chunk requires");
    else if (!chunksAndModule[2]) throw new Error("Couldn't extract module ID");

    const chunkIds = Array.from(chunksAndModule[1].matchAll(/(\d+)/g)).map(cId => parseInt(cId[0]));
    const moduleId = parseInt(chunksAndModule[2]);

    return Promise.all(chunkIds.map(i => _mods_unparsed.e(i))).then(_mods_unparsed.bind(_mods_unparsed, moduleId));
}

function CloseIcon({
    height = 24,
    width = 24,
    viewboxX = width,
    viewboxY = height,
    className,
    style
}) {
    return React.createElement(
        "svg",
        {
            "aria-label": "Clear",
            "aria-hidden": "false",
            role: "img",
            className: className,
            width: width,
            height: height,
            viewBox: `0 0 ${viewboxX} ${viewboxY}`,
            style: style
        },
        React.createElement("path", {
            fill: "currentColor",
            d: "M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
        })
    );
}

function SearchIcon({
    height = 24,
    width = 24,
    viewboxX = width,
    viewboxY = height,
    className,
    style
}) {
    return React.createElement(
        "svg",
        {
            className: className,
            "aria-label": "Search",
            "aria-hidden": "false",
            role: "img",
            width: width,
            height: height,
            viewBox: `0 0 ${viewboxX} ${viewboxY}`,
            style: style
        },
        React.createElement("path", {
            fill: "currentColor",
            d: "M21.707 20.293L16.314 14.9C17.403 13.504 18 11.799 18 10C18 7.863 17.167 5.854 15.656 4.344C14.146 2.832 12.137 2 10 2C7.863 2 5.854 2.832 4.344 4.344C2.833 5.854 2 7.863 2 10C2 12.137 2.833 14.146 4.344 15.656C5.854 17.168 7.863 18 10 18C11.799 18 13.504 17.404 14.9 16.314L20.293 21.706L21.707 20.293ZM10 16C8.397 16 6.891 15.376 5.758 14.243C4.624 13.11 4 11.603 4 10C4 8.398 4.624 6.891 5.758 5.758C6.891 4.624 8.397 4 10 4C11.603 4 13.109 4.624 14.242 5.758C15.376 6.891 16 8.398 16 10C16 11.603 15.376 13.11 14.242 14.243C13.109 15.376 11.603 16 10 16Z"
        })
    );
}

function CreatorModal({ modalProps, loadUIProps }) {
    const [colorwayName, setColorwayName] = React.useState("");
    const [accentColor, setAccentColor] = React.useState("5865f2");
    const [primaryColor, setPrimaryColor] = React.useState("313338");
    const [secondaryColor, setSecondaryColor] = React.useState("2b2d31");
    const [tertiaryColor, setTertiaryColor] = React.useState("1e1f22");
    const [preset, setPreset] = React.useState("default");
    const [collapsedSettings, setCollapsedSettings] = React.useState(true);
    const [tintedText, setTintedText] = React.useState(true);
    const [collapsedPresets, setCollapsedPresets] = React.useState(true);
    const ColorPicker = findByCode("showEyeDropper") || (() => { return React.createElement(Text, { variant: "heading-lg/semibold", tag: "h3", className: "colorways-creator-module-warning" }, "Module is lazyloaded, open Settings first"); });
    return React.createElement(ModalRoot, { ...modalProps, className: "colorwayCreator-modal" }, [
        React.createElement(ModalHeader, null,
            React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Create Colorway")
        ),
        React.createElement(ModalContent, { className: "colorwayCreator-menuWrapper" }, [
            React.createElement(FormTitle, { style: { marginBottom: 0 } }, "Name:"),
            React.createElement(TextInput, {
                placeholder: "Give your Colorway a name",
                value: colorwayName,
                onChange: setColorwayName
            }),
            React.createElement(FormTitle, { style: { marginBottom: 0 } }, "Colors:"),
            React.createElement("div", { className: "colorwayCreator-colorPreviews" }, [
                React.createElement(ColorPicker, {
                    color: parseInt(primaryColor, 16),
                    onChange: (color) => {
                        let hexColor = color.toString(16);
                        while (hexColor.length < 6) {
                            hexColor = "0" + hexColor;
                        }
                        setPrimaryColor(hexColor);
                    },
                    showEyeDropper: true,
                    suggestedColors: [
                        "#313338",
                        "#2b2d31",
                        "#1e1f22",
                        "#5865f2",
                    ]
                }),
                React.createElement(ColorPicker, {
                    color: parseInt(secondaryColor, 16),
                    onChange: (color) => {
                        let hexColor = color.toString(16);
                        while (hexColor.length < 6) {
                            hexColor = "0" + hexColor;
                        }
                        setSecondaryColor(hexColor);
                    },
                    showEyeDropper: true,
                    suggestedColors: [
                        "#313338",
                        "#2b2d31",
                        "#1e1f22",
                        "#5865f2",
                    ]
                }),
                React.createElement(ColorPicker, {
                    color: parseInt(tertiaryColor, 16),
                    onChange: (color) => {
                        let hexColor = color.toString(16);
                        while (hexColor.length < 6) {
                            hexColor = "0" + hexColor;
                        }
                        setTertiaryColor(hexColor);
                    },
                    showEyeDropper: true,
                    suggestedColors: [
                        "#313338",
                        "#2b2d31",
                        "#1e1f22",
                        "#5865f2",
                    ]
                }),
                React.createElement(ColorPicker, {
                    color: parseInt(accentColor, 16),
                    onChange: (color) => {
                        let hexColor = color.toString(16);
                        while (hexColor.length < 6) {
                            hexColor = "0" + hexColor;
                        }
                        setAccentColor(hexColor);
                    },
                    showEyeDropper: true,
                    suggestedColors: [
                        "#313338",
                        "#2b2d31",
                        "#1e1f22",
                        "#5865f2",
                    ]
                })
            ]),
            React.createElement("div", { className: `colorwaysCreator-settingCat${collapsedSettings ? " colorwaysCreator-settingCat-collapsed" : ""}` }, [
                React.createElement("div", { className: "colorwaysCreator-settingItm colorwaysCreator-settingHeader", onClick: () => collapsedSettings ? setCollapsedSettings(false) : setCollapsedSettings(true) }, [
                    React.createElement(FormTitle, { style: { marginBottom: 0 } }, "Settings"),
                    React.createElement("svg", { className: "expand-3Nh1P5 transition-30IQBn directionDown-2w0MZz", width: "24", height: "24", viewBox: "0 0 24 24", "aria-hidden": "true", role: "img" },
                        React.createElement("path", { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", d: "M7 10L12 15 17 10", "aria-hidden": "true" })
                    )
                ]),
                React.createElement("div", { className: "colorwaysCreator-settingItm" }, [
                    React.createElement(Text, { variant: "eyebrow", tag: "h5" }, "Use colored text"),
                    React.createElement(Switch, { value: tintedText, onChange: setTintedText, hideBorder: true, style: { marginBottom: 0 } })
                ])
            ]),
            React.createElement("div", { className: `colorwaysCreator-settingCat${collapsedPresets ? " colorwaysCreator-settingCat-collapsed" : ""}` }, [
                React.createElement("div", { className: "colorwaysCreator-settingItm colorwaysCreator-settingHeader", onClick: () => collapsedPresets ? setCollapsedPresets(false) : setCollapsedPresets(true) }, [
                    React.createElement(FormTitle, { style: { marginBottom: 0 } }, "Presets"),
                    React.createElement("svg", { className: "expand-3Nh1P5 transition-30IQBn directionDown-2w0MZz", width: "24", height: "24", viewBox: "0 0 24 24", "aria-hidden": "true", role: "img" },
                        React.createElement("path", { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", d: "M7 10L12 15 17 10", "aria-hidden": "true" })
                    )
                ]),
                React.createElement("div", { className: "colorwaysCreator-settingsList" }, [
                    React.createElement("div", { className: "colorwaysCreator-settingItm", onClick: () => setPreset("default") }, [
                        React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" },
                            React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }),
                            preset === "default" ? React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" }) : null
                        ),
                        React.createElement(Text, { variant: "eyebrow", tag: "h5" }, "Default")
                    ]),
                    React.createElement("div", { className: "colorwaysCreator-settingItm", onClick: () => setPreset("cyan") }, [
                        React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" },
                            React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }),
                            preset === "cyan" ? React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" }) : null
                        ),
                        React.createElement(Text, { variant: "eyebrow", tag: "h5" }, "Cyan")
                    ]),
                    React.createElement("div", { className: "colorwaysCreator-settingItm", onClick: () => setPreset("virtualBoy") }, [
                        React.createElement("svg", { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" },
                            React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", fill: "currentColor" }),
                            preset === "virtualBoy" ? React.createElement("circle", { cx: "12", cy: "12", r: "5", className: "radioIconForeground-3wH3aU", fill: "currentColor" }) : null
                        ),
                        React.createElement(Text, { variant: "eyebrow", tag: "h5" }, "Virtual Boy")
                    ])
                ])
            ])
        ]),
        React.createElement(ModalFooter, null, [
            React.createElement(Button, {
                style: { marginLeft: 8 },
                color: Button.Colors.BRAND,
                size: Button.Sizes.MEDIUM,
                look: Button.Looks.FILLED,
                onClick: e => {
                    var customColorwayCSS = "";
                    if (preset === "default") {
                        customColorwayCSS = generateCss(primaryColor, secondaryColor, tertiaryColor, accentColor, tintedText);
                    } else {
                        customColorwayCSS = getPreset(primaryColor, secondaryColor, tertiaryColor, accentColor)[preset].preset();
                    }
                    const customColorway = {
                        name: (colorwayName || "Colorway") + (preset === "default" ? "" : ": Made for " + getPreset()[preset].name),
                        import: customColorwayCSS,
                        accent: "#" + accentColor,
                        primary: "#" + primaryColor,
                        secondary: "#" + secondaryColor,
                        tertiary: "#" + tertiaryColor,
                        author: UserStore.getCurrentUser().username,
                        authorID: UserStore.getCurrentUser().id
                    };
                    const customColorwaysArray = [customColorway];
                    dataStore.get("customColorways").then(customColorways => {
                        customColorways.forEach((color, i) => {
                            if (color.name !== customColorway.name) {
                                customColorwaysArray.push(color);
                            }
                        });
                        dataStore.set("customColorways", customColorwaysArray);
                    });
                    modalProps.onClose();
                    if (loadUIProps) {
                        loadUIProps();
                    }
                }
            }, "Finish"),
            React.createElement(Button, {
                style: { marginLeft: 8 },
                color: Button.Colors.PRIMARY,
                size: Button.Sizes.MEDIUM,
                look: Button.Looks.FILLED,
                onClick: () => {
                    function getHex(str) {
                        return Object.assign(document.createElement("canvas").getContext("2d"), { fillStyle: str }).fillStyle;
                    }
                    setPrimaryColor(getHex(getComputedStyle(document.body).getPropertyValue("--background-primary")).split("#")[1]);
                    setSecondaryColor(getHex(getComputedStyle(document.body).getPropertyValue("--background-secondary")).split("#")[1]);
                    setTertiaryColor(getHex(getComputedStyle(document.body).getPropertyValue("--background-tertiary")).split("#")[1]);
                    setAccentColor(getHex(getComputedStyle(document.body).getPropertyValue("--brand-experiment")).split("#")[1]);
                }
            }, "Copy Current Colors"),
            React.createElement(Button, {
                style: { marginLeft: 8 },
                color: Button.Colors.PRIMARY,
                size: Button.Sizes.MEDIUM,
                look: Button.Looks.FILLED,
                onClick: () => {
                    let colorwayID = "";
                    function setColorwayID(e) {
                        colorwayID = e;
                    }
                    const hexToString = (hex) => {
                        let str = "";
                        for (let i = 0; i < hex.length; i += 2) {
                            const hexValue = hex.substr(i, 2);
                            const decimalValue = parseInt(hexValue, 16);
                            str += String.fromCharCode(decimalValue);
                        }
                        return str;
                    };
                    openModal(props => React.createElement(ModalRoot, { ...props, className: "colorwaysCreator-noMinHeight" }, [
                        React.createElement(ModalContent, { className: "colorwaysCreator-noHeader colorwaysCreator-noMinHeight" }, [
                            React.createElement(FormTitle, null, "Colorway ID:"),
                            React.createElement(TextInput, { placeholder: "Enter Colorway ID", onInput: e => setColorwayID(e.currentTarget.value) })
                        ]),
                        React.createElement(ModalFooter, null, [
                            React.createElement(Button, {
                                style: { marginLeft: 8 },
                                color: Button.Colors.BRAND,
                                size: Button.Sizes.MEDIUM,
                                look: Button.Looks.FILLED,
                                onClick: () => {
                                    const allEqual = (arr) => arr.every(v => v === arr[0]);
                                    if (!colorwayID) {
                                        throw new Error("Please enter a Colorway ID");
                                    } else if (colorwayID.length < 62) {
                                        throw new Error("Invalid Colorway ID");
                                    } else if (!hexToString(colorwayID).includes(",")) {
                                        throw new Error("Invalid Colorway ID");
                                    } else if (!allEqual(hexToString(colorwayID).split(",").map((e) => e.match("#")?.length)) && hexToString(colorwayID).split(",").map((e) => e.match("#")?.length)[0] !== 1) {
                                        throw new Error("Invalid Colorway ID");
                                    } else {
                                        const colorArray = hexToString(colorwayID).split(",");
                                        setAccentColor(colorArray[0].split("#")[1]);
                                        setPrimaryColor(colorArray[1].split("#")[1]);
                                        setSecondaryColor(colorArray[2].split("#")[1]);
                                        setTertiaryColor(colorArray[3].split("#")[1]);
                                        props.onClose();
                                    }
                                }
                            }, "Finish"),
                            React.createElement(Button, {
                                style: { marginLeft: 8 },
                                color: Button.Colors.PRIMARY,
                                size: Button.Sizes.MEDIUM,
                                look: Button.Looks.FILLED,
                                onClick: () => {
                                    props.onClose();
                                }
                            }, "Cancel")
                        ])
                    ]));
                }
            }, "Enter Colorway ID"),
            React.createElement(Button, {
                style: { marginLeft: 8 },
                color: Button.Colors.PRIMARY,
                size: Button.Sizes.MEDIUM,
                look: Button.Looks.FILLED,
                onClick: () => {
                    modalProps.onClose();
                }
            }, "Cancel")
        ])
    ]);
}

function InfoModal({ modalProps, colorwayProps, discrimProps = false }) {
    const colors = colorwayProps.colors || [
        "accent",
        "primary",
        "secondary",
        "tertiary",
    ];
    return React.createElement(ModalRoot, { ...modalProps, className: "colorwayCreator-modal" }, [
        React.createElement(ModalHeader, null, React.createElement(Text, { variant: "heading-lg/semibold", tag: "h1" }, "Colorway Details: " + colorwayProps.name)),
        React.createElement(ModalContent, null, React.createElement("div", { className: "colorwayInfo-wrapper" }, [
            React.createElement("div", { className: "colorwayInfo-colorSwatches" }, colors.map(color => {
                return React.createElement("div", {
                    className: "colorwayInfo-colorSwatch", style: { backgroundColor: colorwayProps[color] }, onClick: () => {
                        navigator.clipboard.writeText(String(colorwayProps[color]));
                        showToast({
                            message:
                                "Copied color successfully",
                            type: 1,
                            id: "copy-colorway-color-notify",
                        });
                    }
                });
            })),
            React.createElement("div", { className: "colorwayInfo-row colorwayInfo-author" }, [
                React.createElement(FormTitle, { style: { marginBottom: 0 } }, "Author:"),
                React.createElement(Button, { color: Button.Colors.PRIMARY, size: Button.Sizes.MEDIUM, look: Button.Looks.FILLED, onClick: () => openUserProfile(colorwayProps.authorID) }, colorwayProps.author)
            ]),
            React.createElement("div", { className: "colorwayInfo-row colorwayInfo-css" }, [
                React.createElement(FormTitle, { style: { marginBottom: 0 } }, "CSS:"),
                React.createElement(Text, { variant: "code", selectable: true, className: "colorwayInfo-cssCodeblock" }, colorwayProps.import)
            ])
        ])),
        discrimProps ? React.createElement(ModalFooter, null, [
            React.createElement(Button, {
                color: Button.Colors.RED, size: Button.Sizes.MEDIUM, look: Button.Looks.FILLED, style: { marginLeft: 8 }, onClick: () => {
                    dataStore.get("customColorways").then((customColorways) => {
                        if (customColorways.length > 0) {
                            const customColorwaysArray = [];
                            dataStore.get("customColorways").then(customColorways => {
                                customColorways.forEach((color, i) => {
                                    if (color.name !== colorwayProps.name) {
                                        customColorwaysArray.push(color);
                                    }
                                    if (i + 1 === customColorways.length) {
                                        dataStore.set("customColorways", customColorwaysArray);
                                    }
                                });
                            });
                            dataStore.get("actveColorwayID").then((actveColorwayID) => {
                                if (actveColorwayID === colorwayProps.name) {
                                    dataStore.set("actveColorway", null);
                                    dataStore.set("actveColorwayID", null);
                                }
                            });
                            modalProps.onClose();
                            document.getElementById("colorway-refreshcolorway")?.click();
                        }
                    });
                }
            }, "Delete Colorway"),
            React.createElement(Button, {
                color: Button.Colors.PRIMARY, size: Button.Sizes.MEDIUM, look: Button.Looks.FILLED, style: { marginLeft: 8 }, onClick: () => {
                    const stringToHex = (str) => {
                        let hex = "";
                        for (let i = 0; i < str.length; i++) {
                            const charCode = str.charCodeAt(i);
                            const hexValue = charCode.toString(16);
                            hex += hexValue.padStart(2, "0");
                        }
                        return hex;
                    };
                    const colorwayIDArray = `${colorwayProps.accent},${colorwayProps.primary},${colorwayProps.secondary},${colorwayProps.tertiary}`;
                    const colorwayID = stringToHex(colorwayIDArray);
                    navigator.clipboard.writeText(colorwayID);
                    showToast({
                        message: "Copied Colorway ID Successfully",
                        type: 1,
                        id: "copy-colorway-id-notify",
                    });
                }
            }, "Copy Colorway ID"),
            React.createElement(Button, {
                color: Button.Colors.PRIMARY, size: Button.Sizes.MEDIUM, look: Button.Looks.FILLED, style: { marginLeft: 8 }, onClick: () => {
                    navigator.clipboard.writeText(colorwayProps.import);
                    showToast({
                        message: "Copied CSS to Clipboard",
                        type: 1,
                        id: "copy-colorway-css-notify",
                    });
                }
            }, "Copy CSS"),
            React.createElement(Button, {
                color: Button.Colors.PRIMARY, size: Button.Sizes.MEDIUM, look: Button.Looks.FILLED, style: { marginLeft: 8 }, onClick: () => {
                    modalProps.onClose();
                }
            }, "Cancel")
        ]) : null
    ]);
}

function SelectorModal({ modalProps, visibleTabProps = "all" }) {
    const [currentColorway, setCurrentColorway] = React.useState("");
    const [searchString, setSearchString] = React.useState("");
    const [colorways, setColorways] = React.useState([]);
    const [customColorways, setCustomColorways] = React.useState([]);
    const [visibility, setVisibility] = React.useState(visibleTabProps);
    const [searchBarVisibility, setSearchBarVisibility] = React.useState(false);

    async function searchColorways(e) {
        if (!e) {
            cached_loadUI();
            return;
        }
        const colorwaySourceFiles = await dataStore.get("colorwaySourceFiles");
        const data = await Promise.all(
            colorwaySourceFiles.map((url) =>
                fetch(url).then((res) => res.json().catch(() => { return { colorways: [] }; }))
            )
        );
        const colorways = data.flatMap((json) => json.colorways);
        const baseData = await dataStore.get("customColorways");
        var results = [];
        (colorways || fallbackColorways).find((Colorway) => {
            if (Colorway.name.toLowerCase().includes(e.toLowerCase()))
                results.push(Colorway);
        });
        var customResults = [];
        baseData.find((Colorway) => {
            if (Colorway.name.toLowerCase().includes(e.toLowerCase()))
                customResults.push(Colorway);
        });
        setColorways(results);
        setCustomColorways(customResults);
    }

    async function loadUI() {
        const colorwaySourceFiles = await dataStore.get(
            "colorwaySourceFiles"
        );
        const responses = await Promise.all(
            colorwaySourceFiles.map((url) =>
                fetch(url)
            )
        );
        const data = await Promise.all(
            responses.map((res) =>
                res.json().catch(() => { return { colorways: [] }; })
            ));
        const colorways = data.flatMap((json) => json.colorways);
        const baseData = await dataStore.getMany([
            "customColorways",
            "actveColorwayID",
        ]);
        setColorways(colorways || fallbackColorways);
        setCustomColorways(baseData[0]);
        setCurrentColorway(baseData[1]);
    }

    const cached_loadUI = React.useCallback(loadUI, [setColorways, setCustomColorways, setCurrentColorway]);

    React.useEffect(() => {
        if (!searchString) {
            cached_loadUI();
        }
    }, [searchString]);

    var visibleColorwayArray;

    switch (visibility) {
        case "all":
            visibleColorwayArray = [...colorways, ...customColorways];
            break;
        case "official":
            visibleColorwayArray = [...colorways];
            break;
        case "custom":
            visibleColorwayArray = [...customColorways];
            break;
        default:
            visibleColorwayArray = [...colorways, ...customColorways];
            break;
    }

    return (
        React.createElement(ModalRoot, { ...modalProps, className: "colorwaySelectorModal" },
            React.createElement(ModalContent, { className: "colorwaySelectorModalContent" }, [
                React.createElement("div", { className: "colorwaySelector-doublePillBar" }, [
                    searchBarVisibility === true ? React.createElement(TextInput, {
                        inputClassName: "colorwaySelector-searchInput",
                        className: "colorwaySelector-search",
                        placeholder: "Search for Colorways...",
                        value: searchString,
                        onChange: (e) => {
                            searchColorways(e);
                            setSearchString(e);
                        }
                    }) : React.createElement("div", { className: "colorwaySelector-pillWrapper" },
                        React.createElement("div", { className: `colorwaySelector-pill${visibility === "all" ? " colorwaySelector-pill_selected" : " "}`, onClick: () => setVisibility("all") }, "All"),
                        React.createElement("div", { className: `colorwaySelector-pill${visibility === "official" ? " colorwaySelector-pill_selected" : " "}`, onClick: () => setVisibility("official") }, "Official"),
                        React.createElement("div", { className: `colorwaySelector-pill${visibility === "custom" ? " colorwaySelector-pill_selected" : " "}`, onClick: () => setVisibility("custom") }, "Custom"),
                        React.createElement("div", { className: "colorwaySelector-pillSeparator" }),
                        React.createElement("div", { className: `colorwaySelector-pill${visibility === "toolbox" ? " colorwaySelector-pill_selected" : " "}`, onClick: () => setVisibility("toolbox") }, "Toolbox"),
                        React.createElement("div", {
                            className: `colorwaySelector-pill${visibility === "info" ? " colorwaySelector-pill_selected" : " "}`, onClick: () => {
                                setVisibility("info");
                            }
                        }, "Info")
                    ),
                    React.createElement("div", { className: "colorwaySelector-pillWrapper" },
                        React.createElement(Tooltip, { text: "Refresh Colorways..." },
                            ({ onMouseEnter, onMouseLeave }) => {
                                return React.createElement("div", {
                                    className: "colorwaySelector-pill",
                                    id: "colorway-refreshcolorway",
                                    onMouseEnter: onMouseEnter,
                                    onMouseLeave: onMouseLeave,
                                    onClick: () => cached_loadUI()
                                },
                                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", x: "0px", y: "0px", width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor" },
                                        React.createElement("g", { id: "Frame_-_24px" }, React.createElement("rect", { y: "0", fill: "none", width: "24", height: "24" })),
                                        React.createElement("g", { id: "Filled_Icons" },
                                            React.createElement("g", null, [
                                                React.createElement("path", { d: "M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z" }),
                                                React.createElement("path", { d: "M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z" })
                                            ])
                                        )
                                    )
                                );
                            }
                        ),
                        React.createElement(Tooltip, { text: "Create Colorway..." },
                            ({ onMouseEnter, onMouseLeave }) => {
                                return React.createElement("div", {
                                    className: "colorwaySelector-pill", onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave, onClick: () => {
                                        if (!findByCode("showEyeDropper")) {
                                            extractAndRequireModuleIds(
                                                findByCode(
                                                    "Promise.all",
                                                    "openModalLazy",
                                                    "location_page"
                                                )
                                            );
                                        };
                                        openModal(props => React.createElement(CreatorModal, { modalProps: props, loadUIProps: cached_loadUI }));
                                    }
                                },
                                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", "aria-hidden": "true", role: "img", width: "14", height: "14", viewBox: "0 0 24 24" },
                                        React.createElement("path", { fill: "currentColor", d: "M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z" })
                                    )
                                );
                            }
                        ),
                        searchBarVisibility === false ? React.createElement(Tooltip, { text: "Search..." },
                            ({ onMouseEnter, onMouseLeave }) => {
                                return React.createElement("div", { className: "colorwaySelector-pill", onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave, onClick: () => setSearchBarVisibility(true) },
                                    React.createElement(SearchIcon, { width: 14, height: 14, viewboxX: 24, viewboxY: 24 })
                                );
                            }
                        ) : React.createElement(Tooltip, { text: "Close Search" },
                            ({ onMouseEnter, onMouseLeave }) => {
                                return React.createElement(
                                    "div",
                                    {
                                        className: "colorwaySelector-pill",
                                        onMouseEnter: onMouseEnter,
                                        onMouseLeave: onMouseLeave,
                                        onClick: () => {
                                            searchColorways("");
                                            setSearchString("");
                                            setSearchBarVisibility(false);
                                        }
                                    },
                                    React.createElement(CloseIcon, { width: 14, height: 14, viewboxX: 24, viewboxY: 24 })
                                );
                            }
                        )
                    )
                ]
                ),
                React.createElement("div", { className: "ColorwaySelectorWrapper" }, [
                    ["all", "official", "custom"].includes(visibility) ? (visibleColorwayArray.length > 0 ? visibleColorwayArray.map((color) => {
                        var colors = color.colors || ["accent", "primary", "secondary", "tertiary"];
                        return React.createElement(Tooltip, { text: color.name },
                            ({ onMouseEnter, onMouseLeave }) => {
                                return React.createElement("div", {
                                    className: `discordColorway${colorwayCSS.get().name === color.name ? " active" : ""}`,
                                    id: "colorway-" + color.name,
                                    onMouseEnter: onMouseEnter,
                                    onMouseLeave: onMouseLeave
                                }, [
                                    React.createElement("div", { className: "colorwayCheckIconContainer" },
                                        React.createElement("div", { className: "colorwayCheckIcon" },
                                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", "aria-hidden": "true", role: "img", width: "18", height: "18", viewBox: "0 0 24 24" },
                                                React.createElement("path", { fill: "currentColor", "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M8.99991 16.17L4.82991 12L3.40991 13.41L8.99991 19L20.9999 7.00003L19.5899 5.59003L8.99991 16.17Z" })
                                            )
                                        )
                                    ),
                                    React.createElement("div", {
                                        className: "colorwayInfoIconContainer", onClick: () => {
                                            openModal(props => React.createElement(InfoModal, { modalProps: props, colorwayProps: color, discrimProps: customColorways.includes(color) }));
                                        }
                                    },
                                        React.createElement("div", { className: "colorwayInfoIcon" },
                                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16" },
                                                React.createElement("path", { d: "m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" })
                                            )
                                        )
                                    ),
                                    React.createElement("div", {
                                        className: "discordColorwayPreviewColorContainer",
                                        onClick: () => {
                                            if (currentColorway === color.name) {
                                                dataStore.set("actveColorwayID", null);
                                                dataStore.set("actveColorway", null);
                                                colorwayCSS.remove();
                                            } else {
                                                dataStore.set("actveColorwayID", color.name);
                                                dataStore.set("actveColorway", color.import);
                                                colorwayCSS.set(color.import, color.name);
                                            }
                                            setCurrentColorway(colorwayCSS.get().name);
                                        }
                                    }, colors.map((colorItm) => {
                                        return (
                                            React.createElement("div", { className: "discordColorwayPreviewColor", style: { backgroundColor: color[colorItm] } })
                                        );
                                    }))
                                ]);
                            }
                        );
                    }) : React.createElement(FormTitle, { style: { marginBottom: 0, width: "100%", textAlign: "center" } }, "No colorways...")) : null,
                    visibility === "info" ? [
                        React.createElement("div", { className: "colorwaysSelector-infoRow" },
                            [React.createElement(FormTitle, { style: { marginBottom: 0 } }, "Plugin Name:"),
                            React.createElement(Text, { variant: "text-xs/normal", style: { color: "var(--text-muted)", fontWeight: 500, fontSize: "14px" } }, "Discord Colorways")]
                        ),
                        React.createElement("div", { className: "colorwaysSelector-infoRow" },
                            [React.createElement(FormTitle, { style: { marginBottom: 0 } }, "Plugin Version:"),
                            React.createElement(Text, { variant: "text-xs/normal", style: { color: "var(--text-muted)", fontWeight: 500, fontSize: "14px" } }, (plugin.pluginVersion + " (Official) (Universal)"))]
                        ),
                        React.createElement("div", { className: "colorwaysSelector-infoRow" },
                            [React.createElement(FormTitle, { style: { marginBottom: 0 } }, "Creator Version:"),
                            React.createElement(Text, { variant: "text-xs/normal", style: { color: "var(--text-muted)", fontWeight: 500, fontSize: "14px" } }, (plugin.creatorVersion + " (Stable)"))]
                        ),
                        React.createElement("div", { className: "colorwaysSelector-infoRow" }, [
                            React.createElement(FormTitle, { style: { marginBottom: 0 } }, "Loaded Colorways:"),
                            React.createElement(Text, { variant: "text-xs/normal", style: { color: "var(--text-muted)", fontWeight: 500, fontSize: "14px" } }, ([...colorways, ...customColorways].length))
                        ]
                        )] : null
                ]
                )
            ])
        )
    );
}