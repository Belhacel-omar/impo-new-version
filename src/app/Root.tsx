import { Outlet } from "react-router";

export function Root() {
  return (
    <div className="max-w-md mx-auto min-h-screen">
      <Outlet />
    </div>
  );
}