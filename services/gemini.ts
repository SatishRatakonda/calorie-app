import { NutritionAnalysis, UserProfile, DailyLog, ChatMessage, FoodItem } from "../types";

/**
 * LOCAL NUTRITION DATABASE
 * A curated dictionary of common foods and their estimated macros per standard serving.
 */
const FOOD_DATABASE: Record<string, Omit<FoodItem, 'name' | 'portionSize'>> = {
  'egg': { calories: 70, protein: 6, fat: 5, carbs: 0 },
  'bread': { calories: 80, protein: 3, fat: 1, carbs: 15 },
  'toast': { calories: 80, protein: 3, fat: 1, carbs: 15 },
  'chicken': { calories: 165, protein: 31, fat: 3, carbs: 0 },
  'rice': { calories: 205, protein: 4, fat: 0.5, carbs: 45 },
  'apple': { calories: 95, protein: 0.5, fat: 0.3, carbs: 25 },
  'banana': { calories: 105, protein: 1.3, fat: 0.4, carbs: 27 },
  'avocado': { calories: 240, protein: 3, fat: 22, carbs: 12 },
  'salmon': { calories: 200, protein: 25, fat: 11, carbs: 0 },
  'steak': { calories: 250, protein: 26, fat: 15, carbs: 0 },
  'milk': { calories: 120, protein: 8, fat: 5, carbs: 12 },
  'coffee': { calories: 5, protein: 0, fat: 0, carbs: 0 },
  'salad': { calories: 150, protein: 5, fat: 10, carbs: 10 },
  'pizza': { calories: 285, protein: 12, fat: 10, carbs: 36 },
  'burger': { calories: 500, protein: 25, fat: 25, carbs: 40 },
  'pasta': { calories: 220, protein: 8, fat: 1, carbs: 43 },
  'yogurt': { calories: 150, protein: 10, fat: 4, carbs: 15 },
  'oats': { calories: 150, protein: 5, fat: 3, carbs: 27 },
  'peanut butter': { calories: 190, protein: 8, fat: 16, carbs: 6 },
  'cheese': { calories: 110, protein: 7, fat: 9, carbs: 1 },
  'protein shake': { calories: 150, protein: 30, fat: 2, carbs: 3 },
};

/**
 * UTILITY: Extract quantity from string
 */
const parseQuantity = (text: string, foodName: string): number => {
  const words = text.toLowerCase().split(' ');
  const idx = words.indexOf(foodName);
  if (idx > 0) {
    const prev = words[idx - 1];
    if (!isNaN(Number(prev))) return Number(prev);
    const wordMap: Record<string, number> = { 'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'half': 0.5, 'double': 2 };
    if (wordMap[prev]) return wordMap[prev];
  }
  return 1;
};

/**
 * LOCAL ANALYSIS ENGINE
 * Parses text using heuristics to simulate AI analysis.
 */
export const analyzeFood = async (
  description: string,
  imageBase64?: string,
  mimeType?: string,
  userContext?: string
): Promise<NutritionAnalysis> => {
  // Artificial delay to simulate "processing" and maintain UX feel
  await new Promise(resolve => setTimeout(resolve, 800));

  const items: FoodItem[] = [];
  const lowercaseInput = description.toLowerCase();

  // If there's an image but no text, simulate a "Smart Scan" result
  if (imageBase64 && !description) {
    items.push({
      name: "Detected Balanced Meal",
      portionSize: "1 plate",
      calories: 450,
      protein: 25,
      fat: 15,
      carbs: 50
    });
  } else {
    // Search for keywords in description
    Object.keys(FOOD_DATABASE).forEach(key => {
      if (lowercaseInput.includes(key)) {
        const qty = parseQuantity(lowercaseInput, key);
        const base = FOOD_DATABASE[key];
        items.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          portionSize: qty > 1 ? `${qty} units` : "1 serving",
          calories: Math.round(base.calories * qty),
          protein: Math.round(base.protein * qty),
          fat: Math.round(base.fat * qty),
          carbs: Math.round(base.carbs * qty),
        });
      }
    });
  }

  // Fallback if nothing is recognized
  if (items.length === 0) {
    items.push({
      name: description || "Unknown Meal",
      portionSize: "1 serving",
      calories: 300,
      protein: 15,
      fat: 10,
      carbs: 35
    });
  }

  const totals = items.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
    fat: acc.fat + item.fat,
    carbs: acc.carbs + item.carbs,
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

  // Generate "AI-style" insights locally
  const healthTips = totals.protein > 20 
    ? "Great choice! This meal is high in protein, which helps with muscle recovery and satiety."
    : "This meal is energy-dense. Consider adding some leafy greens to increase volume and micronutrients.";

  const dietaryTags = [];
  if (totals.protein > 20) dietaryTags.push("High Protein");
  if (totals.carbs < 10) dietaryTags.push("Low Carb");
  if (totals.calories < 300) dietaryTags.push("Light Meal");
  if (dietaryTags.length === 0) dietaryTags.push("Balanced");

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    foodItems: items,
    totalCalories: totals.calories,
    totalProtein: totals.protein,
    totalFat: totals.fat,
    totalCarbs: totals.carbs,
    healthTips,
    dietaryTags,
    mealType: 'lunch' // Default
  };
};

/**
 * RULE-BASED NUTRITION COACH
 * Provides immediate feedback based on user state and goals.
 */
export const askNutritionCoach = async (
  message: string,
  history: ChatMessage[],
  userProfile: UserProfile,
  dailyLog: DailyLog
): Promise<string> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 600));

  const totalConsumed = dailyLog.meals.reduce((acc, m) => acc + m.totalCalories, 0);
  const remaining = userProfile.calorieTarget - totalConsumed;
  const msg = message.toLowerCase();

  // Keyword-based responses
  if (msg.includes("how am i doing") || msg.includes("status") || msg.includes("summary")) {
    if (remaining > 500) return `You're doing great, ${userProfile.name}! You still have ${remaining} calories left for the day. plenty of room for a healthy dinner.`;
    if (remaining > 0) return `You're close to your goal. You have about ${remaining} calories left. Maybe a light snack later?`;
    return `You've reached your calorie goal for today. Focus on staying hydrated and getting good sleep!`;
  }

  if (msg.includes("water")) {
    return `You've logged ${dailyLog.waterIntake}ml of water today. Remember that aiming for 2000ml-3000ml is ideal for metabolic health!`;
  }

  if (msg.includes("protein")) {
    const p = dailyLog.meals.reduce((acc, m) => acc + m.totalProtein, 0);
    return `You've consumed ${p}g of protein so far. Your target is ${userProfile.proteinTarget}g. ${p < userProfile.proteinTarget ? 'Try adding some Greek yogurt or chicken to your next meal.' : 'Excellent work meeting your protein goals!'}`;
  }

  if (msg.includes("hungry") || msg.includes("snack")) {
    return `If you're feeling hungry, try a high-fiber snack like an apple or some almonds. It'll keep you full without spiking your blood sugar.`;
  }

  // Generic helpful response
  return `That's a great question about ${message}. Since your goal is to ${userProfile.goal} weight, I recommend focusing on whole foods and staying consistent with your logging. Keep up the good work!`;
};