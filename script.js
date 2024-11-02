document.addEventListener("DOMContentLoaded", () => {
    const postButton = document.querySelector(".post-button");
    const foodList = document.getElementById("food-list");
    const foodTitle = document.querySelector(".post-title");
    const foodDescription = document.querySelector(".post-description");
    const imageInput = document.getElementById("imageInput");
    const editModal = document.getElementById("editModal");
    const editFoodTitle = document.getElementById("edit-food-title");
    const editFoodDescription = document.getElementById("edit-food-description");
    const editImageInput = document.getElementById("edit-image-input");
    const saveChangesButton = document.getElementById("save-changes");
    const closeButton = document.querySelector(".close-button");
    let editingIndex = null;

    postButton.addEventListener("click", registerFood);
    loadFoods();

    saveChangesButton.addEventListener("click", saveChanges);
    closeButton.addEventListener("click", closeModal);

    function registerFood() {
        const title = foodTitle.value.trim();
        const description = foodDescription.value.trim();
        const imageUrl = imageInput.files.length > 0 ? URL.createObjectURL(imageInput.files[0]) : '';

        if (title && description) {
            const food = { title, description, imageUrl };
            addFoodToStorage(food);
            loadFoods();
            clearInputs();
        } else {
            alert("Por favor, preencha todos os campos.");
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
        editingIndex = index;
        const foods = getFoodsFromStorage();
        const food = foods[index];
        editFoodTitle.value = food.title;
        editFoodDescription.value = food.description;
        editImageInput.value = ''; // Reset the file input
        editModal.style.display = "block"; // Show the modal
    };

    function saveChanges() {
        const title = editFoodTitle.value.trim();
        const description = editFoodDescription.value.trim();
        const imageUrl = editImageInput.files.length > 0 ? URL.createObjectURL(editImageInput.files[0]) : '';

        if (title && description) {
            const food = { title, description, imageUrl };
            const foods = getFoodsFromStorage();
            foods[editingIndex] = food; // Update the food item
            localStorage.setItem("foods", JSON.stringify(foods));
            loadFoods();
            closeModal();
        } else {
            alert("Por favor, preencha todos os campos.");
        }
    }

    function closeModal() {
        editModal.style.display = "none"; // Hide the modal
    }

    window.deleteFood = function(index) {
        const foods = getFoodsFromStorage();
        foods.splice(index, 1);
        localStorage.setItem("foods", JSON.stringify(foods));
        loadFoods();
    };

    function dragStart(e) {
        e.dataTransfer.setData("text/plain", e.target.innerHTML);
    }

    const hours = document.querySelectorAll(".hour");
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
