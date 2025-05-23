const Message = require('../models/message.model');
const User = require('../models/user.model');
const socketModule = require('../config/socket');
const cloudinary = require('../config/cloudinary');

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.body.userId;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password -verifyOTP -resetOTP");

    res.status(200).json({ success: true, users: filteredUsers });
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.body.userId;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    
    const senderId = req.body.userId;
    
    console.log(`Message request: from ${senderId} to ${receiverId}`, { 
      hasText: !!text, 
      hasImage: !!image 
    });
    
    if (!senderId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized. User ID not found in request."
      });
    }
    
    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || "",
      image: image || ""
    });
    
    // Handle image if present
    if (image) {
      try {
        if (image.length > 7 * 1024 * 1024) { // ~5MB after base64 encoding
          return res.status(400).json({
            success: false,
            error: "Image too large. Please use an image smaller than 5MB."
          });
        }
        
        console.log('Uploading image to Cloudinary...');
        
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'chat_images',
          resource_type: 'image',
          timeout: 60000 
        });
        
        console.log('Image uploaded successfully:', uploadResponse.public_id);
        
        newMessage.image = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          error: "Failed to upload image. Please try again."
        });
      }
    }
    
    await newMessage.save();
    console.log('Message saved to database:', newMessage._id);
    
    const messageToReturn = {
      _id: newMessage._id,
      senderId,
      receiverId,
      text: newMessage.text,
      image: newMessage.image,
      createdAt: newMessage.createdAt
    };
    
    const receiverSocketId = socketModule.getReceiverSocketId(receiverId);
    if (receiverSocketId && socketModule.io) {
      console.log(`Emitting message to socket: ${receiverSocketId}`);
      socketModule.io.to(receiverSocketId).emit('newMessage', messageToReturn);
    } else {
      console.log(`Socket not available or receiver ${receiverId} not connected`);
    }
    
    res.status(201).json({
      success: true,
      message: {
        _id: newMessage._id,
        senderId,
        receiverId,
        text: newMessage.text,
        image: newMessage.image,
        createdAt: newMessage.createdAt
      }
    });
    
  } catch (error) {
    console.error("Error in sendMessage controller:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send message. Server error."
    });
  }
};

module.exports = { getUsersForSidebar, getMessages, sendMessage };