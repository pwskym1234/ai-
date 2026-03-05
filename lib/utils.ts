import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GOAL_OPTIONS = [
  "혈당",
  "혈압",
  "콜레스테롤",
  "지방간",
  "식물다양성",
  "염증",
  "장건강",
  "근육",
  "체중",
  "수면",
];

export const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export function formatKrw(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
