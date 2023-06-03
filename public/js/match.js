document.addEventListener('DOMContentLoaded', async(e) => {

    // Sacar datos del usuario para saber su rol y determinar si puede acceder o no a la pagina
    let decodeRefresh = await requestFx('http://localhost:3000/decodeRefresh', 'GET')
    if(decodeRefresh.isGuest == true || decodeRefresh.decoded.roles[0] !== 2000) {
        window.location.href = `http://localhost:3000/home`;
    }
    // Datos de los Users y doubles
    const dataPlayerArray = await requestFx('http://localhost:3000/api/users', 'GET');
    // En algun momento, ponerlo como 'const'
    let PLAYER_ARRAY = dataPlayerArray.users;
    // console.log(PLAYER_ARRAY);
    const dataDoublePlayerArray = await requestFx('http://localhost:3000/api/doubles', 'GET');
    const DOUBLE_PLAYER_ARRAY = dataDoublePlayerArray.data;
    let playerArray; // Es el dinamico

    // Para hacer un "recorrido" con los requisitos (accion => categoria => formulario)
    const addMatchButton = document.getElementById('create-match-btn');
    const addDoublePartnersButton = document.getElementById('create-doubles-btn');
    const createBtns = document.querySelectorAll('.create-btns')
    const matchFormCtn = document.getElementById('match-form-ctn');
    const partnerFormCtn = document.getElementById('partner-form-ctn')
    const categoryOptionsCtn = document.getElementById('category-options-ctn')
    const categoryOptionsInputs = document.getElementById('category-options-inputs');
    const submitCategoryBtn = document.getElementById('submit-category');

    createBtns.forEach(item => {
        item.addEventListener('click', (e) => {
            createBtns.forEach(item2 => item2.classList.remove('active-button'));
            e.target.classList.add('active-button');
            categoryOptionsCtn.classList.add('active-flex');
            displayFormCtns(null);
            if(e.target == addMatchButton) {
                categoryOptionsInputs.setAttribute('list', 'match-categories');
            } else if(e.target == addDoublePartnersButton) {
                categoryOptionsInputs.setAttribute('list', 'create-double')
            }
        })
    })
    // Una vez que guardamos la categoria deseada, se debe abrir el formulario correcto con el array de players correcto
    
    let categorieValue;
    submitCategoryBtn.addEventListener('click', (e) => {
        categorieValue = categoryOptionsInputs.value;
        const categorieListValue = categoryOptionsInputs.getAttribute('list');

        if(categorieValue == 'Singles masculino' || categorieValue == 'Masculino') playerArray = PLAYER_ARRAY.filter(item => item.sex == 'M')
        else if(categorieValue == 'Singles femenino' || categorieValue == 'Femenino') playerArray = PLAYER_ARRAY.filter(item => item.sex == 'F')
        else if(categorieValue == 'Dobles masculino') playerArray = DOUBLE_PLAYER_ARRAY.filter(item => item.players[0].sex == 'M')
        else if(categorieValue == 'Dobles femenino') playerArray = DOUBLE_PLAYER_ARRAY.filter(item => item.players[0].sex == 'F')
        else return console.log('Categoria NO definida');
        
        categorieListValue == 'match-categories' ? displayFormCtns('match')
        : categorieListValue == 'create-double' ? displayFormCtns('partners')
        : '';
    })
    
    const submitPartner = document.getElementById('submit-partner')
    const partnerOneInput = document.getElementById('partner-one-input')
    const partnerTwoInput = document.getElementById('partner-two-input')
    
    submitPartner.addEventListener('click', async (e) => {
        e.preventDefault();
        const partner1 = getObjPlayer(partnerOneInput.value);
        const partner2 = getObjPlayer(partnerTwoInput.value)
        const body = {
            player1Id: partner1._id,
            player2Id: partner2._id
        }
        const data = await requestFx('http://localhost:3000/api/doubles', 'POST', body, { 'Content-Type': 'application/json' });
        console.log(data);
    })
    
    function displayFormCtns (value) {
        if(value == null) {
            matchFormCtn.classList.remove('active-flex');
            partnerFormCtn.classList.remove('active-flex');
            return;
        }
        if(value == 'match') {
            matchFormCtn.classList.add('active-flex');
            partnerFormCtn.classList.remove('active-flex');
        } else if(value == 'partners') {
            partnerFormCtn.classList.add('active-flex');
            matchFormCtn.classList.remove('active-flex')
        }
    }
    
    
    let matchForm = document.getElementById('match-form');
    let winInput = document.getElementById('win-player-search');
    const winListContainer = document.getElementById('win-box-list');
    winListContainer.setAttribute('style', 'display: none');
    
    let loseInput = document.getElementById('lose-player-search');
    const loseListContainer = document.getElementById('lose-box-list');
    loseListContainer.setAttribute('style', 'display: none');
    
    /* Small points */
    let winSmall = document.querySelector('.win-points');
    let loseSmall = document.querySelector('.lose-points');
    
    function smallDisplay(display, winPlayer, losePlayer) {
        if(display == 'none') {
            winSmall.setAttribute('style', 'display: none');
            loseSmall.setAttribute('style', 'display: none');
        } else if(display == 'block') {
            let arrayPoints = rankCalc(winPlayer, losePlayer);
            winSmall.setAttribute('style', 'display: block');
            loseSmall.setAttribute('style', 'display: block');
            loseSmall.innerText = `${arrayPoints[1]} (${losePlayer.ranking.ranking + arrayPoints[1]})`;
            winSmall.innerText = `+${arrayPoints[0]} (${winPlayer.ranking.ranking + arrayPoints[0]})`;
        }
    }
    /* Autocomplete list */
    function searchArray(playerInput, listContainer, loseOrWinLi, match = false) {
        playerInput.addEventListener('input', (e) => {
            let playerNameArray = [];
            listContainer.setAttribute('style', 'display: none');
            smallDisplay('none');
            if (e.target.value) {
                let tabIndex = playerInput.getAttribute('tabindex');
                playerNameArray = playerArray
                .map(player => player.name)
                .filter(player => player.toLowerCase().includes(e.target.value.toLowerCase()))
                .map(player => {
                    tabIndex++;
                    let regEx = new RegExp(e.target.value, 'gi');
                    let result = player.match(regEx);
                    if(result !== null) {
                        player = player.replace(regEx, `<b>${result[0]}</b>`)
                    }
                    return `<li class='${loseOrWinLi}-autocomplete-li autocomplete-li' tabindex='${tabIndex}'>${player}</li>`
                });
                listContainer.setAttribute('style', `display: flex`);
            }
            let htmlContent = !playerNameArray.length ? '' : playerNameArray.join('');
            listContainer.innerHTML = htmlContent;

            let list = document.querySelectorAll(`.${loseOrWinLi}-autocomplete-li`);
            list.forEach(item => {
                item.addEventListener('click', () => {
                    playerInput.value = item.innerText;
                    listContainer.setAttribute('style', 'display: none');
                    if(!match) return; // Si es verdadero, ejecutara para el small del match 
                    if (typeof(getObjPlayer(winInput.value)) == 'object' && typeof(getObjPlayer(loseInput.value)) == 'object') {
                        smallDisplay('block', getObjPlayer(winInput.value), getObjPlayer(loseInput.value));
                    }
                })
                item.addEventListener('keyup', (e) => {
                    if(e.keyCode == 13) {
                        playerInput.value = item.innerText;
                        listContainer.setAttribute('style', 'display: none');
                        if(!match) return; // Si es verdadero, ejecutara para el small del match 
                        if (typeof(getObjPlayer(winInput.value)) == 'object' && typeof(getObjPlayer(loseInput.value)) == 'object') {
                            smallDisplay('block', getObjPlayer(winInput.value), getObjPlayer(loseInput.value));
                        }
                    }
                })
            })
        })
    }
    searchArray(winInput, winListContainer, 'win', true);
    searchArray(loseInput, loseListContainer, 'lose', true);
    
    const partnerOneListContainer = document.getElementById('partner-one-ul');
    const partnerTwoListContainer = document.getElementById('partner-two-ul');
    partnerOneListContainer.setAttribute('style', 'display: none');
    partnerTwoListContainer.setAttribute('style', 'display: none');
    searchArray(partnerOneInput, partnerOneListContainer, 'partner-one', false)
    searchArray(partnerTwoInput, partnerTwoListContainer, 'partner-two', false)


    // /* Submit */
    
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
            cancelButton.innerText = 'Cerrar';
        } else {
            confirmButton.style.display = 'block';
            cancelButton.innerText = 'Cancelar';
        }
    }
    
    function getObjPlayer(playerInput) {
        let playerObj = playerArray.filter(player => {
            return player.name == playerInput;
        })
        .pop();
        if(playerObj == undefined) {
            return false;
        } else {
            return playerObj;
        }
    }
    
    function rankCalc(winP, loseP) {
        let winRank = winP.ranking.ranking;
        let loseRank = loseP.ranking.ranking;
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
        return [winPoints, losePoints];
    }

    // Control del Score
    const scoreButton = document.getElementById('score-button');
    const scoreModal = document.getElementById('score-modal-ctn');
    const scoreBox = document.getElementById('score-box');
    const closeScoreButton = document.getElementById('close-score-button')
    scoreButton.addEventListener('click', (e) => {
        scoreModal.classList.toggle('active-flex');
    })
    scoreModal.addEventListener('click', (e) => {
        e.stopPropagation();
        let isClickInsideElement = scoreBox.contains(e.target);
        if(!isClickInsideElement) scoreModal.classList.toggle('active-flex')
    })
    closeScoreButton.addEventListener('click', (e) => {
        e.stopPropagation();
        scoreModal.classList.toggle('active-flex')
    })

    const bestOfFiveRadio = document.getElementById('best-of-5');
    const bestOfThreeRadio = document.getElementById('best-of-3');
    const scoreInputs = document.querySelectorAll('.set-score-input');
    const resignInput = document.getElementById('resign-input');
    const bo3Inputs = document.querySelectorAll('.bo3-input');
    // const bo5Wall = document.querySelectorAll('.bo5-not-allow');
    // const bo5Inputs = document.querySelectorAll('.bo5-input');
    const bo5Ctn = document.querySelectorAll('.bo5-ctn')
    
    bestOfFiveRadio.addEventListener('click', (e) => {
        bo5Ctn.forEach(item => {
            item.classList.remove('unactive')
        })
    });
        
    bestOfThreeRadio.addEventListener('click', (e) => {
        bo5Ctn.forEach(item => {
            item.classList.add('unactive');
        })
    });
    
    
    matchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (loseInput.value == '' || winInput.value == '') {
            openAlert('Campo vacío', false)
        } else if (loseInput.value == winInput.value) {
            openAlert('No puedes seleccionar al mismo jugador', false)
        } else {
            openAlert('¿Estás seguro?', true)
        }
    })
    
    function checkScoreInputs() {
        let scoreArray = [];
        if(bestOfFiveRadio.checked == true) {
            scoreArray = [
                [scoreInputs[0].value, scoreInputs[5].value],
                [scoreInputs[1].value, scoreInputs[6].value],
                [scoreInputs[2].value, scoreInputs[7].value],
                [scoreInputs[3].value, scoreInputs[8].value],
                [scoreInputs[4].value, scoreInputs[9].value]
            ]
        } else if(bestOfThreeRadio.checked == true) {
            scoreArray = [
                [bo3Inputs[0].value, bo3Inputs[3].value],
                [bo3Inputs[1].value, bo3Inputs[4].value],
                [bo3Inputs[2].value, bo3Inputs[5].value],
            ];
        }
        return scoreArray;
    }
    
    confirmButton.addEventListener('click', async () => {
        let winPlayer = getObjPlayer(winInput.value);
        let losePlayer = getObjPlayer(loseInput.value);
        let arrayPoints = rankCalc(winPlayer, losePlayer); // [ winPoints, losePoints ]
        let scoreArray = checkScoreInputs();
        
        let doubleEndPoint = '';
        if(categorieValue.includes('Dobles')) {
            doubleEndPoint = '/doubles'
        };
        await updateMatches(winPlayer, losePlayer, arrayPoints, scoreArray, doubleEndPoint)

        let refreshInfo = await requestFx('http://localhost:3000/api/users', 'GET')
        
        // SACARLO EN ALGUN MOMENTO... Me actualiza los puntos sin tener que recargar la pagina.
        PLAYER_ARRAY = refreshInfo.users;
        playerArray = PLAYER_ARRAY;

        closeAlert();
        // window.location.reload()
    })

    
    
    const updateMatches = async (winPlayer, losePlayer, points, score, doubleEndPoint) => {
        const serveRadioInputs = document.querySelectorAll('.serve-radio-inputs');
        const whoServed = Array.apply(null, serveRadioInputs).find(item => item.checked == true).getAttribute('value');
        
        const body = {
            whoServed: whoServed,
            bestOf3: bestOfThreeRadio.checked,
            score: score,
            resign: resignInput.checked,
            winPlayer: {
                _id: winPlayer._id,
                matches: {
                    result: true,
                    rival: losePlayer.name,
                    resign: resignInput.checked,
                    points: points[0]
                },
                streak: winPlayer.streak,
                ranking: {
                    ranking: winPlayer.ranking.ranking + points[0],
                    history: {
                        points: points[0]
                    }
                }
            },
            losePlayer: {
                _id: losePlayer._id,
                matches: {
                    result: false,
                    rival: winPlayer.name,
                    resign: resignInput.checked,
                    points: points[1]
                },
                ranking: {
                    ranking: losePlayer.ranking.ranking + points[1],
                    history: {
                        points: points[1]
                    }
                }
            }
        };
        const data = await requestFx(`http://localhost:3000/api/upMatch${doubleEndPoint}`, 'PATCH', body, { "Content-type": "application/json" })
        // console.log(data);
        if(data.ok == false) {
            return data.json().then(json => {
                console.log(json)
                // if(json.invalidAccTok == true) return window.location.href = 'http://localhost:3000/expired'
            })
        }
        console.log(data);
    }
    
    // Logout
    const logoutButton = document.getElementById('li__logout');
    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const data = await requestFx(`http://localhost:3000/logout`, 'GET');
        if(data.ok == false) {
            return data.json().then(json => console.log(json))
        }
        window.location.href = 'http://localhost:3000'
    })
    
    
    async function requestFx (url, method, body = undefined, headers = undefined) {
        const loadModal = document.querySelector('.loading-modal');
        function toggleLoadModal() {
            loadModal.classList.toggle('flex-active');
        }
        toggleLoadModal()
        let result;
        let accTok = sessionStorage.getItem('accessToken');
        await fetch(url, {
            credentials: 'include',
            method: method,
            headers: {...headers, 'Authorization': `Bearer ${ accTok }`},
            body: JSON.stringify(body)
        }).then(response => {
            toggleLoadModal()
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
