"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PantryItem } from "@/lib/types";
import { uid } from "@/lib/utils";

interface PantryQuickAddProps {
  onAdd: (item: PantryItem) => void;
}

const recommendItems = ["브로콜리", "두부", "계란", "양파", "연어", "토마토"];

export default function PantryQuickAdd({ onAdd }: PantryQuickAddProps) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");

  const submit = () => {
    if (!name.trim()) return;

    onAdd({
      id: uid("pantry"),
      name: name.trim(),
      qty: qty.trim() || undefined,
    });

    setName("");
    setQty("");
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="mb-3 text-base font-semibold">빠른 추가</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="재료명" />
        <Input value={qty} onChange={(event) => setQty(event.target.value)} placeholder="수량(선택)" />
        <Button onClick={submit}>추가</Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {recommendItems.map((item) => (
          <button
            key={item}
            className="rounded-full border px-3 py-1 text-sm hover:bg-accent"
            onClick={() => setName(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">추천</Badge>
        팬트리 재료는 교체 후보 가중치에 반영됩니다.
      </div>
    </div>
  );
}
