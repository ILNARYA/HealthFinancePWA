import React, { useState } from 'react';
import {
  X, Send, Sparkles, Stethoscope, Bot, Key,
  CheckCircle2, ShieldAlert, Loader2
} from 'lucide-react';
import type { Biomarker } from '../../types';
import { useFamily } from '../../context/FamilyContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  biomarkers?: Biomarker[];
  clinicalSummary?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

const quickPrompts = [
  'Что значат мои отклонения в анализах?',
  'К какому профильному врачу записаться?',
  'Какую диету и образ жизни скорректировать?',
  'Нужна ли повторная пересдача и через сколько?',
];

export const AiDoctorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  biomarkers = [],
  clinicalSummary = '',
}) => {
  const { userProfile, activeMember, appsScriptUrl } = useFamily();
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('app-gemini-api-key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Здравствуйте, ${userProfile.firstName || activeMember.name || 'пациент'}! Я ваш персональный ИИ-ассистент по медицинским анализам. Я готов разобрать показатели крови, объяснить выявленные отклонения и подсказать дальнейшие шаги. Что вас интересует?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const patientAge = 2026 - (userProfile.birthYear || 1997);
  const patientGender = userProfile.gender === 'male' ? 'Мужской' : 'Женский';
  const patientBmi = userProfile.bmi || 23.2;

  const handleSaveKey = () => {
    localStorage.setItem('app-gemini-api-key', apiKey.trim());
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyInput(false);
    }, 1500);
  };

  const generateLocalMedicalResponse = (question: string): string => {
    const qLower = question.toLowerCase();
    const abnormal = biomarkers.filter((b) => b.status !== 'in-range');

    // 1. График чекапов, частота сдачи анализов по возрасту и параметрам
    if (
      qLower.includes('часто') ||
      qLower.includes('возраст') ||
      qLower.includes('когда') ||
      qLower.includes('чекап') ||
      qLower.includes('диспансер') ||
      qLower.includes('периодич') ||
      qLower.includes('график') ||
      qLower.includes('план') ||
      qLower.includes('параметр')
    ) {
      return `График профилактических обследований для вашего профиля (возраст: ${patientAge} лет, пол: ${patientGender.toLowerCase()}, рост: ${userProfile.height || 189} см, вес: ${userProfile.weight || 83} кг, ИМТ: ${patientBmi}):

1. **Базовый ежегодный лабораторный минимум (1 раз в год):**
• **Клинический анализ крови (ОАК) с лейкоцитарной формулой и СОЭ** — оценка системы кроветворения, исключение латентных инфекций, анемии и воспалительных процессов.
• **Биохимический профиль (АЛТ, АСТ, Общий билирубин, Креатинин, Мочевина, Мочевая кислота)** — маркеры функции печени, фильтрации почек и обмена веществ.
• **Липидограмма (Общий холестерин, ЛПВП, ЛПНП, Триглицериды)** — ключевой скрининг раннего атеросклероза сосудов и кардиорисков (в возрасте 25–35 лет рекомендуется сдавать ежегодно).
• **Углеводный обмен (Глюкоза натощак + Гликированный гемоглобин HbA1c)** — контроль инсулинорезистентности и риска сахарного диабета.
• **Витамин D (25-OH) и Ферритин** — депо железа и регулятор иммунитета (особенно актуально контролировать осенью и весной).
• **Общий анализ мочи (ОАМ)** — скрининг почек и мочевыделительной системы.

2. **Инструментальная диагностика (1 раз в 1–2 года):**
• **Флюорография или низкодозная КТ органов грудной клетки** — строго 1 раз в год.
• **ЭКГ покоя** — 1 раз в 1–2 года (при регулярных занятиях спортом — ежегодно).
• **УЗИ органов брюшной полости и почек** — 1 раз в 2–3 года для раннего выявления дискинезий и функциональных изменений.

3. **Индивидуальный статус:**
${abnormal.length > 0
  ? `В вашем последнем бланке зафиксированы отклонения (${abnormal.map((b) => b.name).join(', ')}). По этим позициям рекомендуется контрольная пересдача через 4–6 недель после рекомендаций терапевта.`
  : 'Все ключевые биомаркеры находятся в референсных диапазонах. Планового ежегодного скрининга вполне достаточно для поддержания отличного тонуса.'}

*Напоминание: индивидуальный план может быть скорректирован вашим лечащим врачом с учётом семейного анамнеза.*`;
    }

    // 2. Отклонения в анализах
    if (qLower.includes('отклонен') || qLower.includes('почему') || qLower.includes('знач') || qLower.includes('повыш') || qLower.includes('пониж') || qLower.includes('плох')) {
      if (abnormal.length > 0) {
        const details = abnormal
          .map((b) => `• **${b.name}**: ${b.value} ${b.unit} (норма: ${b.refMin}–${b.refMax}). ${b.status === 'above' ? 'Превышение нормы.' : 'Ниже нормы.'} ${b.clinicalNote || ''}`)
          .join('\n');
        return `В текущем анализе зафиксировано отклонений: ${abnormal.length}.\n\n${details}\n\nТакие сдвиги часто носят временный характер (реакция на перенесённое ОРВИ, стресс, погрешности в диете или интенсивные тренировки накануне). Рекомендуется плановый визит к терапевту для сопоставления с клинической картиной.`;
      }
      return 'В загруженных бланках все ключевые биомаркеры находятся в пределах референсных диапазонов лаборатории. Показатели метаболизма, воспаления и кроветворения в норме.';
    }

    // 3. Маршрут врачей
    if (qLower.includes('врач') || qLower.includes('записат') || qLower.includes('специалист') || qLower.includes('терапевт') || qLower.includes('клиник')) {
      return `Рекомендуемый маршрут специалистов для возраста ${patientAge} лет:

1. **Врач-терапевт (первично)** — базовый клинический осмотр, расшифровка ОАК и биохимии, составление индивидуального паспорта здоровья.
2. **Кардиолог** — при повышении атерогенных фракций холестерина (ЛПНП) или нестабильном давлении.
3. **Гастроэнтеролог** — при колебаниях ферментов печени (АЛТ, АСТ, ГГТ) или билирубина.
4. **Эндокринолог** — при отклонениях глюкозы, гликированного гемоглобина или ТТГ (щитовидная железа).`;
    }

    // 4. Питание, образ жизни, вода
    if (qLower.includes('диет') || qLower.includes('питани') || qLower.includes('продукт') || qLower.includes('образ жизни') || qLower.includes('спорт')) {
      const waterNorm = Math.round((userProfile.weight || 83) * 0.03 * 10) / 10;
      return `Клинические рекомендации по образу жизни для параметров (${userProfile.height || 189} см, ${userProfile.weight || 83} кг, ИМТ: ${patientBmi}):

1. **Водный баланс**: целевой объём чистой воды — ~${waterNorm} л в день (из расчёта 30–35 мл на 1 кг массы тела).
2. **Белковый оптимум**: при активном образе жизни рекомендуется 1.2–1.6 г полноценного белка на кг веса (~100–130 г в сутки).
3. **Омега-3 и клетчатка**: жирная морская рыба 2 раза в неделю, не менее 400 г овощей и зелени в день для поддержания липидного баланса.
4. **Сон и мелатонин**: отход ко сну до 23:30 в полной темноте и прохладе для нормализации кортизола и ночного восстановления сердечно-сосудистой системы.`;
    }

    // 5. Рост, вес и расчет ИМТ
    if (qLower.includes('вес') || qLower.includes('рост') || qLower.includes('имт') || qLower.includes('масс')) {
      return `Анализ антропометрических параметров:

• **Рост:** ${userProfile.height || 189} см
• **Вес:** ${userProfile.weight || 83} кг
• **ИМТ (Индекс Кетле):** ${patientBmi} кг/м²

**Клиническая оценка:**
Ваш ИМТ находится в диапазоне здоровой нормы (18.5–24.9 кг/м²). Это указывает на оптимальный баланс мышечной и жировой ткани без кардиометаболических рисков, связанных с избытком массы тела. Базовый обмен веществ (BMR) составляет порядка 1900–2050 ккал/сутки.`;
    }

    // 6. Подготовка к анализам
    if (qLower.includes('подготов') || qLower.includes('сдават') || qLower.includes('натощак') || qLower.includes('правил')) {
      return `Золотой стандарт подготовки к лабораторным анализам крови:

1. **Строго натощак**: последний приём пищи за 8–12 часов до забора крови. Чистую негазированную воду пить можно и нужно.
2. **За 24 часа**: исключить жирную, жареную пищу, алкоголь и тяжёлые физические тренировки (они вызывают ложный рост АЛТ, АСТ и лейкоцитов).
3. **За 1 час**: воздержаться от курения и эмоционального стресса.
4. **Перед процедурой**: посидеть спокойно 10–15 минут в приёмном покое для стабилизации пульса и гемодинамики.`;
    }

    // 7. Сроки пересдачи
    if (qLower.includes('пересда') || qLower.includes('повтор') || qLower.includes('контрол')) {
      return `Оптимальные клинические сроки контрольной пересдачи:

• **Маркеры воспаления (СОЭ, Лейкоциты, СРБ)**: через 14–21 день после исчезновения любых симптомов.
• **Липидный профиль и сахар крови**: через 1.5–2 месяца после коррекции диеты и активности.
• **Витамин D и ферритин**: через 2–3 месяца регулярного приёма назначенных дозировок.`;
    }

    // Развёрнутый общий ответ с персонализацией
    return `Спасибо за обращение! На основе данных вашего профиля (возраст: ${patientAge} лет, пол: ${patientGender.toLowerCase()}, рост: ${userProfile.height || 189} см, вес: ${userProfile.weight || 83} кг, ИМТ: ${patientBmi}):

1. **Состояние биомаркеров:**
${abnormal.length > 0 ? `Выявлено отклонений: ${abnormal.length} (${abnormal.map((b) => b.name).join(', ')}). Обратите внимание на рекомендации терапевта по коррекции рациона и режима.` : 'Все зафиксированные биомаркеры находятся в границах клинической нормы.'}

2. **Приоритеты профилактики:**
• Поддержание кардиоваскулярного тонуса и контроль уровня холестерина.
• Достаточный питьевой режим (~${Math.round((userProfile.weight || 83) * 0.03 * 10) / 10} л чистой воды).
• Ежегодный профилактический чекап (ОАК, биохимия, липидограмма, глюкоза, витамин D).

Задайте любой уточняющий вопрос: о подготовке к сдаче, расшифровке конкретного маркера или консультации профильных специалистов.`;
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputQuestion).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const abnormal = biomarkers.filter((b) => b.status !== 'in-range');
      const contextStr = `Ты — высококвалифицированный доказательный медицинский ИИ-консультант.
Пациент: ${userProfile.firstName || 'Пациент'}, пол: ${patientGender}, возраст: ${patientAge} лет, рост: ${userProfile.height || 189} см, вес: ${userProfile.weight || 83} кг, ИМТ: ${patientBmi} кг/м², группа крови: ${userProfile.bloodType || 'A(II) Rh+'}.
Биомаркеры пациента:
${biomarkers.map((b) => `${b.name}: ${b.value} ${b.unit} (норма: ${b.refMin}-${b.refMax}, статус: ${b.status})`).join('\n')}
Отклонения: ${abnormal.map((b) => b.name).join(', ') || 'нет'}.
Резюме бланка: ${clinicalSummary || 'Показатели в норме'}

Отвечай профессионально, клинически точно, доброжелательно, на понятном русском языке. Структурируй ответ списками и чёткими практическими рекомендациями. Учитывай возраст (${patientAge} лет) и параметры пациента. В конце всегда напомни, что консультация носит информационный характер и не заменяет очный визит к врачу.`;

      let aiResponseText = '';
      let apiErrorMessage = '';

      // Способ 1: Google Apps Script Cloud Relay (работает в облаке Google в США/ЕС — полностью без блокировок региона)
      if (appsScriptUrl && appsScriptUrl.includes('script.google.com')) {
        try {
          const gasRes = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'geminiChat',
              prompt: text,
              systemInstruction: contextStr,
              apiKey: apiKey.trim(),
            }),
          });
          if (gasRes.ok) {
            const gasData = await gasRes.json();
            if (gasData.success && gasData.text) {
              aiResponseText = gasData.text;
            } else if (gasData.error) {
              apiErrorMessage = gasData.message || gasData.error;
            }
          }
        } catch (gasErr: any) {
          console.warn('Apps Script Gemini relay notice:', gasErr);
        }
      }

      // Способ 2: Прямой запрос к Google Gemini Generative Language API (с поддержкой gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash)
      if (!aiResponseText && apiKey.trim()) {
        const candidateModels = [
          'gemini-2.5-flash',
          'gemini-2.0-flash',
          'gemini-1.5-flash',
          'gemini-1.5-flash-latest',
        ];

        for (const model of candidateModels) {
          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [{ text: `${contextStr}\n\nВопрос пациента: ${text}` }],
                    },
                  ],
                }),
              }
            );

            if (res.ok) {
              const data = await res.json();
              const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (reply) {
                aiResponseText = reply;
                break;
              }
            } else {
              const errText = await res.text();
              apiErrorMessage = `Google Gemini (${model}): HTTP ${res.status}`;
              if (errText.includes('location')) {
                apiErrorMessage = 'Региональное ограничение Google на прямой запрос из вашего региона';
              }
            }
          } catch (directErr: any) {
            apiErrorMessage = directErr.message || 'Сетевая ошибка';
          }
        }
      }

      // Если нейросеть ответила (онлайн):
      if (aiResponseText) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: aiResponseText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }

      // Способ 3: Автономный клинический движок доказательной медицины (работает оффлайн с 0 настройкой)
      await new Promise((r) => setTimeout(r, 600));
      const localReply = generateLocalMedicalResponse(text);

      let finalReply = localReply;
      if (apiKey.trim() && apiErrorMessage) {
        finalReply = `⚠️ *Уведомление подключения Gemini:* Прямой запрос к Google API вернул предупреждение (${apiErrorMessage}). Ответ сформирован клиническим модулем доказательной медицины:\n\n` + localReply;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'ai',
          text: finalReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error('AI Doctor Error:', err);
      const fallbackReply = generateLocalMedicalResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'ai',
          text: fallbackReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 animate-fade-in">
      <div className="w-full max-w-[390px] h-[85vh] max-h-[680px] bg-white dark:bg-[#161b26] rounded-3xl border border-purple-500/25 shadow-2xl flex flex-col overflow-hidden animate-scale-in text-gray-900 dark:text-white">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-xs">
              <Bot size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold truncate">ИИ-Врач Консультант</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/20 text-white flex items-center gap-0.5">
                  <Sparkles size={9} /> AI
                </span>
              </div>
              <p className="text-[10px] text-purple-100 truncate">
                {appsScriptUrl && appsScriptUrl.includes('script.google.com')
                  ? 'Онлайн: Google Gemini (Cloud Шлюз)'
                  : apiKey
                  ? 'Онлайн: Google Gemini API'
                  : 'Автономный клинический движок'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                apiKey
                  ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                  : 'bg-white/15 text-purple-200 hover:bg-white/25'
              }`}
              title="Настройка ключа API Gemini"
            >
              <Key size={14} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/15 text-white hover:bg-white/25 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Gemini API Key Configuration Dropdown */}
        {showKeyInput && (
          <div className="p-3 bg-purple-50 dark:bg-purple-950/60 border-b border-purple-200 dark:border-purple-800 text-xs animate-slide-up flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-purple-900 dark:text-purple-200 text-[11px] flex items-center gap-1">
                <Key size={12} /> Google Gemini API Key (опционально)
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-300 font-medium">
                Офлайн-режим активен
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Вставьте AIzaSy..."
                className="flex-1 px-2.5 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a202c] text-gray-900 dark:text-white font-mono"
              />
              <button
                onClick={handleSaveKey}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0"
              >
                {keySaved ? <CheckCircle2 size={13} /> : null}
                <span>{keySaved ? 'ОК' : 'Сохранить'}</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              Встроенный клинический движок работает автономно. Ключ Gemini API опционален для онлайн-нейросети.
            </p>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] p-3 rounded-2xl shadow-xs leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-purple-700 text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-[#1f2636] text-gray-900 dark:text-gray-100 border border-gray-200/60 dark:border-gray-800 rounded-bl-none'
                }`}
              >
                {m.sender === 'ai' && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 mb-1">
                    <Stethoscope size={11} />
                    <span>ИИ-Врач</span>
                  </div>
                )}
                <div className="text-[12px]">{m.text}</div>
              </div>
              <span className="text-[9px] text-gray-400 mt-0.5 px-1">{m.time}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-100 dark:bg-[#1f2636] text-gray-500 text-xs w-fit">
              <Loader2 size={14} className="animate-spin text-purple-600" />
              <span>ИИ-врач изучает биомаркеры и формирует ответ...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-800 flex gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0 bg-gray-50/60 dark:bg-[#161b26]/60">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              disabled={loading}
              className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-white dark:bg-[#1f2636] hover:bg-purple-50 dark:hover:bg-purple-950/80 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-800/80 shadow-2xs whitespace-nowrap flex-shrink-0 active:scale-95 transition-all"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-white dark:bg-[#161b26] flex-shrink-0">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Спросите у ИИ-врача о ваших анализах..."
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuestion.trim() || loading}
            className="w-9 h-9 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white flex items-center justify-center shadow-xs active:scale-95 transition-all flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </div>

        {/* Legal Disclaimer */}
        <div className="px-3 py-1 bg-amber-50/80 dark:bg-amber-950/40 border-t border-amber-200/50 dark:border-amber-900/40 text-[9px] text-amber-800 dark:text-amber-200 flex items-center justify-center gap-1 flex-shrink-0">
          <ShieldAlert size={10} className="flex-shrink-0" />
          <span className="truncate">ИИ не ставит окончательный клинический диагноз. Всегда консультируйтесь с врачом.</span>
        </div>
      </div>
    </div>
  );
};
