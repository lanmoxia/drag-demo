<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";

import { ref } from "vue";
import { useDraggable } from "@/composables/useDraggable";

const boxRef = ref<HTMLImageElement | null>(null);

const { x, y } = useDraggable(boxRef, {
  draggingClass: "dg",
});

const img = ref<HTMLImageElement | null>(null);

useDraggable(img);
</script>

<template>
  <div>
    <img src="/vite.svg" class="logo" alt="Vite logo" ref="img" />

    <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
  </div>
  <div class="box" ref="boxRef">
    x:{{ x }}
    <br />
    y:{{ y }}
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.box {
  width: 200px;
  height: 200px;
  background-color: red;
}
.box.dg {
  background-color: green;
}
</style>
