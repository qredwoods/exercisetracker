import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

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
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = new User({ firstName, lastName, email, passwordHash });
  return user.save();
}

async function findUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase().trim() }).exec();
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}

export { User, createUser, findUserByEmail, verifyPassword };
