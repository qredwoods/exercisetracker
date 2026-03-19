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
  ageConfirmed: {
    type: Boolean,
    required: true,
  },
  ageConfirmedAt: {
    type: Date,
    required: true,
  },
  isDemo: {
    type: Boolean,
    default: false,
  },
  demoExpiresAt: {
    type: Date,
    sparse: true,
    index: { expires: 0 },
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
  const user = new User({
    firstName, lastName, email, passwordHash,
    ageConfirmed: true,
    ageConfirmedAt: new Date(),
  });
  return user.save();
}

async function findUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase().trim() }).exec();
}

async function verifyPassword(user, password) {
  return argon2.verify(user.passwordHash, password);
}

export { User, createUser, findUserByEmail, verifyPassword };
