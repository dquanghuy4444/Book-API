const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User, validate} = require('../models/user');


const addUser = async (req, res, next) => {
    const {error} = validate(req.query);
    // console.log(req)
    if(error) return res.status(422).send(error.details[0].message);

    let user = await User.findOne({email: req.query.email}).exec();
    if(user) return res.status(400).send('User with this email already exist');

    user  = new User(_.pick(req.query, ['name', 'email', 'password']));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.query.password, salt);
    (await user).save();
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
}

module.exports = {
    addUser
}
