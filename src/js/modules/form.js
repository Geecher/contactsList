// Add new contact
function addContact() {
    document.querySelector('#add').addEventListener('click', (e) => {
        e.preventDefault();

        const form = document.querySelector('#form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        checkData(data);

        // console.log('Form Data:', Object.fromEntries(formData.entries()));
        // addContact();
    })
}

// Check form data from inputs
function checkData(data) {
    console.log('Данные формы: ', data);

    for (let key in data) {
        const value = data[key].trim().toLowerCase();

        // TODO: Change logic to check inputs
        if (value === '') {
            showFieldError(key, `Field ${key} is empty`);
            console.error(`Field ${key} is empty`);
        } else if (key === 'phone') {
            if (!/^\d+$/.test(value)) {
                showFieldError(key, `Field ${key} must contain only numbers`);
                console.error(`Field ${key} must contain only numbers`);
            }
        } else if (key === 'name' || 'vacancy') {
            if (!/[a-zA-Z]/gmi.test(value)) {
                showFieldError(key, `Field ${key} must contain only english letters`);
                console.error(`Field ${key} must contain only english letters`);
            }
        }
    }

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