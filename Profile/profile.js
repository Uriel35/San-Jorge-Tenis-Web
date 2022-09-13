import { playerArray } from '/data.js';

let playerStorageName = sessionStorage.getItem('userLogin');
let playerObj = getObjPlayer(playerStorageName);

let nameInput = document.querySelector('.name-ctn h1');
nameInput.innerText = playerObj._completeName;

document.querySelector('.games').innerHTML += `<strong>${playerObj._games}</strong>`;
document.querySelector('.wins').innerHTML += `<strong>${playerObj._win}</strong>`;
document.querySelector('.loses').innerHTML += `<strong>${playerObj._loses}</strong>`;
document.querySelector('.email').innerHTML += `<strong>${playerObj._email}</strong>`;


function getObjPlayer(playerName) {
    let playerObj = playerArray.filter(player => {
        return player._completeName == playerName;
    })
    .pop();
    console.log(playerObj);
    return playerObj;
};