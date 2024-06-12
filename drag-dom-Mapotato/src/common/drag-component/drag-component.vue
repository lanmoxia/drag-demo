<template>
  <Teleport to="body">
    <!-- 拖拽组件 -->
    <div class="drag-component" ref="dragElement">
      <!-- 传入插槽 -->
      <slot></slot>
      <!-- 拖拽把手 -->
      <div class="drag-handle" :class="{ moving }" ref="dragHandle"></div>
      <!-- 位置信息显示 -->
      <div class="drag-position-infos-card">
        <span>[X]{{ positionInfos.left }}</span>
        <span>[Y]{{ positionInfos.top }}</span>
      </div>
    </div>
    <!-- 拖拽限制区域显示 -->
    <div
      class="drag-limit"
      ref="dragLimit"
      :style="{
        top: `${limitAreaInfos.limitTop}px`,
        left: `${limitAreaInfos.limitLeft}px`,
        width: `${limitAreaInfos.limitWidth}px`,
        height: `${limitAreaInfos.limitHeight}px`,
      }"
    ></div>
  </Teleport>
</template>

<script lang="ts" setup>
//方法-》return了哪些
//组件-》触发了哪些事件监听
import { computed, onMounted, ref } from "vue";
import { limitAreaType, PositionEnum, PositionType } from "./drag-api";
import {
  Observable,
  filter,
  fromEvent,
  merge,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
const dragProps = defineProps<{
  position: PositionType;
  limitArea?: limitAreaType;
}>();
//postion-change
//mousedown
//mouseUP结束拖拽
//触发到父组件得事件是不是应该考虑的完全一点
const dragEmits = defineEmits<{
  (e: "position-change", positionInfos: PositionType): void;
}>();

const moving = ref<boolean>(false);
const positionInfos = ref<PositionType>(dragProps.position);

const [top, left] = [
  computed(() => `${positionInfos.value.top}px`),
  computed(() => `${positionInfos.value.left}px`),
];

const dragElement = ref<HTMLElement>();
const dragHandle = ref<HTMLElement>();
const dragLimit = ref<HTMLElement>();

const limitAreaInfos = ref<limitAreaType>(
  dragProps.limitArea ?? {
    limitTop: 0,
    limitLeft: 0,
    limitWidth: document.body.clientWidth,
    limitHeight: document.body.clientHeight,
  }
);

let [startX, startY, originX, originY, limitBorder] = [0, 0, 0, 0, 3];

// 移动流
const move$ = ref<Observable<MouseEvent>>();

onMounted(() => {
  initPosition();
  registeEventListener();
});

/**
 * 上下左右不出界
 */
const initPosition = () => {
  positionInfos.value.top < limitAreaInfos.value.limitTop + limitBorder &&
    (positionInfos.value.top = limitAreaInfos.value.limitTop + limitBorder);
  positionInfos.value.left < limitAreaInfos.value.limitLeft + limitBorder &&
    (positionInfos.value.left = limitAreaInfos.value.limitLeft + limitBorder);
  const [limitRight, limitBottom, currentRight, currentBottom] = [
    dragLimit.value!.getBoundingClientRect().right,
    dragLimit.value!.getBoundingClientRect().bottom,
    dragElement.value!.getBoundingClientRect().right,
    dragElement.value!.getBoundingClientRect().bottom,
  ];
  limitRight - limitBorder < currentRight &&
    (positionInfos.value.left -= currentRight - limitRight + limitBorder);
  limitBottom - limitBorder < currentBottom &&
    (positionInfos.value.top -= currentBottom - limitBottom + limitBorder);
};

/**
 * 注册事件
 */

const registeEventListener = () => {
  const movestart$ = fromEvent<MouseEvent>(dragHandle.value!, "mousedown");
  const moveend$ = fromEvent<MouseEvent>(document, "mouseup").pipe(
    tap(() => (moving.value = false))
  );
  const moveingX$ = fromEvent<MouseEvent>(document, "mousemove");
  const moveingY$ = fromEvent<MouseEvent>(document, "mousemove");
  move$.value = movestart$.pipe(
    tap((event) => {
      [startX, startY, originX, originY] = [
        event.clientX,
        event.clientY,
        positionInfos.value.left,
        positionInfos.value.top,
      ];
      moving.value = true;
    }),
    switchMap(() =>
      merge(
        moveingX$.pipe(
          takeUntil(moveend$),
          filter((event: MouseEvent): boolean => {
            // 限制左边距
            return (
              originX + event.clientX - startX >=
              limitAreaInfos.value.limitLeft + limitBorder
            );
          }),
          tap((event) => updatePosition(PositionEnum.横向偏移, event))
        ),
        moveingY$.pipe(
          takeUntil(moveend$),
          filter((event: MouseEvent): boolean => {
            // 限制上边距
            return (
              originY + event.clientY - startY >=
              limitAreaInfos.value.limitTop + limitBorder
            );
          }),
          tap((event) => updatePosition(PositionEnum.纵向偏移, event))
        )
      )
    )
  );
  move$.value.subscribe();
};

/**
 * 移动更新坐标
 * @param positionType 移向
 * @param mouseEvent 鼠标参数
 */
const updatePosition = (
  positionType: PositionEnum,
  { clientX, clientY }: MouseEvent
) => {
  const [distanceX, distanceY] = [clientX - startX, clientY - startY];
  const [limitRight, currentWidth, limitBottom, currentHeight] = [
    dragLimit.value!.getBoundingClientRect().right,
    dragElement.value!.getBoundingClientRect().width,
    dragLimit.value!.getBoundingClientRect().bottom,
    dragElement.value!.getBoundingClientRect().height,
  ];
  if (positionType === PositionEnum.横向偏移) {
    // 限制右边距
    originX + distanceX + currentWidth + limitBorder <= limitRight &&
      (positionInfos.value.left = originX + distanceX);
  } else {
    // 限制下边距
    originY + distanceY + currentHeight + limitBorder <= limitBottom &&
      (positionInfos.value.top = originY + distanceY);
  }
  dragEmits("position-change", positionInfos.value);
};
</script>

<style lang="less" scoped>
.drag-component {
  user-select: none;
  position: absolute;
  top: v-bind(top);
  left: v-bind(left);
  width: max-content;
  height: max-content;
  background-color: rgb(35, 150, 233);
  .drag-handle {
    cursor: move;
    width: 20px;
    height: 20px;
    background-color: #1d1d6b;
    border-radius: 50%;
    border-bottom-left-radius: 0;
    position: absolute;
    top: -20px;
    right: -20px;
    transition: transform 233ms;
    transform-origin: left bottom;
  }
  .drag-handle:hover,
  .moving {
    transform: scale(1.5);
  }

  .drag-position-infos-card {
    position: absolute;
    top: 0;
    right: 0;
    transform: translateX(110%);
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 16px;

    > span::first-letter {
      font-weight: bolder;
      color: #2c2b9e;
      font-size: 24px;
      letter-spacing: 5px;
    }
  }
}
.drag-limit {
  position: absolute;
  z-index: -1;
  border: 3px dashed #abbcda;
}
</style>
