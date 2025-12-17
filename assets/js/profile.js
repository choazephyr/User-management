const BASE_URL = 'http://localhost:8000'

const token = localStorage.getItem('token')
const user = JSON.parse(localStorage.getItem('user'))
console.log('token key:', token)
console.log('all keys:', Object.keys(localStorage))
console.log('dump:', { ...localStorage })

if (!token) {
    window.location.href = './login.html'
}

function authHeaders() {
    const token = localStorage.getItem('token')
    return { Authorization: `Bearer ${token}` }
}

window.onload = async () => {
    // debug
    console.log('user id: ', user.id)
    try {
        const res = await axios.get(`${BASE_URL}/users/${user.id}`)

        console.log('me:', res.data)

        const u = res.data
        document.querySelector('input[name=email]').value = u.email || ''
        document.querySelector('input[name=username]').value = u.username || ''
        document.querySelector('textarea[name=note]').value = u.note || ''
    } catch (err) {
        console.log('GET /users/me error:', err)
        localStorage.removeItem('token')
        // window.location.href = './login.html'
    }
}

async function updateUser() {
    const email = document.querySelector('input[name=email]').value.trim()
    const username = document.querySelector('input[name=username]').value.trim()
    const note = document.querySelector('textarea[name=note]').value.trim()
    const roleDOM = document.querySelector('select[name=role]')
    const newPasswordDOM = document.querySelector('input[name=new_password]')

    const updateData = { email, username, note }
    if (roleDOM) updateData.role = roleDOM.value

    // only send password if admin types a new one
    if (newPasswordDOM && newPasswordDOM.value.trim() !== '') {
        updateData.password = newPasswordDOM.value
    }

    try {
        await axios.put(`${BASE_URL}/users/${user.id}`, updateData)
        alert('update complete')
        window.location.href = './user.html'
    } catch (err) {
        console.log(err)
        alert('update failed')
    }
}
