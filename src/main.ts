import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { app as firebaseApp } from "./firebase";

import NutUI from "@nutui/nutui";
import "@nutui/nutui/dist/style.css";
import "reset-css";

// 引入 Google Fonts
import "@/assets/fonts.css";

import App from "./App.vue";
import router from "./router";

import { initLiff } from "@/utils/lineUtils";
initLiff().catch((error) => {
  console.error("LIFF 初始化失敗:", error);
});

console.log("Firebase App:", firebaseApp);

const app = createApp(App);

app.use(NutUI);
app.use(createPinia());
app.use(router);

app.mount("#app");
