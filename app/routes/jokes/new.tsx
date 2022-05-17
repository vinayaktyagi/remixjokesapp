import type { ActionFunction } from "@remix-run/node";
import { json,redirect } from "@remix-run/node";
import { Link, useActionData,useCatch } from "@remix-run/react";
import {db} from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
// interface MessageObject = {
//   name_message: string || undefined,
//   content_message: string || undefined,
// }

function validateName(name:string){
  if(name.length < 3){
    return "Name must be at least 3 characters long";
  
  }
}

function validateContent(content:string){
  if(content.length < 10){
    return "Content must be at least 10 characters long";
  }
}

type ActionData = {
  formError?: string,
  fieldErrors?:{
    name:string|undefined,
    content: string|undefined,
  },
  fields?:{
    name:string,
    content:string
  }
};

const badRequest = (data:ActionData) => {
  return json(data, {status:400});
}
export const action:ActionFunction = async ({request}) => {
  const userId = await requireUserId(request);
  if(!userId){
    throw new Response("Unathorized access",{
      status:401
    });

    return json({});
  }
  const form =await request.formData();
  const name = form.get("name");
  const content = form.get("content");
  if(typeof name !== "string" || typeof content !== "string"){
    return badRequest({formError:"Form not submitted correctly"});
  }
  // const messageObj ={}
  // if(name.length < 3 ){
  //   messageObj.name_message = "Name must be at least 3 characters long"
  // }
  // if( content.length < 10){
  //   messageObj.content_message: "content must be at least 10 characters long"};
  // }
  const fieldErrors = {name:validateName(name),content:validateContent(content)};
  const fields = {name, content};
  if(Object.values(fieldErrors).some(Boolean)){
    // console.log({fieldErrors,fields});
    return badRequest({fieldErrors,fields});
  }
  const joke = await db.joke.create({
    data:{...fields, jokesterId:userId}
  });
  // if(!joke){

  // }
  return redirect(`/jokes/${joke.id}`);
}

export default function NewJokeRoute() {
  const data = useActionData<ActionData>();
    return (
      <div>
        <p>Add your own hilarious joke</p>
        <form method="post">
          <div>
            <label>
              Name: <input type="text" name="name" defaultValue={data?.fields?.name} 
              aria-invalid={Boolean(data?.fieldErrors?.name || undefined)}
              aria-errormessage={data?.fieldErrors?.name ? "name-error" : undefined}/>
            </label>
            {/* <label htmlFor="name" >{data && data.name_message ? data.name_message : ""}</label> */}
            {
              data?.fieldErrors?.name ? (<p role="alert" className="form-validation-error" id="name-error">{data.fieldErrors.name}</p>) : null
            }
          </div>
          <div>
            <label>
              Content: <textarea name="content" defaultValue={data?.fields?.content} 
              aria-invalid={Boolean(data?.fieldErrors?.content || undefined)}
              aria-errormessage={data?.fieldErrors?.content ? "content-error" : undefined}
              />
            </label>
            {/* <label htmlFor="content" >{data && data.content_message ? data.content_message : ""}</label> */}
            {
              data?.fieldErrors?.content ? (<p role="alert"  className="form-validation-error" id="content-error">{data.fieldErrors.content}</p>) : null
            }
          </div>
          <div>
            {
              data?.formError ? (<p role="alert" className="form-validation-error">{data.formError}</p>) : null
            }
            <button type="submit" className="button">
              Add
            </button>
          </div>
        </form>
      </div>
    );
  }

export function ErrorBoundary(){
  return (
    <div className="error-container">
      Something unexpected happened, sorry about that.
    </div>
  )
}

export function CatchBoundary(){
  const caught = useCatch();

  if(caught.status === 401){
    return (
      <div className="error-container">
        <p>You must be logged in to create joke</p>
        <Link to="/login">Login</Link>
      </div>
    )
  }
}