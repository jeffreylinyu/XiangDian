<template>
    <div class="box">
        <nut-button type="primary">公告</nut-button>
        <nut-button 
            v-for="(label, index) in buttons" 
            :key="index" 
            type="primary"
            :class="{ 'active': productTabsStore.selectedButtonIndex === index }"
            @click="selectButton(index, label)"
        >
            {{ label }}
        </nut-button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProductTabsStore } from '@/stores/productTabs';

const buttons = ["再點一次", "甜點" ];
const productTabsStore = useProductTabsStore();

const selectButton = (index: number, label: string) => {
    productTabsStore.setSelectedButton(index, label);
};
</script>

<style scoped>
.box {
    padding: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    overflow: auto;
}

.nut-button {
    margin-right: 5px;
    transition: background-color 0.3s;
    background: var(--nut-primary-color-transparent)
}

.nut-button.active {
    background: var(--nut-primary-color) !important; /* 變色後的顏色 */
    color: white;
}
</style>
