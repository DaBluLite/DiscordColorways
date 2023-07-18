/**
 * @name ColorwaysAPI
 * @description A publically available Discord Colorways API for use with other plugins (Note: This cannot control or override the official Colorways plugin)
 * @author DaBluLite
 */
module.exports = class ColorwaysAPI {
    constructor() {
        this.createElement = (type, props, ...children) => {
            if (typeof type === "function") return type({ ...props, children: [].concat() })
        
            const node = document.createElement(type || "div");
        
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
        fetch("https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json")
        .then(res => res.json())
        .then(colors => this.colorwayArray = colors.colorways)
    }
    refreshList() {
        fetch("https://raw.githubusercontent.com/DaBluLite/DiscordColorways/master/index.json")
        .then(res => res.json())
        .then(colors => this.colorwayArray = colors.colorways)
    }
    listColorways() {
        console.log(this.colorwayArray);
    }
    applyColorway(colorw) {
        try {
            let colorways = [];
            this.colorwayArray.forEach(color => colorways.push(color));
            let foundColorway = colorways.filter(colorway => colorway.name === colorw);
            document.getElementById("activeColorwayCSS") ? document.getElementById("activeColorwayCSS").innerHTML = foundColorway[0].import : document.head.append(this.createElement("style", { id: "activeColorwayCSS" }, foundColorway[0].import))
        } catch (e) {console.warn("Unhandled Error: " + e)}
    }
    disableColorway() {
        try {document.getElementById("activeColorwayCSS").remove()} catch (e) {console.warn("Unhandled Error: " + e)}
    }
}