// blahblahtranslate/shared/icons.js





const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const DEFAULT_ICON_SIZE = 16;


const ICON_SHAPES = {
    'arrow-left': [
        ['path', { d: 'm12 19-7-7 7-7' }],
        ['path', { d: 'M19 12H5' }]
    ],
    'arrow-left-right': [
        ['path', { d: 'M8 3 4 7l4 4' }],
        ['path', { d: 'M4 7h16' }],
        ['path', { d: 'm16 21 4-4-4-4' }],
        ['path', { d: 'M20 17H4' }]
    ],
    check: [['path', { d: 'M20 6 9 17l-5-5' }]],
    'chevron-down': [['path', { d: 'm6 9 6 6 6-6' }]],
    globe: [
        ['circle', { cx: '12', cy: '12', r: '10' }],
        ['path', { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' }],
        ['path', { d: 'M2 12h20' }]
    ],
    languages: [
        ['path', { d: 'm5 8 6 6' }],
        ['path', { d: 'm4 14 6-6 2-3' }],
        ['path', { d: 'M2 5h12' }],
        ['path', { d: 'M7 2h1' }],
        ['path', { d: 'm22 22-5-10-5 10' }],
        ['path', { d: 'M14 18h6' }]
    ],
    'languages-globe': [
        ['path', { d: 'M3.4 10.8 8.2 15.6' }],
        ['path', { d: 'M2.6 15.6 7.4 10.8 9 8.4' }],
        ['path', { d: 'M1 8.4h9.6' }],
        ['path', { d: 'M5 6h.8' }],
        ['path', { d: 'M17 22 13 14 9 22' }],
        ['path', { d: 'M10.6 18.8h4.8' }],
        ['circle', { cx: '19', cy: '5.5', r: '4' }],
        ['path', { d: 'M19 1.5a5.8 5.8 0 0 0 0 8 5.8 5.8 0 0 0 0-8' }],
        ['path', { d: 'M15 5.5h8' }]
    ],
    search: [
        ['circle', { cx: '11', cy: '11', r: '8' }],
        ['path', { d: 'm21 21-4.3-4.3' }]
    ],
    x: [
        ['path', { d: 'M18 6 6 18' }],
        ['path', { d: 'm6 6 12 12' }]
    ]
};





function createIcon(name, size = DEFAULT_ICON_SIZE) {
    const svg = document.createElementNS(SVG_NAMESPACE, 'svg');

    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.display = 'block';
    svg.style.flexShrink = '0';
    svg.style.width = size + 'px';
    svg.style.height = size + 'px';

    for (const [tagName, attributes] of ICON_SHAPES[name]) {
        const shape = document.createElementNS(SVG_NAMESPACE, tagName);

        for (const [attributeName, value] of Object.entries(attributes)) {
            shape.setAttribute(attributeName, value);
        }

        shape.style.fill = 'none';
        shape.style.stroke = 'currentColor';
        shape.style.strokeWidth = '2';
        shape.style.strokeLinecap = 'square';
        shape.style.strokeLinejoin = 'miter';
        svg.appendChild(shape);
    }


    return svg;
}


function hydrateIcons(root) {
    for (const element of root.querySelectorAll('[data-icon]')) {
        element.replaceChildren(createIcon(element.dataset.icon));
    }
}