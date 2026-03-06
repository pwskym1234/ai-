"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

import Chip from "@/components/Chip";
import PrimaryButton from "@/components/PrimaryButton";
import SectionCard from "@/components/SectionCard";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { recipes } from "@/data/recipes";
import { difficultyLabel, getGoalSections } from "@/lib/content";
import { buildCartFromMealPlan, generateMealPlan } from "@/lib/mockEngine";
import { seedIfEmpty, setCart, setMealPlan, setPantry, setProfile } from "@/lib/storage";
import { Difficulty, UserProfile } from "@/lib/types";

const defaultProfile: UserProfile = {
  targetTypes: [],
  primaryGoal: "",
  goals: [],
  constraints: {
    vegetarian: false,
    halal: false,
    allergies: [],
  },
  dislikes: [],
  cookingTimeMin: 30,
  difficulty: "easy",
  kids: {
    ages: [],
    pickyIngredients: [],
    favoriteFoods: [],
  },
  shoppingWindowDays: 7,
  storeProvider: "oasis",
  commerceMode: "mock",
  budget: 80000,
};

const targetCards = [
  {
    key: "kids" as const,
    title: "아이 중심",
    description: "성장, 편식, 영양 밀도를 우선 고려해요.",
  },
  {
    key: "senior" as const,
    title: "시니어 중심",
    description: "혈당, 혈압, 회복 부담을 함께 고려해요.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setLocalProfile] = useState<UserProfile>(defaultProfile);
  const [allergyInput, setAllergyInput] = useState("");
  const [dislikeInput, setDislikeInput] = useState("");
  const [pickyInput, setPickyInput] = useState("");
  const [favoriteInput, setFavoriteInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    seedIfEmpty();
  }, []);

  const goalSections = useMemo(() => getGoalSections(profile.targetTypes), [profile.targetTypes]);

  const toggleString = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value];

  const canContinue = useMemo(() => {
    if (step === 1) return profile.primaryGoal.length > 0;
    return true;
  }, [profile.primaryGoal, step]);

  const finish = () => {
    if (!profile.primaryGoal) {
      toast.error("대표 목표를 선택해 주세요");
      return;
    }

    setLoading(true);

    window.setTimeout(() => {
      const finalProfile: UserProfile = {
        ...profile,
        goals: profile.goals.length ? profile.goals : [profile.primaryGoal],
        kids: profile.targetTypes.includes("kids")
          ? {
              ages: profile.kids?.ages ?? [],
              pickyIngredients: profile.kids?.pickyIngredients ?? [],
              favoriteFoods: profile.kids?.favoriteFoods ?? [],
            }
          : undefined,
      };

      const mealPlan = generateMealPlan(finalProfile, [], 7);
      const cart = buildCartFromMealPlan(finalProfile, mealPlan, recipes);

      setProfile(finalProfile);
      setPantry([]);
      setMealPlan(mealPlan);
      setCart(cart);

      toast.success("이번 주 식단을 만들었어요");
      router.push("/home");
    }, 950);
  };

  return (
    <main className="mx-auto flex h-[100dvh] max-w-3xl flex-col bg-background px-4 pb-4 pt-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[24px] font-semibold text-slate-900">맞춤 식단 시작</p>
            <p className="mt-1 text-[13px] text-slate-500">6단계만 입력하면 이번 주 저녁을 바로 구성해드려요.</p>
          </div>
          <p className="text-[13px] text-slate-500">{step + 1}/6</p>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={`h-2 rounded-full ${index <= step ? "bg-orange-500" : "bg-slate-200"}`} />
          ))}
        </div>
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pb-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-36 bg-slate-200/80" />
            <Skeleton className="h-40 w-full bg-slate-200/80" />
            <Skeleton className="h-24 w-full bg-slate-200/80" />
          </div>
        ) : (
          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {step === 0 ? (
              <SectionCard title="누구를 위한 식단인가요?">
                <div className="space-y-3">
                  {targetCards.map((item) => {
                    const selected = profile.targetTypes.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setLocalProfile((prev) => ({
                            ...prev,
                            targetTypes: prev.targetTypes.includes(item.key)
                              ? prev.targetTypes.filter((type) => type !== item.key)
                              : [...prev.targetTypes, item.key],
                          }))
                        }
                        className={`w-full rounded-[20px] p-4 text-left shadow-sm ${selected ? "bg-orange-50 ring-2 ring-orange-400" : "bg-white"}`}
                      >
                        <p className="text-[16px] font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-[13px] text-slate-500">{item.description}</p>
                      </button>
                    );
                  })}
                </div>
              </SectionCard>
            ) : null}

            {step === 1 ? (
              <SectionCard title="건강 관심을 골라주세요">
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
                              onClick={() =>
                                setLocalProfile((prev) => {
                                  const nextGoals = toggleString(prev.goals, goal.id);
                                  const nextPrimary = nextGoals.includes(prev.primaryGoal) ? prev.primaryGoal : nextGoals[0] ?? goal.id;
                                  return { ...prev, goals: nextGoals, primaryGoal: nextPrimary };
                                })
                              }
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

                  <div className="space-y-2">
                    <Label>대표 목표(필수)</Label>
                    <Select value={profile.primaryGoal} onValueChange={(value) => setLocalProfile((prev) => ({ ...prev, primaryGoal: value }))}>
                      <SelectTrigger className="h-11 rounded-xl bg-slate-50">
                        <SelectValue placeholder="대표 목표 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {profile.goals.map((goal) => (
                          <SelectItem key={goal} value={goal}>
                            {goal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SectionCard>
            ) : null}

            {step === 2 ? (
              <SectionCard title="제약과 취향을 알려주세요">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-[15px]">
                      <Checkbox
                        checked={profile.constraints.vegetarian}
                        onCheckedChange={(checked) =>
                          setLocalProfile((prev) => ({
                            ...prev,
                            constraints: { ...prev.constraints, vegetarian: Boolean(checked) },
                          }))
                        }
                      />
                      채식
                    </label>
                    <label className="flex items-center gap-2 text-[15px]">
                      <Checkbox
                        checked={profile.constraints.halal}
                        onCheckedChange={(checked) =>
                          setLocalProfile((prev) => ({
                            ...prev,
                            constraints: { ...prev.constraints, halal: Boolean(checked) },
                          }))
                        }
                      />
                      할랄
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label>알레르기</Label>
                    <div className="flex gap-2">
                      <Input value={allergyInput} onChange={(event) => setAllergyInput(event.target.value)} placeholder="예: 우유" />
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (!allergyInput.trim()) return;
                          setLocalProfile((prev) => ({
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
                        <Chip key={item} label={item} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>비선호 재료</Label>
                    <div className="flex gap-2">
                      <Input value={dislikeInput} onChange={(event) => setDislikeInput(event.target.value)} placeholder="예: 버섯" />
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (!dislikeInput.trim()) return;
                          setLocalProfile((prev) => ({
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
                        <Chip key={item} label={item} />
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>
            ) : null}

            {step === 3 ? (
              <SectionCard title="조리 성향을 맞춰볼게요">
                <div className="space-y-4">
                  <div>
                    <p className="text-[15px] font-medium text-slate-900">희망 조리시간</p>
                    <p className="mt-1 text-[13px] text-slate-500">{profile.cookingTimeMin}분 안팎으로 맞춰드려요.</p>
                  </div>
                  <Slider
                    min={10}
                    max={60}
                    step={5}
                    value={[profile.cookingTimeMin]}
                    onValueChange={(value) => setLocalProfile((prev) => ({ ...prev, cookingTimeMin: value[0] ?? prev.cookingTimeMin }))}
                  />
                  <div>
                    <p className="mb-2 text-[15px] font-medium text-slate-900">난이도</p>
                    <div className="flex flex-wrap gap-2">
                      {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                        <Chip key={level} label={difficultyLabel(level)} selected={profile.difficulty === level} onClick={() => setLocalProfile((prev) => ({ ...prev, difficulty: level }))} />
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>
            ) : null}

            {step === 4 ? (
              <SectionCard title="아이 관련 정보를 추가할까요?">
                {profile.targetTypes.includes("kids") ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>나이 추가</Label>
                      <div className="flex gap-2">
                        <Input type="number" min={1} max={18} value={ageInput} onChange={(event) => setAgeInput(event.target.value)} />
                        <Button
                          variant="secondary"
                          onClick={() => {
                            const age = Number(ageInput);
                            if (!Number.isInteger(age) || age < 1 || age > 18) return;
                            setLocalProfile((prev) => ({
                              ...prev,
                              kids: {
                                ages: Array.from(new Set([...(prev.kids?.ages ?? []), age])),
                                pickyIngredients: prev.kids?.pickyIngredients ?? [],
                                favoriteFoods: prev.kids?.favoriteFoods ?? [],
                              },
                            }));
                            setAgeInput("");
                          }}
                        >
                          추가
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(profile.kids?.ages ?? []).map((age) => (
                          <Chip key={age} label={`${age}세`} />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>편식 재료</Label>
                      <div className="flex gap-2">
                        <Input value={pickyInput} onChange={(event) => setPickyInput(event.target.value)} placeholder="예: 버섯" />
                        <Button
                          variant="secondary"
                          onClick={() => {
                            if (!pickyInput.trim()) return;
                            setLocalProfile((prev) => ({
                              ...prev,
                              kids: {
                                ages: prev.kids?.ages ?? [],
                                pickyIngredients: Array.from(new Set([...(prev.kids?.pickyIngredients ?? []), pickyInput.trim()])),
                                favoriteFoods: prev.kids?.favoriteFoods ?? [],
                              },
                            }));
                            setPickyInput("");
                          }}
                        >
                          추가
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>선호 음식</Label>
                      <div className="flex gap-2">
                        <Input value={favoriteInput} onChange={(event) => setFavoriteInput(event.target.value)} placeholder="예: 닭고기" />
                        <Button
                          variant="secondary"
                          onClick={() => {
                            if (!favoriteInput.trim()) return;
                            setLocalProfile((prev) => ({
                              ...prev,
                              kids: {
                                ages: prev.kids?.ages ?? [],
                                pickyIngredients: prev.kids?.pickyIngredients ?? [],
                                favoriteFoods: Array.from(new Set([...(prev.kids?.favoriteFoods ?? []), favoriteInput.trim()])),
                              },
                            }));
                            setFavoriteInput("");
                          }}
                        >
                          추가
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-slate-500">아이 중심 식단이 아닌 경우 이 단계는 건너뛰어도 됩니다.</p>
                )}
              </SectionCard>
            ) : null}

            {step === 5 ? (
              <SectionCard title="장보기 방식을 정해주세요">
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[15px] font-medium text-slate-900">장보기 기간</p>
                    <div className="flex flex-wrap gap-2">
                      {[3, 7, 14].map((day) => (
                        <Chip key={day} label={`${day}일`} selected={profile.shoppingWindowDays === day} onClick={() => setLocalProfile((prev) => ({ ...prev, shoppingWindowDays: day as 3 | 7 | 14 }))} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>스토어</Label>
                    <Select value={profile.storeProvider} onValueChange={(value: "oasis" | "coupang") => setLocalProfile((prev) => ({ ...prev, storeProvider: value }))}>
                      <SelectTrigger className="h-11 rounded-xl bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oasis">오아시스</SelectItem>
                        <SelectItem value="coupang">쿠팡</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p className="text-[15px] font-medium text-slate-900">예산</p>
                    <p className="mt-1 text-[13px] text-slate-500">{profile.budget ?? 0}원</p>
                    <Slider
                      min={20000}
                      max={200000}
                      step={5000}
                      value={[profile.budget ?? 80000]}
                      onValueChange={(value) => setLocalProfile((prev) => ({ ...prev, budget: value[0] ?? prev.budget }))}
                    />
                  </div>
                </div>
              </SectionCard>
            ) : null}
          </motion.div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-background pt-4">
        <div className="flex gap-2">
          <Button variant="secondary" className="h-12 flex-1 rounded-xl" disabled={step === 0 || loading} onClick={() => setStep((prev) => Math.max(0, prev - 1))}>
            이전
          </Button>
          {step < 5 ? (
            <PrimaryButton className="flex-1" disabled={!canContinue || loading} onClick={() => setStep((prev) => Math.min(5, prev + 1))}>
              다음
            </PrimaryButton>
          ) : (
            <PrimaryButton className="flex-1" onClick={finish} disabled={loading}>
              이번 주 식단 만들기
            </PrimaryButton>
          )}
        </div>
      </div>
    </main>
  );
}
