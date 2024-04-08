import Router from './Router.js';
import { Cooking } from './Cooking.js';

window.app = {}
app.router = Router;
app.cooking = Cooking;
app.recipes = [];

window.addEventListener("DOMContentLoaded", () => {
    app.router.init();
    app.cooking.init(document.querySelector("#cooking"));
    loadRecipes();
});

app.recipeAI = async () => {
    const ingredients = document.getElementById("ingredients");
    const value = ingredients.value;
    if (value.length < 20) {
        alert("You didn't enter enought details for the ingredients");
        return;
    }
    ingredients.disabled = true;
    ingredients.value = "🤖 Our AI Chef is working...";
    try {
        const response = await fetch("http://localhost:3000/api/recipe", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "ingredients": value })
        })
        const jsonResponse = await response.json();
        const recipe = JSON.parse(jsonResponse);


        if (recipe != false) {
            // We render the recipe with a generic image
            recipe.image = "images/loading.jpg";
            app.recipes.push(recipe);
            const div = document.createElement("div");
            document.getElementById("ai-recipe").appendChild(div);
            renderRecipe(div, recipe, "large");

            // We request a new image using DALL-E, async
            setTimeout(async () => {
                const responseImg = await fetch("http://localhost:3000/api/image", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ "prompt": `A high-quality photograph of the meal ${recipe.name}: ${recipe.description}` })
                })
                const jsonImage = await responseImg.json();
                console.log(`Image Ready: ${jsonImage.url}`);
                recipe.image = jsonImage.url;
                div.querySelector("img").src = jsonImage.url;
            }, 0);

        } else {
            alert("Ingredients aren't valid")
        }
    } catch (e) {
        alert("Our AI chef is having trouble right now :(")
        console.log(e)
    }
    ingredients.value = "";
    ingredients.disabled = false;
}

app.randomize = () => {
    var all = [
        "chicken breast",
        "salmon fillet",
        "ground beef",
        "tofu",
        "shiitake mushrooms",
        "bell peppers",
        "onion",
        "garlic",
        "ginger",
        "carrots",
        "potatoes",
        "sweet potatoes",
        "zucchini",
        "eggplant",
        "spinach",
        "kale",
        "romaine lettuce",
        "tomatoes",
        "cucumber",
        "avocado",
        "apples",
        "bananas",
        "blueberries",
        "strawberries",
        "lemons",
        "limes",
        "oranges",
        "pineapple",
        "mango",
        "coconut milk",
        "almond milk",
        "soy milk",
        "rice",
        "pasta",
        "quinoa",
        "barley",
        "oats",
        "flour",
        "sugar",
        "honey",
        "maple syrup",
        "olive oil",
        "coconut oil",
        "butter",
        "cheddar cheese",
        "mozzarella cheese",
        "parmesan cheese",
        "yogurt",
        "eggs",
        "almonds",
        "walnuts",
        "peanuts",
        "cashews",
        "sesame seeds",
        "sunflower seeds",
        "pumpkin seeds",
        "basil",
        "parsley",
        "coriander",
        "thyme",
        "rosemary",
        "oregano",
        "cinnamon",
        "nutmeg",
        "cumin",
        "paprika",
        "turmeric",
        "chili powder",
        "black pepper",
        "salt",
        "soy sauce",
        "fish sauce",
        "worcestershire sauce",
        "hot sauce",
        "tomato sauce",
        "pesto",
        "vinegar",
        "balsamic vinegar",
        "mustard",
        "mayonnaise",
        "ketchup",
        "chocolate",
        "vanilla extract",
        "yeast",
        "baking powder",
        "baking soda",
        "beef broth",
        "chicken broth",
        "vegetable broth",
        "milk",
        "heavy cream",
        "white wine",
        "red wine",
        "beer",
        "rice wine",
        "sake",
        "whiskey",
        "vodka",
        "rum",
        "tequila"
    ];
    const shuffled = all.sort(() => 0.5 - Math.random());
    const finalList = shuffled.slice(0, 10);
    const ingredients = document.getElementById("ingredients");
    ingredients.value = finalList.join("\n");
}


app.startPhotoAI = async () => {
    document.getElementById("uploadFile").click();
}

app.selectedPhotoAI = async (event) => {
    let file = document.getElementById('uploadFile').files[0];

    if (file) {
        var reader = new FileReader();        
        reader.onload = async (e) => {
            var base64String = e.target.result.split(',')[1];

            const response = await fetch("http://localhost:3000/api/vision", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "base64_image": base64String })
            })
            const data = await response.text();
            console.log(data);
            document.getElementById("ingredients").value = data;
        };        
        reader.readAsDataURL(file);
    }

    
}

export async function alertTimerFinished(timer) {
    console.log(`Timer finished: ${timer.name}`);

}
async function loadRecipes() {
    const response = await fetch("/data/recipes.json");
    app.recipes = await response.json();
    renderRecipes();
}

function renderRecipes() {
    renderRecipe(document.querySelector("#recipe-week"), app.recipes[0], "large");
    renderRecipe(document.querySelector("#recipe-most"), app.recipes[1], "large");
    const theRest = app.recipes.slice(2);
    document.querySelector("#all ul").innerHTML = "";
    theRest.forEach(r => {
        const li = document.createElement("li");
        document.querySelector("#all ul").appendChild(li);
        renderRecipe(li, r, "small");
    })
}

function renderRecipe(element, recipe, className) {
    element.innerHTML = `
        <a href="javascript:app.router.go('/recipe/${recipe.slug}')" class="${className} recipe">
            <img class="ai" src="${recipe.image}">
            <h4>${recipe.name}</h4>
            <p class="metadata">${recipe.type} | ${Object.keys(recipe.ingredients).length} ingredients | ${recipe.duration} min</p>
        </a>
    `
}

export async function renderRecipeDetails(id) {
    if (app.recipes.length == 0) {
        await loadRecipes();
    }
    const recipe = app.recipes.filter(r => r.slug == id)[0];
    document.querySelector("#recipe h2").textContent = recipe.name;
    document.querySelector("#recipe img").src = recipe.image;
    document.querySelector("#recipe .metadata").textContent =
        `${Object.keys(recipe.ingredients).length} ingredients |
         ${recipe.duration} minutes | ${recipe.type}`;
    document.querySelector("#recipe .description").textContent = recipe.description;

    const list = document.querySelector("#recipe dl");
    list.innerHTML = "";
    for (let ingredient in recipe.ingredients) {
        list.innerHTML += `
            <dt>${ingredient}</dt><dd>${recipe.ingredients[ingredient]}</dd>
        `
    }
    document.querySelector("#recipe button").onclick = () => {
        app.cooking.start(recipe);
    }

}

