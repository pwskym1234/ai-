"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MealPlanItem } from "@/lib/types";

interface MealCardProps {
  item: MealPlanItem;
  dayLabel: string;
  onSwap: () => void;
  onDetail: () => void;
  onConfirm: () => void;
}

export default function MealCard({ item, dayLabel, onSwap, onDetail, onConfirm }: MealCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{dayLabel} 저녁 · {item.title}</CardTitle>
          {item.confirmed && <Badge>확정됨</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          <Badge variant="outline">{item.cookTimeMin}분</Badge>
          <Badge variant="outline">난이도 {item.difficulty}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{item.reason}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onSwap}>
            교체
          </Button>
          <Button variant="secondary" onClick={onDetail}>
            상세
          </Button>
          <Button onClick={onConfirm}>{item.confirmed ? "확정 해제" : "확정"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
