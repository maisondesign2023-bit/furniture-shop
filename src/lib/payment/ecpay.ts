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

// ============================================
// 純 JS 實作的 MD5（Joseph Myers 版本，公開領域授權）
// 不使用 Node 的 crypto 模組，確保在 Cloudflare Pages/Workers 這種
// Edge 執行環境下也能正常運作，不需要額外開啟 nodejs_compat 設定。
// ============================================
function md5cycle(x: number[], k: number[]) {
  let a = x[0], b = x[1], c = x[2], d = x[3];
  a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
  a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101);
  c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);

  a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
  a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083);
  c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
  a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
  a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);

  a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
  a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353);
  c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
  a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222);
  c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
  a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835);
  c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);

  a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415);
  c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
  a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606);
  c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
  a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744);
  c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
  a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379);
  c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);

  x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
}

function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
  a = add32(add32(a, q), add32(x, t));
  return add32((a << s) | (a >>> (32 - s)), b);
}
function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | ~d), a, b, x, s, t); }

function md51(s: string) {
  const n = s.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i;
  for (i = 64; i <= n; i += 64) md5cycle(state, md5blk(s.substring(i - 64, i)));
  s = s.substring(i - 64);
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let j;
  for (j = 0; j < s.length; j++) tail[j >> 2] |= s.charCodeAt(j) << ((j % 4) << 3);
  tail[j >> 2] |= 0x80 << ((j % 4) << 3);
  if (j > 55) {
    md5cycle(state, tail);
    for (j = 0; j < 16; j++) tail[j] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);
  return state;
}

function md5blk(s: string) {
  const blks: number[] = [];
  for (let i = 0; i < 64; i += 4) {
    blks[i >> 2] =
      s.charCodeAt(i) +
      (s.charCodeAt(i + 1) << 8) +
      (s.charCodeAt(i + 2) << 16) +
      (s.charCodeAt(i + 3) << 24);
  }
  return blks;
}

const HEX_CHARS = "0123456789abcdef".split("");
function rhex(n: number) {
  let s = "";
  for (let j = 0; j < 4; j++) s += HEX_CHARS[(n >> (j * 8 + 4)) & 0x0f] + HEX_CHARS[(n >> (j * 8)) & 0x0f];
  return s;
}
function hex(x: number[]) { return x.map(rhex).join(""); }
function add32(a: number, b: number) { return (a + b) & 0xffffffff; }

function utf8ToBinaryString(str: string) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return binary;
}

function md5(str: string) {
  return hex(md51(utf8ToBinaryString(str)));
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

function generateCheckMacValue(params: Record<string, string>) {
  const sortedKeys = Object.keys(params).sort();
  const raw = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
  const withKeys = `HashKey=${HASH_KEY}&${raw}&HashIV=${HASH_IV}`;
  const encoded = dotNetUrlEncode(withKeys).toLowerCase();
  return md5(encoded).toUpperCase();
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

    const checkMacValue = generateCheckMacValue(params);

    return {
      actionUrl: ACTION_URL,
      formFields: { ...params, CheckMacValue: checkMacValue },
    };
  },

  verifyCallback(payload: Record<string, string>) {
    const { CheckMacValue, ...rest } = payload;
    const expected = generateCheckMacValue(rest);
    return {
      isValid: expected === CheckMacValue && payload.RtnCode === "1",
      orderNo: payload.MerchantTradeNo,
      tradeNo: payload.TradeNo,
    };
  },
};
