import React, { useState, useEffect } from "react";
import { 
  Copy, 
  Check, 
  Upload, 
  Clock, 
  User, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  LifeBuoy,
  LayoutDashboard,
  ArrowRight
} from "lucide-react";

/** * POLISHED UI COMPONENTS (Local implementations for portability)
 */
const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none gap-2";
  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20",
    outline: "border border-red-500/30 text-red-500 hover:bg-red-500/10",
    secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
    ghost: "text-zinc-400 hover:text-white hover:bg-white/10",
    blue: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-4 text-base w-full"
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl ${className}`}>
    {children}
  </div>
);

const Toast = ({ message, type = "success", visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-2xl border ${
        type === "success" ? "bg-zinc-900 border-green-500/50 text-green-500" : "bg-zinc-900 border-red-500/50 text-red-500"
      }`}>
        {type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
        {message}
      </div>
    </div>
  );
};

const LiquidBackground = () => (
  <div className="fixed inset-0 -z-10 bg-black overflow-hidden">
    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-900/20 rounded-full blur-[120px] animate-pulse opacity-50" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-zinc-900/40 rounded-full blur-[120px] opacity-50" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-50" />
  </div>
);

/**
 * MAIN LOGIC
 */
const SIX_MINUTES = 6 * 60;

export default function App() {
  const [copied, setCopied] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SIX_MINUTES);
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });
  const [referenceId] = useState(() => `RP-${Math.floor(100000 + Math.random() * 900000)}`);

  // ✅ Countdown timer
  useEffect(() => {
    if (!showPending || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showPending, timeLeft]);

  // ✅ Timer Reset
  useEffect(() => {
    if (showPending) setTimeLeft(SIX_MINUTES);
  }, [showPending]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const copyToClipboard = (text, field) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(field);
    setToast({ message: `${field} copied!`, type: "success", visible: true });
    setTimeout(() => setCopied(""), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setToast({ message: "Use JPG, PNG, or WEBP", type: "error", visible: true });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: "File exceeds 5MB limit", type: "error", visible: true });
      return;
    }
    
    setScreenshot(file);
    setToast({ message: "Screenshot ready!", type: "success", visible: true });
  };

  const handlePaymentConfirm = async () => {
    if (!screenshot) {
      setToast({ message: "Please upload payment proof", type: "error", visible: true });
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setShowPending(true);
  };

  // ✅ SUB-VIEW: PENDING SCREEN
  if (showPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative animate-in fade-in duration-500">
        <LiquidBackground />
        <Card className="w-full max-w-md p-8 text-center space-y-8">
          <div className="mx-auto w-24 h-24 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20 rotate-12 transition-transform hover:rotate-0">
            <Clock className="w-12 h-12 text-red-500 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Processing...</h1>
            <p className="text-zinc-500 text-sm">
              Your transfer is being verified. Your code will be generated automatically.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 flex flex-col items-center">
            <p className="text-[10px] text-red-500/60 uppercase font-black tracking-widest mb-2">Estimated Verification</p>
            <p className="text-5xl font-mono font-black text-red-500 tracking-tighter tabular-nums">
              {formatTime(timeLeft)}
            </p>
          </div>

          <div className="w-full space-y-4">
            {/* UNIGNORABLE SUPPORT SECTION */}
            <div className="relative group overflow-hidden rounded-3xl p-1">
              {/* Pulsing Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 animate-pulse opacity-100" />
              
              <div className="relative bg-zinc-950 rounded-[20px] p-6 flex flex-col items-center text-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-amber-500 font-black uppercase text-xs tracking-widest mb-1">
                    <AlertCircle size={16} className="animate-bounce" /> Priority Action
                  </div>
                  <h3 className="text-white font-extrabold text-xl leading-tight">
                    For faster confirmation contact support
                  </h3>
                </div>

                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => console.log('Support')}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-lg border-none shadow-xl shadow-amber-500/20 h-14"
                >
                  CONTACT SUPPORT NOW
                </Button>
              </div>
            </div>

            <Button variant="ghost" size="lg" onClick={() => window.location.reload()}>
              <LayoutDashboard size={20} /> Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ✅ MAIN VIEW: INSTRUCTIONS
  return (
    <div className="min-h-screen text-white relative flex flex-col">
      <LiquidBackground />
      <Toast {...toast} onClose={() => setToast(p => ({ ...p, visible: false }))} />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-red-600/30">R</div>
          <span className="font-black text-xl tracking-tighter">REDPAY</span>
        </div>
        <button className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10 text-zinc-400 hover:text-white transition-colors">
          <User size={20} />
        </button>
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-500/20 rounded-full" />
            <div className="w-20 h-20 border-4 border-t-red-500 rounded-full animate-spin absolute inset-0" />
          </div>
          <div className="text-center animate-pulse">
            <h2 className="text-xl font-bold">Verifying Receipt</h2>
            <p className="text-zinc-500 text-sm">Validating payment hash...</p>
          </div>
        </div>
      ) : (
        <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8 space-y-8 animate-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-1">
            <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4">
              <ChevronLeft size={16} /> Previous
            </button>
            <h1 className="text-4xl font-black tracking-tighter">Secure Deposit</h1>
            <p className="text-zinc-500 font-medium">Follow the instructions to credit your wallet.</p>
          </div>

          {/* Amount Hero */}
          <Card className="p-8 bg-gradient-to-br from-red-600/10 to-transparent border-red-500/30">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em]">Total Payable</p>
                <div className="text-5xl font-black tracking-tighter">₦6,700</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full w-10 h-10 p-0"
                onClick={() => copyToClipboard("6700", "Amount")}
              >
                {copied === "Amount" ? <Check size={18} /> : <Copy size={18} />}
              </Button>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-zinc-500">
              <span className="text-[10px] font-bold uppercase tracking-widest">Transaction Fee</span>
              <span className="text-xs font-bold text-white">₦0.00</span>
            </div>
          </Card>

          {/* Bank Details */}
          <div className="space-y-3">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Beneficiary Account</p>
            {[
              { label: "Bank", value: "PAGA", copy: false },
              { label: "Account Number", value: "0051857178", copy: true, large: true },
              { label: "Account Name", value: "NNANNA JOSEPH", copy: false },
              { label: "Reference", value: referenceId, copy: true, mono: true }
            ].map((item, idx) => (
              <div key={idx} className="group flex items-center justify-between p-5 bg-zinc-900/40 border border-white/5 rounded-3xl hover:border-white/20 transition-all">
                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-wider">{item.label}</p>
                  <p className={`${item.large ? "text-xl" : "text-base"} ${item.mono ? "font-mono text-red-500 text-sm" : "text-zinc-100"} font-bold`}>
                    {item.value}
                  </p>
                </div>
                {item.copy && (
                  <button 
                    onClick={() => copyToClipboard(item.value, item.label)}
                    className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                  >
                    {copied === item.label ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Proof Upload */}
          <div className="space-y-4">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Payment Verification</p>
            <div className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all group overflow-hidden ${
              screenshot ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-red-500/30 bg-white/5'
            }`}>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                onChange={handleFileChange}
                accept="image/*"
              />
              <div className="flex flex-col items-center gap-4 text-center">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${
                  screenshot ? 'bg-green-500/20 text-green-500' : 'bg-red-500/10 text-red-500 group-hover:scale-110'
                }`}>
                  {screenshot ? <Check size={32} /> : <Upload size={32} />}
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{screenshot ? screenshot.name : "Drop receipt here"}</p>
                  <p className="text-xs text-zinc-500 font-medium">Max 5MB • JPG, PNG, WEBP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="pt-4 pb-12">
            <Button 
              size="lg" 
              onClick={handlePaymentConfirm}
              disabled={!screenshot || loading}
              className="h-16 text-xl font-black rounded-[1.5rem] group"
            >
              Verify Payment <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex items-center justify-center gap-2 mt-6 text-zinc-600">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption</span>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}