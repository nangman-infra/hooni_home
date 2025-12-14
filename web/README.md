# Hooni's personal homepage

바이브 코딩 과제를 위해 제작한 개인 홈페이지입니다.  
구조와 가독성을 중심으로 간단하게 구성했습니다.

---

## Tech Stack

- Node.js 22.x
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- pnpm

---

## Project Structure

```text
src/
├── app/                 # Next.js App Router
│   └── page.tsx         # 홈 페이지 (컴포넌트 조립)
├── components/
│   └── layout/          # Header, Footer
├── domains/
│   └── home/
│       └── components/  # Hero, Feature, Blog, About 섹션
├── constants/
│   └── ui.ts            # UI 관련 상수


페이지는 조립 역할만 담당하고,  
각 섹션은 도메인 단위로 분리해 구성했습니다.

---

## Run

```bash
pnpm install
pnpm dev
브라우저에서 http://localhost:3000 접속 후 확인할 수 있습니다.