// blahblahtranslate/shared/dom-builder.js





function createElement(tagName, options = {}, children = []) {
    const element = document.createElement(tagName);

    if (options.id) {
        element.id = options.id;
    }

    if (options.className) {
        element.className = options.className;
    }

    if (options.text) {
        element.textContent = options.text;
    }
    
    if (options.attributes) {
        for (const [name, value] of Object.entries(options.attributes)) {
            element.setAttribute(name, value);
        }
    }

    for (const child of children) {
        element.appendChild(child);
    }

    
    return element;
}