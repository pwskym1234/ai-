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
import { calcCartTotal } from "@/lib/mockEngine";
import { CartItem, StoreProvider } from "@/lib/types";
import { formatKrw } from "@/lib/utils";

interface StickyTotalBarProps {
  cart: CartItem[];
  provider: StoreProvider;
}

const storeHomeUrl: Record<StoreProvider, string> = {
  oasis: "https://www.oasis.co.kr",
  coupang: "https://www.coupang.com",
};

export default function StickyTotalBar({ cart, provider }: StickyTotalBarProps) {
  const [open, setOpen] = useState(false);
  const total = useMemo(() => calcCartTotal(cart), [cart]);

  return (
    <div className="fixed inset-x-0 bottom-[74px] z-30 px-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-lg">
        <div>
          <p className="text-[12px] text-slate-500">총 예상 금액</p>
          <p className="text-[20px] font-semibold text-slate-900">{formatKrw(total)}</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <PrimaryButton className="h-11 px-5">구매하기(모의)</PrimaryButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>결제 연동 안내</DialogTitle>
              <DialogDescription>
                실제 연동 시 결제 페이지로 이동합니다. 현재는 스토어 웹사이트를 여는 모의 동작입니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <PrimaryButton
                onClick={() => {
                  window.open(storeHomeUrl[provider], "_blank", "noopener,noreferrer");
                }}
              >
                스토어 열기
              </PrimaryButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
