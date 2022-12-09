
document.addEventListener('DOMContentLoaded', async(e) => {
    const loginForm = document.getElementById('login-form-ctn');
    const emailInput = document.getElementById('email-login');
    const passwordInput = document.getElementById('password-login');
    const submitButton = document.getElementById('login-button');
    const getBackButton = document.querySelector('.getback-login');
    const loginCtn = document.querySelector('.login-ctn');
    
    sessionStorage.removeItem('accessToken');
    
    getBackButton.addEventListener('click', () => {
        loginCtn.style.display = 'none';
    });
    
    function errorClass(input, message) { //
        const formInput = input.parentElement; // class '.login-form-input';
        const small = formInput.querySelector('small');
        small.innerText = message;
        formInput.className = 'login-form-input error';
    }
    
    function successClass(input) {
        const formInput = input.parentElement;
        formInput.className = 'login-form-input success';
    }
    function checkEmail(email) {
        return /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(email);
    }
    function cleanInputs() {
        const emailFormInput = emailInput.parentElement;
        const pwdFormInput = passwordInput.parentElement;
        emailFormInput.querySelector('small').innerText = ''
        pwdFormInput.querySelector('small').innerText = ''
        emailFormInput.className = 'login-form-input';
        pwdFormInput.className = 'login-form-input';
    }
    
    async function checkLoginInputs() {
        const emailLoginValue = emailInput.value;
        const passwordLoginValue = passwordInput.value;
        cleanInputs();
    
        fetch('http://localhost:3000/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                "email": emailLoginValue,
                "pwd": passwordLoginValue
            })
        })
        .then(response => {
            if(response.ok) {
                return response.json();
            }
            return Promise.reject(response)
        })
        .then(data => {
            console.log(data);
            sessionStorage.setItem('accessToken', data.accessToken);
            window.location.href = 'http://localhost:3000/home';
        })
        .catch((response) => { // Catch para el fetch()
            response.json().then((json) => {
                console.log(json);
                if(json.incomplete) {
                    if (emailLoginValue === '') {
                        return errorClass(emailInput, 'No puede estar vacío');
                    } else {
                        successClass(emailInput)
                    }
                
                    if (passwordLoginValue === '') {
                        return errorClass(passwordInput, 'No puede estar vacío')
                    } else {
                        successClass(passwordInput)
                    }
                }
                if(json.notFound) {
                    if(checkEmail(emailLoginValue)) {
                        return errorClass(emailInput, 'Email no válido')
                    }
                    return errorClass(emailInput, 'Email no registrado')
                }
                if(json.pwdUnvalid) {
                    return errorClass(passwordInput, 'Contraseña incorrecta')
                }
            })
        })
    }
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        checkLoginInputs();
    });
    
    const guestLoginBtn = document.getElementById('guest-login-button')
    guestLoginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        let guestLoggedRequest = await requestFx('http://localhost:3000/guestLogin', 'GET')
        if(guestLoggedRequest.ok == true) {
            sessionStorage.setItem('accessToken', guestLoggedRequest.accessToken)
            window.location.href = 'http://localhost:3000/home';
        }
        
    })
    

    async function requestFx (url, method, body = undefined, headers = undefined) {
        const loadModal = document.querySelector('.loading-modal'); // Loading modal mientras cargan las request al server
        function toggleLoadModal() {
            loadModal.classList.toggle('flex-active');
        }
        toggleLoadModal()
        let result;
        let accTok = sessionStorage.getItem('accessToken');
        await fetch(url, {
            credentials: 'include',
            method: method,
            // headers: {...headers, 'Authorization': `Bearer ${ accTok }`},
            headers: {...headers},
            body: JSON.stringify(body)
        }).then(response => {
            // toggleLoadModal(); // Esta en home.js
            if(response.ok) return response.json();
            return Promise.reject(response)
        }).then(data => {
            result = data;
            result.ok = true;
        }).catch(async (response) => {
            result = response;
        });
        if(result.ok == false) {
            // Quizas hay que sacar el return para poder tener el status del request.
            await result.json().then(json => {
                if(json.invalidAccTok == true) return window.location.href = 'http://localhost:3000/expired';
                // if(json.status == 500); // Redireccionar a servidor caido.
                // return json;
                result = json;
            })
        }
        return result;
    }
})
