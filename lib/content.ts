import { Difficulty, UserProfile } from "@/lib/types";

export type GoalInfo = {
  id: string;
  label: string;
  description: string;
  audience: "common" | "kids" | "senior";
};

export const GOAL_LIBRARY: GoalInfo[] = [
  { id: "장건강", label: "장건강", description: "배변 리듬과 소화 부담을 가볍게 관리해요.", audience: "common" },
  { id: "체중", label: "체중", description: "과식 부담을 낮추고 균형 잡힌 저녁을 구성해요.", audience: "common" },
  { id: "수면", label: "수면", description: "늦은 저녁에도 편안하게 마무리되는 구성을 우선해요.", audience: "common" },
  { id: "성장", label: "성장", description: "성장기 에너지와 영양 밀도를 챙기는 목표예요.", audience: "kids" },
  { id: "키", label: "키", description: "성장기 단백질과 칼슘 섭취를 의식한 구성이에요.", audience: "kids" },
  { id: "면역", label: "면역", description: "환절기에도 식사 밸런스를 챙기기 좋은 목표예요.", audience: "kids" },
  { id: "편식", label: "편식 완화", description: "거부감 적은 재료와 익숙한 조합을 우선해요.", audience: "kids" },
  { id: "철분", label: "철분", description: "활동량 많은 아이에게 필요한 철분 식재료를 고려해요.", audience: "kids" },
  { id: "칼슘", label: "칼슘", description: "뼈 건강을 위한 재료 노출을 늘리는 목표예요.", audience: "kids" },
  { id: "단백질", label: "단백질", description: "성장기 근육과 포만감을 챙길 수 있는 목표예요.", audience: "kids" },
  { id: "알레르기 관리", label: "알레르기 관리", description: "주의 식재료를 피하면서 대체 메뉴를 추천해요.", audience: "kids" },
  { id: "혈당", label: "혈당", description: "당 흡수 속도를 완만하게 가져가는 메뉴를 우선해요.", audience: "senior" },
  { id: "혈압", label: "혈압", description: "나트륨 부담을 낮춘 저녁 구성을 선호해요.", audience: "senior" },
  { id: "콜레스테롤", label: "콜레스테롤", description: "지방 구성을 부드럽게 조정한 메뉴를 우선해요.", audience: "senior" },
  { id: "지방간", label: "지방간", description: "과한 당/지방을 줄이는 방향의 식단이에요.", audience: "senior" },
  { id: "근감소", label: "근감소", description: "나이 들수록 필요한 단백질 밀도를 챙겨요.", audience: "senior" },
  { id: "염증", label: "염증", description: "자극적이지 않고 밸런스 좋은 메뉴를 우선해요.", audience: "senior" },
  { id: "근육", label: "근육", description: "운동 후 회복을 고려한 단백질 중심 목표예요.", audience: "senior" },
];

export const QUICK_COACH_PROMPTS = [
  "편식 빼고 추천",
  "20분 내 요리",
  "내 재료 우선",
  "혈당 중심",
];

export function getGoalSections(targetTypes: UserProfile["targetTypes"]) {
  const hasKids = targetTypes.includes("kids");
  const hasSenior = targetTypes.includes("senior");

  if (hasKids && hasSenior) {
    return [
      { title: "공통", goals: GOAL_LIBRARY.filter((goal) => goal.audience === "common") },
      { title: "아이", goals: GOAL_LIBRARY.filter((goal) => goal.audience === "kids") },
      { title: "성인", goals: GOAL_LIBRARY.filter((goal) => goal.audience === "senior") },
    ];
  }

  if (hasKids) {
    return [
      { title: "아이 중심", goals: GOAL_LIBRARY.filter((goal) => goal.audience === "kids") },
      { title: "공통", goals: GOAL_LIBRARY.filter((goal) => goal.audience === "common") },
    ];
  }

  return [
    { title: "성인 중심", goals: GOAL_LIBRARY.filter((goal) => goal.audience === "senior") },
    { title: "공통", goals: GOAL_LIBRARY.filter((goal) => goal.audience === "common") },
  ];
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움",
};

export function difficultyLabel(value: Difficulty) {
  return DIFFICULTY_LABEL[value];
}
