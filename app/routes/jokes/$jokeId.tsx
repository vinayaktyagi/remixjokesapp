import type {Joke} from "@prisma/client";
import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
import{json,redirect} from "@remix-run/node"; 
import {db} from "~/utils/db.server";
import { Link, useLoaderData, useParams, useCatch, Form } from "@remix-run/react";
import {getUserId, requireUserId } from "~/utils/session.server";

type LoaderData = {
  joke:Joke,
  isOwner:boolean
}
export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: "No joke",
      description: "No joke found",
    };
  }
  return {
    title: `"${data.joke.name}" joke`,
    description: `Enjoy the "${data.joke.name}" joke and much more`,
  };
};
export const loader: LoaderFunction = async ({request,params}) => {
  const {jokeId} = params;
  const userId = await getUserId(request);
  const joke = await db.joke.findUnique({where:{id:jokeId}});
  if(!joke){ 
    throw new Response("What a joke!, not found",{
      status:404
    });
  }
  // console.log(joke);
  const data:LoaderData = {joke, isOwner: joke.jokesterId === userId};
  console.log(data);
  return json(data);
}

export const action:ActionFunction = async ({request,params}) => {
  const userId = await requireUserId(request);
  
  const form =await request.formData();
  const intent = form.get("_method");
  if(intent !== "delete"){
    throw new Response(`The method ${intent} is not supported`,{status:400});
  }
  const joke =await db.joke.findUnique({where:{id:params.jokeId}});
  if(!joke){
    throw new Response("Can't delete what doesn't exist!",{status:404});
  }
  if(userId !== joke.jokesterId){
    throw new Response("You can't delete jokes you didn't create!",{status:401});
  }

  await db.joke.delete({where:{id:params.jokeId}});
  return redirect("/jokes");
}

export default function JokeRoute() {
  const data = useLoaderData();
    return (
      <div>
        <p>Here's your hilarious joke:</p>
        <p>{data.joke.content}</p>
        <Link to=".">{data.joke.name} Permalink</Link>
        {data.isOwner && (
          <Form method="post">
            <input type="hidden" name="_method" value="delete" />
            <button type="submit">Delete</button>
          </Form>
        )}
        
      </div>
    );
}

export function ErrorBoundary(){
  const {jokeId} = useParams();
  return (
    <div className="error-container">
      {`There was an error loading joke by the id ${jokeId}. Sorry.`}
    </div>
  )
}

export function CatchBoundary(){
  const caught = useCatch();
  const params = useParams();
  switch (caught.status) {
    case 400:{
      return (
        <div className="error-container">
          What you're trying to do is not allowed.
        </div>
      )
    }
    case 404:{
      return (
        <div className="error-container">
          Huh? what the heck is ${params.jokeId}
        </div>
      )
    }
    case 401:{
      return (
        <div className="error-container">
          Sorry, but {params.jokeId} is not your joke.
        </div>
      );
    }
    default:{
      throw new Error(`Unhandled Error: ${caught.status}`);
    }
      
  }

  if(caught.status === 404){
    
  }

  throw new Error(`Unhandled Error: ${caught.status}`);

}