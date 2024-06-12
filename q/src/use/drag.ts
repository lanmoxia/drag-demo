import { ref, onMounted, computed, unref, onBeforeUnmount } from "vue";
import type { Ref } from "vue";

export const defaultWindow = /*#__PURE__*/ window;



interface useDragOption {
    draggingElement?: any,
    draggingHandle?: any,
    initialValue?: any,
    axis?: 'x' | 'y' | 'both',
    limitDOM?: Ref<HTMLElement | null | undefined>,
}


// Composables
const useDrag = (target: Ref<HTMLElement | null>, options: useDragOption) => {
    const {
        draggingElement = defaultWindow,
        draggingHandle = target,
        initialValue,
        axis = 'both',
        limitDOM,
    } = options;

    const position = ref(
        initialValue ?? { x: 0, y: 0 },
    )

    const size = computed(
        () => {
            return {
                width: target?.value?.offsetWidth || 0,
                height: target?.value?.offsetHeight || 0,
            }
        }
    )



    // 移动的变化
    const pressedDelta = ref();

    onMounted(
        () => {
            // 判断是否有target
            if (!unref(target)) {
                console.warn("drag目标元素不存在，请检查！");
                return;
            }
            // 注册事件 此处可以搞个整体的事件,来提高一些性能,累了毁灭吧
            target.value!.addEventListener("pointerdown", start);
            draggingElement!.addEventListener("pointermove", move);
            draggingElement!.addEventListener("pointerup", end);

        }
    )

    onBeforeUnmount(
        () => {
            // 判断是否有target
            if (unref(target)) {
                // 取消事件
                target.value!.removeEventListener("pointerdown", start);
                draggingElement!.removeEventListener("pointermove", move);
                draggingElement!.removeEventListener("pointerup", end);
            }
        }
    )


    // 移动开始
    const start = (e: PointerEvent) => {
        const rect = target.value!.getBoundingClientRect();
        // 记录下点击的位置与左上角的偏差
        const pos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
        pressedDelta.value = pos;
    }

    // 移动事件
    const move = (e: PointerEvent) => {
        // 如果没点击开始则不触发
        if (!pressedDelta.value) {
            return;
        }
        let { x, y } = position.value;
        // 鼠标移动到的位置减去偏差
        if (axis === 'x' || axis === 'both') {
            x = e.clientX - pressedDelta.value.x;
        }
        if (axis === 'y' || axis === 'both') {
            y = e.clientY - pressedDelta.value.y;
        }
        position.value = limitArea({ x, y });
    }

    // 移动结束
    const end = (e: PointerEvent) => {
        if (!pressedDelta.value) {
            return
        }
        pressedDelta.value = undefined;
    }

    // 要求不超过边界
    const limitArea = ({ x = position.value.x, y = position.value.y }: { x: number, y: number } = position.value) => {
        if (x < areaLimit.value.startX) {
            x = areaLimit.value.startX;
        }
        if (x > areaLimit.value.endX - size.value.width) {
            x = areaLimit.value.endX - size.value.width;
        }
        if (y < areaLimit.value.startY) {
            y = areaLimit.value.startY;
        }
        if (y > areaLimit.value.endY - size.value.height) {
            y = areaLimit.value.endY - size.value.height;
        }

        return {
            x, y
        }
    }



    // 计算div的返回限制范围

    const areaLimit = ref(
        {
            startX: 0,
            startY: 0,
            endX: 500,
            endY: 500,
        }
    )
    let mo: MutationObserver;
    let re: ResizeObserver;
    // 更新相对位置
    const initWatch = () => {
        const limitdiv = unref(limitDOM) ? unref(limitDOM) : document.getElementById("app")

        const callback = () => {
            const { left, right, top, bottom } = limitdiv!.getBoundingClientRect()
            areaLimit.value = {
                startX: left,
                startY: top,
                endX: right,
                endY: bottom,
            }
            position.value = limitArea();
        };

        if (limitdiv) {
            mo = new MutationObserver(callback);
            mo.observe(limitdiv, {
                attributes: true,
            });
            re = new ResizeObserver(callback)
            re.observe(limitdiv)
            callback();
        }



    }
    onMounted(
        () => {
            initWatch()
        }
    )
    onBeforeUnmount(
        () => {
            if (mo) {
                mo?.disconnect()
            }
            if (re) {
                re?.disconnect()
            }
        }
    )



    return {
        draggingHandle,
        x: computed(() => position.value.x),
        y: computed(() => position.value.y),
        position,
        isDragging: computed(() => !!pressedDelta.value),
        style: computed(
            () => `left:${position.value.x}px;top:${position.value.y}px;`,
        )
    }
}


// // 自定义指令
// const myDrag: ObjectDirective = {
//   // 在绑定元素的 attribute 前
//   // 或事件监听器应用前调用
//   created(el, binding, vnode, prevVnode) {
//     // 下面会介绍各个参数的细节
//   },
//   // 在元素被插入到 DOM 前调用
//   beforeMount(el, binding, vnode, prevVnode) { },
//   // 在绑定元素的父组件
//   // 及他自己的所有子节点都挂载完成后调用
//   mounted(el, binding, vnode, prevVnode) {
//
//     console.log("el", el)
//     console.log("binding", binding)
//     console.log("vnode", vnode)
//     console.log("prevVnode", prevVnode)
//   },
//   // 绑定元素的父组件更新前调用
//   beforeUpdate(el, binding, vnode, prevVnode) { },
//   // 在绑定元素的父组件
//   // 及他自己的所有子节点都更新后调用
//   updated(el, binding, vnode, prevVnode) { },
//   // 绑定元素的父组件卸载前调用
//   beforeUnmount(el, binding, vnode, prevVnode) { },
//   // 绑定元素的父组件卸载后调用
//   unmounted(el, binding, vnode, prevVnode) { }
// }

// // plugin
// const dragPlugin = {
//   install(app: App) {
//     app.directive('drag', myDrag)
//   }
// }

export { useDrag }