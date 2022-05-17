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

export async function register({username,password}:LoginForm){
    const hashedPassword = await bcrypt.hash(password,10);
    const user = await db.user.create({
        data:{
            username,
            passwordHash:hashedPassword
        }
    });
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

function getUserSession(request:Request){
    return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request:Request){
    const session =await getUserSession(request);
    const userId = session.get("userId");
    if(!userId || typeof userId !== "string"){
        return null;
    }

    return userId;
}

export async function requireUserId(request:Request,redirectTo:string = new URL(request.url).pathname){
    const session =await getUserSession(request);
    const userId = session.get("userId");
    if(!userId || typeof userId !== "string"){
        const searchParams = new URLSearchParams([
            ["redirectTo",redirectTo]
        ]);
        throw redirect(`/login/${searchParams}`);
    }

    return userId;
}

export async function getUser(request:Request){
    const userId = await getUserId(request);
    if(typeof userId !== "string"){
        return null;
    }
    try {
        const user = await db.user.findUnique({where:{id:userId},select:{id:true,username:true}});
        return user;
    } catch (error) {
        throw logout(request);
    }
}

export async function logout(request:Request){
    const session = await getUserSession(request);
    return redirect("/login",{
        headers:{
            "Set-Cookie":await storage.destroySession(session)
        }
    });
}