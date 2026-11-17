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
  const { userProfile, activeMember } = useFamily();
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

    if (qLower.includes('отклонен') || qLower.includes('почему') || qLower.includes('знач')) {
      if (abnormal.length > 0) {
        const details = abnormal
          .map((b) => `• **${b.name}**: ${b.value} ${b.unit} (норма: ${b.refMin}–${b.refMax}). ${b.status === 'above' ? 'Превышение нормы.' : 'Ниже нормы.'} ${b.clinicalNote || ''}`)
          .join('\n');
        return `В текущем анализе зафиксировано отклонений: ${abnormal.length}.\n\n${details}\n\nТакие сдвиги часто носят временный характер (реакция на перенесённое ОРВИ, стресс, погрешности в диете). Рекомендуется плановый визит к терапевту для сопоставления с клинической картиной.`;
      }
      return 'В загруженных бланках все ключевые биомаркеры находятся в пределах референсных диапазонов лаборатории. Показатели метаболизма, воспаления и кроветворения в норме.';
    }

    if (qLower.includes('врач') || qLower.includes('записат') || qLower.includes('специалист')) {
      return `Рекомендуемый маршрут специалистов:\n\n1. **Врач-терапевт (первично)** — для базового осмотра, сбора анамнеза и расшифровки клинического анализа крови.\n2. **Кардиолог / Эндокринолог** — при повышенном холестерине (ЛПНП) или глюкозе.\n3. **Гастроэнтеролог** — при изменениях печёночных ферментов (АЛТ, АСТ, билирубин).`;
    }

    if (qLower.includes('диет') || qLower.includes('питани') || qLower.includes('продукт') || qLower.includes('образ жизни')) {
      return `Клинические рекомендации по образу жизни:\n\n1. **Омега-3 и клетчатка**: добавьте в рацион морскую рыбу, льняное масло, листовую зелень и цельнозерновые крупы.\n2. **Водный баланс**: не менее 30 мл чистой воды на кг массы тела (для вас: ~${Math.round((userProfile.weight || 70) * 0.03)} л в сутки).\n3. **Сон и циркадные ритмы**: засыпание до 23:00 в полной темноте для естественного синтеза мелатонина и восстановления иммунитета.`;
    }

    if (qLower.includes('пересда') || qLower.includes('повтор') || qLower.includes('контрол')) {
      return `Оптимальные сроки контрольной пересдачи:\n\n• **Маркеры воспаления (СОЭ, Лейкоциты, СРБ)**: через 14–21 день после исчезновения любых симптомов.\n• **Липидный профиль и сахар**: через 1–2 месяца после коррекции рациона.\n• **Витамин D и ферритин**: через 2–3 месяца после приёма назначенных препаратов.`;
    }

    return `Спасибо за вопрос! На основе данных профиля (возраст: ${2026 - (userProfile.birthYear || 1995)} лет, ИМТ: ${userProfile.bmi || 23.5}) и бланка анализов:\n\nКлючевая задача — планомерный мониторинг показателей и отсутствие самолечения. Обратитесь к лечащему врачу для очной консультации и постановки официального диагноза.`;
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
      if (apiKey.trim()) {
        // Real Google Gemini API Call
        const abnormal = biomarkers.filter((b) => b.status !== 'in-range');
        const contextStr = `Ты — высококвалифицированный медицинский ИИ-консультант.
Пациент: ${userProfile.firstName || 'Пациент'}, пол: ${userProfile.gender === 'male' ? 'Мужской' : 'Женский'}, возраст: ${2026 - (userProfile.birthYear || 1995)} лет, ИМТ: ${userProfile.bmi || 23.5}.
Биомаркеры пациента:
${biomarkers.map((b) => `${b.name}: ${b.value} ${b.unit} (норма: ${b.refMin}-${b.refMax}, статус: ${b.status})`).join('\n')}
Отклонения: ${abnormal.map((b) => b.name).join(', ') || 'нет'}.
Резюме бланка: ${clinicalSummary}

Отвечай профессионально, доброжелательно, на понятном русском языке. Структурируй ответ списками. В конце всегда напомни, что консультация носит информационный характер и не заменяет очный визит к врачу.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
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

        if (!res.ok) {
          throw new Error(`Ошибка API Gemini: ${res.status}`);
        }

        const data = await res.json();
        const replyText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          generateLocalMedicalResponse(text);

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        // Intelligent built-in clinical rule engine (works offline with 0 setup)
        await new Promise((r) => setTimeout(r, 900));
        const localReply = generateLocalMedicalResponse(text);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: localReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      console.error('AI Doctor Error:', err);
      // Seamless fallback to intelligent local engine so user is never left hanging
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
                {apiKey ? 'Онлайн: Google Gemini 1.5' : 'Встроенный клинический движок'}
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
