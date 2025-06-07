interface ISession {
  _id: Types.ObjectId;
  userAgent: string;
  createdAt: Date;
  expiredAt: Date;
}

interface IPreferences {
  enable2FA: boolean;
  emailNotification: boolean;
  twoFactorSecret?: string;
}

interface IVerification {
  token: string;
  code: string;
  type: verificationEnum;
  expiredAt: Date;
  createdAt: Date;
}

interface ILocation {
  ip: string | null; // User's IP address
  country: string; // Country code (e.g. 'US')
  countryName?: string; // Full country name (optional)
  flag: string; // URL of the flag image
  region?: string; // Region or state (optional)
  city?: string; // City name (optional)
  latitude?: number; // Latitude coordinate (optional)
  longitude?: number; // Longitude coordinate (optional)
}

interface IUser {
  _id: Types.ObjectId;
  accountType: 'personal' | 'company';
  firstname: string;
  lastname: string;
  username: string;
  companyname: string;
  phone: string;
  email: string;
  password: string;
  cover?: string;
  avatar?: string;
  comparePassword(password: string): Promise<boolean>;
  role: string;
  date: Date;
  birthday: Date;
  session: ISession[];
  userPreferences: IPreferences;
  verifications: IVerification[];
  location: ILocation;
}
