import { Outlet } from "@remix-run/react";

export default function index() {
  return (
    <div>
      <h1>Hello</h1>
      <Outlet />
    </div>
  );
}
