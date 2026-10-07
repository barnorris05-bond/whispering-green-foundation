/**
 * Copy for the public donation page.
 *
 * The bank details below are the OFFICIAL details supplied by Whispering
 * Green Foundation. Reproduce them exactly — never edit, reformat or
 * "correct" these values without new written instructions from the
 * foundation:
 *   - `display` — how the value is shown on the page (spaces allowed for
 *     readability)
 *   - `copy`    — the exact string placed on the clipboard (no spaces)
 *
 * The website never processes payments; the transfer happens in the
 * donor's own bank.
 */

export const DONATE_HERO = {
  eyebrow: "Support the foundation",
  title: "Support Whispering Green Foundation",
  subtitle:
    "Your support can help Whispering Green Foundation continue its community and environmental initiatives.",
  primaryCta: "Donate by Bank Transfer",
  secondaryCta: "Learn About Our Journey",
  trustNote: "Direct bank transfer only — no payment is processed on this website.",
} as const;

export const DONATE_INTRO = {
  title: "Support Our Work",
  paragraphs: [
    "Whispering Green Foundation works with communities around environmental awareness, responsible waste management, participation, and related initiatives.",
    "If you would like to support this work, you can contribute directly through bank transfer. This page explains how — the transfer itself happens through your own bank.",
  ],
} as const;

export type BankField = {
  label: string;
  /** How the value is displayed on the page (may include spaces). */
  display: string;
};

export type CopyableBankField = BankField & {
  /** Exact clipboard value — no spaces, no formatting. */
  copy: string;
  ariaLabel: string;
  announce: string;
  fallback: string;
};

export const BANK_FIELDS: Array<BankField | CopyableBankField> = [
  {
    label: "Account Name",
    display: "Whispering Green Foundation",
    copy: "Whispering Green Foundation",
    ariaLabel: "Copy account name",
    announce: "Account name copied.",
    fallback: "Please select and copy the account name manually.",
  },
  {
    label: "Bank",
    display: "Bassein Catholic Co-Op. Bank Ltd",
    copy: "Bassein Catholic Co-Op. Bank Ltd",
    ariaLabel: "Copy bank name",
    announce: "Bank name copied.",
    fallback: "Please select and copy the bank name manually.",
  },
  {
    label: "Account Number",
    display: "501 000 000 468 191",
    copy: "501000000468191",
    ariaLabel: "Copy account number",
    announce: "Account number copied.",
    fallback: "Please select and copy the account number manually.",
  },
  { label: "Account Type", display: "Savings" },
  { label: "Branch", display: "Papdy" },
  {
    label: "IFSC Code",
    display: "BACB 0000003",
    copy: "BACB0000003",
    ariaLabel: "Copy IFSC code",
    announce: "IFSC code copied.",
    fallback: "Please select and copy the IFSC code manually.",
  },
  {
    label: "MICR Code",
    display: "400238003",
    copy: "400238003",
    ariaLabel: "Copy MICR code",
    announce: "MICR code copied.",
    fallback: "Please select and copy the MICR code manually.",
  },
];

export const BANK_SECTION = {
  title: "Donate by Bank Transfer",
  intro:
    "You can support Whispering Green Foundation by transferring your contribution directly to the foundation's bank account.",
  verifyNote:
    "Please double-check the beneficiary name and account number in your banking app before confirming any transfer.",
} as const;

/** Exact statement shown on the page — keep the wording stable. */
export const NO_PAYMENT_NOTICE =
  "Donation is currently handled through direct bank transfer; the website does not process payments.";

export const DONATE_STEPS = [
  {
    title: "Decide your contribution",
    body: "Choose an amount you are comfortable with. There is no minimum — every contribution supports the foundation's work.",
  },
  {
    title: "Add the beneficiary",
    body: "In your bank's app, website or at your branch, add Whispering Green Foundation as a beneficiary using the account name, account number and IFSC code shown above.",
  },
  {
    title: "Verify the details",
    body: "Check the beneficiary name and account number against this page before confirming. If anything looks different, pause and contact us first.",
  },
  {
    title: "Transfer through your own bank",
    body: "Complete the transfer using your usual banking method. The payment takes place entirely within your bank — this website is not part of the transaction.",
  },
  {
    title: "Keep your confirmation",
    body: "Save the transaction receipt or take a screenshot before leaving the banking app. It is your record of the donation.",
  },
] as const;

export const AFTER_DONATE = {
  title: "After You Donate",
  points: [
    "Keep your transaction confirmation — it is your record of the donation.",
    "The foundation does not track donations through this website, so nothing is displayed or confirmed here.",
    "If you would like the foundation to acknowledge your contribution, or have a question about the details above, please get in touch.",
  ],
} as const;
