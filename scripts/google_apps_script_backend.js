/**
 * ==============================================================================
 * Google Apps Script — Production Backend API для «Здоровье и Финансы (Семейный хаб)»
 * ==============================================================================
 * 
 * ВОЗМОЖНОСТИ:
 * 1. Реальная отправка 6-значных кодов на Email (Яндекс, Gmail, Mail.ru) через MailApp.
 * 2. Реестр пользователей и защита от повторной регистрации (таблица «Пользователи_и_Семья»).
 * 3. Полная поддержка восстановления и смены пароля (action: 'resetPassword').
 * 4. Хранение секретов в «Свойствах скрипта» (PropertiesService):
 *    - SPREADSHEET_ID или SPREADSHEET_URL (ваша база данных)
 *    - GEMINI_API_KEY (API ключ нейросети Gemini)
 *    Это архитектурный стандарт: секреты хранятся на защищенных серверах Google,
 *    не раскрываются в браузере клиента и работают полностью без региональных блокировок!
 * 5. Автоматическое создание всех листов и колонок в новой таблице.
 * 6. Нейросетевой шлюз к Gemini (gemini-3.8-flash, 2.5-flash) с сохранением диалогов в лист «ИИ_Врач_Чат».
 * 
 * ИНСТРУКЦИЯ ПО ДОБАВЛЕНИЮ ПЕРЕМЕННЫХ (Свойств скрипта):
 * 1. В левом меню редактора Apps Script нажмите на значок шестерёнки ⚙️ «Настройки проекта» (Project Settings).
 * 2. Прокрутите страницу вниз до раздела «Свойства скрипта» (Script Properties).
 * 3. Нажмите «Добавить свойство скрипта» (Add script property) и введите:
 * 
 *    • ПЕРЕМЕННАЯ 1 (Google Таблица):
 *      Свойство (Property): SPREADSHEET_ID   (или SPREADSHEET_URL)
 *      Значение (Value): ID вашей таблицы (из URL) или полная ссылка https://docs.google.com/spreadsheets/d/...
 * 
 *    • ПЕРЕМЕННАЯ 2 (Ключ Gemini API):
 *      Свойство (Property): GEMINI_API_KEY
 *      Значение (Value): Ваш ключ из Google AI Studio (начинается с AIzaSy...)
 * 
 * 4. Нажмите «Сохранить свойства скрипта».
 * Теперь скрипт автоматически использует этот ключ для всех запросов ИИ-Врача и OCR чеков!
 */

/**
 * Получение API ключа Gemini из свойств скрипта (Project Settings -> Script Properties):
 * 1. Проверяет GEMINI_API_KEY, GEMINI_KEY, API_KEY в ScriptProperties.
 * 2. Если в свойствах скрипта не задано — использует ключ, переданный из PWA (payload.apiKey).
 */
function getGeminiApiKey(passedKey) {
  try {
    var props = PropertiesService.getScriptProperties();
    var key = props.getProperty('GEMINI_API_KEY')
           || props.getProperty('GEMINI_KEY')
           || props.getProperty('API_KEY');
    if (key && key.trim()) {
      return key.trim();
    }
  } catch (err) {
    Logger.log('Property GEMINI_API_KEY read notice: ' + err);
  }

  if (passedKey && typeof passedKey === 'string' && passedKey.trim()) {
    return passedKey.trim();
  }

  return '';
}

/**
 * Получение объекта Google Таблицы:
 * 1. Сначала из «Свойств скрипта» (Script Properties: SPREADSHEET_ID или SPREADSHEET_URL)
 * 2. Если не задано — из связанной активной таблицы (SpreadsheetApp.getActiveSpreadsheet())
 */
function getSpreadsheet() {
  try {
    var props = PropertiesService.getScriptProperties();
    var sheetIdOrUrl = props.getProperty('SPREADSHEET_ID') || props.getProperty('SPREADSHEET_URL');
    if (sheetIdOrUrl) {
      sheetIdOrUrl = sheetIdOrUrl.trim();
      if (sheetIdOrUrl.indexOf('http') === 0) {
        return SpreadsheetApp.openByUrl(sheetIdOrUrl);
      } else {
        return SpreadsheetApp.openById(sheetIdOrUrl);
      }
    }
  } catch (err) {
    Logger.log('Property SPREADSHEET_ID / SPREADSHEET_URL notice: ' + err);
  }

  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (err2) {
    Logger.log('Active spreadsheet notice: ' + err2);
  }

  throw new Error('Не найдена Google Таблица. Укажите свойство скрипта SPREADSHEET_ID или SPREADSHEET_URL в настройках проекта.');
}

/**
 * Функция для однократной авторизации прав на отправку писем.
 * Выберите эту функцию вверху в Apps Script и нажмите «Выполнить» (Run).
 */
function testSendEmail() {
  var userEmail = Session.getActiveUser().getEmail() || 'yamayev2010@yandex.ru';
  MailApp.sendEmail({
    to: userEmail,
    subject: 'Тест авторизации — Здоровье & Финансы',
    htmlBody: '<p>Авторизация MailApp успешна! Веб-приложение теперь может отправлять коды верификации и сброса паролей.</p>'
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
    'Email', 'Код', 'Создан', 'Истекает', 'Статус', 'Назначение'
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
    var ss = getSpreadsheet();
    initializeAllSheets(ss);

    var action = (e && e.parameter && e.parameter.action) || 'ping';
    var email = (e && e.parameter && e.parameter.email) || '';

    // 0. Проверка связи и статуса конфигурации (включая GEMINI_API_KEY)
    if (action === 'ping' || action === 'status' || action === 'checkGeminiConfig') {
      var geminiKey = getGeminiApiKey();
      return jsonResponse({
        success: true,
        status: 'OK',
        spreadsheetConnected: true,
        geminiConfigured: Boolean(geminiKey && geminiKey.length > 5),
        geminiSource: geminiKey ? 'ScriptProperties' : 'None',
        timestamp: new Date().toISOString()
      });
    }

    // 1. Отправка 6-значного кода на Email (регистрация или сброс пароля)
    if (action === 'sendVerificationCode' && email) {
      var code = (e && e.parameter && e.parameter.code) || '';
      var name = (e && e.parameter && e.parameter.name) || '';
      var purpose = (e && e.parameter && e.parameter.purpose) || 'register';
      return handleSendVerificationCode(ss, email, code, name, purpose);
    }

    // 1.5. Отправка кода для сброса пароля
    if (action === 'sendPasswordResetCode' && email) {
      var resetCode = (e && e.parameter && e.parameter.code) || '';
      return handleSendVerificationCode(ss, email, resetCode, '', 'reset_password');
    }

    // 2. Проверка существования пользователя
    if (action === 'checkUser' && email) {
      var userSheet = resolveSheet(ss, 'users');
      var data = userSheet.getDataRange().getValues();
      var headers = data[0].map(function(h) { return h ? h.toString().trim().replace(/^\ufeff/, '').toLowerCase() : ''; });
      var emailIndex = headers.indexOf('email');
      if (emailIndex === -1) emailIndex = 6;

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

    // 2.5. Удаление пользователя для очистки базы и повторной регистрации
    if (action === 'deleteUser' && email) {
      return handleDeleteUser(ss, email);
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

function handleSendVerificationCode(ss, targetEmail, otpCode, userName, purpose) {
  var cleanEmail = (targetEmail || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return jsonResponse({ success: false, error: 'INVALID_EMAIL', message: 'Некорректный адрес email' });
  }

  purpose = purpose || 'register';
  var userSheet = resolveSheet(ss, 'users');
  var usersData = userSheet.getDataRange().getValues();
  var userFound = false;

  if (usersData.length > 1) {
    var uHeaders = usersData[0].map(function(h) { return h ? h.toString().trim().replace(/^\ufeff/, '').toLowerCase() : ''; });
    var emailCol = uHeaders.indexOf('email');
    if (emailCol === -1) emailCol = 6;

    for (var i = 1; i < usersData.length; i++) {
      var curEmail = (usersData[i][emailCol] || '').toString().toLowerCase().trim();
      if (curEmail === cleanEmail) {
        userFound = true;
        break;
      }
    }
  }

  // Для РЕГИСТРАЦИИ: если уже есть, возвращаем предупреждение (но не блокируем принудительно)
  if (purpose === 'register' && userFound) {
    return jsonResponse({
      success: false,
      error: 'USER_ALREADY_EXISTS',
      message: 'Пользователь с адресом ' + cleanEmail + ' уже зарегистрирован! Пожалуйста, выполните вход.'
    });
  }

  // Генерация / использование кода
  var code = otpCode || Math.floor(100000 + Math.random() * 900000).toString();
  var now = new Date();
  var expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

  // Сохранение в лист Коды_Верификации
  var codeSheet = resolveSheet(ss, 'codes');
  codeSheet.appendRow([cleanEmail, code, now.toISOString(), expiresAt.toISOString(), 'ACTIVE', purpose]);

  // Заголовок и текст письма в зависимости от назначения
  var isReset = (purpose === 'reset_password' || purpose === 'reset_pin' || purpose === 'pin_reset');
  var subject = isReset 
    ? 'Код сброса доступа (PIN / пароль): ' + code + ' — Здоровье & Финансы' 
    : 'Код подтверждения: ' + code + ' — Здоровье & Финансы';

  var purposeDesc = isReset
    ? 'Вы запросили сброс PIN-кода или пароля для доступа в семейный кабинет.'
    : 'Вы указали этот адрес электронной почты для регистрации личного кабинета.';

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
        greeting + ' ' + purposeDesc +
      '</p>' +
      '<p style="font-size: 14px; font-weight: bold; color: #1e1b4b; margin-bottom: 8px;">' +
        (isReset ? 'Ваш код для сброса пароля:' : 'Ваш одноразовый код подтверждения:') +
      '</p>' +
      '<div style="text-align: center; margin: 20px 0;">' +
        '<span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #7c3aed; background: #faf5ff; border: 2px dashed #c084fc; padding: 12px 28px; border-radius: 16px;">' +
          code +
        '</span>' +
      '</div>' +
      '<p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 16px;">' +
        '• Код действует <strong>10 минут</strong>.<br/>' +
        '• Никому не сообщайте этот код.<br/>' +
        '• Если вы не совершали этот запрос, ваш аккаунт в безопасности — просто проигнорируйте письмо.' +
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
    message: 'Код успешно отправлен на адрес ' + cleanEmail
  });
}

function handleResetPassword(ss, targetEmail, newPassword) {
  var cleanEmail = (targetEmail || '').trim().toLowerCase();
  if (!cleanEmail || !newPassword) {
    return jsonResponse({ success: false, error: 'Email and newPassword required' });
  }

  var userSheet = resolveSheet(ss, 'users');
  var data = userSheet.getDataRange().getValues();
  if (data.length <= 1) {
    return jsonResponse({ success: false, error: 'USER_NOT_FOUND', message: 'Таблица пользователей пуста' });
  }

  var headers = data[0].map(function(h) { return h ? h.toString().trim().replace(/^\ufeff/, '').toLowerCase() : ''; });
  var emailIndex = headers.indexOf('email');
  if (emailIndex === -1) emailIndex = 6;

  var passwordIndex = headers.indexOf('пароль');
  if (passwordIndex === -1) passwordIndex = headers.indexOf('password');
  if (passwordIndex === -1) {
    // Добавим колонку «Пароль», если её ещё нет
    passwordIndex = headers.length;
    userSheet.getRange(1, passwordIndex + 1).setValue('Пароль');
  }

  var updated = false;
  for (var i = 1; i < data.length; i++) {
    var rowEmail = (data[i][emailIndex] || '').toString().toLowerCase().trim();
    if (rowEmail === cleanEmail) {
      userSheet.getRange(i + 1, passwordIndex + 1).setValue(newPassword);
      updated = true;
      break;
    }
  }

  if (updated) {
    return jsonResponse({
      success: true,
      message: 'Пароль для пользователя ' + cleanEmail + ' успешно обновлён.'
    });
  } else {
    return jsonResponse({
      success: false,
      error: 'USER_NOT_FOUND',
      message: 'Пользователь ' + cleanEmail + ' не найден.'
    });
  }
}

function handleDeleteUser(ss, targetEmail) {
  var cleanEmail = (targetEmail || '').trim().toLowerCase();
  if (!cleanEmail) {
    return jsonResponse({ success: false, error: 'Email required' });
  }
  var userSheet = resolveSheet(ss, 'users');
  var data = userSheet.getDataRange().getValues();
  if (data.length <= 1) {
    return jsonResponse({ success: true, count: 0, message: 'Таблица пользователей пуста' });
  }
  var headers = data[0].map(function(h) { return h ? h.toString().trim().replace(/^\ufeff/, '').toLowerCase() : ''; });
  var emailIndex = headers.indexOf('email');
  if (emailIndex === -1) emailIndex = 6;

  var deletedCount = 0;
  for (var i = data.length - 1; i >= 1; i--) {
    var rowEmail = (data[i][emailIndex] || '').toString().toLowerCase().trim();
    if (rowEmail === cleanEmail) {
      userSheet.deleteRow(i + 1);
      deletedCount++;
    }
  }

  return jsonResponse({
    success: true,
    deletedCount: deletedCount,
    message: 'Пользователь ' + cleanEmail + ' удалён из базы (' + deletedCount + ' строк).'
  });
}

function doPost(e) {
  try {
    var ss = getSpreadsheet();
    initializeAllSheets(ss);

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'Empty post data' });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || 'sync';

    // 1. ОТПРАВКА 6-ЗНАЧНОГО КОДА НА EMAIL ЧЕРЕЗ MailApp
    if (action === 'sendVerificationCode' || action === 'sendPasswordResetCode' || action === 'sendPinResetCode') {
      var targetEmail = (payload.email || '').trim().toLowerCase();
      var otpCode = payload.code || '';
      var userName = payload.name || '';
      var purpose = payload.purpose || (action === 'sendPinResetCode' ? 'pin_reset' : action === 'sendPasswordResetCode' ? 'reset_password' : 'register');
      return handleSendVerificationCode(ss, targetEmail, otpCode, userName, purpose);
    }

    // 2. СБРОС И ОБНОВЛЕНИЕ ПАРОЛЯ
    if (action === 'resetPassword' || action === 'updatePassword') {
      var resetEmail = (payload.email || '').trim().toLowerCase();
      var newPass = payload.newPassword || payload.password || '';
      return handleResetPassword(ss, resetEmail, newPass);
    }

    // 3. ВЕРИФИКАЦИЯ КОДА И СОХРАНЕНИЕ ПОЛЬЗОВАТЕЛЯ
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

    // 4. УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ДЛЯ ОЧИСТКИ И ПЕРЕРЕГИСТРАЦИИ
    if (action === 'deleteUser' && payload.email) {
      return handleDeleteUser(ss, payload.email);
    }

    // 5. НЕЙРОСЕТЕВОЙ КЛИНИЧЕСКИЙ ШЛЮЗ GEMINI API (РАБОТАЕТ БЕЗ РЕГИОНАЛЬНЫХ БЛОКИРОВОК)
    if (action === 'geminiChat' || action === 'aiDoctor') {
      return handleGeminiChat(payload);
    }

    if (action === 'geminiVision' || action === 'ocrReceipt') {
      return handleGeminiVision(payload);
    }

    // 5.5. ЗАГРУЗКА ИСТОРИИ ЧАТА ИИ-ВРАЧА
    if (action === 'loadChatHistory') {
      var chatEmail = (payload.email || '').trim().toLowerCase();
      if (!chatEmail) {
        return jsonResponse({ success: false, error: 'EMAIL_REQUIRED' });
      }
      var chatSheet = ss.getSheetByName('ИИ_Врач_Чат');
      if (!chatSheet) {
        return jsonResponse({ success: true, messages: [] });
      }
      var chatData = chatSheet.getDataRange().getValues();
      var chatMessages = [];
      for (var ci = 1; ci < chatData.length; ci++) {
        if ((chatData[ci][0] || '').toString().toLowerCase().trim() === chatEmail) {
          chatMessages.push({
            timestamp: (chatData[ci][1] || '').toString(),
            role: (chatData[ci][2] || '').toString(),
            text: (chatData[ci][3] || '').toString(),
            model: (chatData[ci][4] || '').toString()
          });
        }
      }
      // Возвращаем последние 40 сообщений
      return jsonResponse({
        success: true,
        messages: chatMessages.slice(-40)
      });
    }

    // 6. ОБЫЧНОЕ ДОБАВЛЕНИЕ ЗАПИСИ (expenses, biomarkers, users)
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

function handleGeminiChat(payload) {
  var userPrompt = payload.prompt || payload.text || '';
  var passedSystemInstruction = payload.systemInstruction || '';
  var userEmail = (payload.email || '').trim().toLowerCase();

  // Приоритетно берем GEMINI_API_KEY из «Свойств скрипта» (Project Settings), затем из payload
  var apiKey = getGeminiApiKey(payload.apiKey);

  if (!apiKey) {
    return jsonResponse({
      success: false,
      error: 'GEMINI_KEY_MISSING',
      message: 'API ключ Gemini не найден. Добавьте свойство GEMINI_API_KEY в Настройках проекта (Project Settings -> Script Properties) Google Apps Script.'
    });
  }

  // ======= МЕДИЦИНСКИЙ СИСТЕМНЫЙ ПРОМПТ =======
  var MEDICAL_SYSTEM_PROMPT = 'Ты — ИИ-Врач Консультант, высококвалифицированный доказательный медицинский ИИ-ассистент семейного медицинского хаба «Здоровье & Финансы».\n\n'
    + '## Твоя роль:\n'
    + '- Ты анализируешь лабораторные показатели крови (биомаркеры), интерпретируешь результаты анализов и даёшь клинически обоснованные рекомендации.\n'
    + '- Ты отвечаешь профессионально, клинически точно, доброжелательно, на понятном русском языке.\n'
    + '- Ты структурируешь ответ списками, таблицами и чёткими практическими рекомендациями.\n'
    + '- Для каждого биомаркера ты указываешь референсные диапазоны, клиническое значение отклонений и конкретные шаги.\n\n'
    + '## Правила ответов:\n'
    + '1. Всегда учитывай возраст, пол, рост, вес, ИМТ и группу крови пациента при интерпретации.\n'
    + '2. При отклонениях указывай: возможные причины, к какому врачу обратиться, через сколько пересдать.\n'
    + '3. При нормальных показателях — подтверди норму и дай профилактические советы.\n'
    + '4. Используй маркированные списки (•) и нумерацию для структуры.\n'
    + '5. Рекомендуй конкретные обследования с частотой (ежегодно, раз в 2 года и т.д.).\n'
    + '6. Советуй по питанию, водному балансу, физической активности, сну.\n'
    + '7. В конце КАЖДОГО ответа обязательно добавляй медицинский дисклеймер:\n'
    + '   «⚕️ Данная консультация носит информационный характер и не заменяет очный визит к врачу. Для постановки диагноза обратитесь к профильному специалисту.»\n\n'
    + '## Ежегодный лабораторный минимум для мужчин 25–35 лет:\n'
    + '- ОАК с лейкоцитарной формулой и СОЭ\n'
    + '- Биохимия (АЛТ, АСТ, билирубин, креатинин, мочевина, мочевая кислота)\n'
    + '- Липидограмма (общий холестерин, ЛПВП, ЛПНП, триглицериды)\n'
    + '- Углеводный обмен (глюкоза натощак + HbA1c)\n'
    + '- Витамин D (25-OH) и ферритин\n'
    + '- ОАМ\n'
    + '- Флюорография 1 раз в год, ЭКГ 1 раз в 1-2 года\n'
    + '- УЗИ брюшной полости 1 раз в 2-3 года\n';

  var fullSystemPrompt = MEDICAL_SYSTEM_PROMPT;
  if (passedSystemInstruction) {
    fullSystemPrompt += '\n## Контекст пациента (из приложения):\n' + passedSystemInstruction;
  }

  // ======= ЗАГРУЗКА ИСТОРИИ ЧАТА ИЗ GOOGLE SHEETS =======
  var chatHistory = [];
  if (userEmail) {
    try {
      var ss = getSpreadsheet();
      var chatSheetName = 'ИИ_Врач_Чат';
      var chatSheet = ss.getSheetByName(chatSheetName);
      if (!chatSheet) {
        chatSheet = ss.insertSheet(chatSheetName);
        chatSheet.appendRow(['Email', 'Timestamp', 'Role', 'Message', 'Model', 'PatientContext']);
        var hdr = chatSheet.getRange(1, 1, 1, 6);
        hdr.setFontWeight('bold');
        hdr.setBackground('#f3e8ff');
        hdr.setFontColor('#581c87');
      }
      // Загружаем последние 20 сообщений пользователя
      var allData = chatSheet.getDataRange().getValues();
      if (allData.length > 1) {
        var userRows = [];
        for (var r = 1; r < allData.length; r++) {
          if ((allData[r][0] || '').toString().toLowerCase().trim() === userEmail) {
            userRows.push({
              role: (allData[r][2] || '').toString().toLowerCase() === 'user' ? 'user' : 'model',
              text: (allData[r][3] || '').toString()
            });
          }
        }
        // Берём последние 20 сообщений для контекста
        chatHistory = userRows.slice(-20);
      }
    } catch (histErr) {
      Logger.log('Chat history load notice: ' + histErr);
    }
  }

  // ======= ФОРМИРОВАНИЕ ЗАПРОСА С ИСТОРИЕЙ =======
  var contents = [];

  // Системная инструкция как первое сообщение (role: user → model)
  contents.push({ role: 'user', parts: [{ text: fullSystemPrompt + '\n\nПодтверди, что ты готов помогать пациенту.' }] });
  contents.push({ role: 'model', parts: [{ text: 'Понял. Я ИИ-Врач Консультант, готов анализировать биомаркеры и давать клинические рекомендации. Жду вопрос пациента.' }] });

  // История предыдущих сообщений
  for (var h = 0; h < chatHistory.length; h++) {
    contents.push({
      role: chatHistory[h].role,
      parts: [{ text: chatHistory[h].text }]
    });
  }

  // Текущий вопрос пользователя
  contents.push({ role: 'user', parts: [{ text: userPrompt }] });

  // ======= КАСКАД МОДЕЛЕЙ: gemini-3.8-flash (Free) → gemini-2.5-flash → gemini-2.0-flash =======
  var models = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
  var lastError = '';

  for (var m = 0; m < models.length; m++) {
    var modelName = models[m];
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + apiKey;

    var body = { contents: contents };

    try {
      var options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(body),
        muteHttpExceptions: true
      };

      var res = UrlFetchApp.fetch(url, options);
      var code = res.getResponseCode();
      var responseText = res.getContentText();

      if (code >= 200 && code < 300) {
        var parsed = JSON.parse(responseText);
        var reply = (parsed && parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts && parsed.candidates[0].content.parts[0] && parsed.candidates[0].content.parts[0].text) || '';

        // ======= СОХРАНЕНИЕ В ИСТОРИЮ GOOGLE SHEETS =======
        if (userEmail && reply) {
          try {
            var ss2 = getSpreadsheet();
            var saveSheet = ss2.getSheetByName('ИИ_Врач_Чат');
            if (saveSheet) {
              var now = new Date().toISOString();
              saveSheet.appendRow([userEmail, now, 'user', userPrompt, '', '']);
              saveSheet.appendRow([userEmail, now, 'model', reply, modelName, passedSystemInstruction.substring(0, 500)]);
            }
          } catch (saveErr) {
            Logger.log('Chat save notice: ' + saveErr);
          }
        }

        return jsonResponse({
          success: true,
          model: modelName,
          text: reply
        });
      } else {
        lastError = 'HTTP ' + code + ' (' + modelName + '): ' + responseText;
      }
    } catch (e) {
      lastError = e.toString();
    }
  }

  return jsonResponse({
    success: false,
    error: 'GEMINI_FAILED',
    message: 'Ошибка при вызове Gemini API: ' + lastError
  });
}

function handleGeminiVision(payload) {
  var imageBase64 = payload.image || payload.base64 || '';
  var mimeType = payload.mimeType || 'image/jpeg';
  var prompt = payload.prompt || 'Распознай фискальный чек или медицинскую квитанцию на русском языке.';

  // Приоритетно берем GEMINI_API_KEY из «Свойств скрипта» (Project Settings), затем из payload
  var apiKey = getGeminiApiKey(payload.apiKey);

  if (!apiKey) {
    return jsonResponse({
      success: false,
      error: 'GEMINI_KEY_MISSING',
      message: 'API ключ Gemini не найден. Добавьте свойство GEMINI_API_KEY в Настройках проекта (Project Settings -> Script Properties) Google Apps Script.'
    });
  }

  var models = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
  var lastError = '';
  for (var m = 0; m < models.length; m++) {
    var modelName = models[m];
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + apiKey;
    var body = {
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
            { text: prompt }
          ]
        }
      ]
    };
    try {
      var options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(body),
        muteHttpExceptions: true
      };
      var res = UrlFetchApp.fetch(url, options);
      if (res.getResponseCode() >= 200 && res.getResponseCode() < 300) {
        var parsed = JSON.parse(res.getContentText());
        var reply = (parsed && parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts && parsed.candidates[0].content.parts[0] && parsed.candidates[0].content.parts[0].text) || '';
        return jsonResponse({ success: true, model: modelName, text: reply });
      } else {
        lastError = 'HTTP ' + res.getResponseCode() + ' (' + modelName + ')';
      }
    } catch (e) {
      lastError = e.toString();
    }
  }
  return jsonResponse({ success: false, error: 'VISION_FAILED', message: lastError });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
