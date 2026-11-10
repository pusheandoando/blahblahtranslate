// blahblahtranslate/content/popover-position.js





const POPOVER_VIEWPORT_MARGIN = 8;
const POPOVER_ANCHOR_GAP = 8;
const POPOVER_SIDE_PRIORITY = ['bottom', 'top', 'right', 'left'];





function readViewportSize() {
    return {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
    };
}


function clampToViewport(value, size, viewportSize) {
    const maxValue = Math.max(
        POPOVER_VIEWPORT_MARGIN,
        viewportSize - size - POPOVER_VIEWPORT_MARGIN
    );


    return Math.min(Math.max(value, POPOVER_VIEWPORT_MARGIN), maxValue);
}


function measureSpaceAround(anchor, viewport) {
    return {
        top: anchor.top - POPOVER_VIEWPORT_MARGIN,
        bottom: viewport.height - anchor.bottom - POPOVER_VIEWPORT_MARGIN,
        left: anchor.left - POPOVER_VIEWPORT_MARGIN,
        right: viewport.width - anchor.right - POPOVER_VIEWPORT_MARGIN
    };
}


function fitsOnSide(side, space, size) {
    if (side === 'top' || side === 'bottom') {
        return space[side] >= size.height + POPOVER_ANCHOR_GAP;
    }


    return space[side] >= size.width + POPOVER_ANCHOR_GAP;
}


function chooseSide(space, size) {
    for (const side of POPOVER_SIDE_PRIORITY) {
        if (fitsOnSide(side, space, size)) {
            return side;
        }
    }

    let roomiestSide = POPOVER_SIDE_PRIORITY[0];
    for (const side of POPOVER_SIDE_PRIORITY) {
        if (space[side] > space[roomiestSide]) {
            roomiestSide = side;
        }
    }


    return roomiestSide;
}


function computeCoordinates(side, anchor, size) {
    const anchorCenterX = anchor.left + anchor.width / 2;
    const anchorCenterY = anchor.top + anchor.height / 2;

    if (side === 'bottom') {
        return {
            left: anchorCenterX - size.width / 2,
            top: anchor.bottom + POPOVER_ANCHOR_GAP
        };
    }
    
    if (side === 'top') {
        return {
            left: anchorCenterX - size.width / 2,
            top: anchor.top - POPOVER_ANCHOR_GAP - size.height
        };
    }
    
    if (side === 'right') {
        return {
            left: anchor.right + POPOVER_ANCHOR_GAP,
            top: anchorCenterY - size.height / 2
        };
    }
    
    
    return {
        left: anchor.left - POPOVER_ANCHOR_GAP - size.width,
        top: anchorCenterY - size.height / 2
    };
}


function computePopoverPosition(anchor, size, viewport) {
    const space = measureSpaceAround(anchor, viewport);
    const side = chooseSide(space, size);
    const coordinates = computeCoordinates(side, anchor, size);


    return {
        left: clampToViewport(coordinates.left, size.width, viewport.width),
        top: clampToViewport(coordinates.top, size.height, viewport.height)
    };
}


function computeCenteredPosition(size, viewport) {
    return {
        left: clampToViewport((viewport.width - size.width) / 2, size.width, viewport.width),
        top: clampToViewport((viewport.height - size.height) / 2, size.height, viewport.height)
    };
}


function readUsableAnchor(readAnchorRect) {
    if (!readAnchorRect) {
        return null;
    }

    const rect = readAnchorRect();
    
    if (rect.width === 0 && rect.height === 0) {
        return null;
    }
    
    
    return rect;
}


function createPopoverPositioner(popover, readAnchorRect) {
    let pendingFrame = null;


    function update() {
        const bounds = popover.getBoundingClientRect();
        const size = { width: bounds.width, height: bounds.height };
        const viewport = readViewportSize();
        const anchor = readUsableAnchor(readAnchorRect);

        let position = computeCenteredPosition(size, viewport);
        if (anchor) {
            position = computePopoverPosition(anchor, size, viewport);
        }

        popover.style.left = position.left + 'px';
        popover.style.top = position.top + 'px';
    }


    function scheduleUpdate() {
        if (pendingFrame !== null) {
            return;
        }
        
        pendingFrame = requestAnimationFrame(() => {
            pendingFrame = null;
            update();
        });
    }


    function handleScroll(event) {
        if (popover.contains(event.target)) {
            return;
        }
        
        scheduleUpdate();
    }


    function start() {
        window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
        window.addEventListener('resize', scheduleUpdate);
    }


    function stop() {
        window.removeEventListener('scroll', handleScroll, { capture: true });
        window.removeEventListener('resize', scheduleUpdate);
        
        if (pendingFrame !== null) {
            cancelAnimationFrame(pendingFrame);
            pendingFrame = null;
        }
    }

    
    return { update, start, stop };
}