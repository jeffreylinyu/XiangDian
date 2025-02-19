<template>
  <div class="box">
    <div class="btn-box">
      <nut-button type="primary" v-on:click="toSettingPage">設定</nut-button>
      <nut-button type="primary">公告</nut-button>
      <nut-button
        v-for="(label, index) in buttons"
        :key="index"
        type="primary"
        :class="{ active: productTabsStore.selectedButtonIndex === index }"
        @click="selectButton(index, label)"
      >
        {{ label }}
      </nut-button>
    </div>
    <!-- <div class="avatar-box">
      <nut-avatar> <My2 /> </nut-avatar>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useProductTabsStore } from "@/stores/productTabs";
import { useRouter } from "vue-router";
import { My2 } from "@nutui/icons-vue";

const buttons = ["再點一次", "甜點"];
const productTabsStore = useProductTabsStore();

const selectButton = (index: number, label: string) => {
  productTabsStore.setSelectedButton(index, label);
};

const router = useRouter();

const toSettingPage = () => {
  router.push({ name: "Settings" });
};
</script>

<style scoped>
.box {
  display: flex;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  .btn-box {
    display: flex;
    overflow: auto;
    .nut-button {
      margin-right: 5px;
      transition: background-color 0.3s;
      background: var(--nut-primary-color-transparent);
    }

    .nut-button.active {
      background: var(--nut-primary-color) !important; /* 變色後的顏色 */
      color: white;
    }
  }

  .avatar-box {
    display: flex;
    align-items: center;
  }
}
</style>
