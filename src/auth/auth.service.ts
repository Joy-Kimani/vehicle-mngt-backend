import { getDbPool } from "../database/configDB.js";

export interface UserResponse {
    user_id: number;
    first_name: string;
    last_name: string;
    email:string;
    password:string;
    contact_phone: string;
    address?:string;
    role:string;
}

// register user
export const createUserService = async (first_name: string,last_name: string,email: string,contact_phone: string,password: string,role: string): Promise<UserResponse | null> => {
  const db = getDbPool();

  const query = `
    INSERT INTO Users (first_name, last_name, email, contact_phone, password,role)
    OUTPUT INSERTED.*
    VALUES (@first_name, @last_name, @email, @contact_phone, @password, @role)
  `;

  const result = await db.request()
    .input('first_name', first_name)
    .input('last_name', last_name)
    .input('email', email)
    .input('contact_phone', contact_phone)
    .input('password', password)
    .input('role', role)
    .query(query);

  return result.recordset[0] || null;
};

//login
export const loginUserService = async (email: string): Promise<any> => {
  const db = getDbPool();
  const result = await db.request()
    .input('email', email)
    .query('SELECT * FROM Users WHERE email = @email');
  return result.recordset.length > 0 ? result.recordset[0] : null;
};