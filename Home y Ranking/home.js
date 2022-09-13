import { playerArray } from '/data.js';

let playerStorage = sessionStorage.getItem('userLogin');
if(playerStorage == null) {
    setTimeout(() => {
        window.location.href = '/Login y Register/LoginRegister.html';
        console.log('Hola');
    }, 10)
}

let nroPlayersElement = document.getElementById('nro-jugadores');
let nroGamesElement = document.getElementById('nro-partidos');

let totalPlayers = playerArray.length;
nroPlayersElement.innerText = `${totalPlayers}`;

let totalGames = playerArray.reduce((sum, player) => sum + player._games, 0);
nroGamesElement.innerText = `${totalGames}`;


// fetch('http://localhost:3000/api')
// .then(response => response.json())
// .then(data => {
//     console.log(data)
// })
// .catch(e => console.log(e))

let asyncReq = async () => {
    const response = await fetch('http://localhost:3000/api');
    const data = await response.json();
    console.log(data)
}
asyncReq();

// fetch('http://localhost:3000/api/1')
// .then(response => response.json())
// .then(data => {
//     console.log(data)
// })
// .catch(e => console.log(e))

fetch('http://localhost:3000/api/1', {
    method: 'DELETE',
    // body: JSON.stringify({'nombre': 'Uriel', 'edad': 24}), // Lo que queremos enviar.
    headers: {'Content-type' : 'Application/json'}
})
.then(response => response.json())
.then(data => {
    console.log(data)
})