# Gate activation behind RPC purchase

Right now the activation panel and the floating dashboard reminder show for any user who is not activated — including users who have not yet bought and had their RPC code approved. Activation should only appear after the RPC code is confirmed.

## Changes

1. **Activation panel (`src/components/ActivationPanel.tsx`)**
   - If the user has no approved RPC code (`rpc_purchased` false or `rpc_code` empty), don't show the payment/upload form. Instead show a short locked card: "Buy your RPC code first" with a button to `/buyrpc`.

2. **Dashboard reminder (`src/pages/Dashboard.tsx`)**
   - Only render the pulsing floating "Activate your account" button when the user has an approved RPC code and is not yet activated.

3. **Success page (`src/pages/SuccessPage.tsx`)**
   - Keep the inline activation section, but it inherits the same gate from the panel, so pre-RPC users see the locked state rather than the payment details.

No database, pricing, or design changes — same red/dark theme and the existing one-time activation fee.
