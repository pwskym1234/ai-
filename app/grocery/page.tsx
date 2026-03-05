"use client";

import { useEffect, useMemo, useState } from "react";
import { Store } from "lucide-react";
import { toast } from "sonner";

import GroceryList from "@/components/GroceryList";
import RowItem from "@/components/RowItem";
import SectionCard from "@/components/SectionCard";
import StickyTotalBar from "@/components/StickyTotalBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calcCartTotal, remapCartItemProvider } from "@/lib/mockEngine";
import { getCart, getProfile, seedIfEmpty, setCart, setProfile } from "@/lib/storage";
import { CartItem, StoreProvider, UserProfile } from "@/lib/types";
import { formatKrw } from "@/lib/utils";

export default function GroceryPage() {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [cart, setCartState] = useState<CartItem[]>([]);

  useEffect(() => {
    seedIfEmpty();
    setProfileState(getProfile());
    setCartState(getCart());
  }, []);

  const provider = useMemo(() => profile?.storeProvider ?? "oasis", [profile?.storeProvider]);
  const total = useMemo(() => calcCartTotal(cart), [cart]);

  const onProviderChange = (nextProvider: StoreProvider) => {
    if (!profile) return;

    const nextProfile = { ...profile, storeProvider: nextProvider };
    const nextCart = remapCartItemProvider(cart, nextProvider);

    setProfileState(nextProfile);
    setCartState(nextCart);
    setProfile(nextProfile);
    setCart(nextCart);

    toast.success("구매처를 변경했어요");
  };

  const onCartChange = (next: CartItem[]) => {
    setCartState(next);
    setCart(next);
  };

  if (!profile) {
    return <div className="py-20 text-center text-slate-500">불러오는 중...</div>;
  }

  return (
    <div className="space-y-3 pb-40">
      <SectionCard title="장보기 요약">
        <div className="space-y-1">
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Store className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-slate-900">구매처</p>
              <p className="text-[12px] text-slate-500">상품 가격/링크를 구매처 기준으로 재매핑</p>
            </div>
            <div className="w-32">
              <Select value={provider} onValueChange={(value: StoreProvider) => onProviderChange(value)}>
                <SelectTrigger className="h-9 rounded-lg bg-slate-50 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oasis">오아시스</SelectItem>
                  <SelectItem value="coupang">쿠팡</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <RowItem title="예상 총액" value={formatKrw(total)} showChevron={false} />
        </div>
      </SectionCard>

      <GroceryList cart={cart} onCartChange={onCartChange} />
      <StickyTotalBar cart={cart} provider={provider} />
    </div>
  );
}
