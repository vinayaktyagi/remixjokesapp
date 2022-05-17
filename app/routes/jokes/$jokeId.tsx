import { json, LoaderFunction } from "@remix-run/node"; 
import {db} from "~/utils/db.server";
import { Link, useLoaderData, useParams } from "@remix-run/react";

export const loader: LoaderFunction = async ({params}) => {
  const {jokeId} = params;
  const joke = await db.joke.findUnique({where:{id:jokeId}});
  return json(joke);
}

export default function JokeRoute() {
  const joke = useLoaderData();
    return (
      <div>
        <p>Here's your hilarious joke:</p>
        <p>{joke.content}</p>
        <Link to=".">{joke.name} Permalink</Link>
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
