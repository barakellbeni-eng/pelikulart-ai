export const KKIAPAY_PUBLIC_KEY = "046751a99c664c3a1caf83a22a1f8068c568f24b";

const loadKkiapayScript = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    if (window.openKkiapayWidget) {
      resolve();
      return;
    }
    
    const existingScript = document.querySelector('script[src="https://cdn.kkiapay.me/k.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      return;
    }

    const script = document.createElement('script');
    script.src = "https://cdn.kkiapay.me/k.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (e) => console.error("Failed to load Kkiapay script", e);
    document.body.appendChild(script);
  });
};

interface PaymentParams {
  amount: number;
  email: string;
  name: string;
  trainingName: string;
}

interface PaymentResult {
  transactionId: string;
  amount: number;
  email: string;
  name: string;
  trainingName: string;
  paymentStatus: string;
  rawResponse: Record<string, unknown>;
  timestamp: string;
}

const extractTransactionId = (response: Record<string, any>): string => {
  const candidates = [
    response?.transactionId,
    response?.transaction_id,
    response?.transaction?.id,
    response?.data?.transactionId,
    response?.data?.transaction_id,
    response?.data?.transaction?.id,
    response?.id,
  ];

  const found = candidates.find((value) => typeof value === "string" && value.trim().length > 0);
  return found ? found.trim() : "";
};

export const initiateKkiapayPayment = async ({ amount, email, name, trainingName }: PaymentParams): Promise<PaymentResult> => {
  console.log("Initiating Kkiapay payment flow...");
  await loadKkiapayScript();

  return new Promise<PaymentResult>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const successHandler = (response: any) => {
      console.log("Payment success callback received!", response);
      const rawResponse = (response ?? {}) as Record<string, any>;
      const transactionId = extractTransactionId(rawResponse);

      if (window.removeKkiapayListener) {
        window.removeKkiapayListener('success', successHandler);
      }

      if (!transactionId) {
        reject(new Error("Transaction Kkiapay introuvable après paiement"));
        return;
      }

      const paymentData: PaymentResult = {
        transactionId,
        amount,
        email,
        name,
        trainingName,
        paymentStatus: 'COMPLETED',
        rawResponse,
        timestamp: new Date().toISOString()
      };

      resolve(paymentData);
    };

    if (window.addKkiapayListener) {
      window.addKkiapayListener('success', successHandler);
    } else {
      window.addEventListener('success', (e: Event) => successHandler((e as CustomEvent).detail || {}));
    }

    if (window.openKkiapayWidget) {
      window.openKkiapayWidget({
        amount,
        api_key: KKIAPAY_PUBLIC_KEY,
        sandbox: false,
        email,
        name,
        theme: "#CCFF00",
      });
    } else {
      if (window.removeKkiapayListener) {
        window.removeKkiapayListener('success', successHandler);
      }
      reject(new Error("Kkiapay widget failed to load or initialize"));
    }
  });
};
