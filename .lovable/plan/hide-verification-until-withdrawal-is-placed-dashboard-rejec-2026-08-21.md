# Hide verification until withdrawal is placed + dashboard rejection flow

## 1. Nothing about verification shows before a withdrawal

Verification (activation) UI is only relevant after a user has actually placed a withdrawal request. Right now the dashboard status card and the floating "Activate your account" reminder appear based only on RPC purchase / activation state.

Change: gate all verification UI behind "this user has at least one withdrawal request".

- Dashboard fetches whether the signed-in user has any row in `withdrawal_requests` (a lightweight count query, refreshed with the existing status fetch).
- Hide until that is true:
  - the Verification status card
  - the floating pulsing "Activate your account" reminder
- The `/activate` page shows a neutral "Place a withdrawal first" card (with a button to `/withdraw`) when the user has no withdrawal request, instead of the payment details.

## 2. Rejection flow on the dashboard

When an admin rejects a verification payment (`activation_requests.status = 'rejected'` with an `admin_note`):

- The dashboard verification card switches to a rejected state showing the admin's rejection reason inline (falls back to a generic message if no note was written).
- A "Re-upload receipt" button opens a dialog on the dashboard containing the existing activation panel, so the user can upload a new receipt without leaving the page.
- After a successful re-submission the card flips back to "Verification Under Review" — the existing realtime subscription already pushes admin status changes live, so no refresh is needed.

## Technical notes

- `src/pages/Dashboard.tsx`: add `hasWithdrawal` state (query `withdrawal_requests` filtered by `user_id = auth uid`, `limit 1`), add `activationNote` alongside the existing `activationStatus` (select `status, admin_note`), and use both in the status card. Reuse `ActivationPanel` inside a `Dialog` for the re-upload path.
- `src/components/ActivationPanel.tsx`: accept an optional `onSubmitted` callback so the dashboard dialog can close and refresh after re-submission; the existing rejected-state banner stays.
- `src/pages/Activate.tsx`: add the "place a withdrawal first" guard before rendering the panel.
- No database or admin-side changes — `status`, `admin_note` and repeat inserts are already supported.
