# Reminder redirects to the /activate page

The pulsing "Activate your account" reminder on the dashboard currently opens a modal with the activation panel. It should instead take the user to the dedicated activation page.

## Changes

1. **Dashboard (`src/pages/Dashboard.tsx`)**
   - Turn the floating reminder into a link to `/activate` instead of a button that opens a dialog.
   - Remove the now-unused activation dialog, its open/close state, and the `ActivationPanel` import.
   - Keep the existing gate: the reminder still shows only when the user has an approved RPC code and is not yet activated.

2. **No change to `/activate`**
   - The page already handles the full flow: RPC gate, validation form, payment details, receipt upload, and pending/rejected states.
   - The inline activation panel on the success page stays as-is.

No design, pricing, or database changes.
