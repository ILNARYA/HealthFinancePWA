/**
 * ==============================================================================
 * Google Apps Script — Web App REST API для «Здоровье и Финансы (Семейная БД)»
 * ==============================================================================
 * 
 * Инструкция по подключению:
 * 1. Откройте таблицу: https://docs.google.com/spreadsheets/d/1XPqCC1SKJYuJ2_guAciuqscGgWglku4zXZGmF6VTzcw/edit
 * 2. В меню выберите: Расширения (Extensions) -> Apps Script
 * 3. Вставьте данный код в редактор и нажмите «Сохранить» (Ctrl+S / Cmd+S)
 * 4. Нажмите «Развернуть» (Deploy) -> «Новое развертывание» (New deployment)
 * 5. Тип: «Веб-приложение» (Web app)
 * 6. Доступ (Who has access): «Все» (Anyone)
 * 7. Скопируйте полученный Web App URL для синхронизации в реальном времени!
 */

const SHEET_NAMES = {
  USERS: 'Пользователи_и_Семья',
  BIOMARKERS: 'Анализы_и_Биомаркеры',
  EXPENSES: 'Медицинские_Расходы',
  SCORES: 'Индекс_Здоровья_Сводка',
  INVITES: 'Семейные_Инвайты'
};

function doGet(e) {
  const table = e.parameter.table || 'users';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetName = SHEET_NAMES.USERS;

  if (table === 'biomarkers') sheetName = SHEET_NAMES.BIOMARKERS;
  else if (table === 'expenses') sheetName = SHEET_NAMES.EXPENSES;
  else if (table === 'scores') sheetName = SHEET_NAMES.SCORES;
  else if (table === 'invites') sheetName = SHEET_NAMES.INVITES;

  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = data[0];
  const rows = data.slice(1);
  const result = rows.map(row => {
    const item = {};
    headers.forEach((h, i) => {
      item[h] = row[i];
    });
    return item;
  });

  return ContentService.createTextOutput(JSON.stringify({ success: true, count: result.length, data: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const table = payload.table || 'expenses';
    const record = payload.data;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    let sheetName = SHEET_NAMES.EXPENSES;
    if (table === 'users') sheetName = SHEET_NAMES.USERS;
    else if (table === 'biomarkers') sheetName = SHEET_NAMES.BIOMARKERS;
    else if (table === 'scores') sheetName = SHEET_NAMES.SCORES;
    else if (table === 'invites') sheetName = SHEET_NAMES.INVITES;

    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Sheet not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(h => record[h] !== undefined ? record[h] : '');
    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Record appended', table }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
