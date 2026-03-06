"use client";

import { useMemo, useState } from "react";

import PrimaryButton from "@/components/PrimaryButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buildSearchUrl, commerceModeLabel } from "@/lib/commerce";
import { calcCartTotal } from "@/lib/mockEngine";
import { CartItem, CommerceMode, StoreProvider } from "@/lib/types";
import { formatKrw } from "@/lib/utils";

interface StickyTotalBarProps {
  cart: CartItem[];
  provider: StoreProvider;
  commerceMode: CommerceMode;
}

const storeHomeUrl: Record<StoreProvider, string> = {
  oasis: "https://www.oasis.co.kr",
  coupang: "https://www.coupang.com",
};

export default function StickyTotalBar({ cart, provider, commerceMode }: StickyTotalBarProps) {
  const [open, setOpen] = useState(false);
  const total = useMemo(() => calcCartTotal(cart), [cart]);
  const deeplinkUrl = useMemo(() => buildSearchUrl(provider, cart), [provider, cart]);

  const openStore = () => {
    if (commerceMode === "deeplink") {
      window.open(deeplinkUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (commerceMode === "mock") {
      window.open(storeHomeUrl[provider], "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-[74px] z-30 px-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between rounded-[24px] border border-white/60 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <div>
          <p className="text-[12px] text-slate-500">총 예상 금액 · {commerceModeLabel(commerceMode)}</p>
          <p className="text-[20px] font-semibold text-slate-900">{formatKrw(total)}</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <PrimaryButton className="h-11 px-5">구매하기</PrimaryButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {commerceMode === "ready" ? "실연동 준비중" : commerceMode === "deeplink" ? "딥링크로 이동" : "모의 구매 안내"}
              </DialogTitle>
              <DialogDescription>
                {commerceMode === "ready"
                  ? "실제 장바구니/결제 연동에는 파트너십과 공식 API가 필요합니다. 현재 앱에서는 준비중 안내만 제공합니다."
                  : commerceMode === "deeplink"
                    ? "선택한 재료를 기준으로 스토어 검색 결과 페이지로 이동합니다."
                    : "현재는 모의 UI입니다. 실제 결제는 연결되지 않으며 스토어 웹사이트만 열립니다."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {commerceMode === "ready" ? null : <PrimaryButton onClick={openStore}>스토어 열기</PrimaryButton>}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
