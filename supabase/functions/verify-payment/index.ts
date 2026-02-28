import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Valid packs with their cauris amounts
const VALID_PACKS: Record<number, number> = {
  1000: 100,
  2500: 300,
  5000: 650,
  10000: 1500,
  25000: 4000,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const KKIAPAY_SECRET = Deno.env.get("KKIAPAY_SECRET_KEY");
    if (!KKIAPAY_SECRET) {
      return new Response(
        JSON.stringify({ error: "Configuration de vérification de paiement manquante" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Config missing");

    // --- Authentication ---
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentification requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !userData?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Authentification invalide" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { transaction_id, amount } = await req.json();

    if (!transaction_id || typeof transaction_id !== "string") {
      return new Response(
        JSON.stringify({ error: "transaction_id requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!amount || typeof amount !== "number") {
      return new Response(
        JSON.stringify({ error: "amount requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const caurisAmount = VALID_PACKS[amount];
    if (!caurisAmount) {
      return new Response(
        JSON.stringify({ error: "Montant invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if transaction already processed
    const { data: existing } = await adminClient
      .from("payment_transactions")
      .select("id")
      .eq("transaction_id", transaction_id)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "Transaction déjà traitée" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify transaction with KkiaPay API (mandatory)
    try {
      const verifyResp = await fetch("https://api.kkiapay.me/api/v1/transactions/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": KKIAPAY_SECRET,
        },
        body: JSON.stringify({ transactionId: transaction_id }),
      });

      if (!verifyResp.ok) {
        console.error("KkiaPay verification failed:", verifyResp.status);
        return new Response(
          JSON.stringify({ error: "Impossible de vérifier le paiement auprès de KkiaPay" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const verifyData = await verifyResp.json();
      if (verifyData.status !== "SUCCESS") {
        return new Response(
          JSON.stringify({ error: "Paiement non confirmé" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Verify amount matches
      if (verifyData.amount !== amount) {
        return new Response(
          JSON.stringify({ error: "Montant de paiement incorrect" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (verifyErr) {
      console.error("KkiaPay verification error:", verifyErr);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la vérification du paiement" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add cauris to user's balance
    const { data: newBalance, error: addError } = await adminClient.rpc("add_cauris", {
      p_user_id: userId,
      p_amount: caurisAmount,
    });

    if (addError) {
      console.error("add_cauris error:", addError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'ajout des crédits" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record transaction to prevent replay
    await adminClient.from("payment_transactions").insert({
      transaction_id,
      user_id: userId,
      amount,
      cauris_added: caurisAmount,
    });

    console.log(`Payment verified: user=${userId}, amount=${amount}, cauris=${caurisAmount}, tx=${transaction_id}`);

    return new Response(
      JSON.stringify({ success: true, new_balance: newBalance, cauris_added: caurisAmount }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verify-payment error:", e);
    return new Response(
      JSON.stringify({ error: "Une erreur interne est survenue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
