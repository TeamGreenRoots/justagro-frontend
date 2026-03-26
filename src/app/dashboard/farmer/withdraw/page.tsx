"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, Building2, ArrowRight, Info, TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, Spinner } from "@/components/ui";
import { formatNaira } from "@/lib/utils";

const BANKS = [
  { code: "TRP", name: "🧪 TEST BANK (Sandbox — use 0037320662)" },
  { code: "ABP", name: "Access Bank" },
  { code: "ZIB", name: "Zenith Bank" },
  { code: "GTB", name: "Guaranty Trust Bank (GTBank)" },
  { code: "UBA", name: "United Bank for Africa (UBA)" },
  { code: "FBN", name: "First Bank of Nigeria" },
  { code: "FCM", name: "First City Monument Bank (FCMB)" },
  { code: "FBP", name: "Fidelity Bank" },
  { code: "SBP", name: "Sterling Bank" },
  { code: "UBN", name: "Union Bank of Nigeria" },
  { code: "UBP", name: "Unity Bank" },
  { code: "WMA", name: "Wema Bank / ALAT" },
  { code: "ECO", name: "EcoBank Nigeria" },
  { code: "IBT", name: "Stanbic IBTC Bank" },
  { code: "SKY", name: "Polaris Bank" },
  { code: "KSB", name: "Keystone Bank" },
  { code: "TAJ", name: "TAJ Bank" },
  { code: "TTB", name: "Titan Trust Bank" },
  { code: "JAI", name: "Jaiz Bank" },
  { code: "LTB", name: "Lotus Bank" },
  { code: "GLB", name: "Globus Bank" },
  { code: "UMB", name: "Providus Bank" },
  { code: "PRM", name: "Premium Trust Bank" },
  { code: "CTB", name: "Citibank Nigeria" },
  { code: "MNP", name: "Moniepoint MFB" },
  { code: "OPY", name: "OPay" },
  { code: "PLM", name: "PalmPay" },
  { code: "KDB", name: "Kuda MFB" },
  { code: "VDM", name: "VFD MFB" },
  { code: "SHB", name: "Safe Haven MFB" },
  { code: "FFB", name: "FairMoney MFB" },
  { code: "HPB", name: "HopePSB" },
];

const ic = "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all";

const fetchDashboard = () => api.get("/farmer/dashboard/me").then(r => r.data.data);

export default function WithdrawPage() {
  const qc = useQueryClient();
  const [amount,   setAmount]   = useState("");
  const [accNum,   setAccNum]   = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accName,  setAccName]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState<any>(null);

  const { data: farmer, isLoading } = useQuery({
    queryKey: ["farmer-dashboard"],
    queryFn:  fetchDashboard,
  });

  const balance      = farmer?.walletBalance || 0;
  const selectedBank = BANKS.find(b => b.code === bankCode);
  const isSandbox    = bankCode === "TRP";

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amt = parseFloat(amount);
    if (!amt || amt <= 0)       { setError("Enter a valid amount"); return; }
    if (amt < 100)              { setError("Minimum withdrawal: ₦100"); return; }
    if (amt > balance)          { setError(`Max: ${formatNaira(balance)}`); return; }
    if (!bankCode)              { setError("Select your bank"); return; }
    if (accNum.length !== 10)   { setError("Account number must be 10 digits"); return; }
    if (!accName.trim())        { setError("Enter the account name"); return; }

    setLoading(true);
    try {
      const res = await api.post("/farmer/withdraw", {
        amount,
        recipientAccount: accNum,
        recipientBank:    bankCode,
        accountName:      accName.trim().toUpperCase(),
      });
      setSuccess(res.data);
      qc.invalidateQueries({ queryKey: ["farmer-dashboard"] });
      toast.success("Withdrawal initiated!!");
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  }

  function fillTestAccount() {
    setBankCode("TRP");
    setAccNum("0037320662");
    setAccName("TEST ACCOUNT");
    setAmount(balance > 0 ? String(Math.min(1000, balance)) : "1000");
  }

  if (isLoading) return <DashboardLayout title="Withdraw Funds"><Spinner text="Loading..." /></DashboardLayout>;

  if (success) return (
    <DashboardLayout title="Withdraw Funds">
      <div className="max-w-md mx-auto">
        <Card className="overflow-hidden">
          <div className="bg-brand-900 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-1">Withdrawal {success.status}</p>
            <p className="font-display text-3xl font-bold text-white">{formatNaira(success.amountWithdrawn)}</p>
          </div>
          <div className="p-6 space-y-0">
            {[
              ["Status",      success.status],
              ["Bank",        BANKS.find(b => b.code === success.recipientBank)?.name?.replace("🧪 ", "") || success.recipientBank],
              ["Account",     success.recipientAccount],
              ["Name",        success.accountName],
              ["Reference",   success.transactionReference],
              ["New Balance", formatNaira(success.newBalance)],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2.5 border-b border-slate-50 last:border-0 text-sm">
                <span className="text-slate-500">{l}</span>
                <span className="font-semibold text-slate-900 font-mono text-xs">{v}</span>
              </div>
            ))}
          </div>
          <div className="px-6 pb-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 mb-4">
              ℹ️ {success.status === "PROCESSING"
                ? "Transfer processing via Interswitch. Arrives in 1–24 hours on banking days."
                : "Transfer completed successfully via Interswitch."}
            </div>
            <button
              onClick={() => { setSuccess(null); setAmount(""); setAccNum(""); setBankCode(""); setAccName(""); setError(""); }}
              className="w-full bg-brand-900 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-800 transition-colors text-sm"
            >
              Make Another Withdrawal
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Withdraw Funds">
      <div className="max-w-md mx-auto space-y-4">

        {/* Balance */}
        <div className="bg-brand-900 rounded-2xl p-6 text-center text-white">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Available Balance</p>
          <p className="font-display text-4xl font-bold">{formatNaira(balance)}</p>
          <p className="text-white/40 text-xs mt-2">Withdraw via Interswitch Payouts API</p>
        </div>

        {balance === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-sm">No balance yet. Receive payments from buyers first.</p>
          </div>
        )}

        {/* Sandbox hint */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 flex-1">
              <p className="font-semibold mb-1">Sandbox Test Account (always succeeds)</p>
              <p>Account: <span className="font-mono font-bold">0037320662</span> · Bank: TEST BANK</p>
            </div>
            <button
              type="button"
              onClick={fillTestAccount}
              className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Fill Test
            </button>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleWithdraw} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₦) *</label>
              <input
                type="number" value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`₦100 – ${formatNaira(balance)}`}
                min="100" max={balance} step="50"
                className={ic} disabled={balance === 0}
              />
              {amount && parseFloat(amount) > 0 && parseFloat(amount) <= balance && (
                <p className="text-slate-400 text-xs mt-1">
                  Remaining after: {formatNaira(balance - parseFloat(amount))}
                </p>
              )}
            </div>

            {/* Bank — hardcoded list, no API call . Payout wallet API Not working*/}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Bank *</label>
              <select
              aria-label="bank-select"
                value={bankCode}
                onChange={e => setBankCode(e.target.value)}
                className={ic}
                disabled={balance === 0}
              >
                <option value="">— Select your bank —</option>
                {BANKS.map(b => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
              {selectedBank && !isSandbox && (
                <p className="text-slate-400 text-xs mt-1">Interswitch code: {selectedBank.code}</p>
              )}
              {isSandbox && (
                <p className="text-amber-600 text-xs mt-1 font-medium">
                  <TriangleAlert /> Use account number: 0037320662 with this bank
                </p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Account Number * (10 digits)
              </label>
              <input
                type="text" inputMode="numeric" value={accNum}
                onChange={e => setAccNum(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder={isSandbox ? "0037320662" : "0123456789"}
                maxLength={10} className={ic} disabled={balance === 0}
              />
              <p className="text-slate-400 text-xs mt-1">{accNum.length}/10 digits</p>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Account Name * (as on bank account)
              </label>
              <input
                type="text" value={accName}
                onChange={e => setAccName(e.target.value.toUpperCase())}
                placeholder="EMEKA OKAFOR"
                className={`${ic} uppercase`} disabled={balance === 0}
              />
            </div>

            {/* Summary */}
            {amount && parseFloat(amount) > 0 && bankCode && accNum.length === 10 && accName && (
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 space-y-2">
                <p className="text-brand-700 text-xs font-bold uppercase tracking-wide mb-2">
                  Interswitch Transfer Summary
                </p>
                {[
                  ["Amount",  formatNaira(parseFloat(amount))],
                  ["Bank",    selectedBank?.name?.replace("🧪 ", "") || bankCode],
                  ["Code",    bankCode],
                  ["Account", accNum],
                  ["Name",    accName.toUpperCase()],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-brand-600">{l}</span>
                    <span className="font-semibold text-brand-900">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1 border border-slate-100">
              <p>• Powered by Interswitch Payouts API (BANK_TRANSFER)</p>
              <p>• Status PROCESSING = accepted, arrives 1–24 hours</p>
              <p>• Cannot be reversed once submitted</p>
            </div>

            <button
              type="submit" disabled={loading || balance === 0}
              className="w-full bg-brand-900 text-white py-4 rounded-xl font-bold hover:bg-brand-800 transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing via Interswitch...</>
                : <><Building2 className="w-4 h-4" /> Withdraw {amount && parseFloat(amount) > 0 ? formatNaira(parseFloat(amount)) : "Funds"} <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

