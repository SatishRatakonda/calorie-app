export interface FoodItem {
  name: string;
  portionSize: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface NutritionAnalysis {
  id: string;        // Unique ID for history
  timestamp: number; // For sorting history
  foodItems: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  healthTips: string;
  dietaryTags: string[]; // e.g., "High Protein", "Vegan"
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  goal: 'lose' | 'maintain' | 'gain';
  calorieTarget: number;
  proteinTarget: number;
  fatTarget: number;
  carbsTarget: number;
  onboardingComplete: boolean;
}

export interface DailyLog {
  date: string; // ISO string YYYY-MM-DD
  meals: NutritionAnalysis[];
  waterIntake: number; // ml
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
