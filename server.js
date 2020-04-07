const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())

// User container Until connecting to a database
const users = []

// Dummy data for books 
// this should be replaced with database instructions when connecting to a db
let books = [
  {
    "id": 1,
    "username": "faramarz",
    "title": "Harry potter and the deathly hallows",
    "Author": "J.K. Rolling"
  },
  {
    "id": 2,
    "username": "faramarz",
    "title": "Harry potter and the goblet of fire",
    "Author": "J.K. Rolling"
  },
  {
    "id": 3,
    "username": "jafar",
    "title": "Harry potter and the order of the phoenix!!",
    "Author": "J.K. Rolling"
  }
]

// get all users
app.get('/', (req, res) =>{
  res.json(users)
})

// Register a user
app.post('/register', async (req, res) => {
  //async because of the bcrypt
  try {
    const checkUser = users.find(user => user.username === req.body.username)
    // checking whether the user exists or not
    // ofcourse it will be replaced when connecting to a db
    if(checkUser && req.body.username === checkUser.username) return res.status(403).send('User already exxists')
    const hashedPass = await bcrypt.hash(req.body.password, 10)
    const user = {
      username: req.body.username,
      password: hashedPass
    }
    // adding to the dummy users
    users.push(user)
    return res.status(201).send('Registered successfully')
  } catch {
    return res.status(500).send('Something went wrong')
  }
})

// Login register user
app.post('/login', async (req, res) => {
  const user = users.find(user => user.username === req.body.username)
  if (user === null) return res.status(400).send('User not found!')
  try{
    if (await bcrypt.compare(req.body.password, user.password)){
      // const token = jwt.sign(user, 'TheSecretKey', {expiresIn :'10s'})
      const token = jwt.sign(user, 'TheSecretKey')
      res.json({token})
    }
    else{
      res.status(403).send('User name or password is wrong')
    }
  }
  catch{
    return res.status(500).send('Something went wrong')
  }
})

// get the books where username matches
app.get('/books', verifyToken, (req, res) => {
  // res.send(books. filter(book => book.username === req.user.username))
  res.send(books)
})

// get a single book with url
app.get('/books/:id', verifyToken, (req, res) => {
  // get the id from the url and converting it to int
  const id = +req.url.split('/')[2]
  res.send(books.find( book =>
    (book.username === req.user.username &&
    book.id === id)
  ))
})

// get a single book with body request
app.get('/book', verifyToken, (req, res) => {
  // get the id from body req and converting to int
  const id = +req.body.id
  res.send(books.find( book =>
    (book.username === req.user.username &&
    book.id === id)
  ))
})

// add a book
app.post('/books', verifyToken, (req, res) => {
  const book = {
    //this will be autogenerrated when connecting to a db
    "id": Math.floor(Math.random()*100000000000),
    "username": req.user.username,
    "title": req.body.title,
    "Author": req.body.Author
  }
  books.push(book)
  return res.status(201).send('Book added successfully')
})

// Update an existing book
app.put('/book', verifyToken, (req, res) => {
  // get the id from body req and converting to int
  const id = +req.body.id
  const book = (books.find( book =>
    (book.username === req.user.username &&
    book.id === id)
  ))
  if (book == null) return res.status(404).send('The book does not exist for this username')
  book.title = req.body.title
  book.Author = req.body.Author
  res.send(book)
})

// Delete an existing book
// It works a lot better when connecting to a db!!
app.delete('/book', verifyToken, (req, res) => {
  // get the id from body req and converting to int
  const id = +req.body.id
  const book = (books.find( book =>
    (book.username === req.user.username &&
    book.id === id)
  ))
  if (book == null) return res.status(404).send('The book does not exist for this username')
  books = (books.filter ( book => book.id !== id ))
  // if (book == null) return res.status(404).send('The book does not exist for this username')
  // console.log(books)
  // book = {}
  // console.log(books)
  res.send(book)
})

// Middlewares
// to verify the token using jwt
function verifyToken(req, res, next) {
  //Token shape: Bearer ey....
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token === null) return res.status(401)
  jwt.verify(token, 'TheSecretKey', (err, user) => {
    if (err) return res.status(403).send('Unauthorized access')
    req.user = user
    next()
  })
}

// starting up the server on port 4000
app.listen(4000, () => console.log("Server is running on http://localhost/4000"))
