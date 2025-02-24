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
  width: clamp(100px, 30vw, 120px);
  height: clamp(100px, 30vw, 120px);
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translate(-50%);
  background-color: rgba(0, 0, 0, 0);
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;

  @media screen and (min-width: 768px) {
    width: clamp(120px, 15vw, 140px);
    height: clamp(120px, 15vw, 140px);
    top: -70px;
  }

  @media screen and (min-width: 1024px) {
    width: clamp(140px, 12vw, 160px);
    height: clamp(140px, 12vw, 160px);
    top: -80px;
  }
}

.img-box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.img-box:hover img {
  transform: scale(1.05);
}

img-box-loaded {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
