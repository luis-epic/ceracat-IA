export interface GlazeRecipe {
  name: string;
  temp: string;
  atmosphere: string;
  ingredients: string[];
  application: string;
}

export interface FiringStage {
  duration: string;
  temp: string;
}

export interface FiringProfile {
  stages: FiringStage[];
}

export interface CeramicDesign {
  glazeRecipe: GlazeRecipe;
  sculptingGuide: string[];
  designCritique: string;
  firingProfile: FiringProfile;
  isMock: boolean;
}

export interface CreatorPreset {
  id: string;
  title: string;
  prompt: string;
  glaze: string;
  accent: string;
  lighting: string;
  clay: string;
  imageUrl?: string;
}

export type ClayType = "Porcelain White" | "Obsidian Black" | "Matcha Green" | "Peach Blossom" | "Terracotta Earth";
export type GlazeStyle = "Esmalte Brillante" | "Mate Sedoso" | "Textura Rústica" | "Craquelado Antiguo";
export type MetallicAccent = "Detalles de Oro 24K" | "Platino Platino" | "Brillo Perlado" | "Sin Metales (Minimal)";
export type LightingStyle = "Estudio 3D (Suave)" | "Atardecer Cálido" | "Cyberpunk Neón" | "Brillo Nórdico (Limpio)";
