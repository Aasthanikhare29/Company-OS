# Company OS — Central Admin

An interactive Next.js UI prototype for a company-wide internal operations platform.

## Run locally

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000.

## Checks

```sh
npm test
npm run typecheck
npm run build
```

The production build is statically exported to `out/`.

## Included

- Company overview with revenue/expense chart, reporting periods, attention queue, department health, project progress, and activity.
- Sales & CRM, Finance, People, Projects, Support, Inventory, Reports, and Settings screens.
- Cross-module search with keyboard navigation and Ctrl/Cmd K shortcut.
- Approval details and local approve/decline decisions.
- Task creation, validation, and task listing.
- CSV performance report export.
- Notifications, profile, workspace information, and session-only preferences.
- Responsive desktop/tablet/mobile layouts and accessible native dialogs.

## Integration boundary

All identities and business records are fictional demonstration data. Tasks, approval decisions, notifications, and preferences are held in browser memory and reset on refresh. Nothing changes real company records or sends messages.

Node.js, Express, Supabase, authentication, access control, and Zoho migration remain future backend work. UI modules are representative summaries, not complete replacements for every Zoho application.

`lib/data.ts` defines demo records and shared types; `lib/workspace.ts` contains state helpers; `components/` contains the shared shell and views. Replace demonstration sources with authenticated API access when building the backend. Never put server secrets or privileged Supabase keys in client code.

The Sites identity is retained in `.openai/hosting.json` for the private preview. Design and implementation documents are in the parent workspace's `docs/superpowers/` folder.
