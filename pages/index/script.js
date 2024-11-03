document.addEventListener("DOMContentLoaded", () => {
    const postButton = document.querySelector(".post-button");
    const foodList = document.getElementById("food-list");
    const foodTitle = document.querySelector(".post-title");
    const foodDescription = document.querySelector(".post-description");
    const foodType = document.getElementById("foodType");
    const imageInput = document.getElementById("imageInput");
    const editFoodModal = document.getElementById("editFoodModal");
    const editFoodTitle = document.getElementById("edit-food-title");
    const editFoodDescription = document.getElementById("edit-food-description");
    const editFoodType = document.getElementById("edit-food-type");
    const saveFoodButton = document.getElementById("save-food-button");
    const selectFoodModal = document.getElementById("selectFoodModal");
    const foodSelection = document.getElementById("food-selection");
    const confirmSelectionButton = document.getElementById("confirm-selection");

    postButton.addEventListener("click", registerFood);
    saveFoodButton.addEventListener("click", saveEditedFood);

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
                <button onclick="openEditModal(${index})" class="btn-edit">Editar</button>
                <button onclick="deleteFood(${index})" class="btn-delete">Excluir</button>
            `;
            foodItem.addEventListener("dragstart", dragStart);
            foodList.appendChild(foodItem);
        });

        updateChart();

        const dropzones = document.querySelectorAll(".dropzone");
        dropzones.forEach(zone => {
            zone.addEventListener("dragover", dragOver);
            zone.addEventListener("drop", dropFood);
            zone.addEventListener("click", (e) => openSelectFoodModal(e.target));
        });
    }

    function updateChart() {
        const foods = getFoodsFromStorage();
        const foodTypes = {};
        
        foods.forEach(food => {
            foodTypes[food.type] = (foodTypes[food.type] || 0) + 1;
        });

        const labels = Object.keys(foodTypes);
        const data = Object.values(foodTypes);

        const ctx = document.getElementById('consumption-chart').getContext('2d');

        if (window.consumptionChart) {
            window.consumptionChart.destroy();
        }

        window.consumptionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade de Alimentos por Tipo',
                    data: data,
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function dragStart(e) {
        const index = e.target.getAttribute("data-index");
        const foods = getFoodsFromStorage();
        const food = foods[index];
        
        const dragImage = document.createElement("div");
        dragImage.style.position = "absolute";
        dragImage.style.pointerEvents = "none";
        dragImage.style.opacity = "0.5";
        dragImage.innerHTML = `
            <img src="${food.imageUrl}" alt="${food.title}" style="width:50px;height:auto;">
            <p>${food.title}</p>
        `;
        document.body.appendChild(dragImage);
        
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        e.dataTransfer.setData("text/plain", index);
        
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dropFood(e) {
        e.preventDefault();
        const index = e.dataTransfer.getData("text/plain");
        const foods = getFoodsFromStorage();
        const food = foods[index];
    
        const foodContainer = document.createElement("div");
        foodContainer.innerHTML = `
            <img src="${food.imageUrl}" alt="${food.title}" style="width:50px;height:auto;">
            <p>${food.title}</p>
        `;
        e.target.innerHTML = ''; 
        e.target.appendChild(foodContainer); 
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

    window.deleteFood = function(index) {
        const foods = getFoodsFromStorage();
        foods.splice(index, 1);
        localStorage.setItem("foods", JSON.stringify(foods));
        loadFoods();
    }

    window.openEditModal = function(index) {
        const foods = getFoodsFromStorage();
        const food = foods[index];
        editFoodTitle.value = food.title;
        editFoodDescription.value = food.description;
        editFoodType.value = food.type;
        editFoodModal.style.display = "block";
        editFoodModal.setAttribute("data-index", index);
    }

    function saveEditedFood() {
        const index = editFoodModal.getAttribute("data-index");
        const title = editFoodTitle.value.trim();
        const description = editFoodDescription.value.trim();
        const type = editFoodType.value;

        const foods = getFoodsFromStorage();
        foods[index] = { title, description, type, imageUrl: foods[index].imageUrl };
        localStorage.setItem("foods", JSON.stringify(foods));
        loadFoods();
        closeModal();
    }

    window.closeModal = function() {
        editFoodModal.style.display = "none";
    }

    function openSelectFoodModal(target) {
        foodSelection.innerHTML = '';
        const foods = getFoodsFromStorage();

        foods.forEach((food, index) => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `food-${index}`;
            checkbox.value = index;

            const label = document.createElement("label");
            label.htmlFor = `food-${index}`;
            label.textContent = food.title;

            foodSelection.appendChild(checkbox);
            foodSelection.appendChild(label);
            foodSelection.appendChild(document.createElement("br"));
        });

        selectFoodModal.style.display = "block";

        confirmSelectionButton.onclick = () => confirmFoodSelection(target);
    }

    function confirmFoodSelection(target) {
        const selectedFoods = [];
        const checkboxes = foodSelection.querySelectorAll("input[type='checkbox']:checked");
        checkboxes.forEach(checkbox => {
            const foodIndex = checkbox.value;
            const foods = getFoodsFromStorage();
            selectedFoods.push(foods[foodIndex]);
        });

        target.innerHTML = ''; 
        selectedFoods.forEach(food => {
            const foodContainer = document.createElement("div");
            foodContainer.innerHTML = `
                <img src="${food.imageUrl}" alt="${food.title}" style="width:50px;height:auto;">
                <p>${food.title}</p>
            `;
            target.appendChild(foodContainer);
        });

        closeSelectFoodModal();
    }

    
});


const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const modal = document.getElementById('myModal');

openModalBtn.addEventListener('click', function(event) {
    event.preventDefault();
    modal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


function closeSelectFoodModal() {
    selectFoodModal.style.display = "none";
}