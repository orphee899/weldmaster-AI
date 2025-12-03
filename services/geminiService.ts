import { GoogleGenAI, Type } from "@google/genai";
import { WeldingParams, CalculationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeWeld = async (
  params: WeldingParams,
  result: CalculationResult
): Promise<string> => {
  try {
    const prompt = `
      Agis comme un expert ingénieur en soudage certifié IWE (International Welding Engineer).
      Analyse les paramètres de soudage suivants :
      
      Procédé: ${params.process}
      Tension: ${params.voltage} V
      Courant: ${params.current} A
      Longueur du cordon: ${params.length} mm
      Temps d'arc: ${params.time.toFixed(1)} s
      
      RÉSULTATS CALCULÉS:
      Énergie de soudage (Heat Input): ${result.heatInput.toFixed(3)} kJ/mm
      Vitesse d'avance: ${(result.travelSpeed * 60 / 10).toFixed(1)} cm/min
      
      Fournis une analyse technique concise en français (max 200 mots) couvrant :
      1. Si l'énergie de soudage semble appropriée pour de l'acier carbone standard (S355 par exemple).
      2. Un commentaire sur la stabilité potentielle de l'arc vu les paramètres U/I.
      3. Un conseil de sécurité spécifique à ce procédé.
      
      Formate la réponse en Markdown simple.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Tu es un assistant expert en soudage pour une application mobile. Sois précis, technique mais concis.",
        temperature: 0.3, // Low temperature for factual analysis
      }
    });

    return response.text || "Analyse indisponible.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur lors de la connexion à l'assistant IA. Vérifiez votre clé API.";
  }
};
