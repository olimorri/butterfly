import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { formatDistance } from "date-fns";

export async function loader() {
  return json([
    {
      id: 1,
      attendee: "Oliver Morrison",
      date: new Date("2023-02-10T09:00Z"),
      actionsOutstanding: 3,
      talkingPoints: [
        {
          title: "Salary discussion",
          tags: [],
          actions: [],
        },
        {
          title: "Hackathon",
          tags: ["happy", "canImprove"],
          actions: [],
        },
      ],
      createdAt: new Date("2023-02-05"),
    },
    {
      id: 2,
      attendee: "Isabel Webb",
      date: new Date("2023-02-20"),
      actionsOutstanding: 2,
      talkingPoints: [
        {
          title: "Salary discussion",
          tags: [],
          actions: [],
        },
      ],
      createdAt: new Date("2023-02-05"),
    },
    {
      id: 3,
      attendee: "Otis Bearnason",
      date: new Date("2023-02-20"),
      actionsOutstanding: 0,
      talkingPoints: [
        {
          title: "Salary discussion",
          tags: [],
          actions: [],
        },
        {
          title: "Hackathon",
          tags: ["happy", "canImprove"],
          actions: [],
        },
        {
          title: "Hackathon",
          tags: ["happy", "canImprove"],
          actions: [],
        },
        {
          title: "Hackathon",
          tags: ["happy", "canImprove"],
          actions: [],
        },
        {
          title: "Hackathon",
          tags: ["happy", "canImprove"],
          actions: [],
        },
      ],
      createdAt: new Date("2023-02-05"),
    },
  ]);
}

export default function MeetingsIndex() {
  const upcomingMeetings = useLoaderData<typeof loader>();

  return (
    <div className="h-full overflow-auto p-8">
      <h1 className="font-bl text-2xl font-black">Meetings</h1>
      <div className="flex flex-row">
        {["Upcoming", "Past"].map((s, i) => (
          <a key={i} href={"x"} className="mr-3 py-2 text-teal-700">
            {s}
          </a>
        ))}
      </div>
      <div className="foverflow-auto my-6 rounded-md border shadow-sm">
        <div>
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b bg-slate-50 p-3 text-left text-sm font-semibold">
                  Attendee
                </th>
                <th className="border-b bg-slate-50 p-3 text-right text-sm font-semibold">
                  Next meeting
                </th>
                <th className="w-10 border-b bg-slate-50 p-3  text-right text-sm font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {upcomingMeetings.map((m, i) => {
                const daysBetween = formatDistance(
                  new Date(),
                  new Date(m.date)
                );

                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="border-b p-3 text-left font-semibold  text-teal-700">
                      <Link to={`${m.id}`}>{m.attendee}</Link>
                    </td>
                    {/* <td className="border-b p-3  text-right text-xs font-normal">
                      {m.talkingPoints.length}
                    </td>
                    <td className="border-b p-3  text-right text-xs font-normal">
                      {m.actionsOutstanding}
                    </td> */}
                    <td className="border-b p-3  text-right text-xs font-normal">
                      {daysBetween}
                    </td>
                    <td className="border-b p-3  text-right text-xs font-normal">
                      <div className="flex flex-col items-center justify-center">
                        <button>...</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* <Outlet /> */}
    </div>
  );
}
