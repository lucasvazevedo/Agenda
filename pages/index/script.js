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

    const dbName = "FoodDatabase";
    const dbVersion = 1;
    let db;

    const predefinedFoods = [
        { id: 1, title: "Maçã", description: "Uma fruta saudável.", type: "Fruta", imageUrl: "/assets/images/maca.png" },
        { id: 2, title: "Banana", description: "Uma fruta rica em potássio.", type: "Fruta", imageUrl: "/assets/images/banana.jpg" },
        { id: 3, title: "Alface", description: "Vegetal de folha verde.", type: "Vegetal", imageUrl: "/assets/images/alface.jpg" },
        { id: 4, title: "Frango Grelhado", description: "Uma opção saudável de proteína.", type: "Carne", imageUrl: "/assets/images/frango.jpg" }
    ];

    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = (event) => {
        db = event.target.result;
        db.createObjectStore("foods", { keyPath: "id", autoIncrement: true });
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadFoods();
    };

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
        const transaction = db.transaction(["foods"], "readwrite");
        const objectStore = transaction.objectStore("foods");
        objectStore.add(food);
    }

    function loadFoods() {
        foodList.innerHTML = '';
        const transaction = db.transaction(["foods"], "readonly");
        const objectStore = transaction.objectStore("foods");

        objectStore.getAll().onsuccess = (event) => {
            const foods = event.target.result;
            foods.forEach((food) => {
                const foodItem = document.createElement("div");
                foodItem.className = "card";
                foodItem.setAttribute("draggable", "true");
                foodItem.setAttribute("data-id", food.id);
                foodItem.innerHTML = `
                    <img src="${food.imageUrl}" alt="${food.title}" style="width:100px;height:auto;">
                    <p>${food.title}</p>
                    <p>${food.description}</p>
                    <p>Tipo: ${food.type}</p>
                    <button onclick="openEditModal(${food.id})" class="btn-edit">Editar</button>
                    <button onclick="deleteFood(${food.id})" class="btn-delete">Excluir</button>
                `;
                foodItem.addEventListener("dragstart", dragStart);
                foodItem.addEventListener("dragend", dragEnd);
                foodList.appendChild(foodItem);
            });
            updateChart();
        };

        const dropzones = document.querySelectorAll(".dropzone");
        dropzones.forEach(zone => {
            zone.addEventListener("dragover", dragOver);
            zone.addEventListener("drop", dropFood);
            zone.addEventListener("click", () => openSelectFoodModal(zone));
        });
    }

    function updateChart() {
        const transaction = db.transaction(["foods"], "readonly");
        const objectStore = transaction.objectStore("foods");

        objectStore.getAll().onsuccess = (event) => {
            const foods = event.target.result;
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
        };
    }

    function dragStart(e) {
        const id = e.target.getAttribute("data-id");
        e.dataTransfer.setData("text/plain", id);
    }

    function dragEnd(e) {
        e.target.classList.remove("dragging");
    }

    function dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }

    function dropFood(e) {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        const transaction = db.transaction(["foods"], "readonly");
        const objectStore = transaction.objectStore("foods");
        const request = objectStore.get(Number(id));

        request.onsuccess = (event) => {
            const food = event.target.result;
            if (food) {
                const foodContainer = document.createElement("div");
                foodContainer.innerHTML = `
                    <img src="${food.imageUrl}" alt="${food.title}" style="width:50px;height:auto;">
                    <p>${food.title}</p>
                `;
                e.target.innerHTML = '';
                e.target.appendChild(foodContainer);
            }
        };
    }

    window.deleteFood = function(id) {
        const transaction = db.transaction(["foods"], "readwrite");
        const objectStore = transaction.objectStore("foods");
        objectStore.delete(id);
        transaction.oncomplete = () => {
            loadFoods();
        };
    };

    window.openEditModal = function(id) {
        const transaction = db.transaction(["foods"], "readonly");
        const objectStore = transaction.objectStore("foods");
        const request = objectStore.get(id);

        request.onsuccess = (event) => {
            const food = event.target.result;
            if (food) {
                editFoodTitle.value = food.title;
                editFoodDescription.value = food.description;
                editFoodType.value = food.type;
                editFoodModal.style.display = "block";
                editFoodModal.setAttribute("data-id", id);
            }
        };
    };

    function saveEditedFood() {
        const id = parseInt(editFoodModal.getAttribute("data-id"));
        const title = editFoodTitle.value.trim();
        const description = editFoodDescription.value.trim();
        const type = editFoodType.value;

        const transaction = db.transaction(["foods"], "readwrite");
        const objectStore = transaction.objectStore("foods");
        const request = objectStore.get(id);

        request.onsuccess = (event) => {
            const food = event.target.result;
            if (food) {
                food.title = title;
                food.description = description;
                food.type = type;

                objectStore.put(food).onsuccess = () => {
                    loadFoods();
                    closeModal();
                };
            }
        };
    }

    window.closeModal = function() {
        editFoodModal.style.display = "none";
    };

    function clearInputs() {
        foodTitle.value = '';
        foodDescription.value = '';
        foodType.value = '';
        imageInput.value = '';
    }

    function openSelectFoodModal(zone) {
        foodSelection.innerHTML = ''; // Limpa a seleção anterior
        predefinedFoods.forEach(food => {
            const foodOption = document.createElement("div");
            foodOption.className = "food-option";
            foodOption.innerHTML = `
                <img src="${food.imageUrl}" alt="${food.title}" style="width:50px;height:auto;">
                <p>${food.title}</p>
                <button class="select-food-button" data-id="${food.id}">Selecionar</button>
            `;
            foodOption.querySelector(".select-food-button").addEventListener("click", () => selectFood(food, zone));
            foodSelection.appendChild(foodOption);
        });
        selectFoodModal.style.display = "block";
    }

    function selectFood(food, zone) {
        const foodContainer = document.createElement("div");
        foodContainer.innerHTML = `
            <img src="${food.imageUrl}" alt="${food.title}" style="width:50px;height:auto;">
            <p>${food.title}</p>
        `;
        zone.innerHTML = '';
        zone.appendChild(foodContainer);
        selectFoodModal.style.display = "none";
    }
});
