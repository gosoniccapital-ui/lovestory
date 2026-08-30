export interface VietBank {
  name: string;
  shortName: string;
  bin: string;
}

export const VIETNAM_BANKS: VietBank[] = [
  { name: "Vietcombank", shortName: "VCB", bin: "970436" },
  { name: "Techcombank", shortName: "TCB", bin: "970407" },
  { name: "MB Bank", shortName: "MB", bin: "970422" },
  { name: "ACB", shortName: "ACB", bin: "970416" },
  { name: "BIDV", shortName: "BIDV", bin: "970418" },
  { name: "VPBank", shortName: "VPB", bin: "970432" },
  { name: "TPBank", shortName: "TPB", bin: "970423" },
  { name: "Agribank", shortName: "AGR", bin: "970405" },
  { name: "Sacombank", shortName: "STB", bin: "970403" },
  { name: "VietinBank", shortName: "CTG", bin: "970415" },
];

/**
 * Remove Vietnamese accents and special characters for standard bank transfer notes.
 */
export function cleanBankingNote(text: string, maxLen = 50): string {
  if (!text) return "";
  const cleaned = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, maxLen);
}

/**
 * Build VietQR image URL.
 * Format: https://img.vietqr.io/image/{bankBin}-{accountNumber}-compact.jpg
 */
export function buildVietQrUrl(
  bankBin: string,
  accountNumber: string,
  amount?: string,
  note?: string,
): string {
  const base = `https://img.vietqr.io/image/${bankBin}-${encodeURIComponent(accountNumber.replace(/\s/g, ""))}-compact.jpg`;
  const params = new URLSearchParams();
  if (amount && parseInt(amount, 10) > 0) {
    params.set("amount", amount.replace(/\D/g, ""));
  }
  if (note) {
    params.set("addInfo", cleanBankingNote(note));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Build Dynamic VietQR note from guest name and custom wish.
 */
export function formatWeddingTransferNote(
  guestName?: string,
  customWish?: string,
  prefix = "Mung cuoi",
): string {
  const parts: string[] = [prefix];
  if (guestName?.trim()) {
    parts.push(guestName.trim());
  }
  if (customWish?.trim()) {
    parts.push(customWish.trim());
  }
  return cleanBankingNote(parts.join(" - "), 50);
}
