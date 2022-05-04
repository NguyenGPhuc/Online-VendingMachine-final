	// OPEN IN ANOTHER PAGE FOR SITE TO WORK PROPERLY!!!!!
  // ---------------------------------------------------
  const express = require("express");
	const mysql = require('mysql');
	const fetch = require('node-fetch');
	const bcrypt = require('bcrypt');
	const session = require('express-session');

	const app = express();
	const pool = dbConnection();

	app.set("view engine", "ejs");
	app.use(express.static("public"));

	app.set('trust proxy', 1) // trust first proxy
	app.use(session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true,
		cookie: { secure: true }
	}))


	// var customerId  = -22;
  app.use((req, res, next) => {
		// Check if we've already initialised a session
		// if (!req.session.initialised) {
      if(!req.session.authenticated) {
				// Initialise our variables on the session object (that's persisted across requests by the same user
				req.session.customerId = -1;
		}
		next();
	});


	//Needed to get values from form using POST method
	app.use(express.urlencoded({extended:true}));
	 
	//routes
	app.get('/', (req, res) => {
	  //  res.send('Hello Express app!');
    res.render('login');
	});

	app.get('/home', isAuthenticated, (req, res) => {
    res.render('home');
	});	

app.get('/api/cartDelete', isAuthenticated, async (req, res) => {
	let customerId = req.session.customerId;

	let sql = `DELETE
						 FROM cart
						 WHERE customerId = ${customerId}`;
	let data = await executeSQL(sql);

  let sql2 = `SELECT *
              FROM customers
              WHERE customerId = ${customerId}`;

  let data2 = await executeSQL(sql);

	// displaying list of authors
	res.send(data2);
});


app.post('/api/customer/:id', isAuthenticated, async (req, res) => {
  let customerId = req.session.customerId;

    let sql = `SELECT *
              FROM customers
              WHERE customerId = ${customerId}`;

  let data = await executeSQL(sql);
    
    res.send(data);
});

app.get('/api/cartInfo', isAuthenticated, async (req, res) => {
		let customerId = req.session.customerId;

    let sql = `SELECT cu.customerId, fo.foodId, fo.title, fo.price, cu.firstName, cu.lastName
              FROM cart ca
              JOIN fooditems fo ON ca.foodId = fo.foodId
              JOIN customers cu ON cu.customerId = ca.customerId
              WHERE cu.customerId = ${customerId}
              ORDER BY price DESC`;
    
    let data = await executeSQL(sql);
    res.send(data);
	});

  app.get('api/customer/:id', isAuthenticated, async (req, res) => {
    let customerId = req.session.customerId;

    let sql = `SELECT * 
              FROM cart
              NATURAL JOIN customers
              WHERE customerId=${customerId}`;
    let data = await executeSQL(sql);
    
    res.send(data);
  });

  app.get('/cart', isAuthenticated, async (req, res) => {
		let customerId = req.session.customerId;
		let sql = `SELECT * 
							 FROM customers
							 WHERE customerId=${customerId}`;
		let data = await executeSQL(sql);
    
    res.render('cart', {"customer": data});
	});

	app.get('/signup', (req, res) => {
    res.render('signup');
	});

	app.post('/signup', async (req, res) => {
		let fName = req.body.firstName;
		let lName = req.body.lastName;
		let favFood = req.body.favoriteFood;
		let userName = req.body.username;	
    let password = req.body.password;
    let passwordPlain = password;
		let defaultProfilePic = "https://riverlegacy.org/wp-content/uploads/2021/07/blank-profile-photo.jpeg";
		
		hashedPass = await bcrypt.hash(password, 10);

		//do all of the sql stuff here
		let sql = `INSERT INTO customers(firstName, lastName, favoriteFood, username, passwordPlain, password, profilePicture) VALUES (?, ?, ?, ?, ?, ?, ?)`;//? are used to prevent sql injection
		
    let params = [fName, lName, favFood, userName, passwordPlain, hashedPass, defaultProfilePic];
    let rows = await executeSQL(sql, params);
    
		res.render('login');
	});

	app.post('/login', async(req, res) => {
		let userName = req.body.username;
		let userPass = req.body.pwd;
		let sql = "";

		sql = ` SELECT *
								FROM customers
								WHERE username = ?`;

		let data = await executeSQL(sql, [userName]);

		if(data.length > 0 ){
			passwordHash = data[0].password;
		}

		const matchPassword = await bcrypt.compare(userPass, passwordHash);

    // console.log(matchPassword);
    // console.log(req.body.pwd);

      if(matchPassword){
        req.session.authenticated = true;
        req.session.customerId = data[0].customerId;
        res.render('home');
      } else {
        res.render('login', {"error":"Invalid credentials"});
      }

	});


  app.get('/order', isAuthenticated, async (req, res) => {
    let sql = `SELECT DISTINCT category
              FROM foodItems`;

    let sql2 = `SELECT *
                FROM foodItems`;

    let rows = await executeSQL(sql);
    let rows2 = await executeSQL(sql2);
  
		res.render (`order`, {"categories":rows, "items":rows2});
  });


  app.post('/order', isAuthenticated, async (req, res) => {
		
    let sql = `SELECT DISTINCT category
              FROM foodItems`;
    let rows = await executeSQL(sql);

    let sql2 = `SELECT *
                FROM foodItems`;
    let rows2 = await executeSQL(sql2);
  

    let snackId = 0;
    let mealId = 0;
    let drinkId = 0;
    let iceId = 0;
    let candyId = 0;
    let foodId = 0;

    snackId = req.body.snacks;
    mealId = req.body.meals;
    drinkId = req.body.drinks;
    iceId = req.body.ices;
    candyId = req.body.candies;

    if (snackId){
      foodId = snackId;
    }
    else if (mealId){
      foodId = mealId;
    }
    else if (drinkId){
      foodId = drinkId;
    }
    else if (iceId){
      foodId = iceId;
    }
    else if (candyId){
      foodId = candyId;
    }

    let customerId = req.session.customerId;
 
    let sql3 = `INSERT INTO cart (customerId, foodId)
               VALUES(?, ?)`;
    let params = [customerId, foodId];
    // console.log(params);
		let rows3 = await executeSQL(sql3, params);

		res.render (`order`, {"categories":rows, "items":rows2});

  });


  app.get('/profile', isAuthenticated, async (req, res) => {
    let userId = req.session.customerId;
    // console.log("Current Customer ID at get profile:: " + userId);

    let sql = `SELECT *
              FROM customers
              WHERE customerId = ?`;
		let params = [userId]
    let rows = await executeSQL(sql, params);

 
    res.render('profile', {"userInfo":rows});
  })

  app.post('/profile', isAuthenticated, async(req, res) => {

    let fName = req.body.firstName;
		let lName = req.body.lastName;
		let favFood = req.body.favoriteFood;
		let username = req.body.username;	
    let passwordPlain = req.body.passwordPlain;

    let profilePic = req.body.profilePicture;

    if (!profilePic){
      let defaultProfilePic = "https://riverlegacy.org/wp-content/uploads/2021/07/blank-profile-photo.jpeg";

      profilePic = defaultProfilePic;
    }
		
		hashedPass = await bcrypt.hash(passwordPlain, 10);
    password = hashedPass;
    
    let userId = req.session.customerId;
    // console.log("Current Customer ID at post profile:: " + userId);

    // userId = 3;
    let sql = `UPDATE customers
                SET firstName = ?, 
                lastName = ?, 
                favoriteFood = ?, 
                username = ?, 
                passwordPlain = ?, 
                password = ?,
                profilePicture = ?
                WHERE customerId = ${userId}`

    let params = [fName, lName, favFood, username, passwordPlain, password, profilePic];
    let rows = await executeSQL(sql, params);

    sql2 = `SELECT *
              FROM customers
              WHERE customerId = ?`;
		params2 = [userId]
    rows2 = await executeSQL(sql2, params2);

    res.render('profile', {"userInfo":rows2, "message": "Account has been updated"});
  })

	app.get('/logout', (req, res) => {
		// console.log("logging out");
		req.session.authenticated = false;
		req.session.destroy();
		res.redirect('/');
	});


	//functions
	function isAuthenticated(req,res,next){
		// console.log("is authenticated")
		if (!req.session.authenticated) {
				// console.log("not allowed :(");
				res.redirect("/");
		} else {
				// console.log("allowed :)");
				next();
		}
	}

  app.get("/dbTest", async function(req, res){
		let sql = "SELECT CURDATE()";
		let rows = await executeSQL(sql);
		res.send(rows);
	});//dbTest

	async function executeSQL(sql, params){
		return new Promise (function (resolve, reject) {
		pool.query(sql, params, function (err, rows, fields) {
		if (err) throw err;
		   resolve(rows);
		});
		});
	}//executeSQL
	//values in red must be updated
	function dbConnection(){
	   const pool  = mysql.createPool({
	      connectionLimit: 10,
	      host: "x8autxobia7sgh74.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
	      user: "acqxvlwpqy2p25a4",
	      password: "hevanaalkmhmblyg",
	      database: "c93vx3nnkok62ztd"
	   }); 
	   return pool;
	} //dbConnection
	//start server
	app.listen(3000, () => {
	console.log("Expresss server running...")
} )
