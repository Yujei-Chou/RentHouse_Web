#!/usr/bin/env node
const express = require('express')
const config = require('./config/db.js')
const mysql = require('mysql')
const session = require('express-session')
const SESS_NAME = 'ssh! this is a secret string'
const fs = require('fs')
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
  if(req.session.userID){
    connection.query(`SELECT username, user_num FROM user_info WHERE user_num=${req.session.userID}`, (err, result) =>{
      if (err) console.log('fail to select:', err)
      res.render('index', {'log_status': 'login', 'user_info': result[0]})
    })  
  }else{
    res.render('index')
  }
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
  connection.query(`SELECT username, user_num FROM user_info WHERE user_num=${req.session.userID}`, (err, result) =>{
    if (err) console.log('fail to select:', err)
    res.render('search', {'user_info': result[0]})
  })  

})

app.get("/upload", CheckNotAuthenticated, (req, res) => {
  connection.query(`SELECT username, user_num FROM user_info WHERE user_num=${req.session.userID}`, (err, result) =>{
    if (err) console.log('fail to select:', err)
    res.render('upload', {'user_info': result[0]})
  })
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


//get profile action
app.post('/get_profile', (req, res) => {
  connection.query(`SELECT * FROM user_info, house_info WHERE user_info.user_num=house_info.user_num AND user_info.user_num=${req.body.user_num}`, (err, result) => {
    if (err) console.log('fail to select:', err)
    res.render('user_profile', {'data':result})
  })
}) 

//delete house action
app.get('/delete_house', (req, res) => {
  console.log(`delete:${req.query.house_num}`)
  res.send()
})

//edit house action
app.post('/edit_house', (req, res) => {
  connection.query(`SELECT * FROM house_info WHERE house_num=${req.body.house_num}`, (err, result) => {
    if (err) console.log('fail to select:', err)
    res.render('upload', {'data': result[0]})
  })
})

//login action
app.post('/',CheckAuthenticated ,(req, res) => {
  connection.query(`SELECT * FROM user_info WHERE phone=${req.body.password} AND email='${req.body.email}'`, (err, result) => {
    if (err) console.log('fail to insert:', err)
    if (result.length == 1){
      req.session.userID = result[0].user_num
      connection.query(`SELECT username, user_num FROM user_info WHERE user_num=${req.session.userID}`, (err, result) =>{
        if (err) console.log('fail to select:', err)
        res.render('index', {'log_status': 'login', 'user_info':result[0]})
      })
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


app.get('/query_house', (req, res) => {
  if(req.query.price == ""){
    price_condition = "price>0"
  }else{
    price_condition = "price<" + req.query.price
  }  
  connection.query(`SELECT * FROM house_info WHERE address LIKE '%${req.query.area}%' AND kind IN(${req.query.structure}) AND ${price_condition} AND fire=${req.query.fire} AND pet=${req.query.pet}`, (err, result) => {
    if (err) console.log('fail to select:', err)
    res.send(result)
  }) 
})

//check house detail action
app.post('/query_house/house_detail_page', (req, res) => {
  let user_info
  connection.query(`SELECT username, user_num FROM user_info WHERE user_num=${req.session.userID}`, (err, result) =>{
    if (err) console.log('fail to select:', err)
    user_info = result[0]
  })  
  connection.query(`SELECT * FROM house_info, user_info WHERE house_info.house_num=${req.body.house_num} AND house_info.user_num=user_info.user_num`, (err, result) => {
    if (err) console.log('fail to insert:', err)
    if (result.length == 1){
      result[0].fire = result[0].fire==1 ? '可以' : '不可以'
      result[0].pet = result[0].pet==1 ? '可以' : '不可以'
      result[0].phone = result[0].phone.toString().replace(/(\d{3})(\d{3})(\d{3})/, '0$1-$2-$3')
      res.render('house-detail', {'data':result[0], 'user_info':user_info})
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
app.post('/upload_house', (req, res) => {  
/*
  console.log(req.body.region)
  console.log(req.body.house_type)
  console.log(req.body.address)
  console.log(req.body.type)
  console.log(req.body.price)
  console.log(req.body.fire)
  console.log(req.body.pet)
  console.log(req.body.house_info)
  console.log(req.session.userID)
  console.log(req.body.picture1)
  console.log(req.body.picture2)
  console.log(req.body.lat)
  console.log(req.body.lng)
*/
  connection.query(`SELECT MAX(house_num) FROM house_info`, (err, result) =>{
    if(err) console.log('fail to select:', err)
    connection.query(`ALTER table house_info AUTO_INCREMENT=${result[0]['MAX(house_num)']}`,(err, result) => {
      if(err) console.log('fail to alter table:', err)
    })    
    let picName1 = `${result[0]['MAX(house_num)']+1+"-1"}.png`
    let picName2 = `${result[0]['MAX(house_num)']+1+"-2"}.png`
    fs.writeFile(`./dist/img/housePic/${picName1}`, req.body.picture1.split('base64,')[1], 'base64', function(err) {
      console.log(err)
    })
    fs.writeFile(`./dist/img/housePic/${picName2}`, req.body.picture2.split('base64,')[1], 'base64', function(err) {
      console.log(err)
    })
    connection.query(`INSERT INTO house_info(address,structures,price,kind,fire,pet,house_info,user_num,picture1,picture2,region,lat,lng) VALUES ('${req.body.address}','${req.body.type}',${req.body.price},${req.body.house_type},${req.body.fire},${req.body.pet},'${req.body.house_info}',${req.session.userID},'img/housePic/${picName1}','img/housePic/${picName2}','${req.body.region}','${req.body.lat}','${req.body.lng}')`, (err, result) => {
      if (err) console.log('fail to insert:', err)
    })
  })
  res.send('upload')
})