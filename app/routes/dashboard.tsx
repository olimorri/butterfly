import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  BookOpenIcon,
  BuildingStorefrontIcon,
  GlobeEuropeAfricaIcon,
} from "@heroicons/react/24/outline";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Line } from "react-chartjs-2";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import "chart.js/auto";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const authoredMeetings = await prisma.meeting.findMany({
    where: { authorId: user.id },
    include: { invitee: true, talkingPoints: true },
  });

  const mappedMeetings = authoredMeetings.map<MappedMeeting>((m) => {
    return {
      id: m.id,
      title: m.title,
      date: m.date,
      discussionPointCount: m.talkingPoints.length,
    };
  });

  const meetingsGroupedByDay = mappedMeetings.reduce((acc, meeting) => {
    const existingMeetingGroup = acc.find(
      (group) => group.date === meeting.date.toDateString()
    );

    // If a group exists, add the meeting to it
    if (existingMeetingGroup) {
      existingMeetingGroup.meetings.push(meeting);
    } else {
      // If no group exists, create a new one and add the meeting
      acc.push({
        date: meeting.date.toDateString(),
        meetings: [meeting],
      });
    }

    return acc;
  }, [] as MeetingsGroupedByDate[]);

  return json({
    meetingGroups: meetingsGroupedByDay,
  });
}

interface MeetingsGroupedByDate {
  date: string;
  meetings: MappedMeeting[];
}

interface MappedMeeting {
  id: string;
  title: string;
  date: Date;
  discussionPointCount: number;
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Salary",
        data: [2, 3, 1, 2],
        fill: false,
        backgroundColor: "#10b981",
        borderColor: "#10b981",
        tension: 0.3,
        pointStyle: false,
      },
      {
        label: "Development",
        data: [1, 0, 1, 6],
        fill: false,
        backgroundColor: "#0ea5e9",
        borderColor: "#0ea5e9",
        tension: 0.3,
        pointStyle: false,
      },
      {
        label: "Team",
        data: [10, 5, 2, 1],
        fill: false,
        backgroundColor: "#8b5cf6",
        borderColor: "#8b5cf6",
        tension: 0.3,
        pointStyle: false,
      },
      {
        label: "Company",
        data: [5, 2, 2, 4],
        fill: false,
        backgroundColor: "#ec4899",
        borderColor: "#ec4899",
        tension: 0.3,
        pointStyle: false,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: false,
          text: "Month",
        },
        grid: { display: true },
      },
      y: {
        display: true,
        min: 0,
        title: {
          display: false,
          text: "Value",
        },
        grid: { display: true },
      },
    },
  };

  // todo om - the meetings section isn't always full height
  return (
    <main className="flex flex-1 flex-row font-sans">
      <div className="flex w-3/5 flex-col items-center justify-center align-middle">
        <div className="flex h-full w-full flex-1 flex-col px-5 py-10 align-middle">
          <div className="flex flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl font-black">Meetings</h1>
              <p className="text-xs text-slate-500">Upcoming</p>
            </div>
            <Link
              to={"/meeting/new"}
              className="rounded-md bg-sky-200 p-3 text-sm font-semibold hover:bg-sky-300"
            >
              New meeting
            </Link>
          </div>
          <div className="mt-5 flex-1 overflow-auto rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            {data.meetingGroups.map((meetingGroup, i) => {
              const month = new Date(meetingGroup.date).toLocaleDateString([], {
                month: "long",
              });

              const date = new Date(meetingGroup.date).toLocaleDateString([], {
                day: "numeric",
              });

              const day = new Date(meetingGroup.date).toLocaleDateString([], {
                weekday: "long",
              });

              return (
                <div key={i}>
                  <p className="border-b-2 border-b-slate-200 text-sm font-bold uppercase">
                    {month} {date},{" "}
                    <span className="text-slate-500">{day}</span>
                  </p>
                  {meetingGroup.meetings.map((meeting, i) => {
                    if (i === meetingGroup.meetings.length - 1) {
                      return (
                        <Link
                          className="mt-5 mb-5 flex w-full flex-row items-center rounded-md border p-3 drop-shadow-sm hover:bg-slate-50 "
                          key={i}
                          to={`/meeting/${meeting.id}`}
                        >
                          <div className="flex w-full flex-row items-center justify-between">
                            <p className="text-sm">{meeting.title}</p>
                            <MeetingOverviewPills
                              discussionPointCount={
                                meeting.discussionPointCount
                              }
                            />
                          </div>
                        </Link>
                      );
                    }

                    return (
                      <Link
                        className="w-100 mt-5 flex w-full flex-row items-center rounded-md  border p-3 drop-shadow-sm hover:bg-slate-50 "
                        key={i}
                        to={`/meeting/${meeting.id}`}
                      >
                        <div className="flex w-full flex-row items-center justify-between">
                          <p className="text-sm">{meeting.title}</p>
                          <MeetingOverviewPills
                            discussionPointCount={meeting.discussionPointCount}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex w-2/5 flex-1 flex-col px-5 py-10">
        <h1 className="text-3xl font-black">Insights</h1>
        <p className="text-xs text-slate-500">
          What are your team talking about?
        </p>
        <div className="mt-5 flex flex-1 flex-col rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-1/2">
            <p className="mb-2 border-b text-sm font-bold uppercase ">
              Frequent Topics,{" "}
              <span className="text-slate-500">Last 30 days</span>
            </p>
            <InsightsTile
              topicTitle="Salary"
              mentionNumber={4}
              trendingUp={true}
            />
            <InsightsTile
              topicTitle="Company"
              mentionNumber={4}
              trendingUp={true}
            />
            <InsightsTile
              topicTitle="Team"
              mentionNumber={1}
              trendingUp={false}
            />
          </div>
          <div className="max-h-1/2">
            <p className="mb-2 border-b text-sm font-bold uppercase ">
              Topic frequency over time
            </p>
            <div className="mt-5 rounded border">
              <Line data={chartData} id={"1"} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </main>
  );
}

function InsightsTile({
  topicTitle,
  mentionNumber,
  trendingUp,
}: InsightTileProps) {
  const mentionText = mentionNumber === 1 ? "mention" : "mentions";

  return (
    <div className="flex w-full flex-row items-center  p-2 hover:bg-slate-50">
      <TagTile topicTitle={topicTitle} />
      <div className="w-full  p-2">
        <p className="text-sm font-semibold">{topicTitle}</p>
        <div className="flex flex-row">
          <p className="text-xs text-slate-500">
            {mentionNumber} {mentionText}{" "}
          </p>
          {trendingUp ? (
            <ArrowTrendingUpIcon className="ml-2 h-4 w-4  text-green-500" />
          ) : (
            <ArrowTrendingDownIcon className="ml-2 h-4 w-4  text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
}

interface InsightTileProps {
  topicTitle: "Salary" | "Company" | "Development" | "Team";
  mentionNumber: number;
  trendingUp: boolean;
}

function TagTile({
  topicTitle,
}: {
  topicTitle: "Salary" | "Company" | "Development" | "Team";
}) {
  switch (topicTitle) {
    case "Company":
      return (
        <div className="rounded bg-pink-500 p-2">
          <BuildingStorefrontIcon className="h-8 w-8 text-white" />
        </div>
      );
    case "Development":
      return (
        <div className="rounded bg-sky-500 p-2">
          <BookOpenIcon className="h-8 w-8 text-white" />
        </div>
      );
    case "Salary":
      return (
        <div className="rounded bg-emerald-500 p-2">
          <BanknotesIcon className="h-8 w-8 text-white" />
        </div>
      );
    case "Team":
      return (
        <div className="rounded bg-violet-500 p-2">
          <GlobeEuropeAfricaIcon className="h-8 w-8 text-white" />
        </div>
      );
  }
}

function MeetingOverviewPills({
  discussionPointCount,
}: {
  discussionPointCount: number;
}) {
  return (
    <div className="flex space-x-2">
      <p className="w-content  rounded-lg bg-slate-100 p-1 text-xs">1:1</p>
      <p className="w-content  rounded-lg bg-slate-100 p-1 text-xs">
        {discussionPointCount} discussion points
      </p>
    </div>
  );
}
