"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElement = getElement;
// Helper function to get an element by selector with type casting
// TODO Возможно нужен будет рефакторинг, если выяснится, что так не отрабатывает проверка на null
function getElement(selector) {
    return document.querySelector(selector);
}
