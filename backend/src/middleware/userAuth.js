const jwt = require('jsonwebtoken');


const userAuth = async (req, res, next) => {

    const {token} = req.cookies;

    if (!token) {
        throw new Error("Not Authorized Login Again");
    }
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if(tokenDecode.id) {
            req.body.userId = tokenDecode.id;
            req.user = tokenDecode
            console.log("User role:", tokenDecode.role);
            
        }else{
            throw new Error("Not Authorized Login Again");
        }
        next();
    } catch (error) {
        let message = 'Unknown Error'
        if (error instanceof Error) message = error.message
        console.log(message)
        res.status(500).json({ success: false, message: message })
    }

}

module.exports = userAuth