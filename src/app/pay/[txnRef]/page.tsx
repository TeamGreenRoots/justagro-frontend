"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Leaf, Loader2, CheckCircle, AlertCircle, Download, CreditCard, Info, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { formatNaira, formatDate, printReceipt } from "@/lib/utils";
import type { Receipt } from "@/types";
import Link from "next/link";

interface PaymentData {
  status:            string;
  alreadyPaid:       boolean;
  txnRef:            string;
  cropType:          string;
  quantity:          number;
  pricePerKg:        number;
  totalAmount:       number;
  farmerName:        string;
  farmName:          string;
  buyerName:         string;
  createdAt:         string;
  checkoutScriptUrl: string;
  paymentConfig:     Record<string, any>;
  receipt?:          Receipt;
}

declare global {
  interface Window { webpayCheckout: (c: Record<string, any>) => void; }
}

const TEST_CARDS = [
  { brand: "Verve  (no OTP)",       number: "5061 0502 5475 6707 864", expiry: "06/26", cvv: "111", pin: "1111" },
  { brand: "Visa  (no OTP)",         number: "4000 0000 0000 2503",     expiry: "03/50", cvv: "11",  pin: "1111" },
  { brand: "Mastercard (OTP: 123456)", number: "5123 4500 0000 0008",     expiry: "01/39", cvv: "100", pin: "1111" },
];

// Interswitch response codes that mean "payment succeeded"
const SUCCESS_CODES = ["00", "10", "11"];

export default function PayPage() {
  const params = useParams();
  const txnRef = params.txnRef as string;

  const [data,         setData]         = useState<PaymentData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [paying,       setPaying]       = useState(false);
  const [paid,         setPaid]         = useState(false);
  const [receipt,      setReceipt]      = useState<Receipt | null>(null);
  const [error,        setError]        = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showCards,    setShowCards]    = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Fetch transaction data
  useEffect(() => {
    api.get(`/transactions/public/${txnRef}`)
      .then(res => {
        const d = res.data;
        setData(d);
        if (d.alreadyPaid && d.receipt) { setPaid(true); setReceipt(d.receipt); }
      })
      .catch(err => setError(err.response?.data?.message || "Transaction not found"))
      .finally(() => setLoading(false));
  }, [txnRef]);

  // Load Interswitch inline checkout script
  useEffect(() => {
    if (!data?.checkoutScriptUrl || scriptLoaded || scriptRef.current) return;

    const script      = document.createElement("script");
    script.src        = data.checkoutScriptUrl;
    script.async      = true;
    scriptRef.current = script;

    script.onload  = () => { console.log("[Interswitch] Checkout script loaded "); setScriptLoaded(true); };
    script.onerror = () => { setError("Payment system could not load. Please refresh the page."); };

    document.head.appendChild(script);
    return () => {
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }
    };
  }, [data?.checkoutScriptUrl]);

  // Verify with backend after successful Interswitch payment
  async function verifyPayment() {
    try {
      // Wait 2s — give Interswitch time to record the transaction
      await new Promise(r => setTimeout(r, 2000));

      const res = await api.post(`/transactions/public/${txnRef}/verify`, { resp: "00" });

      if (res.data.success || res.data.alreadyPaid) {
        setPaid(true);
        setReceipt(res.data.receipt);
      } else {
        setError("Payment verified but confirmation failed. Contact support with ref: " + txnRef);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification error — contact support with ref: " + txnRef);
    } finally {
      setPaying(false);
    }
  }

  function handlePay() {
    setError("");

    if (!data?.paymentConfig) { setError("Payment configuration missing. Please refresh."); return; }
    if (!scriptLoaded || typeof window.webpayCheckout !== "function") {
      setError("Payment system is still loading. Please wait a moment and try again.");
      return;
    }

    setPaying(true);

    window.webpayCheckout({
      ...data.paymentConfig,
      onComplete: (response: any) => {
        console.log("[Interswitch] onComplete response:", response);

        const code = response?.responseCode || response?.resp || "";
        const desc = response?.responseDescription || "";

        // ── Check if payment actually succeeded ──────────────
        if (SUCCESS_CODES.includes(code)) {
          // Payment confirmed by Interswitch — verify server-side
          verifyPayment();
          return;
        }

        // ── Handle specific failure codes ────────────────────
        setPaying(false);

        if (code === "Z4") {
          setError(
            " Sandbox Limit Exceeded (Z4)\n\n" +
            "Your Interswitch Starter Business account has a per-transaction limit " +
            "(usually ₦2,000). The transaction amount is too high for sandbox testing.\n\n" +
            "Solutions:\n" +
            "• Create a test transaction with a smaller amount (₦100–₦1,000)\n" +
            "• Or log into business.quickteller.com and upgrade your account type"
          );
          return;
        }

        if (code === "Z6" || code === "Z16") {
          setError("Transaction was cancelled. Please try again.");
          return;
        }

        if (code === "Z7") {
          setError("Session expired. Please refresh the page and try again.");
          return;
        }

        if (code === "") {
          // User closed the popup without paying
          setError("Payment was not completed. Please try again.");
          return;
        }

        // Generic failure
        setError(`Payment failed (${code}): ${desc || "Please try again or use a different card."}`);
      },
    });
  }

  // ── Loading ────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading payment...</p>
      </div>
    </div>
  );

  if (error && !data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-card">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="font-display text-xl font-semibold text-slate-900 mb-2">Not Found</h2>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    </div>
  );

  // ── Receipt (already paid) ─────────────────────────────────
  if (paid && receipt) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-card overflow-hidden animate-fade-up">
        <div className="bg-brand-900 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-1">Payment Confirmed </p>
          <p className="font-display text-3xl font-bold text-white">{formatNaira(receipt.totalAmount)}</p>
        </div>

        <div className="p-6">
          {[
            ["Farmer",       receipt.farmerName],
            ["Farm",         receipt.farmName],
            ["Buyer",        receipt.buyerName],
            ["Produce",      receipt.cropType],
            ["Quantity",     `${receipt.quantity}kg`],
            ["Price/kg",     formatNaira(receipt.pricePerKg)],
            ["Platform Fee", formatNaira(receipt.platformFee)],
            ["Total Paid",   formatNaira(receipt.totalAmount)],
            ["Method",       receipt.paymentMethod],
            ["Date",         formatDate(receipt.paidAt)],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between py-2.5 border-b border-slate-50 last:border-0 text-sm">
              <span className="text-slate-500">{l}</span>
              <span className="font-semibold text-slate-900">{v}</span>
            </div>
          ))}
          <div className="mt-4 bg-slate-50 rounded-xl p-3 text-center">
            <p className="font-mono text-xs text-slate-500">Ref: {receipt.txnRef}</p>
          </div>
          <button
            onClick={() => printReceipt(receipt)}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-brand-900 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-800 transition-colors text-sm shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Receipt PDF
          </button>
        </div>
        <p className="text-center pb-5 text-slate-400 text-xs">Powered by JustAgro · Interswitch</p>
      </div>
    </div>
  );

  // ── Payment Page ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-sm space-y-4">

        {/* Sandbox limit warning */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-blue-800 text-sm font-semibold mb-1"> Sandbox Testing Note</p>
          <p className="text-blue-600 text-xs leading-relaxed">
            Interswitch Starter accounts have a <strong>small transaction limit</strong>.
            If you get a Z4 error, create a test transaction with a{" "}
            <strong>small amount (₦100 – ₦2,000)</strong> on the aggregator dashboard.
          </p>
        </div>

        {/* Test cards toggle */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <button onClick={() => setShowCards(!showCards)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-amber-700 text-sm font-semibold flex-1">Test Cards (Sandbox)</span>
            <span className="text-amber-500 text-xs">{showCards ? "Hide ▲" : "Show ▼"}</span>
          </button>
          {showCards && (
            <div className="px-4 pb-4 space-y-3 border-t border-amber-100">
              <p className="text-amber-600 text-xs pt-3 font-medium">All PIN: <strong>1111</strong> · Use Verve to avoid OTP</p>
              {TEST_CARDS.map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-3 border border-amber-100">
                  <p className="font-semibold text-slate-800 text-xs mb-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" /> {c.brand}
                  </p>
                  <p className="font-mono text-xs text-slate-700 mb-1 select-all">{c.number}</p>
                  <p className="text-xs text-slate-500">Expiry: {c.expiry} · CVV: {c.cvv} · PIN: {c.pin}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment card */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="bg-brand-900 px-6 py-4 flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display text-white font-semibold">JustAgro Payment</span>
            <div className="ml-auto text-xs">
              {scriptLoaded
                ? <span className="text-white/60">✓ Ready</span>
                : <span className="text-white/40 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</span>}
            </div>
          </div>

          {data && (
            <div className="p-6">
              <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2.5">
                {[
                  ["Farmer",   data.farmerName],
                  ["Produce",  data.cropType],
                  ["Quantity", `${data.quantity}kg`],
                  ["Price/kg", formatNaira(data.pricePerKg)],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800">Total</span>
                  <span className="font-display font-bold text-xl text-brand-900">{formatNaira(data.totalAmount)}</span>
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-red-700 text-sm whitespace-pre-line leading-relaxed">{error}</p>
                  {error.includes("Z4") && (
                    <Link href="https://business.quickteller.com" target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-red-600 underline hover:text-red-800">
                      <ExternalLink className="w-3 h-3" /> Open Quickteller Business Dashboard
                    </Link>
                  )}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={paying || !scriptLoaded}
                className="w-full bg-brand-900 text-white py-4 rounded-xl font-bold text-base hover:bg-brand-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                {paying
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  : !scriptLoaded
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Loading payment...</>
                    : `Pay ${formatNaira(data.totalAmount)}`}
              </button>
              <p className="text-center text-slate-400 text-xs mt-3">Secured by Interswitch · Card · Transfer · USSD</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



// "use client";
// import { useEffect, useState, useRef } from "react";
// import { useParams } from "next/navigation";
// import { Leaf, Loader2, CheckCircle, AlertCircle, Download, CreditCard, Info, ExternalLink, Triangle, CircleCheck, Minus, type LucideIcon } from "lucide-react";
// import api from "@/lib/api";
// import { formatNaira, formatDate, printReceipt } from "@/lib/utils";
// import type { Receipt } from "@/types";

// interface PaymentData {
//   status:            string;
//   alreadyPaid:       boolean;
//   txnRef:            string;
//   cropType:          string;
//   quantity:          number;
//   pricePerKg:        number;
//   totalAmount:       number;
//   farmerName:        string;
//   farmName:          string;
//   buyerName:         string;
//   createdAt:         string;
//   checkoutScriptUrl: string;
//   paymentConfig:     Record<string, any>;
//   receipt?:          Receipt;
// }

// declare global {
//   interface Window { webpayCheckout: (c: Record<string, any>) => void; }
// }

// const TEST_CARDS: { brand: string; icon: LucideIcon; iconClass: string; note: string; number: string; expiry: string; cvv: string; pin: string }[] = [
//   { brand: "Verve",      icon: CircleCheck, iconClass: "text-emerald-500", note: "no OTP",       number: "5061 0502 5475 6707 864", expiry: "06/26", cvv: "111", pin: "1111" },
//   { brand: "Visa",       icon: CircleCheck, iconClass: "text-emerald-500", note: "no OTP",       number: "4000 0000 0000 2503",     expiry: "03/50", cvv: "11",  pin: "1111" },
//   { brand: "Mastercard", icon: Minus,       iconClass: "text-amber-500",   note: "OTP: 123456",  number: "5123 4500 0000 0008",     expiry: "01/39", cvv: "100", pin: "1111" },
// ];

// // Interswitch response codes that mean "payment succeeded"
// const SUCCESS_CODES = ["00", "10", "11"];

// export default function PayPage() {
//   const params = useParams();
//   const txnRef = params.txnRef as string;

//   const [data,         setData]         = useState<PaymentData | null>(null);
//   const [loading,      setLoading]      = useState(true);
//   const [paying,       setPaying]       = useState(false);
//   const [paid,         setPaid]         = useState(false);
//   const [receipt,      setReceipt]      = useState<Receipt | null>(null);
//   const [error,        setError]        = useState("");
//   const [scriptLoaded, setScriptLoaded] = useState(false);
//   const [showCards,    setShowCards]    = useState(false);
//   const scriptRef = useRef<HTMLScriptElement | null>(null);

//   // Fetch transaction data
//   useEffect(() => {
//     api.get(`/transactions/public/${txnRef}`)
//       .then(res => {
//         const d = res.data;
//         setData(d);
//         if (d.alreadyPaid && d.receipt) { setPaid(true); setReceipt(d.receipt); }
//       })
//       .catch(err => setError(err.response?.data?.message || "Transaction not found"))
//       .finally(() => setLoading(false));
//   }, [txnRef]);

//   // Load Interswitch inline checkout script
//   useEffect(() => {
//     if (!data?.checkoutScriptUrl || scriptLoaded || scriptRef.current) return;

//     const script      = document.createElement("script");
//     script.src        = data.checkoutScriptUrl;
//     script.async      = true;
//     scriptRef.current = script;

//     script.onload  = () => { console.log("[Interswitch] Checkout script loaded ✅"); setScriptLoaded(true); };
//     script.onerror = () => { setError("Payment system could not load. Please refresh the page."); };

//     document.head.appendChild(script);
//     return () => {
//       if (scriptRef.current && document.head.contains(scriptRef.current)) {
//         document.head.removeChild(scriptRef.current);
//       }
//     };
//   }, [data?.checkoutScriptUrl]);

//   // Verify with backend after successful Interswitch payment
//   async function verifyPayment() {
//     try {
//       // Wait 2s — give Interswitch time to record the transaction
//       await new Promise(r => setTimeout(r, 2000));

//       const res = await api.post(`/transactions/public/${txnRef}/verify`, { resp: "00" });

//       if (res.data.success || res.data.alreadyPaid) {
//         setPaid(true);
//         setReceipt(res.data.receipt);
//       } else {
//         setError("Payment verified but confirmation failed. Contact support with ref: " + txnRef);
//       }
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Verification error — contact support with ref: " + txnRef);
//     } finally {
//       setPaying(false);
//     }
//   }

//   function handlePay() {
//     setError("");

//     if (!data?.paymentConfig) { setError("Payment configuration missing. Please refresh."); return; }
//     if (!scriptLoaded || typeof window.webpayCheckout !== "function") {
//       setError("Payment system is still loading. Please wait a moment and try again.");
//       return;
//     }

//     setPaying(true);

//     window.webpayCheckout({
//       ...data.paymentConfig,
//       onComplete: (response: any) => {
//         console.log("[Interswitch] onComplete response:", response);

//         const code = response?.responseCode || response?.resp || "";
//         const desc = response?.responseDescription || "";

//         // Check if payment actually succeeded 
//         if (SUCCESS_CODES.includes(code)) {
//           // Payment confirmed by Interswitch — verify server-side
//           verifyPayment();
//           return;
//         }

//         //  Handle specific failure codes 
//         setPaying(false);

//         if (code === "Z4") {
//           setError(
//             "❌ Sandbox Limit Exceeded (Z4)\n\n" +
//             "Your Interswitch Starter Business account has a per-transaction limit " +
//             "(usually ₦2,000). The transaction amount is too high for sandbox testing.\n\n" +
//             "Solutions:\n" +
//             "• Create a test transaction with a smaller amount (₦100–₦1,000)\n" +
//             "• Or log into business.quickteller.com and upgrade your account type"
//           );
//           return;
//         }

//         if (code === "Z6" || code === "Z16") {
//           setError("Transaction was cancelled. Please try again.");
//           return;
//         }

//         if (code === "Z7") {
//           setError("Session expired. Please refresh the page and try again.");
//           return;
//         }

//         if (code === "") {
//           // User closed the popup without paying
//           setError("Payment was not completed. Please try again.");
//           return;
//         }

//         // Generic failure
//         setError(`Payment failed (${code}): ${desc || "Please try again or use a different card."}`);
//       },
//     });
//   }

//   // Loading 
//   if (loading) return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
//       <div className="text-center">
//         <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
//         <p className="text-slate-400 text-sm">Loading payment...</p>
//       </div>
//     </div>
//   );

//   if (error && !data) return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
//       <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-card">
//         <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
//         <h2 className="font-display text-xl font-semibold text-slate-900 mb-2">Not Found</h2>
//         <p className="text-slate-500 text-sm">{error}</p>
//       </div>
//     </div>
//   );

//   // Receipt (already paid) 
//   if (paid && receipt) return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
//       <div className="bg-white rounded-2xl max-w-sm w-full shadow-card overflow-hidden animate-fade-up">
//         <div className="bg-brand-900 p-8 text-center">
//           <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
//             <CheckCircle className="w-8 h-8 text-white" />
//           </div>
//           <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-1">Payment Confirmed <CircleCheck/></p>
//           <p className="font-display text-3xl font-bold text-white">{formatNaira(receipt.totalAmount)}</p>
//         </div>

//         <div className="p-6">
//           {[
//             ["Farmer",       receipt.farmerName],
//             ["Farm",         receipt.farmName],
//             ["Buyer",        receipt.buyerName],
//             ["Produce",      receipt.cropType],
//             ["Quantity",     `${receipt.quantity}kg`],
//             ["Price/kg",     formatNaira(receipt.pricePerKg)],
//             ["Platform Fee", formatNaira(receipt.platformFee)],
//             ["Total Paid",   formatNaira(receipt.totalAmount)],
//             ["Method",       receipt.paymentMethod],
//             ["Date",         formatDate(receipt.paidAt)],
//           ].map(([l, v]) => (
//             <div key={l} className="flex justify-between py-2.5 border-b border-slate-50 last:border-0 text-sm">
//               <span className="text-slate-500">{l}</span>
//               <span className="font-semibold text-slate-900">{v}</span>
//             </div>
//           ))}
//           <div className="mt-4 bg-slate-50 rounded-xl p-3 text-center">
//             <p className="font-mono text-xs text-slate-500">Ref: {receipt.txnRef}</p>
//           </div>
//           <button
//             onClick={() => printReceipt(receipt)}
//             className="w-full mt-4 flex items-center justify-center gap-2 bg-brand-900 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-800 transition-colors text-sm shadow-sm"
//           >
//             <Download className="w-4 h-4" /> Download Receipt PDF
//           </button>
//         </div>
//         <p className="text-center pb-5 text-slate-400 text-xs">Powered by JustAgro · Interswitch</p>
//       </div>
//     </div>
//   );

//   // Payment Page 
//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
//       <div className="w-full max-w-sm space-y-4">

//         {/* Sandbox limit warning */}
//         <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
//           <p className="text-blue-800 text-sm font-semibold mb-1"><Triangle /> Sandbox Testing Note</p>
//           <p className="text-blue-600 text-xs leading-relaxed">
//             Interswitch Starter accounts have a <strong>small transaction limit</strong>.
//             If you get a Z4 error, create a test transaction with a{" "}
//             <strong>small amount (₦100 – ₦2,000)</strong> on the aggregator dashboard.
//           </p>
//         </div>

//         {/* Test cards toggle */}
//         <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
//           <button onClick={() => setShowCards(!showCards)}
//             className="w-full flex items-center gap-3 px-4 py-3 text-left">
//             <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
//             <span className="text-amber-700 text-sm font-semibold flex-1">Test Cards (Sandbox)</span>
//             <span className="text-amber-500 text-xs">{showCards ? "Hide ▲" : "Show ▼"}</span>
//           </button>
//           {showCards && (
//             <div className="px-4 pb-4 space-y-3 border-t border-amber-100">
//               <p className="text-amber-600 text-xs pt-3 font-medium">All PIN: <strong>1111</strong> · Use Verve to avoid OTP</p>
//               {TEST_CARDS.map((c, i) => (
//                 <div key={i} className="bg-white rounded-xl p-3 border border-amber-100">
//                   <p className="font-semibold text-slate-800 text-xs mb-1.5 flex items-center gap-1.5">
//                     <CreditCard className="w-3 h-3" /> {c.brand}
//                   </p>
//                   <p className="font-mono text-xs text-slate-700 mb-1 select-all">{c.number}</p>
//                   <p className="text-xs text-slate-500">Expiry: {c.expiry} · CVV: {c.cvv} · PIN: {c.pin}</p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Payment card */}
//         <div className="bg-white rounded-2xl shadow-card overflow-hidden">
//           <div className="bg-brand-900 px-6 py-4 flex items-center gap-2">
//             <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
//               <Leaf className="w-3.5 h-3.5 text-white" />
//             </div>
//             <span className="font-display text-white font-semibold">JustAgro Payment</span>
//             <div className="ml-auto text-xs">
//               {scriptLoaded
//                 ? <span className="text-white/60">✓ Ready</span>
//                 : <span className="text-white/40 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</span>}
//             </div>
//           </div>

//           {data && (
//             <div className="p-6">
//               <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2.5">
//                 {[
//                   ["Farmer",   data.farmerName],
//                   ["Produce",  data.cropType],
//                   ["Quantity", `${data.quantity}kg`],
//                   ["Price/kg", formatNaira(data.pricePerKg)],
//                 ].map(([l, v]) => (
//                   <div key={l} className="flex justify-between text-sm">
//                     <span className="text-slate-500">{l}</span>
//                     <span className="font-semibold">{v}</span>
//                   </div>
//                 ))}
//                 <div className="flex justify-between pt-2 border-t border-slate-200">
//                   <span className="font-semibold text-slate-800">Total</span>
//                   <span className="font-display font-bold text-xl text-brand-900">{formatNaira(data.totalAmount)}</span>
//                 </div>
//               </div>

//               {/* Error display */}
//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
//                   <p className="text-red-700 text-sm whitespace-pre-line leading-relaxed">{error}</p>
//                   {error.includes("Z4") && (
//                     <a href="https://business.quickteller.com" target="_blank" rel="noreferrer"
//                       className="inline-flex items-center gap-1 mt-2 text-xs text-red-600 underline hover:text-red-800">
//                       <ExternalLink className="w-3 h-3" /> Open Quickteller Business Dashboard
//                     </a>
//                   )}
//                 </div>
//               )}

//               <button
//                 onClick={handlePay}
//                 disabled={paying || !scriptLoaded}
//                 className="w-full bg-brand-900 text-white py-4 rounded-xl font-bold text-base hover:bg-brand-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
//               >
//                 {paying
//                   ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
//                   : !scriptLoaded
//                     ? <><Loader2 className="w-5 h-5 animate-spin" /> Loading payment...</>
//                     : `Pay ${formatNaira(data.totalAmount)}`}
//               </button>
//               <p className="text-center text-slate-400 text-xs mt-3">Secured by Interswitch · Card · Transfer · USSD</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }