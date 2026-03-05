"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Refrigerator, Trash2 } from "lucide-react";
import { toast } from "sonner";

import BottomSheet from "@/components/BottomSheet";
import Chip from "@/components/Chip";
import PrimaryButton from "@/components/PrimaryButton";
import RowItem from "@/components/RowItem";
import SectionCard from "@/components/SectionCard";
import { Input } from "@/components/ui/input";
import { getPantry, seedIfEmpty, setPantry } from "@/lib/storage";
import { PantryItem } from "@/lib/types";
import { uid } from "@/lib/utils";

const recommendItems = ["브로콜리", "두부", "양파", "연어", "토마토", "계란"];

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");

  useEffect(() => {
    seedIfEmpty();
    setItems(getPantry());
  }, []);

  const sorted = useMemo(() => [...items].reverse(), [items]);

  const addItem = () => {
    if (!name.trim()) return;

    const next = [
      ...items,
      {
        id: uid("pantry"),
        name: name.trim(),
        qty: qty.trim() || undefined,
      },
    ];

    setItems(next);
    setPantry(next);
    setName("");
    setQty("");
    setOpen(false);
    toast.success("팬트리에 재료를 추가했어요");
  };

  const removeItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    setPantry(next);
    toast.success("팬트리 재료를 삭제했어요");
  };

  return (
    <div className="space-y-4 pb-24">
      <SectionCard title="보유 재료">
        {sorted.length > 0 ? (
          <div className="space-y-1">
            {sorted.map((item) => (
              <RowItem
                key={item.id}
                title={item.name}
                subtitle={item.qty || "수량 미입력"}
                showChevron={false}
                trailing={
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-slate-500">
            <Refrigerator className="h-8 w-8" />
            <p className="text-[15px]">팬트리가 비어 있어요</p>
            <p className="text-[12px]">재료를 추가하면 메뉴 교체 추천에 반영됩니다.</p>
          </div>
        )}
      </SectionCard>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </button>

      <BottomSheet open={open} onOpenChange={setOpen} title="팬트리 추가" description="재료와 수량을 입력하세요.">
        <div className="space-y-4 pb-24">
          <div className="space-y-2">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="재료명" />
            <Input value={qty} onChange={(event) => setQty(event.target.value)} placeholder="수량(선택)" />
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendItems.map((item) => (
              <Chip key={item} label={item} onClick={() => setName(item)} />
            ))}
          </div>
          <PrimaryButton className="w-full" onClick={addItem}>
            팬트리에 추가
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}
