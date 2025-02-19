<template>
  <div class="switch-container" @click="toggleSwitch">
    <div :class="{ 'switch-thumb': true, active: modelValue }"></div>
    <div class="switch-label">{{
      modelValue ? activeText : inactiveText
    }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  activeText: { type: String, required: true },
  inactiveText: { type: String, required: true },
});

// 定義 Emits
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: boolean): void;
}>();

// 切換開關的狀態
const toggleSwitch = () => {
  const newValue = !props.modelValue;
  emit("update:modelValue", newValue);
  emit("change", newValue); // 發出 change 事件
};
</script>

<style scoped>
.switch-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.switch-thumb {
  width: 40px;
  height: 20px;
  background-color: #ccc;
  border-radius: 10px;
  position: relative;
  transition: background-color 0.3s ease;
}

.switch-thumb::after {
  content: "";
  width: 16px;
  height: 16px;
  background-color: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
}

.switch-thumb.active {
  background-color: #42b983;
}

.switch-thumb.active::after {
  transform: translateX(20px);
}

.switch-label {
  margin-top: 6px;
  font-size: 14px;
  color: #333;
}
</style>
