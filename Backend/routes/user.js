const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const rateLimit = require("express-rate-limit");

// Limiter le nombre de tentatives de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // autoriser 5 tentatives par adresse IP
  message:
    "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.",
  //Pour activer les en-têtes HTTP qui indiquent le nombre de requêtes restantes
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", userCtrl.signup);
router.post("/login", loginLimiter, userCtrl.login); // Applique la limite de tentatives à la route de connexion

module.exports = router;
