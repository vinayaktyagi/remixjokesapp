import {db} from "~/utils/db.server";
import bcrypt from "bcryptjs";
import {redirect , createCookieSessionStorage} from "@remix-run/node"

type LoginForm = {
    username:string, 
    password:string
}
export async function login({username,password}:LoginForm){
    // query Prisma for a user with the username
    const user = await db.user.findUnique({where:{username}});
    //if there is no user, return null
    if(!user){
        return null;
    }
    //use bcrypt.compare to compare the given password to the
    //user's passwordHash
    const valid = await bcrypt.compare(password,user.passwordHash);
    //if the passswords don't match, return null
    if(!valid){ return null;}
    //if the passwords match, return the user
    return {id:user.id,username};
}
// type UserSession={
//     userId:string,
//     redirectRoute:string
// }
const sessionSecret = process.env.SESSION_SECRET;
if(!sessionSecret){
    throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
    cookie:{
        name:"RJ_session",
        secure:true,
        secrets:[sessionSecret],
        sameSite:"lax",
        path:"/",
        maxAge:60 * 60 * 24 * 30,
        httpOnly:true
    }
});

export async function createUserSession(userId:string,redirectTo:string){
    const session = await storage.getSession();
    session.set("userId",userId);
    return redirect(redirectTo,{
        headers:{
            "Set-Cookie":await storage.commitSession(session)
        }
    });
}
