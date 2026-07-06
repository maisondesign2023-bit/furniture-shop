const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "家具品牌";

type OrderInfo = {
  order_no: string;
  recipient_name: string;
  total: number;
  email?: string | null;
};

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log("尚未設定 RESEND_API_KEY，略過寄信：", subject, "→", to);
    return;
  }
  if (!to) {
    console.log("收件信箱是空的，略過寄信：", subject);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.log("寄信失敗：", res.status, text);
    }
  } catch (err) {
    console.log("寄信發生錯誤：", err);
  }
}

function wrapTemplate(title: string, bodyHtml: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #2A2521;">
      <h2 style="color: #4B3324;">${title}</h2>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #8A8177;">${SITE_NAME}</p>
    </div>
  `;
}

// ============================================
// 訂單成立（送出訂單、尚未付款）
// ============================================
export async function sendOrderCreatedEmails(order: OrderInfo) {
  const customerHtml = wrapTemplate(
    "訂單已成立",
    `
      <p>${order.recipient_name} 您好，感謝您的訂購。</p>
      <p>訂單編號：<strong>${order.order_no}</strong></p>
      <p>訂單金額：NT$ ${order.total.toLocaleString()}</p>
      <p>請完成付款程序，我們收到付款後會盡快為您安排出貨。</p>
    `
  );

  const adminHtml = wrapTemplate(
    "有新的訂單",
    `
      <p>收件人：${order.recipient_name}</p>
      <p>訂單編號：${order.order_no}</p>
      <p>金額：NT$ ${order.total.toLocaleString()}</p>
      <p>狀態：待付款</p>
    `
  );

  await Promise.all([
    order.email
      ? sendEmail(order.email, `訂單已成立 - ${order.order_no}`, customerHtml)
      : Promise.resolve(),
    ADMIN_EMAIL
      ? sendEmail(ADMIN_EMAIL, `新訂單通知 - ${order.order_no}`, adminHtml)
      : Promise.resolve(),
  ]);
}

// ============================================
// 付款完成
// ============================================
export async function sendOrderPaidEmails(order: OrderInfo) {
  const customerHtml = wrapTemplate(
    "付款成功",
    `
      <p>${order.recipient_name} 您好，我們已收到您的付款。</p>
      <p>訂單編號：<strong>${order.order_no}</strong></p>
      <p>訂單金額：NT$ ${order.total.toLocaleString()}</p>
      <p>我們會盡快為您安排出貨，謝謝您的訂購。</p>
    `
  );

  const adminHtml = wrapTemplate(
    "訂單已付款",
    `
      <p>訂單編號：${order.order_no}</p>
      <p>收件人：${order.recipient_name}</p>
      <p>金額：NT$ ${order.total.toLocaleString()}</p>
      <p>狀態：已付款，請安排出貨。</p>
    `
  );

  await Promise.all([
    order.email
      ? sendEmail(order.email, `付款成功通知 - ${order.order_no}`, customerHtml)
      : Promise.resolve(),
    ADMIN_EMAIL
      ? sendEmail(ADMIN_EMAIL, `訂單已付款 - ${order.order_no}`, adminHtml)
      : Promise.resolve(),
  ]);
}

// ============================================
// 已出貨（後台手動更新狀態時觸發）
// ============================================
export async function sendOrderShippedEmail(order: OrderInfo) {
  const customerHtml = wrapTemplate(
    "商品已出貨",
    `
      <p>${order.recipient_name} 您好，您的訂單已經出貨囉。</p>
      <p>訂單編號：<strong>${order.order_no}</strong></p>
      <p>如有任何問題，歡迎與我們聯繫。</p>
    `
  );

  if (order.email) {
    await sendEmail(order.email, `商品已出貨 - ${order.order_no}`, customerHtml);
  }
}
