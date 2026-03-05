"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ShieldAlert, SlidersHorizontal, Target, UserRound } from "lucide-react";
import { toast } from "sonner";

import BottomSheet from "@/components/BottomSheet";
import Chip from "@/components/Chip";
import PrimaryButton from "@/components/PrimaryButton";
import RowItem from "@/components/RowItem";
import SectionCard from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { recipes } from "@/data/recipes";
import { buildCartFromMealPlan, generateMealPlan } from "@/lib/mockEngine";
import {
  getPantry,
  getProfile,
  resetAllStorage,
  seedIfEmpty,
  setCart,
  setMealPlan,
  setProfile,
} from "@/lib/storage";
import { Difficulty, UserProfile } from "@/lib/types";
import { GOAL_OPTIONS } from "@/lib/utils";

type EditorType =
  | "target"
  | "goals"
  | "constraints"
  | "allergies"
  | "dislikes"
  | "cooking"
  | "difficulty"
  | "shopping"
  | null;

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [editor, setEditor] = useState<EditorType>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    seedIfEmpty();
    setProfileState(getProfile());
  }, []);

  const openEditor = (type: EditorType) => {
    setEditor(type);
    setInputText("");
    setEditorOpen(true);
  };

  const patchProfile = (next: UserProfile) => {
    setProfileState(next);
    setProfile(next);
  };

  const regenerateMealPlan = () => {
    if (!profile) return;
    const pantry = getPantry();
    const nextMealPlan = generateMealPlan(profile, pantry, 7);
    const nextCart = buildCartFromMealPlan(profile, nextMealPlan, recipes);

    setMealPlan(nextMealPlan);
    setCart(nextCart);
    setProfile(profile);

    toast.success("이 설정으로 식단을 다시 만들었어요");
  };

  const resetData = () => {
    resetAllStorage();
    toast.success("데이터를 초기화했어요");
    router.push("/");
  };

  const targetValue = useMemo(() => {
    if (!profile) return "-";
    if (profile.targetTypes.length === 0) return "선택 안 함";
    return profile.targetTypes.map((type) => (type === "kids" ? "아이" : "시니어")).join(", ");
  }, [profile]);

  if (!profile) {
    return <div className="py-20 text-center text-slate-500">불러오는 중...</div>;
  }

  return (
    <div className="space-y-3 pb-28">
      <SectionCard title="타겟/목표">
        <div className="space-y-1">
          <RowItem
            title="대상 유형"
            subtitle={targetValue}
            leading={<UserRound className="h-4 w-4" />}
            onClick={() => openEditor("target")}
          />
          <RowItem
            title="대표 목표"
            subtitle={profile.primaryGoal}
            leading={<Target className="h-4 w-4" />}
            onClick={() => openEditor("goals")}
          />
          <RowItem
            title="건강 관심"
            subtitle={`${profile.goals.length}개 선택`}
            value={profile.goals.slice(0, 2).join(", ") || "-"}
            onClick={() => openEditor("goals")}
          />
        </div>
      </SectionCard>

      <SectionCard title="제약/취향">
        <div className="space-y-1">
          <RowItem
            title="식단 제약"
            subtitle={`채식 ${profile.constraints.vegetarian ? "ON" : "OFF"} · 할랄 ${profile.constraints.halal ? "ON" : "OFF"}`}
            leading={<ShieldAlert className="h-4 w-4" />}
            onClick={() => openEditor("constraints")}
          />
          <RowItem
            title="알레르기"
            subtitle={profile.constraints.allergies.slice(0, 2).join(", ") || "없음"}
            value={`${profile.constraints.allergies.length}개`}
            onClick={() => openEditor("allergies")}
          />
          <RowItem
            title="비선호 재료"
            subtitle={profile.dislikes.slice(0, 2).join(", ") || "없음"}
            value={`${profile.dislikes.length}개`}
            onClick={() => openEditor("dislikes")}
          />
        </div>
      </SectionCard>

      <SectionCard title="조리/장보기">
        <div className="space-y-1">
          <RowItem
            title="희망 조리시간"
            subtitle={`${profile.cookingTimeMin}분`}
            leading={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => openEditor("cooking")}
          />
          <RowItem
            title="난이도"
            subtitle={profile.difficulty}
            onClick={() => openEditor("difficulty")}
          />
          <RowItem
            title="장보기 설정"
            subtitle={`${profile.shoppingWindowDays}일 · ${profile.storeProvider === "oasis" ? "오아시스" : "쿠팡"}`}
            value={`${profile.budget ?? 0}원`}
            onClick={() => openEditor("shopping")}
          />
        </div>
      </SectionCard>

      <PrimaryButton className="w-full" onClick={regenerateMealPlan}>
        이 설정으로 식단 다시 만들기(모의)
      </PrimaryButton>

      <SectionCard className="bg-white/80">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl p-1 text-left text-red-500"
          onClick={resetData}
        >
          <span className="text-[15px] font-medium">데이터 초기화</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </SectionCard>

      <BottomSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        title={
          editor === "target"
            ? "대상 유형"
            : editor === "goals"
              ? "목표 설정"
              : editor === "constraints"
                ? "식단 제약"
                : editor === "allergies"
                  ? "알레르기"
                  : editor === "dislikes"
                    ? "비선호 재료"
                    : editor === "cooking"
                      ? "조리시간"
                      : editor === "difficulty"
                        ? "난이도"
                        : editor === "shopping"
                          ? "장보기 설정"
                          : "설정"
        }
      >
        {editor === "target" && (
          <div className="space-y-4 pb-20">
            <div className="flex flex-wrap gap-2">
              <Chip
                label="아이"
                selected={profile.targetTypes.includes("kids")}
                onClick={() => {
                  const has = profile.targetTypes.includes("kids");
                  patchProfile({
                    ...profile,
                    targetTypes: has ? profile.targetTypes.filter((item) => item !== "kids") : [...profile.targetTypes, "kids"],
                  });
                }}
              />
              <Chip
                label="시니어"
                selected={profile.targetTypes.includes("senior")}
                onClick={() => {
                  const has = profile.targetTypes.includes("senior");
                  patchProfile({
                    ...profile,
                    targetTypes: has ? profile.targetTypes.filter((item) => item !== "senior") : [...profile.targetTypes, "senior"],
                  });
                }}
              />
            </div>
            <PrimaryButton className="w-full" onClick={() => setEditorOpen(false)}>
              저장
            </PrimaryButton>
          </div>
        )}

        {editor === "goals" && (
          <div className="space-y-4 pb-20">
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((goal) => (
                <Chip
                  key={goal}
                  label={goal}
                  selected={profile.goals.includes(goal)}
                  onClick={() => {
                    const exists = profile.goals.includes(goal);
                    const goals = exists ? profile.goals.filter((item) => item !== goal) : [...profile.goals, goal];
                    patchProfile({
                      ...profile,
                      goals,
                      primaryGoal: goals.includes(profile.primaryGoal) ? profile.primaryGoal : goals[0] || "혈당",
                    });
                  }}
                />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[13px] text-slate-500">대표 목표</p>
              <Select
                value={profile.primaryGoal}
                onValueChange={(value) => patchProfile({ ...profile, primaryGoal: value })}
              >
                <SelectTrigger className="h-11 rounded-xl bg-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(profile.goals.length ? profile.goals : GOAL_OPTIONS).map((goal) => (
                    <SelectItem key={goal} value={goal}>
                      {goal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <PrimaryButton className="w-full" onClick={() => setEditorOpen(false)}>
              저장
            </PrimaryButton>
          </div>
        )}

        {editor === "constraints" && (
          <div className="space-y-4 pb-20">
            <div className="flex flex-wrap gap-2">
              <Chip
                label="채식"
                selected={profile.constraints.vegetarian}
                onClick={() =>
                  patchProfile({
                    ...profile,
                    constraints: { ...profile.constraints, vegetarian: !profile.constraints.vegetarian },
                  })
                }
              />
              <Chip
                label="할랄"
                selected={profile.constraints.halal}
                onClick={() =>
                  patchProfile({
                    ...profile,
                    constraints: { ...profile.constraints, halal: !profile.constraints.halal },
                  })
                }
              />
            </div>
            <PrimaryButton className="w-full" onClick={() => setEditorOpen(false)}>
              저장
            </PrimaryButton>
          </div>
        )}

        {editor === "allergies" && (
          <div className="space-y-4 pb-20">
            <div className="flex gap-2">
              <Input value={inputText} onChange={(event) => setInputText(event.target.value)} placeholder="알레르기 입력" />
              <Button
                variant="secondary"
                onClick={() => {
                  if (!inputText.trim()) return;
                  patchProfile({
                    ...profile,
                    constraints: {
                      ...profile.constraints,
                      allergies: Array.from(new Set([...profile.constraints.allergies, inputText.trim()])),
                    },
                  });
                  setInputText("");
                }}
              >
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.constraints.allergies.map((item) => (
                <Chip
                  key={item}
                  label={`${item} ×`}
                  selected={false}
                  onClick={() =>
                    patchProfile({
                      ...profile,
                      constraints: {
                        ...profile.constraints,
                        allergies: profile.constraints.allergies.filter((allergy) => allergy !== item),
                      },
                    })
                  }
                />
              ))}
            </div>
            <PrimaryButton className="w-full" onClick={() => setEditorOpen(false)}>
              저장
            </PrimaryButton>
          </div>
        )}

        {editor === "dislikes" && (
          <div className="space-y-4 pb-20">
            <div className="flex gap-2">
              <Input value={inputText} onChange={(event) => setInputText(event.target.value)} placeholder="비선호 재료 입력" />
              <Button
                variant="secondary"
                onClick={() => {
                  if (!inputText.trim()) return;
                  patchProfile({
                    ...profile,
                    dislikes: Array.from(new Set([...profile.dislikes, inputText.trim()])),
                  });
                  setInputText("");
                }}
              >
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.dislikes.map((item) => (
                <Chip
                  key={item}
                  label={`${item} ×`}
                  selected={false}
                  onClick={() => patchProfile({ ...profile, dislikes: profile.dislikes.filter((dislike) => dislike !== item) })}
                />
              ))}
            </div>
            <PrimaryButton className="w-full" onClick={() => setEditorOpen(false)}>
              저장
            </PrimaryButton>
          </div>
        )}

        {editor === "cooking" && (
          <div className="space-y-4 pb-20">
            <p className="text-[13px] text-slate-500">희망 조리시간: {profile.cookingTimeMin}분</p>
            <Slider
              min={10}
              max={60}
              step={5}
              value={[profile.cookingTimeMin]}
              onValueChange={(value) => patchProfile({ ...profile, cookingTimeMin: value[0] ?? profile.cookingTimeMin })}
            />
            <PrimaryButton className="w-full" onClick={() => setEditorOpen(false)}>
              저장
            </PrimaryButton>
          </div>
        )}

        {editor === "difficulty" && (
          <div className="space-y-4 pb-20">
            <div className="flex flex-wrap gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                <Chip
                  key={level}
                  label={level}
                  selected={profile.difficulty === level}
                  onClick={() => patchProfile({ ...profile, difficulty: level })}
                />
              ))}
            </div>
            <PrimaryButton className="w-full" onClick={() => setEditorOpen(false)}>
              저장
            </PrimaryButton>
          </div>
        )}

        {editor === "shopping" && (
          <div className="space-y-4 pb-20">
            <div className="flex flex-wrap gap-2">
              {[3, 7, 14].map((day) => (
                <Chip
                  key={day}
                  label={`${day}일`}
                  selected={profile.shoppingWindowDays === day}
                  onClick={() => patchProfile({ ...profile, shoppingWindowDays: day as 3 | 7 | 14 })}
                />
              ))}
            </div>

            <Select
              value={profile.storeProvider}
              onValueChange={(value: "oasis" | "coupang") => patchProfile({ ...profile, storeProvider: value })}
            >
              <SelectTrigger className="h-11 rounded-xl bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oasis">오아시스</SelectItem>
                <SelectItem value="coupang">쿠팡</SelectItem>
              </SelectContent>
            </Select>

            <p className="text-[13px] text-slate-500">예산: {profile.budget ?? 0}원</p>
            <Slider
              min={20000}
              max={200000}
              step={5000}
              value={[profile.budget ?? 80000]}
              onValueChange={(value) => patchProfile({ ...profile, budget: value[0] ?? profile.budget })}
            />

            <PrimaryButton className="w-full" onClick={() => setEditorOpen(false)}>
              저장
            </PrimaryButton>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
