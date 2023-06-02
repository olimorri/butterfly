import type { LoaderArgs, SerializeFrom } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { prisma } from "~/db.server";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import type { Tag } from "@prisma/client";

export async function loader({ params }: LoaderArgs) {
  const meeting = await prisma.meeting.findUniqueOrThrow({
    where: {
      id: params.meetingId,
    },
  });

  const talkingPoints = await prisma.talkingPoint.findMany({
    where: {
      meetingId: params.meetingId,
    },
    include: { comments: true, tags: true },
  });

  console.log(talkingPoints);

  const talkingPointInfo = talkingPoints.map((tp) => {
    const { id, title, meetingId, comments, createdAt, tags } = tp;

    return {
      id: id,
      title: title,
      meetingId,
      commentCount: comments.length,
      tags: tags,
      createdAt,
    };
  });

  const attendee = await prisma.user.findUniqueOrThrow({
    where: {
      id: meeting.inviteeId,
    },
  });

  return json({
    title: meeting.title,
    talkingPointInfo,
    attendee,
  });
}

export default function MeetingView() {
  const { talkingPointInfo, title, attendee } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-1 flex-row">
      <div className="flex w-3/5 flex-col items-center justify-center align-middle">
        <div className="flex h-full w-full flex-1 flex-col px-5 py-10 align-middle">
          <div>
            <h1 className="text-3xl font-black">{title}</h1>
            <p className="text-xs text-slate-500">
              {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="mt-5 flex-1 overflow-auto rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <p className="border-b-2 border-b-slate-200 text-sm font-bold uppercase">
              Talking Points
            </p>
            {talkingPointInfo.map((tp) => {
              console.log(tp.tags);

              return (
                <TalkingPointItem
                  key={tp.id}
                  talkingPointId={tp.id}
                  talkingPointTitle={tp.title}
                  commentCount={tp.commentCount}
                  tags={tp.tags}
                  // createTalkingPoint={handleTalkingPointAdd}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex w-2/5 flex-1 flex-col px-5 py-10">
        <h1 className="text-3xl font-black">Insights</h1>
        <p className="text-xs text-slate-500">
          What are you and {attendee.firstName} talking about?
        </p>
        <div className="mt-5 flex flex-1 flex-col rounded-md border border-slate-200 bg-white p-5 shadow-sm"></div>
      </div>
      <Outlet />
    </div>
  );
}

const TalkingPointItem = ({
  talkingPointId,
  talkingPointTitle,
  commentCount,
  tags,
}: {
  talkingPointId: string;
  talkingPointTitle: string;
  commentCount: number;
  tags: SerializeFrom<Tag[]>;
}) => {
  return (
    <Link
      to={`talking-point/${talkingPointId}`}
      className="mt-5 mb-5 flex w-full flex-row items-center rounded-md border p-3 drop-shadow-sm hover:bg-slate-50 "
    >
      <div className="flex w-full flex-row items-center justify-between">
        <p className="text-sm">{talkingPointTitle}</p>
        <div className="flex space-x-2">
          {tags.map((t) => {
            return (
              <button
                key={t.id}
                className="w-content rounded-lg p-1 text-xs text-white"
                style={{ backgroundColor: t.color }}
              >
                {t.name}
              </button>
            );
          })}
          <p className="w-content rounded-lg bg-slate-100 p-1 text-xs">
            {commentCount} comments
          </p>
        </div>
      </div>
    </Link>
  );
};
