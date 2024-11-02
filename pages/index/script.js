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
    saveChangesButton.addEventListener("click", saveChanges);
    closeButton.addEventListener("click", closeModal);
    
    loadFoods();

    function registerFood() {
        const title = foodTitle.value.trim();
        const description = foodDescription.value.trim();
        const type = foodType.value;

        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                const food = { title, description, type, imageUrl: reader.result };
                addFoodToStorage(food);
                loadFoods();
                clearInputs();
            };

            reader.readAsDataURL(file);
        } else {
            alert("Por favor, selecione uma imagem.");
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
            foodItem.setAttribute("draggable", "true");
            foodItem.setAttribute("data-index", index);

            foodItem.innerHTML = `
                <img src="${food.imageUrl}" alt="${food.title}" style="width:100px;height:auto;">
                <p>${food.title}</p>
                <p>${food.description}</p>
                <p>Tipo: ${food.type}</p>
                <button onclick="editFood(${index})" class="btn-edit">Editar</button>
                <button onclick="deleteFood(${index})" class="btn-delete">Excluir</button>
            `;

            foodItem.addEventListener("dragstart", dragStart);
            foodItem.addEventListener("dragend", dragEnd);
            foodList.appendChild(foodItem);
        });
        addDropzones();
    }

    function getFoodsFromStorage() {
        return JSON.parse(localStorage.getItem("foods")) || [];
    }

    function clearInputs() {
        foodTitle.value = '';
        foodDescription.value = '';
        foodType.value = '';
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
        editModal.style.display = "block";
    }

    function saveChanges() {
        const foods = getFoodsFromStorage();
        const food = foods[editingIndex];

        food.title = editFoodTitle.value.trim();
        food.description = editFoodDescription.value.trim();
        food.type = editFoodType.value;

        if (editImageInput.files.length > 0) {
            const file = editImageInput.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                food.imageUrl = reader.result;
                localStorage.setItem("foods", JSON.stringify(foods));
                loadFoods();
                closeModal();
            };

            reader.readAsDataURL(file);
        } else {
            localStorage.setItem("foods", JSON.stringify(foods));
            loadFoods();
            closeModal();
        }
    }

    function closeModal() {
        editModal.style.display = "none";
        editingIndex = null;
    }

    window.deleteFood = function(index) {
        const foods = getFoodsFromStorage();
        foods.splice(index, 1);
        localStorage.setItem("foods", JSON.stringify(foods));
        loadFoods();
    }

    function dragStart(event) {
        event.dataTransfer.setData("text/plain", event.target.getAttribute("data-index"));
        setTimeout(() => {
            event.target.style.display = "none";
        }, 0);
    }

    function dragEnd(event) {
        event.target.style.display = "block";
    }

    function addDropzones() {
        const dropzones = document.querySelectorAll(".dropzone");
        dropzones.forEach(dropzone => {
            dropzone.addEventListener("dragover", dragOver);
            dropzone.addEventListener("drop", drop);
        });
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        const index = event.dataTransfer.getData("text/plain");
        const foods = getFoodsFromStorage();
        const food = foods[index];
        const dropzone = event.target;

        const foodEvent = document.createElement("div");
        foodEvent.className = "event";
        foodEvent.innerHTML = `<p>${food.title}</p><img src="${food.imageUrl}" alt="${food.title}" style="width:30px;height:auto;">`;
        dropzone.appendChild(foodEvent);

        deleteFood(index);
    }
});

document.getElementById('show-chart').addEventListener('click', function() {
    window.location.href = '../chart/chart.html'; 
});
