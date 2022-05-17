import type {LinksFunction} from "@remix-run/node";
import {json,redirect} from "@remix-run/node";
import type {ActionFunction} from "@remix-run/node";
import {Link,useActionData,useSearchParams} from "@remix-run/react";
import {db} from "~/utils/db.server";
import stylesUrl from "~/styles/login.css";
import {login,createUserSession,register} from "~/utils/session.server";

export const links:LinksFunction=()=>{
    return [{rel:"stylesheet",href:stylesUrl}];
}

function validateUsername(username:string){
    if(typeof username !== "string" || username.length < 3){
        return "Username must be at least 3 characters long";
    }
}

function validatePassword(password:string){
    if(typeof password !== "string" || password.length < 6){
        return "Password must be at least 6 characters long";
    }
}

function validateUrl(url:any){
    console.log(url);
    let urls = ["/jokes", "/", "https://remix.run"];
    if (urls.includes(url)) {
        return url;
    }
    return "/jokes";
}

type ActionData = {
    formError?: string,
    fieldErrors?:{
        username:string|undefined,
        password: string|undefined,
    },
    fields?:{
        loginType:string,
        username:string,
        password:string
    }
};
const badRequest = (data:ActionData) => {
    return json(data, {status:400});
}
export const action:ActionFunction = async ({request}) => {
    const form =await request.formData();
    const username = form.get("username");
    const password = form.get("password");
    const loginType = form.get("loginType");
    const redirectTo = validateUrl(
        form.get("redirectTo") || "/jokes"
    );
    if (
        typeof loginType !== "string" ||
        typeof username !== "string" ||
        typeof password !== "string" ||
        typeof redirectTo !== "string"
      ) {
        return badRequest({
          formError: `Form not submitted correctly.`,
        });
    }
    if(typeof username !== "string" || typeof password !== "string"){
        return badRequest({formError:"Form not submitted correctly"});
    }
    const fieldErrors = {username:validateUsername(username),password:validatePassword(password)};
    const fields = {loginType,username, password};
    if(Object.values(fieldErrors).some(Boolean)){
        return badRequest({fieldErrors,fields});
    }
    
    switch(loginType){
        case "login":{
            const user= await login({username,password});
            console.log({user});
            if(!user){ 

                return badRequest({
                    fields,
                    formError:"Username/Password combination is incorrect",
                });
            }

            return createUserSession(user.id,redirectTo);
        }
        case "register":{
            const userExists = await db.user.findFirst({
                where:{username}
            });
            if(userExists){
                return badRequest({
                    fields,
                    formError:"User ${username} already exists"
                });
            }
           const user =await register({username,password});
           if(!user){ 
               return badRequest({fields, formError:"Something went wrong in the creation of new user"})
        }
           return createUserSession(user.id,redirectTo);
        }
        default :{
            return badRequest({
                fields,
                formError:"Login type invalid"
            })
        }
    }
}

export default function Login(){
    const [searchParams ] = useSearchParams();
    const actionData = useActionData<ActionData>();
    return (
        <div className="container">
            <div className="content" data-light="">
                <h1>Login</h1>
                <form action="" method="post">
                    <input type="hidden" name="redirectTo" value={searchParams.get("redirectTo") ?? undefined}/>
                    <fieldset>
                        <legend className="sr-only">Login or Register?</legend>
                        <label>
                        <input
                            type="radio"
                            name="loginType"
                            value="login"
                            defaultChecked={
                                !actionData?.fields?.loginType||
                                actionData?.fields?.loginType === "login"
                            }
                        />{" "}
                        Login
                        </label>
                        <label>
                        <input
                            type="radio"
                            name="loginType"
                            value="register"
                            defaultChecked={
                                actionData?.fields?.loginType ==="register"
                            }
                        />{" "}
                        Register
                        </label>
                    </fieldset>
                    <div>
                        <label htmlFor="username-input">Username</label>
                        <input
                        type="text"
                        id="username-input"
                        name="username"
                        defaultValue={actionData?.fields?.username}
                        aria-invalid={Boolean(actionData?.fieldErrors?.username)}
                        aria-errormessage = {
                            actionData?.fieldErrors?.username ? "username-error":undefined
                        }
                        />
                        {
                            actionData?.fieldErrors?.username ? (
                                <p className="form-validation-error" role="alert"
                                 id="username-error"
                                >
                                    {actionData.fieldErrors.username}
                                </p>
                            ):null
                        }
                    </div>
                    <div>
                        <label htmlFor="password-input">Password</label>
                        <input
                        id="password-input"
                        name="password"
                        type="password"
                        />
                    </div>
                    <button type="submit" className="button">
                        Submit
                    </button>
                </form>
            </div>
            <div className="links">
                <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/jokes">Jokes</Link>
                </li>
                </ul>
            </div>
        </div>
    )
}