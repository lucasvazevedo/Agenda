// script.js
document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".card");
    const hours = document.querySelectorAll(".hour");

    // Adicionar a funcionalidade de arrastar nos cards
    cards.forEach(card => {
        card.addEventListener("dragstart", dragStart);
    });

    // Adicionar a funcionalidade de soltar nas horas da agenda
    hours.forEach(hour => {
        hour.addEventListener("dragover", dragOver);
        hour.addEventListener("drop", drop);
    });

    function dragStart(e) {
        e.dataTransfer.setData("text/plain", e.target.innerHTML);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const cardHTML = e.dataTransfer.getData("text/plain");
        e.target.innerHTML += cardHTML; // Coloca o card na hora correspondente
    }
});
