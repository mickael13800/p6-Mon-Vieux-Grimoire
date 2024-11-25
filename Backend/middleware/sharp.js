const sharp = require("sharp");
const fs = require("fs");

module.exports = (req, res, next) => {
  if (req.file) {
    console.log(req.file);

    try {
      const newFilename = req.file.filename.replace(/\.[^/.]+$/, ".webp");
      const outputPath = `images/${newFilename}`;

      // Conversion de l'image en format WebP avec qualité paramétrable
      sharp(req.file.path).webp({ quality: 50 }).toFile(outputPath); // Enregistrement du fichier converti

      // Suppression du fichier original
      fs.unlinkSync(req.file.path);

      // Mise à jour de req.file avec le fichier converti
      req.file.path = outputPath;
      req.file.filename = newFilename;
      req.file.mimetype = "image/webp";

      console.log(req.file);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to compress image", error });
    }
  }
  next();
};
