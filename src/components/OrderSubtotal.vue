<template>
  <div>
    <div class="orders-subtotal-box">
      <div>
        <span style="margin-right: 10px">訂單小計</span>
        <span
          ><span class="currency-symbol">$</span>{{ formattedSubtotal }}</span
        >
      </div>
      <div>
        <nut-button type="primary" @click="sendOrder">確認訂單</nut-button>
      </div>
    </div>
    <div>
      <!-- <div class="line-btn-box">
        <div
          class="line-circle-btn"
          @click="redirectToLine('line')"
        >
          <img
            src="/images/LINE_Brand_icon.png"
            alt="LINE Logo"
          />
        </div>
      </div> -->

      <nut-button
        class="shopping-cart-btn"
        type="warning"
        @click="showShoppingCart"
      >
        <template #icon>
          <div class="shopping-cart-icon-box">
            <Cart2 width="100px" />
            <span v-if="orderStore.items.length > 0" class="badge">{{
              orderStore.items.length
            }}</span>
          </div>
        </template>
      </nut-button>
      <!-- 訂單數量徽章 -->

      <div class="order-subtotal-dialog-box">
        <nut-dialog
          :no-footer="true"
          v-model:visible="isCartOpen"
          custom-class="dialog"
        >
          <template #default>
            <div class="dialog-content">
              <div>
                <span class="cart-title">訂單明細</span>
              </div>
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
                      <nut-input-number
                        v-model="item.quantity"
                        :button-size="20"
                        :input-width="30"
                        readonly
                        min="0"
                        @change="updateQuantity(item)"
                      />
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
              <div class="dialog-total-count">
                小計<span>{{ orderStore.items.length }}</span
                >項<span>/</span>共<span
                  ><span class="currency-symbol">$</span
                  >{{ formattedSubtotal }}</span
                >
              </div>
              <div class="dialog-footer">
                <nut-button
                  class="back-btn"
                  type="default"
                  @click="isCartOpen = false"
                >
                  回目錄
                </nut-button>
                <nut-button type="primary" @click="sendOrder"
                  >送出訂單</nut-button
                >
              </div>
            </div>
          </template>
        </nut-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useOrderStore } from "@/stores/orderStore";
import liff from "@line/liff";
import { Cart2 } from "@nutui/icons-vue";
import { sendLineMessage } from "@/utils/lineUtils";
import { useRouter } from "vue-router";
import { showNotify } from "@nutui/nutui";

const orderStore = useOrderStore();
console.log("orderStore", orderStore.items);

// 計算訂單小計
const subtotal = computed(() => {
  return orderStore.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

const isCartOpen = ref(false);

const showShoppingCart = () => {
  isCartOpen.value = true;
};

const router = useRouter();
const sendOrder = () => {
  if (orderStore.items.length === 0) {
    showNotify.danger("請先選擇商品");
    return;
  }
  router.push({ name: "order-confirm" });
};

// 更新品項數量
const updateQuantity = (item: any) => {
  orderStore.updateItemQuantity(
    item.id,
    parseInt(item.quantity, 10),
    item.addons
  );
};

// 格式化小計為貨幣格式
const formattedSubtotal = computed(() => {
  return `${subtotal.value.toFixed()}`;
});
</script>

<style scoped>
.orders-subtotal-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed; /* 固定在底部 */
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgb(231, 231, 231);
  z-index: 10;
  padding: 10px 30px 20px 30px;

  div {
    background-color: rgb(231, 231, 231);
  }
}

.order-subtotal-dialog-box {
  .dialog-content {
    padding: 25px 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;

    .cart-title {
      color: #000;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    div {
      background-color: white;
    }
    .cart-items {
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

    .dialog-total-count {
      padding: 15px;
      background-color: var(--nut-primary-color);
      font-size: 20px;
      border-radius: 5px;
      color: white !important;
      margin-bottom: 20px;
      span {
        margin: 0 5px;
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: center;
      .back-btn {
        margin-right: 20px;
      }
    }
  }
}
.order-subtotal-dialog-box :deep(.nut-dialog__content) {
  max-height: 90vh;
  margin: 0;
}
.order-subtotal-dialog-box :deep(.nut-popup) {
  padding: 0;
  width: 90%;
}
.order-subtotal-dialog-box :deep(.dialog) {
  width: 100%;
  padding: 0;
  height: 90vh;
}
.shopping-cart-btn {
  padding: 0;
  position: fixed;
  bottom: 90px;
  right: 15px;
  border-radius: 50%;
  width: 50px;
  height: 50px;
}
.shopping-cart-icon-box {
  position: relative;
  background: unset !important;
  color: white !important;
  display: flex;
  align-items: center;
  .badge {
    width: 20px;
    height: 20px;
    position: absolute;
    top: -20px;
    right: 24px;
    background-color: #e53a3a;
    color: white;
    align-items: center;
    display: flex;
    border-radius: 50%;
    justify-content: center;
  }
}
.line-btn-box {
  position: fixed;
  bottom: 155px;
  right: 15px;
  background-color: #00000000;
  .line-circle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px; /* 按鈕的寬度 */
    height: 50px; /* 按鈕的高度 */
    background-color: #00c300; /* LINE 的官方綠色 */
    color: white;
    border-radius: 50%; /* 使按鈕變成圓形 */
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease; /* 平滑過渡效果 */
  }

  .line-circle-btn img {
    width: 30px; /* 圖標的寬度 */
    height: 30px; /* 圖標的高度 */
  }
}
</style>
