import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, 
  User, 
  FileText, 
  ShieldAlert, 
  Stethoscope, 
  ClipboardList, 
  Save, 
  Upload, 
  Trash2, 
  Printer, 
  Heart, 
  AlertTriangle,
  ChevronRight,
  Info,
  Lock,
  CheckCircle2,
  XCircle,
  Download
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- TYPES ---
type TNMValue = 'Tis' | 'T1' | 'T1a' | 'T1b' | 'T1c' | 'T2' | 'T3' | 'T4' | '';
type NValue = 'N0' | 'N1' | 'N2' | 'N3' | '';
type MValue = 'M0' | 'M1';
type HER2Status = 'neg' | '2+' | 'pos' | 'fish-pos' | 'fish-neg';
type Grade = 'G1' | 'G2' | 'G3' | 'G4' | '';

interface PatientData {
  name: string;
  age: number;
  sex: 'Female' | 'Male';
  race: string;
  height: number;
  weight: number;
  
  // Clinical
  t: TNMValue;
  n: NValue;
  m: MValue;
  er: number;
  pr: number;
  ki67: number;
  her2: HER2Status;
  grade: Grade;
  lvi: boolean;
  pni: boolean;
  brca: boolean;
  postmenopausal: boolean;
  histology: string;

  // Cardiotoxicity
  hypertension: boolean;
  diabetes: boolean;
  priorAnthracyclines: boolean;
  priorChestRadiation: boolean;
  baselineLVEF: number;
}

const INITIAL_DATA: PatientData = {
  name: '',
  age: 55,
  sex: 'Female',
  race: '',
  height: 165,
  weight: 65,
  t: '',
  n: '',
  m: 'M0',
  er: 0,
  pr: 0,
  ki67: 0,
  her2: 'neg',
  grade: '',
  lvi: false,
  pni: false,
  brca: false,
  postmenopausal: false,
  histology: 'Инвазивная протоковая карцинома',
  hypertension: false,
  diabetes: false,
  priorAnthracyclines: false,
  priorChestRadiation: false,
  baselineLVEF: 60,
};

// --- COMPONENTS ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [data, setData] = useState<PatientData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<'diag' | 'strat' | 'tact' | 'cardio' | 'tox' | 'mon'>('diag');

  // BSA Calculation (Mosteller)
  const bsa = useMemo(() => {
    return Math.sqrt((data.height * data.weight) / 3600).toFixed(2);
  }, [data.height, data.weight]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'onco2021') {
      setIsAuthenticated(true);
    } else {
      alert('Неверный пароль. Подсказка: onco2021');
    }
  };

  const updateData = (updates: Partial<PatientData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const clearData = () => {
    if (window.confirm('Вы уверены, что хотите очистить все данные?')) {
      setData(INITIAL_DATA);
    }
  };

  const saveToFile = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_${data.name || 'unnamed'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const loadFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setData({ ...INITIAL_DATA, ...imported });
      } catch (err) {
        alert('Ошибка при импорте файла.');
      }
    };
    reader.readAsText(file);
  };

  const printReport = () => {
    window.print();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-teal-600 p-4 rounded-2xl shadow-lg">
              <Lock className="text-white w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center text-slate-800 mb-2">Вход в систему</h1>
          <p className="text-slate-500 text-center text-sm mb-8">Введите пароль для доступа к клиническим рекомендациям</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-bold transition-all"
            />
            <button className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-100">
              Войти
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 text-white p-2 rounded-xl shadow-lg shadow-teal-100">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">Onco-Decision Support</h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Guideline Implementation v2021.RU</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-100 p-2 rounded-2xl gap-4 border border-slate-200">
              <div className="flex flex-col px-2">
                <span className="text-[9px] font-black text-slate-400 uppercase">BSA (м²)</span>
                <span className="font-black text-teal-700 text-sm">{bsa}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveToFile} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm" title="Сохранить">
                <Save className="w-5 h-5" />
              </button>
              <label className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer" title="Загрузить">
                <Upload className="w-5 h-5" />
                <input type="file" className="hidden" onChange={loadFromFile} accept=".json" />
              </label>
              <button onClick={printReport} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm" title="Печать">
                <Printer className="w-5 h-5" />
              </button>
              <button onClick={clearData} className="p-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 hover:bg-rose-100 transition-all shadow-sm" title="Очистить">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: INPUTS */}
        <aside className="lg:col-span-4 space-y-6 print:hidden">
          {/* Patient Info */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Данные пациента
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ФИО</label>
                <input 
                  type="text" 
                  value={data.name}
                  onChange={(e) => updateData({ name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Возраст</label>
                  <input 
                    type="number" 
                    value={data.age}
                    onChange={(e) => updateData({ age: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Пол</label>
                  <select 
                    value={data.sex}
                    onChange={(e) => updateData({ sex: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="Female">Женский</option>
                    <option value="Male">Мужской</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Рост (см)</label>
                  <input 
                    type="number" 
                    value={data.height}
                    onChange={(e) => updateData({ height: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Вес (кг)</label>
                  <input 
                    type="number" 
                    value={data.weight}
                    onChange={(e) => updateData({ weight: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Раса</label>
                  <input 
                    type="text" 
                    value={data.race}
                    onChange={(e) => updateData({ race: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Гистологический вариант</label>
                  <select 
                    value={data.histology}
                    onChange={(e) => updateData({ histology: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="Инвазивная протоковая карцинома">Инвазивная протоковая</option>
                    <option value="Инвазивная дольковая карцинома">Инвазивная дольковая</option>
                    <option value="Муцинозная карцинома">Муцинозная</option>
                    <option value="Метапластическая карцинома">Метапластическая</option>
                    <option value="Другой">Другой</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* TNM */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-slate-400" /> TNM Классификация
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Первичная опухоль (T)</label>
                <select 
                  value={data.t}
                  onChange={(e) => updateData({ t: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">Не оценено</option>
                  <option value="Tis">Tis — Рак in situ</option>
                  <option value="T1">T1 — ≤ 20 мм</option>
                  <option value="T1a">T1a — &gt; 1 мм, но ≤ 5 мм</option>
                  <option value="T1b">T1b — &gt; 5 мм, но ≤ 10 мм</option>
                  <option value="T1c">T1c — &gt; 10 мм, но ≤ 20 мм</option>
                  <option value="T2">T2 — &gt; 20 мм, но ≤ 50 мм</option>
                  <option value="T3">T3 — &gt; 50 мм</option>
                  <option value="T4">T4 — Любой размер + прорастание в кожу/стенку</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Регионарные л/у (N)</label>
                <select 
                  value={data.n}
                  onChange={(e) => updateData({ n: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">Не оценено</option>
                  <option value="N0">N0 — Нет метастазов</option>
                  <option value="N1">N1 — Метастазы в I, II уровнях (подвижные)</option>
                  <option value="N2">N2 — Фиксированные или спаянные л/у</option>
                  <option value="N3">N3 — Метастазы в подкл./надкл. л/у</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Отдаленные метастазы (M)</label>
                <select 
                  value={data.m}
                  onChange={(e) => updateData({ m: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="M0">M0 — Нет клинических признаков</option>
                  <option value="M1">M1 — Есть признаки метастазирования</option>
                </select>
              </div>
            </div>
          </section>

          {/* IHC */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-slate-400" /> Патоморфология (ИГХ)
              </h3>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Эстроген (ER)</span>
                  <span className="text-xs font-black text-teal-600">{data.er}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={data.er}
                  onChange={(e) => updateData({ er: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Прогестерон (PR)</span>
                  <span className="text-xs font-black text-teal-600">{data.pr}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={data.pr}
                  onChange={(e) => updateData({ pr: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ki-67</span>
                  <span className="text-xs font-black text-teal-600">{data.ki67}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={data.ki67}
                  onChange={(e) => updateData({ ki67: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">HER2/neu</label>
                <select 
                  value={data.her2}
                  onChange={(e) => updateData({ her2: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="neg">0 / 1+ (Отрицательный)</option>
                  <option value="2+">2+ (Неопределенный)</option>
                  <option value="pos">3+ (Положительный)</option>
                  <option value="fish-pos">FISH+ (Амплификация есть)</option>
                  <option value="fish-neg">FISH- (Амплификации нет)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Степень (Grade)</label>
                <select 
                  value={data.grade}
                  onChange={(e) => updateData({ grade: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">Не указано</option>
                  <option value="G1">G1 — Высокая дифференцировка</option>
                  <option value="G2">G2 — Умеренная дифференцировка</option>
                  <option value="G3">G3 — Низкая дифференцировка</option>
                  <option value="G4">G4 — Недифференцированная</option>
                </select>
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" checked={data.brca}
                    onChange={(e) => updateData({ brca: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-teal-600 transition-colors">BRCA1/2 Мутация</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" checked={data.postmenopausal}
                    onChange={(e) => updateData({ postmenopausal: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-teal-600 transition-colors">Постменопауза</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" checked={data.lvi}
                    onChange={(e) => updateData({ lvi: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-teal-600 transition-colors">Лимфоваскулярная инвазия (LVI)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" checked={data.pni}
                    onChange={(e) => updateData({ pni: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-teal-600 transition-colors">Периневральная инвазия (PNI)</span>
                </label>
              </div>
            </div>
          </section>
        </aside>

        {/* RIGHT PANEL: ANALYSIS & RESULTS */}
        <section className="lg:col-span-8 space-y-6">
          {/* TABS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex gap-1 overflow-x-auto no-scrollbar print:hidden">
            {[
              { id: 'diag', label: '1. Диагноз', icon: FileText },
              { id: 'strat', label: '2. Стратегия', icon: Activity },
              { id: 'tact', label: '3. Тактика', icon: ClipboardList },
              { id: 'cardio', label: '4. Кардио', icon: Heart },
              { id: 'tox', label: '5. Токсичность', icon: ShieldAlert },
              { id: 'mon', label: '6. Мониторинг', icon: Stethoscope },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 min-w-[100px] py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  activeTab === tab.id ? "bg-teal-600 text-white shadow-lg shadow-teal-100" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === 'diag' && <DiagnosisView data={data} />}
              {activeTab === 'strat' && <StrategyView data={data} />}
              {activeTab === 'tact' && <TacticalView data={data} bsa={bsa} />}
              {activeTab === 'cardio' && <CardioView data={data} updateData={updateData} />}
              {activeTab === 'tox' && <ToxicityView />}
              {activeTab === 'mon' && <MonitoringView />}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* PRINT ONLY CONTENT */}
      <div className="hidden print:block p-8 bg-white">
        <h1 className="text-3xl font-black mb-4">Отчет о состоянии пациента: {data.name || 'Не указано'}</h1>
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-bold border-b mb-2">Общие данные</h2>
            <p>Возраст: {data.age}</p>
            <p>Пол: {data.sex === 'Female' ? 'Женский' : 'Мужской'}</p>
            <p>BSA: {bsa} м²</p>
          </div>
          <div>
            <h2 className="text-xl font-bold border-b mb-2">Диагноз</h2>
            <p>Стадия: {calculateStage(data)}</p>
            <p>Подтип: {calculateSubtype(data)}</p>
            <p>TNM: c{data.t || 'x'}c{data.n || 'x'}c{data.m || 'x'}</p>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-bold border-b mb-2">Биологические маркеры</h2>
          <p>ER: {data.er}%, PR: {data.pr}%, Ki-67: {data.ki67}%</p>
          <p>HER2: {data.her2}, Grade: {data.grade}</p>
        </div>
      </div>
    </div>
  );
}

// --- LOGIC FUNCTIONS ---

function calculateStage(data: PatientData): string {
  if (data.m === 'M1') return 'IV';
  if (data.t === 'Tis' && data.n === 'N0') return '0';
  if (data.t && data.t.includes('T1') && data.n === 'N0') return 'IA';
  if ((data.t === 'T2' && data.n === 'N0') || (data.t.includes('T1') && data.n === 'N1')) return 'IIA';
  if ((data.t === 'T3' && data.n === 'N0') || (data.t === 'T2' && data.n === 'N1')) return 'IIB';
  if (data.t === 'T4' || data.n === 'N2' || data.n === 'N3') return 'III';
  return '--';
}

function calculateSubtype(data: PatientData): string {
  const erPos = data.er >= 1;
  const herPos = (data.her2 === 'pos' || data.her2 === 'fish-pos');
  const kiHigh = data.ki67 >= 20;

  if (!erPos && data.pr < 1 && (data.her2 === 'neg' || data.her2 === 'fish-neg')) {
    return 'Тройной негативный (ТНМРЖ)';
  } else if (erPos && !herPos && !kiHigh) {
    return 'Люминальный А';
  } else if (erPos && !herPos && kiHigh) {
    return 'Люминальный B (HER2-)';
  } else if (erPos && herPos) {
    return 'Люминальный B (HER2+)';
  } else if (!erPos && herPos) {
    return 'HER2-положительный (нелюминальный)';
  }
  return 'Не определен';
}

// --- VIEW COMPONENTS ---

function DiagnosisView({ data }: { data: PatientData }) {
  const stage = calculateStage(data);
  const subtype = calculateSubtype(data);
  
  const chartData = [
    { subject: 'ER', A: data.er, fullMark: 100 },
    { subject: 'PR', A: data.pr, fullMark: 100 },
    { subject: 'HER2', A: data.her2 === 'pos' || data.her2 === 'fish-pos' ? 100 : (data.her2 === '2+' ? 50 : 10), fullMark: 100 },
    { subject: 'Ki-67', A: data.ki67, fullMark: 100 },
  ];

  const gaps = [
    { name: 'Категория T', ok: !!data.t },
    { name: 'Категория N', ok: !!data.n },
    { name: 'Рецепторы ER', ok: data.er > 0 },
    { name: 'Индекс Ki-67', ok: data.ki67 > 0 },
    { name: 'FISH тест', ok: data.her2 !== '2+' },
  ];

  const generatePathologyReport = () => {
    const report = `
КЛИНИЧЕСКИЙ ДИАГНОЗ (СИНТЕЗ):
--------------------------------
Пациент: ${data.name || 'Аноним'}
Возраст: ${data.age}
Стадия: ${stage} (c${data.t || 'x'}c${data.n || 'x'}c${data.m || 'x'})
Биологический подтип: ${subtype}
Grade: ${data.grade || 'не указано'}
LVI: ${data.lvi ? 'Присутствует' : 'Отсутствует'}
PNI: ${data.pni ? 'Присутствует' : 'Отсутствует'}
BRCA: ${data.brca ? 'Мутация выявлена' : 'Не выявлена/не тестировалась'}

ИГХ ПАНЕЛЬ:
ER: ${data.er}%, PR: ${data.pr}%, Ki-67: ${data.ki67}%, HER2: ${data.her2}
    `.trim();
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathology_report_${data.name || 'unnamed'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Анализ дефицита данных (Gap Analysis)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {gaps.map(gap => (
            <div key={gap.name} className={cn(
              "flex items-center gap-2 p-3 rounded-xl border text-[10px] font-bold uppercase transition-all",
              gap.ok ? "bg-teal-50 border-teal-100 text-teal-600" : "bg-rose-50 border-rose-100 text-rose-600"
            )}>
              {gap.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {gap.name}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-1 rounded uppercase tracking-tighter">Клиническая стадия</span>
              <div className="text-7xl font-black text-slate-800 mt-2 tracking-tighter">{stage}</div>
              <div className="text-sm font-bold text-slate-400 mt-1 italic">c{data.t || 'x'}c{data.n || 'x'}c{data.m || 'x'}</div>
            </div>
            <div className="pt-6 border-t border-slate-100">
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded uppercase tracking-tighter">Биологический подтип</span>
              <div className="text-2xl font-black text-slate-800 mt-1">{subtype}</div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed italic">
                {subtype.includes('Тройной') ? "Агрессивный подтип. При T > 2 см или N+ показана неоадъювантная химиотерапия (НАХТ)." : 
                 subtype === 'Люминальный А' ? "Наиболее благоприятный подтип. Основа лечения — хирургия и эндокринная терапия." : 
                 "Комплексное лечение (Химиотерапия + Таргетная терапия + Операция)."}
              </p>
            </div>
            <button 
              onClick={generatePathologyReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-all"
            >
              <Download className="w-4 h-4" /> Сгенерировать текст заключения
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Markers"
                  dataKey="A"
                  stroke="#14b8a6"
                  fill="#14b8a6"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StrategyView({ data }: { data: PatientData }) {
  const stage = calculateStage(data);
  const subtype = calculateSubtype(data);

  const steps = useMemo(() => {
    if (stage === 'I' || (stage === 'IIA' && subtype === 'Люминальный А')) {
      return [
        { t: 'Хирургическое лечение (Радикальное)', d: 'Радикальная резекция или Мастэктомия + БСЛУ.' },
        { t: 'Адъювантная системная терапия', d: 'Гормонотерапия (Тамоксифен или ИА). Лучевая терапия при резекции.' }
      ];
    } else if (stage === 'IV') {
      return [{ t: 'Паллиативная лекарственная терапия', d: 'Контроль симптомов и системное лечение согласно подтипу.' }];
    } else {
      return [
        { t: 'Неоадъювантная химиотерапия (НАХТ)', d: 'С целью уменьшения стадии и оценки ответа (pCR). Схемы AC-T или TCH-P.' },
        { t: 'Радикальное хирургическое вмешательство', d: 'Срок: 3-6 недель после завершения ХТ.' },
        { t: 'Адъювантная терапия', d: 'Завершение циклов трастузумаба или Капецитабин при резидуальной опухоли.' }
      ];
    }
  }, [stage, subtype]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
    >
      <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
        <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">S</span>
        Стратегия лечения (Маршрут)
      </h3>
      <div className="space-y-6">
        {steps.map((s, idx) => (
          <div key={idx} className="flex gap-6 items-start bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black flex-none text-xs">{idx + 1}</div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{s.t}</h4>
              <p className="text-xs text-slate-500 mt-1">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TacticalView({ data, bsa }: { data: PatientData, bsa: string }) {
  const subtype = calculateSubtype(data);
  const bsaNum = parseFloat(bsa);

  const regimen = useMemo(() => {
    if (subtype.includes('Тройной') || subtype.includes('HER2-')) {
      return [
        { n: 'Доксорубицин (AC)', d: 60, unit: 'мг/м²' },
        { n: 'Циклофосфамид (AC)', d: 600, unit: 'мг/м²' }
      ];
    } else if (subtype.includes('HER2+')) {
      return [
        { n: 'Доцетаксел', d: 75, unit: 'мг/м²' },
        { n: 'Трастузумаб', d: 6, unit: 'мг/кг' },
        { n: 'Пертузумаб', d: 420, unit: 'мг (фикс)' }
      ];
    }
    return [];
  }, [subtype]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
          <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">T</span>
          Тактические назначения
        </h3>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Расчетная доза на BSA</p>
          <p className="text-sm font-black text-teal-600">{bsa} м²</p>
        </div>
      </div>
      <div className="space-y-4">
        {regimen.length > 0 ? regimen.map((r, idx) => {
          const dose = r.n.includes('фикс') ? r.d : (r.unit.includes('кг') ? (r.d * data.weight) : (r.d * bsaNum)).toFixed(0);
          return (
            <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{r.n}</p>
                <p className="text-xs font-bold text-slate-700">{r.d} {r.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-indigo-600">{dose} мг</p>
              </div>
            </div>
          );
        }) : (
          <div className="text-xs italic text-slate-400 text-center py-10">Специфические химиотерапевтические схемы не показаны (рассмотрите гормонотерапию).</div>
        )}
      </div>
    </motion.div>
  );
}

function CardioView({ data, updateData }: { data: PatientData, updateData: (u: Partial<PatientData>) => void }) {
  const riskScore = useMemo(() => {
    let score = 0;
    if (data.age > 65) score += 2;
    if (data.hypertension) score += 1;
    if (data.diabetes) score += 1;
    if (data.priorAnthracyclines) score += 3;
    if (data.priorChestRadiation) score += 2;
    if (data.baselineLVEF < 55) score += 3;
    return score;
  }, [data]);

  const riskLevel = riskScore >= 4 ? 'Высокий' : (riskScore >= 2 ? 'Умеренный' : 'Низкий');

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
    >
      <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
        <Heart className="w-6 h-6 text-rose-500" /> Кардиотоксический риск (Раздел 3.6)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Факторы риска</h4>
            <div className="space-y-3">
              {[
                { label: 'Гипертензия', key: 'hypertension' as const },
                { label: 'Сахарный диабет', key: 'diabetes' as const },
                { label: 'Ранее получал антрациклины', key: 'priorAnthracyclines' as const },
                { label: 'ЛТ на область грудной клетки', key: 'priorChestRadiation' as const },
              ].map(f => (
                <label key={f.key} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={data[f.key]}
                    onChange={(e) => updateData({ [f.key]: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600"
                  />
                  <span className="text-sm font-medium text-slate-700">{f.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Базовая ФВЛЖ (%)</label>
            <input 
              type="number" value={data.baselineLVEF}
              onChange={(e) => updateData({ baselineLVEF: parseInt(e.target.value) })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center p-6 bg-rose-50 rounded-3xl border border-rose-100">
          <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Оценка риска</span>
          <div className={cn(
            "text-4xl font-black mb-2",
            riskLevel === 'Высокий' ? "text-rose-600" : (riskLevel === 'Умеренный' ? "text-amber-600" : "text-teal-600")
          )}>
            {riskLevel}
          </div>
          <p className="text-xs text-slate-500 max-w-[200px]">
            {riskLevel === 'Высокий' ? "Необходим мониторинг ЭхоКГ каждые 3 месяца и консультация кардиолога." : "Стандартный мониторинг согласно протоколу."}
          </p>
          <div className="mt-6 text-2xl font-black text-slate-400">{riskScore} баллов</div>
        </div>
      </div>
    </motion.div>
  );
}

function ToxicityView() {
  const events = [
    { n: 'Нейтропения', g1: 'АЧН < 2.0', g3: 'АЧН < 1.0', m: 'Назначение Г-КСФ (Филграстим 5 мкг/кг/сут). Отсрочка курса ХТ до восстановления АЧН > 1.5.' },
    { n: 'Ладонно-подошвенный синдром', g1: 'Покраснение, безболезненный отек', g3: 'Язвы, сильная боль, нарушение самообслуживания', m: 'Увлажняющие кремы (10% мочевина), снижение дозы капецитабина на 25-50%.' },
    { n: 'Диарея', g1: '< 4 дефекаций/сут сверх нормы', g3: '7-9 дефекаций/сут сверх нормы', m: 'Лоперамид (4 мг сразу, затем 2 мг каждые 4ч), гидратация, диета BRAT.' },
    { n: 'Стоматит', g1: 'Безболезненная эритема', g3: 'Болезненные язвы, невозможность приема пищи', m: 'Полоскание содо-солевым раствором, исключение раздражающей пищи, местные анестетики.' },
    { n: 'Анемия', g1: 'Hb 100-119 г/л', g3: 'Hb < 80 г/л', m: 'Препараты железа, при Grade 3 — трансфузия эритроцитарной массы.' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
    >
      <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-amber-500" /> Менеджмент токсичности
      </h3>
      <div className="space-y-4">
        {events.map(e => (
          <div key={e.n} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-slate-800">{e.n}</h4>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded uppercase">CTCAE v5.0</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[10px] mb-4">
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="font-bold text-slate-400 block mb-1">Grade 1</span>
                {e.g1}
              </div>
              <div className="p-2 bg-white rounded-lg border border-rose-100 text-rose-600">
                <span className="font-bold text-rose-400 block mb-1">Grade 3</span>
                {e.g3}
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-600">
              <Info className="w-4 h-4 text-teal-500 flex-none" />
              <p><span className="font-bold text-teal-600">Тактика:</span> {e.m}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MonitoringView() {
  const [year, setYear] = useState(1);
  
  const schedule = useMemo(() => {
    if (year === 1) return [
      { n: 'Физикальный осмотр', f: '1 раз в 3-6 мес.' },
      { n: 'Маммография / УЗИ', f: '1 раз в 6-12 мес.' },
      { n: 'Рентген грудной клетки', f: 'По показаниям' }
    ];
    if (year === 3) return [
      { n: 'Физикальный осмотр', f: '1 раз в 6-12 мес.' },
      { n: 'Маммография', f: '1 раз в 12 мес.' }
    ];
    return [{ n: 'Диспансерный прием', f: 'Ежегодно (пожизненно)' }];
  }, [year]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
    >
      <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
        <Stethoscope className="w-6 h-6 text-teal-500" /> План наблюдения (Раздел 5)
      </h3>
      
      <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 gap-1">
        {[
          { id: 1, label: '1-2 Год' },
          { id: 3, label: '3-5 Года' },
          { id: 6, label: '> 5 Лет' },
        ].map(y => (
          <button 
            key={y.id}
            onClick={() => setYear(y.id)}
            className={cn(
              "flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all",
              year === y.id ? "bg-white shadow-sm text-teal-600" : "text-slate-400"
            )}
          >
            {y.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedule.map(i => (
          <div key={i.n} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-600 uppercase">{i.n}</span>
            <span className="text-[10px] font-black text-teal-600">{i.f}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
