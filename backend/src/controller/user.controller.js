const UserModel = require('../models/user.model')
const getAllUser = async (req, res) => {

    try {
        const user = await UserModel.find();
        if (!user) {
            return res.status(404).json({message: "No user found"})
        }
        res.status(200).json({message: "All users", user})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }
}

const editUser = async (req, res) => {
    const { userIdfindingId, name, email, role, profilePicture, phone } = req.body;

    try {
        if (!userIdfindingId) {
            return res.status(400).json({ 
                success: false, 
                message: "User ID is required" 
            });
        }

        const updates = {};
        
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (role !== undefined) updates.role = role;
        if (profilePicture !== undefined) updates.profilePicture = profilePicture;
        if (phone !== undefined) updates.phone = phone;

        const updatedUser = await UserModel.findByIdAndUpdate(
            userIdfindingId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password -verifyOTP -resetOTP -__v');

        if (!updatedUser) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        res.json({ 
            success: true, 
            message: "User updated successfully",
            user: updatedUser 
        });

    } catch (error) {
        console.error("Admin edit user error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to update user" 
        });
    }
};

const deleteUser = async (req, res) => {
    const { userIdfindingId } = req.body;
    try {
        await UserModel.findByIdAndDelete(userIdfindingId);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const updateProfile = async (req, res) => {
    try {
        const { userId, profilePic } = req.body;
        console.log("User ID:", userId);
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!profilePic) {
            return res.status(400).json({ message: "Profile picture is required" });
        }

        // upload to cloudinary

        const updatedUser = await UserModel.findByIdAndUpdate(userId, {profilePic: profilePic }, {new:true})
        res.status(200).json(updatedUser)
    } catch (error) {
        
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports ={getAllUser, editUser, deleteUser, updateProfile}