import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async ({ params }) => {
  const count = await db.joke.count();
  const randomNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    skip: randomNumber,
    take:1
  });

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