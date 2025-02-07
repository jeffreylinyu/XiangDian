<template>
  <div class="img-box">
    <img class="skeleton" />
  </div>

  <div v-if="productImg" class="img-box">
    <img @load="onLoad" :src="productImg" alt="" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps({
  productImg: { type: String, required: false },
});

const emit = defineEmits<{
  (e: "load"): void;
}>();

const isImgLoaded = ref(true);
const onLoad = () => {
  isImgLoaded.value = false;
  emit("load");
};
</script>

<style scoped>
.img-box {
  width: 75%;
  aspect-ratio: 1 / 1;
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translate(-50%);
  background-color: rgba(0, 0, 0, 0);
}

.img-box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

img-box-loaded {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
