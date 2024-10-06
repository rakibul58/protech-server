import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// exporting env variables
export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  default_password: process.env.DEFAULT_PASSWORD,
  base_url: process.env.BASE_URL,
  store_id: process.env.STORE_ID,
  signature_key: process.env.SIGNATURE_KEY,
  sender_email: process.env.SENDER_EMAIL,
  sender_password: process.env.SENDER_APP_PASS,
  // reset_pass_ui_link: 'http://localhost:3000',
  reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
  backend_url: process.env.BACKEND_URL,
};
