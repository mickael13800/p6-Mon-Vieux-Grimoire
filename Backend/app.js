require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors"); // Utiliser cors pour gérer les en-têtes
const helmet = require("helmet");
const rateLimit = require("express-rate-limit"); // Importer le package de rate-limiter

//Importation des routes
const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");

//Initialisation de l'application
const app = express();

//Connexion à MongoDB
mongoose
  .connect(process.env.DB_URL, {
    // assure la compatibilité avec les versions récentes de Mongoose
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.error("Connexion à MongoDB échouée :", err));

//Configuration de CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*", // Restreindre les origines en production
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Utilisation de Helmet pour ajouter les en-têtes de sécurité
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, //Permet le partage de ressources entre frontend et backend
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", process.env.SERVER_URL + "/images"],
      },
    },
  })
);

//Middleware pour parser le corps des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

// Configuration du rate-limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: "Trop de requêtes, veuillez réessayer plus tard.", // Message d'erreur
  headers: true, // Ajouter les en-têtes à la réponse
});
// Appliquer le rate-limiter à toutes les requêtes
app.use(limiter);

//Gestion des fichiers statiques
app.use("/images", express.static(path.join(__dirname, "images")));

//Routes principales
app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);

//Exportation de l'application
module.exports = app;
