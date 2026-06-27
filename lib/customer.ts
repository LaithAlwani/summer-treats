// Remembers the customer's contact details in their browser so repeat orders
// are faster to fill out.

const KEY = "summer-treats-customer";

export type SavedCustomer = {
  name?: string;
  igHandle?: string;
  contact?: string;
};

export function loadCustomer(): SavedCustomer {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveCustomer(c: SavedCustomer) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // ignore (e.g. private mode)
  }
}
