<script setup lang="ts">
import { shallowRef } from "vue";
import { useDrag } from "./use/drag"

const el = shallowRef()
const limit = shallowRef()
const { x, y, isDragging, style } = useDrag(el, { limitDOM: limit })

</script>

<template>
  <div>
    <div ref="limit" style="height:500px;width:100%;border: 1px solid yellow;">
      我是限制框
    </div>
    <div></div>
    <div ref="el" :style="style" style="position: fixed;border: 1px solid red;">
      <div style="width:100px;height:100px;">
        x:{{ x }}
        y:{{ y }}
        isDragging:{{ isDragging }}
      </div>

    </div>
  </div>
</template>

<style scoped></style>
