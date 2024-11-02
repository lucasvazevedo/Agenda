document.getElementById('back-to-form').addEventListener('click', function() {
    window.location.href = '../index/index.html';
});

function getFoodConsumptionData() {
    const foods = getFoodsFromStorage();
    const consumptionCount = {};

    foods.forEach(food => {
        const title = food.title; 
        consumptionCount[title] = (consumptionCount[title] || 0) + 1;
    });

    return consumptionCount;
}

function loadChartData() {
    const consumptionData = getFoodConsumptionData();
    const labels = Object.keys(consumptionData);
    const data = Object.values(consumptionData);

    return { labels, data };
}

function getFoodsFromStorage() {
    return JSON.parse(localStorage.getItem("foods")) || [];
}

const ctx = document.getElementById('consumption-chart').getContext('2d');
const { labels, data } = loadChartData();

const consumptionChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels.length ? labels : ['Nenhum Alimento Registrado'],
        datasets: [{
            label: 'Consumo',
            data: data.length ? data : [0],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
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
