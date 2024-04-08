export interface UserCredentials {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: 'USER' | 'ADMIN';
}
