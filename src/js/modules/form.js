// Add new contact
function addContact() {
    document.querySelector('#add').addEventListener('click', (e) => {
        e.preventDefault();

        const form = document.querySelector('#form');
        const formData = new FormData(form);
        const contactData = Object.fromEntries(formData.entries());
        const firstLetter = contactData.name.charAt(0).toLowerCase();

        if (checkFormData(contactData)) {
            addContactToDB(contactData, firstLetter);
            // TODO: Add success message, reset form and delete error message
            form.reset();
        }
    })
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
        contactInfo += `${key}: ${contact[key]}<br>`;
    }

    item.querySelector('.element__contact-text').innerHTML = contactInfo;

    letterElement.after(item);
}

// Check form data from inputs
function checkFormData(data) {
    let inputCorrectStasus;

    for (let key in data) {
        const value = data[key].trim().toLowerCase();

        // TODO: Change logic to check inputs
        if (value === '') {
            showFieldError(key, `Field ${key} is empty`);
            console.error(`Field ${key} is empty`);
            inputCorrectStasus = false;
        } else if (key === 'phone') {
            if (!/^\d+$/.test(value)) {
                showFieldError(key, `Field ${key} must contain only numbers`);
                console.error(`Field ${key} must contain only numbers`);
                inputCorrectStasus = false;
            } else {
                inputCorrectStasus = true;
            }
        } else if (key === 'name' || 'vacancy') {
            if (!/[a-zA-Z]/gmi.test(value)) {
                showFieldError(key, `Field ${key} must contain only english letters`);
                console.error(`Field ${key} must contain only english letters`);
                inputCorrectStasus = false;
            } else {
                inputCorrectStasus = true;
            }
        }
    }

    return inputCorrectStasus;

    // let inputValue = input.value.trim().toLowerCase();
    // let inputCorrectStasus;
    //
    // if (input.className.includes('phone')) {
    //     inputCorrectStasus = checkNumericInputValue(input, inputValue);
    // } else {
    //     inputCorrectStasus = checkTextInputValue(input, inputValue);
    // }
    // return inputCorrectStasus;
}

// TODO: Split logic to check inputs & show error message
// Show error on incorrect field
function showFieldError(field, message) {
    field = document.querySelector(`#${field}`);
    field.classList.add('error');
    const errorElement = document.querySelector('#error');
    errorElement.classList.add('fadeOut');

    errorElement.innerHTML += `<br>${message}`;
    setTimeout(() => {
        errorElement.classList.remove('fadeOut');
        errorElement.innerHTML = '';
    }, 4000);
}

export default addContact;