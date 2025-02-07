<template>
  <div class="container">
    <div class="header">
      <nut-navbar title="布蕾PICK-後台" left-show @click-back="onClick">
        <template #left>
          <div>回首頁</div>
        </template>
        <template #right>
          <div class="menu-item">
            <nut-menu>
              <nut-menu-item v-model="val1" :options="options1" />
            </nut-menu>
          </div>
        </template>
      </nut-navbar>
    </div>
    <div class="setting-contant">
      <ProductSetting></ProductSetting>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import ProductSetting from "@/components/setting/ProductSetting.vue";

const val1 = ref(0);
const options1 = ref([{ text: "商品設定", value: 0 }]);

const router = useRouter();
const onClick = () => {
  router.push({ name: "order" });
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

.menu-item :deep(.nut-menu__bar) {
  box-shadow: unset;
}

.setting-contant {
  width: 100vw;
  /* height: calc(100vh - 44px); */
  padding: 20px;
  box-sizing: border-box;
  margin-top: 44px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
