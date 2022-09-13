import { playerArray } from "../data.js";

let playerStorage = sessionStorage.getItem('userLogin');
let adminStorage = sessionStorage.getItem('Admin');
console.log(playerStorage);
console.log(adminStorage);
if(playerStorage == null || adminStorage == 'false') {
    setTimeout(() => {
        window.location.href = '/Login y Register/LoginRegister.html'
    }, 1000)
}

let matchForm = document.getElementById('match-form');

let winInput = document.getElementById('win-player-search');
const winListContainer = document.getElementById('win-box-list');
winListContainer.setAttribute('style', 'display: none');

let loseInput = document.getElementById('lose-player-search');
const loseListContainer = document.getElementById('lose-box-list');
loseListContainer.setAttribute('style', 'display: none');

/* Calculator */
let winSmall = document.querySelector('.win-points');
let loseSmall = document.querySelector('.lose-points');

function getPointCalc() {
    if (typeof(getObjPlayer(winInput.value)) == 'object' && typeof(getObjPlayer(loseInput.value)) == 'object') {
        let winPlayer = getObjPlayer(winInput.value);
        let losePlayer = getObjPlayer(loseInput.value);
        let arrayPoints = rankCalc(losePlayer, winPlayer);
        loseSmall.innerText = `${arrayPoints[0]} (${losePlayer._ranking + arrayPoints[0]})`;
        winSmall.innerText = `+${arrayPoints[1]} (${winPlayer._ranking + arrayPoints[1]})`;
    }
}

/* Autocomplete list */
function searchArray(playerInput, listContainer, loseOrWin) {
    playerInput.addEventListener('input', (e) => {
        let playerNameArray = [];
        listContainer.setAttribute('style', 'display: none');
        winSmall.setAttribute('style', 'display: none');
        loseSmall.setAttribute('style', 'display: none');
        if (e.target.value) {
            playerNameArray = playerArray
            .map(player => player._completeName)
            .filter(player => player.toLowerCase().includes(e.target.value.toLowerCase()))
            .map(player => `<li class='${loseOrWin}-autocomplete-li autocomplete-li' tabindex='0'>${player}</li>`);
            
            listContainer.setAttribute('style', 'display: block');
        }
        let htmlContent = !playerNameArray.length ? '' : playerNameArray.join('');
        listContainer.innerHTML = htmlContent;

        let list = document.querySelectorAll(`.${loseOrWin}-autocomplete-li`);
        list.forEach(item => {
            item.addEventListener('click', () => {
                playerInput.value = item.innerText;
                listContainer.setAttribute('style', 'display: none');
                winSmall.setAttribute('style', 'display: block');
                loseSmall.setAttribute('style', 'display: block');
                getPointCalc(); // Para previsualizar el cambio de puntos.
            })
        })
    })
}
searchArray(winInput, winListContainer, 'win');
searchArray(loseInput, loseListContainer, 'lose');



/* Submit */

let alertBoxCtn = document.querySelector('.match-alert-ctn');
let alertBox = document.querySelector('.match-alert-box');
let alertBoxText = document.querySelector('.match-alert__text');
let confirmButton = document.querySelector('.match-alert__button-confirm');
let cancelButton = document.querySelector('.match-alert__button-cancel')

alertBoxCtn.addEventListener('click', function(e) { // Para cerrar el alertBoxCtn cuando hace click fuera de la caja.
    e.stopPropagation();
    let isClickInsideElement = alertBox.contains(e.target);
    if (!isClickInsideElement) {
        closeAlert();
    }
});
cancelButton.addEventListener('click', () => {
    closeAlert()
});

function closeAlert() {
    alertBoxCtn.style.display = 'none';
}
function openAlert(message, boolean) {
    alertBoxCtn.style.display = 'flex';
    alertBoxText.innerText = message;

    if(boolean == false) {
        confirmButton.style.display = 'none';
        cancelButton.innerText = 'Cerrar'
    } else {
        confirmButton.style.display = 'block';
        cancelButton.innerText = 'Cancelar';
        
    }
}

function getObjPlayer(playerInput) {
    let playerObj = playerArray.filter(player => {
        return player._completeName == playerInput;
    })
    .pop();
    if(playerObj == undefined) {
        return false;
    } else {
        return playerObj;
    }
}
function rankCalc (loseP, winP) {
    let winRank = winP._ranking;
    let loseRank = loseP._ranking;
    let kFactorWin = 32;
    if (winRank > 2100 && winRank <= 2400) {
        kFactorWin = 24;
    } else if (winRank > 2400) {
        kFactorWin = 16
    };
    let kFactorLose = 32;
    if (loseRank> 2100 && loseRank <= 2400) {
        kFactorLose = 24;
    } else if (loseRank > 2400) {
        kFactorLose = 16
    }

    let expectedLose = 1/(1 + Math.pow(10, (winRank - loseRank) / 400));
    let losePoints = Math.round((0 - expectedLose) * kFactorLose);
    let expectedWin = 1/(1 + Math.pow(10, (loseRank - winRank) / 400));
    let winPoints = Math.round((1 - expectedWin) * kFactorWin);
    return [losePoints, winPoints]
}

matchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (loseInput.value == '' || winInput.value == '') {
        openAlert('Campo vacío', false)
    } else if (loseInput.value == winInput.value) {
        openAlert('No puede seleccionar al mismo jugador', false)
    } else if(!getObjPlayer(winInput.value) || !getObjPlayer(loseInput.value)) {
        openAlert('Jugador NO existente', false)
    } else {
        openAlert('¿Estás seguro?', true)
    }
})

confirmButton.addEventListener('click', () => {
    let winPlayer = getObjPlayer(winInput.value);
    let losePlayer = getObjPlayer(loseInput.value);
    let arrayPoints = rankCalc(losePlayer, winPlayer);
    winPlayer._ranking += arrayPoints[1];
    winPlayer._streak++;
    winPlayer._win++;
    losePlayer._ranking += arrayPoints[0];
    losePlayer._streak = 0;
    losePlayer._loses++;
    console.log(winPlayer._ranking, winPlayer._completeName);
    console.log(losePlayer._ranking, losePlayer._completeName);
    // window.location.reload()
    // console.log(playerArray.map(player => `${player._completeName}: ${player._games}`))
    console.log(playerArray);
    closeAlert();
})
console.log(playerArray)
