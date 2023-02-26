import { Link, Outlet } from "@remix-run/react";
import { useState } from "react";

export default function Dashboard() {
  const DASHBOARD_BUTTON_OPTIONS = ["dashboard", "meetings", "actions"];

  const [selectedOption, setSelectedOption] = useState(0);

  return (
    <main className="flex h-screen flex-row font-sans">
      <div className=" flex w-1/6 flex-col bg-zinc-100">
        {DASHBOARD_BUTTON_OPTIONS.map((buttonString, index) => (
          <div key={index} className="p-2">
            {selectedOption === index ? (
              <button
                className="w-full rounded bg-slate-200 p-2 text-left capitalize "
                onClick={() => {
                  setSelectedOption(index);
                }}
              >
                {buttonString}
              </button>
            ) : (
              <Link
                className="w-full rounded bg-slate-100 p-2 text-left capitalize  hover:text-indigo-400"
                to={
                  buttonString === "dashboard"
                    ? `/dashboard`
                    : `${buttonString}`
                }
                onClick={() => setSelectedOption(index)}
              >
                {buttonString}
              </Link>
            )}
          </div>
        ))}
      </div>
      <div className="flex-1 bg-white">
        <Outlet />
      </div>
    </main>
  );
}
