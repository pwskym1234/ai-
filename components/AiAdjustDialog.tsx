"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getProfile, setProfile } from "@/lib/storage";
import { GOAL_OPTIONS } from "@/lib/utils";

interface AiAdjustDialogProps {
  compact?: boolean;
}

export default function AiAdjustDialog({ compact }: AiAdjustDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const onApply = () => {
    const profile = getProfile();
    const matchedGoal = GOAL_OPTIONS.find((goal) => message.includes(goal));

    if (matchedGoal) {
      setProfile({
        ...profile,
        primaryGoal: matchedGoal,
        goals: Array.from(new Set([matchedGoal, ...profile.goals])),
      });
    }

    toast.success("AI가 반영했어요(모의)");
    setMessage("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Sparkles className="h-4 w-4" />
          </button>
        ) : (
          <Button size="sm" variant="secondary" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI에게 조정하기
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI에게 조정하기(모의)</DialogTitle>
          <DialogDescription>원하는 조정 내용을 입력하면 반영된 것처럼 동작합니다.</DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="예: 이번 주는 혈압 중심으로 20분 내 저녁으로 바꿔줘"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <DialogFooter>
          <Button onClick={onApply}>적용(모의)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
