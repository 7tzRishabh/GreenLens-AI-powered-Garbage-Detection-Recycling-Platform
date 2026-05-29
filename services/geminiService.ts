import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, WasteCategory } from "../types";

// Helper to convert file to base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeWasteImage = async (imageSource: File | string): Promise<ScanResult> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      // Return a mock result if no API key is present (for MVP testing without key)
      console.warn("No API Key found. Returning mock data.");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            wasteType: "Plastic Bottle (Mock)",
            category: WasteCategory.Plastic,
            confidence: 0.95,
            disposalTip: "Rinse and place in the blue recycling bin.",
            isHazardous: false,
            ecoPoints: 25
          });
        }, 1500);
      });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    let base64Data: string;
    let mimeType: string;

    if (typeof imageSource === 'string') {
      // Handle base64 string from canvas
      base64Data = imageSource.split(',')[1];
      mimeType = imageSource.split(',')[0].split(':')[1].split(';')[0];
    } else {
      // Handle File object
      base64Data = await fileToGenerativePart(imageSource);
      mimeType = imageSource.type;
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this image carefully and identify the primary waste item. 
            
            Instructions:
            1. Focus only on the main object in the image.
            2. Ignore background items or noise.
            3. If multiple objects exist, identify the most prominent waste item.
            4. Classify the waste into one of the following categories ONLY: Plastic, Metal, Glass, Paper, Organic, E-Waste, Hazardous.
            
            Return a JSON object with the following fields:
            - wasteType: string (Specific name of the item, e.g., "Plastic Bottle")
            - category: string (MUST be one of: Plastic, Metal, Glass, Paper, Organic, E-Waste, Hazardous. If unidentified, use "Unknown")
            - confidence: number (0 to 1, e.g., 0.92)
            - disposalTip: string (Disposal suggestion, e.g., "Dispose in the blue recycling bin.")
            - ecoPoints: number (Estimated eco points for recycling this item, e.g., 10 to 50)
            
            If the object cannot be identified clearly, return:
            {
              "wasteType": "Unknown",
              "category": "Unknown",
              "confidence": 0.1,
              "disposalTip": "Please take a clearer photo of the waste item.",
              "ecoPoints": 0
            }
            `
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            wasteType: { type: Type.STRING },
            category: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            disposalTip: { type: Type.STRING },
            ecoPoints: { type: Type.NUMBER },
          },
          required: ["wasteType", "category", "confidence", "disposalTip", "ecoPoints"]
        }
      }
    });

    const text = response.text;
    if (!text || text === "undefined") {
      throw new Error("No valid response from AI. The response was empty or undefined.");
    }
    
    let result;
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", text);
      throw new Error("The AI returned an invalid response format. Please try again.");
    }
    
    return {
      wasteType: result.wasteType || "Unknown",
      category: (result.category as WasteCategory) || WasteCategory.Unknown,
      confidence: result.confidence || 0,
      disposalTip: result.disposalTip || "No disposal tip available.",
      isHazardous: result.category === 'Hazardous',
      ecoPoints: result.ecoPoints || 10
    };

  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};