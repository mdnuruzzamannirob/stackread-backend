declare module '@paypal/checkout-server-sdk' {
  namespace core {
    abstract class PayPalEnvironment {
      constructor(clientId: string, clientSecret: string)
    }
    class SandboxEnvironment extends PayPalEnvironment {}
    class LiveEnvironment extends PayPalEnvironment {}
    class PayPalHttpClient {
      constructor(environment: PayPalEnvironment)
      execute<TResult = Record<string, unknown>>(
        request: object,
      ): Promise<{ result: TResult; statusCode: number }>
    }
  }

  namespace orders {
    class OrdersCreateRequest {
      prefer(returnPreference: string): void
      requestBody(body: Record<string, unknown>): void
    }
    class OrdersCaptureRequest {
      constructor(orderId: string)
      requestBody(body: Record<string, unknown>): void
    }
    class OrdersGetRequest {
      constructor(orderId: string)
    }
  }
}
