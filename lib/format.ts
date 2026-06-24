import { prettyDateLong } from "./dates";

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export type OrderLine = {
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
};

export type OrderLike = {
  customerName: string;
  igHandle?: string;
  pickupDate: string;
  pickupWindow?: string;
  lineItems: OrderLine[];
  notes?: string;
  total: number;
};

// The message the customer pastes into the Instagram DM.
export function formatOrderText(order: OrderLike): string {
  const lines: string[] = [];
  lines.push("🍪🍹 Summer Treats preorder");
  lines.push(`Name: ${order.customerName}`);
  if (order.igHandle) lines.push(`IG: @${order.igHandle.replace(/^@/, "")}`);
  lines.push(`Pickup: ${prettyDateLong(order.pickupDate)}`);
  if (order.pickupWindow) lines.push(`Time: ${order.pickupWindow}`);
  lines.push("");
  for (const line of order.lineItems) {
    lines.push(
      `• ${line.quantity}× ${line.nameSnapshot} — ${formatMoney(
        line.priceSnapshot * line.quantity,
      )}`,
    );
  }
  lines.push("");
  lines.push(`Total: ${formatMoney(order.total)}`);
  if (order.notes) lines.push(`Notes: ${order.notes}`);
  return lines.join("\n");
}

export function igProfileUrl(username: string): string {
  return `https://instagram.com/${username}`;
}

// ig.me opens a DM to the account (mobile app only; can't prefill text).
export function igDmUrl(username: string): string {
  return `https://ig.me/m/${username}`;
}
