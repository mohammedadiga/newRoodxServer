import mongoose, { HydratedDocument, Schema } from 'mongoose';
// Utils
import { compareValue, hashValue } from '@/common/utils/bcrypt';
import { thirtyDaysFromNow } from '@/common/utils/data-time';

const sessionSchema = new Schema<ISession>({
  userAgent: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  expiredAt: { type: Date, required: true, default: thirtyDaysFromNow },
});

const userPreferencesSchema = new Schema<IPreferences>(
  {
    enable2FA: { type: Boolean, default: false },
    emailNotification: { type: Boolean, default: true },
    twoFactorSecret: { type: String, required: false },
  },
  { _id: false }
);

const verificationCodeSchema = new Schema<IVerification>({
  token: { type: String },
  code: { type: String, required: true },
  type: { type: String, required: true },
  expiredAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new Schema<IUser>(
  {
    accountType: {
      type: String,
      enum: ['personal', 'company'], // Account type: user or company
      required: true,
    },
    firstname: {
      type: String,
      required: function () {
        return this.accountType === 'personal'; // firstname required only for users
      },
    },
    lastname: {
      type: String,
      required: function () {
        return this.accountType === 'personal'; // lastname required only for users
      },
    },
    companyname: {
      type: String,
      required: function () {
        return this.accountType === 'company'; // companyname required only for companies
      },
    },
    username: {
      type: String,
      unique: true,
      required: [true, 'Please enter your username'],
    },
    phone: {
      type: String,
      unique: true,
      required: [
        function () {
          return !this.email; // Phone is required if email is not provided
        },
        'Please enter your phone number', // Error if no phone number provided
      ],
    },
    email: {
      type: String,
      unique: true,
      required: [
        function () {
          return !this.phone; // Email is required if phone is not provided
        },
        'Please enter your email', // Error if no email provided
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, 'Password must be at least 6 characters'], // Password should be at least 6 chars
    },
    cover: { type: String },
    avatar: { type: String },
    role: { type: String, default: 'user' }, // Default role is user
    birthday: {
      type: Date,
      required: function () {
        return this.accountType === 'personal'; // Birthday required only for users
      },
    },
    date: {
      type: Date,
      required: function () {
        return this.accountType === 'company'; // Date required only for companies
      },
    },
    session: [sessionSchema],
    userPreferences: { type: userPreferencesSchema, default: {} },
    verifications: [verificationCodeSchema],
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Middleware to handle empty fields for unique constraints 🚧
userSchema.pre('save', async function (this: HydratedDocument<IUser>, next) {
  if (this.email) {
    this.email = this.email.toLowerCase(); // Ensure email is always in lowercase
  }

  if (!this.isModified('password')) {
    return next(); // Skip if password hasn't been modified
  }

  // Check for unique phone number if email isn't provided
  if (!this.email) {
    const phoneExists = await mongoose.models.User.findOne({ phone: this.phone });
    if (phoneExists) {
      const error = new Error('Phone number already exists');
      next(error); // Error if phone number already exists
      return;
    }
  }

  // Check for unique email if phone isn't provided
  if (!this.phone) {
    const emailExists = await mongoose.models.User.findOne({ email: this.email });
    if (emailExists) {
      const error = new Error('Email already exists');
      next(error); // Error if email already exists
      return;
    }
  }

  this.password = await hashValue(this.password); // Hash the password before saving 🔒
  next(); // Proceed to save the document
});

// --- Methods ---
// Compare password 🔑
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return compareValue(enteredPassword, this.password); // Compare entered password with stored hash
};

// --- Hide sensitive fields in JSON responses ---
userSchema.set('toJSON', {
  transform(doc, ret) {
    const userDoc = doc as unknown as IUser;

    // Remove sensitive fields
    delete ret.password;
    delete ret.userPreferences?.twoFactorSecret;
    delete ret.verifications;
    delete ret.session;

    // If the email is invalid, add original email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ret.email) && userDoc.email) {
      delete ret.email; // Remove the invalid one
    }

    // If the phone is not valid, add original phone
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(ret.phone) && userDoc.phone) {
      delete ret.phone; // Remove the invalid one
    }

    return ret;
  },
});

function getModifiedSessions(sessions: HydratedDocument<ISession>[], sessionId: ISession['_id']): Array<ISession & { isCurrent?: boolean }> {
  return sessions.map((session) => ({
    ...session.toObject(),
    ...(session._id.toString() === sessionId && { isCurrent: true }),
  }));
}

// --- Model ---
const UserModel = mongoose.model<IUser>('User', userSchema);
export { getModifiedSessions };
export default UserModel;
