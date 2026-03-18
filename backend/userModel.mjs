import mongoose from 'mongoose';
import argon2 from 'argon2';

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// never return passwordHash in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);

async function createUser(firstName, lastName, email, password) {
  const passwordHash = await argon2.hash(password);
  const user = new User({ firstName, lastName, email, passwordHash });
  return user.save();
}

async function findUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase().trim() }).exec();
}

async function verifyPassword(user, password) {
  return argon2.verify(user.passwordHash, password);
}

export { User, createUser, findUserByEmail, verifyPassword };
