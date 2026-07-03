import type { Config } from "tailwindcss";

// 設計系統｜家具品牌「質感簡約」
// 色彩：暖木質調，非常見的米白+陶土色樣板
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EDEAE3",      // 主背景：灰調米杏，比常見暖白更沉一點
        surface: "#F8F6F2",    // 卡片/區塊背景
        ink: "#2A2521",        // 主文字：深咖啡黑
        walnut: "#4B3324",     // 深胡桃木：標題強調
        brass: "#9C7A4F",      // 黃銅/木紋強調色，取代常見陶土色
        line: "#DAD4C8",       // 分隔線
        muted: "#8A8177",      // 次要文字
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        wide2: "0.08em",
      },
    },
  },
  plugins: [],
};
export default config;
