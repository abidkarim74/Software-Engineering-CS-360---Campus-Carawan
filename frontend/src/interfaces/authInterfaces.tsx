export interface AuthUser {
  id: string,
  username: string,
  fullname: string
  profilePic:string
}

export interface RegistrationUser {
  username: string,
  fullname: string,
  password: string,
  gender: string,
  email:string
  
}