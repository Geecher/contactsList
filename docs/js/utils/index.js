// Helper function to get an element by selector with type casting
// TODO Возможно нужен будет рефакторинг, если выяснится, что так не отрабатывает проверка на null
export function getElement(selector) {
    return document.querySelector(selector);
}
