export interface User {
  id: number;
  email: string;
  password: string;
  createdAt: Date;
}

export interface UserRegistrationData {
  email: string;
  password: string;
}

export interface UserLoginData {
  email: string;
  password: string;
} 
