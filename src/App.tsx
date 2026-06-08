import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Coffee,
  Flame,
  Layers,
  RotateCw,
  Save,
  Download,
  Info,
  Palette,
  Lightbulb,
  Check,
  Trash2,
  Dices,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { MugVisualizer } from "./components/MugVisualizer";
import { PRESETS, CLAY_OPTIONS, GLAZE_OPTIONS, ACCENT_OPTIONS, LIGHTING_OPTIONS } from "./data";
import { CeramicDesign, ClayType, GlazeStyle, MetallicAccent, LightingStyle } from "./types";

export default function App() {
  // Input controls state
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [clay, setClay] = useState<ClayType>(PRESETS[0].clay as ClayType);
  const [glaze, setGlaze] = useState<GlazeStyle>(PRESETS[0].glaze as GlazeStyle);
  const [accent, setAccent] = useState<MetallicAccent>(PRESETS[0].accent as MetallicAccent);
  const [lighting, setLighting] = useState<LightingStyle>(PRESETS[0].lighting as LightingStyle);

  // Status and loaded recipe content
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStepIndex, setGeneratingStepIndex] = useState(0);
  const [designResult, setDesignResult] = useState<CeramicDesign | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);

  // Simulation step messages
  const generatingSteps = [
    "Amasando arcilla orgánica fina...",
    "Moldeando silueta de gato e incorporando cola-mango...",
    "Aplicando baño de esmalte de alta presión...",
    "Sinterizando en horno cerámico de Cono 6 (1220°C)...",
    "Fijando metal líquido y puliendo detalles ornamentales...",
    "Alineando focos de iluminación de estudio 3D..."
  ];

  // Load previous designs from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ceracats_saved");
      if (stored) {
        setSavedDesigns(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading saved gallery designs:", e);
    }
  }, []);

  // Save layout state helper
  const saveToGallery = () => {
    if (!prompt) return;
    const newSaved = {
      id: "saved-" + Date.now(),
      prompt,
      clay,
      glaze,
      accent,
      lighting,
      createdAt: new Date().toLocaleDateString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      designDetails: designResult
    };

    const updated = [newSaved, ...savedDesigns];
    setSavedDesigns(updated);
    try {
      localStorage.setItem("ceracats_saved", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const deleteFromGallery = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDesigns.filter((d) => d.id !== id);
    setSavedDesigns(updated);
    try {
      localStorage.setItem("ceracats_saved", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const loadSavedDesign = (saved: any) => {
    setPrompt(saved.prompt);
    setClay(saved.clay);
    setGlaze(saved.glaze);
    setAccent(saved.accent);
    setLighting(saved.lighting);
    if (saved.designDetails) {
      setDesignResult(saved.designDetails);
    }
  };

  // Trigger Ceramic Alchemy Generation Simulation & actual Gemini call
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratingStepIndex(0);

    // Multi-step telemetry simulator to enhance the "craftsmanship" feel
    const interval = setInterval(() => {
      setGeneratingStepIndex((prev) => {
        if (prev < generatingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 600);

    try {
      const response = await fetch("/api/generate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, glaze, accent, lighting, clay }),
      });

      if (!response.ok) {
        throw new Error("La alquimia de IA falló momentáneamente.");
      }

      const data: CeramicDesign = await response.json();
      setDesignResult(data);
    } catch (err) {
      console.error(err);
      // Failback gracefully
      setDesignResult({
        glazeRecipe: {
          name: `Esmalte ${glaze} Cristalino con destellos de ${accent}`,
          temp: "1220°C (Cono 6)",
          atmosphere: "Oxidación con Oxígeno",
          ingredients: [
            "Frita de Vidrio Base: 68%",
            "Óxido de sílice: 15%",
            "Kaolín puro: 10%",
            "Carbonato de Litio: 4%",
            "Pigmentos Silicatos: 3%"
          ],
          application: "Se sumerge el cuerpo de arcilla porosa durante 5 segundos. Posteriormente, se pintan minuciosamente los detalles metálicos con un pincel de pelo de ardilla cargado con solución lustrada."
        },
        sculptingGuide: [
          `Amasar la arcilla en técnica de caracola para eliminar el aire residual.`,
          `Modelar la bola de arcilla en el torno y levantar una taza simétrica y minimalista.`,
          `Adherir las orejas modeladas individualmente, humedeciendo las uniones con barbotina.`,
          `Pegar la cola de gato en forma de voluta como mango con presión uniforme.`,
          `Pulir minuciosamente las uniones con una esponja y dejar secar bajo atmósfera húmeda.`
        ],
        designCritique: `Este diseño de taza de gato encarna el estilo minimalista zen. El color de la arcilla ${clay} armoniza con el acabado ${glaze}, y los detalles de ${accent} en orejas y bigotes aportan cortes de luz sofisticados bajo la iluminación del estudio de ${lighting}. Ideal para cafés de especialidad.`,
        firingProfile: {
          stages: [
            { duration: "2:00 horas", temp: "Humedado: de 20°C a 120°C a fuego lento." },
            { duration: "4:00 horas", temp: "Deshidratación de la arcilla hasta 600°C." },
            { duration: "3:00 horas", temp: "Vitrificación final a 1220°C. Sostener 15 min." },
            { duration: "24:00 horas", temp: "Enfriamiento pasivo natural con compuerta cerrada." }
          ]
        },
        isMock: true
      });
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  // Preset randomizer for quick inspiration
  const selectRandomPreset = () => {
    const remaining = PRESETS.filter((p) => p.prompt !== prompt);
    const chosen = remaining.length > 0 
      ? remaining[Math.floor(Math.random() * remaining.length)] 
      : PRESETS[Math.floor(Math.random() * PRESETS.length)];
    
    setPrompt(chosen.prompt);
    setClay(chosen.clay as ClayType);
    setGlaze(chosen.glaze as GlazeStyle);
    setAccent(chosen.accent as MetallicAccent);
    setLighting(chosen.lighting as LightingStyle);
  };

  // Trigger initial generate on mount to show details
  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="min-h-screen mesh-bg text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-200 flex flex-col antialiased">
      
      {/* GLAMOUR HEADER */}
      <header className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glass text-[#e2b86b] flex items-center justify-center shadow-lg">
              <Coffee className="w-5.5 h-5.5 stroke-[1.8] gold-accent" />
            </div>
            <div>
              <h1 className="text-md font-semibold tracking-tight text-white flex items-center gap-1.5 uppercase font-mono">
                CeraCat AI <span className="text-xs bg-amber-400/20 text-amber-200 font-sans lowercase px-1.5 py-0.5 rounded-full font-normal">atelier</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest">ESTUDIO DE CERÁMICA INTERACTIVO</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={selectRandomPreset}
              className="p-2 hover:bg-white/10 text-slate-300 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium font-mono cursor-pointer"
              title="Cargar diseño sorpresa"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Inspiración</span>
            </button>
            <button
              onClick={saveToGallery}
              disabled={isGenerating}
              className="py-1.5 px-3 glass hover:bg-white/10 text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guardas en Galería</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* BODY WORKSPACE */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

        {/* LEFT COMPONENT: 3D PREVIEW / TELEMETRY & RECIPE (6 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="sticky top-20 flex flex-col gap-6">
            
            {/* 3D-like CANVAS VISUALIZER */}
            <div className="glass-card p-4 rounded-3xl relative group">
              <MugVisualizer
                clay={clay}
                glaze={glaze}
                accent={accent}
                lighting={lighting}
                isSpinning={isGenerating}
              />
              
              {/* Ceramic specs label at foot of previewer overlay */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono p-2 bg-white/5 rounded-xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-slate-400">ARCILLA</span>
                  <span className="font-semibold text-slate-200 truncate">{clay}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-mono">ACENTO METAL</span>
                  <span className="font-semibold text-slate-200 truncate">{accent}</span>
                </div>
              </div>
            </div>

            {/* AI GERMINAL KILN TELEMETRY LOADING STATE */}
            <AnimatePresence mode="wait">
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-black/45 backdrop-blur-xl text-stone-100 p-5 rounded-3xl shadow-xl flex flex-col gap-3 min-h-[180px] justify-between border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono tracking-wider text-amber-400 flex items-center gap-1.5 uppercase font-semibold">
                      <Flame className="w-4 h-4 animate-pulse stroke-[2.5]" />
                      Proceso de Horneado Activo
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      Cone 6 / Sintering
                    </span>
                  </div>

                  <div className="my-2">
                    <div className="text-sm font-semibold font-mono tracking-tight text-white mb-1.5 animate-pulse min-h-[2.5rem]">
                      {generatingSteps[generatingStepIndex]}
                    </div>
                    {/* Simulated live heat thermometer */}
                    <p className="text-[10px] font-mono text-stone-400 leading-relaxed">
                      Temperatura del Horno: <span className="text-orange-400 font-semibold">{(900 + (generatingStepIndex * 60))}°C</span> • Chimenea: <span className="text-emerald-400">Abierta</span> • Reducción: <span className="text-red-400">Inactiva</span>
                    </p>
                  </div>

                  {/* High quality progressive bar */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${((generatingStepIndex + 1) / generatingSteps.length) * 100}%` }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* COMPLETED AI RECIPE ANALYSIS (Fired Ceramic Sheet) */}
            <AnimatePresence>
              {!isGenerating && designResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card text-stone-300 rounded-3xl p-5 border border-white/10 flex flex-col gap-5 text-xs font-sans leading-relaxed"
                >
                  {/* Fired badge */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-amber-400/10 text-amber-400">
                        <Flame className="w-4 h-4 text-[#e2b86b]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-amber-400 font-semibold tracking-wider uppercase">Fórmula de Alquimia de IA</p>
                        <h4 className="font-mono text-stone-100 font-bold uppercase">{designResult.glazeRecipe.name}</h4>
                      </div>
                    </div>
                    {designResult.isMock && (
                      <span className="text-[9px] font-mono border border-white/10 px-2 py-0.5 rounded-full text-slate-500">MOCKUP LOCAL</span>
                    )}
                  </div>

                  {/* AI Critique block */}
                  <div className="bg-white/5 border-l-2 border-[#e2b86b] p-3.5 rounded-r-xl rounded-l-md">
                    <p className="italic text-stone-200 font-mono text-[11px] leading-relaxed">
                      "{designResult.designCritique}"
                    </p>
                  </div>

                  {/* Recipe Chemicals section */}
                  <div>
                    <h5 className="font-mono text-stone-100 font-bold mb-2 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-stone-400">
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      Ingredientes Químicos del Vidriado
                    </h5>
                    <ul className="grid grid-cols-1 divide-y divide-white/5">
                      {designResult.glazeRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="py-1.5 font-mono text-[11px] text-slate-300 flex justify-between">
                          <span>{ing.split(":")[0]}</span>
                          <span className="text-amber-400 font-semibold font-mono">{ing.split(":")[1] || ""}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Application and Kiln guidelines */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10 text-[11px]">
                    <div>
                      <span className="font-mono uppercase text-stone-400 block mb-1 text-[9px] tracking-wider font-semibold">TÉCNICA DE VIDRIADO</span>
                      <p className="text-stone-300 leading-normal">{designResult.glazeRecipe.application}</p>
                    </div>
                    <div>
                      <span className="font-mono uppercase text-stone-400 block mb-1 text-[9px] tracking-wider font-semibold">HORNEADO TÉRMICO</span>
                      <p className="font-mono text-stone-300 leading-normal">
                        Cono: <strong className="text-amber-400 font-sans">{designResult.glazeRecipe.temp}</strong><br />
                        Ambiente: {designResult.glazeRecipe.atmosphere}
                      </p>
                    </div>
                  </div>

                  {/* Sculpting guidelines tabs */}
                  <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                    <span className="font-mono uppercase text-amber-400 block text-[9px] tracking-wider font-semibold flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#e2b86b]" />
                      Paso a Paso en el Torno Cerámico
                    </span>
                    <ol className="list-decimal pl-4 flex flex-col gap-1.5 text-[11px] text-stone-300">
                      {designResult.sculptingGuide.map((step, idx) => (
                        <li key={idx} className="marker:text-[#e2b86b] marker:font-mono pl-1">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COMPONENT: PARAMETERS & GALLERY (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* THE CREATOR BOARD */}
          <div className="glass-card p-6 rounded-3xl flex flex-col gap-6">
            
            <div className="flex md:items-center justify-between border-b border-white/10 pb-4 flex-col md:flex-row gap-2">
              <div>
                <h3 className="text-lg font-bold text-white font-serif leading-none tracking-tight">Personalizador del Atelier</h3>
                <p className="text-xs text-slate-400 mt-1">Modifica cada compuesto cerámico y detona la generación con IA.</p>
              </div>
              <div className="text-[10px] bg-amber-500/10 text-amber-200 font-mono tracking-wider font-bold px-2 py-0.5 rounded-md border border-amber-500/25 uppercase self-start gold-accent">
                CERÁMICAS DE AUTOR
              </div>
            </div>

            {/* PROMPT TEXTAREA INPUT */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase text-slate-300 tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Instrucciones Estéticas para la IA
                </label>
                <span className="text-[10px] font-mono text-slate-500">PRE-CARGADO POR DEFECTO</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Escribe la descripción de tu taza de gato..."
                className="w-full min-h-[90px] p-3 text-xs bg-white/5 border border-white/10 text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans leading-relaxed placeholder:text-slate-500"
              />
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 leading-normal">
                <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Para recrear tu diseño ideal: presiona el gran botón <strong>Generar Alquimia de IA</strong> inferior.</span>
              </div>
            </div>

            {/* COMPONENT 1: CHOOSE CLAY TYPE */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase text-slate-300 tracking-wider font-mono flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                1. Tipo de Arcilla Cerámica (Pasta de Moldeo)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 gap-2">
                {CLAY_OPTIONS.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setClay(item.name)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      clay === item.name
                        ? "border-amber-500/60 bg-amber-500/10 text-white shadow-md scale-[1.01]"
                        : "border-white/10 bg-white/5 hover:bg-white/8 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full border border-white/20 shadow-xs shrink-0"
                        style={{ backgroundColor: item.rgb }}
                      />
                      <div>
                        <span className="text-xs font-bold leading-tight block text-white">{item.name}</span>
                        <span className={`text-[9px] block ${clay === item.name ? "text-slate-300" : "text-slate-400"}`}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    {clay === item.name && (
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* COMPONENT 2: SELECT GLAZE STYLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase text-slate-300 tracking-wider font-mono flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-slate-400" />
                  2. Estilo de Vidriado
                </label>
                <div className="relative">
                  <select
                    value={glaze}
                    onChange={(e) => setGlaze(e.target.value as GlazeStyle)}
                    className="w-full text-xs p-3 bg-white/5 border border-white/10 text-slate-100 rounded-xl focus:outline-none appearance-none font-mono cursor-pointer"
                  >
                    {GLAZE_OPTIONS.map((g) => (
                      <option key={g.name} value={g.name} className="bg-stone-900 text-white">
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 font-mono text-[9px]">
                    ▼
                  </div>
                </div>
              </div>

              {/* COMPONENT 3: SELECT METALLIC ACCENT */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase text-slate-300 tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  3. Acentos de Sobrecubierta
                </label>
                <div className="relative">
                  <select
                    value={accent}
                    onChange={(e) => setAccent(e.target.value as MetallicAccent)}
                    className="w-full text-xs p-3 bg-white/5 border border-white/10 text-slate-100 rounded-xl focus:outline-none appearance-none font-mono cursor-pointer"
                  >
                    {ACCENT_OPTIONS.map((a) => (
                      <option key={a.name} value={a.name} className="bg-stone-900 text-white">
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 font-mono text-[9px]">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* COMPONENT 4: SELECT LIGHTING SYSTEM */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-semibold uppercase text-slate-300 tracking-wider font-mono flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-slate-400" />
                4. Iluminación y Render Fotográfico
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {LIGHTING_OPTIONS.map((l) => (
                  <button
                    key={l.name}
                    onClick={() => setLighting(l.name)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                      lighting === l.name
                        ? "border-amber-500 bg-amber-500/10 text-white font-semibold shadow-inner"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/8"
                    }`}
                  >
                    <span className="font-mono text-[11px] block">{l.name}</span>
                    <span className="text-[9px] text-slate-400 leading-normal block font-normal">{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* BIG ACTION COMBUSTION TRIGGER BUTTON */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-12 btn-generate text-black rounded-xl font-bold font-mono tracking-wider uppercase text-xs flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer disabled:opacity-50 text-center"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4.5 h-4.5 animate-spin" />
                  <span>Sinterizando taza en el horno cerámico...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4.5 h-4.5 text-stone-950" />
                  <span>Generar Alquimia de IA</span>
                </>
              )}
            </button>

          </div>

          {/* LOCAL PRESETS SHOWCASE RETAIL */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">
              Inspiración de Tazas de Gato (Presets Rápidos)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setPrompt(preset.prompt);
                    setClay(preset.clay as ClayType);
                    setGlaze(preset.glaze as GlazeStyle);
                    setAccent(preset.accent as MetallicAccent);
                    setLighting(preset.lighting as LightingStyle);
                  }}
                  className={`p-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all text-xs cursor-pointer ${
                    prompt === preset.prompt ? "ring-2 ring-amber-400/50 border-amber-400 text-white" : "text-slate-300"
                  }`}
                >
                  <Coffee className={`w-5 h-5 ${prompt === preset.prompt ? "text-amber-500" : "text-slate-400"}`} />
                  <span className="font-semibold block leading-tight truncate w-full">{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CREATION COLLECTION GALLERY (Persisted via localStorage) */}
          <div className="glass-card p-6 rounded-3xl flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider font-mono flex items-center justify-between border-b border-white/10 pb-2">
              <span>Colección Guardada en Galería ({savedDesigns.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Sinterizado Local</span>
            </h4>

            {savedDesigns.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl text-slate-400 font-mono text-xs max-w-sm mx-auto w-full">
                No tienes tazas guardadas aún.<br />
                ¡Presiona "Guardas en Galería" arriba para guardar!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedDesigns.map((saved) => (
                  <div
                    key={saved.id}
                    onClick={() => loadSavedDesign(saved)}
                    className="p-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl shadow-xs transition-all flex items-start gap-3 relative group cursor-pointer text-slate-200"
                  >
                    {/* Visualizer miniature snapshot */}
                    <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                      <div className="scale-[0.55] origin-center shrink-0">
                        <MugVisualizer
                          clay={saved.clay}
                          glaze={saved.glaze}
                          accent={saved.accent}
                          lighting={saved.lighting}
                        />
                      </div>
                    </div>
                    {/* Texts info */}
                    <div className="flex-1 min-w-0 pr-6 text-[11px]">
                      <p className="font-semibold text-white truncate">{saved.prompt}</p>
                      <span className="text-[9px] font-mono block text-amber-400 mt-1 uppercase">
                        {saved.glaze} • {saved.accent.replace("Detalles de ", "")}
                      </span>
                      <span className="text-[8px] font-mono text-slate-400 mt-0.5 block">{saved.createdAt}</span>
                    </div>
                    {/* Absolute delete button */}
                    <button
                      onClick={(e) => deleteFromGallery(saved.id, e)}
                      className="absolute right-2 top-2 p-1 hover:bg-white/5 text-slate-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                      title="Eliminar de mi galería"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* LUXURY SLATE FOOTER */}
      <footer className="glass border-t border-white/5 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Atelier Operativo • Sinterizado Digital Ceracats AI</span>
          </div>
          <div>
            Hecho con amor y barro virtual, inspirado por la belleza minimalista.
          </div>
        </div>
      </footer>

    </div>
  );
}
