const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

// Configuration de Multer avec memoryStorage
const storage = multer.memoryStorage();
const multerMiddleware = multer({ storage }).single("image");

// Middleware combiné avec Sharp
module.exports = async (req, res, next) => {
  multerMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Multer error", error: err });
    }

    if (req.file) {
      try {
        const name = req.file.originalname
          .split(" ")
          .join("_")
          .replace(/\.[^/.]+$/, "");
        const newFilename = `${name}_${Date.now()}.webp`;
        const outputPath = path.join(__dirname, "../images", newFilename);

        console.log("Traitement de l'image avec Sharp...");

        // Conversion du buffer en WebP avec Sharp
        await sharp(req.file.buffer).webp({ quality: 50 }).toFile(outputPath);

        console.log("Image convertie et enregistrée :", outputPath);

        // Mise à jour de req.file avec les nouvelles informations
        req.file.path = outputPath;
        req.file.filename = newFilename;
        req.file.mimetype = "image/webp";

        next(); // Passer au middleware suivant
      } catch (sharpErr) {
        console.error("Erreur Sharp :", sharpErr);
        return res.status(500).json({
          message: "Failed to process image",
          error: sharpErr,
        });
      }
    } else {
      next(); // Aucun fichier, passer au middleware suivant
    }
  });
};
