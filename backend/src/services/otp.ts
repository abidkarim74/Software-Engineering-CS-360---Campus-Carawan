import otpGenerator from 'otp-generator';
interface OTP {
  code: string;
  expiresAt: Date;
}
const otpStorage = new Map<string, OTP>();

export const generateOTP = (): string => {
  return otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

export const storeOTP = (email: string): OTP => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 
  
  const otpData: OTP = {
    code: otp,
    expiresAt,
  };

  otpStorage.set(email, otpData);
  return otpData;
};

export const verifyOTP = (email: string, otp: string): boolean => {
  const storedOTP = otpStorage.get(email);

  if (!storedOTP) {
    return false;
  }

  if (storedOTP.code === otp && storedOTP.expiresAt > new Date()) {
    otpStorage.delete(email); 
    return true;
  }

  return false;
};

export const getStoredOTP = (email: string): OTP | undefined => {
  return otpStorage.get(email);
};