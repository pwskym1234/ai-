"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, ShieldAlert, SlidersHorizontal, Target, UserRound } from "lucide-react";
import { toast } from "sonner";

import BottomSheet from "@/components/BottomSheet";
import Chip from "@/components/Chip";
import PrimaryButton from "@/components/PrimaryButton";
import RowItem from "@/components/RowItem";
import SectionCard from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { commerceModeLabel } from "@/lib/commerce";
import { difficultyLabel, getGoalSections } from "@/lib/content";
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
import { CommerceMode, Difficulty, UserProfile } from "@/lib/types";

const TARGET_DESCRIPTIONS = {
  kids: "성장기 아이의 편식과 영양 밀도를 우선 고려해요.",
  senior: "혈당, 혈압, 회복 부담을 함께 고려한 식단이에요.",
};

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
  const [readyInfoOpen, setReadyInfoOpen] = useState(false);

  useEffect(() => {
    seedIfEmpty();
    setProfileState(getProfile());
  }, []);

  const goalSections = useMemo(() => (profile ? getGoalSections(profile.targetTypes) : []), [profile]);

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
            onClick={() => {
              setEditor("target");
              setEditorOpen(true);
            }}
          />
          <RowItem
            title="대표 목표"
            subtitle={profile.primaryGoal}
            leading={<Target className="h-4 w-4" />}
            onClick={() => {
              setEditor("goals");
              setEditorOpen(true);
            }}
          />
          <RowItem
            title="건강 관심"
            subtitle={profile.goals.slice(0, 2).join(", ") || "없음"}
            value={`${profile.goals.length}개`}
            onClick={() => {
              setEditor("goals");
              setEditorOpen(true);
            }}
          />
        </div>
      </SectionCard>

      <SectionCard title="제약/취향">
        <div className="space-y-1">
          <RowItem
            title="식단 제약"
            subtitle={`채식 ${profile.constraints.vegetarian ? "ON" : "OFF"} · 할랄 ${profile.constraints.halal ? "ON" : "OFF"}`}
            leading={<ShieldAlert className="h-4 w-4" />}
            onClick={() => {
              setEditor("constraints");
              setEditorOpen(true);
            }}
          />
          <RowItem
            title="알레르기"
            subtitle={profile.constraints.allergies.slice(0, 2).join(", ") || "없음"}
            value={`${profile.constraints.allergies.length}개`}
            onClick={() => {
              setEditor("allergies");
              setEditorOpen(true);
            }}
          />
          <RowItem
            title="비선호 재료"
            subtitle={profile.dislikes.slice(0, 2).join(", ") || "없음"}
            value={`${profile.dislikes.length}개`}
            onClick={() => {
              setEditor("dislikes");
              setEditorOpen(true);
            }}
          />
        </div>
      </SectionCard>

      <SectionCard title="조리/장보기">
        <div className="space-y-1">
          <RowItem
            title="희망 조리시간"
            subtitle={`${profile.cookingTimeMin}분`}
            leading={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => {
              setEditor("cooking");
              setEditorOpen(true);
            }}
          />
          <RowItem
            title="난이도"
            subtitle={difficultyLabel(profile.difficulty)}
            onClick={() => {
              setEditor("difficulty");
              setEditorOpen(true);
            }}
          />
          <RowItem
            title="장보기 설정"
            subtitle={`${profile.shoppingWindowDays}일 · ${profile.storeProvider === "oasis" ? "오아시스" : "쿠팡"}`}
            value={`${profile.budget ?? 0}원`}
            onClick={() => {
              setEditor("shopping");
              setEditorOpen(true);
            }}
          />
          <RowItem
            title="연동 모드"
            subtitle={commerceModeLabel(profile.commerceMode ?? "mock")}
            leading={<Link2 className="h-4 w-4" />}
            onClick={() => {
              setEditor("shopping");
              setEditorOpen(true);
            }}
          />
        </div>
      </SectionCard>

      <PrimaryButton className="w-full" onClick={regenerateMealPlan}>
        이 설정으로 식단 다시 만들기(모의)
      </PrimaryButton>

      <SectionCard className="bg-white/80">
        <button type="button" className="w-full rounded-xl p-1 text-left text-[15px] font-medium text-red-500" onClick={resetData}>
          데이터 초기화
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
                          ? "장보기/연동 설정"
                          : "설정"
        }
        footer={<PrimaryButton className="w-full" onClick={() => setEditorOpen(false)}>저장</PrimaryButton>}
      >
        {editor === "target" ? (
          <div className="space-y-4">
            {([
              { key: "kids", label: "아이" },
              { key: "senior", label: "시니어" },
            ] as const).map((item) => {
              const selected = profile.targetTypes.includes(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    const nextTypes = selected
                      ? profile.targetTypes.filter((type) => type !== item.key)
                      : [...profile.targetTypes, item.key];
                    patchProfile({
                      ...profile,
                      targetTypes: nextTypes,
                    });
                  }}
                  className={`w-full rounded-[20px] p-4 text-left shadow-sm ${selected ? "bg-orange-50 ring-2 ring-orange-400" : "bg-white"}`}
                >
                  <p className="text-[16px] font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-[13px] text-slate-500">{TARGET_DESCRIPTIONS[item.key]}</p>
                </button>
              );
            })}
          </div>
        ) : null}

        {editor === "goals" ? (
          <div className="space-y-4">
            {goalSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <p className="text-[13px] font-semibold text-slate-700">{section.title}</p>
                <div className="space-y-2">
                  {section.goals.map((goal) => {
                    const selected = profile.goals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => {
                          const nextGoals = selected
                            ? profile.goals.filter((item) => item !== goal.id)
                            : [...profile.goals, goal.id];
                          patchProfile({
                            ...profile,
                            goals: nextGoals,
                            primaryGoal: nextGoals.includes(profile.primaryGoal) ? profile.primaryGoal : nextGoals[0] || goal.id,
                          });
                        }}
                        className={`w-full rounded-[18px] p-4 text-left shadow-sm ${selected ? "bg-orange-50 ring-2 ring-orange-400" : "bg-white"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[15px] font-medium text-slate-900">{goal.label}</p>
                          {profile.primaryGoal === goal.id ? <span className="text-[12px] text-orange-500">대표 목표</span> : null}
                        </div>
                        <p className="mt-1 text-[12px] text-slate-500">{goal.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <Select value={profile.primaryGoal} onValueChange={(value) => patchProfile({ ...profile, primaryGoal: value })}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50">
                <SelectValue placeholder="대표 목표 선택" />
              </SelectTrigger>
              <SelectContent>
                {(profile.goals.length ? profile.goals : goalSections.flatMap((section) => section.goals.map((goal) => goal.id))).map((goal) => (
                  <SelectItem key={goal} value={goal}>
                    {goal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {editor === "constraints" ? (
          <div className="flex flex-wrap gap-2">
            <Chip
              label="채식"
              selected={profile.constraints.vegetarian}
              onClick={() => patchProfile({ ...profile, constraints: { ...profile.constraints, vegetarian: !profile.constraints.vegetarian } })}
            />
            <Chip
              label="할랄"
              selected={profile.constraints.halal}
              onClick={() => patchProfile({ ...profile, constraints: { ...profile.constraints, halal: !profile.constraints.halal } })}
            />
          </div>
        ) : null}

        {editor === "allergies" ? (
          <div className="space-y-4">
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
          </div>
        ) : null}

        {editor === "dislikes" ? (
          <div className="space-y-4">
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
                <Chip key={item} label={`${item} ×`} onClick={() => patchProfile({ ...profile, dislikes: profile.dislikes.filter((dislike) => dislike !== item) })} />
              ))}
            </div>
          </div>
        ) : null}

        {editor === "cooking" ? (
          <div className="space-y-4">
            <p className="text-[13px] text-slate-500">희망 조리시간: {profile.cookingTimeMin}분</p>
            <Slider
              min={10}
              max={60}
              step={5}
              value={[profile.cookingTimeMin]}
              onValueChange={(value) => patchProfile({ ...profile, cookingTimeMin: value[0] ?? profile.cookingTimeMin })}
            />
          </div>
        ) : null}

        {editor === "difficulty" ? (
          <div className="flex flex-wrap gap-2">
            {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
              <Chip key={level} label={difficultyLabel(level)} selected={profile.difficulty === level} onClick={() => patchProfile({ ...profile, difficulty: level })} />
            ))}
          </div>
        ) : null}

        {editor === "shopping" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[3, 7, 14].map((day) => (
                <Chip key={day} label={`${day}일`} selected={profile.shoppingWindowDays === day} onClick={() => patchProfile({ ...profile, shoppingWindowDays: day as 3 | 7 | 14 })} />
              ))}
            </div>

            <Select value={profile.storeProvider} onValueChange={(value: "oasis" | "coupang") => patchProfile({ ...profile, storeProvider: value })}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oasis">오아시스</SelectItem>
                <SelectItem value="coupang">쿠팡</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <p className="text-[13px] text-slate-500">예산: {profile.budget ?? 0}원</p>
              <Slider
                min={20000}
                max={200000}
                step={5000}
                value={[profile.budget ?? 80000]}
                onValueChange={(value) => patchProfile({ ...profile, budget: value[0] ?? profile.budget })}
              />
            </div>

            <div className="space-y-2">
              <p className="text-[13px] font-semibold text-slate-700">연동 모드</p>
              <div className="flex flex-wrap gap-2">
                {(["mock", "deeplink", "ready"] as CommerceMode[]).map((mode) => (
                  <Chip
                    key={mode}
                    label={commerceModeLabel(mode)}
                    selected={(profile.commerceMode ?? "mock") === mode}
                    onClick={() => {
                      if (mode === "ready") {
                        setReadyInfoOpen(true);
                        return;
                      }
                      patchProfile({ ...profile, commerceMode: mode });
                    }}
                  />
                ))}
              </div>
              <p className="text-[12px] text-slate-500">모의는 안내만, 딥링크는 검색 결과 이동, 실연동은 준비중 UI만 제공합니다.</p>
            </div>
          </div>
        ) : null}
      </BottomSheet>

      <Dialog open={readyInfoOpen} onOpenChange={setReadyInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>실연동은 준비중입니다</DialogTitle>
            <DialogDescription>
              정식 장바구니/결제 연동에는 파트너십과 공식 API가 필요합니다. 현재 앱에서는 딥링크까지만 지원합니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <PrimaryButton
              onClick={() => {
                patchProfile({ ...profile, commerceMode: "deeplink" });
                setReadyInfoOpen(false);
              }}
            >
              딥링크 모드 사용
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
