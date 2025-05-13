const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authorized, please login" 
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ 
                success: false, 
                message: "Server configuration error" 
            });
        }

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecode.id) {
            req.body.userId = tokenDecode.id;
            req.user = tokenDecode;
            console.log("User role:", tokenDecode.role);
            next();
        } else {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid authentication token" 
            });
        }
    } catch (error) {
        console.log("Auth error:", error.message);
        return res.status(401).json({ 
            success: false, 
            message: "Authentication failed, please login again" 
        });
    }
}

module.exports = userAuth;