"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import BottomSheet from "@/components/BottomSheet";
import PrimaryButton from "@/components/PrimaryButton";
import SectionCard from "@/components/SectionCard";
import { Checkbox } from "@/components/ui/checkbox";
import { CartItem, Ingredient, StoreProduct } from "@/lib/types";
import { cn, formatKrw } from "@/lib/utils";

interface GroceryListProps {
  cart: CartItem[];
  onCartChange: (next: CartItem[]) => void;
}

const categoryLabel: Record<Ingredient["category"], string> = {
  vegetable: "채소",
  fruit: "과일",
  protein: "단백질",
  dairy: "유제품",
  grain: "곡류",
  seasoning: "양념",
  other: "기타",
};

const categoryOrder: Ingredient["category"][] = ["vegetable", "fruit", "protein", "dairy", "grain", "seasoning", "other"];

export default function GroceryList({ cart, onCartChange }: GroceryListProps) {
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<Ingredient["category"], CartItem[]>();
    for (const category of categoryOrder) map.set(category, []);

    for (const item of cart) {
      map.get(item.category)?.push(item);
    }

    return categoryOrder
      .map((category) => ({
        category,
        items: map.get(category) ?? [],
      }))
      .filter((entry) => entry.items.length > 0);
  }, [cart]);

  const updateItem = (id: string, updater: (item: CartItem) => CartItem) => {
    onCartChange(cart.map((item) => (item.id === id ? updater(item) : item)));
  };

  const openAlternativeSheet = (item: CartItem) => {
    setSelectedItem(item);
    setSelectedProductId(item.product.id);
    setOpen(true);
  };

  const applyAlternative = () => {
    if (!selectedItem || !selectedProductId) return;
    const target = selectedItem.alternatives.find((item) => item.id === selectedProductId);
    if (!target) return;

    updateItem(selectedItem.id, (prev) => ({
      ...prev,
      product: target,
    }));

    toast.success("대체 상품을 반영했어요");
    setOpen(false);
  };

  return (
    <>
      <div className="space-y-3 pb-24">
        {grouped.map(({ category, items }) => (
          <SectionCard key={category} title={`${categoryLabel[category]} (${items.length})`}>
            <div className="space-y-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-[18px] px-1 py-3 text-left hover:bg-slate-50"
                  onClick={() => openAlternativeSheet(item)}
                >
                  <Checkbox
                    checked={item.checked}
                    onClick={(event) => event.stopPropagation()}
                    onCheckedChange={(checked) =>
                      updateItem(item.id, (prev) => ({
                        ...prev,
                        checked: Boolean(checked),
                      }))
                    }
                  />

                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                    <Image src={item.product.imagePath} alt={item.product.title} fill className="object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-slate-900">{item.ingredientName} · {item.qtyText}</p>
                    <p className="truncate text-[12px] text-slate-500">{item.product.title}</p>
                  </div>

                  <p className="text-[13px] font-semibold text-slate-700">{formatKrw(item.product.price)}</p>
                </button>
              ))}
            </div>
          </SectionCard>
        ))}

        {cart.length === 0 && (
          <SectionCard>
            <div className="flex flex-col items-center gap-3 py-8 text-center text-slate-500">
              <div className="relative h-28 w-28">
                <Image src="/assets/empty/cart-empty.svg" alt="장보기 비어있음" fill className="object-contain" />
              </div>
              <p className="text-[15px] font-medium">확정된 식단이 없어 장보기 목록이 비어 있어요.</p>
              <p className="text-[12px]">식단을 먼저 확정하면 필요한 재료가 여기에 정리돼요.</p>
            </div>
          </SectionCard>
        )}
      </div>

      <BottomSheet open={open} onOpenChange={setOpen} title="대체 상품 선택" description="원하는 상품을 선택하고 반영하세요.">
        <div className="space-y-3">
          {selectedItem?.alternatives.map((alt: StoreProduct) => {
            const checked = (selectedProductId ?? selectedItem.product.id) === alt.id;

            return (
              <button
                key={alt.id}
                type="button"
                onClick={() => setSelectedProductId(alt.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm",
                  checked ? "ring-2 ring-orange-400" : "",
                )}
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                  <Image src={alt.imagePath} alt={alt.title} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-slate-900">{alt.title}</p>
                  <p className="mt-0.5 text-[12px] text-slate-500">{alt.unitText}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-slate-800">{formatKrw(alt.price)}</p>
                  {checked && <CheckCircle2 className="ml-auto mt-1 h-4 w-4 text-orange-500" />}
                </div>
              </button>
            );
          })}
        </div>
        <div className="pb-2 pt-4">
          <PrimaryButton className="w-full" onClick={applyAlternative}>
            선택한 상품 적용
          </PrimaryButton>
        </div>
      </BottomSheet>
    </>
  );
}
