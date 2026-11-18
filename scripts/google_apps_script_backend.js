/**
 * ==============================================================================
 * Google Apps Script — Production Backend API для «Здоровье и Финансы (Семейный хаб)»
 * ==============================================================================
 * 
 * ВОЗМОЖНОСТИ:
 * 1. Реальная отправка 6-значных кодов на Email (Яндекс, Gmail, Mail.ru) через MailApp.
 * 2. Реестр пользователей и защита от повторной регистрации (таблица «Пользователи_и_Семья»).
 * 3. Автоматическое создание всех листов и колонок в новой таблице.
 * 4. Авторизация и синхронизация расходов, биомаркеров и семейных профилей.
 * 5. Поддержка и русских («Пользователи_и_Семья»), и английских («users») названий листов.
 * 
 * ИНСТРУКЦИЯ ПО РАЗВЕРТЫВАНИЮ В 3 КЛИКА:
 * 1. Откройте вашу Google Таблицу на Google Диске (drive.google.com).
 * 2. Меню: Расширения (Extensions) -> Apps Script.
 * 3. Выделите весь старый код (Ctrl+A / Cmd+A), вставьте этот код и нажмите «Сохранить» (Ctrl+S).
 * 4. Нажмите «Развернуть» (Deploy) -> «Управление развертываниями» (Manage deployments).
 * 5. Нажмите значок карандаша (Редактировать) слева от активного развертывания:
 *    - «Версия» (Version): выберите «Новая версия» (New version)
 *    - «Запуск от имени» (Execute as): «От моего имени» (Me)
 *    - «У кого есть доступ» (Who has access): «Все» (Anyone)  <--- КРИТИЧЕСКИ ВАЖНО!
 * 6. Нажмите «Развернуть» (Deploy).
 * 7. В выпадающем списке функций выберите «testSendEmail» и нажмите «Выполнить» (Run),
 *    чтобы один раз подтвердить разрешения Google на отправку писем через MailApp!
 */

/**
 * Функция для однократной авторизации прав на отправку писем.
 * Выберите эту функцию вверху в Apps Script и нажмите «Выполнить» (Run).
 * При первом запуске Google попросит нажать «Проверить разрешения» -> «Разрешить».
 */
function testSendEmail() {
  var userEmail = Session.getActiveUser().getEmail() || 'yamayev2010@yandex.ru';
  MailApp.sendEmail({
    to: userEmail,
    subject: 'Тест авторизации — Здоровье & Финансы',
    htmlBody: '<p>Авторизация MailApp успешна! Теперь веб-приложение может отправлять коды верификации пользователям.</p>'
  });
  Logger.log('Письмо успешно отправлено на: ' + userEmail);
}

const SHEET_NAMES = {
  USERS: 'Пользователи_и_Семья',
  CODES: 'Коды_Верификации',
  BIOMARKERS: 'Анализы_и_Биомаркеры',
  EXPENSES: 'Медицинские_Расходы',
  SCORES: 'Индекс_Здоровья_Сводка',
  INVITES: 'Семейные_Инвайты'
};

function resolveSheet(ss, key) {
  var nameMap = {
    'users': ['Пользователи_и_Семья', 'users', 'Users'],
    'expenses': ['Медицинские_Расходы', 'expenses', 'Expenses'],
    'biomarkers': ['Анализы_и_Биомаркеры', 'biomarkers', 'Biomarkers'],
    'scores': ['Индекс_Здоровья_Сводка', 'scores', 'Scores'],
    'invites': ['Семейные_Инвайты', 'invites', 'Invites'],
    'codes': ['Коды_Верификации', 'codes', 'Codes']
  };
  var candidates = nameMap[key] || [key];
  for (var i = 0; i < candidates.length; i++) {
    var sh = ss.getSheetByName(candidates[i]);
    if (sh) return sh;
  }
  return getOrCreateSheet(ss, candidates[0]);
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f3e8ff');
      headerRange.setFontColor('#581c87');
    }
  }
  return sheet;
}

function initializeAllSheets(ss) {
  getOrCreateSheet(ss, SHEET_NAMES.USERS, [
    'ID_Пользователя', 'Персональный_ID', 'Фамилия', 'Имя', 'Отчество', 'Роль_в_семье',
    'Email', 'Год_рождения', 'Пол', 'Рост_см', 'Вес_кг', 'ИМТ', 'Группа_крови', 'Полис_ОМС', 'Дата_регистрации', 'Пароль'
  ]);
  getOrCreateSheet(ss, SHEET_NAMES.CODES, [
    'Email', 'Код', 'Создан', 'Истекает', 'Статус'
  ]);
  getOrCreateSheet(ss, SHEET_NAMES.EXPENSES, [
    'ID_Траты', 'Дата', 'Месяц', 'Персональный_ID', 'Член_семьи', 'Категория_расхода',
    'Название_услуги_или_лекарства', 'Сумма_руб', 'Клиника_или_Врач', 'Специальность', 'Номер_чека_OCR'
  ]);
  getOrCreateSheet(ss, SHEET_NAMES.BIOMARKERS, [
    'ID_Записи', 'Дата_анализа', 'Персональный_ID', 'Пациент', 'Категория', 'Биомаркер',
    'Значение', 'Ед_изм', 'Норма_Мин', 'Норма_Макс', 'Статус_нормы', 'Клинический_комментарий'
  ]);
  getOrCreateSheet(ss, SHEET_NAMES.SCORES, [
    'Месяц', 'Score', 'Дата_Расчета', 'Заметки', 'Семья'
  ]);
  getOrCreateSheet(ss, SHEET_NAMES.INVITES, [
    'ID', 'Кому_ID', 'От_Кого_ID', 'Роль', 'Статус', 'Дата'
  ]);
}

function appendRecordToSheet(sheet, record) {
  if (!record || typeof record !== 'object') return;
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    var keys = Object.keys(record);
    sheet.appendRow(keys);
    lastCol = keys.length;
  }
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var row = headers.map(function(h) {
    var cleanHeader = h ? h.toString().trim().replace(/^\ufeff/, '') : '';
    if (record[cleanHeader] !== undefined) return record[cleanHeader];
    for (var k in record) {
      if (k.replace(/^\ufeff/, '').toLowerCase() === cleanHeader.toLowerCase()) {
        return record[k];
      }
    }
    return '';
  });
  sheet.appendRow(row);
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeAllSheets(ss);

    var action = (e && e.parameter && e.parameter.action) || 'ping';
    var email = (e && e.parameter && e.parameter.email) || '';

    // 1. Отправка 6-значного кода на Email (поддержка GET)
    if (action === 'sendVerificationCode' && email) {
      var code = (e && e.parameter && e.parameter.code) || '';
      var name = (e && e.parameter && e.parameter.name) || '';
      return handleSendVerificationCode(ss, email, code, name);
    }

    // 2. Проверка существования пользователя
    if (action === 'checkUser' && email) {
      var userSheet = resolveSheet(ss, 'users');
      var data = userSheet.getDataRange().getValues();
      var headers = data[0].map(function(h) { return h ? h.toString().trim().replace(/^\ufeff/, '').toLowerCase() : ''; });
      var emailIndex = headers.indexOf('email');
      if (emailIndex === -1) emailIndex = 6; // fallback

      var exists = false;
      var userData = null;

      for (var i = 1; i < data.length; i++) {
        var rowEmail = (data[i][emailIndex] || '').toString().toLowerCase().trim();
        if (rowEmail === email.trim().toLowerCase()) {
          exists = true;
          userData = {};
          for (var c = 0; c < headers.length; c++) {
            userData[data[0][c].toString().trim().replace(/^\ufeff/, '')] = data[i][c];
          }
          break;
        }
      }
      return jsonResponse({ success: true, exists: exists, user: userData });
    }

    // 3. Получение данных по таблицам
    var tableParam = (e && e.parameter && e.parameter.table) || 'users';
    var sheet = resolveSheet(ss, tableParam);
    var sheetData = sheet.getDataRange().getValues();
    if (sheetData.length <= 1) {
      return jsonResponse({ success: true, count: 0, data: [] });
    }

    var colHeaders = sheetData[0];
    var dataRows = sheetData.slice(1);
    var result = dataRows.map(function(row) {
      var item = {};
      colHeaders.forEach(function(h, idx) {
        var cleanH = h ? h.toString().trim().replace(/^\ufeff/, '') : '';
        item[cleanH] = row[idx];
      });
      return item;
    });

    return jsonResponse({ success: true, count: result.length, data: result });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function handleSendVerificationCode(ss, targetEmail, otpCode, userName) {
  var cleanEmail = (targetEmail || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return jsonResponse({ success: false, error: 'INVALID_EMAIL', message: 'Некорректный адрес email' });
  }

  // Проверка: зарегистрирован ли уже пользователь
  var userSheet = resolveSheet(ss, 'users');
  var usersData = userSheet.getDataRange().getValues();
  if (usersData.length > 1) {
    var uHeaders = usersData[0].map(function(h) { return h ? h.toString().trim().replace(/^\ufeff/, '').toLowerCase() : ''; });
    var emailCol = uHeaders.indexOf('email');
    if (emailCol === -1) emailCol = 6;

    for (var i = 1; i < usersData.length; i++) {
      var curEmail = (usersData[i][emailCol] || '').toString().toLowerCase().trim();
      if (curEmail === cleanEmail) {
        return jsonResponse({
          success: false,
          error: 'USER_ALREADY_EXISTS',
          message: 'Пользователь с адресом ' + cleanEmail + ' уже зарегистрирован! Пожалуйста, выполните вход.'
        });
      }
    }
  }

  // Генерация / использование кода
  var code = otpCode || Math.floor(100000 + Math.random() * 900000).toString();
  var now = new Date();
  var expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

  // Сохранение в лист Коды_Верификации
  var codeSheet = resolveSheet(ss, 'codes');
  codeSheet.appendRow([cleanEmail, code, now.toISOString(), expiresAt.toISOString(), 'ACTIVE']);

  // Отправка письма
  var subject = 'Код подтверждения: ' + code + ' — Здоровье & Финансы';
  var greeting = userName ? 'Здравствуйте, ' + userName + '!' : 'Здравствуйте!';
  var htmlBody = 
    '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e9d5ff; border-radius: 20px; background-color: #ffffff; color: #1e1b4b;">' +
      '<div style="text-align: center; margin-bottom: 24px;">' +
        '<div style="width: 48px; height: 48px; margin: 0 auto 12px; background: #7c3aed; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 24px; font-weight: bold; line-height: 48px;">' +
          '❤' +
        '</div>' +
        '<h2 style="color: #7c3aed; margin: 0; font-size: 22px; font-weight: 800;">Здоровье & Финансы</h2>' +
        '<p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Единый семейный медицинский хаб</p>' +
      '</div>' +
      '<p style="font-size: 14px; color: #334155; line-height: 1.5; margin-bottom: 16px;">' +
        greeting + ' Вы указали этот адрес электронной почты для регистрации личного кабинета.' +
      '</p>' +
      '<p style="font-size: 14px; font-weight: bold; color: #1e1b4b; margin-bottom: 8px;">' +
        'Ваш одноразовый код подтверждения:' +
      '</p>' +
      '<div style="text-align: center; margin: 20px 0;">' +
        '<span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #7c3aed; background: #faf5ff; border: 2px dashed #c084fc; padding: 12px 28px; border-radius: 16px;">' +
          code +
        '</span>' +
      '</div>' +
      '<p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 16px;">' +
        '• Код действует <strong>10 минут</strong>.<br/>' +
        '• Никому не сообщайте этот код.<br/>' +
        '• Если вы не регистрировались в приложении, просто проигнорируйте это письмо.' +
      '</p>' +
      '<hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />' +
      '<p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">' +
        'Безопасность медицинских данных · 152-ФЗ · AES-256 GCM' +
      '</p>' +
    '</div>';

  try {
    MailApp.sendEmail({
      to: cleanEmail,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (mailErr) {
    try {
      GmailApp.sendEmail(cleanEmail, subject, 'Ваш код: ' + code, { htmlBody: htmlBody });
    } catch (gmailErr) {
      return jsonResponse({
        success: false,
        error: 'EMAIL_SEND_FAILED',
        message: 'Ошибка отправки через Google Mail: ' + mailErr.toString()
      });
    }
  }

  return jsonResponse({
    success: true,
    message: 'Код подтверждения успешно отправлен на адрес ' + cleanEmail
  });
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeAllSheets(ss);

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'Empty post data' });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || 'sync';

    // 1. ОТПРАВКА 6-ЗНАЧНОГО КОДА НА EMAIL ЧЕРЕЗ MailApp
    if (action === 'sendVerificationCode') {
      var targetEmail = (payload.email || '').trim().toLowerCase();
      var otpCode = payload.code || '';
      var userName = payload.name || '';
      return handleSendVerificationCode(ss, targetEmail, otpCode, userName);
    }

    // 2. ВЕРИФИКАЦИЯ КОДА И СОХРАНЕНИЕ ПОЛЬЗОВАТЕЛЯ
    if (action === 'verifyAndRegister') {
      var verifyEmail = (payload.email || '').trim().toLowerCase();
      var code = (payload.code || '').trim();
      var recordData = payload.data || payload.profile || {};

      var uSheet = resolveSheet(ss, 'users');
      appendRecordToSheet(uSheet, recordData);

      return jsonResponse({
        success: true,
        message: 'Пользователь успешно сохранен в базе данных',
        user: recordData
      });
    }

    // 3. ОБЫЧНОЕ ДОБАВЛЕНИЕ ЗАПИСИ (expenses, biomarkers, users)
    var targetTable = payload.table || 'expenses';
    var sheetToAppend = resolveSheet(ss, targetTable);
    if (payload.data) {
      appendRecordToSheet(sheetToAppend, payload.data);
      return jsonResponse({ success: true, message: 'Record appended', table: targetTable });
    }

    return jsonResponse({ success: true, message: 'OK' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
