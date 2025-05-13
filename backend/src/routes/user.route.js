const express = require("express");
const router = express.Router();
const UserModel = require('../models/user.model'); // Add this line
const {
  getAllUser,
  editUser,
  deleteUser,
  updateProfile,
} = require("../controller/user.controller");
const userAuth = require("../middleware/userAuth");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/multer");
const extractUserId = require("../middleware/extractUserId");
// Admin

router.get("/admin/getAllUser", userAuth, authorizeRoles("admin"), getAllUser);

router.put("/admin/editUser", userAuth, authorizeRoles("admin"), editUser);

router.delete(
  "/admin/deleteUser",
  userAuth,
  authorizeRoles("admin"),
  deleteUser
);

// Organizer and Admin

// everyone

router.put(
  "/update-profile",
  extractUserId,
  upload.single("profilePic"),
  userAuth,
  authorizeRoles("user", "admin", "organizer"),
  updateProfile
);

router.get("/me", userAuth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select(
      "-password -verifyOTP -resetOTP"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
