# Company OS — Central Admin

An interactive Next.js UI prototype with browser-local department workflows for a company's internal operations platform.

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
- Sales & CRM: opportunity pipeline, list/contact views, create/edit forms, stage changes, notes and history.
- Finance: create/edit invoices, record sent/paid states, invoice CSV export, expense requests and approvals.
- People: employee directory/profiles, create/edit employee records, leave requests and approval decisions.
- Projects: project records, progress/milestones, task creation and task status boards with working filters.
- Support: ticket creation/editing, assignment, priority, resolution/reopening and internal notes.
- Inventory: item catalog, reorder levels, validated stock receipts/issues, and searchable movement history.
- Reports: current department snapshots and CSV exports; synthetic historical revenue charts are explicitly separate.
- Settings: browser-local preferences, editable demo role matrix and demo members. Permissions are a design preview, not real enforcement.
- Cross-module search with keyboard navigation and Ctrl/Cmd K shortcut.
- Approval details and local approve/decline decisions.
- Task creation, validation, and task listing.
- CSV performance report export.
- Notifications, profile, workspace information, and browser-local preferences.
- Responsive desktop/tablet/mobile layouts and accessible native dialogs.

## Integration boundary

All identities and seeded business records are fictional demonstration data. Records, tasks, approval decisions, activity, preferences, and access-design previews use versioned localStorage and survive refresh on the same browser and origin. Storage is validated when loaded. A visible notice explains storage failures, and Settings provides a confirmed reset of this demo's data only. No real company records are changed and no messages are sent.

Node.js, Express, Supabase, real authentication, access control, and Zoho migration remain future backend work. These are core demonstration workflows, not production accounting, payroll, or complete replacements for every Zoho application.

`lib/data.ts` defines overview samples and shared types; `lib/operations.ts` owns record validation, transitions, inventory arithmetic, summaries and exports; `lib/use-browser-state.ts` handles browser storage; `components/` contains the shell and workflows. Replace the demo store with authenticated API access when building the backend. Never put server secrets or privileged Supabase keys in client code.

The Sites identity is retained in `.openai/hosting.json` for the private preview. Design and implementation documents are in the parent workspace's `docs/superpowers/` folder.
