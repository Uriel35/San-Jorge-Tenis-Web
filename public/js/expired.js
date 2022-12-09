document.addEventListener('DOMContentLoaded', (e) => {
    
    const refreshButton = document.getElementById('refresh-button');
    
    refreshButton.addEventListener('click', async (e) => {
        const refreshPromise = await fetch('http://localhost:3000/refresh', {
            credentials: 'include'
        }).then(response => {
            if(!response.ok) return Promise.reject(response);
            return response.json()
        }).then(data => {
            if(data.accessToken !== undefined) {
                console.log('Volver a pagina con nuevo token')
                sessionStorage.setItem('accessToken', data.accessToken);
                // window.history.back(); // Ir a la pagina anterior... Me suele dar error porque NO actualiza los request.
                window.location.href = 'http://localhost:3000/home'
            }
        }).catch(async (resp) => {
            await resp.json().then(data => {
                if(data.unvalidTok) {
                    console.log('Reiniciar sesión')
                    window.location.href = 'http://localhost:3000';
                }
            })
        })
    })
})
