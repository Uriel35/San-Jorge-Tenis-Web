import { playerArray, Jugador } from "/data.js";

const form = document.getElementById('register-form');
const namee = document.getElementById('name');
const surname = document.getElementById('surname');
const email = document.getElementById('email');
const password = document.getElementById('password');
const checkPassword = document.getElementById('check-password');
let getBackButton = document.querySelector('.getback-register');
let registerCtn = document.querySelector('.register-ctn');

getBackButton.addEventListener('click', () => {
    registerCtn.style.display = 'none';
});

function getObjPlayerByCompleteName(nameComplete) { // Matchea el objeto segun el nombre completo.
    let playerObjArr = playerArray.filter(player => {
        return player._completeName == nameComplete;
    })
    if (playerObjArr.length == 0) {
        return false;
    } else {
        let playerObj = playerObjArr.pop();
        return playerObj;
    }
}
function getObjPlayerByEmail(email) { //Matchea el objeto segun el email.
    let playerObjArr = playerArray.filter(player => {
        return player._email == email;
    })
    if (playerObjArr.length == 0) {
        return false;
    } else {
        let playerObj = playerObjArr.pop();
        return playerObj;
    }
}
function checkEmail(email) { // Es un RegEx para que el email sea valido.
    return /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(email);
}

function errorClass(input, message) { // Para darle el estilo de ERROR al input.
    const formInput = input.parentElement; // class '.form-input';
    const small = formInput.querySelector('small');
    small.innerText = message;
    formInput.className = 'form-input error';
}
function successClass(input) { // Para darle el estilo de CORRECTO al input.
    const formInput = input.parentElement;
    formInput.className = 'form-input success';
}

function checkInputs() {
    const userNameValue = namee.value; // IMPORTANTE !!! Quizás es necesario sacar el trim() para que NO altere los nombres de los jugadores (se complica cuando hay un nombre/apellido con más de 2 palabras)
    const surnameValue = surname.value;
    const completeNameValue = surnameValue + ' ' + userNameValue;
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const checkPasswordValue = checkPassword.value.trim();

    let num = 0; // Un contador para tener un valor que marque que TODOS los inputs son correctos.
    if (userNameValue === '') {
        errorClass(namee, 'No puede estar vacío');
    } else {    
        successClass(namee);
        num++;
    }
    if (surnameValue === '') {
        errorClass(surname, 'No puede estar vacío');
    } else {
        successClass(surname);
        num++;
    }
    if (getObjPlayerByCompleteName(completeNameValue)) { // Para que NO registre un jugador YA existente por su nombre completo.
        errorClass(namee, 'Jugador ya existente');
        errorClass(surname, 'Jugador ya existente');
    } else {
        num++;
    }
    if (emailValue === '') {
        errorClass(email, 'No puede estar vacío');
    } else if (!checkEmail(emailValue)) {
        errorClass(email, 'Email no válido');
    } else if (getObjPlayerByEmail(emailValue)) {
        errorClass(email, 'Email ya usado')
    } else {
        successClass(email);
        num++;
    }
    if (passwordValue === '') {
        errorClass(password, 'No puede estar vacío');
    } else {
        successClass(password);
        num++;
    }
    if (checkPasswordValue === '') {
        errorClass(checkPassword, 'No puede estar vacío');
    } else if (checkPasswordValue !== passwordValue) {
        errorClass(checkPassword, 'Contraseña diferente')
    } else {
        successClass(checkPassword);
        num++;
    }
    if (num === 6) {
        alert('Todos los datos correctos');
        playerArray.push(new Jugador(userNameValue, surnameValue, emailValue, passwordValue)); // Agrega un nuevo jugador con los datos indicados !!!!.
        sessionStorage.setItem('Admin', false);
        sessionStorage.setItem('userLogin', completeNameValue);
        console.log(playerArray.map(player => player._completeName));
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    checkInputs();
    // window.location.href = '/Home y Ranking/home.html';
});