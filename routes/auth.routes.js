

import signup,{login,refreshTokenController} from "../controller/auth.controller.js";
import  verifyRefreshToken from "../middleware/auth.js";
import {Router} from 'express'
import RefreshToken from "../model/refreshToken.model.js";
import crypto from 'crypto';

const authRouter=Router()

authRouter.post('/register',signup)

authRouter.post('/login',login)

authRouter.post('/refresh',verifyRefreshToken,refreshTokenController)


export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};


authRouter.post('/logout',verifyRefreshToken,async (req,res)=>{

     console.log("inside /logout controller ")
     
     const rawRefreshToken = req.refreshToken; // set by verifyRefreshToken middleware

      const tokenHash = hashToken(rawRefreshToken);
     
       console.log("inside /logout controller before delete")
       const existingTokenDoc = await RefreshToken.deleteOne({ tokenHash });

         console.log("inside /logout controller after delete")
  res.cookie('refresh_token',"")


  return res.status(200).json({ message: 'user logged out successfully.' });

})

export default authRouter