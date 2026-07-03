// 金流抽象介面
// 之後申請好 綠界 ECPay 或 藍新 NewebPay，
// 在 ecpay.ts / newebpay.ts 實作這個介面即可接上，checkout 流程完全不用改。

export type PaymentSessionInput = {
  orderNo: string;
  amount: number;
  itemName: string; // 商品名稱摘要，會顯示在金流頁面
  returnUrl: string; // 付款完成後，金流商 server-to-server 通知的 API route
  clientBackUrl: string; // 使用者付款後導回的前台頁面
};

export type PaymentSessionResult = {
  // 導向金流商付款頁面所需的資訊
  // ECPay/NewebPay 都是「後端組表單參數 -> 前端 auto-submit POST」的模式
  actionUrl: string;
  formFields: Record<string, string>;
};

export interface PaymentProvider {
  name: "ecpay" | "newebpay";
  createPaymentSession(input: PaymentSessionInput): Promise<PaymentSessionResult>;
  verifyCallback(payload: Record<string, string>): {
    isValid: boolean;
    orderNo: string;
    tradeNo: string;
  };
}

// 尚未決定廠商前的暫時 mock，讓結帳流程可以先跑通測試
export const mockPaymentProvider: PaymentProvider = {
  name: "ecpay",
  async createPaymentSession(input) {
    return {
      actionUrl: "/checkout/mock-payment",
      formFields: {
        orderNo: input.orderNo,
        amount: String(input.amount),
      },
    };
  },
  verifyCallback(payload) {
    return { isValid: true, orderNo: payload.orderNo, tradeNo: "MOCK" };
  },
};
