
const form = document.getElementById('register-form');
const namee = document.getElementById('name');
const surname = document.getElementById('surname');
const email = document.getElementById('email');
const password = document.getElementById('password');
const checkPassword = document.getElementById('check-password');
const modal = document.getElementById('modal');
const getBackButton = document.querySelector('.getback-register');
const registerCtn = document.querySelector('.register-ctn');
const sexInputs = document.querySelectorAll('.sex-category')

getBackButton.addEventListener('click', () => {
    registerCtn.style.display = 'none';
});

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

    let sexValue;
    try {
        sexValue = Array.apply(null, sexInputs).find(radio => radio.checked === true).value;
    } catch(err) {
        sexValue = null;
        // console.log(err)
    }

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
    if(sexValue == 'M' || sexValue == 'F') {
        num++
        successClass(document.querySelector('.sex-category-ctn'))
    } else {
        errorClass(document.querySelector('.sex-category-ctn'), 'Seleccionar un campo')
    }
    if(!checkEmail(emailValue)) {
        errorClass(email, 'Email no válido')
    } else {
        successClass(email);
        num++
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
        fetch('http://localhost:3000/register', {
            method: 'POST',
            credentials: 'include',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                name: completeNameValue,
                email: emailValue,
                pwd: passwordValue,
                roles: {},
                sex: sexValue,
            })
        })
        .then(response => {
            if(response.ok) {
                if(response.status === 201) {
                    registerCtn.style.display = 'none';
                    modal.classList.toggle('modal-active-flex');
                }
                return response.json()
            }
            return Promise.reject(response)
        })
        .then(data => {
            console.log(data)
        })
        .catch((response) => {
            response.json().then((json) => {
                console.log(json);
            })
        })
    } else {
        console.log('Formulario incompleto o hubo algún error, inténtelo nuevamente')
    }
}
// Confirmacion del modal, recargar la pagina
document.getElementById('register-confirm').addEventListener('click', (e) => {
    window.location.reload()
})

form.addEventListener('submit', (e) => {
    e.preventDefault();
    checkInputs();
});