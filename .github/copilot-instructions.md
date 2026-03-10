# Copilot Custom Instructions — Business First Aid

## Hard Rules (never break these)

### Typography
- **NEVER use the em dash character `—` anywhere.** Not in UI strings, code comments, test descriptions, page titles, scripts, or documentation.
  - Use a comma, colon, or pipe `|` depending on context:
    - Title separators: `|` (e.g. `"Results | Business First Aid"`)
    - Sentence continuation: `,` (e.g. `"Optional, but helps..."`)
    - Score/label separators in code: `|`
  - This rule applies to ALL languages including Hebrew.

### Branding
- **NEVER use negative or victimizing language** about businesses.
  - Forbidden: "your business is hurting", "העסק שלך סובל", or any variation implying the business is suffering, dying, failing.
  - Use supportive, empowering language: "revive", "grow", "fix", "recover", "forward".

### Git
- The default/production branch is **`main`** (not `master`).
- Always push to and deploy from `main`.

## Stack
- Next.js App Router (v16), TypeScript, Prisma, Neon PostgreSQL
- Deployed on Vercel, custom domain `businessaid.tsaela.com`
- i18n: custom React Context in `lib/i18n.ts` supporting `en` and `he` (RTL)

## Validation
- Run `powershell -ExecutionPolicy Bypass -File check-vercel.ps1` to verify `main = production`.
