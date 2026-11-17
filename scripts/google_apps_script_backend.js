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
 * 
 * ИНСТРУКЦИЯ ПО РАЗВЕРТЫВАНИЮ:
 * 1. Откройте вашу Google Таблицу на Google Диске (drive.google.com).
 * 2. Меню: Расширения (Extensions) -> Apps Script.
 * 3. Вставьте данный код целиком вместо старого и нажмите «Сохранить» (Ctrl+S).
 * 4. Нажмите «Развернуть» (Deploy) -> «Управление развертываниями» (Manage deployments).
 * 5. Нажмите значок карандаша (Редактировать) или «Новое развертывание»:
 *    - Версия: Новая версия
 *    - Запуск от имени: От моего имени (ваша почта)
 *    - У кого есть доступ: ВСЕ (Anyone)  <--- КРИТИЧЕСКИ ВАЖНО ДЛЯ РАБОТЫ PWA!
 * 6. Нажмите «Развернуть» и скопируйте URL веб-приложения (заканчивается на /exec).
 * 7. Вставьте скопированный URL в Настройках приложения в поле «API Apps Script».
 */

const SHEET_NAMES = {
  USERS: 'Пользователи_и_Семья',
  CODES: 'Коды_Верификации',
  BIOMARKERS: 'Анализы_и_Биомаркеры',
  EXPENSES: 'Медицинские_Расходы',
  SCORES: 'Индекс_Здоровья_Сводка',
  INVITES: 'Семейные_Инвайты'
};

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f3e8ff');
      headerRange.setFontColor('#581c87');
    }
  }
  return sheet;
}

function initializeAllSheets(ss) {
  getOrCreateSheet(ss, SHEET_NAMES.USERS, [
    'ID', 'Email', 'Фамилия', 'Имя', 'Отчество', 'Пароль', 'Роль', 'Семья', 'Дата_Регистрации', 'Метод_Входа'
  ]);
  getOrCreateSheet(ss, SHEET_NAMES.CODES, [
    'Email', 'Код', 'Создан', 'Истекает', 'Статус'
  ]);
  getOrCreateSheet(ss, SHEET_NAMES.EXPENSES, [
    'ID', 'Дата', 'Категория', 'Название', 'Сумма', 'Врач', 'Специальность', 'Автор_ID', 'Семья'
  ]);
  getOrCreateSheet(ss, SHEET_NAMES.BIOMARKERS, [
    'ID', 'Дата', 'Название', 'Значение', 'Единицы', 'Референс_Мин', 'Референс_Макс', 'Статус', 'Пациент_ID'
  ]);
  getOrCreateSheet(ss, SHEET_NAMES.SCORES, [
    'Месяц', 'Score', 'Дата_Расчета', 'Заметки', 'Семья'
  ]);
  getOrCreateSheet(ss, SHEET_NAMES.INVITES, [
    'ID', 'Кому_ID', 'От_Кого_ID', 'Роль', 'Статус', 'Дата'
  ]);
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeAllSheets(ss);

    const action = (e && e.parameter && e.parameter.action) || 'ping';
    const email = (e && e.parameter && e.parameter.email) || '';

    // Проверка существования пользователя
    if (action === 'checkUser' && email) {
      const userSheet = ss.getSheetByName(SHEET_NAMES.USERS);
      const data = userSheet.getDataRange().getValues();
      let exists = false;
      let userData = null;

      for (let i = 1; i < data.length; i++) {
        if (data[i][1] && data[i][1].toString().toLowerCase() === email.trim().toLowerCase()) {
          exists = true;
          userData = {
            id: data[i][0],
            email: data[i][1],
            lastName: data[i][2],
            firstName: data[i][3],
            middleName: data[i][4],
            role: data[i][6],
            familyName: data[i][7]
          };
          break;
        }
      }
      return jsonResponse({ success: true, exists: exists, user: userData });
    }

    // Получение данных по таблицам
    const table = (e && e.parameter && e.parameter.table) || 'users';
    let sheetName = SHEET_NAMES.USERS;
    if (table === 'biomarkers') sheetName = SHEET_NAMES.BIOMARKERS;
    else if (table === 'expenses') sheetName = SHEET_NAMES.EXPENSES;
    else if (table === 'scores') sheetName = SHEET_NAMES.SCORES;
    else if (table === 'invites') sheetName = SHEET_NAMES.INVITES;

    const sheet = ss.getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return jsonResponse({ success: true, count: 0, data: [] });
    }

    const headers = data[0];
    const rows = data.slice(1);
    const result = rows.map(row => {
      const item = {};
      headers.forEach((h, i) => { item[h] = row[i]; });
      return item;
    });

    return jsonResponse({ success: true, count: result.length, data: result });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeAllSheets(ss);

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'Empty post data' });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || 'sync';

    // 1. ОТПРАВКА РЕАЛЬНОГО КОДА ПОДТВЕРЖДЕНИЯ НА EMAIL
    if (action === 'sendVerificationCode') {
      const email = (payload.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return jsonResponse({ success: false, error: 'INVALID_EMAIL', message: 'Некорректный адрес email' });
      }

      // Проверка: зарегистрирован ли уже пользователь
      const userSheet = ss.getSheetByName(SHEET_NAMES.USERS);
      const userData = userSheet.getDataRange().getValues();
      for (let i = 1; i < userData.length; i++) {
        if (userData[i][1] && userData[i][1].toString().toLowerCase() === email) {
          return jsonResponse({
            success: false,
            error: 'USER_ALREADY_EXISTS',
            message: 'Пользователь с адресом ' + email + ' уже зарегистрирован! Пожалуйста, выполните вход.'
          });
        }
      }

      // Генерация 6-значного кода
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 минут

      // Запись кода в лист Коды_Верификации
      const codeSheet = ss.getSheetByName(SHEET_NAMES.CODES);
      codeSheet.appendRow([email, code, now.toISOString(), expiresAt.toISOString(), 'ACTIVE']);

      // Отправка реального HTML-письма через Google Mail
      const subject = 'Код подтверждения: ' + code + ' — Здоровье & Финансы';
      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e9d5ff; border-radius: 20px; background-color: #ffffff; color: #1e1b4b;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 48px; height: 48px; margin: 0 auto 12px; background: #7c3aed; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 24px; font-weight: bold; line-height: 48px;">
              ❤
            </div>
            <h2 style="color: #7c3aed; margin: 0; font-size: 22px; font-weight: 800;">Здоровье & Финансы</h2>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Единый семейный медицинский хаб</p>
          </div>

          <p style="font-size: 14px; color: #334155; line-height: 1.5; margin-bottom: 16px;">
            Здравствуйте! Вы указали этот адрес электронной почты для регистрации личного кабинета.
          </p>

          <p style="font-size: 14px; font-weight: bold; color: #1e1b4b; margin-bottom: 8px;">
            Ваш одноразовый код подтверждения:
          </p>

          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #7c3aed; background: #faf5ff; border: 2px dashed #c084fc; padding: 12px 28px; border-radius: 16px;">
              ${code}
            </span>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 16px;">
            • Код действует <strong>10 минут</strong>.<br/>
            • Никому не сообщайте этот код.<br/>
            • Если вы не регистрировались в приложении, просто проигнорируйте это письмо.
          </p>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            Безопасность медицинских данных · 152-ФЗ · AES-256 GCM
          </p>
        </div>
      `;

      MailApp.sendEmail({
        to: email,
        subject: subject,
        htmlBody: htmlBody
      });

      return jsonResponse({
        success: true,
        message: 'Код подтверждения успешно отправлен на адрес ' + email
      });
    }

    // 2. ВЕРИФИКАЦИЯ КОДА И РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ
    if (action === 'verifyAndRegister') {
      const email = (payload.email || '').trim().toLowerCase();
      const code = (payload.code || '').trim();
      const profile = payload.profile || {};

      if (!email || !code) {
        return jsonResponse({ success: false, error: 'MISSING_FIELDS', message: 'Укажите email и код' });
      }

      // Проверка кода в листе Коды_Верификации
      const codeSheet = ss.getSheetByName(SHEET_NAMES.CODES);
      const codesData = codeSheet.getDataRange().getValues();
      let codeValid = false;
      let codeRowIndex = -1;
      const now = new Date();

      for (let i = codesData.length - 1; i >= 1; i--) {
        if (codesData[i][0] && codesData[i][0].toString().toLowerCase() === email &&
            codesData[i][1] && codesData[i][1].toString() === code &&
            codesData[i][4] === 'ACTIVE') {
          const exp = new Date(codesData[i][3]);
          if (exp > now) {
            codeValid = true;
            codeRowIndex = i + 1;
            break;
          }
        }
      }

      if (!codeValid) {
        return jsonResponse({
          success: false,
          error: 'INVALID_OR_EXPIRED_CODE',
          message: 'Неверный или истекший код подтверждения. Проверьте почту или запросите код повторно.'
        });
      }

      // Проверка на дубликат пользователя
      const userSheet = ss.getSheetByName(SHEET_NAMES.USERS);
      const userData = userSheet.getDataRange().getValues();
      for (let i = 1; i < userData.length; i++) {
        if (userData[i][1] && userData[i][1].toString().toLowerCase() === email) {
          return jsonResponse({
            success: false,
            error: 'USER_ALREADY_EXISTS',
            message: 'Пользователь с адресом ' + email + ' уже существует!'
          });
        }
      }

      // Погасить код
      if (codeRowIndex > 0) {
        codeSheet.getRange(codeRowIndex, 5).setValue('USED');
      }

      // Зарегистрировать пользователя
      const newUserId = profile.personalId || ('MED-' + Math.floor(1000 + Math.random() * 9000));
      const registeredAt = now.toISOString();
      const familyName = 'Моя семья';

      userSheet.appendRow([
        newUserId,
        email,
        profile.lastName || '',
        profile.firstName || '',
        profile.middleName || '',
        profile.password || '******',
        'head',
        familyName,
        registeredAt,
        payload.loginMethod || 'Email/Code'
      ]);

      return jsonResponse({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        user: {
          id: newUserId,
          email: email,
          lastName: profile.lastName || '',
          firstName: profile.firstName || '',
          middleName: profile.middleName || '',
          familyName: familyName,
          registeredAt: registeredAt
        }
      });
    }

    // 3. ВХОД ПОЛЬЗОВАТЕЛЯ
    if (action === 'login') {
      const email = (payload.email || '').trim().toLowerCase();
      const password = (payload.password || '').trim();

      const userSheet = ss.getSheetByName(SHEET_NAMES.USERS);
      const userData = userSheet.getDataRange().getValues();
      let found = null;

      for (let i = 1; i < userData.length; i++) {
        if (userData[i][1] && userData[i][1].toString().toLowerCase() === email) {
          found = {
            id: userData[i][0],
            email: userData[i][1],
            lastName: userData[i][2],
            firstName: userData[i][3],
            middleName: userData[i][4],
            savedPassword: userData[i][5],
            role: userData[i][6],
            familyName: userData[i][7] || 'Моя семья'
          };
          break;
        }
      }

      if (!found) {
        return jsonResponse({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'Пользователь с таким email не найден. Пройдите регистрацию.'
        });
      }

      // Проверка пароля (если пароль был задан)
      if (found.savedPassword && found.savedPassword !== '******' && password && found.savedPassword !== password) {
        return jsonResponse({
          success: false,
          error: 'WRONG_PASSWORD',
          message: 'Неверный пароль. Попробуйте еще раз.'
        });
      }

      return jsonResponse({
        success: true,
        message: 'Вход выполнен успешно',
        user: {
          id: found.id,
          email: found.email,
          lastName: found.lastName,
          firstName: found.firstName,
          middleName: found.middleName,
          role: found.role,
          familyName: found.familyName
        }
      });
    }

    // 4. СИНХРОНИЗАЦИЯ РАСХОДОВ И АНАЛИЗОВ
    const table = payload.table || 'expenses';
    const record = payload.data;
    let sheetName = SHEET_NAMES.EXPENSES;
    if (table === 'users') sheetName = SHEET_NAMES.USERS;
    else if (table === 'biomarkers') sheetName = SHEET_NAMES.BIOMARKERS;
    else if (table === 'scores') sheetName = SHEET_NAMES.SCORES;
    else if (table === 'invites') sheetName = SHEET_NAMES.INVITES;

    const targetSheet = ss.getSheetByName(sheetName);
    const headers = targetSheet.getRange(1, 1, 1, targetSheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(h => record[h] !== undefined ? record[h] : '');
    targetSheet.appendRow(newRow);

    return jsonResponse({ success: true, message: 'Запись добавлена в таблицу', table: sheetName });

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
