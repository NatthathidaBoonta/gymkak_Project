const express = require("express");
const { estimateMealNutrition } = require("../controllers/aiController");

const router = express.Router();

router.post("/meal-estimate", estimateMealNutrition);

module.exports = router;
