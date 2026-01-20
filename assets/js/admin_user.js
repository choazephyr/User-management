// 1. load all users from API
// 2. put loaded-users back to html

const BASE_URL = 'http://localhost:3000'

window.onload = async () => {
    await loadData()
}

function search() {
    const searchBox = document.getElementById("searchBox");
    console.log("1:" + searchBox)
    const q = (searchBox?.value || "").toLowerCase().trim();
    console.log("q=" + q)

    document.querySelectorAll(".user-table tbody tr").forEach(tr => {
        const tds = tr.querySelectorAll("td");
        const email = (tds[1]?.textContent || "").toLowerCase();
        const username = (tds[2]?.textContent || "").toLowerCase();

        const match = email.includes(q) || username.includes(q);

        tr.style.display = match ? "" : "none";
        console.log("2:" + tr.style.display)
    });
}

const userMe = JSON.parse(localStorage.getItem('user'))
if (!userMe) {
    window.location.href = 'login.html'
}


const loadData = async () => {
    // 1. load all users from API
    const response = await axios.get(`${BASE_URL}/users`)

    console.log(response.data)

    const userDOM = document.getElementById('user')

    // 2. put loaded-users back to html
    let htmlData = `
        <div>
            Search <input id="searchBox" type="search">
            <button type="button" id="searchBotton" onclick=search()>🔍</button>
        </div>
        <div class="table">
            <table class="user-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
            <tbody>`
    for (let i=0; i<response.data.length; i++){
        let user = response.data[i]
        const isMe = String(user.id) === String(userMe.id) ||
        (user.email && userMe.email && user.email.toLowerCase() === userMe.email.toLowerCase())

        htmlData += `
                <tr class="${isMe? 'me': ''}">
                    <td>${user.id} ${isMe? '<span class="badge">(You)</span>' : ''}</td>
                    <td>${user.email}</td>
                    <td>${user.username}</td>
                    <td>${user.role}</td>
                    <td>
                    <a href="./edit_user.html?id=${user.id}">
                        <button type="button">edit</button>
                    </a>
                    <button type="button" class="delete" data-id="${user.id}">delete</button>
                    </td>
                </tr>
            `
    }
    htmlData += `
            </tbody>
        </table>
    </div>
    `

    userDOM.innerHTML = htmlData

    // button class delete
    const deleteDOMs = document.getElementsByClassName('delete')

    for(let i=0; i<deleteDOMs.length; i++){
        if ((userMe.role || '').toLowerCase() !== 'admin') {
            console.log("current user role: ", userMe.role)
            alert('Sorry, you are not admin. You cannot delete other user!!')
            window.location.href = 'profile.html'
        }
        else {
            deleteDOMs[i].addEventListener('click', async (event) => {
            // get id
                const btn = event.currentTarget
                const id = btn.dataset.id

                // get username from the row (3rd column = username)
                const tr = btn.closest('tr')
                const username = (tr?.querySelectorAll('td')[2]?.textContent || '').trim()
                const ok = confirm(`Are you sure you want to delete "${username}"`)
                if (!ok) return

                try{
                    await axios.delete(`${BASE_URL}/users/${id}`)
                    loadData() // recursive function
                }
                catch(error) {
                    console.log('error', error)
                    alert('Delete failed')
                }
            })
        }
    }
}

function logout() {
    localStorage.removeItem('user')
    window.location.href = 'login.html'   // adjust path if needed
}
