// blahblahtranslate/content/popover-resize.js





const POPOVER_MIN_WIDTH = 320;
const POPOVER_MIN_HEIGHT = 300;





function clampNumber(value, minValue, maxValue) {
    return Math.min(Math.max(value, minValue), Math.max(minValue, maxValue));
}


function attachPopoverResizeHandle(popover, handle, onResizeStart) {
    let origin = null;


    function handlePointerDown(event) {
        if (event.button !== 0) {
            return;
        }

        event.preventDefault();

        const bounds = popover.getBoundingClientRect();
        origin = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            left: bounds.left,
            bottom: bounds.bottom,
            width: bounds.width,
            height: bounds.height
        };
        handle.setPointerCapture(event.pointerId);
        onResizeStart();
    }


    function handlePointerMove(event) {
        if (!origin) {
            return;
        }

        const viewport = readViewportSize();
        const maxWidth = viewport.width - origin.left - POPOVER_VIEWPORT_MARGIN;
        const maxHeight = origin.bottom - POPOVER_VIEWPORT_MARGIN;
        const width = clampNumber(
            origin.width + (event.clientX - origin.pointerX),
            POPOVER_MIN_WIDTH,
            maxWidth
        );
        const height = clampNumber(
            origin.height + (origin.pointerY - event.clientY),
            POPOVER_MIN_HEIGHT,
            maxHeight
        );

        popover.style.width = width + 'px';
        popover.style.height = height + 'px';
        popover.style.left = origin.left + 'px';
        popover.style.top = origin.bottom - height + 'px';
    }


    function handlePointerEnd() {
        origin = null;
    }

    
    handle.addEventListener('pointerdown', handlePointerDown);
    handle.addEventListener('pointermove', handlePointerMove);
    handle.addEventListener('pointerup', handlePointerEnd);
    handle.addEventListener('pointercancel', handlePointerEnd);
}