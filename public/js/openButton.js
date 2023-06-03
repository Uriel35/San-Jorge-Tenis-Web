
const openLoginButton = document.querySelector('.open-login');
const openRegisterButton = document.querySelector('.open-register');
const loginRegisterCtn = document.querySelector('.login-register-section');

const guestButton = document.querySelector('.guest-login');

const loginCtn = document.querySelector('.login-ctn');
const loginBox = document.querySelector('.login-box');
const registerCtn = document.querySelector('.register-ctn');
const registerBox = document.querySelector('.register-box');

function eventButton(button, ctn, box) {
    button.addEventListener('click', () => {
        ctn.style.display = 'flex';
    });
    let ignoreClick = box;
    ctn.addEventListener('click', (e) => {
        e.stopPropagation();
        // console.log('click')
        let isClickInsideElement = ignoreClick.contains(e.target);
        if(!isClickInsideElement) {
            ctn.style.display = 'none';
        }
    })
};
eventButton(openLoginButton, loginCtn, loginBox);
eventButton(openRegisterButton, registerCtn, registerBox);
