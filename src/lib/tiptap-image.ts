import TiptapImage from "@tiptap/extension-image";

// 擴充 Tiptap 內建的圖片節點，加上「寬度」跟「對齊方式」兩個屬性，
// 這樣使用者調整圖片大小/位置後，存進資料庫的 HTML 會直接帶有對應的樣式。
const CustomImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: "100%" },
      align: { default: "center" },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { width, align, style, ...rest } = HTMLAttributes;
    let computedStyle = `width:${width || "100%"};`;
    if (align === "left") {
      computedStyle += "float:left;margin:0 16px 16px 0;";
    } else if (align === "right") {
      computedStyle += "float:right;margin:0 0 16px 16px;";
    } else {
      computedStyle += "display:block;margin:16px auto;float:none;";
    }
    return ["img", { ...rest, style: computedStyle }];
  },
});

export default CustomImage;
