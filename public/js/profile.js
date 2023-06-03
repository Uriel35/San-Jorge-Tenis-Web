
window.addEventListener('DOMContentLoaded', async (e) => {
    const DateTime = luxon.DateTime;
    const Interval = luxon.Interval;

    // Sacar datos del usuario para saber su rol y determinar el link de su perfil
    const urlId = window.location.pathname.split('/')[2];
    let decodeRefreshData = await requestFx('http://localhost:3000/decodeRefresh', 'GET', undefined, { "originUrl": `${ urlId }` });
    const currentUser = decodeRefreshData.decoded;
    if(decodeRefreshData.editor == true) {
        const openEditButton = document.getElementById('open-edit');
        openEditButton.classList.add('active');
    };

    // Edit form inputss
    let editName = document.getElementById('edit-name');
    let editAge = document.getElementById('edit-age')
    let editEmail = document.getElementById('edit-email')
    let editPwd = document.getElementById('edit-pwd')
    let editRanking = document.getElementById('edit-ranking')

    const editSexCtn = document.querySelector('.sex-category-inputs');
    // Manejo del form
    const sexNodeList = document.querySelectorAll('.sex-category-edit');
    const openEditButton = document.getElementById('open-edit');
    const formCtn = document.getElementById('edit-form-ctn')
    const formBox = document.getElementById('form-box')
    const cancelFormButton = document.getElementById('edit-form__cancel-button')
    const saveEditForm = document.getElementById('edit-form__button');
    const editModalCtn = document.getElementById('edit-modal-ctn');
    const editModalBox = document.getElementById('edit-modal-box')
    const cancelEditModal = document.getElementById('cancel-edit');
    const confirmEditModal = document.getElementById('confirm-edit');
    modalFx(openEditButton, formCtn, formBox, cancelFormButton);
    modalFx(saveEditForm, editModalCtn, editModalBox, cancelEditModal);

    confirmEditModal.addEventListener('click', async (e) => {
        e.preventDefault();    
        let sexValue;
        try {
            sexValue = Array.apply(null, sexNodeList).find(radio => radio.checked === true).value;
        } catch(err) {
            sexValue = null;
        }
        console.log(sexValue);
        let formData = {
            name: editName.value == '' ? undefined : editName.value,
            age: editAge.value == '' ? undefined : editAge.value,
            email: editEmail.value == '' ? undefined : !checkEmail(editEmail.value) ? undefined : editEmail.value,
            sex: sexValue == null ? undefined : sexValue,
            pwd: editPwd.value == '' ? undefined : editPwd.value,
            ranking: {
                ranking: editRanking.value == '' ? undefined : editRanking.value
            }
        };
        let patchReq = await requestFx(`http://localhost:3000/api/users/${urlId}`, 'PATCH', formData, { "Content-Type": "application/json" });
        console.log(patchReq);
        editModalCtn.classList.toggle('active-flex');
    })

    // Obtener datos del jugador
    let getUserReq = await requestFx(`http://localhost:3000/api/users/${urlId}`, 'GET');
    let profileUser = getUserReq.user;
    
    // SVG ranking data
    const data = profileUser.ranking.history;
    let initRank = 1000;
    data.map(item => {
        initRank += item.points;
        item.points = initRank;
        let [day, month, year] = item.date.split('-').map(item => parseInt(item));
        let date = DateTime.local(year, month, day)
        item.date = date;
    });
    const padding = {
        vertical: 45,
        horizontal: 70
    };
    const openChart = document.getElementById('open-chart-button')
    const svgCtn = document.getElementById('svg-ctn');
    const svgBox = document.getElementById('svg-box')
    modalFx(openChart, svgCtn, svgBox);
    
    openChart.addEventListener('click', (e) => {
        const w = document.body.offsetWidth * 0.9;
        const h = document.body.offsetHeight * 0.4;
        createRankingChart(h, w, data)
    })

    function createRankingChart(h, w, data) {
        let svg = d3.select('.svg-box')
        .append('svg')
        .attr('id', 'ranking-svg')
        .attr('width', w)
        .attr('height', h)
        .style('background-color', '#eee');
        
        d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('display', 'none')
        .append('p')
        .attr('id', 'tooltip-date')
        
        d3.select('#tooltip')
        .append('p')
        .attr('id', 'tooltip-points')
        
        let x = d3.scaleTime()
        .domain(d3.extent(data, (d) => d.date ))
        .range([padding.horizontal, w - padding.horizontal])
        
        let y = d3.scaleLinear()
        .domain([d3.min(data, (d) => d.points) - 50, d3.max(data, (d) => d.points) + 50])
        .range([h - padding.vertical, padding.vertical])
        
        const xAxis = d3.axisBottom()
        .scale(x)
        .ticks(5)
        .tickFormat(d3.timeFormat('%m-%y'));
        const yAxis = d3.axisLeft()
        .scale(y)
        .ticks(5)
        
        svg.append("g")
        .attr('id', 'x-axis')
        .attr("transform", "translate(0," + (h - padding.vertical) + ")")
        .attr("color", "black")
        .call(xAxis)
        
        svg.append("g")
        .attr('id', 'y-axis')
        .attr("transform", "translate(" + padding.horizontal + ", 0)")
        .attr("color", "black")
        .call(yAxis)
        
        document.oncontextmenu = function(){ return false }; // Deshabilita el click derecho
    
        svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr("d", d3.line()
            .x(function(d) {
                return x(d.date)
            })
            .y(function(d) {
                return y(d.points)
            })
            .curve(d3.curveMonotoneX) // Hace que sea mas "curvo" y no tan lineal
        )
        svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d.date))
        .attr('cy', (d) => y(d.points))
        .attr('data-points', (d) => d.points)
        .attr('data-date', (d) => d.date.toFormat('dd-MM-yy'))
        .on('mouseover', (e) => mouseOnCircle(e, 'mouse over'))
        // .on('touchstart', (e) => mouseOnCircle(e, 'touch start'))
        .on('mouseout', (e) => mouseOffCircle(e, 'mouse out'))
        // .on('touchend', (e) => mouseOffCircle(e, 'touch end'));
        
        svg.append('text')
        .attr('class', 'x-label')
        .attr('class', 'axis-labels')
        .attr('x', w / 2)
        .attr('y', h - 5)
        .text('Tiempo')
        
        svg.append('text')
        .attr('class', 'y-label')
        .attr('class', 'axis-labels')
        .attr('x', (h / 2) * (-1))
        .attr('y', (padding.horizontal - 35) / 2)
        .attr('transform', 'rotate(-90)')
        .text('Ranking')
    
        function mouseOnCircle(e, message) {
            e.target.style.r = 10;
            let data = [e.target.getAttribute('data-date'), e.target.getAttribute('data-points')]
            d3.select('#tooltip-date')
            .text(`Fecha: ${ data[0] }`);
            
            d3.select('#tooltip-points')
            .text(`Ranking: ${data[1]}`)
            
            d3.select('#tooltip')
            .style('display', 'block')
            .style('top', (e.pageY - 55) + 'px')
            .style('left', (e.pageX - 40) + 'px')
        }
    
        function mouseOffCircle(e, message) {
            d3.select('#tooltip')
            .style('display', 'none')
            e.target.style.r = 5
        }
    }
    
    try {
        if(getUserReq.isDoubles) {
            editName.parentElement.style.display = 'none';
            editAge.parentElement.style.display = 'none';
            editEmail.parentElement.style.display = 'none';
            editPwd.parentElement.style.display = 'none';
            editSexCtn.parentElement.style.display = 'none';
            // sexNodeList
        } else {
            editName.value = profileUser.name
            editAge.value = profileUser.age || '';
            editEmail.value = profileUser.email;
        }
        editRanking.value = profileUser.ranking.ranking;
    } catch(err) {
        console.log(err)
    }

    // Pongo los datos en el DOM
    document.querySelector('.name-ctn h1').innerText = profileUser.name;
    document.querySelector('.games strong').innerText = profileUser.matches.length;
    document.querySelector('.record strong').innerHTML = `<strong class='green'>${profileUser.matches.filter(match => match.result == true ).length}</strong> / <strong class='red'>${profileUser.matches.filter(match => match.result == false ).length}</strong>`;
    document.querySelector('.streak strong').innerText = profileUser.streak;
    if(profileUser.sex == 'F') {
        document.getElementById('photo').setAttribute('src', '/img/female player logo.png')
    }

    let H2H = profileUser.matches.filter(match => {
        return match.rival == currentUser.name
    });
    if(H2H.length !== 0) {
        document.querySelector('.h2h').innerHTML += `<strong class='green'>${H2H.filter(match => match.result == false ).length} < / <strong>/<strong class='red'> ${H2H.filter(match => match.result == true ).length}</strong>`
    } else {
        
    }

    // Sort matches by date ... muy largo...
    let count = {
        value: true,
        revert: () => {
            (count.value == true) ? count.value = false
            : count.value = true
        }
    }
    function sortArrayFx(arr, prop, direction) {
        let array = [...arr];
        if(direction == true) {
            return array.sort(function(a, b) {
                return (a[prop] === b[prop]) ? 0
                : a[prop] < b[prop] ? -1
                : 1
            })
        } else {
            return array.sort(function(a, b) {
                return (a[prop] === b[prop]) ? 0
                : a[prop] < b[prop] ? 1
                : -1
            })
        }
    }
    let matches = profileUser.matches;
    matches.map(match => {
        let [day, month, year] = match.date.split('-').map(item => parseInt(item));
        let date = DateTime.local(year, month, day);
        match.date = date;
    })
    const SORT_BY_DATE_BUTTON = document.getElementById('grid-reference-date')
    SORT_BY_DATE_BUTTON.addEventListener('click', (e) => {
        matches = sortArrayFx(matches, 'date', count.value);
        count.revert();
        document.querySelectorAll('.grid-item').forEach(item => item.remove());
        createMatchTable(matches);
    })

    function createMatchTable(matches) {
        for(let i = 0; i < matches.length; i++) {
            let dateContent = `<h3>${matches[i].date.toFormat('dd-MM-yy')}</h3>`
            createDiv('div', 'grid-item', 'date-item', dateContent)

            let rivalContent = `<h3>${matches[i].rival}</h3>`
            createDiv('div', 'grid-item', 'rival-item', rivalContent)

            let score = matches[i].score.map(set => set.join('-')).join(', ');
            let color = 'red';
            let retire = '';
            if(matches[i].result == true) color = 'green';
            if(matches[i].resign == true) retire = '(Ab.)'

            let scoreContent = `<h3 class="${color}">${score} <span class="retire">${retire}</span></h3>` 
            createDiv('div', 'grid-item', 'score-item', scoreContent)

            let breaksContent = `<h3 class="green">${matches[i].breaks.win}</h3><span> / </span><h3 class="red">${matches[i].breaks.lose}</h3>`
            createDiv('div', 'grid-item', 'break-item', breaksContent)

            let pointsContent = `<h3 class="${color}">${matches[i].points}</h3>`
            createDiv('div', 'grid-item', 'break-item', pointsContent)
        }
    }
    const MATCHES_CTN = document.getElementById('matches-ctn');
    createMatchTable(matches);
    /* Constructor de cada fila del jugador*/
    function createDiv(element, clas, clas2, content) {
        let ctn = document.createElement(element);
        ctn.classList.add(clas);
        ctn.classList.add(clas2);
        ctn.innerHTML = content;
        MATCHES_CTN.appendChild(ctn)
    }

    // Rival tooltip
    const ALL_RIVALS = document.querySelectorAll('.rival-item h3');
    const RIVAL_TOOLTIP = document.getElementById('rival-tooltip')
    const RIVAL_NAME = document.getElementById('rival-name')
    const RIVAL_MATCHES = document.getElementById('rival-matches')
    const CURRENT_NAME = document.getElementById('current-name')
    const CURRENT_MATCHES = document.getElementById('current-matches')
    ALL_RIVALS.forEach(rival => {
        let rivalH2H = profileUser.matches.filter(match => match.rival == rival.outerText);
        rival.addEventListener('mouseover', (e) => {
            RIVAL_NAME.innerText = rival.outerText;
            RIVAL_MATCHES.innerText = rivalH2H.filter(match => match.result == false).length
            CURRENT_NAME.innerText = profileUser.name;
            CURRENT_MATCHES.innerText = rivalH2H.filter(match => match.result == true).length
            RIVAL_TOOLTIP.style.left = `${ e.pageX - e.offsetX + e.target.offsetWidth + 10 }px`
            RIVAL_TOOLTIP.style.top = `${ e.pageY - e.offsetY - e.target.offsetHeight }px`
            RIVAL_TOOLTIP.classList.toggle('active-flex');
        })
        rival.addEventListener('mouseout', (e) => {
            RIVAL_TOOLTIP.classList.toggle('active-flex')
        })
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
            toggleLoadModal(); // Esta en home.js
            if(response.ok) return response.json();
            return Promise.reject(response)
        }).then(data => {
            result = data
        }).catch(async (response) => {
            result = response;
        });
        if(result.ok == false) {
            // Quizas hay que sacar el return para poder tener el status del request.
            return await result.json().then(json => {
                if(json.invalidAccTok == true) return window.location.href = 'http://localhost:3000/expired'
                return json;
            })
        }
        return result;
    }
})

const modalFx = (openButton, ctn, box, closeButton = undefined) => {
    openButton.addEventListener('click', (e) => {
        ctn.classList.add('active-flex');
    })
    ctn.addEventListener('click', (e) => {
        let isClickInsideElement = box.contains(e.target);
        if(!isClickInsideElement) {
            ctn.classList.toggle('active-flex')
            let selectSvg = box.querySelector('svg');
            if(selectSvg !== null) selectSvg.remove();
        }
    })
    if(closeButton !== undefined) {
        closeButton.addEventListener('click', (e) => {
            ctn.classList.toggle('active-flex')
            let selectSvg = box.querySelector('svg');
            if(selectSvg !== null) selectSvg.remove();
        })
    }
}

function checkEmail(email) { // Es un RegEx para que el email sea valido.
    return /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(email);
}
