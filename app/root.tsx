import { LinksFunction } from "@remix-run/node";
import { LiveReload, Outlet ,Links} from "@remix-run/react";
import stylesUrl from "~/styles/global.css";
import stylesLargeUrl from "~/styles/global-large.css";
export const links:LinksFunction=()=>{
  return [{rel:"stylesheet",href:stylesUrl},
  {rel:"stylesheet",href:stylesLargeUrl,media:"(min-width:1024px)"}]

  
}

export default function App(){
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Remix: So Great, It's Funny</title>
        <Links />
      </head>
      <body>
        <Outlet />
        <LiveReload />
      </body>
    </html>
  )
}