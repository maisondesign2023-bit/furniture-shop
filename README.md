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
