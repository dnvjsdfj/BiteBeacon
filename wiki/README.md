# BiteBeacon project wiki

Project second brain. Update after material behavior, architecture or acceptance changes.

## Reported allergen display — 2026-09-30

- Reported allergen tags and traces now remove language prefixes such as `en:`, replace tag hyphens with spaces, and display uppercase names with the same body typography as reported ingredients (for example, `GLUTEN, MILK, PEANUTS, SOYBEANS`).
- Formatting is display-only; original provider values, assessment matching and missing-data messages remain unchanged.
- Validation: TypeScript passed; all 62 unit/database tests passed. No Lua/Luau changed; Selene not applicable.

## Decisions — 2026-09-30

- User chose **US first** and **local demo + Supabase setup**.
- React Native / Expo with TypeScript; no existing project files needed preservation.
- Working brand: BiteBeacon. Custom calm green/cream UI. Responsive layouts use flex and percentage widths; native text respects system font scaling. Roblox `Scale` / `TextScaled` properties do not exist in React Native. Logo: flat green cart inside scan brackets (`assets/logo.svg`, drawn in-app by `CartLogo` in `src/ui/logo.tsx` using the theme green); wordmark "BiteBeacon" has no trailing period. App icon, favicon and Android icons are generated from the same mark on white.
- Real email auth and PostgreSQL persistence are prepared through Supabase; demo does not simulate successful signup or claim accounts are stored.
- Nine supported US major-allergen groups; no custom allergy text, celiac classification or severity recommendation in v0.1.
- Never label products “safe.” Incomplete or unsupported-language data remains uncertain. Structured positives override missing fields; traces remain distinct. Limited English synonym detection is conservative and may flag negated statements.
- Positive barcode results use live Open Food Facts; deterministic fictional samples are separate explicit actions. No fallback from failed real lookup to fake product.
- Native camera scanning, manual lookup on web. UPC-E is detected but requires full UPC entry; expansion deferred.
- Demo profiles and history memory-only. Connected cloud profile private through RLS. No scan history table, no uploaded camera media.
- Image recognition deferred to opt-in label OCR with user verification. No inference that appearance proves allergen absence.

## Validation record

Latest final results recorded after implementation below. See `tests/` for repeatable checks.

- TypeScript compilation passed.
- 47 domain/parser/barcode/network and PostgreSQL policy tests passed.
- Browser employer flow passed: four outcomes, zero-selection block, profile update, history recalculation, invalid barcode, session clearing.
- Browser mobile flow passed at 390 × 844: navigation, no-result response, fictional result.
- Real browser API lookup passed for `3017620422003`, returning Nutella and an allergen signal for default profile. A custom request-header CORS failure was found and fixed.
- Production web export and iOS/Android JavaScript/Hermes bundle exports passed; Expo Doctor passed 21/21 compatibility/config checks. Bundle exports are not signed native app builds or device tests.
- `npm audit` reported zero known vulnerabilities after scoped xcode/uuid override; xcode UUID generation smoke test passed.
- Selene ran with 0 errors/warnings; no Lua/Luau application files exist, so TypeScript/Vitest are meaningful app checks.
- Desktop/mobile screenshots inspected; clipped mobile heading fixed with flexible title container. Decorative package art hidden on narrow screens to prioritize scanning.
- No Supabase hosted project configured. RLS migration tests run on PGlite PostgreSQL with simulated Auth roles/UID, not hosted Supabase.
- No physical iOS/Android device camera run, native release build, app-store deployment, external security audit or medical-content validation performed.

## Next acceptance gates

1. Employer-owned Supabase connection and all hosted checks in [setup](../docs/SUPABASE-SETUP.md).
2. Physical device: permissions denied/granted, EAN-8/EAN-13/UPC-A, duplicate suppression, poor light, no network, background/foreground, secure session restore, font scaling and screen-reader QA.
3. Pilot reliability: password recovery, email changes, native identifiers/signing/assets, provider identification/v3 migration and expanded parsing tests.
4. Production: expert matching review, legal/privacy review, security assessment, abuse protection, retention/backup/restore controls and distribution.

## Handoff index

- [Employer briefing](../docs/EMPLOYER-BRIEF.md)
- [Demo script](../docs/DEMO-SCRIPT.md)
- [Database setup](../docs/SUPABASE-SETUP.md)
- [Security details](../docs/SECURITY.md)

## Hosted setup progress — 2026-09-30

- Private GitHub repository created: https://github.com/derelffz/AllergyApp. Local `origin` points there.
- GitHub Actions checks TypeScript, 47 domain/database tests, deterministic browser tests and web export. Workflow has read-only repository permission and needs no Supabase secrets.
- Local pre-upload validation: TypeScript passed; 47 tests passed; two browser tests passed; live provider test intentionally skipped; web export passed; Selene reported zero issues.
- Supabase organization `allergy app` exists on Free plan. PantryCheck creation form prepared for East US (North Virginia), Data API enabled, automatic table exposure disabled and automatic RLS enabled. Project creation awaits user credential submission; schema and app connection are not deployed yet.

## Connected Supabase — 2026-09-30

- Project: PantryCheck (`ebfhthdlioufhebdmvgl`), organization `allergy app`, Free plan, East US (North Virginia).
- Private repository: https://github.com/derelffz/AllergyApp, production branch `main`, working directory `.`. Supabase GitHub integration enabled with production deployment; paid preview branching remains disabled.
- GitHub deployed and recorded migration `202609300001_profiles`. Do not rerun its CREATE statements manually.
- Hosted database verification passed: profiles RLS enabled and forced, four owner policies, anonymous SELECT and deletion RPC denied. Anonymous REST requests return 401 with permission-denied errors.
- `supabase/verify-hosted-rls.sql` passed against hosted database: synthetic owner insert, cross-user read/update/delete blocked, self-account deletion preserves other owner. Entire fixture transaction rolled back. This simulates database JWT identity; it does not replace two real confirmed-user REST sessions.
- Email/password enabled, email confirmation required, anonymous sign-ins disabled. Minimum password length set to 12. Site URL saved as `http://localhost:8081` for local development.
- Local ignored `.env` contains only project URL and publishable key. No database password, secret key or service_role key stored in app/repository.
- Remaining release gates: confirm actual email delivery and full signup/sign-in/profile flow, production SMTP/domain, production HTTPS URL, password recovery, native-device session/camera QA, backup/restore and other release gates above. Free built-in email service is not a production SMTP setup.

## Allergy layout and navigation accessibility — 2026-09-30

- Main content now has a bounded flexible scroll area; switching pages mounts a fresh scroll view so previous page scroll positions cannot hide new headings.
- Replaced tall allergy tiles with compact, full-width rows on phones. Wider layouts use percentage columns; large native font scales switch to one column. Labels wrap without truncation or fixed row heights.
- Allergy Save controls remain outside scrolling content, above navigation. Selection count, unsaved status, Reset changes and save/error feedback remain reachable while browsing all 15 choices. Reset restores saved selections; only successful Save changes assessment profile. Unsaved drafts survive navigation.
- Larger mobile navigation labels and padded targets; wrapping button labels/header; page heading semantics, live feedback and checkbox hints/disabled state. Explicit aria-checked fixes missing checked semantics in React Native Web while keeping native accessibilityState.
- Validation: TypeScript passed; all 47 domain/database tests passed; four deterministic Playwright flows passed, including 320 x 640 scrolling, last allergy reachability, persistent Save/feedback, reset, navigation scroll reset and 390 x 844 enlarged-label wrapping. Mobile screenshots inspected. Production web export passed.
- Browser enlarged-label fixture is not native font-scaling validation. Physical iOS/Android Dynamic Type, VoiceOver/TalkBack, keyboard and short-landscape acceptance remain pending. No Lua/Luau changed; Selene not applicable.

## Disputed barcode identity — 2026-09-30

- User reported Poland Spring bottle barcode `075720481279`. Direct Open Food Facts API lookup returned code `0075720481279`, brand `Hellmann's`, name `Light Mayonnaise`; zero prefix is equivalent GTIN representation, not a different product code. Physical package identity has not been independently verified.
- Quarantined this disputed GTIN, including equivalent 12/13/14-digit forms. Lookup now reports disputed identity with no assessment/history entry; no replacement ingredients or water record invented. Remove quarantine only after verifying package and corrected provider record.
- Live lookup requests provider `code` and rejects missing, invalid or conflicting returned codes. Matching code alone cannot guarantee accurate community product data.
- Camera/manual lookup now synchronizes scanned digits into barcode input for comparison with package.
- Validation: TypeScript passed, 55 unit/database tests passed, targeted browser regression passed (previous result cleared; disputed product absent from history). No Lua/Luau changes; Selene not applicable. Native camera still needs physical-device QA.

## Clear profile-save confirmation — 2026-09-30

- Save now displays a persistent green check panel titled `Profile saved` beside the pinned Save controls, with confirmation only after successful persistence. Demo text explicitly states that changes last for this session only; cloud success states that the profile was saved to the account.
- In-flight saves show a spinner and `Saving your allergy profile…`; errors remain visible in an amber panel. New edits/reset/navigation clear success feedback. Native success uses AccessibilityInfo announcement; web uses a live alert.
- Validation: TypeScript and all four deterministic browser flows passed, including visible success at 320 x 640, repeated Save and clearing confirmation on new edits. Native announcements and real signed-in network failure/latency still require device/hosted QA. No Lua/Luau changed.

## Barcode source accuracy — 2026-09-30

- User reported Open Food Facts inaccurate. Primary source now **USDA FoodData Central Branded Foods** (public domain; manufacturer-submitted label data via GS1 GDSN / Label Insight). Open Food Facts only when USDA has no exact GTIN match or USDA request fails. Result, history and About page name the source used.
- USDA search sends all equivalent GTIN spellings (14/13/12/8 digits); only records whose `gtinUpc` normalizes to the scanned GTIN are accepted (fuzzy search hits ignored). Newest `publishedDate` wins when several records share a GTIN.
- USDA has no structured allergen/trace fields. Assessment uses full manufacturer ingredient statement (usually includes FALCPA `Contains:` line). Empty ingredients → `allergensKnown: false` → “Not enough information”. Traces/cross-contact always shown unknown for USDA.
- USDA failure + Open Food Facts miss surfaces the USDA error, never “not found”.
- Key: `EXPO_PUBLIC_USDA_FDC_API_KEY` in `.env` (free signup). Falls back to `DEMO_KEY` (~10 req/hour/IP observed). api.data.gov keys are rate-limit IDs, not secrets, but ship in bundle; production should proxy via Supabase Edge Function.
- Poland Spring GTIN `075720481279` absent from USDA; quarantine kept.
- No free source is complete or guaranteed current (recipes change). Commercial options with broader coverage (Syndigo/1WorldSync, Nutritionix, GS1 Verified for identity only) need paid licenses; not integrated.
- Validation: TypeScript passed; 62 unit/database tests passed; 5 deterministic Playwright flows passed. Direct API check: Cheerios `016000275287` and Nutella `009800895007` returned exact manufacturer records. Live browser smoke (`RUN_LIVE=1`) exercised fallback because DEMO_KEY was throttled; USDA-in-browser path needs rerun with real key. No Lua/Luau changed; Selene not applicable.

## Restyle, haptics and interaction feedback — 2026-09-30

- User reported no sense that taps worked or lookups were processing. Added `expo-haptics` plus shared UI primitives in `src/ui/`: `theme.ts` (tokens, tones), `haptics.ts` (web no-op wrapper), `controls.tsx` (`Tap` spring-press + pressed tint + haptic, `Button` with loading spinner/variants, `Notice` tones, `Reveal` fade-in, `Skeleton`, animated `CheckMark`, `ToastProvider`). RN `Animated` only; no Reanimated.
- Haptic map: taps light; nav/toggles selection; Save/camera detection medium; save success = success; validation/not-found/traces/unknown = warning; contains/errors = error. **No-match results use a neutral light tap and info-blue styling, never success haptic or green check** — not a safety verdict.
- Lookup: button shows spinner + disabled; progress card with skeleton appears where result will land; screen auto-scrolls to progress/result. Scan-page errors render inline under Look up button (not top of page). Live barcode hint shows digit count and check-digit match before submit.
- Toasts: short transient confirmations (demo ready, result checked, history cleared, changes discarded, session cleared). `pointerEvents="none"`, no alert role, never duplicate on-page status text; native announces via AccessibilityInfo. Important outcomes always stay on screen.
- Result banner per kind: contains red, traces/unknown amber, no-match info blue; matched allergens as chips. History rows show kind icon/colour. Allergy save bar has selection progress meter.
- Layout stays flex/percentage; toast layer uses percentage insets; camera frame uses aspectRatio instead of fixed height.
- Validation: TypeScript passed; 62 unit/database tests passed; 6 deterministic Playwright flows passed (new `feedback.spec.ts`: progress state, disabled busy button, inline in-viewport outcome, toast, auto-scroll to result). Screenshots inspected at 1440, 390 and 320 widths plus enlarged-label fixture. Physical-device haptics, native animation feel and screen-reader toast announcements still need device QA. No Lua/Luau changed; Selene not applicable.

## Result evidence — 2026-10-08

- Results now show **Why this result**: one line per reason, grouped by allergen — a source allergen tag, a source trace tag, or the exact ingredient word that matched (for example `"whey" appears in the ingredients`). Matched words are highlighted in the ingredient text.
- Evidence comes from `explain()` and `highlightIngredients()` in `src/domain/allergens.ts`, which reuse the same tags, vocabulary and cocoa-butter exception as `assess()`; they explain a result and never change it. A unit test checks every allergen `assess()` reports has evidence. No-match results show no evidence block.
- Validation: TypeScript passed; 68 unit/database tests passed (6 new); 7 deterministic Playwright flows passed (new `evidence.spec.ts`), live test skipped. Screenshot `artifacts/evidence-mobile.png` inspected at 390 × 844. Screen-reader reading of highlighted words needs device QA. No Lua/Luau changed; Selene not applicable.

## Household profiles and Settings — 2026-10-14

- Account holder's allergies stay in `profiles`. New `household_members` table (migration `202610140001_household_members.sql`) stores up to 8 more people per account: name (1–40 chars) and 1–9 supported allergies. Owner-only RLS; `owner_id` comes from the caller JWT via column default and is not client-writable. Members are deleted with the account.
- `profiles` gains `display_name`, `default_everyone` and `default_member_id`. A composite foreign key keeps the default pointed at the caller's own member; removing that member resets the default to the account holder.
- Scan results: "Checking for" chips (Everyone or one person). Everyone shows a summary by the most serious outcome (contains > traces > unknown > no-match) plus one card per person with their reasons. One person shows the existing single result. Ingredient highlighting covers everyone being checked. History follows the current view. Never an all-clear wording; no-match cards keep the safe-to-eat caveat.
- New Settings tab: your name, add/edit/remove people (inline remove confirmation), default "Show results for". App details moved off the phone tab bar (five tabs fit 320 px) and opens from Settings; still in the desktop sidebar.
- Demo household: Alex (Peanuts, Tree nuts; account holder), Kha (Milk, Eggs), DFK (Sesame), Jonathan (Tree nuts, Soy), Nafis (Gluten, Mustard), Banjo (Eggs, Crustacean shellfish, Mollusks), BiteBeacon (Peanuts, Sesame), Capstone (Fish, Celery, Sulfites); 8 people, one slot left; default view Everyone. On Peanut Crunch Granola, 4 of 8 get a signal (Alex, Kha, Nafis via oats/gluten, BiteBeacon). Demo changes stay in memory.
- Validation: TypeScript passed; 80 unit/database tests passed (7 new PGlite RLS tests: owner stamping, cross-user hiding, spoofed owner refused, validation, 8-member cap, default ownership and reset, cascade on account deletion, anon blocked). 9 Playwright flows passed (new `household.spec.ts`); existing flows updated for the household demo. Hosted Supabase migration, real signed-in add/edit/remove, and device/screen-reader QA still pending. No Lua/Luau changed; Selene not applicable.

## Apple HIG design pass — 2026-10-14

- Restyle checked against Apple's Human Interface Guidelines (typography, color, accessibility, tab bars, buttons, branding). Wording unchanged apart from removed decorative eyebrows; "label first, never say safe" copy kept.
- Type follows iOS Dynamic Type Large sizes via `type` in `src/ui/theme.ts`: body 17, subhead 15, footnote 13, large title 34. Placeholder text darkened to #606F67 (4.5:1+); muted text #56655D (5.5:1 on canvas).
- Capsule buttons: filled primary, tinted secondary, no automatic arrow. Close, Edit profile, Exit demo and text links reach 44 pt hit targets.
- Household pieces follow the same rules: "Checking for" chips, Settings edit/remove buttons and "Show results for" rows reach 44 pt; person cards use the 15 pt subhead verdict.
- Phones: logo/breadcrumb top bar removed (brand shown once on welcome, page title says where you are); floating capsule tab bar with tinted selected tab; allergies shown as an inset grouped list with round checkmarks. Cards drop borders and heavy shadows. Sample cards lose 01–04 numbering.
- Dark mode: follows the device or browser appearance (`useScheme()` in `src/ui/theme.ts`, `userInterfaceStyle: automatic` in app.json, status bar `auto`); no in-app switch, per Apple's guidance. Styles are built once per appearance with `bothSchemes()`. Dark palette checked: body text 14.2:1, secondary 7.6:1, placeholder 5.6:1, every tone colour 7:1 or better on its tinted background. The hero keeps its deep green in both, so its lime button keeps dark ink.
- Validation (on top of evidence + family profiles): TypeScript passed; 80 unit/database tests passed; 11 deterministic Playwright flows passed (new `appearance.spec.ts` checks light and dark canvases with no page errors), live test skipped. Every phone screen inspected in light and dark at 390 × 844, plus 1440 wide. No Lua/Luau changed; Selene not applicable.

## Languages — 2026-10-14

- App text lives in `src/i18n/` (`en.ts` is the source; `es`, `zh`, `bn`, `vi` must have the same keys and `{placeholders}`, enforced by `tests/i18n.test.ts`). `makeI18n(lang)` gives `t`, plurals (`_one`/`_other`), list joining, and locale dates, times and digits.
- Settings has a Language card (native names: English, Español, 中文（简体）, বাংলা, Tiếng Việt). The device language is used until someone picks one; signed-in choices save to `profiles.language` (migration `202610140002_profile_language.sql`, null = follow device). Demo choice stays in memory; sign-out returns to the device language.
- Not translated: product names, brands and ingredient lists (shown as the source wrote them) and ingredient matching, which stays English. Domain code still produces English titles; the UI translates from the result kind, reason codes and lookup error codes.
- Translations are machine-drafted and need native-speaker review before launch, especially allergen names (regional peanut/sesame words in es and vi, crustacean shellfish in bn and zh) and every "not a safe-to-eat guarantee" line.
- Validation: TypeScript passed; 91 unit/database tests passed (new translation checks and a language RLS test); 13 Playwright flows passed (new `language.spec.ts`: switch to Español in Settings, start in Vietnamese from a vi-VN browser). Screenshots inspected in all five languages at 390 × 844. Device and screen-reader QA pending. No Lua/Luau changed; Selene not applicable.

## Pantry, expiry alerts and hidden-source evidence — 2026-10-15

- **Evidence rework** (`src/domain/allergens.ts`): each allergen now has `plain` words (its own name: milk, egg, peanut, soy, wheat, fish, sesame). Other vocabulary words are *hidden sources*. `explain()` emits `via: 'hidden'` for them ("\"whey\" comes from milk") and lists them first; a plain word is dropped when a tag already names that allergen, so no more "milk" twice. Ingredient text tags hidden words inline: `whey (milk)`. Tree nuts and crustacean shellfish have no plain words, so almond/shrimp always explain. Sample granola now lists `whey powder` (was milk powder) to show it. Assessment unchanged.
- **Pantry** (`src/domain/pantry.ts`, migration `202610150001_pantry_items.sql`): after any result, an **Add to pantry?** block takes an expiry date (In 1 week / 2 weeks / 1 month / No date, or typed YYYY-MM-DD; impossible dates refused). Items store a product snapshot (jsonb ≤ 20 KB) so the pantry rechecks allergens for the current view without a new lookup; snapshots are re-validated on load and anything malformed becomes `allergensKnown: false` (shows "Not enough information", never no-match).
- Expiry states use calendar days in local time: expired, today, soon (≤ 3 days), later, none. Overview shows a **Check your pantry** alert; Pantry tab gets a red dot (desktop: count). Alerts are in-app only; device push notifications are not built yet (would need `expo-notifications`).
- **Swipe**: `SwipeRow` in `src/ui/controls.tsx` (PanResponder, threshold = a third of row width). Right = used, left = thrown out. Visible "Used it"/"Threw out" buttons and screen-reader actions do the same. Capture handler steals horizontal drags from inner buttons; a `guard()` drops the click that ends a swipe on web.
- **History**: Recent scans page now has *Scans this session* (unchanged, memory only) and *Pantry history* (used/thrown out items, newest first, with Put back and Delete). Phone tab bar is Home, Scan, Pantry, Allergies, Settings; history opens from the Pantry page (desktop sidebar keeps it).
- DB: `pantry_items` owner-only RLS, `owner_id` from JWT default (not client-writable), status ∈ active/consumed/discarded with `closed_at` required iff not active, 300 rows per owner incl. history, cascades with account deletion. `verify-hosted-rls.sql` now checks pantry isolation too. Demo pantry is fictional, labelled, dated relative to today, memory only.
- New strings in all five languages (machine-drafted; needs native review).
- Validation: TypeScript passed; 102 unit/database tests passed (new pantry date tests, hidden-evidence tests, 5 PGlite pantry RLS tests); 15 Playwright flows passed (new `pantry.spec.ts`: alert, swipe, buttons, history put-back, date validation, add after scan, missing-data item; hidden-evidence flow), live test skipped. Screenshot `artifacts/pantry-mobile.png` inspected at 390 × 844; swipe also checked by hand in the browser pane. Hosted migration, native swipe feel and screen-reader actions need device QA. No Lua/Luau changed; Selene not applicable.

## Website readiness: browser scanning and staying signed in — 2026-10-15

- Team plans to host BiteBeacon as a website. `npm run build:web` exports static files to `dist/` (build command + output folder for Vercel/Netlify/Cloudflare Pages). `EXPO_PUBLIC_*` values are baked in at build time; set them in the host, not the repo.
- **Browser camera scanning** now works. expo-camera already scans on web through the BarcodeDetector API, falling back to the `barcode-detector` polyfill (zxing WebAssembly). The polyfill would fetch its decoder from a public CDN; `src/lib/webScanner.web.ts` points it at our own copy, `public/zxing_reader.wasm` (exported into `dist/`). `tests/webScanner.test.ts` fails if the copy no longer matches the installed package; refresh with `cp node_modules/zxing-wasm/dist/reader/zxing_reader.wasm public/`. `barcode-detector` pinned as a direct dependency (3.2.2, same as expo-camera).
- Camera needs a secure page (https or localhost) and `getUserMedia`; otherwise the Open camera button stays disabled with a note and typing the barcode still works. Chromium on Windows has no built-in BarcodeDetector, so the e2e test exercises the polyfill path.
- **Stay signed in** (`src/lib/supabase.ts`): web sign-in form has a checkbox, on by default. On: Supabase session saved in localStorage, survives reloads. Off: memory only, ends with the tab (shared computers); turning it off also removes stored `sb-*` keys. Choice remembered per browser. localStorage failures fall back to memory. Native unchanged (SecureStore). Tradeoff: a stored token can be read by any script injected into the page, so no third-party scripts should be added. `detectSessionInUrl` is on for web so the sign-up confirmation link signs people in.
- Copy updated in all five languages: sign-up consent now says pantry products are stored; App details explains browser sessions; web camera note.
- Hosting checklist still open: set Supabase Auth Site URL + redirect URLs to the domain; move USDA lookups behind a Supabase Edge Function so the key is not in the page; HTTPS (most hosts automatic). If the site is served from a sub-path, the decoder URL follows `document.baseURI`.
- Validation: TypeScript passed; 103 unit/database tests passed (new decoder-copy check); 17 Playwright flows passed, live skipped. New `web-camera.spec.ts` feeds Chromium a generated EAN-13 video as the camera and checks scan → lookup → result, with the decoder loaded from localhost only. New `stay-signed-in.spec.ts` mocks Supabase Auth/REST locally: stays signed in across reload, sign-out clears it, off ends it at reload, choice remembered. `npm run build:web` output checked for the decoder. Real phones/browsers (iOS Safari, Android Chrome) and the hosted domain still need QA. No Lua/Luau changed; Selene not applicable.

## Health disclaimer, privacy policy and terms — 2026-10-15

- Three static English pages in `public/` (`disclaimer.html`, `privacy.html`, `terms.html`, shared `legal.css`, light/dark). `expo export` copies them into `dist/`, so they're served at `/disclaimer.html` etc. beside the web app. Native opens `https://bitebeacon.org/<page>.html`.
- Privacy policy describes what the code actually stores: Supabase auth email/password hash, profile allergies + consent date, household names/allergies, language, pantry snapshots and expiry dates; scan history memory-only; camera frames not uploaded; barcodes (never allergies) sent to USDA then Open Food Facts; Netlify host logs; "Stay signed in" localStorage; in-app account deletion. Update it whenever data collection changes.
- App links (`openLegal` in `App.tsx`): Legal & safety card in App details; Terms + Privacy links under the sign-up consent checkbox; "Health disclaimer" link under the welcome disclaimer; footer disclaimer opens the health disclaimer. Sign-up consent text now ends with agreeing to the Terms and Privacy Policy (`consent_version` unchanged; the DB check pins it).
- New keys `legal.*` in all five dictionaries; non-English UIs note the pages are English only. Contact address on the pages is privacy@bitebeacon.org, which needs a real mailbox or forwarding. Not reviewed by a lawyer.
- Validation: TypeScript passed; 103 unit/database tests passed; 15 Playwright flows passed locally (web-camera flow needs CI's headless shell, live skipped). Built `dist/` contains the pages; screenshots checked at 390 × 844 in light and dark.

## Six more languages — 2026-10-15

- Added Traditional Chinese (`zh-Hant`, shown as 中文（繁體）, Taiwan wording, zh-TW dates), Haitian Creole (`ht`), Russian (`ru`), Korean (`ko`), French (`fr`) and Hindi (`hi`). Picker now lists 11 languages.
- Devices set to zh-TW, zh-HK, zh-MO or zh-Hant start in Traditional Chinese; other Chinese settings still start in Simplified.
- New migration `202610150002_more_languages.sql` widens the `profile_language` check to the new codes. Run it after `202610140002_profile_language.sql` on the hosted project.
- All six are machine-drafted (Traditional Chinese converted from the Simplified file) and need native-speaker review before launch. Points to check: Korean particles next to names (written as 을(를)); Russian "Древесные орехи" for tree nuts; Haitian Creole "pistach", "wowoli", "kontak kwaze"; Hindi long allergen labels and gendered verbs in the consent text; French "garde-manger" and (s) plural forms.
- Validation: TypeScript passed; 115 unit/database tests passed (translation checks for every language, a `zh-Hant` save test); 16 Playwright flows passed including a new zh-TW device test (web-camera flow could not launch its browser in the cloud sandbox, unrelated). Screens checked in all six languages at 390 × 844.

## Six more allergens (15 in total) — 2026-10-15

- Added **gluten, mollusks, mustard, celery, sulfites, lupin** to `ALLERGENS` (`src/domain/allergens.ts`). Together with the nine US majors this completes the EU/UK, Canada and Australia lists. Open Food Facts tags all six (`en:gluten`, `en:molluscs`, `en:mustard`, `en:celery`, `en:sulphur-dioxide-and-sulphites`, `en:lupin`); USDA products are matched by ingredient words only.
- **Gluten** covers every gluten grain (wheat words plus barley, rye, oats, malt, triticale, kamut, seitan, einkorn, emmer, farro) for celiac users. **Wheat** stays wheat-only, so a product tagged only "gluten" still reads "Not enough information" for Wheat. Sulfites also match E220–E228.
- `explain()` now scans each selected allergen separately, so a word shared by two allergens ("wheat" for Wheat and Gluten) is evidence for both.
- Migration `202610150005_more_allergens.sql` widens `supported_allergies` (profiles) and `member_supported_allergies` (household members) to the 15 ids and 1–15 entries. Until it runs on the hosted project, saving a new allergen to a signed-in profile fails; demo mode works without it.
- Allergy page intro and notice rewritten (Wheat vs Gluten, Crustacean shellfish vs Mollusks). Machine-drafted translations in all 11 languages; need native review. Migration is numbered 0005 so it runs after `more_languages` (0002) and `default_view_people` (0004).

## Phone browsers: page scroll and pinned tab bar — 2026-10-15
- Problem: on phone-width web the app scrolled inside its own ScrollView, so mobile Safari/Chrome never collapsed their address bar and toolbar.
- Now, on web below the desktop breakpoint (signed in or demo), the document itself scrolls: App.tsx swaps the page ScrollView for a View and injects CSS that lifts Expo's `body { overflow: hidden }` reset. The tab bar (and the Allergies save bar) sit in a `position: fixed` bottom container; its measured height pads the page so the last content clears it. Page changes scroll to top; the scan result still auto-scrolls into view.
- `public/index.html` is Expo's default template plus `viewport-fit=cover`, so the tab bar pads by the iPhone home-indicator safe area. Desktop (sidebar) and native apps unchanged; the welcome/sign-in screen still uses its inner ScrollView.
- Validation: TypeScript passed; 137 unit tests passed. Exported web build checked in Chromium at iPhone 13 size (document scrolls, tab bar pinned, Allergies save bar above it, result auto-scroll) and 1400 × 900 (unchanged, body not scrollable). Real iPhone Safari bar-collapse needs device QA.

## App polish batch (2026-10-15)
- **Title Case product names**: `src/domain/names.ts` `titleCase()` turns names and brands from USDA (often ALL CAPS) and Open Food Facts (often lowercase) into Title Case at parse time, and re-applies it to stored pantry snapshots on load. Mixed-case words (McVitie's), short no-vowel acronyms (BBQ) and small joining words (and, with, of) are kept. Samples are written in Title Case. Allergen names are unchanged.
- **Allergies page**: nav label is "Allergies" (all 11 languages) and the page title is the same word. With a household, a name switcher at the top picks whose list the page shows; a member's list saves to `household_members` (same row the Settings member form edits). Leaving the page returns it to your own list.
- **Phone card heights**: cards in `columns` and the sample grid only get `flex` when wide. In the phone column a flex basis of 0 (worse since document scroll, PR #10) squeezed cards shorter than their content, clipping the home "Household" row and spilling the Scan sources caption under the lookup card.
- **Language picker** in Settings is a dropdown: a button naming the current language opens the 11-language list.
- Note: the "Try a sample instead" card on Scan and the sample tiles on Home also show to signed-in users, not only in demo.
- Validation: TypeScript, unit tests and the Playwright suite (incl. new switcher and card-height checks) pass in Chromium.

## Samples are demo-only (2026-10-15)
- Signed-in people no longer see the fictional samples: the Home sample tiles and the Scan "Try a sample instead" card render only in demo mode. On Scan, the "only the barcode is sent" privacy line moves into the lookup card when the sample card is hidden. Demo pantry still uses the samples.
- Validation: TypeScript, 141 unit tests and the Playwright suite pass (demo flows); signed-in layout checked by forcing the non-demo branch locally (not committed).

## Scan total and admin dashboard (2026-10-15)
- **Scan total**: migration `202610150006_admin_stats.sql` adds a one-row `scan_total` table and `record_scan()` (no arguments, granted to `anon` and `authenticated`). `scan()` in `App.tsx` calls it (via `src/lib/stats.ts`, fire and forget) after every lookup that finishes, found or not found, from the camera or typed, signed in or in the demo. Taps on fictional samples go straight to `showProduct` and are not counted. Failed lookups (invalid barcode, network error) are not counted. No barcode, product or user is stored; nobody can read or change the table directly. Privacy policy updated to say so. Needs Supabase configured on the site; without it nothing is sent.
- **Admins**: `public.admins(user_id)` has no app grants at all, so accounts are made admins only from the Supabase dashboard (Table Editor, or `insert into public.admins(user_id) select id from auth.users where email = '…';` in the SQL editor). `is_admin()` tells the app whether to show the dashboard; nothing in the repo names an admin.
- **Dashboard**: page `admin` (sidebar item on wide screens, "Admin dashboard" row in Settings everywhere; hidden from the phone tab bar and in the demo). Reads `admin_stats()`, a security-definer function that refuses non-admins and returns totals: scans, accounts, sign-ups (7/30 days and per day for 30 days), sign-ins (1/7/30 days), 50 most recent sign-ins (email and dates only), people per allergen (account holders + members), household sizes, languages, pantry counts. Refreshes every 10 s while open. `src/domain/stats.ts` parses the JSON defensively.
- Run this migration after every earlier one (it reads `pantry_items` and `household_members`).
- Validation: TypeScript, unit tests (incl. new database tests for counting, admin lock-out and totals) and the Playwright suite.

## Pastel liquid-glass branding — 2026-10-15

- The existing theme centralizes icy-blue actions, lavender secondary controls, rose chips, warm accents, translucent gradients and light/dark neutral surfaces. Legacy accent token names remain for compatibility. Warning states stay amber; errors and destructive actions stay red.
- Home uses a diffused multicolor hero and the supplied transparent logo at `assets/bitebeacon-original.png`. The 1312 × 1199 RGBA PNG is copied unchanged, with SHA-256 `c23ee0b03496fc8509fbb696ff46dfa9777006524fff8daea075c59c2dec96cb`. Desktop web uses proportional `contain` sizing with no backing panel, tint, filters, rotation or blend mode. The existing compact layout still hides the hero artwork on phones; small header/sidebar marks remain unchanged.
- Pantry cards have brighter directional fills, inset outlines and soft shadows without changing their dimensions or spacing. Rose-gradient discard actions retain red labels/icons, and expiry text, statuses, swipe actions and fictional-demo labels remain intact.
- Household management remains in Settings. Initial avatars cycle through eight pastel gradients with charcoal initials, based on display order; profile identity and stored data are unaffected. Allergen badges and selected options use slightly deeper pastel tints for clarity.
- Navigation, responsive rules, typography, spacing, authentication, persistence and allergen business logic are unchanged. No dependencies or lockfiles changed. Appearance tests retain Auto/device following, manual overrides, persistence and browser-error checks, and add logo byte-integrity/proportion checks, gradient/destructive-state checks and avatar/edge checks in both appearances.
- Validation: `npm run check` passed TypeScript and all 154 unit/database tests; `npm run build:web` passed. The browser suite passed 24 tests, with seven existing hosted/opt-in tests skipped. Cloud browser validation used installed Chromium with a local configuration override; the repository's Playwright configuration is unchanged. Generated screenshots and local helper files are excluded from version control.
- Desktop/mobile screens were visually reviewed without horizontal overflow. Bounded palette checks verified affected text/gradient endpoints at 4.5:1 or better. Native device rendering and hosted Supabase acceptance remain separate gates.
