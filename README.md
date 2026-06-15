# Interpretation Journal

Single-page interpretation journal app with optional Google Sheets sync.

## Google Sheets sync setup

1. Open the target Google Sheet.
2. Go to `Extensions` > `Apps Script`.
3. Replace the script contents with `google-apps-script.gs` from this repo.
4. Click `Deploy` > `New deployment`.
5. Select type `Web app`.
6. Set:
   - Execute as: `Me`
   - Who has access: `Anyone`
7. Deploy and copy the Web app URL ending in `/exec`.
8. Open the journal app, click `동기화`, paste the Web app URL, enable automatic sync, and save.

When a journal entry is saved, the app sends it to the Apps Script endpoint. The script upserts by the entry ID in column A. It preserves legacy score/language columns where possible and writes newer fields such as team, requester, meeting link, start time, end time, and updated time in columns S:X.

On Vercel, saves go through `/api/sync` so the app can keep failed records in the pending queue when Apps Script returns an error. Local static previews fall back to direct Apps Script posting.
