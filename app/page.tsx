import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl">AI 식단·장보기 어시스턴트</CardTitle>
          <CardDescription className="text-base">
            연동된 것처럼 동작하는 클릭형 와이어프레임 프로토타입입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="w-full">
            <Link href="/onboarding">3분만에 시작하기</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
