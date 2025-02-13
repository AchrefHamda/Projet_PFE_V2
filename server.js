const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // Pour sécuriser les mots de passe
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 9999;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json());

// Setup Handlebars
const handlebars = exphbs.create({ extname: '.hbs' });
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',           // Your MySQL username
    password: '',           // Your MySQL password
    database: 'myhealthtrack'
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});

// Routes
app.get('/', (req, res) => {
    res.render('home');
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', { 
        success: req.query.success === '1' ? 'Votre inscription a été réalisée avec succès. Vous pouvez maintenant vous connecter.' : null,
        error: req.query.error || null
    });
});

// Handle login form submission
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', { error: 'L\'email et le mot de passe sont requis.' });
    }

    // Check if the user exists in the database
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'email:', err);
            return res.render('login', { error: 'Erreur serveur. Veuillez réessayer.' });
        }

        if (results.length === 0) {
            return res.render('login', { error: 'Utilisateur non trouvé.' });
        }

        const user = results[0];

        // Compare the hashed password with the entered password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Erreur lors de la comparaison des mots de passe:', err);
                return res.render('login', { error: 'Erreur serveur. Veuillez réessayer.' });
            }

            if (isMatch) {
                // Successful login, redirect to the dashboard or home page
                res.redirect('/dashboard');
            } else {
                res.render('login', { error: 'Mot de passe incorrect.' });
            }
        });
    });
});

// Sign up page
app.get('/sign-up', (req, res) => {
    res.render('sign-up');
});

app.get('/Admin-space', (req, res) => {
    res.render('Admin-space');
});
app.get('/role-verification', (req, res) => {
    res.render('role-verification');
});
app.get('/sign-up/patient', (req, res) => {
    res.render('patient-signup'); // Page d'inscription pour le patient
  });
  
  app.get('/sign-up/doctor', (req, res) => {
    res.render('doctor-signup'); // Page d'inscription pour le médecin
  });
  
  app.get('/sign-up/pharmacy', (req, res) => {
    res.render('pharmacy-signup'); // Page d'inscription pour la pharmacie
  });

// Handle sign up form submission
app.post('/sign-up', async (req, res) => {
    const { name, email, role, password, confirmPassword } = req.body;

    // Validate required fields
    if (!name || !email || !role || !password || !confirmPassword) {
        return res.render('sign-up', { error: 'Tous les champs sont requis.' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.render('sign-up', { error: 'Les mots de passe ne correspondent pas.' });
    }

    try {
        // Check if email already exists
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Erreur lors de la vérification de l\'email:', err);
                return res.render('sign-up', { error: 'Une erreur est survenue. Veuillez réessayer.' });
            }

            if (results.length > 0) {
                return res.render('sign-up', { error: 'Cet email est déjà utilisé.' });
            }

            // Hash the password before saving it
            try {
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert the new user into the database
                db.query(
                    'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
                    [name, email, role, hashedPassword],
                    (err, result) => {
                        if (err) {
                            console.error('Erreur lors de l\'insertion dans la base de données:', err);
                            return res.render('sign-up', { error: 'Erreur lors de l\'inscription.' });
                        }
                        res.redirect('/login?success=1');
                    }
                );
            } catch (hashError) {
                console.error('Erreur lors du hachage du mot de passe:', hashError);
                res.render('sign-up', { error: 'Une erreur est survenue. Veuillez réessayer.' });
            }
        });
    } catch (error) {
        console.error('Erreur serveur:', error);
        res.render('sign-up', { error: 'Erreur serveur. Veuillez réessayer plus tard.' });
    }
});

// Dashboard or Home page after login
app.get('/dashboard', (req, res) => {
    res.send('Welcome to the Dashboard!');
});

// Start server
app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});
