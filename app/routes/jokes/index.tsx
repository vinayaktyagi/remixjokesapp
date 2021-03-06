import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData,useCatch, Link } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async ({ params }) => {
  const count = await db.joke.count();
  const randomNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    skip: randomNumber,
    take:1
  });
  if(!randomJoke){
    throw new Response("No random joke found!",{
      status:404
    });
  }
  return json(randomJoke);
}

export default function JokesIndexRoute(){
  const data = useLoaderData();
    return (
        <div>
          <p>Here's a random joke:</p>
          <p>
            {data.content}
          </p>
          <div>
            <Link reloadDocument to="/jokes.rss">Get RSS feed</Link>
          </div>
        </div>
    );
}

export function ErrorBoundary(){
  return (
    <div className="error-container">
      I did a whoopsie!
    </div>
  )
}

export function CatchBoundary(){
  const caught = useCatch();

  if(caught.status === 404){
    return (
      <div className="error-container">
        There is no joke to display
      </div>
    )
  }

  throw new Error(`Unhandled Error: ${caught.status}`);
}