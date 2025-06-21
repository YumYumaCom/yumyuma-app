import React, { useState } from "react";

export default function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const findRecipes = async () => {
    if (!ingredients.trim()) {
      setError("Please enter some ingredients.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Mock API call (replace with real one)
      const mockRecipes = [
        {
          title: "Tomato Pasta",
          ingredients: ["tomato", "pasta", "basil"],
          instructions: "Boil pasta. Cook tomatoes. Mix together.",
        },
        {
          title: "Avocado Toast",
          ingredients: ["bread", "avocado", "salt"],
          instructions: "Toast bread. Mash avocado. Top with salt.",
        },
      ];

      setTimeout(() => {
        setRecipes(mockRecipes);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error in findRecipes process:", err);
      setError(`Sorry, a problem occurred. ${err.message}`);
      setRecipes([]);
      setIsLoading(false);
    }
  };

  return (
    <div className="font-nunito bg-gray-100 text-lg min-h-screen p-6">
      <h1 className="text-4xl font-bold text-center mb-8">YumYuma</h1>

      <div className="max-w-xl mx-auto">
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter ingredients (e.g. tomato, cheese)"
          className="w-full p-3 border border-gray-300 rounded mb-4"
        />
        <button
          onClick={findRecipes}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded w-full"
        >
          {isLoading ? "Searching..." : "Find Recipes"}
        </button>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        <div className="mt-8">
          {recipes.map((recipe, index) => (
            <div
              key={index}
              className="bg-white shadow p-4 mb-4 rounded border-l-4 border-green-400"
            >
              <h2 className="text-2xl font-semibold mb-2">{recipe.title}</h2>
              <p className="mb-1">
                <strong>Ingredients:</strong> {recipe.ingredients.join(", ")}
              </p>
              <p>
                <strong>Instructions:</strong> {recipe.instructions}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
