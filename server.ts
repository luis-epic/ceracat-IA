import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client with standard headers and lazy check
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("WARNING: GEMINI_API_KEY is not configured or is using the placeholder. Running in fallback mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Generate ceramic design recipe and instructions
  app.post("/api/generate-design", async (req, res) => {
    try {
      const { prompt, glaze, accent, lighting, clay } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "El prompt es requerido." });
      }

      const client = getGeminiClient();

      if (!client) {
        // Fallback realistic response if Gemini is not credentialed yet
        return res.json({
          glazeRecipe: {
            name: `${glaze || "Esmalte Cristalino"} con destellos de ${accent || "Oro"}`,
            temp: "1220°C (Cono 6)",
            atmosphere: "Oxidación",
            ingredients: [
              "Frita Ferro 3110 (Esmaltante): 65%",
              "Sílice (Formador de vidrio): 15%",
              "Kaolín (Estabilizador de arcilla): 10%",
              "Carbonato de Calcio (Asistente de fusión): 5%",
              "Óxido de Cobalto / Hierro (Colorantes): 5%"
            ],
            application: "Aplicar 3 capas delgadas mediante inmersión. Dejar secar completamente antes de aplicar los detalles metálicos ornamentales mediante pincel especial de sobrecubierta."
          },
          sculptingGuide: [
            "Preparación de la Arcilla: Amasar bien la arcilla tipo " + (clay || "Porcelana") + " para eliminar cualquier burbuja de aire.",
            "Modelado del Cuerpo: Modelar a mano la taza mediante pellizcos o usando moldes cerámicos para lograr un acabado perfectamente circular y liso de taza.",
            "Esculpido del Gato: Tallar con cuidado las orejitas triangulares y los bigotes del gato directamente sobre la superficie exterior. Asegurar el mango de cerámica simulando la colita juguetona del gato.",
            "Acabado de Cuero: Cuando el cuerpo esté con textura de cuero, pulir con una esponjilla húmeda e incorporar relieves minimalistas.",
            "Primera Cocción (Bizcochado): Hornear a 950°C (Cono 008) para dar fuerza estructural."
          ],
          designCritique: `Este diseño en arcilla de tipo ${clay || "Porcelana"} con acabado ${glaze || "Esmalte brillante"} y acentos en ${accent || "Oro"} destaca por su pureza conceptual. Bajo una iluminación ${lighting || "Estudio 3D"}, las orejas de gato capturan reflejos dorados perfectos, logrando una armonía perfecta entre ternura animal y sofisticación contemporánea. El uso de espaciado negativo enfatiza las formas puras cerámicas.`,
          firingProfile: {
            stages: [
              { duration: "3 horas", temp: "Humedad: Subir lentamente de 20°C a 150°C para purgar agua libre." },
              { duration: "4 horas", temp: "Pre-cocido: Aumentar a 573°C (inversión del cuarzo, extremar precauciones)." },
              { duration: "3 horas", temp: "Sinterizado final: Llevar a 1220°C y mantener durante 20 minutos." },
              { duration: "Sustancial", temp: "Enfriamiento controlado: Dejar enfriar lentamente hasta los 100°C antes de abrir el horno para evitar choques térmicos." }
            ]
          },
          isMock: true
        });
      }

      // Query Gemini! We use gemini-3.5-flash as the perfect model for structured JSON tasks.
      const promptText = `
        Actúa como un Maestro Alfarero y Diseñador Cerámico experto.
        Toma estas especificaciones técnicas y crea una receta de cerámica completa y real en formato JSON para esta taza:
        - Prompt de Usuario: "${prompt}"
        - Estilo de Vidriado (Glaze): "${glaze}"
        - Detalles Metálicos (Accent): "${accent}"
        - Iluminación Ambiental: "${lighting}"
        - Arcilla de Base (Clay): "${clay}"

        El JSON que devuelvas debe ceñirse exactamente a este esquema (escríbelo en español fluído y técnico):
        {
          "glazeRecipe": {
            "name": string (nombre descriptivo del esmalte),
            "temp": string (temperatura de cocción recomendada con cono pirométrico),
            "atmosphere": string (tipo de atmósfera: Oxidación o Reducción),
            "ingredients": string[] (lista de ingredientes con proporciones reales en química de esmalte),
            "application": string (proceso detallado de aplicación para este acabado brillante)
          },
          "sculptingGuide": string[] (5 pasos progresivos detallados para modelar físicamente la taza de gato a mano),
          "designCritique": string (un análisis estético y minimalista sobre el balance de las formas de gato, los brillos, la iluminación del estudio de 3D y el contraste del oro),
          "firingProfile": {
             "stages": [
                { "duration": string, "temp": string }
             ]
          }
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              glazeRecipe: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  temp: { type: Type.STRING },
                  atmosphere: { type: Type.STRING },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  application: { type: Type.STRING }
                },
                required: ["name", "temp", "atmosphere", "ingredients", "application"]
              },
              sculptingGuide: { type: Type.ARRAY, items: { type: Type.STRING } },
              designCritique: { type: Type.STRING },
              firingProfile: {
                type: Type.OBJECT,
                properties: {
                  stages: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        duration: { type: Type.STRING },
                        temp: { type: Type.STRING }
                      },
                      required: ["duration", "temp"]
                    }
                  }
                },
                required: ["stages"]
              }
            },
            required: ["glazeRecipe", "sculptingGuide", "designCritique", "firingProfile"]
          }
        }
      });

      const responseText = response.text || "";
      const result = JSON.parse(responseText.trim());
      res.json({ ...result, isMock: false });
    } catch (error: any) {
      console.error("Gemini route error:", error);
      res.status(500).json({ error: error.message || "Error interno al generar el diseño cerámico de IA." });
    }
  });

  // Serve Frontend / Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running at http://localhost:${PORT}`);
  });
}

startServer();
