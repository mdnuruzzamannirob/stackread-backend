declare module 'sslcommerz-lts' {
  interface SslCommerzInitData {
    total_amount: number
    currency: string
    tran_id: string
    success_url: string
    fail_url: string
    cancel_url: string
    ipn_url?: string
    shipping_method: string
    product_name: string
    product_category: string
    product_profile: string
    cus_name: string
    cus_email: string
    cus_phone?: string
    cus_add1?: string
    cus_city?: string
    cus_country?: string
    [key: string]: unknown
  }

  interface SslCommerzInitResponse {
    status: string
    sessionkey?: string
    GatewayPageURL?: string
    failedreason?: string
    [key: string]: unknown
  }

  interface SslCommerzValidationResponse {
    status: string
    tran_id?: string
    val_id?: string
    amount?: string
    store_amount?: string
    bank_tran_id?: string
    currency?: string
    [key: string]: unknown
  }

  class SSLCommerzPayment {
    constructor(storeId: string, storePassword: string, isLive?: boolean)
    init(data: SslCommerzInitData): Promise<SslCommerzInitResponse>
    validate(data: { val_id: string }): Promise<SslCommerzValidationResponse>
    initiateRefund(data: {
      refund_amount: string
      refund_remarks: string
      bank_tran_id: string
      refe_id: string
    }): Promise<unknown>
    transactionQueryByTransactionId(data: { tran_id: string }): Promise<unknown>
  }

  export = SSLCommerzPayment
}
