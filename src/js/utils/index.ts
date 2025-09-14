// Helper function to get an element by selector with type casting
// TODO Возможно нужен будет рефакторинг, если выяснится, что так не отрабатывает проверка на null
export function getElement<T extends HTMLElement>(selector: string): T {
    return document.querySelector(selector) as T;
}