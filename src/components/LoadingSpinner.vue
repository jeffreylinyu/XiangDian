<template>
    <div class="loading-spinner" v-if="visible">
      <div class="spinner"></div>
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  // Props 定義
  const props = defineProps({
    visible: { type: Boolean, required: true }, // 控制顯示/隱藏
    text: { type: String, default: "" }, // 可選的加載文字
  });
  </script>
  
  <style scoped>
  .loading-spinner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    z-index: 9999;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #ccc;
    border-top-color: var(--nut-primary-color, #007aff);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    margin-top: 10px;
    font-size: 16px;
    color: var(--nut-primary-color, #007aff);
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  </style>
  