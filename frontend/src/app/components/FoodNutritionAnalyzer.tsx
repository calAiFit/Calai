"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import FoodAddedNotification from "./FoodAddedNotification";

interface NutritionData {
  food_name: string;
  nf_calories: number;
  nf_protein: number;
  nf_total_fat: number;
  nf_total_carbohydrate: number;
  serving_qty: number;
  serving_unit: string;
  serving_weight_grams: number;
}

interface FoodNutritionAnalyzerProps {
  onIntakeAdded?: () => void;
}

interface EditableNutritionData extends NutritionData {
  isEditing?: boolean;
}


const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN || "";
const NUTRITIONIX_APP_ID = process.env.NEXT_PUBLIC_NUTRITIONIX_APP_ID || "";
const NUTRITIONIX_APP_KEY = process.env.NEXT_PUBLIC_NUTRITIONIX_APP_KEY || "";

function FoodNutritionAnalyzer({ onIntakeAdded }: FoodNutritionAnalyzerProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [foodSearch, setFoodSearch] = useState<string>("");
  const [nutrition, setNutrition] = useState<EditableNutritionData | null>(null);
  const [grams, setGrams] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingToIntake, setAddingToIntake] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [addedFood, setAddedFood] = useState({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  

  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Failed to read file"));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function classifyImage(imageBase64: string): Promise<string> {
    if (!HF_TOKEN) {
      throw new Error("Hugging Face API token not configured. Please add NEXT_PUBLIC_HF_TOKEN to your environment variables.");
    }

    const model = "google/vit-base-patch16-224";
    
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        { inputs: imageBase64 },
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.status === 401) {
        throw new Error("Invalid Hugging Face API token. Please check your NEXT_PUBLIC_HF_TOKEN environment variable.");
      }

      if (response.status === 503) {
        throw new Error("Hugging Face model is loading. Please try again in a few moments.");
      }

      const label = response.data?.[0]?.label;
      if (!label) {
        throw new Error("Food detection failed - no label returned from model");
      }
      
      return label;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 401) {
          throw new Error("Authentication failed. Please check your Hugging Face API token.");
        } else if (axiosError.response?.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
      }
      
      if (error && typeof error === 'object' && 'code' in error) {
        const networkError = error as { code: string; message: string };
        if (networkError.code === 'ECONNABORTED') {
          throw new Error("Request timeout. The model might be loading. Please try again.");
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Food detection failed: ${errorMessage}`);
    }
  }

  async function fetchNutrition(foodName: string): Promise<NutritionData> {
    if (!NUTRITIONIX_APP_ID || !NUTRITIONIX_APP_KEY) {
      throw new Error("Nutritionix API credentials not configured. Please add NEXT_PUBLIC_NUTRITIONIX_APP_ID and NEXT_PUBLIC_NUTRITIONIX_APP_KEY to your environment variables.");
    }

    const queryString = `${grams} grams ${foodName}`;
    
    try {
      const res = await fetch(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        {
          method: "POST",
          headers: {
            "x-app-id": NUTRITIONIX_APP_ID,
            "x-app-key": NUTRITIONIX_APP_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: queryString }),
        }
      );

      if (res.status === 401) {
        throw new Error("Invalid Nutritionix API credentials. Please check your API keys.");
      }

      if (res.status === 429) {
        throw new Error("Nutritionix rate limit exceeded. Please try again later.");
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Nutritionix API error: ${text}`);
      }

      const data = await res.json();
      
      if (!data.foods || data.foods.length === 0) {
        throw new Error(`No nutrition data found for "${foodName}". Please try a different food item.`);
      }

      return data.foods[0];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes("Nutritionix")) {
        throw error;
      } else {
        throw new Error(`Failed to fetch nutrition data: ${errorMessage}`);
      }
    }
  }

  const handleImageAnalyze = async () => {
    if (!imageBase64) return;
    setError(null);
    setNutrition(null);
    setLoading(true);
    try {
      const label = await classifyImage(imageBase64);
      const nutri = await fetchNutrition(label);
      setNutrition(nutri);
      
      
      try {
        await fetch("/api/food-recognition", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: imageBase64,
            foodName: label,
            confidence: 0.85, 
            calories: nutri.nf_calories,
            protein: nutri.nf_protein,
            carbs: nutri.nf_total_carbohydrate,
            fats: nutri.nf_total_fat,
          }),
        });
      } catch (dbError) {
        console.warn("Failed to save food recognition:", dbError);

      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setImageBase64(base64);
  };

  const handleFoodSearch = async () => {
    if (!foodSearch.trim()) return;
    setError(null);
    setNutrition(null);
    setSearchLoading(true);
    try {
      const nutri = await fetchNutrition(foodSearch);
      setNutrition(nutri);
      

      try {
        await fetch("/api/food-recognition", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: "", 
            foodName: foodSearch,
            confidence: 1.0, 
            calories: nutri.nf_calories,
            protein: nutri.nf_protein,
            carbs: nutri.nf_total_carbohydrate,
            fats: nutri.nf_total_fat,
          }),
        });
      } catch (dbError) {
        console.warn("Failed to save food recognition:", dbError);

      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Food not found");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleEditNutrition = () => {
    if (!nutrition) return;
    
    setIsEditing(true);
    setEditValues({
      calories: Math.round(nutrition.nf_calories),
      protein: Math.round(nutrition.nf_protein),
      carbs: Math.round(nutrition.nf_total_carbohydrate),
      fats: Math.round(nutrition.nf_total_fat),
    });
  };

  const handleSaveEdit = () => {
    if (!nutrition) return;
    
    setNutrition({
      ...nutrition,
      nf_calories: editValues.calories,
      nf_protein: editValues.protein,
      nf_total_carbohydrate: editValues.carbs,
      nf_total_fat: editValues.fats,
    });
    
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValues({
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    });
  };

  const handleEditValueChange = (field: keyof typeof editValues, value: number) => {
    setEditValues(prev => ({
      ...prev,
      [field]: Math.max(0, value),
    }));
  };

  const handleAddToIntake = async () => {
    if (!nutrition) return;
    
    if (isMountedRef.current) {
      setAddingToIntake(true);
      setError(null);
    }
    
    try {
      await axios.post("/api/intake-history", {
        foodName: nutrition.food_name,
        calories: Math.round(nutrition.nf_calories),
        protein: Math.round(nutrition.nf_protein),
        carbs: Math.round(nutrition.nf_total_carbohydrate),
        fats: Math.round(nutrition.nf_total_fat),
      });
      

      if (isMountedRef.current) {
        setAddedFood({
          name: nutrition.food_name,
          calories: Math.round(nutrition.nf_calories),
          protein: Math.round(nutrition.nf_protein),
          carbs: Math.round(nutrition.nf_total_carbohydrate),
          fats: Math.round(nutrition.nf_total_fat),
        });
        setShowNotification(true);
      }
      

      if (onIntakeAdded) {
        onIntakeAdded();
      }
      
      
      setTimeout(() => {
        if (isMountedRef.current) {
          setShowNotification(false);
        }
      }, 4000);
      
      
      setTimeout(() => {
        if (isMountedRef.current) {
          setNutrition(null);
          setImageBase64(null);
          setFoodSearch("");
          setIsEditing(false);
          setEditValues({
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
          });
        }
      }, 100);
      
    } catch (err: unknown) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to add to daily intake");
      }
    } finally {
      if (isMountedRef.current) {
        setAddingToIntake(false);
      }
    }
  };

  
  const isConfigured = HF_TOKEN && NUTRITIONIX_APP_ID && NUTRITIONIX_APP_KEY;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Food Nutrition Analyzer
        </h2>
        <p className="text-sm text-gray-500 text-center">
          Analyze food nutrition using image upload or search
        </p>
        
        {!isConfigured && (
          <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600">⚠️</div>
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">API Configuration Required</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  To use the food analyzer, you need to configure API keys:
                </p>
                <ul className="text-xs text-yellow-600 space-y-1">
                  <li>• <strong>Hugging Face:</strong> Get token from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">huggingface.co/settings/tokens</a></li>
                  <li>• <strong>Nutritionix:</strong> Get API keys from <a href="https://www.nutritionix.com/business/api" target="_blank" rel="noopener noreferrer" className="underline">nutritionix.com/business/api</a></li>
                </ul>
                <p className="text-xs text-yellow-600 mt-2">
                  Add them to your <code>.env</code> file as NEXT_PUBLIC_HF_TOKEN, NEXT_PUBLIC_NUTRITIONIX_APP_ID, and NEXT_PUBLIC_NUTRITIONIX_APP_KEY
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        <div>
          <label className="flex flex-col items-center justify-center w-full h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-3 pb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-1 text-sm text-gray-500">
                <span className="font-medium text-gray-700">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                SVG, PNG, JPG or GIF (MAX. 800x400px)
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>

          {imageBase64 && (
            <div className="relative w-full h-48 mt-4">
              <Image
                src={imageBase64}
                alt="Selected"
                fill
                className="object-contain rounded-xl"
              />
              <button
                onClick={() => setImageBase64(null)}
                className="absolute -top-2 -right-2 bg-gray-50 text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Grams:
            </label>
            <input
              type="number"
              min={1}
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <button
            disabled={loading || !imageBase64 || !isConfigured}
            onClick={handleImageAnalyze}
            className="w-full mt-4 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Analyzing..." : !isConfigured ? "Configure API Keys First" : "Analyze Image"}
          </button>
        </div>

        
        <div>
          <div className="relative">
            <input
              type="text"
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              placeholder="Search food..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <button
                disabled={searchLoading || !isConfigured}
                onClick={handleFoodSearch}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-2 py-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {searchLoading && (
            <div className="mt-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {nutrition && (
        <div className="mt-3 bg-purple-50 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {nutrition.food_name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {grams}g serving
              </span>
              {!isEditing && (
                <button
                  onClick={handleEditNutrition}
                  className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                  title="Edit nutritional values"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    value={editValues.calories}
                    onChange={(e) => handleEditValueChange('calories', Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    min="0"
                    value={editValues.protein}
                    onChange={(e) => handleEditValueChange('protein', Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    min="0"
                    value={editValues.carbs}
                    onChange={(e) => handleEditValueChange('carbs', Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Fats (g)</label>
                  <input
                    type="number"
                    min="0"
                    value={editValues.fats}
                    onChange={(e) => handleEditValueChange('fats', Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-1 px-3 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-1 px-3 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <p className="text-gray-600">Calories:</p>
                <p className="text-gray-900 font-medium">
                  {Math.round(nutrition.nf_calories || 0)} kcal
                </p>
              </div>
              <div>
                <p className="text-gray-600">Protein:</p>
                <p className="text-gray-900 font-medium">
                  {Math.round(nutrition.nf_protein || 0)} g
                </p>
              </div>
              <div>
                <p className="text-gray-600">Fat:</p>
                <p className="text-gray-900 font-medium">
                  {Math.round(nutrition.nf_total_fat || 0)} g
                </p>
              </div>
              <div>
                <p className="text-gray-600">Carbs:</p>
                <p className="text-gray-900 font-medium">
                  {Math.round(nutrition.nf_total_carbohydrate || 0)} g
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleAddToIntake}
            disabled={addingToIntake || isEditing}
            className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {addingToIntake ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adding to Daily Intake...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to Daily Intake
              </>
            )}
          </button>
        </div>
      )}
      

      <FoodAddedNotification
        isVisible={showNotification}
        foodName={addedFood.name}
        calories={addedFood.calories}
        protein={addedFood.protein}
        carbs={addedFood.carbs}
        fats={addedFood.fats}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default FoodNutritionAnalyzer;
