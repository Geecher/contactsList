// Мобильная навигация
import mobileNav from './modules/mobile-nav.js';
import {addContactToTable, generateContactHTML, updateElementCounter} from './modules/table.js';
import Inputmask from "inputmask";

mobileNav();

// Render contacts from local storage
(function render() {
    const contacts = JSON.parse(localStorage.getItem('contacts'));

    for (let key in contacts) {
        contacts[key].forEach(contact => {
            addContactToTable(contact, key);
        });
    }
})();

// Add new contact
document.querySelector('#add').addEventListener('click', addContact);

function addContact() {
    const form = document.querySelector('#form');
    const formData = new FormData(form);

    const contactData = {};
    for (const [key, value] of formData.entries()) {
        contactData[key] = value.trim().replace(/\s+/g, ' ');
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
    let contacts = JSON.parse(localStorage.getItem('contacts')) || {};

    if (!contacts[firstLetter]) {
        contacts[firstLetter] = [];
    }
    contacts[firstLetter].push(contact);

    setContactsToLocalStorage(contacts);
    addContactToTable(contact, firstLetter);
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
    const deleteButton = event.target.closest('.element__contact-delete');
    if (deleteButton) {
        const contactElement = deleteButton.closest('.element__contact');
        const contactId = contactElement.getAttribute('data-index');
        if (deleteContactById(contactId)) {
            const searchModal = document.querySelector('#search-modal');
            if (!searchModal.classList.contains('hidden')) {
                // Delete from search results if search modal is open
                const searchResults = document.querySelector('#search-results');
                const searchContactElement = searchResults.querySelector(`[data-index="${contactId}"]`);
                if (searchContactElement) {
                    searchContactElement.remove();
                }
                // Delete from main contact list
                const mainContactElement = document.querySelector(`.element__contact[data-index="${contactId}"]`);
                if (mainContactElement) {
                    const firstLetter = mainContactElement.previousElementSibling?.getAttribute('data-id') ||
                        mainContactElement.parentElement?.getAttribute('data-id');
                    updateElementCounter(firstLetter);
                    mainContactElement.remove();
                }
            } else {
                // If search modal is not open, delete from main contact list
                const firstLetter = contactElement.previousElementSibling?.getAttribute('data-id') ||
                    contactElement.parentElement?.getAttribute('data-id');
                updateElementCounter(firstLetter);
                contactElement.remove();
            }
        }
    }
});

function deleteContactById(contactId) {
    let contacts = JSON.parse(localStorage.getItem('contacts')) || {};
    for (let letter in contacts) {
        const index = contacts[letter].findIndex(contact => contact.id === contactId);
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
    const searchButton = event.target.closest('#search');
    if (searchButton) {
        openModal('search-modal');
        const searchInput = document.querySelector('#search-input');
        searchInput.value = '';
        searchInput.focus();
    }
})

// Show all contacts in search modal
document.querySelector('#show-all').addEventListener('click', () => {
    generateSearchResults();
})

// Search contacts
document.querySelector('#search-input').addEventListener('input', (event) => {
    const searchValue = event.target.value.trim().toLowerCase();
    generateSearchResults(searchValue);
    if (!searchValue) {
        document.querySelector('#search-results').innerHTML = '';
    }
});

// Generate search results
function generateSearchResults(searchValue = '') {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || {};
    const searchResultsElement = document.querySelector('#search-results');
    searchResultsElement.innerHTML = '';

    for (let letter in contacts) {
        contacts[letter].forEach(contact => {
            const values = [contact.name, contact.vacancy, contact.phone].map(v => v.toLowerCase());
            if (!searchValue || values.some(v => v.includes(searchValue.toLowerCase()))) {
                const contactElement = document.createElement('div');
                contactElement.classList.add('element__contact');
                contactElement.dataset.index = contact.id;
                contactElement.innerHTML = `
                    <span class="element__contact-text">
                        ${generateContactHTML(contact)}
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
        })
    }
}

// Open edit modal
document.addEventListener('click', (event) => {
    const editButton = event.target.closest('.element__contact-edit');
    if (editButton) {
        const contactElement = editButton.closest('.element__contact');
        const contactId = contactElement.dataset.index;

        const contacts = JSON.parse(localStorage.getItem('contacts')) || {};
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
    const modal = document.querySelector(`#${modalId}`);
    modal.classList.remove('hidden');

    const closeOnOutsideClick = (event) => {
        if (event.target === modal) {
            closeModal(modalId);
            document.removeEventListener('click', closeOnOutsideClick); // Удаляем слушатель
        }
    };

    document.addEventListener('click', closeOnOutsideClick);
}

// Open edit modal with contact data
function openEditModal(contactData, contactId) {
    openModal('edit-modal');

    const form = document.querySelector('#edit-form');
    form.dataset.contactId = contactId;

    document.querySelector('#edit-name').value = contactData.name;
    document.querySelector('#edit-vacancy').value = contactData.vacancy;
    document.querySelector('#edit-phone').value = contactData.phone;
}

// Save edited contact
document.querySelector('#save-edit').addEventListener('click', (event) => {
    event.preventDefault();

    const form = document.querySelector('#edit-form');
    const contactId = form.dataset.contactId;

    const updatedData = {
        name: document.querySelector('#edit-name').value.trim(),
        vacancy: document.querySelector('#edit-vacancy').value.trim(),
        phone: document.querySelector('#edit-phone').value.trim(),
    };

    if (checkFormData(updatedData)) {
        if (updateContactById(contactId, updatedData)) {
            const contactElement = document.querySelector(`[data-index="${contactId}"]`);
            contactElement.querySelector('.element__contact-text').innerHTML = generateContactHTML(updatedData);

            const firstLetter = updatedData.name.charAt(0).toLowerCase();
            updateElementCounter(firstLetter);

            closeModal('edit-modal');
            showMessage('success', 'Contact updated successfully!');

            // If search modal is open, update search results
            const searchModal = document.querySelector('#search-modal');
            if (!searchModal.classList.contains('hidden')) {
                const searchInput = document.querySelector('#search-input');
                searchInput.value = '';
                generateSearchResults();
            }
        }
    }
});

// Close modal by ID
function closeModal(modalId) {
    const modal = document.querySelector(`#${modalId}`);
    modal.classList.add('hidden');

    if (modalId === 'edit-modal') {
        const form = document.querySelector('#edit-form');
        form.reset();
        form.removeAttribute('data-contact-id');
    }
    if (modalId === 'search-modal') {
        const searchResults = document.querySelector('#search-results');
        searchResults.innerHTML = '';
    }
}

// Close edit modal
document.querySelector('#cancel-edit').addEventListener('click', () => closeModal('edit-modal'));

// Close search modal
document.querySelector('#cancel-search').addEventListener('click', () => closeModal('search-modal'));

// Update contact by ID
function updateContactById(contactId, updatedData) {
    let contacts = JSON.parse(localStorage.getItem('contacts')) || {};
    let contactFound = false;
    let oldFirstLetter = '';

    for (let letter in contacts) {
        const index = contacts[letter].findIndex(contact => contact.id === contactId);
        if (index !== -1) {
            const oldContact = contacts[letter][index];
            oldFirstLetter = oldContact.name.charAt(0).toLowerCase();
            const newFirstLetter = updatedData.name.charAt(0).toLowerCase();

            const contactElement = document.querySelector(`[data-index="${contactId}"]`);

            if (oldFirstLetter !== newFirstLetter) {
                // Delete contact from old letter
                contacts[letter].splice(index, 1);
                contactElement.remove();

                // Add contact to new letter
                if (!contacts[newFirstLetter]) {
                    contacts[newFirstLetter] = [];
                }
                contacts[newFirstLetter].push({ ...oldContact, ...updatedData });
                addContactToTable({ ...oldContact, ...updatedData }, newFirstLetter);
            } else {
                // Update existing contact
                contacts[letter][index] = { ...oldContact, ...updatedData };
                contactElement.querySelector('.element__contact-text').innerHTML = generateContactHTML(updatedData);
            }

            contactFound = true;
            break;
        }
    }

    if (contactFound) {
        setContactsToLocalStorage(contacts);
        updateElementCounter(oldFirstLetter);
        return true;
    }
    return false;
}

// Check form data from inputs
function checkFormData(data) {
    let inputCorrectStatus = true;

    for (let key in data) {
        const value = data[key].toLowerCase();

        if (!value) {
            showFieldError(key, `Field ${key} is empty`);
            inputCorrectStatus = false;
        } else if (!checkInputValue(value, key)) {
            showFieldError(key, `Field ${key} is incorrect`);
            inputCorrectStatus = false;
        }
    }

    const contacts = JSON.parse(localStorage.getItem('contacts')) || {};
    for (let letter in contacts) {
        if (contacts[letter].some(contact =>
            Object.keys(data).every(key =>
                contact[key] && contact[key].trim().toLowerCase() === data[key].trim().toLowerCase()
            )
        )) {
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
    } else if (['name', 'vacancy'].includes(fieldType)) {
        isValid = /^[a-zA-Z\s]+$/.test(value);
    }

    return isValid;
}

// Show error on incorrect field
function showFieldError(field, message) {
    const fieldElement = document.querySelector(`#${field}`);
    fieldElement.classList.add('error');

    showMessage('error', message);
}

// Show message in the message block
function showMessage(type, message) {
    const messageElement = document.querySelector(`#${type}`);
    messageElement.classList.add('fadeOut');
    messageElement.innerHTML += `<br>${message}`;

    setTimeout(() => {
        messageElement.classList.remove('fadeOut');
        messageElement.innerHTML = '';
    }, 4000);
}

// Clear contacts list from local storage and UI
document.querySelector('#clear').addEventListener('click', clearContactsList);

function clearContactsList() {
    localStorage.removeItem('contacts');
    document.querySelectorAll('.element__contact').forEach(element => {
        element.remove();
    });

    document.querySelectorAll('.element__letter').forEach(letterElement => {
        const firstLetter = letterElement.getAttribute('data-id');
        updateElementCounter(firstLetter);
    });
}

// Generate unique ID for each contact
function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Mask for phone number inputs
const phoneInput = document.querySelector('#phone');
Inputmask({mask: "+7 (999) 999-99-99"}).mask(phoneInput);

const editPhoneInput = document.querySelector('#edit-phone');
Inputmask({mask: "+7 (999) 999-99-99"}).mask(editPhoneInput);


// Check error on inputs and delete when user types
const inputs = document.querySelectorAll('#form input');
inputs.forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('error');
        const errorElement = document.querySelector('#error');
        errorElement.innerHTML = '';
    });
})

// All form buttons prevent default action
document.querySelectorAll('#form button').forEach((button) => {
    button.addEventListener('click', (event) => event.preventDefault());
});
