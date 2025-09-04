let letters = document.querySelectorAll('.element__letter');
letters.forEach((element) => {
    element.addEventListener('click', (e) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.classList.toggle('active');
        }
    });
});
// Add a contact to the table
export function addContactToTable(contact, firstLetter) {
    const letterElement = getElement(`[data-id="${firstLetter}"]`);
    if (!letterElement)
        return;
    const template = getElement('#contact');
    if (!template)
        throw new Error('Template not found');
    const item = template.content.cloneNode(true);
    const contactElem = item.querySelector('.element__contact');
    const contactTextElem = item.querySelector('.element__contact-text');
    if (contactElem)
        contactElem.dataset.index = contact.id;
    if (contactTextElem)
        contactTextElem.innerHTML = generateContactHTML(contact);
    letterElement.after(item);
    updateElementCounter(firstLetter);
}
// Generate HTML for contact information
export function generateContactHTML(contact) {
    var _a;
    let contactInfo = '';
    for (let key in contact) {
        if (key === 'id')
            continue;
        if (key === 'phone') {
            contactInfo += `${key}: <b>
                <a href="tel:${(_a = contact[key]) === null || _a === void 0 ? void 0 : _a.replace(/(?!^\+)\D/g, '')}">
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
    const letterElement = getElement(`[data-id="${firstLetter}"]`);
    if (!letterElement)
        return;
    const counterElement = letterElement.querySelector('.element__counter');
    const contactsRaw = localStorage.getItem('contacts');
    const contacts = contactsRaw ? JSON.parse(contactsRaw) : {};
    const count = contacts[firstLetter] ? contacts[firstLetter].length : 0;
    if (counterElement !== null) {
        if (count === 0) {
            counterElement.remove();
        }
        else {
            counterElement.textContent = count.toString();
        }
    }
    else if (count > 0) {
        const newCounter = document.createElement('span');
        newCounter.classList.add('element__counter');
        newCounter.textContent = count.toString();
        letterElement.appendChild(newCounter);
    }
}
function getElement(selector) {
    return document.querySelector(selector);
}
