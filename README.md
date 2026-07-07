# 家具購物網站

Next.js 14 (App Router) + Supabase + Tailwind CSS 打造的家具電商網站骨架。
包含：SEO、商品分類、購物車、會員系統、後台管理、金流串接預留介面。

## 技術棧

- **前台/後台**：Next.js 14（App Router，SSR/SSG 支援 SEO）
- **資料庫 + 會員驗證**：Supabase（Postgres + Auth + Storage）
- **樣式**：Tailwind CSS（自訂設計系統，見 `tailwind.config.ts`）
- **金流**：抽象介面 `src/lib/payment/provider.ts`，之後決定綠界(ECPay)或藍新(NewebPay)後再實作
- **部署**：Cloudflare Pages（用 `@cloudflare/next-on-pages` adapter）

## 開始開發

```bash
npm install
cp .env.example .env.local   # 填入 Supabase 專案的 URL / anon key / service role key
```

1. 到 [supabase.com](https://supabase.com) 建立新專案
2. 在 Supabase SQL Editor 執行 `supabase/schema.sql`，會建立：
   - `categories` 分類
   - `products` 商品
   - `product_images` 商品圖片（每個商品最多可放 10 張，含排序）
   - `orders` / `order_items` 訂單
   - `profiles` 會員資料（綁定 Supabase Auth 使用者）
3. 到 Supabase → Storage 建立 `product-images` bucket（設為 public）
4. `npm run dev` 啟動本地開發伺服器

## 更新：部落格 + 首頁圖片管理（新功能）

頁首選單改版為「商品分類（下拉）／最新活動／探索更多（下拉，顯示部落格文章）／關於我們／家配師服務」，並新增後台可管理部落格文章與首頁主視覺圖片。

**設定步驟：**

1. 到 Supabase SQL Editor，執行 `supabase/migration_02_blog_banners.sql`（會新增 `banners`、`blog_posts` 兩張表格與對應權限規則）
2. 到 Supabase → Storage，新增兩個 **public** bucket：
   - `blog-images`（部落格文章封面圖）
   - `banner-images`（首頁主視覺圖）
3. 完成後即可在後台看到「部落格管理」「首頁圖片管理」兩個新選單：
   - `/admin/blog` → 新增/管理文章（草稿/發布狀態）
   - `/admin/banners` → 上傳首頁圖片、設定標題副標與連結、啟用/停用

首頁會自動抓取「啟用中、排序最前面」的一張圖片顯示；如果還沒設定任何圖片，會顯示預設的示意圖。

## 更新二：首頁改版（最新消息／分隔圖片／商品貨架／部落格）

首頁改成：最新消息主圖 → 分隔圖片 → 商品貨架1 → 分隔圖片 → 商品貨架2 → 分隔線 → 部落格精選。

**設定步驟：**

1. Supabase SQL Editor 執行 `supabase/migration_03_homepage_sections.sql`
2. 到 `/admin/banners`（首頁圖片管理）：
   - 新增圖片時，「圖片類型」選 **最新消息** → 會顯示在首頁最上方（可加標題/副標/按鈕連結）
   - 新增圖片時，「圖片類型」選 **分隔圖片** → 依「排序」由小到大，前兩張會分別顯示在商品貨架 1、2 的上方（不會顯示標題文字，單純圖片）
3. 到 `/admin/shelves`（商品貨架管理）：
   - 新增貨架（例如「熱銷商品」「新品上市」），首頁會依「排序」顯示前兩個啟用中的貨架
   - 點進貨架，選擇要放進去的商品
4. 部落格文章會自動抓最新發布的 3 篇顯示在首頁最下方，不用額外設定

## 更新三：家配師服務（過去案例 + 預約諮詢表單）

頁首「家配師服務」改成下拉選單，顯示最新發布的案例；服務頁新增「過去案例」區塊與「預約諮詢」聯絡表單。

**設定步驟：**

1. Supabase SQL Editor 執行 `supabase/migration_04_services.sql`
2. Supabase → Storage，新增一個 **public** bucket：`case-images`
3. 後台新增選單：
   - `/admin/cases` → 新增案例（標題、摘要、完整說明、最多10張圖片、發布狀態）
   - `/admin/contacts` → 查看訪客從「預約諮詢」表單送出的訊息
4. 前台：
   - `/services` 會顯示服務介紹、已發布的過去案例、底部的預約諮詢表單
   - 點案例可以看到 `/services/case/[slug]` 詳情頁，圖片可點擊放大瀏覽
   - 表單送出不用登入，任何訪客都可以填寫

## 更新四：結帳前需要先登入會員

未登入的訪客可以照常瀏覽商品、加入購物車，但進入 `/checkout` 結帳頁時會被導向「請先登入會員」，登入或註冊完成後會自動導回結帳頁繼續填寫收件資訊，不需要額外設定，程式已經處理好。

## 更新五：Google 登入 / 退換貨後台編輯 / 縮圖換主圖 / 商品尺寸顏色

**1. 資料庫**

Supabase SQL Editor 執行 `supabase/migration_05_variants_pages.sql`（新增商品尺寸/顏色欄位、可編輯頁面內容表格，並自動建立「運送與退換貨」「隱私權政策」兩筆預設資料）。

**2. Google 登入設定（需要你自己申請一組 Google 憑證）**

a. 到 [Google Cloud Console](https://console.cloud.google.com/) → 建立一個新專案（或用現有的）→ 左側選單「API 和服務」→「憑證」
b. 點「建立憑證」→「OAuth 用戶端 ID」，應用程式類型選「網頁應用程式」
c. 「已授權的重新導向 URI」填入（把 `xxxx` 換成你的 Supabase 專案 ID，可以在 Supabase Project URL 裡看到）：
```
https://xxxx.supabase.co/auth/v1/callback
```
d. 建立後會拿到一組 **Client ID** 和 **Client Secret**，複製起來
e. 回到 Supabase → **Authentication** → **Providers** → 找到 **Google**，打開它，貼上剛剛的 Client ID / Client Secret，儲存
f. 正式上線後，也要到 Supabase → **Authentication** → **URL Configuration**，把 Site URL 設定成你正式的網域，「Redirect URLs」加上 `https://你的網域/auth/callback`

本機測試時（`localhost:3000`）通常可以直接使用，不用額外設定 Redirect URLs。

**3. 商品尺寸/顏色**

`/admin/products/new` 新增商品時多了兩個欄位：「尺寸選項」「顏色選項」，用逗號分開填寫（例如 `S,M,L`），不需要的話留空即可。前台商品頁會自動顯示對應的下拉選單，選擇的內容會一併記錄在訂單明細裡。

**4. 退換貨 / 隱私權政策編輯**

`/admin/pages` → 點進「運送與退換貨」或「隱私權政策」即可編輯內容，儲存後前台頁面會立即更新。

**5. 商品圖片：滑鼠移到縮圖即可切換主圖**

不用另外設定，已經自動生效。

## 更新六：綠界 ECPay 金流正式串接

結帳流程已經改成真正串接綠界，會依有沒有設定綠界金鑰自動判斷要不要用真的付款（沒設定金鑰時仍會用模擬付款，方便開發測試）。

**⚠️ 重要：金流的付款完成通知，一定要在「正式部署後的網址」上測試，不能在 `localhost` 測試**，因為綠界的伺服器需要能連到你的網站來通知付款結果，`localhost` 只有你自己的電腦看得到，綠界連不到。

**設定步驟：**

1. 到綠界商店後台 → **「系統開發管理」** → 「一般介接」，會看到三組資訊：
   - **商店代號（MerchantID）**
   - **HashKey**
   - **HashIV**
2. 這三組值要填在**兩個地方**：
   - 本機測試：`.env.local` 裡的 `ECPAY_MERCHANT_ID`、`ECPAY_HASH_KEY`、`ECPAY_HASH_IV`
   - 正式網站：Cloudflare Pages 專案 → Settings → Variables and secrets，一樣新增這三組（建議都設為 Secret 類型）
3. **`ECPAY_ENV` 這個變數要特別注意：**
   - 還在測試階段，先填 `test`（或乾脆不要設定這個變數），會走綠界的測試環境，不會真的扣款
   - 確認一切正常、真的要開始營業收款，才把這個變數改成 `production`，並且確認你填的三組金鑰是綠界「正式環境」（不是測試環境）給你的值
4. 改完 Cloudflare 的環境變數後，記得回「Deployments」重新部署一次才會生效

**測試流程（在正式網址上測試）：**

1. 加商品到購物車 → 結帳 → 填寫收件資訊 → 送出
2. 應該會被導到綠界的付款頁面（測試環境會有測試用的信用卡卡號可以輸入，綠界官方文件裡有提供）
3. 付款完成後，綠界會在背景通知你的網站（`/api/payment/callback`），訂單狀態會自動變成「已付款」
4. 到 `/admin/orders` 確認訂單狀態有沒有正確更新

## 更新七：訂單通知信（訂單成立/付款成功/已出貨）

用 [Resend](https://resend.com)（開發者常用的 email API，免費額度每月 3000 封、每天 100 封）串接訂單通知信。

**會自動寄信的時機：**
- 客人送出訂單（尚未付款）→ 客人收到「訂單已成立」、你收到「新訂單通知」
- 綠界付款完成 → 客人收到「付款成功」、你收到「訂單已付款」
- 你在後台 `/admin/orders` 把訂單狀態改成「已出貨」→ 客人自動收到「商品已出貨」通知

**設定步驟：**

1. Supabase SQL Editor 執行 `supabase/migration_07_order_email.sql`
2. 到 [resend.com](https://resend.com) 註冊帳號
3. 左側選單 **API Keys** → 建立一組新的 API Key，複製起來
4. 把這三組值填到 `.env.local` 跟 Cloudflare 環境變數（跟之前綠界的做法一樣，本機跟正式站都要填）：
   - `RESEND_API_KEY`：剛剛複製的 API Key
   - `EMAIL_FROM`：先用 `onboarding@resend.dev`（見下方說明）
   - `ADMIN_NOTIFICATION_EMAIL`：你想收到訂單通知的信箱（例如你自己的 Gmail）

**⚠️ 重要限制，請先了解：**

Resend 沒有驗證過網域之前，只能用官方測試用的寄件地址 `onboarding@resend.dev`，而且**很可能只能寄到你自己註冊 Resend 帳號的那個信箱**，寄不到客人的信箱。也就是說：

- **現階段**：管理員通知（寄到你自己信箱）可以正常運作，但客人收到的「訂單成立」「付款成功」通知信可能會寄送失敗
- **要讓客人也能收到信**，你需要：
  1. 有一個自己的網域名稱（例如 `你的品牌.com`，不是 `.pages.dev` 那種）
  2. 到 Resend 的 **Domains** 頁面新增你的網域，照指示到你的網域註冊商那邊加上幾筆 DNS 記錄（SPF、DKIM）
  3. 驗證通過後，把 `EMAIL_FROM` 改成 `noreply@你的網域.com` 這種格式，之後就能正常寄給任何客人了

這件事不急，可以等你買了正式網域之後再回來設定，現在先讓「管理員收到訂單通知」這個核心需求動起來即可。

## 更新八：效能優化（解決 Error 1102 / Worker exceeded resource limits）

Cloudflare 免費方案每次網頁請求只給 10 毫秒運算時間，這個網站功能變多之後容易超標。優化重點：

- 新增 `src/lib/supabase/public.ts`：給「不需要知道使用者是誰」的公開內容專用（商品、分類、部落格、案例等），刻意不讀取 cookies，讓 Next.js 能把這些頁面當成可快取的靜態頁面
- 新增 `src/components/AuthStatus.tsx`：登入狀態的顯示改成瀏覽器端判斷，不用在伺服器端為了顯示「登出」按鈕而讀取 cookie，避免整個頁面被迫變成即時運算
- 首頁、分類頁、商品頁、部落格、服務頁、政策頁都改用上面這個公開連線方式
- 首頁兩個商品貨架的查詢合併成一次，減少重複連線與資料解析

會員中心、結帳、後台管理這些「需要知道你是誰」的頁面維持原本方式不變（本來就是低流量頁面，不受影響）。

如果優化後還是偶爾出現 Error 1102，代表免費方案的運算額度真的不夠用了，屆時建議考慮升級 Cloudflare Workers 付費方案（US$5/月）或改用 Vercel 免費方案。

## 部署到 Cloudflare Pages

```bash
npm install -D @cloudflare/next-on-pages
npm run pages:build
npx wrangler pages deploy .vercel/output/static
```

在 Cloudflare Pages 專案設定裡把 `.env.local` 的變數加進 Environment Variables。

## 金流串接（目前尚未決定廠商，先預留介面）

`src/lib/payment/provider.ts` 定義了 `createPaymentSession()` 的統一介面。
之後不管選綠界或藍新，只要在 `src/lib/payment/ecpay.ts` 或 `newebpay.ts`
實作這個介面、在 checkout API route 換掉呼叫對象即可，前台完全不用改。

兩家申請與串接重點先記著：
- **綠界 ECPay**：需要公司統編申請特約商店，測試環境可先用「測試商店」。串接方式是後端組表單參數 + CheckMacValue 簽章，導向綠界頁面付款完成後 callback 回你的 API。
- **藍新 NewebPay**：申請流程類似，串接是 AES 加密的 TradeInfo 參數。

正式營運前務必：申請商業登記/公司登記（Supabase + 金流商都會要求），並確認退換貨、發票（電子發票）機制。

## 目錄結構

```
src/
  app/
    page.tsx                前台首頁
    category/[slug]/        分類頁
    product/[slug]/         商品詳情頁
    cart/                   購物車
    checkout/                結帳
    account/                會員中心
    admin/                  後台管理（商品/訂單/會員）
    sitemap.ts / robots.ts  SEO
  components/               UI 元件
  lib/
    supabase/               Supabase client (瀏覽器 / 伺服器)
    payment/                金流抽象介面
  types/                    TypeScript 型別
supabase/schema.sql          資料庫 schema
```

## 待辦（正式上線前）

- [ ] 決定並申請金流商，實作 `src/lib/payment/ecpay.ts` 或 `newebpay.ts`
- [ ] 申請電子發票串接（多數金流商有附加服務）
- [ ] 補齊隱私權政策、退換貨政策頁面（電商必備，也利於 SEO 信任度）
- [ ] Google Search Console 提交 sitemap、綁定 Google Analytics
- [ ] 圖片壓縮/CDN（建議用 Supabase Storage + Cloudflare Images 或 next/image 的 remote loader）
