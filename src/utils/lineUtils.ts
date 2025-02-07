import liff from "@line/liff";

const liffId = import.meta.env.VITE_LIFF_ID

export const redirectToLine = async (type: "line" | "liff") => {
  let lineUrl = "";

  if (type === "line") {
    lineUrl = `https://line.me/R/ti/p/${import.meta.env.VITE_LINE_ID}`;
  } else if (type === "liff") {
    const targetLiffId = import.meta.env.VITE_LIFF_ID;

    try {
      // 初始化 LIFF
      if (!liff.isInClient()) {
        console.log("不在 LINE 客戶端中");
        lineUrl = `line://app/${targetLiffId}`;
      } else {
        await liff.init({ liffId: targetLiffId });

        // 獲取當前 LIFF ID
        const currentLiffId = liff.id;
        if (currentLiffId === targetLiffId) {
          console.log("已經在目標 LIFF 頁面，無需跳轉");
          return;
        }

        // 如果不在目標 LIFF 頁面，跳轉到目標 LIFF
        lineUrl = `line://app/${targetLiffId}`;
      }
    } catch (error) {
      console.error("LIFF 初始化失敗:", error);
      lineUrl = `line://app/${targetLiffId}`; // 如果初始化失敗，預設跳轉
    }
  }

  // 執行跳轉
  if (lineUrl) {
    window.location.href = lineUrl;
  }
};

// ====== 跳轉到 LINE 的下載頁面 ======
export const redirectToLineDownload = () => {
  const userAgentData = (navigator as any).userAgentData;

  if (userAgentData && userAgentData.platform) {
    const platform = userAgentData.platform.toLowerCase();
    if (platform.includes("android")) {
      // Android 裝置
      window.location.href =
        "https://play.google.com/store/apps/details?id=jp.naver.line.android";
    } else if (
      platform.includes("ios") ||
      platform.includes("iphone") ||
      platform.includes("ipad")
    ) {
      // iOS 裝置
      window.location.href = "https://apps.apple.com/app/line/id443904275";
    } else {
      alert("請手動下載 LINE 應用程式");
    }
  } else {
    // 瀏覽器不支持 userAgentData，回退到 userAgent
    fallbackToUserAgent();
  }
};

const fallbackToUserAgent = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/android/i.test(userAgent)) {
    window.location.href =
      "https://play.google.com/store/apps/details?id=jp.naver.line.android";
  } else if (/iphone|ipad|ipod/.test(userAgent)) {
    window.location.href = "https://apps.apple.com/app/line/id443904275";
  } else {
    alert("請手動下載 LINE 應用程式");
  }
};

// ====== 全局變量，用於存儲初始化狀態 ======
let isLiffInitialized = false;

// ====== 初始化 LIFF ======
export async function initLiff(): Promise<void> {
  if (isLiffInitialized) {
    console.log("LIFF 已初始化，跳過重複初始化");
    return;
  }

  try {
    await liff.init({ liffId });
    isLiffInitialized = true;
    console.log("LIFF 初始化成功");
  } catch (error) {
    console.error("LIFF 初始化失敗:", error);
    throw new Error("LIFF 初始化失敗");
  }
}

// ====== LINE 登入方法 ======
export async function loginWithLine(): Promise<any> {
  if (!isLiffInitialized) {
    await initLiff()
  }

  try {
    // 如果未登入，執行登入流程
    if (!liff.isLoggedIn()) {
      console.log("用戶未登入，正在執行登入...");
      liff.login();
      return null; // 登入後會重新加載頁面
    }

    // 登入後，獲取用戶資訊
    const profile = await liff.getProfile();
    console.log("登入成功，用戶資訊:", profile);

    return profile;
  } catch (error) {
    console.error("LINE 登入失敗:", error);
    throw new Error("LINE 登入失敗");
  }
}

// ====== LINE 發送訊息 ======
export async function sendLineMessage(flexMessage: any): Promise<void> {
  if (!isLiffInitialized) {
    await initLiff()
  }

  try {
    await liff.sendMessages([flexMessage]);
    liff.closeWindow();
    console.log("訊息發送成功:", flexMessage);
  } catch (error) {
    console.error("訊息發送失敗:", error);
    throw new Error("訊息發送失敗");
  }
}
