const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyFWlPli6vwIWKnT4rX9U79npcbo3qEeFf6Ea67-T1GXnx03phh055XQqNTTXStcvTnzg/exec";

interface PaymentData {
  email: string;
  name: string;
  trainingName: string;
  transactionId: string;
  [key: string]: unknown;
}

export const sendPaymentConfirmationEmail = async (paymentData: PaymentData) => {
  try {
    console.log("Sending payment confirmation to webhook...");
    
    const payload = {
      email: paymentData.email,
      name: paymentData.name,
      trainingName: paymentData.trainingName,
      transactionId: paymentData.transactionId,
      action: "send_confirmation_email", 
      timestamp: new Date().toISOString()
    };

    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log("Webhook request sent successfully (no-cors mode)");
    return { success: true };

  } catch (error: unknown) {
    console.error("Error sending payment confirmation webhook:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
