import React, { useState, useEffect, useRef } from 'react';
import {
  X, Send, Sparkles, Stethoscope, Bot, Key,
  CheckCircle2, ShieldAlert, Loader2, Wifi, WifiOff
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
  model?: string;
}

const quickPrompts = [
  'Как часто сдавать анализы в моем возрасте?',
  'Когда нужен подробный анализ, а когда минимальный?',
  'Что значат мои отклонения в анализах?',
  'К какому профильному врачу записаться?',
  'Какую диету и образ жизни скорректировать?',
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
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'cloud' | 'direct' | 'offline'>('offline');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Здравствуйте, ${userProfile.firstName || activeMember.name || 'пациент'}! Я ваш персональный ИИ-ассистент по медицинским анализам. Я готов разобрать показатели крови, объяснить выявленные отклонения и подсказать дальнейшие шаги. Что вас интересует?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Определение режима подключения
  useEffect(() => {
    if (appsScriptUrl && appsScriptUrl.includes('script.google.com')) {
      setConnectionMode('cloud');
    } else if (apiKey.trim()) {
      setConnectionMode('direct');
    } else {
      setConnectionMode('offline');
    }
  }, [appsScriptUrl, apiKey]);

  // Загрузка истории чата при открытии
  useEffect(() => {
    if (!isOpen || historyLoaded) return;
    if (!appsScriptUrl || !userProfile.email) return;

    const loadHistory = async () => {
      try {
        const res = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'loadChatHistory',
            email: userProfile.email,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.messages && data.messages.length > 0) {
            const restored: Message[] = data.messages.map((m: any, i: number) => ({
              id: `hist-${i}`,
              sender: m.role === 'user' ? 'user' as const : 'ai' as const,
              text: m.text,
              time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              model: m.model || undefined,
            }));
            setMessages((prev) => [prev[0], ...restored]);
          }
        }
      } catch (err) {
        console.warn('Chat history load:', err);
      }
      setHistoryLoaded(true);
    };

    loadHistory();
  }, [isOpen, historyLoaded, appsScriptUrl, userProfile.email]);

  // Авто-скролл к последнему сообщению
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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

    if (
      qLower.includes('часто') ||
      qLower.includes('возраст') ||
      qLower.includes('когда') ||
      qLower.includes('чекап') ||
      qLower.includes('диспансер') ||
      qLower.includes('периодич') ||
      qLower.includes('график') ||
      qLower.includes('план') ||
      qLower.includes('параметр') ||
      qLower.includes('подробн') ||
      qLower.includes('минимальн')
    ) {
      return `Персональная стратегия медицинского мониторинга (возраст: ${patientAge} лет, пол: ${patientGender.toLowerCase()}, рост: ${userProfile.height || 189} см, вес: ${userProfile.weight || 83} кг, ИМТ: ${patientBmi} — здоровая норма):

1. **Разделение: когда сдавать подробный анализ, а когда минимальный:**
• **Подробный (развернутый) чекап** — 1 раз в год планово. Он формирует полную объемную картину метаболизма, сосудистого русла и внутренних органов. Также показан при старте интенсивных спортивных тренировок или планировании семьи.
• **Минимальный (экспресс-контроль)** — каждые 6 месяцев или точечно (например, контроль ферритина и витамина D через 2–3 месяца курса добавок, либо ОАК через 10–14 дней после перенесенной ОРВИ).

2. **Ежегодный подробный лабораторный минимум (1 раз в год):**
• **ОАК с лейкоцитарной формулой и СОЭ** — маркер скрытых воспалений, латентных инфекций, анемии и иммунитета.
• **Биохимия крови**: АЛТ, АСТ, билирубин общий/прямой (печень и желчеотток), креатинин с расчетом СКФ и мочевина (почки), мочевая кислота (скрининг подагры и метаболического синдрома).
• **Липидограмма развернутая**: общий холестерин, ЛПВП, ЛПНП, триглицериды, коэф. атерогенности (критически важен для мужчин 25–35 лет для раннего исключения скрытого сосудистого атеросклероза).
• **Углеводный обмен**: глюкоза натощак + гликированный гемоглобин (HbA1c) — контроль чувствительности к инсулину.
• **Скрытые дефициты**: Витамин D (25-OH) и сывороточный ферритин (оценка депо железа).
• **Общий анализ мочи (ОАМ)** с микроскопией осадка.

3. **Инструментальный скрининг (аппаратная диагностика):**
• **Флюорография / низкодозная КТ ОГК** — ежегодно (1 раз в год).
• **ЭКГ покоя в 12 отведениях** — 1 раз в 1–2 года.
• **УЗИ органов брюшной полости и почек** — 1 раз в 2–3 года.

4. **Правила подготовки и тактика пересдачи:**
• **Подготовка**: кровь сдается строго натощак (8–12 часов голодания, чистая негазированная вода разрешена). За 24 часа исключить алкоголь, жирную пищу, интенсивный спорт и баню/сауну.
• **Сроки пересдачи**: при незначительных функциональных отклонениях — повторить через 2–4 недели после нормализации режима. При медикаментозной терапии — через 2–3 месяца.

⚕️ Данная консультация носит информационный характер и не заменяет очный визит к врачу.`;
    }

    if (qLower.includes('отклонен') || qLower.includes('почему') || qLower.includes('знач') || qLower.includes('повыш') || qLower.includes('пониж') || qLower.includes('плох')) {
      if (abnormal.length > 0) {
        const details = abnormal
          .map((b) => `• **${b.name}**: ${b.value} ${b.unit} (норма: ${b.refMin}–${b.refMax}). ${b.status === 'above' ? 'Превышение нормы.' : 'Ниже нормы.'} ${b.clinicalNote || ''}`)
          .join('\n');
        return `В текущем анализе зафиксировано отклонений: ${abnormal.length}.\n\n${details}\n\n⚕️ Рекомендуется плановый визит к терапевту для сопоставления с клинической картиной.`;
      }
      return 'Все ключевые биомаркеры находятся в пределах референсных диапазонов. ⚕️ Для уточнения обратитесь к терапевту.';
    }

    if (qLower.includes('врач') || qLower.includes('записат') || qLower.includes('специалист')) {
      return `Рекомендуемый маршрут специалистов для возраста ${patientAge} лет:

1. **Терапевт** — базовый осмотр, расшифровка анализов
2. **Кардиолог** — при повышении ЛПНП или нестабильном давлении
3. **Гастроэнтеролог** — при колебаниях ферментов печени
4. **Эндокринолог** — при отклонениях глюкозы, HbA1c или ТТГ

⚕️ Данная консультация носит информационный характер и не заменяет очный визит к врачу.`;
    }

    if (qLower.includes('диет') || qLower.includes('питани') || qLower.includes('образ жизни') || qLower.includes('спорт')) {
      const waterNorm = Math.round((userProfile.weight || 83) * 0.03 * 10) / 10;
      return `Рекомендации по образу жизни (${userProfile.height || 189} см, ${userProfile.weight || 83} кг, ИМТ: ${patientBmi}):

1. **Водный баланс**: ~${waterNorm} л чистой воды в день
2. **Белок**: 1.2–1.6 г на кг веса (~100–130 г в сутки)
3. **Омега-3**: жирная рыба 2 раза в неделю, 400 г овощей в день
4. **Сон**: отход ко сну до 23:30 для нормализации кортизола

⚕️ Данная консультация носит информационный характер и не заменяет очный визит к врачу.`;
    }

    return `На основе данных вашего профиля (возраст: ${patientAge} лет, пол: ${patientGender.toLowerCase()}, ИМТ: ${patientBmi}):

${abnormal.length > 0 ? `Выявлено отклонений: ${abnormal.length} (${abnormal.map((b) => b.name).join(', ')}).` : 'Все биомаркеры в норме.'}

Задайте уточняющий вопрос о расшифровке маркера, подготовке к сдаче или консультации специалиста.

⚕️ Данная консультация носит информационный характер и не заменяет очный визит к врачу.`;
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
      const contextStr = `Пациент: ${userProfile.firstName || 'Пациент'}, пол: ${patientGender}, возраст: ${patientAge} лет, рост: ${userProfile.height || 189} см, вес: ${userProfile.weight || 83} кг, ИМТ: ${patientBmi} кг/м², группа крови: ${userProfile.bloodType || 'A(II) Rh+'}.
Биомаркеры пациента:
${biomarkers.map((b) => `${b.name}: ${b.value} ${b.unit} (норма: ${b.refMin}-${b.refMax}, статус: ${b.status})`).join('\n')}
Отклонения: ${abnormal.map((b) => b.name).join(', ') || 'нет'}.
Резюме бланка: ${clinicalSummary || 'Показатели в норме'}`;

      let aiResponseText = '';
      let responseModel = '';
      let apiErrorMessage = '';

      // Способ 1: Google Apps Script Cloud Relay
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
              email: userProfile.email || '',
            }),
          });
          if (gasRes.ok) {
            const gasData = await gasRes.json();
            if (gasData.success && gasData.text) {
              aiResponseText = gasData.text;
              responseModel = gasData.model || '';
            } else if (gasData.error) {
              apiErrorMessage = gasData.message || gasData.error;
            }
          }
        } catch (gasErr: any) {
          console.warn('Apps Script relay:', gasErr);
          apiErrorMessage = gasErr.message || 'Ошибка соединения с облачным шлюзом';
        }
      }

      // Способ 2: Прямой запрос к Gemini API (каскад моделей Google AI Studio 2026 с Exponential Backoff)
      if (!aiResponseText && apiKey.trim()) {
        const candidateModels = [
          'gemini-4-hydrogen',
          'gemini-3.8-flash',
          'gemini-4-argon',
        ];

        for (const model of candidateModels) {
          let attemptSuccess = false;
          for (let attempt = 1; attempt <= 2; attempt++) {
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
                    generationConfig: {
                      temperature: 0.4,
                      maxOutputTokens: 2500,
                      thinkingConfig: {
                        thinkingLevel: 'low',
                      },
                    },
                  }),
                }
              );

              if (res.ok) {
                const data = await res.json();
                const parts = data?.candidates?.[0]?.content?.parts || [];
                let reply = '';
                for (const part of parts) {
                  if (part.thought === true) continue;
                  if (part.text) reply += part.text;
                }
                if (reply.trim()) {
                  aiResponseText = reply.trim();
                  responseModel = model;
                  attemptSuccess = true;
                  break;
                }
              } else if (res.status === 503 || res.status === 429) {
                apiErrorMessage = `${model}: сервер под высокой нагрузкой (HTTP ${res.status}), пауза и повтор...`;
                if (attempt < 2) {
                  await new Promise((r) => setTimeout(r, 1500));
                }
              } else {
                const errText = await res.text();
                if (errText.includes('location')) {
                  apiErrorMessage = 'Региональное ограничение Google (используйте Cloud Шлюз Google Apps Script)';
                } else {
                  apiErrorMessage = `${model}: HTTP ${res.status}`;
                }
                break;
              }
            } catch (directErr: any) {
              apiErrorMessage = directErr.message || 'Сетевая ошибка';
              break;
            }
          }
          if (attemptSuccess) break;
        }
      }

      // Если нейросеть ответила:
      if (aiResponseText) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: aiResponseText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            model: responseModel,
          },
        ]);
        return;
      }

      // Способ 3: Автономный клинический движок (оффлайн-фоллбек)
      await new Promise((r) => setTimeout(r, 600));
      const localReply = generateLocalMedicalResponse(text);

      let finalReply = localReply;
      if ((apiKey.trim() || appsScriptUrl) && apiErrorMessage) {
        finalReply = `⚠️ *Облачный ИИ недоступен:* ${apiErrorMessage}\n\nОтвет автономного клинического модуля:\n\n` + localReply;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'ai',
          text: finalReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'offline',
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
          model: 'offline',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const connectionLabel = connectionMode === 'cloud'
    ? 'Gemini 4 (Cloud Шлюз)'
    : connectionMode === 'direct'
    ? 'Gemini 4 API (Direct)'
    : 'Автономный движок';

  const ConnectionIcon = connectionMode === 'offline' ? WifiOff : Wifi;

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
                <h3 className="text-sm font-extrabold truncate">ИИ-Врач</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/20 text-white flex items-center gap-0.5">
                  <Sparkles size={9} /> AI
                </span>
              </div>
              <p className="text-[10px] text-purple-100 truncate flex items-center gap-1">
                <ConnectionIcon size={9} />
                <span>{connectionLabel}</span>
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
                <Key size={12} /> Google Gemini API Key
              </span>
              <span className={`text-[10px] font-medium ${connectionMode === 'cloud' ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-300'}`}>
                {connectionMode === 'cloud' ? '🟢 Cloud Шлюз подключён' : connectionMode === 'direct' ? '🟡 Прямое API' : '⚪ Оффлайн'}
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
              {connectionMode === 'cloud'
                ? 'Ключ безопасно хранится в Google Apps Script (Свойства проекта: GEMINI_API_KEY). Поле ввода здесь опционально.'
                : 'Ключ опционален при подключённом Cloud Шлюзе (Apps Script).'}
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
                    {m.model && m.model !== 'offline' && (
                      <span className="text-[8px] font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-500 dark:text-purple-300 px-1.5 py-0.5 rounded-md ml-1">
                        {m.model}
                      </span>
                    )}
                    {m.model === 'offline' && (
                      <span className="text-[8px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md ml-1">
                        оффлайн
                      </span>
                    )}
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
          <div ref={chatEndRef} />
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
          <span className="truncate">ИИ не ставит клинический диагноз. Всегда консультируйтесь с врачом.</span>
        </div>
      </div>
    </div>
  );
};
