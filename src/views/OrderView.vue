<template>
  <div class="container">
    <div class="header">
      <ProductTabs />
    </div>
    <div class="content">
      <ProductList class="product-list" />
    </div>
    <div class="footer">
      <OrderSubtotal />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductTabs from "@/components/ProductTabs.vue";
import ProductList from "@/components/ProductList.vue";
import OrderSubtotal from "@/components/OrderSubtotal.vue";

import { ref, onMounted } from "vue";
import liff from "@line/liff";

const userProfile = ref();

onMounted(async () => {
  try {
    // 初始化 LIFF
    await liff.init({ liffId: "2006541842-EJ6dB3lV" });
    console.log("LIFF 初始化成功");

    // 檢查是否已登入
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      userProfile.value = profile;
    } else {
      console.log("尚未登入");
    }
  } catch (error) {
    console.error("LIFF 初始化失敗", error);
  }
});

// 登入方法
const login = () => {
  liff.login();
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 保持視口高度 */
  width: 100vw;
}

.header {
  position: fixed; /* 固定在頂部 */
  top: 0;
  left: 0;
  right: 0;
  z-index: 10; /* 確保在其他元素之上 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 添加陰影 */
}

.content {
  margin-top: 70px; /* 為 header 預留空間 */
  margin-bottom: 70px; /* 為 footer 預留空間 */
  flex: 1; /* 佔據剩餘空間 */
  overflow-y: auto; /* 可滾動 */
  overflow-x: hidden;
}

.footer {
  width: 100vw;
}
</style>
