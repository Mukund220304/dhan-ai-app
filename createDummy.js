const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const email = 'dummy@dhanai.com';
  const password = 'password123';
  
  await User.deleteOne({ email });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.create({
    name: 'Dummy User',
    email,
    password: hashedPassword,
    isEmailVerified: true
  });
  console.log('Dummy user created: dummy@dhanai.com / password123');
  process.exit(0);
}).catch(console.error);
