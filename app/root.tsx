import { LinksFunction,MetaFunction } from "@remix-run/node";
import { LiveReload, Outlet ,Links,useCatch,Meta} from "@remix-run/react";
import stylesUrl from "~/styles/global.css";
import stylesLargeUrl from "~/styles/global-large.css";
import React from "react";
export const links:LinksFunction=()=>{
  return [{rel:"stylesheet",href:stylesUrl},
  {rel:"stylesheet",href:stylesLargeUrl,media:"(min-width:1024px)"}]

  
}

export const meta :MetaFunction = () => {
  const description = `Learn Remix and laugh at the same time!`;
  return {
    charset: "utf-8",
    description,
    keywords: "Remix,jokes",
    "twitter:image": "https://remix-jokes.lol/social.png",
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": "Remix Jokes",
    "twitter:description": description,
  };
}

function Document({children, title = `Remix: So Great, It's Funny`}:{children:React.ReactNode,title?:string}){
  return (
    <html lang="en">
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <LiveReload />
      </body>
    </html>
  )
}
export default function App(){
  return (
    <Document>
      <Outlet />
    </Document>
  )
}
// export default function App(){
//   return (
//     <html lang="en">
//       <head>
//         <meta charSet="utf-8" />
//         <title>Remix: So Great, It's Funny</title>
//         <Links />
//       </head>
//       <body>
//         <Outlet />
//         <LiveReload />
//       </body>
//     </html>
//   )
// }

export function ErrorBoundary({error}:{error:Error}){
  return (
    <Document title="Uh-oh">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  )
}

export function CatchBoundary(){
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div className="error-container">
        <h1>
          {caught.status}{caught.statusText}
        </h1>
      </div>
    </Document>
  )
}