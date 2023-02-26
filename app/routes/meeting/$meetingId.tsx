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

  const talkingPointInfo = talkingPoints.map((tp) => {
    const { id, title, meetingId, comments, tags, createdAt } = tp;

    return {
      id: id,
      title: title,
      meetingId,
      commentCount: comments.length,
      tags: tags,
      createdAt,
    };
  });

  return json({
    title: meeting.title,
    talkingPointInfo,
    attendee: "oliver",
  });
}

export default function MeetingView() {
  const { talkingPointInfo, title } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full w-full flex-row">
      <div className="flew h-full w-4/5 flex-col items-center justify-center rounded-lg bg-white p-5">
        <div className="w-full p-3">
          <h2 className="text-xl font-black">{title}</h2>
        </div>
        <div className="m-auto mb-5 flex h-full flex-row">
          <div className="h-full w-full p-3">
            <div className="m-auto mb-5 flex h-3/5 flex-col border-t border-neutral-300">
              <h3 className="my-3 font-black">Talking Points</h3>
              {talkingPointInfo.map((tp) => {
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
            <div className="m-auto my-5 flex flex-col border-t">
              <h3 className="my-5 font-black">Actions</h3>
            </div>
          </div>
        </div>
      </div>
      <div className="h-full w-1/5 bg-red-100 p-3"></div>
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
    <Link to={`talking-point/${talkingPointId}`}>
      <div className="my-1 flex w-full cursor-pointer flex-row justify-between rounded-lg border border-neutral-200 bg-white p-3 text-sm font-medium  focus-within:bg-slate-200 hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-sm">
        <div>
          <p className="py-1">{talkingPointTitle}</p>
        </div>
        <div className="flex flex-row py-1">
          {tags.map((t) => {
            return (
              <button
                key={t.id}
                className="mr-2 rounded-lg border p-1 text-2xs font-light"
                style={{ backgroundColor: t.color }}
              >
                {t.name}
              </button>
            );
          })}
          <div className="m-auto flex w-full flex-row items-center rounded-lg border border-neutral-400 p-1 font-light">
            <span>
              <ChatBubbleLeftIcon className="inline-block h-4 w-4" />
            </span>
            <p className="ml-1 self-end text-xs">{commentCount}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};
