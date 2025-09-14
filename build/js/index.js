"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Mobile navigation
const mobile_nav_1 = __importDefault(require("./modules/mobile-nav"));
const table_1 = require("./modules/table");
const inputmask_1 = __importDefault(require("inputmask"));
const utils_1 = require("./utils");
(0, mobile_nav_1.default)();
// Render contacts from local storage
(function render() {
    const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
    for (let key in contacts) {
        contacts[key].forEach((contact) => {
            (0, table_1.addContactToTable)(contact, key);
        });
    }
})();
// Add new contact
(0, utils_1.getElement)('#add').addEventListener('click', addContact);
function addContact() {
    const form = (0, utils_1.getElement)('#form');
    const formData = new FormData(form);
    let contactData = {};
    for (const [key, value] of formData.entries()) {
        contactData[key] = value.toString().trim().replace(/\s+/g, ' ');
    }
    const firstLetter = contactData.name.charAt(0).toLowerCase();
    if (checkFormData(contactData)) {
        contactData.id = generateUniqueId();
        addContactToDB(contactData, firstLetter);
        showMessage('success', 'Contact added successfully!');
        form.reset();
    }
}
// Add contact to DB (Local Storage)
function addContactToDB(contact, firstLetter) {
    let contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
    if (!contacts[firstLetter]) {
        contacts[firstLetter] = [];
    }
    contacts[firstLetter].push(contact);
    setContactsToLocalStorage(contacts);
    (0, table_1.addContactToTable)(contact, firstLetter);
}
// Set contacts to local storage
function setContactsToLocalStorage(contacts) {
    let sortedContacts = sortContactsByAlphabet(contacts);
    localStorage.setItem('contacts', JSON.stringify(sortedContacts));
}
// Sort object by alphabet
function sortContactsByAlphabet(contacts) {
    const sortedKeys = Object.keys(contacts).sort();
    const sortedContacts = {};
    for (const key of sortedKeys) {
        sortedContacts[key] = contacts[key];
    }
    return sortedContacts;
}
// Delete contact by ID
document.addEventListener('click', (event) => {
    var _a, _b, _c, _d;
    const deleteButton = event.target instanceof HTMLElement ? event.target.closest('.element__contact-delete') : null;
    if (deleteButton) {
        const contactElement = deleteButton.closest('.element__contact');
        const contactId = contactElement.getAttribute('data-index');
        if (deleteContactById(contactId)) {
            const searchModal = (0, utils_1.getElement)('#search-modal');
            if (!searchModal.classList.contains('hidden')) {
                // Delete from search results if search modal is open
                const searchResults = (0, utils_1.getElement)('#search-results');
                const searchContactElement = searchResults.querySelector(`[data-index="${contactId}"]`);
                if (searchContactElement) {
                    searchContactElement.remove();
                }
                // Delete from main contact list
                const mainContactElement = (0, utils_1.getElement)(`.element__contact[data-index="${contactId}"]`);
                if (mainContactElement) {
                    const firstLetter = ((_a = mainContactElement.previousElementSibling) === null || _a === void 0 ? void 0 : _a.getAttribute('data-id')) ||
                        ((_b = mainContactElement.parentElement) === null || _b === void 0 ? void 0 : _b.getAttribute('data-id'));
                    (0, table_1.updateElementCounter)(firstLetter);
                    mainContactElement.remove();
                }
            }
            else {
                // If search modal is not open, delete from main contact list
                const firstLetter = ((_c = contactElement.previousElementSibling) === null || _c === void 0 ? void 0 : _c.getAttribute('data-id')) ||
                    ((_d = contactElement.parentElement) === null || _d === void 0 ? void 0 : _d.getAttribute('data-id'));
                (0, table_1.updateElementCounter)(firstLetter);
                contactElement.remove();
            }
        }
    }
});
function deleteContactById(contactId) {
    let contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
    for (let letter in contacts) {
        const index = contacts[letter].findIndex((contact) => contact.id === contactId);
        if (index !== -1) {
            contacts[letter].splice(index, 1);
            contacts = sortContactsByAlphabet(contacts);
            setContactsToLocalStorage(contacts);
            return true;
        }
    }
    return false;
}
// Open search modal
document.addEventListener('click', (event) => {
    const searchButton = event.target instanceof HTMLElement ? event.target.closest('#search') : null;
    if (searchButton) {
        openModal('search-modal');
        const searchInput = (0, utils_1.getElement)('#search-input');
        searchInput.value = '';
        searchInput.focus();
    }
});
// Show all contacts in search modal
(0, utils_1.getElement)('#show-all').addEventListener('click', () => {
    generateSearchResults();
});
// Search contacts
(0, utils_1.getElement)('#search-input').addEventListener('input', (event) => {
    const searchValue = event.target instanceof HTMLInputElement ? event.target.value.trim().toLowerCase() : '';
    generateSearchResults(searchValue);
    if (!searchValue) {
        (0, utils_1.getElement)('#search-results').innerHTML = '';
    }
});
// Generate search results
function generateSearchResults(searchValue = '') {
    const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
    const searchResultsElement = (0, utils_1.getElement)('#search-results');
    searchResultsElement.innerHTML = '';
    for (let letter in contacts) {
        contacts[letter].forEach((contact) => {
            const values = [contact.name, contact.vacancy, contact.phone].map(v => v.toLowerCase());
            if (!searchValue || values.some(v => v.includes(searchValue.toLowerCase()))) {
                const contactElement = document.createElement('div');
                contactElement.classList.add('element__contact');
                contactElement.dataset.index = contact.id;
                contactElement.innerHTML = `
                    <span class="element__contact-text">
                        ${(0, table_1.generateContactHTML)(contact)}
                    </span>
                    <div class="element__contact-icons">
                        <svg class="element__contact-delete icon icon--delete">
                            <use href="./img/svgsprite/sprite.symbol.svg#delete"></use>
                        </svg>
                        <svg class="element__contact-edit icon icon--edit">
                            <use href="./img/svgsprite/sprite.symbol.svg#edit"></use>
                        </svg>
                    </div>
                `;
                searchResultsElement.appendChild(contactElement);
            }
        });
    }
}
// Open edit modal
document.addEventListener('click', (event) => {
    const editButton = event.target instanceof HTMLElement ? event.target.closest('.element__contact-edit') : null;
    if (editButton) {
        const contactElement = editButton.closest('.element__contact');
        const contactId = contactElement.dataset.index;
        const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
        const contactData = findContactById(contactId, contacts);
        if (contactData) {
            openEditModal(contactData, contactId);
        }
    }
});
function findContactById(contactId, contacts) {
    for (let letter in contacts) {
        const contact = contacts[letter].find(contact => contact.id === contactId);
        if (contact) {
            return contact;
        }
    }
    return null;
}
// Open modal by ID
function openModal(modalId) {
    const modal = (0, utils_1.getElement)(`#${modalId}`);
    modal.classList.remove('hidden');
    const closeOnOutsideClick = (event) => {
        if (event.target === modal) {
            closeModal(modalId);
            // Delete listener
            document.removeEventListener('click', closeOnOutsideClick);
        }
    };
    document.addEventListener('click', closeOnOutsideClick);
}
// Open edit modal with contact data
function openEditModal(contactData, contactId) {
    openModal('edit-modal');
    const form = (0, utils_1.getElement)('#edit-form');
    form.dataset.contactId = contactId;
    (0, utils_1.getElement)('#edit-name').value = contactData.name;
    (0, utils_1.getElement)('#edit-vacancy').value = contactData.vacancy;
    (0, utils_1.getElement)('#edit-phone').value = contactData.phone;
}
// Save edited contact
(0, utils_1.getElement)('#save-edit').addEventListener('click', (event) => {
    event.preventDefault();
    const form = (0, utils_1.getElement)('#edit-form');
    const contactId = form.dataset.contactId;
    const updatedData = {
        name: (0, utils_1.getElement)('#edit-name').value.trim(),
        vacancy: (0, utils_1.getElement)('#edit-vacancy').value.trim(),
        phone: (0, utils_1.getElement)('#edit-phone').value.trim(),
    };
    if (checkFormData(updatedData)) {
        if (updateContactById(contactId, updatedData)) {
            const contactElement = (0, utils_1.getElement)(`[data-index="${contactId}"]`);
            contactElement.querySelector('.element__contact-text').innerHTML = (0, table_1.generateContactHTML)(updatedData);
            const firstLetter = updatedData.name.charAt(0).toLowerCase();
            (0, table_1.updateElementCounter)(firstLetter);
            closeModal('edit-modal');
            showMessage('success', 'Contact updated successfully!');
            // If search modal is open, update search results
            const searchModal = (0, utils_1.getElement)('#search-modal');
            if (!searchModal.classList.contains('hidden')) {
                const searchInput = (0, utils_1.getElement)('#search-input');
                searchInput.value = '';
                generateSearchResults();
            }
        }
    }
});
// Close modal by ID
function closeModal(modalId) {
    const modal = (0, utils_1.getElement)(`#${modalId}`);
    modal.classList.add('hidden');
    if (modalId === 'edit-modal') {
        const form = (0, utils_1.getElement)('#edit-form');
        form.reset();
        form.removeAttribute('data-contact-id');
    }
    if (modalId === 'search-modal') {
        const searchResults = (0, utils_1.getElement)('#search-results');
        searchResults.innerHTML = '';
    }
}
// Close edit modal
(0, utils_1.getElement)('#cancel-edit').addEventListener('click', () => closeModal('edit-modal'));
// Close search modal
(0, utils_1.getElement)('#cancel-search').addEventListener('click', () => closeModal('search-modal'));
// Update contact by ID
function updateContactById(contactId, updatedData) {
    let contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
    let contactFound = false;
    let oldFirstLetter = '';
    for (let letter in contacts) {
        const index = contacts[letter].findIndex(contact => contact.id === contactId);
        if (index !== -1) {
            const oldContact = contacts[letter][index];
            oldFirstLetter = oldContact.name.charAt(0).toLowerCase();
            const newFirstLetter = updatedData.name.charAt(0).toLowerCase();
            const contactElement = (0, utils_1.getElement)(`[data-index="${contactId}"]`);
            if (oldFirstLetter !== newFirstLetter) {
                // Delete contact from old letter
                contacts[letter].splice(index, 1);
                contactElement.remove();
                // Add contact to new letter
                if (!contacts[newFirstLetter]) {
                    contacts[newFirstLetter] = [];
                }
                contacts[newFirstLetter].push(Object.assign(Object.assign({}, oldContact), updatedData));
                (0, table_1.addContactToTable)(Object.assign(Object.assign({}, oldContact), updatedData), newFirstLetter);
            }
            else {
                // Update existing contact
                contacts[letter][index] = Object.assign(Object.assign({}, oldContact), updatedData);
                contactElement.querySelector('.element__contact-text').innerHTML = (0, table_1.generateContactHTML)(updatedData);
            }
            contactFound = true;
            break;
        }
    }
    if (contactFound) {
        setContactsToLocalStorage(contacts);
        (0, table_1.updateElementCounter)(oldFirstLetter);
        return true;
    }
    return false;
}
// Check form data from inputs
function checkFormData(data) {
    let inputCorrectStatus = true;
    for (let key in data) {
        const value = data[key];
        if (!value) {
            showFieldError(key, `Field ${key} is empty`);
            inputCorrectStatus = false;
        }
        else if (!checkInputValue(value, key)) {
            showFieldError(key, `Field ${key} is incorrect`);
            inputCorrectStatus = false;
        }
    }
    const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
    for (let letter in contacts) {
        if (contacts[letter].some(contact => Object.keys(data).every(key => contact[key] && contact[key].trim().toLowerCase() === data[key].trim().toLowerCase()))) {
            showMessage('error', 'This contact is already exist!');
            inputCorrectStatus = false;
            break;
        }
    }
    return inputCorrectStatus;
}
function checkInputValue(value, fieldType) {
    let isValid = true;
    if (fieldType === 'phone') {
        isValid = /^\+?[0-9\s\-()—]{10,20}$/.test(value);
    }
    else if (['name', 'vacancy'].includes(fieldType)) {
        isValid = /^[a-zA-Z\s]+$/.test(value);
    }
    return isValid;
}
// Show error on incorrect field
function showFieldError(field, message) {
    const fieldElement = (0, utils_1.getElement)(`#${field}`);
    fieldElement.classList.add('error');
    showMessage('error', message);
}
// Show message in the message block
function showMessage(type, message) {
    const messageElement = (0, utils_1.getElement)(`#${type}`);
    messageElement.classList.add('fadeOut');
    messageElement.innerHTML += `<br>${message}`;
    setTimeout(() => {
        messageElement.classList.remove('fadeOut');
        messageElement.innerHTML = '';
    }, 4000);
}
// Clear contacts list from local storage and UI
(0, utils_1.getElement)('#clear').addEventListener('click', clearContactsList);
function clearContactsList() {
    localStorage.removeItem('contacts');
    document.querySelectorAll('.element__contact').forEach(element => {
        element.remove();
    });
    document.querySelectorAll('.element__letter').forEach(letterElement => {
        const firstLetter = letterElement.getAttribute('data-id');
        (0, table_1.updateElementCounter)(firstLetter);
    });
}
// Generate unique ID for each contact
function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
// Mask for phone number inputs
const phoneInput = (0, utils_1.getElement)('#phone');
(0, inputmask_1.default)({ mask: "+7 (999) 999-99-99" }).mask(phoneInput);
const editPhoneInput = (0, utils_1.getElement)('#edit-phone');
(0, inputmask_1.default)({ mask: "+7 (999) 999-99-99" }).mask(editPhoneInput);
// Check error on inputs and delete when user types
const inputs = document.querySelectorAll('#form input');
inputs.forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('error');
        const errorElement = (0, utils_1.getElement)('#error');
        errorElement.innerHTML = '';
    });
});
// All form buttons prevent default action
document.querySelectorAll('#form button').forEach((button) => {
    button.addEventListener('click', (event) => event.preventDefault());
});
