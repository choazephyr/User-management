const BASE_URL = 'http://localhost:8000'

const validateData = (userData) => {
    let errors = []
    if (!userData.email){
        errors.push('please insert email')
    }
    if (!userData.password){
        errors.push('please insert password')
    } 
    if (!userData.username){
        errors.push('please insert username')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(userData.email)) errors.push('please insert password')
    if(userData.password.length < 6) errors.push('please insert password')
    return errors
}

function togglePassword(event) {
    const passInput = document.querySelector('input[name=password]')
    const btn = event.currentTarget
    if (!passInput) return

    if (passInput.type === 'password') {
        passInput.type = 'text'
        btn.innerText = 'Hide'
    } else {
        passInput.type = 'password'
        btn.innerText = 'Show'
    }
}

const submitData = async() => {
    let emailDOM = document.querySelector('input[name=email]')
    let passwordDOM = document.querySelector('input[name=password]')
    let usernameDOM = document.querySelector('input[name=username]')
    let noteDOM = document.querySelector('textarea[name=note]')

    let messageDOM = document.getElementById('message')

    try {
        let userData = {
            email: emailDOM.value,
            username: usernameDOM.value,
            note: noteDOM.value,
        }

        if (passwordDOM.value.trim() !== '') {
            userData.password = passwordDOM.value
        }

        let message = 'save data complete'

        const response = await axios.post(`${BASE_URL}/users`,userData)
        console.log('response data', response.data)

        messageDOM.innerText = message
        messageDOM.className = 'message success'
        
        setTimeout(() => {
            window.location.href = 'login.html'
        }, 900) // ms

    } catch (error) {
        console.log('error message', error.message)
        console.log('error', error.errors)
        if (error.response) {
            console.log(error.response)
            error.message = error.response.data.message
            error.errors = error.response.data.errors
        }

        let htmlData = '<div>'  
        htmlData += `<div>${error.message}</div>`
        htmlData += '<ul>'
        for (let i=0; i<error.errors.length; i++){
            htmlData += `<li>${error.errors[i]}</li>`
        }
        htmlData += '</ul>'
        htmlData += '</div>'

        messageDOM.innerHTML = htmlData
        messageDOM.className = 'message danger'
    }
}