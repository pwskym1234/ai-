"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Difficulty, UserProfile } from "@/lib/types";
import { GOAL_OPTIONS } from "@/lib/utils";

interface ProfileFormProps {
  value: UserProfile;
  onSave: (profile: UserProfile) => void;
  onRegenerate: (profile: UserProfile) => void;
  onReset: () => void;
}

export default function ProfileForm({ value, onSave, onRegenerate, onReset }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>(value);
  const [allergyInput, setAllergyInput] = useState("");
  const [dislikeInput, setDislikeInput] = useState("");

  const timeMarks = [10, 20, 30, 45, 60];

  const nearestCookingTime = useMemo(() => {
    return timeMarks.reduce((prev, current) =>
      Math.abs(current - profile.cookingTimeMin) < Math.abs(prev - profile.cookingTimeMin) ? current : prev,
    );
  }, [profile.cookingTimeMin]);

  const toggleGoal = (goal: string) => {
    const exists = profile.goals.includes(goal);
    const nextGoals = exists ? profile.goals.filter((item) => item !== goal) : [...profile.goals, goal];
    const nextPrimary = nextGoals.includes(profile.primaryGoal) ? profile.primaryGoal : nextGoals[0] ?? "혈당";

    setProfile({
      ...profile,
      goals: nextGoals,
      primaryGoal: nextPrimary,
    });
  };

  const save = () => {
    onSave(profile);
  };

  const regenerate = () => {
    onRegenerate(profile);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border p-4">
        <h3 className="mb-3 text-base font-semibold">타겟 유형</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={profile.targetTypes.includes("kids")}
              onCheckedChange={(checked) =>
                setProfile((prev) => ({
                  ...prev,
                  targetTypes: checked
                    ? Array.from(new Set([...prev.targetTypes, "kids"]))
                    : prev.targetTypes.filter((type) => type !== "kids"),
                }))
              }
            />
            아이
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={profile.targetTypes.includes("senior")}
              onCheckedChange={(checked) =>
                setProfile((prev) => ({
                  ...prev,
                  targetTypes: checked
                    ? Array.from(new Set([...prev.targetTypes, "senior"]))
                    : prev.targetTypes.filter((type) => type !== "senior"),
                }))
              }
            />
            시니어
          </label>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="mb-3 text-base font-semibold">건강 관심</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`rounded-full border px-3 py-1 text-sm ${
                profile.goals.includes(goal) ? "border-primary bg-primary/10 text-primary" : ""
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
        <Label className="mb-2 block">대표 목표</Label>
        <Select
          value={profile.primaryGoal}
          onValueChange={(value) => setProfile((prev) => ({ ...prev, primaryGoal: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {profile.goals.map((goal) => (
              <SelectItem key={goal} value={goal}>
                {goal}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="mb-3 text-base font-semibold">제약/취향</h3>
        <div className="mb-3 flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={profile.constraints.vegetarian}
              onCheckedChange={(checked) =>
                setProfile((prev) => ({
                  ...prev,
                  constraints: { ...prev.constraints, vegetarian: Boolean(checked) },
                }))
              }
            />
            채식
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={profile.constraints.halal}
              onCheckedChange={(checked) =>
                setProfile((prev) => ({
                  ...prev,
                  constraints: { ...prev.constraints, halal: Boolean(checked) },
                }))
              }
            />
            할랄
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={allergyInput}
              onChange={(event) => setAllergyInput(event.target.value)}
              placeholder="알레르기 입력"
            />
            <Button
              variant="secondary"
              onClick={() => {
                if (!allergyInput.trim()) return;
                setProfile((prev) => ({
                  ...prev,
                  constraints: {
                    ...prev.constraints,
                    allergies: Array.from(new Set([...prev.constraints.allergies, allergyInput.trim()])),
                  },
                }));
                setAllergyInput("");
              }}
            >
              추가
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.constraints.allergies.map((item) => (
              <button
                key={item}
                onClick={() =>
                  setProfile((prev) => ({
                    ...prev,
                    constraints: {
                      ...prev.constraints,
                      allergies: prev.constraints.allergies.filter((allergy) => allergy !== item),
                    },
                  }))
                }
                className="rounded-full border px-3 py-1 text-sm"
              >
                {item} ×
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex gap-2">
            <Input value={dislikeInput} onChange={(event) => setDislikeInput(event.target.value)} placeholder="비선호 재료 입력" />
            <Button
              variant="secondary"
              onClick={() => {
                if (!dislikeInput.trim()) return;
                setProfile((prev) => ({
                  ...prev,
                  dislikes: Array.from(new Set([...prev.dislikes, dislikeInput.trim()])),
                }));
                setDislikeInput("");
              }}
            >
              추가
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.dislikes.map((item) => (
              <button
                key={item}
                onClick={() => setProfile((prev) => ({ ...prev, dislikes: prev.dislikes.filter((dislike) => dislike !== item) }))}
                className="rounded-full border px-3 py-1 text-sm"
              >
                {item} ×
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="mb-3 text-base font-semibold">조리 성향</h3>
        <p className="mb-2 text-sm text-muted-foreground">희망 조리시간: {nearestCookingTime}분</p>
        <Slider
          min={10}
          max={60}
          step={5}
          value={[profile.cookingTimeMin]}
          onValueChange={(value) => setProfile((prev) => ({ ...prev, cookingTimeMin: value[0] ?? prev.cookingTimeMin }))}
        />
        <div className="mt-3">
          <Label className="mb-2 block">난이도</Label>
          <ToggleGroup
            type="single"
            value={profile.difficulty}
            onValueChange={(value: Difficulty) => value && setProfile((prev) => ({ ...prev, difficulty: value }))}
          >
            <ToggleGroupItem value="easy" variant="outline">
              easy
            </ToggleGroupItem>
            <ToggleGroupItem value="medium" variant="outline">
              medium
            </ToggleGroupItem>
            <ToggleGroupItem value="hard" variant="outline">
              hard
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="mb-3 text-base font-semibold">장보기</h3>
        <Label className="mb-2 block">기간</Label>
        <ToggleGroup
          type="single"
          value={String(profile.shoppingWindowDays)}
          onValueChange={(value) =>
            value &&
            setProfile((prev) => ({
              ...prev,
              shoppingWindowDays: Number(value) as 3 | 7 | 14,
            }))
          }
        >
          <ToggleGroupItem value="3" variant="outline">
            3일
          </ToggleGroupItem>
          <ToggleGroupItem value="7" variant="outline">
            7일
          </ToggleGroupItem>
          <ToggleGroupItem value="14" variant="outline">
            14일
          </ToggleGroupItem>
        </ToggleGroup>

        <Label className="mb-2 mt-4 block">스토어</Label>
        <Select
          value={profile.storeProvider}
          onValueChange={(value: "oasis" | "coupang") => setProfile((prev) => ({ ...prev, storeProvider: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="oasis">오아시스</SelectItem>
            <SelectItem value="coupang">쿠팡</SelectItem>
          </SelectContent>
        </Select>

        <p className="mt-3 text-sm text-muted-foreground">예산: {profile.budget ?? 0}원</p>
        <Slider
          min={20000}
          max={200000}
          step={5000}
          value={[profile.budget ?? 80000]}
          onValueChange={(value) => setProfile((prev) => ({ ...prev, budget: value[0] ?? prev.budget }))}
        />
      </section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={save}>저장</Button>
        <Button variant="secondary" onClick={regenerate}>
          식단 다시 만들기(모의)
        </Button>
        <Button variant="destructive" onClick={onReset}>
          데이터 초기화
        </Button>
      </div>
    </div>
  );
}
