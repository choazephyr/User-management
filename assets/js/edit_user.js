const BASE_URL = 'http://localhost:3000'

const currentUser = JSON.parse(localStorage.getItem('user'))
if (!currentUser) window.location.href = 'login.html'

// (optional) front-end guard: only admin can open
if ((currentUser.role || '').toLowerCase() !== 'admin') {
    console.log("current user role: ", currentUser.role)
    alert('Sorry, you are not admin. You cannot edit other user!!')
    window.location.href = 'profile.html'
}

function togglePassword(event) {
    const passInput = document.querySelector('input[name=new_password]')
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

let selectedId = ''

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    selectedId = urlParams.get('id')
    if (!selectedId) return

    // load user detail
    const res = await axios.get(`${BASE_URL}/users/${selectedId}`)
    const u = res.data

    document.querySelector('input[name=email]').value = u.email || ''
    document.querySelector('input[name=username]').value = u.username || ''
    document.querySelector('textarea[name=note]').value = u.note || ''

    // role (if you have select)
    const roleDOM = document.querySelector('select[name=role]')
    if (roleDOM) roleDOM.value = u.role || 'user'
}

// admin update
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
        await axios.put(`${BASE_URL}/users/${selectedId}`, updateData)
        if (String(selectedId) === String(currentUser.id) && updateData.role) {
            const updatedUser = { ...currentUser, role: updateData.role }
            localStorage.setItem('user', JSON.stringify(updatedUser))
        }

        console.log('all keys:', Object.keys(localStorage))
        console.log('dump:', { ...localStorage })

        alert('update complete')
        // window.location.href = './user.html'
    } catch (err) {
        console.log(err)
        alert('update failed')
    }
}
