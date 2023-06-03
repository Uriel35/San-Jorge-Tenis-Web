const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.roles) return res.status(400).json({ message: 'Req.roles is undefined', from: 'verifyRoles.js', unathorized: true }); // Definido en el verifyJWT

        const rolesArray = [...allowedRoles];
        const result = req.roles.map(role => rolesArray.includes(role)).find(val => val === true);
        if(!result) return res.status(400).json({ message: `Role unathorized`, from: `verifyRoles.js`, unathorized: true }) // Unathorized
        next();
    }
}

module.exports = verifyRoles;