<template>
  <div class="container">
    <div class="header">
      <nut-navbar title="確認訂單" left-show @click-back="backToHome">
        <template #left>
          <div>回首頁</div>
        </template>
      </nut-navbar>
    </div>
    <!-- 訂單內容 -->
    <div class="cart-items">
      <div
        v-for="(item, index) in orderStore.items"
        :key="item.id"
        class="cart-item"
      >
        <div class="item-info">
          <p class="item-name">{{ item.name }}</p>
          <p class="item-additional">{{ item.addonsSummary }}</p>
          <div class="dialog-num-box">
            {{ item.quantity }}
          </div>
        </div>
        <div>
          <div class="img-box">
            <img :src="item.img" alt="" />
            <p>
              <span class="currency-symbol">$</span
              >{{ item.price * item.quantity }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useOrderStore } from "@/stores/orderStore";
import { useRouter } from "vue-router";

const router = useRouter();
const backToHome = () => {
  router.push({ name: "order" });
};

const orderStore = useOrderStore();

// 計算訂單小計
const subtotal = computed(() => {
  return orderStore.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});
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

.cart-items {
  width: 100vw;
  /* height: calc(100vh - 44px); */
  padding: 20px;
  box-sizing: border-box;
  margin-top: 44px;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 10px;
  flex: 1;
  .cart-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid #ccc; /* 分隔線 */
    height: 80px;

    .item-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: start;
      .item-name {
        font-size: 20px;
        color: #000;
        margin-bottom: 10px;
      }
      .item-additional {
        margin-bottom: 10px;
      }
    }
    .img-box {
      font-size: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      img {
        width: 65px;
        height: 65px;
        border-radius: 50%;
        object-fit: cover;
      }
    }
  }
}

.cart-item:last-child {
  border-bottom: none;
}
</style>
