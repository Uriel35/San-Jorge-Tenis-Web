let hamButton = document.querySelector('.header__ham');
let listContainer = document.querySelector('.header__list-ul');
let listItem = document.querySelectorAll('.header__list-ul li');


hamButton.addEventListener('click', () => {
    hamButton.classList.toggle('activado');
    listContainer.classList.toggle('activado');
})

listItem.forEach(element => {
    element.addEventListener('click', () => {
        listContainer.classList.remove('activado');
        hamButton.classList.remove('activado');
    })
})
