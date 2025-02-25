<template>
  <div class="box">
    <div class="btn-box">
      <nut-button type="primary" v-on:click="toSettingPage">設定</nut-button>
      <nut-button type="primary" v-on:click="showAnnouncement">公告</nut-button>
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
import { showDialog } from "@nutui/nutui";

const buttons = ["甜點"];
const productTabsStore = useProductTabsStore();

const selectButton = (index: number, label: string) => {
  productTabsStore.setSelectedButton(index, label);
};

const router = useRouter();

const toSettingPage = () => {
  router.push({ name: "Settings" });
};

const showAnnouncement = () => {
  showDialog({
    title: "公告",
    content: `
      <div class="announcement-content" style="
        text-align: left;
        padding: 10px 15px;
      ">
        <div style="
          text-align: center;
          margin-bottom: 20px;
        ">
          <h3 style="
            color: var(--nut-primary-color);
            margin-bottom: 8px;
            font-size: 1.3em;
          ">歡迎光臨本店！</h3>
          <p style="
            color: #666;
            font-size: 0.9em;
            margin: 0;
          ">感謝您的支持</p>
        </div>
        <div style="
          background: #f8f8f8;
          border-radius: 12px;
          padding: 15px;
        ">
          <div style="margin-bottom: 15px;">
            <div style="
              display: flex;
              align-items: center;
              margin-bottom: 8px;
            ">
              <span style="margin-right: 8px; font-size: 1.2em;">🕐</span>
              <strong style="color: #333; font-size: 1.1em;">營業時間</strong>
            </div>
            <p style="
              margin: 4px 0;
              color: #666;
              padding-left: 28px;
            ">週一至週日 11:00-21:00</p>
          </div>
          <div>
            <div style="
              display: flex;
              align-items: center;
              margin-bottom: 8px;
            ">
              <span style="margin-right: 8px; font-size: 1.2em;">🛵</span>
              <strong style="color: #333; font-size: 1.1em;">外送資訊</strong>
            </div>
            <div style="padding-left: 28px;">
              <p style="margin: 4px 0; color: #666;">• Uber Eats</p>
              <p style="margin: 4px 0; color: #666;">• Foodpanda</p>
              <p style="
                margin-top: 8px;
                color: #ff6b6b;
                font-weight: 500;
              ">店家最低外送金額：$300</p>
            </div>
          </div>
        </div>
      </div>
    `,
    okText: "確定",
    closeOnClickOverlay: false,
  });
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
