import { GoogleGenAI } from "@google/genai";
import { WeldingParams, CalculationResult } from "../types";

// CORRECTION ICI : Utilisation de import.meta.env pour Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const analyzeWeld = async (
  params: WeldingParams,
  result: CalculationResult
): Promise<string> => {
  if (!apiKey) {
    return "Erreur : Clé API manquante. Vérifiez le fichier .env.local";
  }

  try {
    const prompt = `
      Agis comme un expert ingénieur en soudage certifié IWE.
      Analyse ces paramètres :
      
      Procédé: ${params.process}
      Tension: ${params.voltage} V
      Courant: ${params.current} A
      Longueur: ${params.length} mm
      Temps: ${params.time.toFixed(1)} s
      
      RÉSULTATS:
      Énergie: ${result.heatInput.toFixed(3)} kJ/mm
      Vitesse: ${(result.travelSpeed * 60 / 10).toFixed(1)} cm/min
      
      Donne une analyse technique concise (max 200 mots) :
      1. Pertinence pour acier carbone (ex: S355).
      2. Stabilité de l'arc.
      3. Un conseil sécurité.
      
      Format Markdown.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      }
    });

    return response.text || "Analyse indisponible.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur lors de la connexion à l'IA. Vérifiez votre connexion internet.";
  }
};