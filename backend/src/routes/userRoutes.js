const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getProfile, updateProfile, generateAiSummary } = require("../controllers/userController");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/ai-summary", protect, generateAiSummary);

module.exports = router;
