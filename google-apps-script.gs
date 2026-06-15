const SHEET_NAME = '';
const MAX_COLUMNS = 24;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const record = payload.record || {};
    if (!record.id) throw new Error('record.id is required');

    const sheet = getTargetSheet_();
    const rowIndex = findRowById_(sheet, record.id);
    const row = buildRow_(record, rowIndex ? getExistingRow_(sheet, rowIndex) : []);

    if (rowIndex) {
      sheet.getRange(rowIndex, 1, 1, MAX_COLUMNS).setValues([row]);
    } else {
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, MAX_COLUMNS).setValues([row]);
    }

    return json_({ ok: true, id: record.id, row: rowIndex || sheet.getLastRow() });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  } finally {
    lock.releaseLock();
  }
}

function getTargetSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (SHEET_NAME) return spreadsheet.getSheetByName(SHEET_NAME);
  return spreadsheet.getSheets()[0];
}

function findRowById_(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (!lastRow) return 0;
  const values = sheet.getRange(1, 1, lastRow, 1).getValues();
  const target = String(id);
  for (let index = 0; index < values.length; index += 1) {
    if (String(values[index][0]) === target) return index + 1;
  }
  return 0;
}

function getExistingRow_(sheet, rowIndex) {
  const row = sheet.getRange(rowIndex, 1, 1, MAX_COLUMNS).getValues()[0];
  while (row.length < MAX_COLUMNS) row.push('');
  return row;
}

function buildRow_(record, existingRow) {
  const row = existingRow.slice(0, MAX_COLUMNS);
  while (row.length < MAX_COLUMNS) row.push('');

  row[0] = text_(record.id);
  row[1] = text_(record.date);
  row[2] = text_(record.sessionType);
  row[3] = text_(record.mode);
  row[5] = text_(record.project);
  row[6] = numberOrText_(record.durationMinutes);
  row[12] = text_(record.summary);
  row[13] = text_(record.issues);
  row[14] = text_(record.followUp);
  row[15] = text_(record.terms);
  row[16] = text_(record.tags);
  row[17] = text_(record.memo);
  row[18] = text_(record.team);
  row[19] = text_(record.requester);
  row[20] = text_(record.meetingLink);
  row[21] = text_(record.startTime);
  row[22] = text_(record.endTime);
  row[23] = text_(record.updatedAt);

  return row;
}

function text_(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function numberOrText_(value) {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(value);
  return Number.isFinite(number) ? number : String(value);
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
