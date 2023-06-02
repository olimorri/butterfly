import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";
import { Cog8ToothIcon, HomeIcon, UserIcon } from "@heroicons/react/24/outline";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Notes",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="box-border flex h-full flex-row bg-slate-50 font-sans text-slate-800">
        <div className="py-10 px-5">
          <Link className="rounded p-3" to="/dashboard">
            <HomeIcon className="inline-block h-7 w-7  hover:text-purple-700 " />
          </Link>
          <div className="p-3">
            <UserIcon className="inline-block h-7 w-7 hover:text-purple-700 " />
          </div>
          <div className="p-3">
            <Cog8ToothIcon className="inline-block h-7 w-7 hover:text-purple-700 " />
          </div>
        </div>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
