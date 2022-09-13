import { playerArray } from '/data.js';

let playerStorage = sessionStorage.getItem('userLogin');
if(playerStorage == null) {
    setTimeout(() => {
        window.location.href = '/Login y Register/LoginRegister.html'
    }, 10)
}

const rankingList = document.querySelector('.grid-ctn');
const sectionCtn = document.getElementById('ranking-table-section');
const alertBoxCtn = document.querySelector('.ranking-alert-ctn');
const alertBox = document.querySelector('.ranking-alert-box');
const alertText = document.querySelector('.ranking-alert__text');
const cancelAlert = document.querySelector('.ranking-alert__button-cancel');
const confirmAlert = document.querySelector('.ranking-alert__button-confirm');

/* Ordena el 'playerArray' segun el ranking de los jugadores SIN mutarlo */
function arrayNoMutate(arr) { // Para NO cambiar el 'playerArray'
    let array = [].concat(arr);
    return array.sort(function(a, b) {
        if (b._ranking > a._ranking) {
            return 1;
        } else if (b._ranking < a._ranking) {
        return - 1;
        } else {
        return 0;
        } 
    })
}

function getObjPlayer(playerId) {
    let playerObj = playerArray.filter(player => {
        return player._completeName == playerId;
    })
    .pop();
    return playerObj;
};

/* Constructor de cada fila del jugador*/
function createDiv(element, clas, clas2) {
    let ctn = document.createElement(element);
    ctn.classList.add(clas);
    ctn.classList.add(clas2);
    return ctn;
}

const playerArrayOrdenado = arrayNoMutate(playerArray);
for (let i = 0; i < playerArrayOrdenado.length; i++) {
    // Columna para posicion
    const gridPositionItem = createDiv('div', 'grid-item', 'position-item')
    const positionContent = `
        <h3>${i+1}</h3>
    `
    gridPositionItem.innerHTML = positionContent;
    rankingList.appendChild(gridPositionItem);
    
    /*Columna para NOMBRE y APELLIDO */
    const gridNameItem = createDiv('div', 'grid-item', 'name-item')
    const nameContent = `
        <h3 id="jugador${i}">${playerArrayOrdenado[i]._completeName}</h3>
        <i class="fas fa-ban s2-delete-player" id="${playerArrayOrdenado[i]._completeName}"></i>
    `
    gridNameItem.innerHTML = nameContent;
    rankingList.appendChild(gridNameItem);


    /* Columna para PARTIDOS JUGADOS */
    const gridGamesItem = createDiv('div', 'grid-item', 'games-item');
    const gamesContent = `
        <h3>${playerArrayOrdenado[i]._games}</h3>
    `
    gridGamesItem.innerHTML = gamesContent;
    rankingList.appendChild(gridGamesItem);

    /* Columna para PARTIDOS GANADOS y PERDIDOS, y el STREAK */
    const gridWinsLosesItem = createDiv('div', 'grid-item', 'wins-loses-item');
    const winsLosesContent = `
        <h3>${playerArrayOrdenado[i]._win + '/' + playerArrayOrdenado[i]._loses}</h3>
    `;
    gridWinsLosesItem.innerHTML = winsLosesContent;
    if (playerArrayOrdenado[i]._streak > 1) {
        let streakContent = `<small class="streak-count"><i class="fas fa-fire"></i>${playerArrayOrdenado[i]._streak}</small>`;
        gridWinsLosesItem.innerHTML += streakContent;
    }
    rankingList.appendChild(gridWinsLosesItem);

    /* Columna para el RANKING */
    const gridRankItem = createDiv('div', 'grid-item', 'ranking-item');
    const rankContent = `
        <h3>${playerArrayOrdenado[i]._ranking}</h3>
    ` // El 'i' es un boton para eliminar al jugador.
    gridRankItem.innerHTML = rankContent;
    rankingList.appendChild(gridRankItem);
}



// Para que SOLO el admin pueda eliminar jugadores.
let deleteButtons = document.querySelectorAll('.s2-delete-player');
let adminLogin = sessionStorage.getItem('Admin');
if(adminLogin == 'false') {
    deleteButtons.forEach(element => {
        element.style.display = 'none';
    })
} else {
    deleteButtons.forEach(element => {
        element.style.display = 'block';
    })
}

// Seleccionar el player a eliminar.
let selectedIdPlayer;
deleteButtons.forEach(element => {
    element.addEventListener('click', (e) => {
        selectedIdPlayer = e.target.id;
        openAlert(selectedIdPlayer);
    })
});

cancelAlert.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedIdPlayer = undefined;
    closeAlert();
});

confirmAlert.addEventListener('click', (e) => {
    e.stopPropagation();
    let playerObjSelected = getObjPlayer(selectedIdPlayer);
    let indexPlayer = playerArray.indexOf(playerObjSelected);
    playerArray.splice(indexPlayer, 1);
    closeAlert();
    console.log(playerObjSelected._completeName);
    console.log(playerArray.map(player => player._completeName));
});


alertBoxCtn.addEventListener('click', function(e) { // Para cerrar el alertBoxCtn cuando hace click fuera de la caja.
    e.stopPropagation();
    let isClickInsideElement = alertBox.contains(e.target);
    if (!isClickInsideElement) {
        closeAlert();
        selectedIdPlayer = undefined;
    }
});
// window.location.reload()
// Para recargar la página

function openAlert(playerName) {
    alertBoxCtn.style.display = 'flex';
    alertText.innerHTML = `¿Deseas eliminar al jugador <strong>${playerName}</strong>?`;
}
function closeAlert() {
    alertBoxCtn.style.display = 'none';
}