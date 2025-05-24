const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = await User.create({ email, password, name });
    
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
