
let openLoginButton = document.querySelector('.open-login');
let openRegisterButton = document.querySelector('.open-register');
let loginRegisterCtn = document.querySelector('.login-register-section');

let guestButton = document.querySelector('.guest-login');

let loginCtn = document.querySelector('.login-ctn');
let loginBox = document.querySelector('.login-box');
let registerCtn = document.querySelector('.register-ctn');
let registerBox = document.querySelector('.register-box');

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


guestButton.addEventListener('click', () => {
    sessionStorage.setItem('userLogin', 'guest');
    sessionStorage.setItem('Admin', false);
    window.location.href = '../Home y Ranking/home.html';
})