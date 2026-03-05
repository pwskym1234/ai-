"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Stepper from "@/components/Stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { recipes } from "@/data/recipes";
import { buildCartFromMealPlan, generateMealPlan } from "@/lib/mockEngine";
import { seedIfEmpty, setCart, setMealPlan, setPantry, setProfile } from "@/lib/storage";
import { Difficulty, UserProfile } from "@/lib/types";
import { GOAL_OPTIONS } from "@/lib/utils";

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
  budget: 80000,
};

const timeMarks = [10, 20, 30, 45, 60];

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

  const currentCookingTime = useMemo(() => {
    return timeMarks.reduce((prev, current) =>
      Math.abs(current - profile.cookingTimeMin) < Math.abs(prev - profile.cookingTimeMin) ? current : prev,
    );
  }, [profile.cookingTimeMin]);

  const toggleArrayItem = (arr: string[], item: string) => {
    return arr.includes(item) ? arr.filter((value) => value !== item) : [...arr, item];
  };

  const canNext = () => {
    if (step === 1) return profile.primaryGoal.length > 0;
    return true;
  };

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
        kids:
          profile.targetTypes.includes("kids")
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
    }, 1000);
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6">
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-2xl">온보딩</CardTitle>
          <Stepper total={6} current={step} />
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <>
              {step === 0 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold">1) 대상 선택</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { key: "kids", label: "아이 중심" },
                      { key: "senior", label: "시니어 중심" },
                    ].map((item) => {
                      const active = profile.targetTypes.includes(item.key as "kids" | "senior");
                      return (
                        <button
                          key={item.key}
                          className={`rounded-lg border p-4 text-left ${active ? "border-primary bg-primary/10" : ""}`}
                          onClick={() =>
                            setLocalProfile((prev) => ({
                              ...prev,
                              targetTypes: prev.targetTypes.includes(item.key as "kids" | "senior")
                                ? prev.targetTypes.filter((type) => type !== item.key)
                                : [...prev.targetTypes, item.key as "kids" | "senior"],
                            }))
                          }
                        >
                          <p className="font-medium">{item.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === 1 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold">2) 건강 관심</h2>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map((goal) => (
                      <button
                        key={goal}
                        onClick={() =>
                          setLocalProfile((prev) => {
                            const nextGoals = toggleArrayItem(prev.goals, goal);
                            const nextPrimary = nextGoals.includes(prev.primaryGoal)
                              ? prev.primaryGoal
                              : nextGoals[0] ?? "";

                            return { ...prev, goals: nextGoals, primaryGoal: nextPrimary };
                          })
                        }
                        className={`rounded-full border px-3 py-1 text-sm ${
                          profile.goals.includes(goal) ? "border-primary bg-primary/10 text-primary" : ""
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                  <Label>대표 목표(필수)</Label>
                  <Select
                    value={profile.primaryGoal}
                    onValueChange={(value) => setLocalProfile((prev) => ({ ...prev, primaryGoal: value }))}
                  >
                    <SelectTrigger>
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
                </section>
              )}

              {step === 2 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold">3) 제약/취향</h2>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
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
                    <label className="flex items-center gap-2">
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
                      <Input value={allergyInput} onChange={(event) => setAllergyInput(event.target.value)} />
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
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>비선호 재료</Label>
                    <div className="flex gap-2">
                      <Input value={dislikeInput} onChange={(event) => setDislikeInput(event.target.value)} />
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
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold">4) 조리 성향</h2>
                  <p className="text-sm text-muted-foreground">선호 조리시간: {currentCookingTime}분</p>
                  <Slider
                    min={10}
                    max={60}
                    step={5}
                    value={[profile.cookingTimeMin]}
                    onValueChange={(value) =>
                      setLocalProfile((prev) => ({ ...prev, cookingTimeMin: value[0] ?? prev.cookingTimeMin }))
                    }
                  />
                  <Label>난이도</Label>
                  <ToggleGroup
                    type="single"
                    value={profile.difficulty}
                    onValueChange={(value: Difficulty) => value && setLocalProfile((prev) => ({ ...prev, difficulty: value }))}
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
                </section>
              )}

              {step === 4 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold">5) Kids 설정</h2>
                  {profile.targetTypes.includes("kids") ? (
                    <>
                      <div className="space-y-2">
                        <Label>나이 추가(1~18)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={18}
                            value={ageInput}
                            onChange={(event) => setAgeInput(event.target.value)}
                          />
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
                            <Badge key={age} variant="outline">
                              {age}세
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>편식 재료</Label>
                        <div className="flex gap-2">
                          <Input value={pickyInput} onChange={(event) => setPickyInput(event.target.value)} />
                          <Button
                            variant="secondary"
                            onClick={() => {
                              if (!pickyInput.trim()) return;
                              setLocalProfile((prev) => ({
                                ...prev,
                                kids: {
                                  ages: prev.kids?.ages ?? [],
                                  pickyIngredients: Array.from(
                                    new Set([...(prev.kids?.pickyIngredients ?? []), pickyInput.trim()]),
                                  ),
                                  favoriteFoods: prev.kids?.favoriteFoods ?? [],
                                },
                              }));
                              setPickyInput("");
                            }}
                          >
                            추가
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(profile.kids?.pickyIngredients ?? []).map((item) => (
                            <Badge key={item} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>선호 음식</Label>
                        <div className="flex gap-2">
                          <Input value={favoriteInput} onChange={(event) => setFavoriteInput(event.target.value)} />
                          <Button
                            variant="secondary"
                            onClick={() => {
                              if (!favoriteInput.trim()) return;
                              setLocalProfile((prev) => ({
                                ...prev,
                                kids: {
                                  ages: prev.kids?.ages ?? [],
                                  pickyIngredients: prev.kids?.pickyIngredients ?? [],
                                  favoriteFoods: Array.from(
                                    new Set([...(prev.kids?.favoriteFoods ?? []), favoriteInput.trim()]),
                                  ),
                                },
                              }));
                              setFavoriteInput("");
                            }}
                          >
                            추가
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(profile.kids?.favoriteFoods ?? []).map((item) => (
                            <Badge key={item} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">아이 대상이 아닌 경우 이 단계는 건너뜁니다.</p>
                  )}
                </section>
              )}

              {step === 5 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold">6) 장보기 설정</h2>
                  <div className="flex flex-wrap gap-2">
                    {[3, 7, 14].map((day) => (
                      <Toggle
                        key={day}
                        variant="outline"
                        pressed={profile.shoppingWindowDays === day}
                        onPressedChange={() =>
                          setLocalProfile((prev) => ({ ...prev, shoppingWindowDays: day as 3 | 7 | 14 }))
                        }
                      >
                        {day}일
                      </Toggle>
                    ))}
                  </div>
                  <Label>스토어</Label>
                  <Select
                    value={profile.storeProvider}
                    onValueChange={(value: "oasis" | "coupang") =>
                      setLocalProfile((prev) => ({ ...prev, storeProvider: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oasis">오아시스</SelectItem>
                      <SelectItem value="coupang">쿠팡</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">예산: {profile.budget ?? 0}원</p>
                  <Slider
                    min={20000}
                    max={200000}
                    step={5000}
                    value={[profile.budget ?? 80000]}
                    onValueChange={(value) => setLocalProfile((prev) => ({ ...prev, budget: value[0] ?? prev.budget }))}
                  />
                </section>
              )}

              <div className="flex justify-between gap-2 pt-2">
                <Button variant="outline" disabled={step === 0} onClick={() => setStep((prev) => Math.max(0, prev - 1))}>
                  이전
                </Button>

                {step < 5 ? (
                  <Button disabled={!canNext()} onClick={() => setStep((prev) => Math.min(5, prev + 1))}>
                    다음
                  </Button>
                ) : (
                  <Button onClick={finish}>이번 주 식단 만들기</Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
