import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, ShieldCheck, Upload, AlertTriangle, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const ACTIVATION_AMOUNT = 8600;
const ACCOUNT_NUMBER = "0051857178";
const ACCOUNT_NAME = "NNANNA JOSEPH";
const BANK = "PAGA";

type Props = { compact?: boolean; onSubmitted?: () => void };

/**
 * One-time account activation payment, rendered inline (no separate page).
 */
const ActivationPanel = ({ compact = false, onSubmitted }: Props) => {
  const { user, profile, refreshProfile } = useAuth();
  const [copied, setCopied] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState<any>(null);
  const [hasWithdrawal, setHasWithdrawal] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("activation_requests" as any)
        .select("*")
        .eq("auth_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      setExisting((data || [])[0] || null);

      const { data: wd } = await supabase
        .from("withdrawal_requests")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      setHasWithdrawal((wd || []).length > 0);
    })();
  }, [user]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    setProof(file);
    toast.success("Proof uploaded");
  };

  const handleSubmit = async () => {
    if (!proof) {
      toast.error("Please upload your payment receipt");
      return;
    }
    if (!user || !profile) {
      toast.error("Please log in to continue");
      return;
    }

    setSubmitting(true);
    let proofPath: string | null = null;
    try {
      const ext = proof.name.split(".").pop();
      const path = `${user.id}/activation-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, proof);
      if (upErr) throw upErr;
      proofPath = path;
    } catch {
      // best effort — request is still queued for the admin
    }

    const { error } = await supabase.from("activation_requests" as any).insert({
      auth_user_id: user.id,
      user_id: profile.user_id,
      user_name: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
      email: profile.email,
      phone: profile.phone,
      rpc_code_used: profile.rpc_code || null,
      bank: BANK,
      account_number: ACCOUNT_NUMBER,
      amount: ACTIVATION_AMOUNT,
      proof_image: proofPath,
    } as any);

    setSubmitting(false);

    if (error) {
      toast.error("Could not submit your activation request. Please try again.");
      return;
    }

    setExisting({ status: "pending" });
    setProof(null);
    await refreshProfile?.();
    toast.success("Activation submitted — awaiting confirmation.");
    onSubmitted?.();
  };

  // Verification only becomes relevant once a withdrawal has been placed
  if (!profile?.activated && hasWithdrawal === false) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardContent className="p-6 text-center space-y-3">
          <Lock className="w-8 h-8 text-primary mx-auto" />
          <h3 className="font-bold text-foreground">Place a withdrawal first</h3>
          <p className="text-sm text-muted-foreground">
            Verification becomes available after you place a withdrawal request.
          </p>
          <Button asChild className="w-full">
            <a href="/withdraw">Go to Withdraw</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Activation is only available after the RPC code purchase is approved
  if (profile && (!profile.rpc_purchased || !profile.rpc_code)) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardContent className="p-6 text-center space-y-3">
          <Lock className="w-8 h-8 text-primary mx-auto" />
          <h3 className="font-bold text-foreground">Buy your RPC code first</h3>
          <p className="text-sm text-muted-foreground">
            Account activation becomes available once your RPC code purchase is confirmed.
          </p>
          <Button asChild className="w-full">
            <a href="/buyrpc">Buy RPC Code</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (profile?.activated) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Verification Approved ✓</h2>
          <p className="text-sm text-muted-foreground">Next step: upgrade your account.</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Without an active plan you can&apos;t withdraw. Contact support to continue.
          </p>
        </div>
        <Button asChild size="lg" className="min-w-[200px]">
          <a href="/support">Contact Support</a>
        </Button>
      </div>
    );
  }


  if (existing?.status === "pending") {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Verification Under Review</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Your ₦{ACTIVATION_AMOUNT.toLocaleString()} verification payment is being reviewed by the Organization.
            You&apos;ll be moved to the next step automatically once approved.
          </p>
        </div>
        <Button asChild size="lg" className="min-w-[200px]">
          <a href="/dashboard">Return to Dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-foreground">Verify Withdrawal</h2>
        <p className="text-sm text-muted-foreground">One-time verification payment</p>
      </div>

      {existing?.status === "rejected" && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {existing?.admin_note || "Your last activation payment could not be confirmed. Please try again."}
        </div>
      )}

      <Card className="bg-primary/10 border-primary/30">
        <CardContent className="p-4 flex gap-3">
          <div className="w-10 h-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-foreground">Account Verification Fee</h3>
            <p className="text-sm text-muted-foreground">
              Pay <span className="font-semibold text-primary">₦{ACTIVATION_AMOUNT.toLocaleString()}</span> and upload
              your receipt. Once approved, this step is complete forever.
            </p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" /> One-time only • Reviewed by RedPay
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardContent className="p-4 space-y-3">
          {[
            { label: "Bank", value: BANK },
            { label: "Account Number", value: ACCOUNT_NUMBER },
            { label: "Account Name", value: ACCOUNT_NAME },
            { label: "Amount", value: `₦${ACTIVATION_AMOUNT.toLocaleString()}` },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{row.label}</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground text-right">{row.value}</p>
                <button
                  type="button"
                  onClick={() => copy(row.value.replace("₦", "").replace(/,/g, ""), row.label)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Copy ${row.label}`}
                >
                  {copied === row.label ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-warning">
              Kindly don't use Opay for the transfer — use any other mobile banking app for payment.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-destructive/10 border-destructive/40">
        <CardContent className="p-4 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-destructive">STRICT WARNING</h3>
            <p className="text-sm text-muted-foreground">
              You must pay the <span className="font-semibold text-destructive">EXACT amount</span> shown above and
              upload the <span className="font-semibold text-foreground">genuine receipt</span> of THIS payment only.
              Submitting another transaction's receipt, an edited/fake receipt, or any receipt that doesn't match the
              exact amount will get your account <span className="font-semibold text-destructive">restricted</span>{" "}
              immediately.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardContent className="p-4 space-y-2">
          <Label>Upload Payment Receipt</Label>
          <div className="relative border-2 border-dashed border-primary/30 rounded-lg p-6 bg-primary/5 hover:bg-primary/10 transition">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <Upload className="w-8 h-8 text-primary" />
              <p className="text-sm font-medium">Click to upload your receipt</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
          </div>
          {proof && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <Check className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">{proof.name}</p>
            </div>
          )}
          <Button size="lg" className="w-full" onClick={handleSubmit} disabled={!proof || submitting}>
            {submitting ? "Submitting..." : "I Have Made Payment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivationPanel;
