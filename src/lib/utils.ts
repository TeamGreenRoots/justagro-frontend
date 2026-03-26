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

// PDF receipt generator using browser print
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
  <title>Receipt ${receipt.txnRef}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; background: #fff; padding: 40px; }
    .receipt { max-width: 420px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .header { background: #064E3B; color: white; padding: 28px 24px; text-align: center; }
    .header h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .header p { font-size: 12px; opacity: 0.7; }
    .amount { text-align: center; padding: 24px; background: #f0fdf4; border-bottom: 1px dashed #d1fae5; }
    .amount .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
    .amount .value { font-size: 36px; font-weight: 800; color: #064E3B; margin-top: 4px; }
    .rows { padding: 20px 24px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .row .l { color: #6b7280; }
    .row .r { font-weight: 600; color: #0f172a; }
    .ref { background: #f8fafc; margin: 0 24px 20px; padding: 12px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 12px; color: #475569; border: 1px solid #e2e8f0; }
    .footer { text-align: center; padding: 16px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    @media print {
      body { padding: 0; }
      .receipt { border: none; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1> JustAgro</h1>
      <p>Official Payment Receipt</p>
    </div>
    <div class="amount">
      <div class="label">Amount Paid</div>
      <div class="value">${formatNaira(receipt.totalAmount)}</div>
    </div>
    <div class="rows">
      <div class="row"><span class="l">Farmer</span><span class="r">${receipt.farmerName}</span></div>
      <div class="row"><span class="l">Farm</span><span class="r">${receipt.farmName}</span></div>
      <div class="row"><span class="l">Buyer</span><span class="r">${receipt.buyerName}</span></div>
      <div class="row"><span class="l">Produce</span><span class="r">${receipt.cropType}</span></div>
      <div class="row"><span class="l">Quantity</span><span class="r">${receipt.quantity}kg</span></div>
      <div class="row"><span class="l">Price/kg</span><span class="r">${formatNaira(receipt.pricePerKg)}</span></div>
      <div class="row"><span class="l">Platform Fee</span><span class="r">${formatNaira(receipt.platformFee)}</span></div>
      <div class="row"><span class="l">Farmer Receives</span><span class="r" style="color:#064E3B">${formatNaira(receipt.farmerReceives)}</span></div>
      <div class="row"><span class="l">Payment Method</span><span class="r">${receipt.paymentMethod}</span></div>
      <div class="row"><span class="l">Date</span><span class="r">${formatDate(receipt.paidAt)}</span></div>
    </div>
    <div class="ref">Reference: ${receipt.txnRef}</div>
    <div class="footer">Powered by JustAgro · Interswitch Hackathon 2024</div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=500,height=700");
  if (w) { w.document.write(html); w.document.close(); }
}

// change this later