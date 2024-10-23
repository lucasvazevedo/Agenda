document.addEventListener("DOMContentLoaded", () => {
    const postButton = document.querySelector(".post-button");
    const foodList = document.getElementById("food-list");
    const foodTitle = document.querySelector(".post-title");
    const foodDescription = document.querySelector(".post-description");
    const imageInput = document.getElementById("imageInput");
    const hours = document.querySelectorAll(".hour");

    postButton.addEventListener("click", registerFood);
    loadFoods();

    function registerFood() {
        const title = foodTitle.value;
        const description = foodDescription.value;
        const imageUrl = imageInput.files.length > 0 ? URL.createObjectURL(imageInput.files[0]) : '';

        if (title && description) {
            const food = { title, description, imageUrl };
            addFoodToStorage(food);
            loadFoods();
            clearInputs();
        }
    }

    function addFoodToStorage(food) {
        const foods = getFoodsFromStorage();
        foods.push(food);
        localStorage.setItem("foods", JSON.stringify(foods));
    }

    function loadFoods() {
        foodList.innerHTML = '';
        const foods = getFoodsFromStorage();
        foods.forEach((food, index) => {
            const foodItem = document.createElement("div");
            foodItem.className = "card";
            foodItem.draggable = true;
            foodItem.dataset.type = "comida";

            foodItem.innerHTML = `
                <img src="${food.imageUrl}" alt="${food.title}" style="width:100px;height:auto;">
                <p>${food.title}</p>
                <p>${food.description}</p>
                <button onclick="editFood(${index})">Editar</button>
                <button onclick="deleteFood(${index})">Excluir</button>
            `;

            foodItem.addEventListener("dragstart", dragStart);
            foodList.appendChild(foodItem);
        });
    }

    function getFoodsFromStorage() {
        return JSON.parse(localStorage.getItem("foods")) || [];
    }

    function clearInputs() {
        foodTitle.value = '';
        foodDescription.value = '';
        imageInput.value = '';
    }

    window.editFood = function(index) {
        const foods = getFoodsFromStorage();
        const food = foods[index];
        foodTitle.value = food.title;
        foodDescription.value = food.description;
        imageInput.value = '';
        deleteFood(index);
    };

    window.deleteFood = function(index) {
        const foods = getFoodsFromStorage();
        foods.splice(index, 1);
        localStorage.setItem("foods", JSON.stringify(foods));
        loadFoods();
    };

    function dragStart(e) {
        e.dataTransfer.setData("text/plain", e.target.innerHTML);
    }

    hours.forEach(hour => {
        hour.addEventListener("dragover", dragOver);
        hour.addEventListener("drop", drop);
    });

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const cardHTML = e.dataTransfer.getData("text/plain");
        e.target.innerHTML += cardHTML;
    }
});
