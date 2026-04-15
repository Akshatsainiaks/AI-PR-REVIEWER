const express = require("express");
const router = express.Router();

const { makeAdmin } = require("../controllers/admin.controller");
const auth = require("../middleware/auth");

// protected route
router.patch("/make-admin/:userId", auth, makeAdmin);

module.exports = router;