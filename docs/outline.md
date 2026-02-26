# Outline (Scope Lock) — CakeGen (Theme Cake Generator)

## 1) One-sentence goal

A lightweight team app that turns a customer’s theme request into one or more cake concepts (recipe + generated image), estimates ingredient costs with store suggestions, and supports sharing for approval + comments—while maintaining a reusable “Cake Bank” of themed cakes.

---

## 2) Non-goals (explicitly NOT doing)

- No payments, checkout, invoicing, or order fulfillment
- No delivery logistics or booking a baker
- No full inventory management (store stock levels / live availability not guaranteed in v1)
- No fully featured database in v1 (start with JSON file storage)
- No advanced user management (SSO, roles/permissions, enterprise RBAC)
- No multi-language support in v1
- No dietary/allergen compliance guarantees (we can _suggest_, but not certify)
- No public social feed (likes/follows), only share links for review

---

## 3) Target user

- Primary: Teams (office teams / event teams / friends) that bake themed cakes for celebrations and want repeatable concepts.
- Secondary: The “cake coordinator” (person who collects the request, generates options, shares for approval, assigns weekly baker).
- Context: Used when planning birthdays, team events, theme parties, office celebrations, seasonal events—especially when the team wants ideas fast and a consistent “theme library”.

---

## 4) Core flows (3–7 bullets)

1. **Create cake request**
   - Enter customer/theme prompt (occasion, vibe, colors, servings, skill level, dietary notes, budget range).
   - Choose number of cake concepts to generate (1–N).
2. **Generate cake concept(s)**
   - For each concept: recipe (ingredients + steps), equipment list, time estimate, difficulty, and a generated cake image.
   - Option to regenerate: whole concept or only parts (image only / recipe only / decorations only).
3. **Cost & shopping suggestions**
   - Suggest where to buy ingredients (store picks) and estimate per-ingredient + total cost.
   - Suggest extra theme items (decorations: balloons, toppers, candles, plates, confetti, etc.) + estimated cost.
4. **Save to Cake Bank**
   - Save a cake concept into a Theme Category (e.g., “Space”, “Retro 80s”, “Minions”, “Golf”, “Halloween”).
   - Add tags and notes (“works well with fondant”, “best served chilled”, “kid-friendly”).
5. **Share for approval**
   - Generate a share link (read-only) where stakeholders can approve or leave comments.
   - Capture comment threads and approval status.
6. **Weekly Cake Bonanza**
   - Create a weekly schedule and assign a user to a week.
   - Calendar view: monthly grid showing who's assigned to each week at a glance.
   - Notify/visibility in-app: who's up next + what cake theme is planned.
   - Rate each week's cake (1–5 stars) after it's baked — track team favorites over time.

---

## 5) Data model (minimal)

### Entity: `User` (low-key persona)

- fields:
  - `id` (string)
  - `displayName` (string)
  - `email` (string, optional depending on invite approach)
  - `createdAt` (ISO string)

### Entity: `CakeRequest`

- fields:
  - `id`
  - `createdAt`
  - `createdByUserId`
  - `customerPrompt` (text)
  - `constraints` (object)
    - `servings` (number)
    - `skillLevel` (enum: beginner/intermediate/advanced)
    - `dietaryNotes` (text)
    - `budgetRange` (min/max or “low/medium/high”)
    - `preferredStyle` (e.g., buttercream/fondant/naked cake)
  - `numConcepts` (number)
  - `status` (enum: draft/generated/shared/approved/rejected)

### Entity: `CakeConcept`

- fields:
  - `id`
  - `requestId`
  - `title`
  - `themeTags` (string[])
  - `description` (text)
  - `recipe` (object)
    - `ingredients[]` (name, quantity, unit, notes)
    - `steps[]`
    - `timeEstimateMinutes`
    - `difficulty`
    - `equipment[]`
  - `image` (object)
    - `promptUsed` (text)
    - `imageUrl` (string) or `imageBase64` (string, v1 optional)
  - `shoppingPlan` (object)
    - `storeSuggestions[]` (storeName, rationale)
    - `ingredientCosts[]` (ingredientName, storeName, estimatedPrice, currency)
    - `totalEstimatedCost`
  - `extras` (object)
    - `themeAddons[]` (itemName, estimatedPrice, storeSuggestion)
    - `addonsTotalEstimatedCost`
  - `notes` (text, internal)
  - `savedToBank` (boolean)

### Entity: `ThemeCategory`

- fields:
  - `id`
  - `name` (e.g., “Space”, “Golf”, “Kids”, “Christmas”)
  - `description`
  - `cakeConceptIds[]`

### Entity: `ShareLink`

- fields:
  - `id`
  - `cakeConceptId`
  - `token` (string)
  - `expiresAt` (optional)
  - `createdAt`
  - `permission` (enum: view/comment)

### Entity: `Comment`

- fields:
  - `id`
  - `shareLinkId` or `cakeConceptId`
  - `authorName` (string)
  - `message` (text)
  - `createdAt`

### Entity: `BonanzaSchedule`

- fields:
  - `id`
  - `teamName`
  - `startDate`
  - `cadence` (enum: weekly)
  - `assignments[]` (weekStartDate, userId, themeCategoryId?, cakeConceptId?, rating?)

> `rating` is 1–5 stars (integer, optional). Null/undefined means not yet rated.

> Storage v1: `data/db.json` with arrays for each entity. Migrate to real DB later.

---

## 6) UI references

- Figma link(s): _(add when available)_
- Screenshots: see `docs/screenshots/`
- Moodboard: see `docs/moodboard/`
- Notes (visual direction, typography, tone):
  - Frontpage should feel “theme-first”: bold hero + rotating theme cards + a moodboard-style layout.
  - Energetic but clean: playful illustrations, strong whitespace, clear CTAs (“Generate cake concept”, “Browse Cake Bank”).
  - Emphasize trust + clarity: show example outputs (recipe + image + cost estimate + approval comments).
  - Tone: friendly, creative, team-oriented (no “serious cooking app” vibe).

---

## 7) Definition of Done (v1)

- [ ] Create Cake Request with constraints and number of concepts
- [ ] Generate cake concept(s): recipe + image + extras suggestions
- [ ] Regenerate (full concept OR recipe-only OR image-only)
- [ ] Shopping plan: store suggestions + per-ingredient estimated prices + totals
- [ ] Save cake concept to Cake Bank under Theme Categories + tags
- [ ] Browse/search Cake Bank by theme + tags
- [ ] Share cake concept via link and collect comments + approval state
- [ ] Weekly Cake Bonanza: create schedule + assign users to weeks + view upcoming assignments
- [ ] Weekly Cake Bonanza: calendar view + rate each week's cake (1–5 stars)
- [ ] JSON file persistence works (read/write) with basic validation + backup
- [ ] Basic error states + loading states exist
- [ ] Responsive for desktop + mobile
- [ ] Tests exist for critical logic (generation orchestration, JSON persistence, share token access)
- [ ] README updated with run instructions + data file format

---

## Open questions (to lock scope and avoid surprises)

1. **Region & stores:** Which country/city should store suggestions target in v1 (e.g., Norway: Meny/Rema/Coop, Sweden: ICA/Coop/Willys, UK: Tesco/Sainsbury’s)? Or should v1 use “generic store types” (cheap/standard/premium) without real store names?
2. **Pricing method:** Do you want:
   - A) static “price catalog” you maintain in JSON, or
   - B) quick AI-estimates without real accuracy, or
   - C) optional integration later (store APIs / scraping is usually a no-go)?
3. **Dietary constraints:** Which should be first-class toggles in the UI (gluten-free, nut-free, vegan, lactose-free), vs free-text notes?
4. **Image generation style:** Should the output be:
   - Photorealistic “final cake photo”, or
   - Clean “concept art / moodboard style”, or
   - Both (toggle)?
5. **Sharing & identity:** For comments/approval:
   - Should reviewers log in, or can they comment as “Name only” via the share link?
6. **Approval workflow:** Simple states (Draft → Shared → Approved/Changes requested) or do you need versioning of revisions?
7. **Bonanza notifications:** In v1, is “in-app only” enough, or do you need email/Slack reminders?
