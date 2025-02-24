// src/stores/productTabs.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProductTabsStore = defineStore('productTabs', () => {
    const selectedButtonIndex = ref<number>(0); 
    const selectedButtonText = ref<string>("甜點");

    const setSelectedButton = (index: number, text: string) => {
        selectedButtonIndex.value = index;
        selectedButtonText.value = text;
    };

    return { selectedButtonIndex, selectedButtonText, setSelectedButton };
});
