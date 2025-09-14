import {Contact} from '../types';
import {getElement} from "../utils";

// Toggle active class on letter elements
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
    const template = getElement<HTMLTemplateElement>('#contact');

    const item = template.content.cloneNode(true) as HTMLElement;

    const contactElem = item.querySelector('.element__contact') as HTMLElement;
    const contactTextElem = item.querySelector('.element__contact-text') as HTMLElement;
    contactElem.dataset.index = contact.id;
    contactTextElem.innerHTML = generateContactHTML(contact);

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
    const counterElement = letterElement.querySelector('.element__counter');

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