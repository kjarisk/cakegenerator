# Quickstart

## From template

```bash
degit YOUR_USER/vibecoding-template my-app && cd my-app && npm i
```

## Commands

```bash
npm run dev            # localhost:5173
npm run test           # vitest watch
npm run build          # production
npm run lint           # eslint + prettier check
npm run lint:fix       # eslint + prettier auto-fix
npm run format         # prettier auto-format all files
npm run format:check   # prettier check (no write)
```

## OpenAI Setup (optional)

To enable real AI generation (GPT-4o for recipes, DALL-E 3 for images):

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
2. Add your OpenAI API key to `.env.local`:
   ```
   VITE_OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart the dev server (`npm run dev`)

The sidebar footer shows **AI: Live** when a valid key is configured, or **AI: Mock** when using placeholder data.

Without a key, the app works normally using mock data — no OpenAI account needed.

## Add features (optional)

```bash
# Router
npm i react-router-dom

# Forms
npm i react-hook-form zod @hookform/resolvers

# shadcn/ui components
npx shadcn@latest add <component>
```

## Path aliases

Use `@/` to import from `src/`:

```tsx
import { Button } from '@/components/ui/button'
```
