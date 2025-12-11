import { getDbPool } from "../database/configDB.js";

interface UserResponse{
    user_id: number;
    first_name: string;
    last_name: string;
    email:string;
    password:string;
    contact_phone: string;
    address?:string;
    role?:string;
}

//get all users
export const getAllUserServices = async (): Promise<UserResponse[]> => {
    const db = getDbPool();
    const result = await db.request()
        .query('SELECT * FROM Users')
    return result.recordset;
}

//get user by user_id
export const getUserByIdService = async (user_id: number): Promise<UserResponse | null> => {
        const db = getDbPool(); 
        const query = 'SELECT * FROM Users WHERE user_id = @user_id';
        const result = await db.request()
            .input('user_id', user_id)
            .query(query);
        return result.recordset[0] || null;
}

//get user by email
export const getUserByEmailService = async (email: string): Promise<UserResponse | null> => {
    const db = getDbPool(); 
    const query = 'SELECT * FROM Users WHERE email = @email';
    const result = await db.request()
        .input('email', email)
        .query(query);
    return result.recordset[0] || null;
}
//create user
export const createUserService = async (first_name: string,last_name: string,email: string,contact_phone: string,password: string,role: string): Promise<UserResponse | null> => {
  const db = getDbPool();
  const query = `
    INSERT INTO Users (first_name, last_name, email, contact_phone, password, role)
    OUTPUT INSERTED.*
    VALUES (@first_name, @last_name, @email, @contact_phone, @password, @role)
  `;

  const result = await db.request()
    .input('first_name', first_name)
    .input('last_name', last_name)
    .input('email', email)
    .input('contact_phone ', contact_phone )
    .input('password', password)
    .input('role', role)
    .query(query);

  return result.recordset[0] || null;
};

//update user by user_id
export const updateUserService = async (user_id:number, first_name:string,last_name:string,email:string,contact_phone:string): Promise<UserResponse | null> => {
        const  db = getDbPool();
        const query = `UPDATE Users SET first_name = @first_name, last_name = @last_name, contact_phone = @contact_phone, email = @email OUTPUT INSERTED.* WHERE user_id = @user_id`;
        const result = await db.request()
            .input('user_id', user_id)
            .input('first_name', first_name)
            .input('last_name', last_name)
            .input('contact_phone', contact_phone)
            .input('email', email)
            .query(query);
        return result.recordset[0] || null;
}

//delete user by user_id
export const deleteUserService = async (user_id:number): Promise<string> => {
        const db = getDbPool(); 
        const query = 'DELETE FROM Users WHERE user_id = @user_id';
        const result = await db.request()
            .input('user_id', user_id)
            .query(query);
        return result.rowsAffected[0] === 1 ? "User deleted successfully " : "Failed to delete user";
}

// Save OTP
export const saveOTPService = async (email: string, otp: string) => {
  const db = getDbPool();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const query = `
    MERGE INTO OTPs AS target
    USING (SELECT @email AS email) AS source
    ON target.email = source.email
    WHEN MATCHED THEN
      UPDATE SET otp = @otp, expires_at = @expires_at
    WHEN NOT MATCHED THEN
      INSERT (email, otp, expires_at)
      VALUES (@email, @otp, @expires_at);
  `;

  await db.request()
    .input("email", email)
    .input("otp", otp)
    .input("expires_at", expiry)
    .query(query);

  return "OTP saved successfully";
};

// Verify OTP
export const verifyOTPService = async (email: string, otp: string) => {
  const db = getDbPool();
  const query = "SELECT otp, expires_at FROM OTPs WHERE email = @email";
  const result = await db.request().input("email", email).query(query);
  const record = result.recordset[0];

  if (!record) return false;

  const isExpired = new Date() > new Date(record.expires_at);
  if (isExpired) return false;

  return record.otp === otp;
};

// Update user password
export const updateUserPasswordService = async (email: string, hashedPassword: string) => {
  const db = getDbPool();
  const query = `
    UPDATE Users
    SET password = @password
    WHERE email = @email
  `;
  await db.request()
    .input("email", email)
    .input("password", hashedPassword)
    .query(query);

  return "Password updated successfully";
};


export const updateUserRoleService = async (user_id: number, role: string) => {
  const db = await getDbPool();
  await db.request()
    .input("user_id",  user_id)
    .input("role",  role)
    .query(`
      UPDATE Users
      SET role = @role, updated_at = GETDATE()
      WHERE user_id = @user_id
    `);
};

// export const toggleUserStatusService = async (user_id: number) => {
//   const db = await getDbPool();
//   await db
//     .request()
//     .input("user_id", user_id)
//     .query(`
//       UPDATE Users
//       SET updated_at = GETDATE()
//       WHERE user_id = @user_id
//     `);
// };
export const toggleUserStatusService = async (user_id: number) => {
  const db = await getDbPool()
  await db.request()
    .input("user_id", user_id)
    .query(`
      UPDATE Users
      SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
          updated_at = GETDATE()
      WHERE user_id = @user_id
    `);
};
