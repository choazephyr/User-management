const BASE_URL = 'http://localhost:3000'

const validateLogin = ({ email, password }) => {
    const errors = []
    if (!email) errors.push('please insert email')
    if (!password) errors.push('please insert password')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) errors.push('invalid email format')
    if (password.length < 6) errors.push('password must be at least 6 characters')
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

const loginSubmit = async () => {
    const emailDOM = document.querySelector('input[name=email]')
    const passwordDOM = document.querySelector('input[name=password]')
    const messageDOM = document.getElementById('message')

    try {
        const loginData = {
            email: (emailDOM?.value || '').trim(),
            password: passwordDOM?.value || '',
        }

        const errors = validateLogin(loginData)
        if (errors.length > 0) {
            throw { message: 'incomplete fill in\n', errors }
        }

        const response = await axios.post(`${BASE_URL}/auth/login`, loginData)
       
        // save logged-in user (simple)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('token', response.data.token)

        console.log("token: ", response.data.token)
        console.log("role: ", response.data.user.role)

        messageDOM.innerText = 'login success'
        messageDOM.className = 'message success'

        // go to your user management page (change if you want)
        setTimeout(() => {
            if (response.data.user.role == 'admin') {
                window.location.href = './admin_user.html'
            } else {
                window.location.href = './profile.html'
            }
        }, 900) // ms
    } catch (error) {
        if (error.response) {
            error.message = error.response.data.message
            error.errors = error.response.data.errors
        }

        const msg = error.message || 'sth wrong'
        const errs = error.errors || []

        let htmlData = '<div>'
        htmlData += `<div>${msg}</div>`
        if (errs.length) {
            htmlData += '<ul>'
            for (let i = 0; i < errs.length; i++) {
              htmlData += `<li>${errs[i]}</li>`
            }
            htmlData += '</ul>'
        }
        htmlData += '</div>'

        messageDOM.innerHTML = htmlData
        messageDOM.className = 'message danger'
    }
}
