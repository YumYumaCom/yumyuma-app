import React, { useState, useEffect } from 'react';

// --- Gemini & Imagen API Config ---
const getGeminiApiUrl = () => {
  const apiKey = ""; // Environment-managed API key
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
};

const getImagenApiUrl = () => {
  const apiKey = "";
  return `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
};

// --- Schemas ---
const recipeSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      recipeName: { type: "STRING" },
      description: { type: "STRING" },
      recipeYield: { type: "STRING" },
      ingredients: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            quantity: { type: "STRING" },
            userHas: { type: "BOOLEAN" }
          },
          required: ["name", "quantity", "userHas"]
        }
      },
      instructions: {
        type: "ARRAY",
        items: { type: "STRING" }
      },
      prepTime: { type: "STRING" },
      cookingDetails: {
        type: "OBJECT",
        properties: {
          time: { type: "STRING" },
          temperatureC: { type: "STRING" },
          temperatureF: { type: "STRING" }
        }
      }
    },
    required: ["recipeName", "description", "ingredients", "instructions", "prepTime"]
  }
};

const twistSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      twistName: { type: "STRING" },
      description: { type: "STRING" }
    },
    required: ["twistName", "description"]
  }
};
// --- Icons ---
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Ingredient Tag Component
const IngredientTag = ({ ingredient, onRemove }) => (
  <div className="flex items-center bg-green-100 text-green-800 text-base font-medium pl-4 pr-2 py-2 rounded-full">
    <span>{ingredient}</span>
    <button onClick={onRemove} className="ml-3 rounded-full hover:bg-green-200 p-1" title="Remove ingredient">
      <XIcon />
    </button>
  </div>
);

// Loading Spinner
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center text-center p-8">
    <svg className="animate-spin h-12 w-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <p className="mt-4 text-lg font-semibold text-gray-700">Loading recipes...</p>
  </div>
);
export default function App() {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => { setHasSearched(false); }, [ingredients]);

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim().toLowerCase())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddIngredient(e);
    }
  };

    const findRecipes = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipes([]);
    try {
      const textPrompt = `Based on the following list of ingredients, please generate 3 creative and distinct recipe ideas. The user has these ingredients: ${ingredients.join(', ')}. For each recipe, provide: recipeName, a short description, all necessary ingredients (name, quantity, and userHas boolean), step-by-step instructions, prepTime, and if applicable, 'cookingDetails' with time, temperatureC, and temperatureF. Ensure the response is a valid JSON array.`;
      const textPayload = {
        contents: [
          {
            role: "user",
            parts: [{ text: textPrompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: recipeSchema,
        },
      };
      const textResponse = await fetch(getGeminiApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(textPayload),
      });
      if (!textResponse.ok)
        throw new Error(`API (text) request failed: ${textResponse.status}`);
      const textResult = await textResponse.json();
      if (!textResult.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Could not parse recipes from the API response.");
      }
      const parsedRecipes = JSON.parse(
        textResult.candidates[0].content.parts[0].text
      );
      setRecipes(parsedRecipes);
      setHasSearched(true);
    } catch (err) {
      console.error("Error in findRecipes process:", err);
      setError(`Sorry, a problem occurred. ${err.message}`);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">YumYuma<span className="text-green-600">.com</span></h1>
        <p className="text-lg text-gray-500 mt-2">Your ingredients, endless possibilities.</p>
      </header>

      <section className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Your Ingredients</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={currentIngredient}
            onChange={(e) => setCurrentIngredient(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="e.g., Eggs, Bread"
            className="flex-grow px-4 py-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleAddIngredient}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Add
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ingredients.map((ingredient, index) => (
            <IngredientTag
              key={index}
              ingredient={ingredient}
              onRemove={() => handleRemoveIngredient(index)}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Add 5–10 ingredients for best results.
        </p>
      </section>

      <div className="text-center mt-8">
        <button
          onClick={findRecipes}
          disabled={isLoading}
          className="bg-green-600 text-white text-lg px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
        >
          {isLoading ? 'Finding recipes...' : 'Find Recipes!'}
        </button>
      </div>

      <section className="max-w-3xl mx-auto mt-8 space-y-6">
        {isLoading && <LoadingSpinner />}
        {error && <p className="text-red-600 text-center">{error}</p>}
        {recipes.length > 0 && (
          <div className="text-center text-sm text-gray-500 mb-4">
            <p><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>You have</p>
            <p><span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>You might need</p>
          </div>
        )}
        {recipes.map((recipe, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-2">{recipe.recipeName}</h3>
            <p className="text-gray-600 mb-4">{recipe.description}</p>

            <div className="mb-4">
              <strong>Prep Time:</strong> {recipe.prepTime}
              {recipe.cookingDetails?.time && (
                <p><strong>Cook:</strong> {recipe.cookingDetails.time} at {recipe.cookingDetails.temperatureC || ''} / {recipe.cookingDetails.temperatureF || ''}</p>
              )}
            </div>

            <h4 className="text-xl font-semibold mb-2">Ingredients</h4>
            <ul className="mb-4 list-disc list-inside">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${ing.userHas ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  <strong>{ing.name}</strong>: {ing.quantity}
                </li>
              ))}
            </ul>

            <h4 className="text-xl font-semibold mb-2">Instructions</h4>
            <ol className="list-decimal list-inside space-y-2">
              {recipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <footer className="text-center text-sm text-gray-400 mt-10 pt-6 border-t">
        <p>YumYuma.com — Built with React & Gemini AI</p>
        <p>© {new Date().getFullYear()} YumYuma</p>
      </footer>
    </div>
  );
}
