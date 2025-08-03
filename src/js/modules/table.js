let letters = document.querySelectorAll('.element__letter');

letters.forEach((element) => {
    element.addEventListener('click', (e) => {
        e.currentTarget.classList.toggle('active');
    })
});

// Add a contact to the table
export function addContactToTable(contact, firstLetter) {
    const letterElement = document.querySelector(`[data-id="${firstLetter}"]`);
    const template = document.querySelector('#contact');
    const item = template.content.cloneNode(true);
    item.querySelector('.element__contact').dataset.index = contact.id;

    item.querySelector('.element__contact-text').innerHTML = generateContactHTML(contact);

    letterElement.after(item);

    updateElementCounter(firstLetter);
}

// Generate HTML for contact information
export function generateContactHTML(contact) {
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

// Update element counter for contacts
export function updateElementCounter(firstLetter) {
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