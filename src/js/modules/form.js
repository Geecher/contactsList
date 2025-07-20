import Inputmask from "inputmask";

// Add new contact
document.querySelector('#add').addEventListener('click', addContact);

function addContact() {
    const form = document.querySelector('#form');
    const formData = new FormData(form);
    const contactData = Object.fromEntries(formData.entries());
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
    item.querySelector('.element__contact').dataset.index = contact.id;

    item.querySelector('.element__contact-text').innerHTML = generateContactHTML(contact);

    letterElement.after(item);

    updateElementCounter(firstLetter);
}

// Update element counter for contacts
function updateElementCounter(firstLetter) {
    const letterElement = document.querySelector(`[data-id="${firstLetter}"]`);
    const counterElement = letterElement.querySelector('.element__counter');

    const contacts = JSON.parse(localStorage.getItem('contacts')) || {};
    const count = contacts[firstLetter] ? contacts[firstLetter].length : 0;

    if (counterElement) {
        if (count === 0) {
            counterElement.remove();
        } else {
            counterElement.textContent = count;
        }
    } else if (count > 0) {
        const newCounter = document.createElement('span');
        newCounter.classList.add('element__counter');
        newCounter.textContent = count;
        letterElement.appendChild(newCounter);
    }
}

// Delete contact by ID
document.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.element__contact-delete');
    if (deleteButton) {
        const contactElement = deleteButton.closest('.element__contact');
        const contactId = contactElement.getAttribute('data-index'); // Получение id
        if (deleteContactById(contactId)) {
            const firstLetter = contactElement.previousElementSibling.getAttribute('data-id');
            updateElementCounter(firstLetter);
            contactElement.remove();
        }
    }
});

function deleteContactById(contactId) {
    let contacts = JSON.parse(localStorage.getItem('contacts')) || {};
    for (let letter in contacts) {
        const index = contacts[letter].findIndex(contact => contact.id === contactId);
        if (index !== -1) {
            contacts[letter].splice(index, 1);
            //TODO: setItem to function where contacts is sorted
            localStorage.setItem('contacts', JSON.stringify(contacts));
            return true;
        }
    }
    return false;
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
        }
    }
});


// Закрытие модального окна
function closeModal(modalId) {
    const modal = document.querySelector(`#${modalId}`);
    modal.classList.add('hidden');
}

// Close edit modal
document.querySelector('#cancel-edit').addEventListener('click', () => closeModal('edit-modal'));

// Generate HTML for contact information
function generateContactHTML(contact) {
    let contactInfo = '';
    for (let key in contact) {
        if (key === 'id') continue;
        if (key === 'phone') {
            contactInfo += `${key}: <b>
                <a href="tel:${contact[key].replace(/(?!^\+)\D/g, '')}">
                    ${contact[key]}
                </a></b><br>`;
            continue;
        }
        contactInfo += `${key}: <b>${contact[key]}</b><br>`;
    }
    return contactInfo;
}

// Update contact by ID
function updateContactById(contactId, updatedData) {
    let contacts = JSON.parse(localStorage.getItem('contacts')) || {};
    let contactFound = false;

    for (let letter in contacts) {
        const index = contacts[letter].findIndex(contact => contact.id === contactId);
        if (index !== -1) {
            const oldContact = contacts[letter][index];
            const oldFirstLetter = oldContact.name.charAt(0).toLowerCase();
            const newFirstLetter = updatedData.name.charAt(0).toLowerCase();
            console.log(`Updating contact: ${oldContact.name} (${oldFirstLetter}) to ${updatedData.name} (${newFirstLetter})`);

            const contactElement = document.querySelector(`[data-index="${contactId}"]`);

            // TODO: Problem with first letter counter, dont update when contact is moved to another letter
            if (oldFirstLetter !== newFirstLetter) {
                // Delete contact from old letter
                contacts[letter].splice(index, 1);
                contactElement.remove();
                updateElementCounter(oldFirstLetter);

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
        localStorage.setItem('contacts', JSON.stringify(contacts));
        return true;
    }
    return false;
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
