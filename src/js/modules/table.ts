import {Contact} from '../types';

let letters = document.querySelectorAll('.element__letter');

letters.forEach((element) => {
    element.addEventListener('click', (e): void => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.classList.toggle('active');
        }
    })
});



// Add a contact to the table
export function addContactToTable(contact: Contact, firstLetter: string) {
    const letterElement = getElement<HTMLElement>(`[data-id="${firstLetter}"]`);
    if (!letterElement) return;
    const template = getElement<HTMLTemplateElement>('#contact');
    if (!template) throw new Error('Template not found');

    const item = template.content.cloneNode(true) as DocumentFragment;

    const contactElem = item.querySelector('.element__contact') as HTMLElement | null;
    const contactTextElem = item.querySelector('.element__contact-text') as HTMLElement | null;
    if (contactElem) contactElem.dataset.index = contact.id;
    if (contactTextElem) contactTextElem.innerHTML = generateContactHTML(contact);

    letterElement.after(item);

    updateElementCounter(firstLetter);
}

// Generate HTML for contact information
export function generateContactHTML(contact: Contact) {
    let contactInfo = '';
    for (let key in contact) {
        if (key === 'id') continue;
        if (key === 'phone') {
            contactInfo += `${key}: <b>
                <a href="tel:${contact[key as keyof Contact]?.replace(/(?!^\+)\D/g, '')}">
                    ${contact[key as keyof Contact]}
                </a></b><br>`;
            continue;
        }
        contactInfo += `${key}: <b>${contact[key as keyof Contact]}</b><br>`;
    }
    return contactInfo;
}

// Update element counter for contacts
export function updateElementCounter(firstLetter: string): void {
    const letterElement = getElement<HTMLElement>(`[data-id="${firstLetter}"]`);
    if (!letterElement) return;
    const counterElement = letterElement.querySelector('.element__counter') as HTMLElement | null;

    const contactsRaw = localStorage.getItem('contacts');
    const contacts: Record<string, Contact[]> = contactsRaw ? JSON.parse(contactsRaw) : {};
    const count = contacts[firstLetter] ? contacts[firstLetter].length : 0;

    if (counterElement !== null) {
        if (count === 0) {
            counterElement.remove();
        } else {
            counterElement.textContent= count.toString();
        }
    } else if (count > 0) {
        const newCounter = document.createElement('span');
        newCounter.classList.add('element__counter');
        newCounter.textContent = count.toString();
        letterElement.appendChild(newCounter);
    }
}

function getElement<T extends HTMLElement>(selector: string): T | null {
    return document.querySelector(selector) as T | null;
}