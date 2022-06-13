const jwt = require('jsonwebtoken');
const {
    SECRET
} = process.env;

module.exports = (req, res, next) => {
    return next();
    try {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({ errorMessage: 'No token provided'});    
        }
        token = token.split(' ').slice(-1)[0];
        const { type: tokenType, email: tokenUser, id: tokenId } = jwt.decode(token);
        Object.assign(req, { tokenId, tokenType, tokenUser });
        const decoded = jwt.verify(token, SECRET);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).send({ errorMessage: 'Auth failed: ' + error.message});
    }
}
