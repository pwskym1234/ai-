"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";

export default function StyleguidePage() {
  const [slider, setSlider] = useState([30]);
  const [toggle, setToggle] = useState(false);

  return (
    <div className="space-y-4 pb-6">
      <Card>
        <CardHeader>
          <CardTitle>Styleguide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>Badge</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>

          <div className="max-w-sm space-y-2">
            <Input placeholder="Input" />
            <div className="flex items-center gap-2 text-sm">
              <Checkbox defaultChecked />
              Checkbox
            </div>
            <Toggle pressed={toggle} onPressedChange={setToggle} variant="outline">
              Toggle
            </Toggle>
            <Slider value={slider} onValueChange={setSlider} min={10} max={60} step={5} />
            <p className="text-sm text-muted-foreground">Slider: {slider[0]}</p>
          </div>

          <Separator />

          <Tabs defaultValue="cards" className="w-full">
            <TabsList>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="skeleton">Skeleton</TabsTrigger>
            </TabsList>
            <TabsContent value="cards" className="mt-3">
              <Card>
                <CardHeader>
                  <CardTitle>샘플 카드</CardTitle>
                </CardHeader>
                <CardContent>와이어프레임 카드 스타일 확인</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="skeleton" className="mt-3 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
