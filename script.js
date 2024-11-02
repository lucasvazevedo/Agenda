document.addEventListener("DOMContentLoaded", () => {
    const postButton = document.querySelector(".post-button");
    const foodList = document.getElementById("food-list");
    const foodTitle = document.querySelector(".post-title");
    const foodDescription = document.querySelector(".post-description");
    const foodType = document.getElementById("foodType");
    const imageInput = document.getElementById("imageInput");
    const editModal = document.getElementById("editModal");
    const editFoodTitle = document.getElementById("edit-food-title");
    const editFoodDescription = document.getElementById("edit-food-description");
    const editImageInput = document.getElementById("edit-image-input");
    const editFoodType = document.getElementById("edit-food-type");
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
        const type = foodType.value;
        const imageUrl = imageInput.files.length > 0 ? URL.createObjectURL(imageInput.files[0]) : '';

        if (title && description && type) {
            const food = { title, description, type, imageUrl };
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
                <p>Tipo: ${food.type}</p>
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
        foodType.value = ''; // Limpa o tipo selecionado
        imageInput.value = '';
    }

    window.editFood = function(index) {
        editingIndex = index;
        const foods = getFoodsFromStorage();
        const food = foods[index];
        editFoodTitle.value = food.title;
        editFoodDescription.value = food.description;
        editFoodType.value = food.type;
        editImageInput.value = '';
        editModal.style.display = "block"; // Mostra o modal
    };
    
    function closeModal() {
        editModal.style.display = "none"; // Esconde o modal
    }
    
    function saveChanges() {
        const title = editFoodTitle.value.trim();
        const description = editFoodDescription.value.trim();
        const type = editFoodType.value;
        const imageUrl = editImageInput.files.length > 0 ? URL.createObjectURL(editImageInput.files[0]) : '';

        if (title && description && type) {
            const food = { title, description, type, imageUrl }; // Inclui o tipo
            const foods = getFoodsFromStorage();
            foods[editingIndex] = food; 
            localStorage.setItem("foods", JSON.stringify(foods));
            loadFoods();
            closeModal();
        } else {
            alert("Por favor, preencha todos os campos.");
        }
    }

    function closeModal() {
        editModal.style.display = "none"; 
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

document.getElementById('show-chart').addEventListener('click', function() {
    window.location.href = './pages/chart.html'; 
});
