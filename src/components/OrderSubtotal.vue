<template>
  <div>
    <div class="orders-subtotal-box">
      <div>
        <span style="margin-right: 10px">訂單小計{{ sendErrMsg }}</span>
        <span
          ><span class="currency-symbol">$</span>{{ formattedSubtotal }}</span
        >
      </div>
      <div>
        <nut-button type="primary" @click="sendOrder">確認訂單</nut-button>
      </div>
    </div>
    <div>
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
                      <img :src="imgList[item.id]" alt="" />
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

                <nut-button type="primary" @click="sendMessage"
                  >測試後端傳送訊息</nut-button
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
import { imgList, imgStrList } from "@/assets/imageList";
import axios from "axios";

const sendMessage = async () => {
  try {
    const response = await axios.post("http://shower.zapto.org:8081/api/send-message", {
      userId: "U25ceabbfde2e717ef5206fbc44a7dccd",
      message: "測試消息",
    });
    console.log("消息已發送", response.data);
  } catch (error) {
    console.error("消息發送失敗", error);
  }
};

const sendMessageToLine = async () => {
  const accessToken = '1HJLBjGsLWnQqUlCSg8Av2qRlCpKxgtVQblbe8haBBVwN40XWrsMDPP1UVpkcl'; // 替換為你的 Access Token
  const userId = 'U25ceabbfde2e717ef5206fbc44a7dccd'; // 替換為目標聊天室的 User ID

  const url = 'https://api.line.me/v2/bot/message/push';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };

  const body = JSON.stringify({
    to: userId,
    messages: [
      {
        type: 'text',
        text: 'Hello! 這是從外部網頁發送的訊息。',
      },
    ],
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    if (response.ok) {
      console.log('訊息發送成功');
    } else {
      const errorData = await response.json();
      console.error('發送失敗', errorData);
    }
  } catch (error) {
    console.error('發送過程中出現錯誤', error);
  }
};

const userId = ref("")
liff
  .init({ liffId: "2006541842-EJ6dB3lV" })
  .then(() => {
    if (!liff.isLoggedIn()) {
      // 使用者未登入，執行登入動作
      liff.login();
      
    } else {
      liff.getProfile()
        .then(profile => {
          userId.value = profile.userId; // 獲取 userId
          console.log("使用者 ID:", userId);
        })
      // 使用者已登入，執行後續操作
    }
  })
  .catch((err) => {
    // LIFF 初始化失敗
    console.error(err);
  });

const orderStore = useOrderStore();

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
const sendErrMsg = ref("");
const sendOrder = () => {
  const cartItems = orderStore.items.flatMap((item, index) => [
    {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `${item.name}`,
              size: "lg",
              weight: "bold",
              wrap: true,
            },
            {
              type: "text",
              text: `數量：${item.quantity}`,
              size: "sm",
              color: "#666666",
              wrap: true,
              margin: "sm",
            },
            {
              type: "text",
              text: `總價：NT$${item.price * item.quantity}`,
              size: "sm",
              color: "#333333",
              wrap: true,
              margin: "sm",
            },
            item.addonsSummary && {
              type: "text",
              text: item.addonsSummary.replace(/\s*\/\s*/g, "\n").trim(),
              size: "sm",
              color: "#555555",
              wrap: true,
              margin: "sm",
            },
          ].filter(Boolean),
          spacing: "sm",
          flex: 3,
        },
        {
          type: "image",
          url: `https://shower.zapto.org/images/${imgStrList[item.id]}.jpg`,
          size: "md",
          aspectMode: "cover",
          aspectRatio: "1:1",
          gravity: "center",
          flex: 1,
        },
      ],
      margin: "lg",
    },
    {
      type: "separator",
      margin: "md",
    },
  ]);
  
  const flexMessage: any = {
    type: "flex",
    altText: "購物車內容",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "購物車內容",
            weight: "bold",
            size: "lg",
            align: "center",
            margin: "md",
          },
          {
            type: "separator",
            margin: "md",
          },
          ...cartItems,
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "總金額",
                weight: "bold",
                size: "sm",
                flex: 2,
                wrap: true,
              },
              {
                type: "text",
                text: `NT$${subtotal.value}`,
                weight: "bold",
                size: "sm",
                flex: 1,
                align: "end",
                wrap: true,
              },
            ],
            margin: "md",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            action: {
              type: "uri",
              label: "前往結帳",
              uri: "https://your-checkout-url.com",
            },
          },
        ],
      },
    },
  };

  console.log("flexMessage", JSON.stringify(flexMessage.contents));

  
  // liff
  //   .sendMessages([flexMessage])
  //   .then((res) => {
  //     liff.closeWindow();
  //   })
  //   .catch((err) => {
  //     sendErrMsg.value = err;
  //     console.error("發送失敗", err);
  //   });


// const client = new line.Client({
//   channelAccessToken: '1HJLBjGsLWnQqUlCSg8Av2qRlCpKxgtVQblbe8haBBVwN40XWrsMDPP1UVpkcl/12IuGq49igjvHiwz+jx1KX88orXaOyD4+shSKsKNBCz1M0LMUsVR2uXMk3uk1EToccTUogodu3105OjVi3uNdYQdB04t89/1O/w1cDnyilFU=',
// });

// const message = {
//   type: 'text',
//   text: '這是一條測試訊息',
// };

// client.pushMessage('U25ceabbfde2e717ef5206fbc44a7dccd', message)
//   .then(() => {
//     console.log('訊息發送成功');
//   })
//   .catch((err:any) => {
//     console.error('發送失敗', err);
//   });

sendMessageToLine()
};






// 更新品項數量
const updateQuantity = (item: any) => {
  orderStore.updateItemQuantity(item.id, item.quantity, item.addons);
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

.shopping-cart-btn {
  padding: 0;
  position: fixed;
  bottom: 90px;
  right: 15px;
  border-radius: 50%;
  width: 50px;
  height: 50px;
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
</style>
