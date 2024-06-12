<script setup lang="ts">
import dragComponent from '../common/drag-component/drag-component.vue';
import { PositionType } from '../common/drag-component/drag-api';

function positionChange(positionInfos: PositionType) {
  console.log('%c |→_→| 拖拽组件更新 |←_←| ', 'font-size: 18px', positionInfos);
}
</script>

<template>
  <drag-component
    :position="{ top: 960, left: 1000 }"  
    :limit-area="{ limitTop: 20, limitLeft: 800, limitHeight: 800, limitWidth: 1000 }"
    @position-change="positionChange"
  >
    <h2>拖拽元素1</h2>
    88888888888 88888888888 88888888888
  </drag-component>
  <drag-component
    :position="{ top: 200, left: 600 }"
    :limit-area="{ limitTop: 60, limitLeft: 20, limitHeight: 800, limitWidth: 1000 }"
    @position-change="positionChange"
  >
    <h5>拖拽元素2</h5>
    66666666666666666
  </drag-component>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
