// Мобильная навигация
import mobileNav from './modules/mobile-nav.js';
import addContact, { addContactToTable } from './modules/form.js';
import {} from './modules/table.js';

mobileNav();

// TODO: rewrite addContact
addContact();
render();

// TODO: rewrite render
function render() {
    const contacts = JSON.parse(localStorage.getItem('contacts'));

    for (let key in contacts) {
        contacts[key].forEach(element => {
            addContactToTable(element, key);
        });
    }
}