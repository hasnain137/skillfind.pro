
# SkillFind Translation System Documentation

## Overview
SkillFind uses a **Hybrid Translation System** designed for speed and flexibility.
- **Developers**: Use standard file-based translations (`messages/en.json`) for speed and Git versioning.
- **Admin/Marketing**: Can update text instantly via the **Admin Panel** (`/admin/translations`), which saves to the Database.
- **Runtime**: The app merges file translations + DB overrides on every request (cached).

## Key Components

### 1. File Structure
- `messages/en.json`: The source of truth. Developers write keys here.
- `messages/fr.json`: The target translation file.
- `src/i18n/request.ts`: The logic that loads JSON files AND database overrides, merging them together.

### 2. Admin Translation Manager
Located at: `https://[your-domain]/admin/translations`
- **Features**: Search keys, filter by missing translations, edit text live.
- **Backing**: Saves to the `Translation` table in PostgreSQL.

### 3. Workflow for Developers

#### Adding New Text
1.  Open `messages/en.json` and add your key:
    ```json
    "MyComponent": { "title": "Hello" }
    ```
2.  Use it in code:
    ```tsx
    const t = useTranslations('MyComponent');
    return <h1>{t('title')}</h1>
    ```
3.  **SYNC TO ADMIN PANEL** (Crucial Step):
    Run this command to generic DB entries so Admins can see/edit it:
    ```bash
    npm run i18n:sync
    ```
4.  Adding French?
    Add it to `messages/fr.json` OR let the Admin do it via the UI.

### 4. Scripts & Commands

| Command | Description |
| :--- | :--- |
| `npm run i18n:sync` | **Required**. Scans your `en.json` and upserts all keys to the Database. Run after adding new keys. |
| `npm run i18n:check` | **CI/CD**. Fails if a key exists in `en.json` but is missing in `fr.json`. Use before deploying. |
| `npm run i18n:pseudo` | **Testing**. Generates `en-XA.json` with expanded text (e.g. `[!!! Hello !!!]`) to test UI responsiveness. |

### 5. Troubleshooting / Common Errors

#### "My new key isn't showing in the Admin Panel"
**Cause**: You forgot to run `npm run i18n:sync`.
**Fix**: Run the script.

#### "I see [fr] prefixes in the UI"
**Cause**: Debug mode or old database entries.
**Fix**: Check the database overrides. If you edited text in the Admin Panel, that overrides `en.json`.

#### "The UI looks broken in French"
**Cause**: Text expansion.
**Fix**: Use `npm run i18n:pseudo` to test layout locally. Use `min-width` and `flex-wrap`.

#### "Build failed on i18n:check"
**Cause**: You added an English key but didn't add the matching French key.
**Fix**: Add the key to `messages/fr.json` (even empty string is better than missing).

## Error Monitoring
If the database connection fails, the system falls back to File-based translations automatically (`src/i18n/request.ts` catches DB errors).
