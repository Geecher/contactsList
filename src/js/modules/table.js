let letters = document.querySelectorAll('.element__letter');

letters.forEach((element) => {
    element.addEventListener('click', (e) => {
        e.currentTarget.classList.toggle('active');
    })
});
