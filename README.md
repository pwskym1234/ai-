# AI Nutrition Wireframe Prototype

## 목적
실제 AI/커머스 연동 없이, 연동된 것처럼 보이는 클릭 가능한 Next.js 와이어프레임 프로토타입입니다.

## 실행
```bash
npm install
npm run dev
```

## 라우트
- `/` 랜딩
- `/onboarding` 온보딩
- `/home` 이번 주 식단
- `/grocery` 장보기
- `/pantry` 팬트리
- `/profile` 설정
- `/meal/[mealId]` 식단 상세
- `/styleguide` 컴포넌트 스타일가이드

## 기술
- Next.js App Router + TypeScript
- Tailwind CSS
- shadcn/ui 스타일 컴포넌트
- React state + localStorage

## 명시
- 외부 API 호출 없음
- 실제 AI SDK 호출 없음
- 실제 결제/장바구니 연동 없음(모의 UI)
