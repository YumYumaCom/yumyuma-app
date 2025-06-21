import React, { useState, useEffect } from 'react';

// --- Helper Functions & Configuration ---

// Function to get the Gemini Text API URL
const getGeminiApiUrl = () => {
  const apiKey = "AIzaSyCiNWvQJeE3UP4-yoa75cNnL26rsHINRhA"; // API key is handled by the environment, leave empty.
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
};

// Function to get the Imagen API URL
const getImagenApiUrl = () => {
    const apiKey = "AIzaSyCiNWvQJeE3UP4-yoa75cNnL26rsHINRhA"; // API key is handled by the environment, leave empty.
    return `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
}

// --- Schemas for AI Responses ---
const recipeSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      recipeName: { type: "STRING", description: "The name of the recipe." },
      description: { type: "STRING", description: "A brief, appealing description of the dish." },
      recipeYield: { type: "STRING", description: "The number of servings the recipe produces, e.g., '4 servings'." },
      ingredients: {
        type: "ARRAY",
        items: {
            type: "OBJECT",
            properties: {
                name: { type: "STRING", description: "Name of the ingredient." },
                quantity: { type: "STRING", description: "Amount of the ingredient, e.g., '1 cup', '200g'." },
                userHas: { type: "BOOLEAN", description: "True if this ingredient was in the user's original list." }
            },
            required: ["name", "quantity", "userHas"]
        }
      },
      instructions: {
        type: "ARRAY",
        items: { type: "STRING", description: "A single step in the cooking instructions." }
      },
      prepTime: { type: "STRING", description: "Estimated preparation time, e.g., '15 minutes'." },
      cookingDetails: {
          type: "OBJECT",
          description: "Details about cooking time and temperature, if applicable for baking/roasting.",
          properties: {
              time: { type: "STRING", description: "e.g., '20-25 minutes'" },
              temperatureC: { type: "STRING", description: "Oven temperature in Celsius, e.g., '180°C'" },
              temperatureF: { type: "STRING", description: "Oven temperature in Fahrenheit, e.g., '350°F'" }
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
            twistName: {type: "STRING", description: "A short, catchy name for the twist."},
            description: {type: "STRING", description: "A brief explanation of the creative twist."}
        },
        required: ["twistName", "description"]
    }
};


// --- Icon Components ---
const XIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> );
const FireIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-4 w-4"><path d="M12 19c-2.4 0-4-1.6-4-3.5S10 8.3 12 5c2 3.3 4 5.1 4 7.5S14.4 19 12 19Z"/><path d="M10.5 15s.5-1 1.5-1 1.5 1 1.5 1"/><path d="M14.5 12.5c0-1-1-1.5-2.5-1.5s-2.5.5-2.5 1.5"/></svg> );
const CameraIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg> );
const PrintIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg> );
const ShoppingCartIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16"/></svg>);
const FacebookIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>);
const XSocialIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>);
const PinterestIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-red-600"><path d="M12.14 2c-4.97 0-9 4.03-9 9 0 3.73 2.27 6.94 5.5 8.35-.08-.66-.15-1.78.03-2.61l1.5-6.32s-.38-.76-.38-1.87c0-1.74 1-3.04 2.25-3.04.97 0 1.44.73 1.44 1.61 0 .98-.63 2.45-.96 3.8-27 1.13-1.05 2.11.37 2.11 1.7 0 3-3.23 3-5.28 0-2.76-2-4.9-5.18-4.9-3.61 0-5.83 2.7-5.83 5.56 0 1.05.38 2.18.88 2.84.1.14.12.25.08.42l-.24.97c-.06.27-.2.33-.44.2-.95-.38-1.54-1.5-1.54-2.67 0-2.04 1.47-3.9 4.18-3.9 2.23 0 3.97 1.63 3.97 4.05 0 2.42-1.22 4.28-2.9 4.28-1.15 0-2-.95-1.73-2.13.33-1.4.96-2.9.96-3.87 0-1.26-.7-2.3-2.08-2.3-1.63 0-2.92 1.67-2.92 3.82 0 1.5.54 2.56.54 2.56l-1.32 5.57c-.4 1.68.7 3.53 2.64 3.53 3.3 0 5.6-3.7 5.6-7.85 0-3.3-2.35-6.2-6.2-6.2z"></path></svg>);
const MailIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);

// --- UI Components ---

const IngredientTag = ({ ingredient, onRemove }) => (
  <div className="flex items-center bg-green-100 text-green-800 text-base font-medium pl-4 pr-2 py-2 rounded-full animate-fade-in-fast">
    <span>{ingredient}</span>
    <button
        onClick={onRemove}
        className="ml-3 rounded-full hover:bg-green-200 p-1 focus:outline-none focus:ring-2 focus:ring-green-400"
        title="Remove ingredient"
    >
      <XIcon />
    </button>
  </div>
);

const RecipeCard = ({ recipe, id }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageError, setImageError] = useState(null);
    const [twists, setTwists] = useState([]);
    const [isTwistLoading, setIsTwistLoading] = useState(false);
    const [twistError, setTwistError] = useState(null);

    const generateImage = async () => {
  setIsImageLoading(true);
  setImageError(null);

  const imagePrompt = `A delicious, professional food photograph of "${recipe.recipeName}". ${recipe.description}. The dish is beautifully plated and styled, with natural lighting and a clean, appealing background.`;

  const imagePayload = {
    instances: [{ prompt: imagePrompt }],
    parameters: { sampleCount: 1 }
  };

  try {
    const response = await fetch(getImagenApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imagePayload)
    });

    if (!response.ok) {
      throw new Error(`Image generation failed with status: ${response.status}`);
    }

    const result = await response.json();

    if (result?.predictions?.[0]?.bytesBase64Encoded) {
      setImageUrl(`data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`);
    } else {
      throw new Error("Could not parse image from API response.");
    }
  } catch (err) {
    console.error("Error generating image:", err);
    setImageError(err.message);
  } finally {
    setIsImageLoading(false);
  }
};


    const handlePrint = () => {
        const printSection = document.getElementById(id);
        const printFooter = document.getElementById('print-footer-content').cloneNode(true);
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print Recipe</title>');
        printWindow.document.write('<link rel="stylesheet" href="https://cdn.tailwindcss.com/2.2.19/tailwind.min.css">');
         printWindow.document.write(`<style>
            body { font-family: 'Nunito', sans-serif; }
            .print-hidden { display: none !important; }
            .recipe-card { border: 1px solid #e5e7eb; border-radius: 1rem; padding: 2rem; }
            h3 { font-size: 1.875rem; font-weight: bold; margin-bottom: 0.75rem; }
            h4 { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem; }
         </style>`);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printSection.innerHTML);
        printWindow.document.body.appendChild(printFooter);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };
    
    const getTwists = async () => {
        setIsTwistLoading(true);
        setTwistError(null);
        const prompt = `Here is a recipe for "${recipe.recipeName}". Briefly list three creative twists or variations for this dish. For each, provide a short "twistName" and a "description".`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: twistSchema } };
        try {
            const response = await fetch(getGeminiApiUrl(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                setTwists(JSON.parse(result.candidates[0].content.parts[0].text));
            } else { throw new Error("Could not parse twists from API response."); }
        } catch (err) {
            console.error("Error fetching twists:", err);
            setTwistError(err.message);
        } finally { setIsTwistLoading(false); }
    };

    const handleGetIngredients = () => {
        const amazonUrl = `https://www.amazon.com/fmc/everyday-essentials-category?node=16310101&linkCode=ll2&tag=lbhr01-20&linkId=ce9aa68ffb5cca500aa6d4e71947c814&language=en_US&ref_=as_li_ss_tl`;
        window.open(amazonUrl, '_blank');
    };
    
    const handleShare = (platform) => {
        const appUrl = "https://yumyuma.com"; 
        const shareText = `Check out this recipe I found on YumYuma: ${recipe.recipeName}`;
        const encodedUrl = encodeURIComponent(appUrl);
        const encodedText = encodeURIComponent(shareText);
        let shareUrl = "";

        switch(platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'pinterest':
                const encodedImage = encodeURIComponent(imageUrl || 'https://placehold.co/800x600/16a34a/ffffff?text=YumYuma.com');
                shareUrl = `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedText}`;
                break;
            default:
                return;
        }
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div id={id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out">
            <div className="h-64 bg-gray-100 flex items-center justify-center print:hidden flex-shrink-0">
                {imageUrl ? (
                    <img src={imageUrl} alt={`Plated view of ${recipe.recipeName}`} className="w-full h-full object-cover" />
                ) : isImageLoading ? (
                    <div className="flex flex-col items-center justify-center text-center p-4"><svg className="animate-spin h-8 w-8 text-green-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="text-base font-semibold text-gray-500">Our chef is plating the dish...</p></div>
                ) : (
                    <div className="text-center">
                        {imageError ? (<div className="p-4 text-red-700"><p><strong>Image Error</strong></p><p className="text-sm">{imageError}</p></div>) : 
                        (<button onClick={generateImage} className="inline-flex items-center justify-center bg-white text-gray-700 font-semibold px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"><CameraIcon />See it Plated</button>)}
                    </div>
                )}
            </div>
            <div className="p-6 md:p-8 flex-grow flex flex-col">
                <h3 className="text-3xl font-bold text-gray-800 mb-3">{recipe.recipeName}</h3>
                <p className="text-gray-600 mb-5 text-base">{recipe.description}</p>
                <div className="flex flex-col space-y-2 text-base text-gray-600 mb-6"><div className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span><strong>Prep:</strong> {recipe.prepTime}</span></div>
                {recipe.cookingDetails && recipe.cookingDetails.time && (<div className="flex items-center"><FireIcon /><span><strong>Cook:</strong> {recipe.cookingDetails.time}{recipe.cookingDetails.temperatureC && ` at ${recipe.cookingDetails.temperatureC} / ${recipe.cookingDetails.temperatureF}`}</span></div>)}</div>
                <div className="mb-6"><h4 className="font-bold text-xl text-gray-700 mb-3">Ingredients</h4><ul className="space-y-2 text-base">{recipe.ingredients.map((ing, index) => (<li key={index} className="flex items-center"><span className={`h-2.5 w-2.5 rounded-full mr-3 ${ing.userHas ? 'bg-green-500' : 'bg-yellow-500'}`} title={ing.userHas ? 'You have this' : 'You might need this'}></span><span className="font-medium text-gray-700">{ing.name}:</span><span className="text-gray-600 ml-2">{ing.quantity}</span></li>))}</ul></div>
                <div className="flex-grow"><h4 className="font-bold text-xl text-gray-700 mb-3">Instructions</h4><ol className="list-decimal list-inside space-y-3 text-base text-gray-600">{recipe.instructions.map((step, index) => <li key={index}>{step}</li>)}</ol></div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                    {twists.length === 0 && !isTwistLoading && !twistError && (<div className="text-center"><button onClick={getTwists} className="inline-flex items-center justify-center text-base bg-purple-100 text-purple-700 font-semibold px-5 py-3 rounded-lg border border-purple-200 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">Suggest a Twist</button></div>)}
                    {isTwistLoading && <p className="text-center text-gray-500">Thinking of some creative ideas...</p>}
                    {twistError && <p className="text-center text-red-500">{twistError}</p>}
                    {twists.length > 0 && (<div><h4 className="font-bold text-xl text-gray-700 mb-3">Creative Twists ✨</h4><ul className="space-y-3">{twists.map((twist, index) => (<li key={index}><strong className="text-gray-800">{twist.twistName}:</strong><p className="text-gray-600">{twist.description}</p></li>))}</ul></div>)}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
                    <button onClick={handleGetIngredients} className="inline-flex items-center justify-center text-base bg-amber-100 text-amber-800 font-semibold px-5 py-3 rounded-lg border border-amber-200 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors">
                        <ShoppingCartIcon />
                        Get Ingredients
                    </button>
                    <button onClick={handlePrint} className="inline-flex items-center justify-center text-base bg-gray-100 text-gray-700 font-semibold px-5 py-3 rounded-lg border border-gray-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors">
                        <PrintIcon />
                        Print Recipe
                    </button>
                </div>
                 <div className="mt-6 pt-6 border-t border-gray-200 text-center print:hidden">
                    <p className="text-sm font-semibold text-gray-500 mb-3">Share this recipe</p>
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={() => handleShare('twitter')} title="Share on X" className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                            <XSocialIcon />
                        </button>
                        <button onClick={() => handleShare('facebook')} title="Share on Facebook" className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                            <FacebookIcon />
                        </button>
                        <button onClick={() => handleShare('pinterest')} title="Pin on Pinterest" className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                            <PinterestIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <svg className="animate-spin h-12 w-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="mt-4 text-lg font-semibold text-gray-700">Our chefs are firing up the ovens!</p><p className="text-gray-500">Stirring up some delicious ideas for you...</p>
    </div>
);

// --- Main App Component ---

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
    if (currentIngredient.trim() && !ingredients.find(ing => ing.toLowerCase() === currentIngredient.trim().toLowerCase())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };
    
  const handleKeyPress = (e) => { if (e.key === 'Enter') { handleAddIngredient(e); } };
  const handleRemoveIngredient = (indexToRemove) => { setIngredients(ingredients.filter((_, index) => index !== indexToRemove)); };

  const findRecipes = async () => {
    if (ingredients.length === 0) { setError('Please add at least one ingredient.'); return; }
    setIsLoading(true);
    setError(null);
    setRecipes([]);
    try {
      const textPrompt = `Based on the following list of ingredients, please generate 3 creative and distinct recipe ideas. The user has these ingredients: ${ingredients.join(', ')}. For each recipe, provide: recipeName, a short description, all necessary ingredients (name, quantity, and userHas boolean), step-by-step instructions, prepTime, and if applicable, 'cookingDetails' with time, temperatureC, and temperatureF. Ensure the response is a valid JSON array.`;
      const textPayload = { contents: [{ role: "user", parts: [{ text: textPrompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: recipeSchema } };
      const textResponse = await fetch(getGeminiApiUrl(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(textPayload) });
      if (!textResponse.ok) throw new Error(`API (text) request failed: ${textResponse.status}`);
      const textResult = await textResponse.json();
      if (!textResult.candidates?.[0]?.content?.parts?.[0]?.text) { throw new Error("Could not parse recipes from the API response."); }
      const parsedRecipes = JSON.parse(textResult.candidates[0].content.parts[0].text);
      setRecipes(parsedRecipes);
      setHasSearched(true);
    } catch (err) {
      console.error("Error in findRecipes process:", err);
      setError(`Sorry, a problem occurred. ${err.message}`);
      setRecipes([]);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="font-nunito bg-gray-100 text-lg">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');
        .font-nunito { font-family: 'Nunito', sans-serif; }
        @media print { 
            body.printing { background-color: white; } 
            body.printing > *:not(.printing-card) { display: none; } 
            .printing-card { display: block !important; box-shadow: none !important; border: 1px solid #ccc; margin: 0; padding: 0; position: absolute; top: 0; left: 0; } 
        }
      `}</style>
      <div className="min-h-screen flex flex-col">
          <main id="main-content" className="flex-grow">
              <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
                <header className="text-center mb-8 sm:mb-12">
                    <h1 className="text-5xl sm:text-6xl font-bold text-gray-800">
                        <span className="capitalize">Y</span>um<span className="capitalize">Y</span>uma<span className="text-green-600">.com</span>
                    </h1>
                    <p className="text-xl text-gray-500 mt-2">Your ingredients, endless possibilities.</p>
                </header>
                
                <div className="text-center bg-green-50/50 border border-green-200 rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-700 mb-2">How It Works</h2>
                    <ol className="text-base text-gray-600 space-y-1 list-inside list-decimal">
                        <li>Enter the ingredients you have on hand.</li>
                        <li>Click "Find Recipes!" to get instant meal ideas.</li>
                        <li>Explore, cook, and enjoy your delicious creation!</li>
                    </ol>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Ingredients</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" value={currentIngredient} onChange={(e) => setCurrentIngredient(e.target.value)} onKeyPress={handleKeyPress} placeholder="e.g., Eggs, Cheese, Bread" className="text-lg flex-grow w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
                        <button onClick={handleAddIngredient} className="w-full sm:w-auto flex items-center justify-center bg-green-600 text-white font-bold px-5 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow"><PlusIcon /><span className="ml-2 text-lg">Add</span></button>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">{ingredients.map((ingredient, index) => (<IngredientTag key={index} ingredient={ingredient} onRemove={() => handleRemoveIngredient(index)} />))}</div>
                    <p className="text-sm text-gray-500 mt-4">
                        <strong>Pro Tip:</strong> For the best results, start with 5-10 of your core ingredients.
                    </p>
                </div>
                <div className="text-center my-8"><button onClick={findRecipes} disabled={isLoading} className="w-full sm:w-auto bg-green-600 text-white font-bold text-xl px-10 py-4 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 shadow-lg disabled:shadow-none">{isLoading ? 'Searching...' : (hasSearched ? 'Show Me More Ideas' : 'Find Recipes!')}</button></div>
                
                <div className="space-y-8">{isLoading && <LoadingSpinner />}
                  {error && <div className="text-center p-6 bg-red-100 text-red-700 rounded-lg shadow">{error}</div>}
                  {!isLoading && recipes.length > 0 && (
                    <div className="grid grid-cols-1 gap-8">
                        {recipes.map((recipe, index) => (
                            <React.Fragment key={index}>
                                <RecipeCard id={`recipe-card-${index}`} recipe={recipe} />
                                {index === 0 && (
                                    <div className="my-4 bg-purple-100/50 border border-purple-200 rounded-2xl p-6 text-center animate-fade-in">
                                        <h3 className="font-bold text-xl text-purple-800 mb-1">Enjoying the recipes?</h3>
                                        <p className="text-purple-700 mb-3 text-base">Get the best ideas delivered to your inbox.</p>
                                        <a href="https://yumyuma.beehiiv.com/subscribe" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-purple-600 text-white font-bold px-5 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors shadow">
                                            <MailIcon />
                                            Get the Free Newsletter
                                        </a>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                  )}
                  {!isLoading && !error && recipes.length === 0 && hasSearched && (<div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md"><p className="text-gray-600">No recipes found. Try different ingredients!</p></div>)}
                </div>
              </div>
          </main>
          <footer className="relative z-10 text-center py-6 px-4 space-y-4 print:hidden">
            <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Follow Us</p>
                    <div className="flex justify-center gap-4">
                        <a href="https://x.com/YumYumaCom" target="_blank" rel="noopener noreferrer" className="inline-block text-gray-500 hover:text-gray-700 transition-colors">
                            <XSocialIcon />
                        </a>
                        <a href="https://www.facebook.com/61577702210815/" target="_blank" rel="noopener noreferrer" className="inline-block text-gray-500 hover:text-gray-700 transition-colors">
                            <FacebookIcon />
                        </a>
                        <a href="https://pin.it/6mGpwBLxP" target="_blank" rel="noopener noreferrer" className="inline-block text-gray-500 hover:text-gray-700 transition-colors">
                            <PinterestIcon />
                        </a>
                    </div>
                </div>
            </div>
            <div>
                 <p className="text-sm text-gray-500 mt-4">
                    <a href="mailto:hello@yumyuma.com" className="hover:underline">Contact Us</a>
                </p>
                <p className="text-sm text-gray-500 max-w-2xl mx-auto mt-2">
                    <strong>Affiliate Disclosure:</strong> As an Amazon Associate, we earn from qualifying purchases.
                </p>
                <p className="text-sm text-gray-500 max-w-2xl mx-auto mt-2">
                    Disclaimer: Recipe times and temperatures are estimates. Please adjust for your specific appliances and preferences. We are not responsible for any allergic reactions; always check product labels to ensure ingredients are safe for your dietary needs. Always ensure food is cooked thoroughly and to a safe internal temperature.
                </p>
                <p className="text-xs text-gray-400 mt-4">
                    © 2025 YumYuma.com
                </p>
            </div>
          </footer>
          <div id="print-footer-content" className="hidden print:block">
              <div className="text-center pt-8 mt-8 border-t">
                  <h1 className="font-nunito text-xl font-bold text-gray-800">
                      YumYuma<span className="text-green-600">.com</span>
                  </h1>
                   <p className="text-xs text-gray-500 max-w-2xl mx-auto mt-4">
                        <strong>Affiliate Disclosure:</strong> As an Amazon Associate, we earn from qualifying purchases.
                    </p>
                    <p className="text-xs text-gray-500 max-w-2xl mx-auto mt-2">
                        Disclaimer: Recipe times and temperatures are estimates. Please adjust for your specific appliances and preferences. We are not responsible for any allergic reactions; always check product labels to ensure ingredients are safe for your dietary needs. Always ensure food is cooked thoroughly and to a safe internal temperature.
                    </p>
                    <p className="text-xs text-gray-400 mt-4">
                        © 2025 YumYuma.com
                    </p>
              </div>
          </div>
      </div>
    </div>
  );
}
