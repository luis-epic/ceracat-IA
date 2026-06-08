import { CreatorPreset, ClayType, GlazeStyle, MetallicAccent, LightingStyle } from "./types";

export const PRESETS: CreatorPreset[] = [
  {
    id: "gato-dorado-minimal",
    title: "Gato Real Minimalista",
    prompt: "Una taza de café con forma de gato, hecha de cerámica brillante con detalles dorados, estilo minimalista con iluminación de estudio 3D",
    glaze: "Esmalte Brillante",
    accent: "Detalles de Oro 24K",
    lighting: "Estudio 3D (Suave)",
    clay: "Porcelain White"
  },
  {
    id: "gato-obsidiana-plata",
    title: "Gato Cósmico Oscuro",
    prompt: "Una taza con silueta de gato de porcelana negra pura, esmalte mate sedoso, finos contornos plateados en bigotes y orejas, iluminación nórdica tenue medieval",
    glaze: "Mate Sedoso",
    accent: "Platino Platino",
    lighting: "Brillo Nórdico (Limpio)",
    clay: "Obsidian Black"
  },
  {
    id: "gato-matcha-rustico",
    title: "Gato Zen de Bodega",
    prompt: "Taza de gato hecha en arcilla con chamota, esmalte de matcha crujiente y craquelado, orejas rugosas de aspecto antiguo, sin detalles metálicos, luz natural de atardecer de estudio",
    glaze: "Textura Rústica",
    accent: "Sin Metales (Minimal)",
    lighting: "Atardecer Cálido",
    clay: "Matcha Green"
  },
  {
    id: "gato-rosa-perlado",
    title: "Gato Sakura Perlado",
    prompt: "Taza con forma de gatito dormido, esmalte sakura brillante con reflejos de perla iridiscente en el mango con forma de cola larga, luz ambiental rosa mística",
    glaze: "Esmalte Brillante",
    accent: "Brillo Perlado",
    lighting: "Cyberpunk Neón",
    clay: "Peach Blossom"
  }
];

export const CLAY_OPTIONS: { name: ClayType; color: string; rgb: string; desc: string }[] = [
  {
    name: "Porcelain White",
    color: "bg-stone-50 border-stone-200 text-stone-900",
    rgb: "#fcf8f2",
    desc: "Arcilla refinada súper suave de traslúcida blancura, ideal para reflejar detalles dorados."
  },
  {
    name: "Obsidian Black",
    color: "bg-zinc-800 border-zinc-950 text-stone-100",
    rgb: "#212124",
    desc: "Plastilina oscura que cuece a un negro antracita misterioso y formal."
  },
  {
    name: "Matcha Green",
    color: "bg-emerald-100 border-emerald-300 text-emerald-950",
    rgb: "#829c78",
    desc: "Sutil matriz verde musgo inspirada en la ceremonia de té Wabi-Sabi."
  },
  {
    name: "Peach Blossom",
    color: "bg-rose-50 border-rose-200 text-rose-950",
    rgb: "#edd7d3",
    desc: "Color suave de durazno pálido con ligera arena fina esparcida."
  },
  {
    name: "Terracotta Earth",
    color: "bg-amber-700 border-amber-900 text-stone-50",
    rgb: "#b35b3d",
    desc: "Rústica arcilla rojiza rica en óxido de hierro. Perfecta para un acabado casero y natural."
  }
];

export const GLAZE_OPTIONS: { name: GlazeStyle; desc: string; opacity: number }[] = [
  {
    name: "Esmalte Brillante",
    desc: "Glaseado vítreo de alta reflexión que brilla y resalta bajo la luz del estudio.",
    opacity: 0.9
  },
  {
    name: "Mate Sedoso",
    desc: "Tacto aterciopelado satinado antirreflejos que difumina la iluminación.",
    opacity: 0.5
  },
  {
    name: "Textura Rústica",
    desc: "Esmaltes con arena de chamota o granulación orgánica que se siente áspero.",
    opacity: 0.3
  },
  {
    name: "Craquelado Antiguo",
    desc: "Esmalte agrietado artísticamente durante el enfriamiento térmico, estilo vintage.",
    opacity: 0.75
  }
];

export const ACCENT_OPTIONS: { name: MetallicAccent; color: string; gradient: string }[] = [
  {
    name: "Detalles de Oro 24K",
    color: "#e2b13c",
    gradient: "linear-gradient(135deg, #ffd700 0%, #daa520 50%, #b8860b 100%)"
  },
  {
    name: "Platino Platino",
    color: "#cbd5e1",
    gradient: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)"
  },
  {
    name: "Brillo Perlado",
    color: "#f5d0fe",
    gradient: "linear-gradient(135deg, #fae8ff 0%, #f5d0fe 40%, #e9d5ff 70%, #c084fc 100%)"
  },
  {
    name: "Sin Metales (Minimal)",
    color: "transparent",
    gradient: ""
  }
];

export const LIGHTING_OPTIONS: { name: LightingStyle; bgClass: string; desc: string; gradient: string }[] = [
  {
    name: "Estudio 3D (Suave)",
    bgClass: "bg-gradient-to-tr from-stone-200 via-stone-100 to-stone-50 text-stone-800",
    desc: "Iluminación difusa de estudio fotográfico profesional para catálogos comerciales.",
    gradient: "radial-gradient(circle, #fcfcfc 0%, #eeebe6 70%, #d8d3c9 100%)"
  },
  {
    name: "Atardecer Cálido",
    bgClass: "bg-gradient-to-tr from-amber-200 via-orange-100 to-amber-50 text-stone-800",
    desc: "Tonos dorados profundos que simulan el sol del atardecer entrando por un gran ventanal.",
    gradient: "radial-gradient(circle, #fff1e6 0%, #ffe3d1 60%, #ffd0b3 100%)"
  },
  {
    name: "Cyberpunk Neón",
    bgClass: "bg-gradient-to-tr from-slate-950 via-zinc-900 to-purple-950 text-pink-100",
    desc: "Luces de neón magenta, púrpura y cian para un contraste moderno y tecnológico.",
    gradient: "radial-gradient(circle, #1f1430 0%, #0d0a14 70%, #030305 100%)"
  },
  {
    name: "Brillo Nórdico (Limpio)",
    bgClass: "bg-gradient-to-tr from-sky-100 via-zinc-100 to-stone-50 text-sky-950",
    desc: "Luz blanca brillante indirecta típica de un taller escandinavo despejado.",
    gradient: "radial-gradient(circle, #f4f8fb 0%, #eaf2f8 70%, #d1e1eb 100%)"
  }
];
