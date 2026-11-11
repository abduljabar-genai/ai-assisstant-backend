

import * as authService from '../services/auth.service.js';

//req: request for user/frontend to send data to server 
//res: response is for server to send data back to frontend 

async function signup(req,res){

    try{
      console.log("controller started")
  const user= await authService.signUpUserService(req.body)

  res.status(201).json({
    message:"user created successfully.",
    data:user
  })

}catch(error)
{
   res.status(400).json({
    message:"Error creating user."+error.message,
  }) 

}


}

async function login(req,res){

    try{
      console.log("controller started")
      const {student,token}= await authService.loginUserService(req.body)


     const {rawRefreshToken,expiresAt}=await authService.saveRefreshTokenToDB(student._id)
     
    res.cookie('refresh_token', rawRefreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      expires: expiresAt,
    });

  res.status(201).json({
    message:"user logged in successfully.",
    data:{token,student}
  })

}catch(error)
{
   res.status(400).json({
    message:"Error logging in student."+error.message,
  }) 

}


}


export const refreshTokenController = async (req, res) => {
  try {
    const rawRefreshToken = req.refreshToken; // set by verifyRefreshToken middleware

    
    const { newAccessToken, newRefreshToken, expiresAt } =
      await authService.rotateRefreshToken(rawRefreshToken);

    // Set updated httpOnly cookie
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.clearCookie('refresh_token');
    return res.status(401).json({ message: error.message || 'Token refresh failed' });
  }
};

export default signup

export {login}