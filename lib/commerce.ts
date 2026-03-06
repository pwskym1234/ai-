import { CartItem, CommerceMode, StoreProvider } from "@/lib/types";

export function buildSearchUrl(provider: StoreProvider, cart: CartItem[]) {
  const query = cart
    .slice(0, 5)
    .map((item) => item.ingredientName)
    .join(" ");

  if (provider === "coupang") {
    return `https://www.coupang.com/np/search?q=${encodeURIComponent(query || "식재료")}`;
  }

  return `https://www.oasis.co.kr/search?query=${encodeURIComponent(query || "식재료")}`;
}

export function commerceModeLabel(mode: CommerceMode) {
  if (mode === "mock") return "모의";
  if (mode === "deeplink") return "딥링크";
  return "실연동(준비중)";
}
