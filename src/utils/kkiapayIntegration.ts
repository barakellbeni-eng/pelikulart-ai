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

export const initiateKkiapayPayment = async ({ amount, email, name, trainingName }: PaymentParams): Promise<PaymentResult> => {
  console.log("Initiating Kkiapay payment flow...");
  await loadKkiapayScript();

  return new Promise<PaymentResult>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const successHandler = (response: any) => {
      console.log("Payment success callback received!", response);
      
      if (window.removeKkiapayListener) {
        window.removeKkiapayListener('success', successHandler);
      }
      
      const paymentData: PaymentResult = {
        transactionId: response.transactionId,
        amount,
        email,
        name,
        trainingName,
        paymentStatus: 'COMPLETED',
        rawResponse: response,
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
