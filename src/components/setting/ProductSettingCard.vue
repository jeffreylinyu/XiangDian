<template>
  <div v-if="isImgLoaded" class="product-card-box skeleton-box">
    <div class="img-box">
      <img class="skeleton-img" />
    </div>
    <div class="skeleton-text"></div>
    <div class="skeleton-text small"></div>
    <div class="skeleton-text"></div>
  </div>
  <div v-show="!isImgLoaded" class="product-card-box" @click="cardDetailEdit">
    <div class="img-box">
      <img
        :src="productData.img"
        :key="productData.img"
        @load="isImgLoaded = false"
        alt=""
      />
    </div>
    <div class="name-box">
      <span>{{ name }}</span>
    </div>
    <div class="price-box">
      <span class="currency-symbol">$</span>{{ price }}
    </div>
    <div class="operate-area">
      <nut-button
        style="margin-right: 10px"
        type="danger"
        size="mini"
        @click.stop="openDeleteDialog"
        >刪除</nut-button
      >
      <nut-button type="warning" size="mini" @click="cardDetailEdit"
        >編輯</nut-button
      >
    </div>
  </div>
  <LoadingSpinner :visible="isLoading" text="刪除中..." />
  <ProductSettingCardDetail :product="productData" v-model="showCardDetail" />
</template>

<script setup lang="ts">
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { showDialog } from "@nutui/nutui";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ProductSettingCardDetail from "@/components/setting/ProductSettingCardDetail.vue";
import { computed, ref } from "vue";
import type { Choose } from "@/interface/product";

const isImgLoaded = ref(true);

const showCardDetail = ref(false);
// Props 定義
const props = defineProps({
  index: { type: Number, required: true },
  id: { type: String, required: true },
  name: { type: String, required: true },
  img: { type: String, required: true },
  price: { type: Number, required: true },
  htmlStr: { type: String, required: true },
  choose: { type: Array as () => Choose[], required: true },
  isPublished: { type: Boolean, required: true },
});

const productData = computed(() => props);

const emit = defineEmits(["onDelete"]);
const cardDetailEdit = () => {
  showCardDetail.value = true;
};

const openDeleteDialog = () => {
  showDialog({
    content: `確定要刪除商品:${props.name}嗎?`,
    okText: "確定",
    onOk: deleteProduct,
  });
};

const isLoading = ref(false);
const deleteProduct = async (): Promise<void> => {
  try {
    isLoading.value = true;
    // 指向 Firestore 中指定的產品文檔
    const productDocRef = doc(db, "products", props.id);
    // 執行刪除操作
    await deleteDoc(productDocRef);
    isLoading.value = false;
    console.log(`產品 ${props.id} 已刪除`);
    emit("onDelete");
  } catch (error) {
    isLoading.value = false;
    console.error("刪除產品失敗：", error);
  }
};
</script>

<style scoped>
.product-card-box {
  border: 2px solid var(--nut-primary-color-transparent);
  position: relative;
  width: calc((100% - 20px) / 2);
  height: 210px;
  margin-top: 46px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 15px;

  .img-box {
    width: 75%;
    aspect-ratio: 1 / 1;
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translate(-50%);
    background-color: rgba(160, 39, 39, 0);
  }

  .img-box img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .img-box .productImg-skeleton {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: rgb(197, 197, 197);
    border-radius: 50%;
  }

  .name-box {
    display: flex;
    justify-content: center;
    font-size: 18px;
    margin-bottom: 8px;
  }
  .price-box {
    display: flex;
    justify-content: center;
    font-size: 18px;
    margin-bottom: 8px;
    align-items: end;
  }
  .product-card-badge {
    width: 26px;
    height: 26px;
    position: absolute;
    top: -40px;
    right: 26px;
    background-color: rgb(255, 168, 39);
    color: #fff;
    align-items: center;
    display: flex;
    border-radius: 50%;
    justify-content: center;
  }

  .operate-area {
    margin-top: 10px;
  }
}
.skeleton-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px; /* 占位元素之間的間距 */
  border: 2px solid #e0e0e0;
}

.skeleton-img {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1; /* 正方形占位 */
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite; /* 動畫效果 */
  border-radius: 50%; /* 圓形圖片占位 */
}

.skeleton-text {
  width: 60%; /* 文字寬度 */
  height: 16px; /* 文字高度 */
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite; /* 動畫效果 */
  border-radius: 4px; /* 圓角效果 */
}

.skeleton-text.small {
  width: 40%; /* 較短的文字占位 */
  height: 12px;
}

/* Skeleton 加載動畫 */
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
