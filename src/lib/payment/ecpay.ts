import type {
  PaymentProvider,
  PaymentSessionInput,
  PaymentSessionResult,
} from "./provider";

const MERCHANT_ID = process.env.ECPAY_MERCHANT_ID || "";
const HASH_KEY = process.env.ECPAY_HASH_KEY || "";
const HASH_IV = process.env.ECPAY_HASH_IV || "";
// 沒有明確設定 ECPAY_ENV=production 的話，一律走測試環境，避免不小心真的刷卡扣款
const IS_PRODUCTION = process.env.ECPAY_ENV === "production";

const ACTION_URL = IS_PRODUCTION
  ? "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5"
  : "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";

function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// 用瀏覽器/Cloudflare Workers 都內建的 Web Crypto API 算 SHA256，
// 不需要額外套件，也不用像 MD5 那樣手刻演算法。
async function sha256(str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ============================================
// 綠界規定的 .NET 風格 URL encode 規則
// ============================================
function dotNetUrlEncode(str: string) {
  const replacements: Record<string, string> = {
    "%2D": "-", "%5F": "_", "%2E": ".", "%21": "!",
    "%2A": "*", "%28": "(", "%29": ")", "%20": "+",
  };
  let encoded = encodeURIComponent(str);
  for (const [key, value] of Object.entries(replacements)) {
    encoded = encoded.split(key).join(value);
  }
  return encoded;
}

// 綠界 AioCheckOut/V5 規定用 SHA256（不是 MD5）：
// https://developers.ecpay.com.tw/2902/
async function generateCheckMacValue(params: Record<string, string>) {
  const sortedKeys = Object.keys(params).sort();
  const raw = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
  const withKeys = `HashKey=${HASH_KEY}&${raw}&HashIV=${HASH_IV}`;
  const encoded = dotNetUrlEncode(withKeys).toLowerCase();
  const hash = await sha256(encoded);
  return hash.toUpperCase();
}

export const ecpayProvider: PaymentProvider = {
  name: "ecpay",

  async createPaymentSession(input: PaymentSessionInput): Promise<PaymentSessionResult> {
    const params: Record<string, string> = {
      MerchantID: MERCHANT_ID,
      MerchantTradeNo: input.orderNo.slice(0, 20),
      MerchantTradeDate: formatDate(new Date()),
      PaymentType: "aio",
      TotalAmount: String(Math.round(input.amount)),
      TradeDesc: "furniture-shop-order",
      ItemName: input.itemName || "家具商品",
      ReturnURL: input.returnUrl,
      ChoosePayment: "Credit",
      ClientBackURL: input.clientBackUrl,
      EncryptType: "1",
    };

    const checkMacValue = await generateCheckMacValue(params);

    return {
      actionUrl: ACTION_URL,
      formFields: { ...params, CheckMacValue: checkMacValue },
    };
  },

  async verifyCallback(payload: Record<string, string>) {
    const { CheckMacValue, ...rest } = payload;
    const expected = await generateCheckMacValue(rest);
    return {
      isValid: expected === CheckMacValue && payload.RtnCode === "1",
      orderNo: payload.MerchantTradeNo,
      tradeNo: payload.TradeNo,
    };
  },
};
