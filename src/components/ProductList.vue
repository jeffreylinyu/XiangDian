<template>
  <div class="product-list-box">
    <div class="title"></div>
    <div class="list-box">
      <ProductCard
        class="product-card"
        v-for="(product, index) in productList"
        :key="index"
        :productId="product.id"
        :productImg="product.img"
        :productName="product.name"
        :productPrice="product.price"
        :cartQuantity="getCartQuantity(product.id)"
        :contentHtml="product.htmlStr"
        :addChoose="product.choose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductTabsStore } from "@/stores/productTabs";
import { useOrderStore } from "@/stores/orderStore";
import ProductCard from "@/components/ProductCard.vue";
import bruleeImg from "@/assets/brulee.jpg";
import almondcookies from "@/assets/almondcookies.jpg";
import pannacotta from "@/assets/pannacotta.jpg";
import mascot from "@/assets/mascot.jpg";
import basque from "@/assets/basque.jpg";
import { ref } from "vue";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import type { Product, ProductSetting } from "@/interface/product";
import { collection, addDoc, getDocs, updateDoc } from "firebase/firestore";
import { storage, db } from "@/firebase";

const productList = ref<ProductSetting[]>([]);

// ====== 取得firebase圖片url ======
const getFireBaseImgUrl = async (name: string): Promise<string> => {
  const fileRef = storageRef(storage, name);
  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
};

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

const orderStore = useOrderStore(); // 引入購物車的 Store

// 計算每個商品的購物車數量（包含相同商品的不同選項）
const getCartQuantity = (productId: string) => {
  return orderStore.items
    .filter((item) => item.id === productId)
    .reduce((total, item) => total + item.quantity, 0);
};

interface AddonOption {
  name: string;
  price: number;
  default: boolean;
}

interface AddonGroup {
  title: string;
  multiple: boolean;
  options: AddonOption[];
}

const addMaterials: AddonGroup = {
  title: "加料",
  multiple: true,
  options: [
    { name: "珍珠", price: 5, default: false },
    { name: "Oreo", price: 5, default: false },
    { name: "脆片", price: 5, default: false },
  ],
};

const taste: AddonGroup = {
  title: "口味",
  multiple: false,
  options: [
    { name: "原味", price: 0, default: true },
    { name: "可可", price: 5, default: false },
    { name: "伯爵紅茶", price: 5, default: false },
  ],
};

const basqueTaste: AddonGroup = {
  title: "口味",
  multiple: false,
  options: [
    { name: "楓糖", price: 0, default: true },
    { name: "抹茶", price: 0, default: false },
    { name: "檸檬", price: 0, default: false },
    { name: "巧克力", price: 0, default: false },
    { name: "香草", price: 0, default: false },
    { name: "乳酪", price: 0, default: false },
    { name: "伯爵紅茶", price: 0, default: false },
  ],
};

// const productList = [
//   {
//     id: 1,
//     img: bruleeImg,
//     name: "烤布蕾",
//     price: 50,
//     addChoose: [addMaterials],
//     htmlStr: `<h2
//                   style="
//                     color: #d2691e;
//                     font-size: 24px;
//                     text-align: center;
//                     margin-bottom: 0.5em;
//                   "
//                 >
//                   ✨讓布蕾滿足你的味蕾！✨
//                 </h2>

//                 <span style="font-size: 20px; color: #555; text-align: center">
//                   濃郁奶香交織焦糖的香脆口感！
//                 </span>

//                 <div style="margin-top: 22px; text-align: start">
//                   <p>
//                     <strong>⏳ 最佳賞味期限：</strong>

//                   </p>
//                   <p style="padding-left:25px;">建議於 15 分鐘內食用，感受焦糖的香脆口感！</p>
//                   <p>
//                     <strong>📅 有效期限：</strong>
//                   </p>
//                   <p style="padding-left:25px;">冷藏保存 3 天，風味依舊，細細品嚐！</p>
//                 </div>`,
//   },
//   {
//     id: 2,
//     img: almondcookies,
//     name: "盾牌餅乾",
//     price: 60,
//     addChoose: [],
//     htmlStr: `<h2
//                   style="
//                     color: #d2691e;
//                     font-size: 24px;
//                     text-align: center;
//                     margin-bottom: 0.5em;
//                   "
//                 >
//                   ✨下午茶必備！✨
//                 </h2>

//                 <span style="font-size: 20px; color: #555; text-align: center">
//                   濃郁杏仁香氣與香脆口感的絕妙結合，是午後時光的最佳陪伴！
//                 </span>

//                 <div style="margin-top: 22px; text-align: start">
//                   <p>
//                     <strong>📅 有效期限：</strong>
//                   </p>
//                   <p style="padding-left:25px;">密封保存於室溫下 <strong>7 天</strong>，風味依舊可口！</p>
//                 </div>`,
//   },
//   {
//     id: 3,
//     img: pannacotta,
//     name: "奶酪",
//     price: 45,
//     addChoose: [taste, addMaterials],
//     htmlStr: `<h2
//                   style="
//                     color: #d2691e;
//                     font-size: 24px;
//                     text-align: center;
//                     margin-bottom: 0.5em;
//                   "
//                 >
//                   ✨濃郁奶香，入口即化！✨
//                 </h2>

//                 <div style="margin-top: 1.5em;text-align: left;">
//                   <ul style="list-style-type: none; font-size: 16px; line-height: 1.8;">
//                     <li>
//                       🥛 <strong style="font-size: 18px;">經典原味：</strong>
//                       <p style="margin-left: 25px;">
//                         濃濃奶香，細緻滑順，簡單卻令人回味無窮。
//                       </p>
//                     </li>
//                     <li style="margin-top: 10px;">
//                       🍫 <strong style="font-size: 18px;">可可風味：</strong>
//                       <p style="margin-left: 25px;">
//                         醇厚可可與奶香完美交織，帶來濃郁卻不膩口的雙重享受。
//                       </p>
//                     </li>
//                     <li style="margin-top: 10px;">
//                       🍵 <strong style="font-size: 18px;">伯爵紅茶：</strong>
//                       <p style="margin-left: 25px;">
//                         香濃奶香結合淡雅的伯爵紅茶香氣，甜而不膩，層次豐富。
//                       </p>
//                     </li>
//                   </ul>
//                 </div>

//                 <div style="margin-top: 22px; text-align: start">
//                   <p>
//                     <strong>📅 有效期限：</strong>
//                   </p>
//                   <p style="padding-left:25px;">冷藏保存 5 天</p>
//                 </div>`,
//   },
//   {
//     id: 4,
//     img: basque,
//     name: "巴斯克",
//     price: 200,
//     addChoose: [basqueTaste],
//     htmlStr: `<h2
//                   style="
//                     color: #d2691e;
//                     font-size: 24px;
//                     text-align: center;
//                     margin-bottom: 0.5em;
//                   "
//                 >
//                   ✨細緻綿密，奶香四溢，絲滑而不膩✨
//                 </h2>

//                 <span style="font-size: 20px; color: #555; text-align: center">
//                   源自西班牙巴斯克地區的經典甜點，以高溫烘焙出誘人的焦糖色外皮，內層濃郁滑順，入口即化，帶有自然的奶香與淡淡的焦糖風味。
//                 </span>

//                 <div style="margin-top: 22px; text-align: start">
//                  <p>
//                     <strong>⏳ 最佳賞味期限：</strong>
//                   </p>
//                   <p style="padding-left:25px;">冷藏保存 4 天</p>
//                   <p style="padding-left:25px;">冷凍保存 10 天</p>
//                 </div>`,
//   },
//   { id: 5, img: mascot, name: "可愛吧", price: 10, addChoose: [], htmlStr: "" },
// ];

const productTabsStore = useProductTabsStore();
</script>

<style scoped>
div {
  color: var(--nut-serious-font);
}
.product-list-box {
  padding: 20px;

  .list-box {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 60px;
    background-color: var(--light-bg);
    z-index: 99;
  }

  .title {
    position: absolute;
    top: 26px;
    left: -2px;
    background-color: rgba(0, 0, 0, 0);
    width: 100%;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;

    background-image: url("@/assets/logo-removebg.png");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }

  .product-card {
    margin-bottom: 10px;
  }
}
</style>
