#!/usr/bin/env node
const express = require('express')
const config = require('./config/db.js')
const mysql = require('mysql')
const session = require('express-session')
const SESS_NAME = 'ssh! this is a secret string'

// create an express(aka web server), and start the server
const app = express()
const port = 8217
app.listen(port, () => {
  console.log(`listening on port: ${port}`)
})

app.use(express.static(`${__dirname}/dist`))
app.set('view engine', 'hbs')

//Define Routes
// const temp = app.use('/', require('./routes/pages'))

// setup `body-parser`
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//use session
app.use(session({
  name: 'sid',
  resave: false,
  saveUninitialized: false,
  secret: SESS_NAME,
  cookie:{
    maxAge: 1000*60*60*2, //2 Hours
    sameSite: true
  }
}))

const CheckNotAuthenticated = (req, res, next) => {
  if(!req.session.userID){
    return res.redirect('/login')
  }
  next()
}

const CheckAuthenticated = (req, res, next) => {
  if(req.session.userID){
    return res.redirect('/')
  }
  next()
}

//route
app.get("/", (req, res) => {
  res.render('index')
})

app.get("/login",CheckAuthenticated ,(req, res) => {
  const {userID} = req.session
  res.render('login')
})


app.get("/sign_up", (req, res) => {
  res.render('sign_up')
})

app.get("/query_house/house-detail", (req, res) => {
  res.render('house-detail')
})


app.get("/search", CheckNotAuthenticated, (req, res) => {
  res.render('search')
})

app.get("/upload", CheckNotAuthenticated, (req, res) => {
  res.render('upload')
})

app.get("/user_profile", CheckNotAuthenticated, (req, res) => {
  res.render('user_profile')
})


//connect to mysql
const connection = mysql.createConnection(config.mysql)

connection.connect(err => {
  if (err) {
    console.log('fail to connect:', err)
    process.exit()
  }

})


//login action
app.post('/',CheckAuthenticated ,(req, res) => {
  connection.query(`SELECT * FROM user_info WHERE phone=${req.body.password} AND email='${req.body.email}'`, (err, result) => {
    if (err) console.log('fail to insert:', err)
    if (result.length == 1){
      req.session.userID = result[0].user_num
      console.log(req.session)
      res.render('index')
    }else{
      console.log('wrong!')
    }
  })
  
})

//sign up action
app.post('/register_test', (req, res) => {  
  connection.query(`SELECT * FROM user_info WHERE phone=${req.body.password} AND email='${req.body.email}'`, (err, result) => {
    if (err) console.log('fail to insert:', err)
    if (result.length == 1){
      res.render('sign_up',{'err_msg':'此組帳號密碼已註冊過'})
    }else{
      connection.query(`INSERT INTO user_info(username, phone ,email) VALUES ('${req.body.username}',${req.body.password},'${req.body.email}')`, (err, result) => {
        if (err) console.log('fail to insert:', err)  
      })
      res.render('login',{'email':req.body.email,'phone':req.body.password}) 
    }
  })
})

//query house action
app.post('/query_house', (req, res) => {  
  let area = req.body.area
  let structure = req.body.structure
  let price_condition = ""
  let fire = 0
  let pet = 0

  if(req.body.price == ""){
    price_condition = "price>0"
  }else{
    price_condition = "price<" + req.body.price
  }


  if(req.body.fire == "on"){
    fire = 1
  }
  if(req.body.pet == "on"){
    pet = 1
  }

  connection.query(`SELECT * FROM house_info WHERE address LIKE '%${area}%' AND kind IN(${structure}) AND ${price_condition} AND fire=${fire} AND pet=${pet}`, (err, result) => {
    if (err) console.log('fail to insert:', err)
    let num_of_data = `找到${result.length}間房`
    res.render('search', {'data':result, 'area':area, 'num_of_data':num_of_data})
  }) 
})

//check house detail action
app.post('/query_house/house_detail_page', (req, res) => {
  connection.query(`SELECT * FROM house_info, user_info WHERE house_info.house_num=${req.body.house_num} AND house_info.user_num=user_info.user_num`, (err, result) => {
    if (err) console.log('fail to insert:', err)
    if (result.length == 1){
      result[0].fire = result[0].fire==1 ? '可以' : '不可以'
      result[0].pet = result[0].pet==1 ? '可以' : '不可以'
      result[0].phone = result[0].phone.toString().replace(/(\d{3})(\d{3})(\d{3})/, '0$1-$2-$3')
      console.log(result)
      res.render('house-detail', {'data':result[0]})
    }else{
      console.log('search nothing!')
    }
  })
  
})

//logout action
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if(err){
      console.log('err')
    }
    res.clearCookie(SESS_NAME)
    res.redirect('/')
  })
})

//upload house action
app.get('/upload_house', (req, res) => {  
  console.log(req.query.region)
  console.log(req.query.house_type)
  console.log(req.query.address)
  console.log(req.query.type)
  console.log(req.query.price)
  console.log(req.query.fire)
  console.log(req.query.pet)
  console.log(req.query.house_info)
  console.log(req.session.userID)

  connection.query(`INSERT INTO house_info(address,structures,price,kind,fire,pet,house_info,user_num,picture1,picture2,region) VALUES ('${req.query.address}','${req.query.type}',${req.query.price},${req.query.house_type},${req.query.fire},${req.query.pet},'${req.query.house_info}',${req.session.userID},'${req.query.picture1}','${req.query.picture2}','${req.query.region}')`, (err, result) => {
    if (err) console.log('fail to insert:', err)
  })

  res.send('upload')
})