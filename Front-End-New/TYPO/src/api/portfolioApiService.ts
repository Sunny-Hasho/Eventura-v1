// src/api/authService.ts
import axios from 'axios';
import type {User} from '../types/types_definitions.ts';

const API_URL = 'http://your-backend-api.com/auth';

export const login = async (email: string, password: string): Promise<User> => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const signup = async (
    email: string,
    password: string,
    accountType: 'user' | 'serviceProvider'
): Promise<User> => {
  const response = await axios.post(`${API_URL}/signup`, { email, password, accountType });
  return response.data;
};