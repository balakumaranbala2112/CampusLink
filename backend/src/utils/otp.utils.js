import bcrypt from "bcryptjs";

//export a random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP before storing in Redis
export const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

// Compare entered OTP with stored hash
export const verifyOTP = async (enteredOTP, hashedOTP) => {
  return bcrypt.compare(enteredOTP, hashedOTP);
};
