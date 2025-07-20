// Мобильная навигация
import mobileNav from './modules/mobile-nav.js';
import { addContactToTable } from './modules/form.js';
import {} from './modules/table.js';

mobileNav();

// TODO: rewrite render
(function render() {
    const contacts = JSON.parse(localStorage.getItem('contacts'));

    for (let key in contacts) {
        contacts[key].forEach(contact => {
            addContactToTable(contact, key);
        });
    }
})();