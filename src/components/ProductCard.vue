<template>
  <div v-show="!isLoaded" class="product-card-box" @click="openDialog">
    <CardImg @load="isLoaded = false" :productImg="productImg"></CardImg>
    <!-- <div class="img-box"><img :src="productImg" alt="" /></div> -->
    <div class="name-box">
      <span>{{ productName }}</span>
    </div>
    <div class="price-box">
      <span class="currency-symbol">$</span>{{ productPrice }}
    </div>
    <span class="product-card-badge" v-if="cartQuantity > 0">{{
      cartQuantity
    }}</span>
  </div>

  <div v-if="isLoaded" class="product-card-box skeleton-box">
    <CardImg></CardImg>
    <div class="name-box">
      <span class="skeleton-text"></span>
    </div>
    <div class="price-box"><span class="skeleton-text small"></span></div>
  </div>

  <div class="dialog-box">
    <nut-dialog
      :no-footer="true"
      v-model:visible="dialogTableVisible"
      custom-class="dialog"
    >
      <template #default>
        <div class="dialog-content-box">
          <div>
            <nut-button
              class="dialog-back-btn"
              type="default"
              @click="closeDialog"
            >
              <template #icon>
                <CloseLittle color="white" width="10px" />
              </template>
            </nut-button>
          </div>
          <div class="dialog-scroll-box">
            <div class="dialog-img-box">
              <img
                :class="{ skeleton: isDialogImgLoaded }"
                @load="isDialogImgLoaded = false"
                :src="productImg"
                alt=""
              />
            </div>
            <div class="dialog-info-box">
              <div class="dialog-title-box">
                <div>{{ productName }}</div>
              </div>
              <div
                class="dialog-product-content-box"
                v-html="contentHtml"
              ></div>
              <div class="dialog-product-price-box">
                <span class="currency-symbol">NT$</span>{{ productPrice }}
              </div>
              <template
                v-for="(addonGroup, index) in (addChoose as Choose[])"
                :key="index"
              >
                <div
                  class="dialog-product-addons-box"
                  v-if="addonGroup.options.length"
                >
                  <div class="group-title-box">
                    <h3 class="group-title">選擇{{ addonGroup.title }}</h3>
                  </div>

                  <div
                    class="addons-options"
                    v-for="addon in addonGroup.options"
                    :key="addon.name"
                  >
                    <label class="addon-option">
                      <div class="title">
                        <input
                          :type="addonGroup.multiple ? 'checkbox' : 'radio'"
                          :value="addon"
                          :name="addonGroup.title"
                          v-model="selectedAddOns[addonGroup.title]"
                        />
                        <span
                          v-if="addonGroup.multiple"
                          class="custom-checkbox"
                        ></span>
                        <span
                          v-if="!addonGroup.multiple"
                          class="custom-radio"
                        ></span>
                        <span>{{ addon.name }}</span>
                      </div>
                      <span class="addon-price" v-if="addon.price > 0"
                        >+NT${{ addon.price }}</span
                      >
                    </label>
                  </div>
                </div>
              </template>
            </div>

            <div class="dialog-btn-box">
              <div class="dialog-num-box">
                <nut-input-number
                  v-model="countNumber"
                  :button-size="30"
                  :input-width="50"
                  readonly
                />
              </div>

              <div class="dialog-add-order-box">
                <nut-button size="large" type="primary" @click="addToOrder">
                  <span class="dialog-add-order-btn">
                    選好了
                    <span>
                      <span class="currency-symbol">$</span
                      ><span>{{ calculatedPrice }}</span>
                    </span>
                  </span>
                </nut-button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </nut-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useOrderStore } from "@/stores/orderStore";
import { CloseLittle } from "@nutui/icons-vue";
import CardImg from "@/components/CardImg.vue";
import type { ProductSetting, Choose, Option } from "@/interface/product";

const isLoaded = ref(true);
const isDialogImgLoaded = ref(true);

const orderStore = useOrderStore();

// Props 定義
const props = defineProps({
  productId: { type: String, required: true },
  productImg: { type: String, required: true },
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  cartQuantity: { type: Number, required: true },
  contentHtml: { type: String, required: true },
  addChoose: { type: Array as () => Choose[], required: true },
});

// 組件類型問題，所以用any
const countNumber = ref<any>(1);
const dialogTableVisible = ref<boolean>(false);

// 已選擇的加料選項
const resetAddOns = () => {
  return props.addChoose.reduce((acc, item) => {
    if (item.multiple) {
      // 多選直接回傳符合條件的陣列
      acc[item.title] = item.options.filter((opt) => opt.default);
    } else {
      // 單選找到預設值則包成陣列，否則回傳空陣列
      const defaultOpt = item.options.find((opt) => opt.default);
      acc[item.title] = defaultOpt ? [defaultOpt] : [];
    }
    return acc;
  }, {} as Record<string, Option[]>);
};

const selectedAddOns = ref(resetAddOns());

// 計算當前選項的總價 (單價 * 數量)
const calculatedPrice = computed(() => {
  let addonsPrice = 0;
  for (const key in selectedAddOns.value) {
    const addon = selectedAddOns.value[key];
    if (addon.length > 0) {
      addonsPrice += addon.reduce((sum, item) => sum + item.price, 0);
    }
  }
  return (props.productPrice + addonsPrice) * parseInt(countNumber.value, 10);
});

// 開啟對話框並重設選項
const openDialog = () => {
  dialogTableVisible.value = true;
  countNumber.value = 1;
  selectedAddOns.value = resetAddOns();
  isDialogImgLoaded.value = true;
};

// 關閉對話框
const closeDialog = () => {
  dialogTableVisible.value = false;
};

// 新增到購物車
const addToOrder = () => {
  orderStore.addItem({
    id: props.productId,
    name: props.productName,
    price: calculatedPrice.value,
    quantity: parseInt(countNumber.value, 10),
    addons: selectedAddOns.value,
    img: props.productImg,
  });
  closeDialog();
};
</script>

<style scoped>
.dialog-box :deep(.nut-popup) {
  width: 90%;
  border: 2px solid #ffb6d8;
  height: auto;
  max-height: 97vh;
  overflow: hidden;
}

.dialog-box :deep(.nut-button) {
  width: 100%;
}

.dialog-box :deep(.nut-dialog__content) {
  overflow: hidden;
}

.dialog-box :deep(.nut-button--round) {
  border-radius: 16px;
}

.dialog-box :deep(.dialog) {
  width: 100%;
  height: 100%;
  display: block;
  padding: 0;

  .dialog-content-box {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 3% 0;
    box-sizing: border-box;
    overflow: hidden;
    .dialog-back-btn {
      position: absolute;
      top: clamp(5px, 2vw, 10px);
      right: clamp(5px, 2vw, 10px);
      padding: 0;
      width: clamp(32px, 8vw, 40px);
      height: clamp(32px, 8vw, 40px);
      border-radius: 30%;
      z-index: 999;
      opacity: 0.8;
      background-color: rgba(0, 0, 0, 0.308);
    }
    .dialog-scroll-box {
      max-height: calc(97vh - 92px);
      overflow: auto;
      .dialog-img-box {
        width: 100%;
        padding: clamp(10px, 3vw, 20px);
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
          width: clamp(200px, 60vw, 300px);
          height: clamp(200px, 60vw, 300px);
          object-fit: cover;
          border-radius: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        @media screen and (min-width: 768px) {
          img {
            width: clamp(250px, 40vw, 350px);
            height: clamp(250px, 40vw, 350px);
          }
        }

        @media screen and (min-width: 1024px) {
          img {
            width: clamp(300px, 30vw, 400px);
            height: clamp(300px, 30vw, 400px);
          }
        }
      }
      .dialog-img-box.skeleton {
        height: 300px;
      }
      .dialog-info-box {
        padding: clamp(10px, 3vw, 15px);
        height: auto;
        .dialog-title-box {
          display: flex;
          padding: clamp(10px, 3vw, 15px) 0 clamp(20px, 5vw, 30px) 0;

          div {
            font-size: clamp(20px, 4vw, 26px);
            color: var(--nut-serious-font);
            font-weight: bolder;
          }
        }
        .dialog-product-content-box {
          font-size: clamp(14px, 3vw, 16px);
          line-height: 1.5;
        }
      }
      .dialog-product-price-box {
        border-bottom: 1px solid #ffb6d86c;
        margin-top: clamp(20px, 5vw, 30px);
        font-size: clamp(20px, 4vw, 26px);
        padding-bottom: clamp(15px, 4vw, 20px);
        margin-bottom: clamp(15px, 4vw, 20px);
        span {
          margin-right: 5px;
        }
      }
      .dialog-product-addons-box {
        margin-bottom: clamp(15px, 4vw, 20px);
        .addons-options {
          display: flex;
          flex-direction: column;
          margin-top: 10px;
        }
        .group-title-box {
          width: 100%;
          display: flex;
          justify-content: start;
          padding: clamp(8px, 2vw, 10px) 0;
          .group-title {
            font-size: clamp(16px, 3.5vw, 20px);
          }
        }

        /* 整體容器樣式 */
        .addon-option {
          font-size: clamp(14px, 3vw, 16px);
          margin-bottom: clamp(6px, 2vw, 8px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .addon-option .title {
          display: flex;
          align-items: center;
        }

        /* 隱藏原生 checkbox */
        .addon-option input[type="checkbox"] {
          appearance: none; /* 移除預設樣式 */
          -webkit-appearance: none; /* 適用 iOS Safari */
          -moz-appearance: none; /* 適用 Firefox */
          display: none; /* 完全隱藏 */
        }

        /* 自定義 checkbox 外觀 */
        .addon-option .custom-checkbox {
          display: inline-block;
          width: clamp(16px, 4vw, 18px);
          height: clamp(16px, 4vw, 18px);
          border: 2px solid var(--nut-primary-color); /* 邊框顏色 */
          border-radius: 4px; /* 圓角 */
          position: relative;
          background-color: #fff; /* 預設背景色 */
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          margin-right: clamp(8px, 2vw, 10px); /* 與文字間距 */
        }

        /* 選中時的背景顏色與邊框 */
        .addon-option input[type="checkbox"]:checked + .custom-checkbox {
          background-color: var(--nut-primary-color);
          border-color: var(--nut-primary-color);
        }

        /* 自定義打勾符號 */
        .addon-option input[type="checkbox"]:checked + .custom-checkbox::after {
          content: "";
          position: absolute;
          width: 5px;
          height: 10px;
          border: solid #fff; /* 打勾符號顏色 */
          border-width: 0 2px 2px 0;
          top: 2px;
          left: 6px;
          transform: rotate(45deg);
        }

        /* 隱藏原生 radio 按鈕 */
        .addon-option input[type="radio"] {
          appearance: none; /* 移除預設樣式 */
          -webkit-appearance: none; /* 適用 iOS Safari */
          -moz-appearance: none; /* 適用 Firefox */
          display: none; /* 完全隱藏 */
        }

        /* 自定義 radio 外觀 */
        .addon-option .custom-radio {
          display: inline-block;
          width: clamp(16px, 4vw, 18px);
          height: clamp(16px, 4vw, 18px);
          border: 2px solid var(--nut-primary-color); /* 邊框顏色 */
          border-radius: 50%; /* 圓形 */
          position: relative;
          background-color: #fff; /* 預設背景色 */
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          margin-right: clamp(8px, 2vw, 10px); /* 與文字間距 */
        }

        /* 選中時的背景顏色與邊框 */
        .addon-option input[type="radio"]:checked + .custom-radio {
          background-color: var(--nut-primary-color);
          border-color: var(--nut-primary-color);
        }

        /* 自定義選中符號（圓點） */
        .addon-option input[type="radio"]:checked + .custom-radio::after {
          content: "";
          position: absolute;
          width: 8px; /* 圓點大小 */
          height: 8px; /* 圓點大小 */
          background-color: #fff; /* 圓點顏色 */
          border-radius: 50%; /* 圓形 */
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        /* 價格樣式 */
        .addon-option .addon-price {
          font-size: clamp(14px, 3vw, 16px);
          color: #555;
        }
      }
    }

    .dialog-btn-box {
      display: flex;
      position: sticky;
      bottom: 0;
      padding: 0 clamp(15px, 4vw, 20px);
      height: clamp(50px, 12vw, 60px);
      background-color: white;
      .dialog-num-box {
        display: flex;
        justify-content: center;
        margin: clamp(20px, 5vw, 30px) 0;
        margin-right: clamp(10px, 3vw, 15px);
      }
      .dialog-add-order-box {
        margin: auto 0;
        flex: 1;
        border-color: var(--nut-primary-color);
        display: flex;
        align-items: center;
        width: 200px;
        .dialog-add-order-btn {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: clamp(16px, 3.5vw, 20px);
          font-weight: 800;
        }
      }
    }
  }
}

.product-card-box {
  border: 2px solid var(--nut-primary-color-transparent);
  position: relative;
  width: calc((100% - 20px) / 2);
  height: clamp(120px, 40vw, 180px);
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-sizing: border-box;
  padding: 15px;
  border-radius: 15px;
  cursor: pointer;

  @media screen and (min-width: 768px) {
    width: calc((100% - 60px) / 4);
    height: clamp(180px, 25vw, 190px);
    margin-top: 90px;
  }

  @media screen and (min-width: 1024px) {
    width: calc((100% - 80px) / 5);
    height: clamp(190px, 20vw, 200px);
    margin-top: 100px;
  }

  .name-box {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 40px;

    span {
      font-size: clamp(14px, 2.5vw, 16px);
      text-align: center;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word; /* 確保長單字會換行 */

      @media screen and (min-width: 768px) {
        font-size: clamp(16px, 1.8vw, 18px);
      }

      @media screen and (min-width: 1024px) {
        font-size: clamp(18px, 1.5vw, 20px);
      }
    }
  }

  .price-box {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: clamp(14px, 2.5vw, 16px);
    padding: 5px 0;

    @media screen and (min-width: 768px) {
      font-size: clamp(16px, 1.8vw, 18px);
    }

    @media screen and (min-width: 1024px) {
      font-size: clamp(18px, 1.5vw, 20px);
    }

    .currency-symbol {
      margin-right: 2px;
    }
  }

  .product-card-badge {
    width: 26px;
    height: 26px;
    position: absolute;
    top: -60px;
    right: calc(50% - 60px + 5px);
    background-color: rgb(255, 168, 39);
    color: #fff;
    align-items: center;
    display: flex;
    border-radius: 50%;
    justify-content: center;
    z-index: 2;
    font-size: 14px;

    @media screen and (min-width: 768px) {
      width: 30px;
      height: 30px;
      top: -43%;
      right: calc(50% - 70px + 5px);
      font-size: 16px;
    }

    @media screen and (min-width: 1024px) {
      width: 32px;
      height: 32px;
      top: -80px;
      right: calc(50% - 80px + 5px);
    }
  }
}

/* 添加平滑過渡效果 */
.product-card-box,
.img-box,
.product-card-badge {
  transition: all 0.3s ease-in-out;
}

@media screen and (min-width: 768px) {
  .dialog-box :deep(.nut-popup) {
    width: 80%;
    max-width: 600px;
  }

  .dialog-box :deep(.dialog) {
    .dialog-content-box {
      .dialog-scroll-box {
        .dialog-img-box img {
          height: clamp(250px, 45vh, 350px);
        }

        .dialog-info-box {
          padding: clamp(15px, 2vw, 20px);

          .dialog-title-box div {
            font-size: clamp(22px, 2.5vw, 26px);
          }

          .dialog-product-content-box {
            font-size: clamp(15px, 1.8vw, 16px);
          }
        }
      }
    }
  }
}

@media screen and (min-width: 1024px) {
  .dialog-box :deep(.nut-popup) {
    width: 70%;
    max-width: 800px;
  }

  .dialog-box :deep(.dialog) {
    .dialog-content-box {
      .dialog-scroll-box {
        .dialog-img-box img {
          height: clamp(300px, 50vh, 400px);
        }

        .dialog-info-box {
          padding: 20px;

          .dialog-title-box div {
            font-size: 26px;
          }

          .dialog-product-content-box {
            font-size: 16px;
          }
        }
      }
    }
  }
}
</style>
