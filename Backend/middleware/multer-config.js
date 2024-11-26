const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Configuration de Multer
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images"); // Dossier temporaire
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

const multerMiddleware = multer({ storage: storage }).single("image");

// Middleware combiné avec Sharp
module.exports = (req, res, next) => {
  multerMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Multer error", error: err });
    }

    if (req.file) {
      try {
        const newFilename = req.file.filename.replace(/\.[^/.]+$/, ".webp");
        const outputPath = path.join(__dirname, "../images", newFilename);

        console.log("Traitement de l'image avec Sharp...");

        // Conversion en WebP
        await sharp(req.file.path).webp({ quality: 50 }).toFile(outputPath);

        // Suppression de l'image originale
        try {
          fs.unlinkSync(req.file.path);
          console.log("Fichier temporaire supprimé :", req.file.path);

          // Mise à jour de req.file
          req.file.path = outputPath;
          req.file.filename = newFilename;
          req.file.mimetype = "image/webp";

          next(); // Passer au middleware suivant
        } catch (unlinkErr) {
          console.error("Erreur lors de la suppression :", unlinkErr);
          return res.status(500).json({
            message: "Failed to delete temporary file",
            error: unlinkErr,
          });
        }
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
