document.addEventListener('DOMContentLoaded', async (e) => {
    const rankingList = document.querySelector('.grid-ctn');

    // Delete buttons
    const alertBoxCtn = document.querySelector('.ranking-alert-ctn');
    const alertBox = document.querySelector('.ranking-alert-box');
    const alertText = document.querySelector('.ranking-alert__text');
    const cancelAlert = document.querySelector('.ranking-alert__button-cancel');
    const confirmAlert = document.querySelector('.ranking-alert__button-confirm');

    // Radios buttons (single masculino, femenino...)
    const singleMaleRadio = document.getElementById('single-male');
    const singleFemaleRadio = document.getElementById('single-female')
    const doubleMaleRadio = document.getElementById('double-male')
    const doubleFemaleRadio = document.getElementById('double-female');
    const allRadio = document.querySelectorAll('.radio');

    // Sort buttons
    const nameButton = document.getElementById('name-button');
    const matchButton = document.getElementById('match-button')
    const winMatchButton = document.getElementById('win-match-button')
    const loseMatchButton = document.getElementById('lose-match-button')
    const rankButton = document.getElementById('rank-button')
    
    // Load modal
    const loadModal = document.querySelector('.loading-modal');
    function toggleLoadModal() {
        loadModal.classList.toggle('flex-active');
    }
    // Get all users
    let usersArray;
    let data = await requestFx('http://localhost:3000/api/users', 'GET');
    usersArray = data.users

    let doublesData = await requestFx('http://localhost:3000/api/doubles', 'GET');
    let doublesArray = doublesData.data;
    // console.log(doublesArray);

    let playerArrayModified = usersArray.map(player => {
        return {
            ...player,
            totalMatches: player.matches.length,
            winMatches: player.matches.filter(match => match.result == true).length,
            loseMatches: player.matches.filter(match => match.result == false).length,
            modifiedRank: player.ranking.ranking
        }
    })
    let doublePlayerArrayModified = doublesArray.map(couple => {
        return {
            ...couple,
            totalMatches: couple.matches.length,
            winMatches: couple.matches.filter(match => match.result == true).length,
            loseMatches: couple.matches.filter(match => match.result == false).length,
            modifiedRank: couple.ranking.ranking
        }
    })
    // console.log(doublePlayerArrayModified)
    
    let sortedUsersArray = sortArrayFx(playerArrayModified.filter(item => item.sex === 'M'), 'modifiedRank', false);
    createRankLoop(true, sortedUsersArray);
    handleDeleteButtons() // Darle funcionalidad a los delete Buttons...
    let doublesSortedArray;
    allRadio.forEach(item => {
        item.addEventListener('click', (e) => {
            allRadio.forEach(item => { item.classList.remove('active-radio') });
            e.target.classList.add('active-radio');
            if(e.target === singleMaleRadio) {
                sortedUsersArray = sortArrayFx(playerArrayModified.filter(item => item.sex === 'M'), 'modifiedRank', false) 
                createRankLoop(true, sortedUsersArray);
            } else if(e.target === singleFemaleRadio) {
                sortedUsersArray = sortArrayFx(playerArrayModified.filter(item => item.sex === 'F'), 'modifiedRank', false) 
                createRankLoop(true, sortedUsersArray);
            } else if(e.target === doubleMaleRadio) {
                sortedUsersArray = sortArrayFx(doublePlayerArrayModified.filter(item => item.sex === 'M', 'modifiedRank', false))
                createRankLoop(true, sortedUsersArray, 'doubles/')
            } else if(e.target === doubleFemaleRadio) {
                sortedUsersArray = sortArrayFx(doublePlayerArrayModified.filter(item => item.sex === 'F', 'modifiedRank', false))
                createRankLoop(true, sortedUsersArray, 'doubles/')
            }
            handleDeleteButtons() // Darle funcionalidad a los delete Button despues de crear el table
        })
    })
    
    function createRankLoop(direction, array, isDoubles = '') {
        // Primero eliminamos la lista previa (todos los grid item que NO tienen grid-reference)
        let nodeList = document.querySelectorAll('.grid-item');
        nodeList.forEach(item => {
            if(!item.classList.contains('grid-reference')) {
                item.remove()
            }
        });
        if(direction) {
            for (let i = 0; i < array.length; i++) {    
                loopMiddleware(i)
            }
        } else if(direction == false) {
            for (let i = array.length - 1; i > -1; i--) {            
                loopMiddleware(i)
            }
        }
        function loopMiddleware(i) {
            // Columna para posicion
            const positionContent = `<h3>${i+1}</h3>`
            createDiv('div', 'grid-item', 'position-item', positionContent)
            
            /*Columna para NOMBRE y APELLIDO */
            const nameContent = `
                <a href="http://localhost:3000/profile/${isDoubles + array[i]._id}" id="jugador${i}">${array[i].name}</a>
                <i class="fas fa-ban s2-delete-player" id="${array[i]._id}"></i>
            `
            createDiv('div', 'grid-item', 'name-item', nameContent)
    
            /* Columna para PARTIDOS JUGADOS */
            const gamesContent = `<h3>${array[i].matches.length}</h3>`
            createDiv('div', 'grid-item', 'games-item', gamesContent);
    
            /* Columna para PARTIDOS GANADOS y PERDIDOS, y el STREAK */
            let winsLosesContent = `
                <h3>${array[i].matches.filter(match => match.result === true).length + '/' + array[i].matches.filter(match => match.result === false).length}</h3>
            `;
            if (array[i].streak > 2) {
                winsLosesContent += `<small class="streak-count"><i class="fas fa-fire"></i>${array[i].streak}</small>`;
            }
            createDiv('div', 'grid-item', 'wins-loses-item', winsLosesContent);
            
            /* Columna para el RANKING */
            const rankContent = `<h3>${array[i].ranking.ranking}</h3>`
            createDiv('div', 'grid-item', 'ranking-item', rankContent);
        }
    }
    /* Constructor de cada fila del jugador*/
    function createDiv(element, clas, clas2, content) {
        let ctn = document.createElement(element);
        ctn.classList.add(clas);
        ctn.classList.add(clas2);
        ctn.innerHTML = content;
        rankingList.appendChild(ctn)
    }

    /* Ordena el 'usersArray' segun el 'prop' deseado de los jugadores SIN mutarlo */
    function sortArrayFx(arr, prop, direction) {
        let array = [...arr];
        // console.log(array);
        if(prop == 'name') {
            return array.sort(function(a, b) {
                return (a[prop] === b[prop]) ? 0
                : a[prop] > b[prop] ? 1
                : -1
            })
        } else {
            return array.sort(function(a, b) {
                return (a[prop] === b[prop]) ? 0
                : a[prop] < b[prop] ? 1
                : -1
            })
        }
    }

    const sortTabbleButtonFx = (button, prop) => {
        let count = {
            value: true,
            revert: () => {
                (count.value == true) ? count.value = false
                : count.value = true
            }
        }
        button.addEventListener('click', (e) => {
            count.revert();
            sortedUsersArray = sortArrayFx(sortedUsersArray, prop, count.value);
            createRankLoop(count.value, sortedUsersArray);
        })
    }
    sortTabbleButtonFx(nameButton, 'name')
    sortTabbleButtonFx(matchButton, 'totalMatches')
    sortTabbleButtonFx(winMatchButton, 'winMatches')
    sortTabbleButtonFx(loseMatchButton, 'loseMatches')
    sortTabbleButtonFx(rankButton, 'modifiedRank')

    // Delete buttons
    let selectedIdPlayer;
    async function handleDeleteButtons () {
        const deleteButtons = document.querySelectorAll('.s2-delete-player'); // Hay que definirlo despues de crearlos en el 'for'
        // Verificar si es Admin o no
        let decodeRefresh = await requestFx('http://localhost:3000/decodeRefresh', 'GET')
        if(!decodeRefresh.decoded.roles.find(role => role === 2000)) {
            // Hide delete buttons
            deleteButtons.forEach(element => {
                element.style.display = 'none';
            })
        } else {
            // Display block to the Delete Buttons
            deleteButtons.forEach(element => {
                element.style.display = 'block';
            })
        }

        // Event listener de los delete buttons
        deleteButtons.forEach(element => {
            element.addEventListener('click', (e) => {
                selectedIdPlayer = e.target;
                // console.log(selectedIdPlayer)
                openAlert(selectedIdPlayer);
            })
        })
    
    }
    function openAlert(targetId) {
        const nameSibling = targetId.previousElementSibling.innerText;
        alertBoxCtn.style.display = 'flex';
        alertText.innerHTML = `¿Deseas eliminar al jugador <strong>${nameSibling}</strong>?`;
    }
    cancelAlert.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAlert();
    });

    confirmAlert.addEventListener('click', async (e) => {
        e.stopPropagation();
        if(usersArray.find(user => user._id == selectedIdPlayer.id)){
            let deletePlayerData = await requestFx(`http://localhost:3000/api/users/${selectedIdPlayer.id}`, 'DELETE')
            // console.log(deletePlayerData);
        } else if(doublesArray.find(couple => couple._id == selectedIdPlayer.id)) {
            let deleteCoupleData = await requestFx(`http://localhost:3000/api/doubles/${selectedIdPlayer.id}`, 'DELETE')
            // console.log(deleteCoupleData)
        } else {
            console.log('NO se encontró el jugador ni en singles ni en dobles. ')
        }
        closeAlert();
        // window.location.reload()
    });

    function closeAlert() {
        alertBoxCtn.style.display = 'none';
        selectedIdPlayer = undefined;
    }
    // Para cerrar el alertBoxCtn cuando hace click fuera de la caja.
    alertBoxCtn.addEventListener('click', function(e) { 
        e.stopPropagation();
        let isClickInsideElement = alertBox.contains(e.target);
        if (!isClickInsideElement) {
            closeAlert();
        }
    });

    async function requestFx (url, method, body = undefined, headers = undefined) {
        toggleLoadModal();
        let result;
        let accTok = sessionStorage.getItem('accessToken');
        await fetch(url, {
            credentials: 'include',
            method: method,
            headers: {...headers, 'Authorization': `Bearer ${ accTok }`},
            body: JSON.stringify(body)
        }).then(response => {
            toggleLoadModal(); // Esta en home.js
            if(response.ok) return response.json();
            return Promise.reject(response)
        }).then(data => {
            result = data
        }).catch(async (response) => {
            result = response;
        });
        if(result.ok == false) {
            return await result.json().then(json => {
                if(json.invalidAccTok == true) return window.location.href = 'http://localhost:3000/expired'
                return json;
            })
        }
        return result;
    }
})
