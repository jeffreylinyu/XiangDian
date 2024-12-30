import { defineStore } from "pinia";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  addons: Record<string, any>; // 加購內容
  addonsSummary?: string; // 加購文字
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
      // 格式化加購內容並加入 addonsSummary
      const addonsSummary = formatAddonsSummary(newItem.addons);

      const existingItem = this.items.find(
        (item) =>
          item.id === newItem.id &&
          JSON.stringify(item.addons) === JSON.stringify(newItem.addons)
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        this.items.push({ ...newItem, addonsSummary });
      }
    },
    updateItemQuantity(itemId: number, quantity: number, addons: any) {
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
    removeItem(itemId: number, addonsSummary: string) {
      this.items = this.items.filter(
        (item) => item.id !== itemId || item.addonsSummary !== addonsSummary
      );
    },
    clearOrder() {
      this.items = [];
    },
  },
});

function formatAddonsSummary(addons: Record<string, any>) {
  const parts: string[] = [];

  for (const group in addons) {
    const selected = addons[group];
    if (Array.isArray(selected)) {
      // 多選項目處理
      if (selected.length > 0) {
        parts.push(
          `${group}：${selected.map((addon) => addon.name).join("、")}`
        );
      }
    } else if (selected) {
      // 單選項目處理
      parts.push(`${group}：${selected.name}`);
    }
  }

  // 不換行，使用 " / " 分隔不同的加購類型
  return parts.join(" / ");
}
