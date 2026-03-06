"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
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
const FAB_HINT_KEY = "ai-nutri-ingredient-fab-hint";

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");

  useEffect(() => {
    seedIfEmpty();
    setItems(getPantry());
    setShowHint(window.localStorage.getItem(FAB_HINT_KEY) !== "1");
  }, []);

  const sorted = useMemo(() => [...items].reverse(), [items]);

  const closeHint = () => {
    window.localStorage.setItem(FAB_HINT_KEY, "1");
    setShowHint(false);
  };

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
    closeHint();
    toast.success("내 재료에 추가했어요");
  };

  const removeItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    setPantry(next);
    toast.success("재료를 삭제했어요");
  };

  return (
    <div className="space-y-4 pb-24">
      <SectionCard title="보유 중인 재료">
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
          <div className="flex flex-col items-center gap-3 py-8 text-center text-slate-500">
            <div className="relative h-28 w-28">
              <Image src="/assets/empty/fridge-empty.svg" alt="내 재료 비어있음" fill className="object-contain" />
            </div>
            <p className="text-[15px] font-medium">아직 등록된 재료가 없어요</p>
            <p className="text-[12px]">내 재료를 추가하면 메뉴 추천과 교체 후보에 반영돼요.</p>
          </div>
        )}
      </SectionCard>

      {showHint ? (
        <div className="fixed bottom-40 right-4 z-40 rounded-2xl bg-white px-4 py-3 text-[13px] text-slate-600 shadow-lg">
          여기서 재료를 추가해요
        </div>
      ) : null}

      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          setOpen(true);
          closeHint();
        }}
        className="fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-white shadow-lg"
      >
        <Plus className="h-5 w-5" />
        <span className="text-[14px] font-medium">추가</span>
      </motion.button>

      <BottomSheet open={open} onOpenChange={setOpen} title="내 재료 추가" description="재료명과 수량을 입력하세요.">
        <div className="space-y-4">
          <div className="space-y-2">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="재료명" />
            <Input value={qty} onChange={(event) => setQty(event.target.value)} placeholder="수량(선택)" />
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendItems.map((item) => (
              <Chip key={item} label={item} onClick={() => setName(item)} />
            ))}
          </div>
        </div>
        <div className="pb-2 pt-4">
          <PrimaryButton className="w-full" onClick={addItem}>
            내 재료에 추가
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}
