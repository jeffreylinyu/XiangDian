import { defineStore } from "pinia";
import type { Option } from "@/interface/product";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  addons: Record<string, Option[]>; // 加購內容
  addonsSummary?: string; // 加購文字
  img?: string; // 商品圖片
}

export const useOrderStore = defineStore("order", {
  state: () => ({
    items: [] as OrderItem[],
  }),
  getters: {
    // 每個品項加入 addonsSummary
    itemsWithAddonsSummary: (state) => {
      return state.items.map((item) => ({
        ...item,
        addonsSummary: formatAddonsSummary(item.addons),
      }));
    },
    subtotal: (state) => {
      return state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
  },
  actions: {
    addItem(newItem: OrderItem) {
      // 先根據 addons 產生加購摘要
      const addonsSummary = formatAddonsSummary(newItem.addons);

      // 利用 normalizeAddons 產生標準化字串，作為比較依據
      const newAddonsKey = normalizeAddons(newItem.addons);

      // 檢查是否有相同 id 且加購內容（標準化後）相同的品項
      const existingItem = this.items.find((item) => {
        if (item.id !== newItem.id) return false;
        const itemAddonsKey = normalizeAddons(item.addons);
        return itemAddonsKey === newAddonsKey;
      });

      if (existingItem) {
        // 如果已存在則增加數量
        existingItem.quantity += newItem.quantity;
      } else {
        // 否則新增品項，並附上加購摘要
        this.items.push({ ...newItem, addonsSummary });
      }
    },
    updateItemQuantity(itemId: string, quantity: number, addons: any) {
      const addonsSummary = formatAddonsSummary(addons);

      // 檢查是否有相同 id 且加購內容相同的品項
      const existingItem = this.items.find(
        (i) => i.id === itemId && i.addonsSummary === addonsSummary
      );

      if (existingItem) {
        // 更新數量
        existingItem.quantity = quantity;

        // 如果數量 <= 0，刪除該項目
        if (existingItem.quantity <= 0) {
          this.removeItem(itemId, addonsSummary);
        }
      } else {
        // 如果沒有相同加購內容，視為新項目
        this.items.push({
          id: itemId,
          name: "商品名稱", // 記得替換為正確名稱
          price: 0, // 替換為商品單價
          quantity,
          addons,
          addonsSummary,
        });
      }
    },

    // 刪除方法需要加上 addonsSummary 比對
    removeItem(itemId: string, addonsSummary: string) {
      this.items = this.items.filter(
        (item) => item.id !== itemId || item.addonsSummary !== addonsSummary
      );
    },
    clearOrder() {
      this.items = [];
    },
  },
});

/**
 * 輔助函式：將 addons 轉為標準化的字串
 * 注意：因為 addons 的值都是陣列，所以不需要處理非陣列的狀況
 */
function normalizeAddons(addons: Record<string, Option[]>): string {
  // 先將 key 進行排序，確保物件屬性順序一致
  const sortedKeys = Object.keys(addons).sort();
  return sortedKeys
    .map((key) => {
      // 對每個陣列內容依照 name 進行排序，避免順序不同導致不一致
      const sortedOptions = addons[key]
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name));
      // 將每個選項轉換成字串（可根據需求調整識別欄位）
      const optionsStr = sortedOptions
        .map((opt) => `${opt.name}-${opt.price}-${opt.default}`)
        .join(",");
      return `${key}:[${optionsStr}]`;
    })
    .join(";");
}

function formatAddonsSummary(addons: Record<string, Option[]>) {
  const parts: string[] = [];

  for (const group in addons) {
    const selected = addons[group];
    if (selected.length > 0) {
      parts.push(`${group}：${selected.map((addon) => addon.name).join("、")}`);
    }
  }

  // 不換行，使用 " / " 分隔不同的加購類型
  return parts.join(" / ");
}
