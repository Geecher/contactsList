import Inputmask from "inputmask";

// Mask for phone number input
const phoneInput = document.querySelector('#phone');
Inputmask({mask: "+7 (999) 999-99-99"}).mask(phoneInput);

// Check error on inputs and delete when user types
const inputs = document.querySelectorAll('#form input');
inputs.forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('error');
        const errorElement = document.querySelector('#error');
        errorElement.innerHTML = '';
    });
})

// Add new contact
document.querySelector('#add').addEventListener('click', addContact);

function addContact() {
    const form = document.querySelector('#form');
    const formData = new FormData(form);
    const contactData = Object.fromEntries(formData.entries());
    const firstLetter = contactData.name.charAt(0).toLowerCase();

    if (checkFormData(contactData)) {
        addContactToDB(contactData, firstLetter);
        showMessage('success', 'Contact added successfully!');
        // TODO: Add success message, reset form and delete error message
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

    contacts = sortContactsByAlphabet(contacts);
    localStorage.setItem('contacts', JSON.stringify(contacts));

    addContactToTable(contact, firstLetter);
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

export function addContactToTable(contact, firstLetter) {
    const letterElement = document.querySelector(`[data-id="${firstLetter}"]`);
    const template = document.querySelector('#contact');
    const item = template.content.cloneNode(true);

    let contactInfo = '';
    for (let key in contact) {
        if (key === 'phone') {
            contactInfo += `${key}: <b>
                <a href="tel:${contact[key].replace(/(?!^\+)\D/g, '')}">
                    ${contact[key]}
                </a></b><br>`;
            continue;
        }
        contactInfo += `${key}: <b>${contact[key]}</b><br>`;
    }

    item.querySelector('.element__contact-text').innerHTML = contactInfo;

    letterElement.after(item);
}

// Check form data from inputs
function checkFormData(data) {
    let inputCorrectStasus = true;

    for (let key in data) {
        const value = data[key].trim().toLowerCase();

        if (!value) {
            showFieldError(key, `Field ${key} is empty`);
            inputCorrectStasus = false;
        } else if (!checkInputValue(value, key)) {
            showFieldError(key, `Field ${key} is incorrect`);
            inputCorrectStasus = false;
        }
    }

    return inputCorrectStasus;
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
}

// All form buttons prevent default action
document.querySelectorAll('#form button').forEach((button) => {
    button.addEventListener('click', (event) => event.preventDefault());
});
