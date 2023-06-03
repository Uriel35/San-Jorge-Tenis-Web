document.addEventListener('DOMContentLoaded', async (e) => {
    
    let requestData = await requestFx('http://localhost:3000/api/users', 'GET');
    document.getElementById('nro-jugadores').innerText = requestData.users.length;
    document.getElementById('nro-partidos').innerText = requestData.users.reduce((sum, player) => sum + player.matches.length, 0)
    
    async function requestFx (url, method, body = undefined, headers = undefined) {
        const loadModal = document.querySelector('.loading-modal'); // Loading modal mientras cargan las request al server
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
