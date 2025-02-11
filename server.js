const express = require('express');
const exphbs = require('express-handlebars'); // updated to 6.0.X
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // Importer mysql2
const path = require('path');

require('dotenv').config();

const app = express();
const port =process.env.PORT || 9999;


app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(express.static('public'));

// Middleware
// app.use(cors()); // Permet au frontend d'accéder au backend
app.use(bodyParser.json());

const handlebars = exphbs.create({ extname: '.hbs',});
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

// Créer une connexion à la base de données MySQL
const db = mysql.createConnection({
    host: 'localhost',       
    user: 'root',                
    password: '',                
    database: 'myhealthtrack'     
});

// Vérifier la connexion
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});
app.get('/',(req,res) => {
    res.render('home');
});
app.get('/login', (req, res) => {
    res.render('login');  // Affiche la vue login.hbs
  });
  app.get('/sign-up', (req, res) => {
    res.render('sign-up');  // Affiche la vue login.hbs
  });
app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Erreur de la requête :', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
        }
        res.json(results); // Retourner les utilisateurs sous forme de JSON
    });
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});
