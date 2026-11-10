// blahblahtranslate/content/page-slots.js





const TRANSLATABLE_PATTERN = /\p{L}/u;
const NON_PROSE_PATTERN = /^(?:(?:https?:\/\/|www\.)\S+|\S+@\S+\.\S+)$/i;
const INVISIBLE_CHARACTERS = /[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/g;
const EXCLUDED_TAGS = new Set([
    'script',
    'style',
    'noscript',
    'template',
    'iframe',
    'frame',
    'frameset',
    'noembed',
    'noframes',
    'object',
    'embed',
    'canvas',
    'math',
    'code',
    'pre',
    'kbd',
    'samp'
]);
const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'alt', 'aria-label'];

const textRecords = new WeakMap();
const attributeRecords = new WeakMap();
let titleRecord = null;





function cleanText(rawText) {
    const text = rawText
        .replace(INVISIBLE_CHARACTERS, '')
        .replace(CONTROL_CHARACTERS, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!TRANSLATABLE_PATTERN.test(text)) {
        return '';
    }

    if (NON_PROSE_PATTERN.test(text)) {
        return '';
    }


    return text;
}


function buildSlot({ currentValue, record, readValue, writeValue, saveRecord }) {
    let source = currentValue;
    
    if (record && record.translatedValue === currentValue) {
        source = record.source;
    }

    const text = cleanText(source);
    if (!text) {
        return null;
    }

    const leading = source.slice(0, source.length - source.trimStart().length);
    const trailing = source.slice(source.trimEnd().length);


    return {
        text,
        apply(translation) {
            if (readValue() !== currentValue) {
                return;
            }

            const translatedValue = leading + translation + trailing;
            writeValue(translatedValue);
            saveRecord({ source, translatedValue });
        }
    };
}


function createTextSlot(node) {
    return buildSlot({
        currentValue: node.nodeValue,
        record: textRecords.get(node),
        readValue: () => node.nodeValue,
        writeValue: (value) => {
            node.nodeValue = value;
        },
        saveRecord: (record) => {
            textRecords.set(node, record);
        }
    });
}


function createAttributeSlot(element, attributeName) {
    return buildSlot({
        currentValue: element.getAttribute(attributeName),
        record: attributeRecords.get(element)?.get(attributeName),
        readValue: () => element.getAttribute(attributeName),
        writeValue: (value) => {
            element.setAttribute(attributeName, value);
        },
        saveRecord: (record) => {
            let records = attributeRecords.get(element);
            
            if (!records) {
                records = new Map();
                attributeRecords.set(element, records);
            }
            records.set(attributeName, record);
        }
    });
}


function createTitleSlot() {
    return buildSlot({
        currentValue: document.title,
        record: titleRecord,
        readValue: () => document.title,
        writeValue: (value) => {
            document.title = value;
        },
        saveRecord: (record) => {
            titleRecord = record;
        }
    });
}


function isExcludedElement(element) {
    if (EXCLUDED_TAGS.has(element.localName)) {
        return true;
    }

    if (element.getAttribute('translate') === 'no' || element.classList.contains('notranslate')) {
        return true;
    }

    if (element.hasAttribute('contenteditable') && element.getAttribute('contenteditable') !== 'false') {
        return true;
    }


    return false;
}


function filterNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentNode.localName === 'textarea') {
            return NodeFilter.FILTER_SKIP;
        }

        if (!TRANSLATABLE_PATTERN.test(node.nodeValue)) {
            return NodeFilter.FILTER_SKIP;
        }

        
        return NodeFilter.FILTER_ACCEPT;
    }

    if (isExcludedElement(node)) {
        return NodeFilter.FILTER_REJECT;
    }


    return NodeFilter.FILTER_ACCEPT;
}


function addSlot(entriesByText, slot) {
    if (!slot) {
        return;
    }

    let entry = entriesByText.get(slot.text);
    if (!entry) {
        entry = { text: slot.text, slots: [], translation: null };
        entriesByText.set(slot.text, entry);
    }

    entry.slots.push(slot);
}


function addAttributeSlots(entriesByText, element) {
    for (const attributeName of TRANSLATABLE_ATTRIBUTES) {
        if (element.hasAttribute(attributeName)) {
            addSlot(entriesByText, createAttributeSlot(element, attributeName));
        }
    }
}


function collectTranslationEntries() {
    const entriesByText = new Map();
    addSlot(entriesByText, createTitleSlot());

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        filterNode
    );

    let node = walker.nextNode();
    while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
            addSlot(entriesByText, createTextSlot(node));
        } else {
            addAttributeSlots(entriesByText, node);
        }

        node = walker.nextNode();
    }


    return Array.from(entriesByText.values());
}


function applyTranslations(entries) {
    for (const entry of entries) {
        if (typeof entry.translation !== 'string') {
            continue;
        }
        
        for (const slot of entry.slots) {
            slot.apply(entry.translation);
        }
    }
}