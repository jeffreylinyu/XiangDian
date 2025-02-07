<template>
  <div class="product-setting-box">
    <div class="setting-top-area">
      <nut-button type="primary" @click="openAddDialog">新增</nut-button>
    </div>
    <div class="product-setting-card-box">
      <ProductSettingCard
        class="product-card"
        v-for="(product, index) in productList"
        :key="index"
        :index="product.index"
        :id="product.id"
        :name="product.name"
        :img="product.img"
        :price="product.price"
        :htmlStr="product.htmlStr"
        :choose="product.choose"
        :isPublished="product.isPublished"
        @onDelete="fetchProductList"
      />
    </div>
    <div class="dialog-box">
      <nut-dialog
        v-model:visible="addDialogVisible"
        custom-class="dialog"
        :closeOnClickOverlay="false"
        cancelText="取消"
        okText="送出"
        :okAutoClose="false"
        :onOk="addOne"
      >
        <template #default>
          <div class="upload-area-box">
            <div class="upload-area" @click="triggerFileInput">
              <input
                type="file"
                accept="image/*"
                ref="fileInput"
                @change="handleFileUpload"
                class="hidden-input"
              />
              <img v-if="imagePreview" :src="imagePreview" alt="預覽圖片" />
              <span v-else>點擊上傳照片</span>
            </div>
          </div>

          <nut-form>
            <nut-form-item label="名稱">
              <nut-input
                v-model="addProductFormData.name"
                placeholder="請輸入名稱"
                type="text"
              />
            </nut-form-item>
            <nut-form-item label="價格">
              <input
                style="width: 80%; border: none; padding-left: 0"
                v-model="addProductFormData.price"
                placeholder="請輸入價格"
                type="number"
              />
            </nut-form-item>
          </nut-form>
        </template>
      </nut-dialog>
    </div>
  </div>
  <LoadingSpinner :visible="isLoading" text="商品新增中..." />
  <LoadingSpinner :visible="isGetLoading" text="商品讀取中..." />
</template>

<script setup lang="ts">
import ProductSettingCard from "@/components/setting/ProductSettingCard.vue";
import { ref } from "vue";
import type { Product, ProductSetting } from "@/interface/product";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { collection, addDoc, getDocs, updateDoc } from "firebase/firestore";
import { storage, db } from "@/firebase";
import { showNotify } from "@nutui/nutui";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { provide } from "vue";

provide("updateData", () => {
  fetchProductList();
});
// ====== 狀態管理 ======
const isLoading = ref(false);
const isGetLoading = ref(false);
const productList = ref<ProductSetting[]>([]);
const addDialogVisible = ref(false);
const addProductFormData = ref({
  name: "",
  price: 0,
});

// ====== 初始化方法 ======
const fetchProductList = async () => {
  try {
    const productsRef = collection(db, "products");
    const querySnapshot = await getDocs(productsRef);

    // 使用 Promise.all 確保圖片 URL 全部處理完成
    const productsWithImgUrls = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const imgUrl = await getFireBaseImgUrl(data.imgName); // 取得完整圖片 URL
        return {
          id: doc.id,
          ...data,
          img: imgUrl, // 替換為完整的圖片 URL
        } as ProductSetting;
      })
    );

    productList.value = productsWithImgUrls;
    console.log("產品列表已更新：", productList.value);
  } catch (error) {
    console.error("獲取產品列表失敗：", error);
  }
};
fetchProductList();

// ====== 取得firebase圖片url ======
const getFireBaseImgUrl = async (name: string): Promise<string> => {
  const fileRef = storageRef(storage, name);
  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
};

// ====== 對話框操作 ======
function openAddDialog() {
  addProductFormData.value.name = "";
  addProductFormData.value.price = 0;
  currentAddImgFile.value = null;
  imagePreview.value = null;
  addDialogVisible.value = true;
}

// ====== 圖片上傳 ======
const imagePreview = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const currentAddImgFile = ref<File | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) {
    console.error("未選擇文件");
    return;
  }

  currentAddImgFile.value = file;

  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.value = reader.result as string;
  };
  reader.readAsDataURL(file);
};

// ====== 添加商品 ======
async function addOne() {
  try {
    isLoading.value = true;

    // 1. 創建商品並添加到 Firestore，先生成文檔 ID
    const productRef = await addDoc(collection(db, "products"), {
      index: 1, // 暫時的 index，可以根據需求動態生成
      name: addProductFormData.value.name,
      imgName: "", // 初始為空，稍後更新
      price: addProductFormData.value.price,
      htmlStr: "",
      choose: [],
      isPublished: false,
    });

    const productId = productRef.id;

    // 2. 上傳圖片到 Firebase Storage，使用商品 ID 作為文件路徑
    if (currentAddImgFile.value) {
      const storagePath = `products/${productId}`;
      const fileRef = storageRef(storage, storagePath);
      await uploadBytes(fileRef, currentAddImgFile.value);

      // 3. 更新商品文檔，添加圖片 URL
      await updateDoc(productRef, {
        imgName: `products/${productId}`,
      });

      console.log("商品圖片已更新");
    } else {
      console.warn("未選擇圖片，商品圖片將保持為空");
    }

    // 4. 刷新商品列表並關閉對話框
    fetchProductList();
    addDialogVisible.value = false;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    console.error("添加商品失敗：", error);
    showNotify.text("msg");
  }
}
</script>

<style scoped>
.product-setting-box {
  width: 100%;
  height: 100%;
  text-align: center;
  .setting-top-area {
    width: 100%;
    text-align: start;
  }
  .product-setting-card-box {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
.upload-area-box {
  width: 100%;
  display: flex;
  justify-content: center;
}
.upload-area {
  width: 120px;
  height: 120px;
  background-color: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #ccc;
  position: relative;
}

.upload-area img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-area span {
  font-size: 14px;
  color: #888;
}

.hidden-input {
  display: none;
}
</style>
