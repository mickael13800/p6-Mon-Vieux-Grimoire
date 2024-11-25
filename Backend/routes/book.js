const express = require("express");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const sharp = require("../middleware/sharp");
const router = express.Router();

const bookCtrl = require("../controllers/book");

router.post("/", auth, sharp, multer, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.get("/:id", bookCtrl.getOneBook);
router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.getBestRatedBooks);

module.exports = router;
