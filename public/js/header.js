document.addEventListener('DOMContentLoaded', async (e) => {

    const hamButton = document.querySelector('.header__ham');
    const listContainer = document.querySelector('.header__list-ul');
    const listItem = document.querySelectorAll('.header__list-ul li');
    const matchButton = document.getElementById('li__match-section');

    // Sacar datos del usuario para saber su rol y determinar el link de su perfil
    let decodeRefresh = fetch('http://localhost:3000/decodeRefresh', {
        credentials: 'include'
    }).then(response => {
        if(response.ok) {
            return response.json()
        }
        return Promise.reject(response)
    }).then(data => {
        if(data.isGuest == true) return;

        const currentId = data.decoded._id;
        try {
            const profileButton = document.getElementById('profile-button');
            profileButton.setAttribute('href', `http://localhost:3000/profile/${ currentId }`);
        } catch(err) {
            console.log(err)
        }
        try {
            if(data.decoded.roles[0] == 2000){
                matchButton.classList.add('active')
                matchButton.firstChild.setAttribute('href', 'http://localhost:3000/match');
            }
        } catch(err) {
            console.log(err)
        }
    }).catch(async (response) => {
        console.log(response)
        response.json().then((json) => {
            console.log(json);
            if(json.invalidAccTok == true) {
                window.location.href = 'http://localhost:3000/expired'
            }
        })
    })
    hamButton.addEventListener('click', (e) => {
        listContainer.classList.toggle('active') // ul
    })

    const logoutButton = document.getElementById('li__logout');
    logoutButton.addEventListener('click', async (e) => {
        let logout = await requestFx(`http://localhost:3000/logout`, 'GET');
        if(logout.status !== undefined) { // Corregir.. hay que poner los status en los JSON...
            console.log('Error en el logout');
        } else window.location.href = 'http://localhost:3000';
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
            // Quizas hay que sacar el return para poder tener el status del request.
            return await result.json().then(json => {
                if(json.invalidAccTok == true) return window.location.href = 'http://localhost:3000/expired'
                return json;
            })
        }
        return result;
    }
}) // DOM content loaded

