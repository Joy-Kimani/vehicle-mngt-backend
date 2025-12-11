import { type Context } from "hono"
import * as userServices from "./user.service.js";

//get all users
export const getAllUsers = async (c: Context) => {
  try {
    const users = await userServices.getAllUserServices();
    if (users.length === 0) {
      return c.json({ message: "No users found" }, 404);
    }
    return c.json(users, 200); 
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

//get user by user_id
export const getUserById = async (c: Context) => {
    const user_id = parseInt(c.req.param('user_id'))
    try {
        const result = await userServices.getUserByIdService(user_id);
        if (result === null) {
            return c.json({ error: 'User not found' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching user:', error);
        return c.json({ error: 'Failed to fetch user' }, 500);
    }
}

//create user
export const createUser = async(c:Context) => {
    try{
        const body = await c.req.json();
        const {first_name,last_name,email,contact_phone,password,role} = body;

        const existingUser = await userServices.getUserByEmailService(email);
        if (existingUser) {
          return c.json({ error: 'User with this email already exists' }, 400);
        } return c.json({ message: 'User created successfully'}, 201)
    } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}


//update user by user_id
export const updateUser = async (c: Context) => {
    try {
        const user_id = parseInt(c.req.param('user_id'))
        const body = await c.req.json()

        //check if user exists
        const checkExists = await userServices.getUserByIdService(user_id);
        if (checkExists === null) {
            return c.json({ error: 'User not found' }, 404);
        }
        const result = await userServices.updateUserService(user_id, body.first_name, body.last_name, body.email, body.contact_phone);
        if (result === null) {
            return c.json({ error: 'Failed to update user' }, 404);
        }

        return c.json({ message: 'User updated successfully', updated_user: result }, 200);
    } catch (error) {
        console.error('Error updating user:', error);
        return c.json({ error: 'Failed to update user' }, 500);
    }
}


//delete user by user_id
export const deleteUser = async (c: Context) => {
    const user_id = parseInt(c.req.param('user_id'))
    try {
        //check if user exists
        const check = await userServices.getUserByIdService(user_id);
        if (check === null) {
            return c.json({ error: 'User not found' }, 404);
        }

        //delete user if exists
        const result = await userServices.deleteUserService(user_id);
        if (result === null) {
            return c.json({ error: 'Failed to delete user' }, 404);
        }

        return c.json({ message: 'User deleted successfully', deleted_user: result }, 200);
    } catch (error) {
        console.error('Error deleting user:', error);
        return c.json({ error: 'Failed to delete user' }, 500);
    }
}

export const updateUserRole = async (c: Context) => {
  const user_id = Number(c.req.param("user_id"));
  const { role } = await c.req.json();

  if (!role) {
    return c.json({ error: "Role is required" }, 400);
  }

  await userServices.updateUserRoleService(user_id, role);
  return c.json({ message: "User role updated successfully" });
};

export const toggleUserStatus = async (c: Context) => {
  const user_id = Number(c.req.param("user_id"));
  await userServices.toggleUserStatusService(user_id);
  return c.json({ message: "User status updated" });
};