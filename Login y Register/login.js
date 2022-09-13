import {playerArray} from "/data.js";

let loginForm = document.getElementById('login-form-ctn');
let emailInput = document.getElementById('email-login');
let passwordInput = document.getElementById('password-login');
let submitButton = document.getElementById('login-button');
let getBackButton = document.querySelector('.getback-login');
let loginCtn = document.querySelector('.login-ctn');

getBackButton.addEventListener('click', () => {
    loginCtn.style.display = 'none';
});


function errorClass(input, message) { //
    const formInput = input.parentElement; // class '.form-input';
    const small = formInput.querySelector('small');
    small.innerText = message;
    formInput.className = 'form-input error';
}
function successClass(input) {
    const formInput = input.parentElement;
    formInput.className = 'form-input success';
}
function checkEmail(email) {
    return /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(email);
}
function getObjPlayer(emailPlayer) {
    let playerObjArr = playerArray.filter(player => {
        return player._email == emailPlayer.trim();
    })
    if (playerObjArr.length == 0) {
        return false;
    } else {
        let playerObj = playerObjArr.pop();
        console.log(playerObj);
        return playerObj;
    }
}
function checkPassword(passwordValue, playerObj) {
    if (playerObj._password !== passwordValue) {
        errorClass(passwordInput, 'Contraseña incorrecta');
        return false;
    } else {
        return true
    }
}
function checkLoginInputs() {
    const emailLoginValue = emailInput.value;
    const passwordLoginValue = passwordInput.value;
    let admin = {
        email: 'admin@hotmail.com',
        password: '123'
    };

    if (emailLoginValue === '') {
        errorClass(emailInput, 'No puede estar vacío');
    } else if (!checkEmail(emailLoginValue)) {
        errorClass(emailInput, 'Email no válido');
    } else if(emailLoginValue == admin.email) { // Para logear el administrador
        if (passwordLoginValue == admin.password) {
            alert('Admin logeado');
            sessionStorage.setItem('Admin', true);
            sessionStorage.setItem('userLogin', 'Admin');
        } else {
            errorClass(passwordInput, 'Contraseña inválida')
        }
    } else if (getObjPlayer(emailLoginValue) == false) { // Corroborar si el email es válido.
        errorClass(emailInput, 'Email no existente');
    } else {
        successClass(emailInput);
        if (passwordLoginValue === '') {
            errorClass(passwordInput, 'No puede estar vacío')
        } else if (checkPassword(passwordLoginValue, getObjPlayer(emailLoginValue))) {
            successClass(passwordInput);
            alert('Todos los datos correctos');
            sessionStorage.setItem('Admin', false);
            sessionStorage.setItem('userLogin', getObjPlayer(emailLoginValue)._completeName);
        }
    }
}

sessionStorage.removeItem('userLogin');
sessionStorage.removeItem('Admin'); // Para ponerlos como Default cada vez que se inicia a la pagina de registro.

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    checkLoginInputs();
    window.location.href = '/Home y Ranking/home.html';
});
