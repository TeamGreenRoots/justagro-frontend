// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

export function statusColor(status: string): string {
  switch (status) {
    case "PAID":      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "ASSISTED":  return "bg-blue-100 text-blue-700 border border-blue-200";
    case "PENDING":   return "bg-amber-100 text-amber-700 border border-amber-200";
    case "CANCELLED": return "bg-red-100 text-red-600 border border-red-200";
    case "AVAILABLE": return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "RESERVED":  return "bg-amber-100 text-amber-700 border border-amber-200";
    case "SOLD":      return "bg-slate-100 text-slate-600 border border-slate-200";
    default:          return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}

// PDF receipt generator — professional layout with Interswitch branding
export function printReceipt(receipt: {
  txnRef: string; farmerName: string; farmName: string;
  buyerName: string; cropType: string; quantity: number;
  pricePerKg: number; totalAmount: number; platformFee: number;
  farmerReceives: number; paymentMethod: string; paidAt: string;
}): void {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt · ${receipt.txnRef}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background:#f8fafc; }
    .page { max-width: 480px; margin: 32px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }

    /* Header */
    .header { background: #064E3B; padding: 28px 28px 24px; }
    .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .brand-name { color: white; font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
    .verified-badge { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: white; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; }
    .header-title { color: rgba(255,255,255,0.65); font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 6px; }

    /* Amount hero */
    .amount-block { background: #f0fdf4; padding: 24px 28px; border-bottom: 2px dashed #d1fae5; text-align: center; }
    .amount-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 6px; }
    .amount-value { font-size: 42px; font-weight: 800; color: #064E3B; letter-spacing: -1px; line-height: 1; }
    .amount-status { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; }

    /* Rows */
    .section { padding: 8px 28px; }
    .section-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; padding: 16px 0 8px; border-top: 1px solid #f1f5f9; }
    .section-label:first-child { border-top: none; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .row .l { color: #6b7280; font-weight: 400; }
    .row .r { font-weight: 600; color: #0f172a; text-align: right; }
    .row .r.green { color: #064E3B; }
    .row .r.fee { color: #ef4444; }

    /* Reference box */
    .ref-block { margin: 4px 28px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; }
    .ref-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 4px; }
    .ref-value { font-family: 'Courier New', monospace; font-size: 13px; font-weight: 700; color: #334155; letter-spacing: 0.5px; }

    /* Interswitch footer */
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; display: flex; align-items: center; justify-content: space-between; }
    .footer-left { font-size: 10px; color: #94a3b8; }
    .footer-brand { display: flex; align-items: center; gap: 6px; }
    .footer-label { font-size: 10px; color: #94a3b8; }
    .isw-badge { background: #064E3B; color: white; font-size: 9px; font-weight: 800; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase; }

    @media print {
      body { background: white; }
      .page { box-shadow: none; margin: 0; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <div class="brand">
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          </div>
          <span class="brand-name">JustAgro</span>
        </div>
        <span class="verified-badge">✓ Verified</span>
      </div>
      <div class="header-title">Payment Receipt</div>
    </div>

    <div class="amount-block">
      <div class="amount-label">Amount Paid</div>
      <div class="amount-value">${formatNaira(receipt.totalAmount)}</div>
      <div class="amount-status"><span class="dot"></span> Payment Confirmed</div>
    </div>

    <div class="section">
      <div class="section-label">Transaction Parties</div>
      <div class="row"><span class="l">Farmer</span><span class="r">${receipt.farmerName}</span></div>
      <div class="row"><span class="l">Farm</span><span class="r">${receipt.farmName}</span></div>
      <div class="row"><span class="l">Buyer</span><span class="r">${receipt.buyerName}</span></div>
    </div>

    <div class="section">
      <div class="section-label">Produce Details</div>
      <div class="row"><span class="l">Crop</span><span class="r">${receipt.cropType}</span></div>
      <div class="row"><span class="l">Quantity</span><span class="r">${receipt.quantity} kg</span></div>
      <div class="row"><span class="l">Price per kg</span><span class="r">${formatNaira(receipt.pricePerKg)}</span></div>
    </div>

    <div class="section">
      <div class="section-label">Payment Breakdown</div>
      <div class="row"><span class="l">Gross Amount</span><span class="r">${formatNaira(receipt.totalAmount)}</span></div>
      <div class="row"><span class="l">Platform Fee (1%)</span><span class="r fee">- ${formatNaira(receipt.platformFee)}</span></div>
      <div class="row"><span class="l">Farmer Receives</span><span class="r green">${formatNaira(receipt.farmerReceives)}</span></div>
      <div class="row"><span class="l">Payment Method</span><span class="r">${receipt.paymentMethod}</span></div>
      <div class="row"><span class="l">Date & Time</span><span class="r">${new Date(receipt.paidAt).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
    </div>

    <div class="ref-block">
      <div class="ref-label">Transaction Reference</div>
      <div class="ref-value">${receipt.txnRef}</div>
    </div>

    <div class="footer">
      <div class="footer-left">JustAgro Agricultural Payment Platform<br/>Interswitch | Enyata Hackathon 2026</div>
      <div class="footer-brand">
        <span class="footer-label">Powered by</span>
        <span class="isw-badge">Interswitch</span>
      </div>
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=560,height=780");
  if (w) { w.document.write(html); w.document.close(); }
}






// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// export function formatNaira(amount: number): string {
//   return new Intl.NumberFormat("en-NG", {
//     style: "currency", currency: "NGN", minimumFractionDigits: 0,
//   }).format(amount);
// }

// export function formatDate(date: string | Date): string {
//   return new Intl.DateTimeFormat("en-NG", {
//     day: "numeric", month: "short", year: "numeric",
//   }).format(new Date(date));
// }

// export function formatDateTime(date: string | Date): string {
//   return new Intl.DateTimeFormat("en-NG", {
//     day: "numeric", month: "short", year: "numeric",
//     hour: "2-digit", minute: "2-digit",
//   }).format(new Date(date));
// }

// export function statusColor(status: string): string {
//   switch (status) {
//     case "PAID":      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
//     case "ASSISTED":  return "bg-blue-100 text-blue-700 border border-blue-200";
//     case "PENDING":   return "bg-amber-100 text-amber-700 border border-amber-200";
//     case "CANCELLED": return "bg-red-100 text-red-600 border border-red-200";
//     case "AVAILABLE": return "bg-emerald-100 text-emerald-700 border border-emerald-200";
//     case "RESERVED":  return "bg-amber-100 text-amber-700 border border-amber-200";
//     case "SOLD":      return "bg-slate-100 text-slate-600 border border-slate-200";
//     default:          return "bg-slate-100 text-slate-600 border border-slate-200";
//   }
// }

// // PDF receipt generator using browser print
// export function printReceipt(receipt: {
//   txnRef: string; farmerName: string; farmName: string;
//   buyerName: string; cropType: string; quantity: number;
//   pricePerKg: number; totalAmount: number; platformFee: number;
//   farmerReceives: number; paymentMethod: string; paidAt: string;
// }): void {
//   const html = `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8"/>
//   <title>Receipt ${receipt.txnRef}</title>
//   <style>
//     * { margin:0; padding:0; box-sizing:border-box; }
//     body { font-family: Arial, sans-serif; background: #fff; padding: 40px; }
//     .receipt { max-width: 420px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
//     .header { background: #064E3B; color: white; padding: 28px 24px; text-align: center; }
//     .header h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
//     .header p { font-size: 12px; opacity: 0.7; }
//     .amount { text-align: center; padding: 24px; background: #f0fdf4; border-bottom: 1px dashed #d1fae5; }
//     .amount .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
//     .amount .value { font-size: 36px; font-weight: 800; color: #064E3B; margin-top: 4px; }
//     .rows { padding: 20px 24px; }
//     .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
//     .row:last-child { border-bottom: none; }
//     .row .l { color: #6b7280; }
//     .row .r { font-weight: 600; color: #0f172a; }
//     .ref { background: #f8fafc; margin: 0 24px 20px; padding: 12px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 12px; color: #475569; border: 1px solid #e2e8f0; }
//     .footer { text-align: center; padding: 16px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
//     @media print {
//       body { padding: 0; }
//       .receipt { border: none; }
//     }
//   </style>
// </head>
// <body>
//   <div class="receipt">
//     <div class="header">
//       <h1> JustAgro</h1>
//       <p>Official Payment Receipt</p>
//     </div>
//     <div class="amount">
//       <div class="label">Amount Paid</div>
//       <div class="value">${formatNaira(receipt.totalAmount)}</div>
//     </div>
//     <div class="rows">
//       <div class="row"><span class="l">Farmer</span><span class="r">${receipt.farmerName}</span></div>
//       <div class="row"><span class="l">Farm</span><span class="r">${receipt.farmName}</span></div>
//       <div class="row"><span class="l">Buyer</span><span class="r">${receipt.buyerName}</span></div>
//       <div class="row"><span class="l">Produce</span><span class="r">${receipt.cropType}</span></div>
//       <div class="row"><span class="l">Quantity</span><span class="r">${receipt.quantity}kg</span></div>
//       <div class="row"><span class="l">Price/kg</span><span class="r">${formatNaira(receipt.pricePerKg)}</span></div>
//       <div class="row"><span class="l">Platform Fee</span><span class="r">${formatNaira(receipt.platformFee)}</span></div>
//       <div class="row"><span class="l">Farmer Receives</span><span class="r" style="color:#064E3B">${formatNaira(receipt.farmerReceives)}</span></div>
//       <div class="row"><span class="l">Payment Method</span><span class="r">${receipt.paymentMethod}</span></div>
//       <div class="row"><span class="l">Date</span><span class="r">${formatDate(receipt.paidAt)}</span></div>
//     </div>
//     <div class="ref">Reference: ${receipt.txnRef}</div>
//     <div class="footer">Powered by JustAgro · Interswitch Hackathon 2024</div>
//   </div>
//   <script>window.onload = function() { window.print(); }</script>
// </body>
// </html>`;

//   const w = window.open("", "_blank", "width=500,height=700");
//   if (w) { w.document.write(html); w.document.close(); }
// }

// change this later