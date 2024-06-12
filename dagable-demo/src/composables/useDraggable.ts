import {
    MaybeElement,
    MaybeRef,
    useCssVar,
    useEventListener,
    get,
    VueInstance,
} from "@vueuse/core";
import { reactive, toRefs } from "vue";

export function useDraggable(
    element: MaybeRef<Exclude<MaybeElement, VueInstance>>,
    options?: draggleOptions
) {
    const { willReset = false, draggingClass = "dragging" } = options || {};

    let _x = 0,
        _y = 0;

    const dragState = reactive({
        isDragging: false,
        x: useCssVar("--translate-x", element),
        y: useCssVar("--translate-y", element),
        lastMouseX: 0,
        lastMouseY: 0,
    });

    const handleMouseDown = (event: MouseEvent) => {
        event.preventDefault();
        const ele = get(element);

        if (!ele) return;

        ele.classList.add("transform");

        dragState.isDragging = true;
        dragState.lastMouseX = event.pageX;
        dragState.lastMouseY = event.pageY;

        document.addEventListener("mousemove", handleMouseMove);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!dragState.isDragging) return;

        const ele = get(element)!;

        ele.classList.add(draggingClass);

        const deltaX = event.pageX - dragState.lastMouseX;
        const deltaY = event.pageY - dragState.lastMouseY;

        const { x, y, right, bottom } = ele.getBoundingClientRect();

        if (
            (isRight(right) && deltaX < 0) ||
            (isMin(x) && deltaX > 0) ||
            (!isMin(x) && !isRight(right))
        ) {
            _x += deltaX;
        }

        if (
            (isBottom(bottom) && deltaY < 0) ||
            (isMin(y) && deltaY > 0) ||
            (!isMin(y) && !isBottom(bottom))
        ) {
            _y += deltaY;
        }

        dragState.x = `${_x}px`;
        dragState.y = `${_y}px`;

        dragState.lastMouseX = event.pageX;
        dragState.lastMouseY = event.pageY;
    };

    const handleMouseUp = () => {
        dragState.isDragging = false;

        get(element)?.classList.remove(draggingClass);
        document.removeEventListener("mousemove", handleMouseMove);

        if (willReset) {
            reset();
        }
    };

    const reset = () => {
        dragState.y = dragState.x = `${0}px`;
        _x = _y = 0;
    };

    const isMin = (n: number) => {
        return n <= 0;
    };

    const isBottom = (y: number) => {
        return y >= window.innerHeight;
    };

    const isRight = (x: number) => {
        return x >= window.innerWidth;
    };

    useEventListener(element, "mousedown", handleMouseDown);
    useEventListener(element, "mouseup", handleMouseUp);
    useEventListener(document, "mouseup", handleMouseUp);

    return toRefs(dragState);
}
