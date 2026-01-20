const express = require('express')
const bodyparser = require('body-parser')
const mysql = require('mysql2/promise')
const cors = require('cors')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
require('dotenv').config()

console.log("JWT_SECRET:", process.env.JWT_SECRET ? "OK" : "MISSING")

const port = process.env.PORT
let conn = null

const initMySQL = async () => {
    conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT)
    })
}

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
    return errors
}

// to read and use bodyparser
// needed to change input type according to type we put in body
app.use(bodyparser.json()) 
app.use(cors({
    origin: (origin, cb) => {
        if (!origin) return cb(null, true)
        if (origin.includes(".netlify.app") || origin.startsWith("http://localhost")) {
        return cb(null, true)
        }
        return cb(new Error("Not allowed by CORS"))
    }
}))

app.use(express.static(path.resolve()));

app.get('/testdb', (req,res) =>{
    mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'user_management',
        port: 3306
    }).then((conn) => {
        conn
        .query('SELECT * FROM users')
        .then((results) => {
            res.json(results[0])
        })
        .catch((error) => {
            console.error('Error fetching users:', error.message)
            res.status(500).json({ error: 'Error fetching users'})
        })
    }) // no need to finish 
})

app.get('/testdb-new', async (req,res) =>{
    try {
        const results = await conn.query('SELECT * FROM users')
        res.json(results[0])
    } catch (error) {
        console.error('Error fetching users:', error.message)
        res.status(500).json({ error: 'Error fetching users'})
    }  
})

/*
GET /users --> get all users that collect
POST /users --> create new users
GET /users/:id --> get specific users
PUT /useres/:id --> edit specific users
DELETE /users/:id --> delete specific users
*/

// example JWT middleware
function auth(req, res, next) {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : null
    if (!token) return res.status(401).json({ message: "No token" })

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = payload // must include { id: ... }
        if (!header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Invalid auth header' })
        }
        next()
    } catch {
        return res.status(401).json({ message: "Invalid token" })
    }
}

app.get('/users/me', auth, async (req, res) => {
    try {
        const [rows] = await conn.query(
        'SELECT id,email,username,note,role,created_at FROM users WHERE id = ?',
        [req.user.id]
        )

        if (!rows.length) return res.status(404).json({ message: 'not found' })
        res.json(rows[0])
    } catch (error) {
        console.error('GET /users/me ERROR:', error)
        res.status(500).json({ message: 'sth wrong' })
    }
})

app.put('/users/me', auth, async (req, res) => {
    try {
        const id = req.user.id
        const { email, username, note, password } = req.body

        const updateData = {}

        // only update fields that were sent (and not empty)
        if (email !== undefined) updateData.email = email
        if (username !== undefined) updateData.username = username
        if (note !== undefined) updateData.note = note

        if (password && password.trim() !== '') {
        updateData.password_hash = await bcrypt.hash(password, 10)
        }

        if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'no data to update', errors: [] })
        }

        const [result] = await conn.query(
        'UPDATE users SET ? WHERE id = ?',
        [updateData, id]
        )

        res.json({ message: 'update ok', result })
    } catch (error) {
        console.error('UPDATE /users/me ERROR:', error)
        res.status(500).json({ message: 'sth wrong', errors: [] })
    }
})


// GET /users --> get all users that collect
app.get('/users', auth, async (req, res) => {
  const results = await conn.query('SELECT id,email,username,note,role,created_at FROM users')
  res.json(results[0])
})


// GET /users/:id --> get specific users
app.get('/users/:id', auth, async(req, res) => {
    try {
        let id = req.params.id
        const results = await conn.query('SELECT * FROM users WHERE id = ?', [id])
    
        if (results[0].length == 0){
            throw{ statusCode: 404, message: 'not found'}
        }
        res.json(results[0][0])
    } catch (error) {
        console.error('error message', error.message)
        let statusCode = error.statusCode || 500
        res.status(statusCode).json({
            message: 'sth wrong',
            errorMessage: error.message
        })
    }
}) 

// POST /users --> create new users
app.post('/users', async (req, res) => {
    try{
        let user = req.body
        const errors = validateData(user)
        if(errors.length > 0 ){
            throw{
                message: 'incomplete fill in',
                errors: errors
            }
        }

        const password_hash = await bcrypt.hash(user.password, 10)
        const userToInsert = {
            email: user.email,
            username: user.username,
            note: user.note,
            password_hash: password_hash
        }

        const results = await conn.query('INSERT INTO users SET ?', userToInsert)
        res.json({
            message: 'insert ok',
            user: results[0]
        })
    } catch (error) {
        const errorMessage = error.message || 'sth wrong'
        const errors = error.errors || []
        console.error('error message', error.message)
        res.status(500).json({
            message: errorMessage,
            errors: errors
        })
    }
})

// PUT /useres/:id --> edit specific users
app.put('/users/:id', auth, async(req, res) => {
    try{
        let id = req.params.id
        let updateUser = req.body

        const updateData = {}

        if (updateUser.email !== null) updateData.email = updateUser.email
        if (updateUser.username !== null) updateData.username = updateUser.username
        if (updateUser.note !== null) updateData.note = updateUser.note

        // role (admin should change this only; for now allow if sent)
        if (updateUser.role !== null) updateData.role = updateUser.role


        if (updateUser.password && updateUser.password.trim() !== '') {
            updateData.password_hash = await bcrypt.hash(updateUser.password, 10)
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'no data to update', errors: [] })
        }
        const results = await conn.query('UPDATE users SET ? WHERE id = ?',
            [updateData, id]
        )
        res.json({
            message: 'update complete',
            user: results[0],
            data: {
                user: updateUser,
                indexUpdate: selectedIndex
            }
        })
        // users that update, update back to users

        res.send(id)
    } catch (error) {
        console.error('error message', error.message)
        res.status(500).json({
            message: 'sth wrong',
        })
    }
})

// DELETE /users/:id --> delete specific users
app.delete('/users/:id', auth, async (req, res) => {
    try{
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'forbidden' })
        }

        let id = req.params.id
        const results = await conn.query('DELETE FROM users WHERE id = ?',id)
        res.json({
            message: 'delete ok',
            user: results[0]
        })
    } catch (error) {
        console.error('error message', error.message)
        res.status(500).json({
            message: 'sth wrong',
        })
    }
})


app.post('/auth/login', async (req, res) => {
    console.log("Body: ", req.body)
    try {
        const { email, password } = req.body
        
        const errors = []
        if (!email) errors.push('please insert email')
        if (!password) errors.push('please insert password')
        if (errors.length) {
            return res.status(400).json({ message: 'incomplete fill in', errors })
        }

        const results = await conn.query(
            'SELECT id, email, username, role, password_hash FROM users WHERE email = ?',
            [email]
        )

        console.log('email: ', results[0])

        if (results[0].length === 0) {
            return res.status(401).json({ message: 'email or password incorrect', errors: [] })
        }

        const user = results[0][0]
        const ok = await bcrypt.compare(password, user.password_hash)
        console.log('ok: ', ok)

        if (!ok) {
            return res.status(401).json({ message: 'email or password incorrect', errors: [] })
        }

        const token = jwt.sign(
            {id: user.id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '2h'}
        )

        // NEVER return password_hash
        res.json({
            message: 'login ok',
            token,
            user: { id: user.id, email: user.email, username: user.username, role: user.role }
        })
    } catch (error) {
            console.error('LOGIN ERROR:', error)
            res.status(500).json({ message: 'sth wrong', errors: [] })
    }
})


// app.listen(3000, async (req, res) => {
//         await initMySQL()
//         console.log('http server run at' + port)
// })

;(async () => {
  await initMySQL()
  app.listen(port, () => console.log('http server run at ' + port))
})().catch(err => {
  console.error("STARTUP ERROR:", err)
  process.exit(1)
})
