import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NutritionAnalysis, UserProfile, DailyLog, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    foodItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the food item" },
          portionSize: { type: Type.STRING, description: "Estimated portion size (e.g., 1 cup, 200g)" },
          calories: { type: Type.NUMBER, description: "Estimated calories" },
          protein: { type: Type.NUMBER, description: "Protein in grams" },
          fat: { type: Type.NUMBER, description: "Fat in grams" },
          carbs: { type: Type.NUMBER, description: "Carbohydrates in grams" },
        },
        required: ["name", "calories", "protein", "fat", "carbs"]
      }
    },
    totalCalories: { type: Type.NUMBER, description: "Sum of all calories" },
    totalProtein: { type: Type.NUMBER, description: "Sum of all protein in grams" },
    totalFat: { type: Type.NUMBER, description: "Sum of all fat in grams" },
    totalCarbs: { type: Type.NUMBER, description: "Sum of all carbs in grams" },
    healthTips: { type: Type.STRING, description: "Brief, actionable health advice based on the meal and goal." },
    dietaryTags: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "List of 2-4 tags describing the meal (e.g., 'High Protein', 'Keto Friendly', 'Vegan', 'Gluten Free', 'High Sugar')" 
    }
  },
  required: ["foodItems", "totalCalories", "totalProtein", "totalFat", "totalCarbs", "healthTips", "dietaryTags"]
};

export const analyzeFood = async (
  description: string,
  imageBase64?: string,
  mimeType?: string,
  userContext?: string
): Promise<NutritionAnalysis> => {
  try {
    const parts: any[] = [];

    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      });
    }

    const promptText = description 
      ? `Analyze this meal: "${description}". Estimate calories and macros.` 
      : "Analyze this food image. Identify items, estimate portion sizes, calories, and macronutrients.";
    
    const context = userContext ? `User Context: ${userContext}` : "";

    parts.push({ text: promptText + "\n" + context });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert nutritionist. Analyze the provided food image or text description. Be realistic with portion sizes. If exact values are impossible, provide your best educated estimate. Always assign appropriate dietary tags.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const result = JSON.parse(text);
    
    return {
        ...result,
        id: crypto.randomUUID(),
        timestamp: Date.now()
    } as NutritionAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const askNutritionCoach = async (
  message: string,
  history: ChatMessage[],
  userProfile: UserProfile,
  dailyLog: DailyLog
): Promise<string> => {
  const context = `
    User Profile:
    Name: ${userProfile.name}
    Goal: ${userProfile.goal}
    Daily Targets: ${userProfile.calorieTarget}kcal (${userProfile.proteinTarget}g P, ${userProfile.fatTarget}g F, ${userProfile.carbsTarget}g C)
    
    Today's Consumption So Far:
    Calories: ${dailyLog.meals.reduce((acc, m) => acc + m.totalCalories, 0)}
    Water: ${dailyLog.waterIntake}ml
    
    User Question: "${message}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: context }] }
    ],
    config: {
      systemInstruction: "You are a friendly, motivating, and knowledgeable AI Nutrition Coach. Keep answers concise, encouraging, and practical. Use the user's data to give specific advice.",
    }
  });

  return response.text || "I'm sorry, I couldn't process that request.";
};
