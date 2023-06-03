document.addEventListener('DOMContentLoaded', async (e) => {
    const DateTime = luxon.DateTime;

    let data = await requestFx('http://localhost:3000/api/users', 'GET');
    let doublesData = await requestFx('http://localhost:3000/api/doubles', 'GET');

    const maleUsersSingles = data.users.filter(item => item.sex === 'M');
    const femaleUsersSingles = data.users.filter(item => item.sex === 'F');
    const maleUsersDoubles = doublesData.data.filter(item => item.sex === 'M');
    const femaleUsersDoubles = doublesData.data.filter(item => item.sex === 'F');

    let dataArray = maleUsersSingles;
    // console.log(dataArray)

    const OPEN_RANKING_CHART = document.getElementById('open-ranking-chart');
    const RANKING_CHART_CTN = document.getElementById('ranking-chart-ctn');
    const RANKING_CHART_BOX = document.getElementById('ranking-chart-box');
    modalFx(OPEN_RANKING_CHART, RANKING_CHART_CTN, RANKING_CHART_BOX);

    const padding = {
        vertical: 45,
        horizontal: 70
    };    
    dataArray.map(item => {
        let initRank = 1000;
        if(item.ranking.history.length == 0) {
            item.ranking.history = [{
                date: DateTime.now().toFormat('dd-MM-yyyy'),
                points: 0
            }]
        }
        item.ranking.history.map(match => {
            const [day, month, year] = match.date.split('-').map(item => parseInt(item));
            let date = DateTime.local(year, month, day)
            match.date = date;
            initRank += match.points;
            match.points = initRank;
            return match
        })
        return item
    });
    let allData = [];
    dataArray.map(user => {
        user.ranking.history.map(match => {
            allData.push([match.date, match.points])
        })
    })

    function createRankingChart(w, h) {
        let svg = d3.select('.chart-ctn')
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .style('background-color', 'white');

        let x = d3.scaleTime()
        .domain([d3.min(allData, (d) => d[0]), d3.max(allData, (d) => d[0])])
        .range([padding.horizontal, w - padding.horizontal])
        
        let y = d3.scaleLinear()
        .domain([d3.min(allData, (d) => d[1]) - 50, d3.max(allData, (d) => d[1]) + 50])
        .range([h - padding.vertical, padding.vertical])

        const xAxis = d3.axisBottom()
        .scale(x)
        .ticks(5)
        .tickFormat(d3.timeFormat('%b-%Y'));
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

        svg.append('text')
        .attr('class', 'x-label')
        .attr('class', 'axis-labels')
        .attr('x', w / 2)
        .attr('y', h - 5)
        .text('Tiempo')
        
        svg.append('text')
        .attr('class', 'y-label')
        .attr('class', 'axis-labels')
        .attr('x', (h / (-2)))
        .attr('y', (padding.horizontal - 35) / 2)
        .attr('transform', 'rotate(-90)')
        .text('Ranking')

        // let paths = svg.selectAll('path')
        // .datum(dataArray)
        // .join('path')
        // .attr('class', (d) => d._id)
        // .attr('fill', 'none')
        // .attr('stroke', '#000')
        // .attr('stroke-width', 3)

        // .attr("d", d3.line()
        //     .x((d) => {
        //         console.log(d.ranking.history)
        //         // console.log(d.ranking.history.date)
        //         return x(d.ranking.history.date)
        //     })
        //     .y((d) => {
        //         // console.log(d.ranking.history.points)
        //         return y(d.ranking.history.points)
        //     })
        //     .curve(d3.curveMonotoneX) // Hace que sea mas "curvo" y no tan lineal
        // )

        for(let i = 0; i < dataArray.length; i++) {
            const randomColor = `hsl(${Math.random() * 200}, ${Math.random() * 100}%, ${Math.random() * 100}%)`;
            svg.append('path')
            .datum(dataArray[i].ranking.history)
            .attr('class', dataArray[i]._id)
            .attr('fill', 'none')
            .attr('stroke', randomColor)
            .attr('stroke-width', 3)
            .attr("d", d3.line()
                .x(function(d) {
                    return x(d.date)
                })
                .y(function(d) {
                    return y(d.points)
                })
                .curve(d3.curveMonotoneX) // Hace que sea mas "curvo" y no tan lineal
            )
        }
        // console.log(dataArray);
    
        // svg.selectAll('rect')
        // .data(dataArray)
        // .join('rect')
        // .attr('x', w - padding.horizontal)
        // .attr('y', (d) => {
        //     // console.log(d)
        //     return y(d.ranking.history[d.ranking.history.length - 1].points)
        // })
        // .text('Hola')
        // .attr('width', 10)
        // .attr('height', 10)
        // .attr('fill', () => {
        //     const randomColor = `hsl(${Math.random() * 200}, ${Math.random() * 100}%, ${Math.random() * 100}%)`;
        // })
    }
    
    OPEN_RANKING_CHART.addEventListener('click', (e) => {
        const w = RANKING_CHART_BOX.offsetWidth;
        const h = RANKING_CHART_BOX.offsetHeight * 0.5;
        createRankingChart(w, h);
    })
});

async function requestFx (url, method, body = undefined, headers = undefined) {
    // toggleLoadModal();
    let result;
    let accTok = sessionStorage.getItem('accessToken');
    await fetch(url, {
        credentials: 'include',
        method: method,
        headers: {...headers, 'Authorization': `Bearer ${ accTok }`},
        body: JSON.stringify(body)
    }).then(response => {
        // toggleLoadModal(); // Esta en home.js
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

const modalFx = (openButton, ctn, box, closeButton = undefined) => {
    openButton.addEventListener('click', (e) => {
        ctn.classList.add('active-flex');
    })
    ctn.addEventListener('click', (e) => {
        let isClickInsideElement = box.contains(e.target);
        if(!isClickInsideElement) {
            ctn.classList.toggle('active-flex')
            let selectSvg = box.querySelector('svg');
            if(selectSvg !== undefined) selectSvg.remove();
        }
    })
    if(closeButton !== undefined) {
        closeButton.addEventListener('click', (e) => {
            ctn.classList.toggle('active-flex')
            let selectSvg = box.querySelector('svg');
            if(selectSvg !== undefined) selectSvg.remove();
        })
    }
}