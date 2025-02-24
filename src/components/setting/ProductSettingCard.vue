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
  width: calc((100% - 20px) / 2);  /* 手機版兩列佈局 */
  height: clamp(180px, 40vw, 200px);  /* 使用 clamp 控制高度範圍 */
  margin-top: 80px;  /* 為圖片預留空間 */
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-sizing: border-box;
  padding: 15px;
  border-radius: 15px;

  @media screen and (min-width: 768px) {
    width: calc((100% - 60px) / 4);  /* 平板版四列佈局 */
    height: clamp(200px, 25vw, 220px);
    margin-top: 90px;
  }

  @media screen and (min-width: 1024px) {
    width: calc((100% - 80px) / 5);  /* 電腦版五列佈局 */
    height: clamp(220px, 20vw, 240px);
    margin-top: 100px;
  }

  .img-box {
    width: clamp(100px, 30vw, 120px);  /* 圖片大小範圍控制 */
    height: clamp(100px, 30vw, 120px);
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translate(-50%);
    background-color: rgba(0, 0, 0, 0);
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: visible;

    @media screen and (min-width: 768px) {
      width: clamp(120px, 15vw, 140px);
      height: clamp(120px, 15vw, 140px);
      top: -70px;
    }

    @media screen and (min-width: 1024px) {
      width: clamp(140px, 12vw, 160px);
      height: clamp(140px, 12vw, 160px);
      top: -80px;
    }

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
  }

  .name-box {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 40px;
    margin-bottom: 8px;

    span {
      font-size: clamp(14px, 2.5vw, 16px);
      text-align: center;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;  /* 限制最多顯示兩行 */
      -webkit-box-orient: vertical;
      line-clamp: 2;  /* 新增標準屬性 */
      overflow: hidden;
      word-break: break-word;

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
    align-items: flex-end;
    font-size: clamp(14px, 2.5vw, 16px);
    margin-bottom: 8px;

    @media screen and (min-width: 768px) {
      font-size: clamp(16px, 1.8vw, 18px);
    }

    @media screen and (min-width: 1024px) {
      font-size: clamp(18px, 1.5vw, 20px);
    }
  }

  .operate-area {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    gap: 10px;

    .nut-button {
      font-size: clamp(12px, 2vw, 14px);
      padding: clamp(4px, 1vw, 8px) clamp(8px, 2vw, 12px);

      @media screen and (min-width: 768px) {
        font-size: clamp(14px, 1.5vw, 16px);
      }
    }
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

/* 添加平滑過渡效果 */
.product-card-box,
.img-box,
img {
  transition: all 0.3s ease-in-out;
}
</style>
