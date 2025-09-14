// Mobile navigation
import mobileNav from './modules/mobile-nav';
import {addContactToTable, generateContactHTML, updateElementCounter} from './modules/table';
import Inputmask from "inputmask";
import {Contact, Field, Message, Modal} from "./types";
import {getElement} from "./utils";

mobileNav();

// Render contacts from local storage
(function render() {
    const contacts: Record<string, Contact[]> = JSON.parse(localStorage.getItem('contacts') || '{}');

    for (let key in contacts) {
        contacts[key].forEach((contact: Contact) => {
            addContactToTable(contact, key);
        });
    }
})();

// Add new contact
getElement('#add').addEventListener('click', addContact);

function addContact() {
    const form = getElement<HTMLFormElement>('#form');
    const formData = new FormData(form);

    let contactData: Contact = {} as Contact;
    for (const [key, value] of formData.entries()) {
        contactData[key as keyof Contact] = value.toString().trim().replace(/\s+/g, ' ');
    }
    const firstLetter: string = contactData.name.charAt(0).toLowerCase();
    if (checkFormData(contactData)) {
        contactData.id = generateUniqueId();
        addContactToDB(contactData, firstLetter);
        showMessage('success', 'Contact added successfully!');
        form.reset();
    }
}

// Add contact to DB (Local Storage)
function addContactToDB(contact: Contact, firstLetter: string) {
    let contacts: Record<string, Contact[]> = JSON.parse(localStorage.getItem('contacts') || '{}');

    if (!contacts[firstLetter]) {
        contacts[firstLetter] = [];
    }
    contacts[firstLetter].push(contact);

    setContactsToLocalStorage(contacts);
    addContactToTable(contact, firstLetter);
}

// Set contacts to local storage
function setContactsToLocalStorage(contacts: Record<string, Contact[]>) {
    let sortedContacts = sortContactsByAlphabet(contacts);
    localStorage.setItem('contacts', JSON.stringify(sortedContacts));
}

// Sort object by alphabet
function sortContactsByAlphabet(contacts: Record<string, Contact[]>) {
    const sortedKeys = Object.keys(contacts).sort();
    const sortedContacts: Record<string, Contact[]> = {};

    for (const key of sortedKeys) {
        sortedContacts[key] = contacts[key];
    }
    return sortedContacts;
}

// Delete contact by ID
document.addEventListener('click', (event) => {
    const deleteButton = event.target instanceof HTMLElement ? event.target.closest('.element__contact-delete') : null;
    if (deleteButton) {
        const contactElement = deleteButton.closest('.element__contact') as HTMLElement;
        const contactId = contactElement.getAttribute('data-index') as string;
        if (deleteContactById(contactId)) {
            const searchModal = getElement('#search-modal');
            if (!searchModal.classList.contains('hidden')) {
                // Delete from search results if search modal is open
                const searchResults = getElement('#search-results');
                const searchContactElement = searchResults.querySelector(`[data-index="${contactId}"]`);
                if (searchContactElement) {
                    searchContactElement.remove();
                }
                // Delete from main contact list
                const mainContactElement = getElement(`.element__contact[data-index="${contactId}"]`);
                if (mainContactElement) {
                    const firstLetter = mainContactElement.previousElementSibling?.getAttribute('data-id') ||
                        mainContactElement.parentElement?.getAttribute('data-id') as string;
                    updateElementCounter(firstLetter);
                    mainContactElement.remove();
                }
            } else {
                // If search modal is not open, delete from main contact list
                const firstLetter = contactElement.previousElementSibling?.getAttribute('data-id') ||
                    contactElement.parentElement?.getAttribute('data-id') as string;
                updateElementCounter(firstLetter);
                contactElement.remove();
            }
        }
    }
});

function deleteContactById(contactId: string): boolean {
    let contacts: Record<string, Contact[]> = JSON.parse(localStorage.getItem('contacts') || '{}');
    for (let letter in contacts) {
        const index = contacts[letter].findIndex((contact: Contact) => contact.id === contactId);
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
        const searchInput = getElement<HTMLInputElement>('#search-input');
        searchInput.value = '';
        searchInput.focus();
    }
})

// Show all contacts in search modal
getElement('#show-all').addEventListener('click', () => {
    generateSearchResults();
})

// Search contacts
getElement('#search-input').addEventListener('input', (event) => {
    const searchValue = event.target instanceof HTMLInputElement ? event.target.value.trim().toLowerCase() : '';
    generateSearchResults(searchValue);
    if (!searchValue) {
        getElement('#search-results').innerHTML = '';
    }
});

// Generate search results
function generateSearchResults(searchValue = '') {
    const contacts: Record<string, Contact[]> = JSON.parse(localStorage.getItem('contacts') || '{}');
    const searchResultsElement = getElement('#search-results');
    searchResultsElement.innerHTML = '';

    for (let letter in contacts) {
        contacts[letter].forEach((contact: Contact) => {
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
    const editButton = event.target instanceof HTMLElement ? event.target.closest('.element__contact-edit') : null;
    if (editButton) {
        const contactElement = editButton.closest('.element__contact') as HTMLElement;
        const contactId = contactElement.dataset.index as string;

        const contacts: Record<string, Contact[]> = JSON.parse(localStorage.getItem('contacts') || '{}');
        const contactData = findContactById(contactId, contacts);

        if (contactData) {
            openEditModal(contactData, contactId);
        }
    }
});

function findContactById(contactId: string, contacts: Record<string, Contact[]>): Contact | null {
    for (let letter in contacts) {
        const contact = contacts[letter].find(contact => contact.id === contactId);
        if (contact) {
            return contact;
        }
    }
    return null;
}

// Open modal by ID
function openModal(modalId: Modal) {
    const modal = getElement(`#${modalId}`);
    modal.classList.remove('hidden');

    const closeOnOutsideClick = (event: MouseEvent) => {
        if (event.target === modal) {
            closeModal(modalId);
            // Delete listener
            document.removeEventListener('click', closeOnOutsideClick);
        }
    };

    document.addEventListener('click', closeOnOutsideClick);
}

// Open edit modal with contact data
function openEditModal(contactData: Contact, contactId: string) {
    openModal('edit-modal');

    const form = getElement('#edit-form');
    form.dataset.contactId = contactId;

    getElement<HTMLInputElement>('#edit-name').value = contactData.name;
    getElement<HTMLInputElement>('#edit-vacancy').value = contactData.vacancy;
    getElement<HTMLInputElement>('#edit-phone').value = contactData.phone;
}

// Save edited contact
getElement('#save-edit').addEventListener('click', (event) => {
    event.preventDefault();

    const form = getElement('#edit-form');
    const contactId = form.dataset.contactId as string;

    const updatedData: Contact = {
        name: getElement<HTMLInputElement>('#edit-name').value.trim(),
        vacancy: getElement<HTMLInputElement>('#edit-vacancy').value.trim(),
        phone: getElement<HTMLInputElement>('#edit-phone').value.trim(),
    };

    if (checkFormData(updatedData)) {
        if (updateContactById(contactId, updatedData)) {
            const contactElement = getElement(`[data-index="${contactId}"]`);
            contactElement.querySelector('.element__contact-text')!.innerHTML = generateContactHTML(updatedData);

            const firstLetter = updatedData.name.charAt(0).toLowerCase();
            updateElementCounter(firstLetter);

            closeModal('edit-modal');
            showMessage('success', 'Contact updated successfully!');

            // If search modal is open, update search results
            const searchModal = getElement('#search-modal');
            if (!searchModal.classList.contains('hidden')) {
                const searchInput = getElement<HTMLInputElement>('#search-input');
                searchInput.value = '';
                generateSearchResults();
            }
        }
    }
});

// Close modal by ID
function closeModal(modalId: Modal) {
    const modal = getElement(`#${modalId}`);
    modal.classList.add('hidden');

    if (modalId === 'edit-modal') {
        const form = getElement<HTMLFormElement>('#edit-form');
        form.reset();
        form.removeAttribute('data-contact-id');
    }
    if (modalId === 'search-modal') {
        const searchResults = getElement('#search-results');
        searchResults.innerHTML = '';
    }
}

// Close edit modal
getElement('#cancel-edit').addEventListener('click', () => closeModal('edit-modal'));

// Close search modal
getElement('#cancel-search').addEventListener('click', () => closeModal('search-modal'));

// Update contact by ID
function updateContactById(contactId: string, updatedData: Contact) {
    let contacts: Record<string, Contact[]> = JSON.parse(localStorage.getItem('contacts') || '{}');
    let contactFound = false;
    let oldFirstLetter = '';

    for (let letter in contacts) {
        const index = contacts[letter].findIndex(contact => contact.id === contactId);
        if (index !== -1) {
            const oldContact = contacts[letter][index];
            oldFirstLetter = oldContact.name.charAt(0).toLowerCase();
            const newFirstLetter = updatedData.name.charAt(0).toLowerCase();

            const contactElement = getElement(`[data-index="${contactId}"]`);

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
                contactElement.querySelector('.element__contact-text')!.innerHTML = generateContactHTML(updatedData);
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
function checkFormData(data: Contact) {
    let inputCorrectStatus = true;

    for (let key in data) {
        const value = data[key as keyof Contact];

        if (!value) {
            showFieldError(key as Field, `Field ${key} is empty`);
            inputCorrectStatus = false;
        } else if (!checkInputValue(value, key as Field)) {
            showFieldError(key as Field, `Field ${key} is incorrect`);
            inputCorrectStatus = false;
        }
    }

    const contacts: Record<string, Contact[]> = JSON.parse(localStorage.getItem('contacts') || '{}');
    for (let letter in contacts) {
        if (contacts[letter].some(contact =>
            Object.keys(data).every(key =>
                contact[key as keyof Contact] && contact[key as keyof Contact]!.trim().toLowerCase() === data[key as keyof Contact]!.trim().toLowerCase()
            )
        )) {
            showMessage('error', 'This contact is already exist!');
            inputCorrectStatus = false;
            break;
        }
    }

    return inputCorrectStatus;
}

function checkInputValue(value: string, fieldType: Field) {
    let isValid = true;

    if (fieldType === 'phone') {
        isValid = /^\+?[0-9\s\-()—]{10,20}$/.test(value);
    } else if (['name', 'vacancy'].includes(fieldType)) {
        isValid = /^[a-zA-Z\s]+$/.test(value);
    }

    return isValid;
}

// Show error on incorrect field
function showFieldError(field: Field, message: string) {
    const fieldElement = getElement(`#${field}`);
    fieldElement.classList.add('error');

    showMessage('error', message);
}

// Show message in the message block
function showMessage(type: Message, message: string) {
    const messageElement = getElement(`#${type}`);
    messageElement.classList.add('fadeOut');
    messageElement.innerHTML += `<br>${message}`;

    setTimeout(() => {
        messageElement.classList.remove('fadeOut');
        messageElement.innerHTML = '';
    }, 4000);
}

// Clear contacts list from local storage and UI
getElement('#clear').addEventListener('click', clearContactsList);

function clearContactsList() {
    localStorage.removeItem('contacts');
    document.querySelectorAll('.element__contact').forEach(element => {
        element.remove();
    });

    document.querySelectorAll('.element__letter').forEach(letterElement => {
        const firstLetter = letterElement.getAttribute('data-id') as string;
        updateElementCounter(firstLetter);
    });
}

// Generate unique ID for each contact
function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Mask for phone number inputs
const phoneInput = getElement('#phone');
Inputmask({mask: "+7 (999) 999-99-99"}).mask(phoneInput);

const editPhoneInput = getElement('#edit-phone');
Inputmask({mask: "+7 (999) 999-99-99"}).mask(editPhoneInput);


// Check error on inputs and delete when user types
const inputs = document.querySelectorAll('#form input');
inputs.forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('error');
        const errorElement = getElement('#error');
        errorElement.innerHTML = '';
    });
})

// All form buttons prevent default action
document.querySelectorAll('#form button').forEach((button) => {
    button.addEventListener('click', (event) => event.preventDefault());
});
