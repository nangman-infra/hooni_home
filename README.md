# Hooni's personal homepage

개인 홈페이지 입니다.

🚀 **click to go:** [https://hooni.nangman.cloud/](https://hooni.nangman.cloud/)

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
├── constants/
│   └── ui.ts            # UI 관련 상수
```

페이지는 조립 역할만 담당하고,  
각 섹션은 도메인 단위로 분리해 구성했습니다.

---

## Run

```bash
pnpm install
pnpm dev
```
