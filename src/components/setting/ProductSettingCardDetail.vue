<template>
  <div v-if="isDialogVisible" class="dialog-box">
    <nut-dialog v-model:visible="show" custom-class="dialog">
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
            <div class="dialog-img-box" @click="openChangeImg">
              <input
                type="file"
                accept="image/*"
                ref="imgInput"
                @change="handleImgUpload"
                class="hidden-input"
              />
              <img
                :class="{ skeleton: isDialogImgLoaded }"
                @load="isDialogImgLoaded = false"
                :src="productData.img"
                :key="productData.img"
                alt=""
              />
              <div class="dialog-img-btn">
                <nut-button shape="square" type="primary">
                  點擊變更圖片
                </nut-button>
              </div>
            </div>
            <div class="dialog-info-box">
              <div class="dialog-title-box">
                <input v-model="productData.name" placeholder="商品名稱" />
              </div>
              <RichTextEditor
                :value="productData.htmlStr"
                @update-html="setUpdateContentHtml"
              />
              <div class="dialog-product-price-box">
                <span class="currency-symbol">NT$</span
                ><input
                  v-model="productData.price"
                  placeholder="商品價格"
                  type="number"
                />
              </div>

              <template
                v-for="(
                  productChoose, productChooseIndex
                ) in productData.choose"
                :key="productChooseIndex"
              >
                <div
                  class="dialog-product-options-box"
                  v-if="productChoose.options.length"
                >
                  <div class="group-title-box">
                    <input
                      v-model="productChoose.title"
                      style="width: 150px; margin-right: 8px"
                      placeholder="區塊名稱"
                    />
                    <nut-radio-group
                      v-model="productChoose.multiple"
                      direction="horizontal"
                      @change="optionMultipleChange(productChooseIndex)"
                    >
                      <nut-radio :label="true" shape="button" size="mini"
                        >複選</nut-radio
                      >
                      <nut-radio :label="false" shape="button" size="mini"
                        >單選</nut-radio
                      >
                    </nut-radio-group>
                    <div
                      style="margin-left: 10px"
                      @click="deleteoptionArea(productChooseIndex)"
                    >
                      <Del2 color="red" width="30px" />
                    </div>
                  </div>

                  <div
                    class="options-options"
                    v-for="(option, optionIndex) in productChoose.options"
                    :key="option.name"
                  >
                    <div>
                      <label class="option-option">
                        <div class="title">
                          <input
                            :type="
                              productChoose.multiple ? 'checkbox' : 'radio'
                            "
                            v-model="option.default"
                            @change="
                              onOptionChange(productChooseIndex, optionIndex)
                            "
                          />
                          <span
                            v-if="productChoose.multiple"
                            class="custom-checkbox"
                            :class="{ checked: option.default }"
                          ></span>
                          <span
                            v-if="!productChoose.multiple"
                            class="custom-radio"
                            :class="{ checked: option.default }"
                          ></span>
                        </div>
                      </label>
                      <input
                        v-model.lazy="option.name"
                        style="width: 130px"
                        placeholder="選項名稱"
                      />
                    </div>
                    <div>
                      <span class="option-price"
                        >+NT$<input
                          v-model="option.price"
                          type="number"
                          style="width: 50px; margin-left: 5px"
                          placeholder="價格"
                      /></span>
                      <div
                        style="
                          margin-left: 10px;
                          display: flex;
                          align-items: center;
                        "
                        @click="deleteoption(productChooseIndex, optionIndex)"
                      >
                        <Del2 color="red" width="20px" />
                      </div>
                    </div>
                  </div>
                  <div class="add-item-button-box">
                    <nut-button
                      @click="addOptione(productChooseIndex)"
                      shape="square"
                      size="small"
                      plain
                      type="primary"
                      >添加一項</nut-button
                    >
                  </div>
                </div>
              </template>

              <nut-button type="primary" @click="addoptionArea"
                >新增區塊</nut-button
              >
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="dialog-footer-box">
          <nut-button type="default" @click="closeDialog">取消</nut-button>
          <nut-button type="primary" @click="sendUpdate">送出更新</nut-button>
          <Switch
            v-model="productData.isPublished"
            activeText="已發佈"
            inactiveText="未發佈"
            @change="changeIsPublished"
          />
        </div>
      </template>
    </nut-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import RichTextEditor from "@/components/richTextEditor/RichTextEditor.vue";
import { CloseLittle, Del2 } from "@nutui/icons-vue";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { storage, db } from "@/firebase";
import type { ProductSetting, Choose } from "@/interface/product";
import Switch from "@/components/Switch.vue";
import { doc, updateDoc } from "firebase/firestore";
import { showNotify } from "@nutui/nutui";
import { inject } from "vue";

// ====== Props ======
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  product: {
    type: Object as () => {
      index: number;
      id: string;
      name: string;
      img: string;
      price: number;
      htmlStr: string;
      choose: Choose[];
      isPublished: boolean;
    },
    required: true,
  },
});

const isDialogImgLoaded = ref(true);

const productData = ref({ ...props.product });

// ====== 初始化數據 ======
const show = ref(true);

// ====== 事件發射器 ======
const emit = defineEmits(["update:modelValue"]);

// ====== 關閉對話框 ======
const closeDialog = () => {
  isDialogImgLoaded.value = true;
  show.value = false;
  emit("update:modelValue", false);
};

const isDialogVisible = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      isDialogVisible.value = true;
      show.value = true;
    } else {
      show.value = false;
      setTimeout(() => {
        isDialogVisible.value = false; // 避免立刻銷毀導致動畫異常
      }, 300); // 設定動畫時間
    }
  }
);

// ====== 方法區: 加料區塊控制 ======
const optionMultipleChange = (productChooseIndex: number) => {
  productData.value.choose[productChooseIndex].options.forEach((element) => {
    element.default = false;
  });
};

const onOptionChange = (productChooseIndex: number, optionIndex: number) => {
  let productChoose = productData.value.choose[productChooseIndex];
  if (!productChoose.multiple) {
    // 單選模式，將所有選項設為 false，然後將當前選項設為 true
    productChoose.options.forEach((option, index) => {
      option.default = index === optionIndex;
    });
  }
};

const deleteoption = (productChooseIndex: number, optionIndex: number) => {
  productData.value.choose[productChooseIndex].options =
    productData.value.choose[productChooseIndex].options.filter(
      (_, index) => index !== optionIndex
    );
};

const addoptionArea = () => {
  productData.value.choose.push({
    title: "",
    multiple: true,
    options: [{ name: "", price: 0, default: false }],
  });
};

const deleteoptionArea = (areaIndex: number) => {
  productData.value.choose = productData.value.choose.filter(
    (_, index) => index !== areaIndex
  );
};

const addOptione = (productChooseIndex: number) => {
  productData.value.choose[productChooseIndex].options.push({
    name: "",
    price: 0,
    default: false,
  });
};
// ====== 變更圖片 ======
const imgInput = ref<HTMLInputElement | null>(null);
let hasUploadFile: boolean = false;
let uploadFile: File | undefined;

const openChangeImg = () => {
  imgInput.value?.click();
};
const handleImgUpload = (event: Event) => {
  uploadFile = (event.target as HTMLInputElement).files?.[0];

  if (!uploadFile) {
    console.error("未選擇文件");
    return;
  }

  hasUploadFile = true;

  const reader = new FileReader();
  reader.onload = () => {
    productData.value.img = reader.result as string;
  };
  reader.readAsDataURL(uploadFile);
};

// ====== 送出更新 ======
type UpdateDataType = () => void; // 定義注入的函數類型
const updateData = inject<UpdateDataType>("updateData");

const sendUpdate = async () => {
  const documentReference = doc(db, "products", productData.value.id);
  await updateDoc(documentReference, {
    ...productData.value,
  });
  if (hasUploadFile && uploadFile) {
    const storagePath = `products/${productData.value.id}`;
    const fileRef = storageRef(storage, storagePath);
    await uploadBytes(fileRef, uploadFile);
  }
  // closeDialog();
  if (updateData) {
    updateData();
  } else {
    console.error("未找到 updateData 提供者");
  }
  showNotify.success("商品已更新", { duration: 1000 });
};

// ====== 更新商品發佈狀態 ======
const changeIsPublished = async () => {
  const documentReference = doc(db, "products", productData.value.id);
  await updateDoc(documentReference, {
    isPublished: productData.value.isPublished,
  });
  if (productData.value.isPublished) {
    showNotify.success("商品已發佈", { duration: 1000 });
  } else {
    showNotify.success("商品已下架", { duration: 1000 });
  }
};

// ====== 富文本編輯器 ======
const setUpdateContentHtml = (html: any) => {
  productData.value.htmlStr = html;
};
</script>

<style scoped>
.add-item-button-box :deep(.nut-button) {
  border: 1px dashed;
}

.dialog-box :deep(.nut-popup) {
  width: 90%;
  border: 2px solid #ffb6d8;
  height: auto;
  max-height: 97vh;
  overflow: hidden;

  @media screen and (min-width: 768px) {
    width: 80%;
    max-width: 600px;
  }

  @media screen and (min-width: 1024px) {
    width: 70%;
    max-width: 800px;
  }
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

.dialog-img-btn :deep(.nut-button) {
  background: rgba(0, 0, 0, 0);
  border-style: dashed;
  border-color: #fff;
  border-width: 1px 0 0 1px;
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
        .dialog-img-btn {
          position: absolute;
          bottom: 0px;
          right: 0px;
          background-color: rgba(0, 0, 0, 0);
        }
        .hidden-input {
          display: none;
        }
      }
      .dialog-info-box {
        padding: clamp(10px, 3vw, 15px);
        height: auto;
        .dialog-title-box {
          display: flex;
          padding: clamp(10px, 3vw, 15px) 0 clamp(20px, 5vw, 30px) 0;
          input {
            width: 100%;
            font-size: clamp(20px, 4vw, 26px);
            color: var(--nut-serious-font);
            font-weight: bolder;
          }
        }
        .dialog-product-content-box {
          white-space: normal; /* 預設：移除多餘空格 */
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
        input {
          width: 200px;
        }
      }
      .dialog-product-options-box {
        margin-bottom: clamp(15px, 4vw, 20px);
        .options-options {
          display: flex;
          margin: clamp(8px, 2vw, 10px) 0;
          font-size: clamp(14px, 3vw, 16px);
          align-items: center;
          justify-content: space-between;
          div {
            display: flex;
          }
        }
        .group-title-box {
          width: 100%;
          display: flex;
          justify-content: start;
          padding: clamp(8px, 2vw, 10px) 0;
          font-size: clamp(16px, 3.5vw, 20px);
          align-items: center;
        }

        /* 整體容器樣式 */
        .option-option {
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 25px;
        }

        .option-option .title {
          display: flex;
          align-items: center;
        }

        /* 隱藏原生 checkbox */
        .option-option input[type="checkbox"] {
          appearance: none; /* 移除預設樣式 */
          -webkit-appearance: none; /* 適用 iOS Safari */
          -moz-appearance: none; /* 適用 Firefox */
          display: none; /* 完全隱藏 */
        }

        /* 自定義 checkbox 外觀 */
        .option-option .custom-checkbox {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid var(--nut-primary-color); /* 邊框顏色 */
          border-radius: 4px; /* 圓角 */
          position: relative;
          background-color: #fff; /* 預設背景色 */
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          margin-right: 10px; /* 與文字間距 */
        }

        /* 選中時的背景顏色與邊框 */
        .option-option input[type="checkbox"] + .checked {
          background-color: var(--nut-primary-color);
          border-color: var(--nut-primary-color);
        }

        /* 自定義打勾符號 */
        .option-option input[type="checkbox"] + .checked::after {
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
        .option-option input[type="radio"] {
          appearance: none; /* 移除預設樣式 */
          -webkit-appearance: none; /* 適用 iOS Safari */
          -moz-appearance: none; /* 適用 Firefox */
          display: none; /* 完全隱藏 */
        }

        /* 自定義 radio 外觀 */
        .option-option .custom-radio {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid var(--nut-primary-color); /* 邊框顏色 */
          border-radius: 50%; /* 圓形 */
          position: relative;
          background-color: #fff; /* 預設背景色 */
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          margin-right: 10px; /* 與文字間距 */
        }

        /* 選中時的背景顏色與邊框 */
        .option-option input[type="radio"] + .checked {
          background-color: var(--nut-primary-color);
          border-color: var(--nut-primary-color);
        }

        /* 自定義選中符號（圓點） */
        .option-option input[type="radio"] + .checked::after {
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
        .option-option .option-price {
          display: flex;
          font-size: 16px;
          color: #555;
          align-items: center;
        }
      }
    }

    .dialog-btn-box {
      display: flex;
      position: sticky;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      height: 60px;
      .dialog-num-box {
        display: flex;
        justify-content: center;
        margin: 30px 0;
        margin-right: 15px;
      }
      .dialog-add-order-box {
        margin: auto 0;
        flex: 1;
        border-color: var(--nut-primary-color);
        display: flex;
        align-items: center;
        .dialog-add-order-btn {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: 20px;
          font-weight: 800;
        }
      }
    }
  }
  .dialog-footer-box {
    display: flex;
    gap: clamp(8px, 2vw, 10px);
    align-items: center;
    width: 60%;
  }
  .dialog-footer-box :deep(.nut-button) {
    flex: 1;
    font-size: clamp(14px, 3vw, 16px);
  }
}

/* 添加平滑過渡效果 */
.dialog-box,
.dialog-img-box,
img {
  transition: all 0.3s ease-in-out;
}
</style>
