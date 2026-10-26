# Web sources

Edit files here, then run `npm run build` and `npm run verify:release`.

- `index.template.html`: accessible screen markup and static release stamps
- `styles.css`: screen styles
- `app.js`: application state, navigation, composer and remaining features
- `modules/library.js`: server search, pagination, loading/error and stale-response guards
- `modules/questions.js`: partner answer groups, answer/edit actions and history
- `modules/photos.js`: photo cache, image loading and photo viewer
- `modules/health.js`: health logs, charts and birth plan
- `modules/labor.js`: contraction timer and record saving
- `modules/settings.js`: settings, backup status and logout cleanup
- `modules/api.js`: authenticated transport and compatibility routing

The build inserts modules into the existing IIFE scope. This is source organization,
not runtime isolation: shared state and helpers remain available. The deployed
`index.html` contains its complete CSS/JavaScript so existing Android OTA shells
and offline PWA updates keep receiving one document. Do not edit generated HTML.
Release verification checks exact source/output agreement before other checks.
