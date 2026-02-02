import jwt from 'jsonwebtoken';


export const accesstoken =(payload)=>{
    return jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:"2m"}
        )
    }
export const refreshtoken =(payload)=>{
    return jwt.sign(
             payload,
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn:"7d"}
        )
    }