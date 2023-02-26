import { Prisma, Tag } from "@prisma/client";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import type {
  ActionArgs,
  LoaderArgs,
  SerializeFrom,
} from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import Modal from "~/components/Modal";
import { prisma } from "~/db.server";
import { getUserId } from "~/session.server";
import {
  EllipsisVerticalIcon,
  TagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { format } from "date-fns";

const commentsWithUser = Prisma.validator<Prisma.CommentArgs>()({
  include: { user: true },
});

type CommentsWithUser = Prisma.CommentGetPayload<typeof commentsWithUser>;

export async function action({ request, params }: ActionArgs) {
  const userId = await getUserId(request);
  const talkingPointId = params.talkingPointId;

  const formData = await request.formData();

  const commentIdToDelete = formData.get("deleteComment");

  if (commentIdToDelete) {
    // todo om - this should be a soft delete for real, but good for now
    await prisma.comment.delete({
      where: {
        id: commentIdToDelete as string,
      },
    });

    return json({
      errors: null,
      status: 200,
      values: { comment: null },
    });
  }

  const tagIdToHandle = formData.get("handleTag");
  const comment = formData.get("comment");
  const values = Object.fromEntries(formData);

  if (typeof comment !== "string" || comment.length === 0) {
    return json(
      {
        errors: {
          comment: "Add comment",
          user: null,
          talkingPointId: null,
        },
        values: {
          comment: values.comment,
        },
      },
      { status: 400 }
    );
  }

  if (!userId) {
    return json(
      {
        errors: {
          comment: null,
          user: "Unable to fetch user, please ensure you're logged in",
          talkingPointId: null,
        },
        values: {
          comment: values.comment,
        },
      },
      { status: 400 }
    );
  }

  if (!talkingPointId) {
    return json(
      {
        errors: {
          comment: null,
          user: null,
          talkingPointId: "Unable to fetch talking point, please try again",
        },
        values: {
          comment: values.comment,
        },
      },
      { status: 400 }
    );
  }

  if (typeof tagIdToHandle === "string" && tagIdToHandle) {
    // const existingTalkingPoint = await prisma.talkingPoint.findUniqueOrThrow({
    //   where: {
    //     id: talkingPointId,
    //   },
    //   include: {
    //     tags: true,
    //   },
    // });
    // const tagExistsOnTalkingPoint = existingTalkingPoint.tags.filter(
    //   (t) => t.id === tagIdToHandle
    // );
    // if (tagExistsOnTalkingPoint) {
    //   const tagsToKeep = existingTalkingPoint.tags.filter(
    //     (t) => t.id !== tagIdToHandle
    //   );
    //   await prisma.talkingPoint.update({
    //     where: {
    //       id: talkingPointId,
    //     },
    //     data: {
    //       tags: tagsToKeep,
    //     },
    //   });
    // }
    // if(existingTalkingPoint?.tags.includes(tagToHandle)) {
    // }
    // const removeTag = existingTalkingPoint?.tags.includes(tagToHandle);
  }

  try {
    await prisma.comment.create({
      data: {
        content: comment,
        userId,
        talkingPointId,
      },
    });

    return json({
      errors: null,
      status: 201,
      values: { comment: null },
    });
  } catch (err) {
    return json({
      errors: {
        server: "Sorry, we couldn't create the comment",
        comment: null,
        user: null,
        talkingPointId: null,
      },
      values: {
        comment: values.comment,
      },
      status: 500,
    });
  }
}

export async function loader({ params }: LoaderArgs) {
  const talkingPoint = await prisma.talkingPoint.findUniqueOrThrow({
    where: {
      id: params.talkingPointId,
    },
    include: { user: true, tags: true },
  });

  const comments = await prisma.comment.findMany({
    where: {
      talkingPointId: talkingPoint.id,
    },
    include: { user: true },
  });

  const availableTags = await prisma.tag.findMany();

  return json({
    talkingPoint,
    availableTags,
    comments,
  });
}

export default function TalkingPointExpanded() {
  // todo om - add in some optimistic ui and submission with `useFetcher`

  const navigate = useNavigate();
  const params = useParams();

  const [addCommentSelected, setAddCommentSelected] = useState(false);

  const { talkingPoint, comments, availableTags } =
    useLoaderData<typeof loader>();

  return (
    <Modal
      handleClose={() => {
        navigate(`/meeting/${params.meetingId}`);
      }}
      size="large"
    >
      <div className="flex h-full w-full flex-row text-sm">
        <div className="flex h-full w-4/5 flex-col items-center justify-between p-3">
          <div className="w-full pl-4 text-3xl font-bold">
            <p>{talkingPoint.title}</p>
          </div>
          <div className="flex h-full w-full flex-col justify-start overflow-hidden">
            <div
              className={
                addCommentSelected
                  ? "my-2 h-1/2 overflow-auto"
                  : "my-2 overflow-auto"
              }
              onClick={() => setAddCommentSelected(false)}
            >
              {comments.length === 0 ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-50">
                  <p>No comments yet</p>
                </div>
              ) : (
                <ul className="self-start py-1">
                  {comments.map((c) => {
                    return <CommentTile comment={c} key={c.id} />;
                  })}
                </ul>
              )}
            </div>
            {addCommentSelected ? (
              <AddCommentSection
                handleSubmit={() => setAddCommentSelected(false)}
              />
            ) : (
              <button
                onClick={() => setAddCommentSelected(true)}
                className="mb-2 w-full rounded-lg border p-3 text-start text-zinc-400 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
              >
                Add comment
              </button>
            )}
          </div>
        </div>
        <div className="m-auto h-full w-1/5 bg-zinc-50">
          <TalkingPointExpandedMenuPanel
            availableTags={availableTags}
            tags={talkingPoint.tags}
          />
        </div>
      </div>
    </Modal>
  );
}

const AddCommentSection = ({ handleSubmit }: { handleSubmit: () => void }) => {
  return (
    <Form
      method="post"
      className="mb-2 flex h-1/2 w-full flex-row rounded-lg border p-3"
      reloadDocument
      onSubmit={() => handleSubmit}
    >
      <textarea
        placeholder="Comment"
        className="w-full resize-none p-2 outline-none"
        name="comment"
      />
      <button
        className="w-1/5 self-end rounded bg-teal-600 p-3 text-xs font-light text-zinc-50 hover:bg-teal-700 focus:bg-teal-600 "
        type="submit"
      >
        Submit
      </button>
    </Form>
  );
};

const CommentTile = ({
  comment,
}: {
  comment: SerializeFrom<CommentsWithUser>;
}) => {
  const fetcher = useFetcher();

  if (fetcher.submission) {
    return <></>;
  }

  return (
    <fetcher.Form
      method="delete"
      className="font-base group flex flex-row items-center justify-start rounded-lg border border-transparent bg-neutral-50 p-4 text-neutral-800"
    >
      <div className="flex w-full flex-row items-center justify-between">
        <div
          className="flex-3 flex h-10 w-10 items-center justify-center self-start rounded-full text-center"
          style={{ backgroundColor: `${comment.user.color}` }}
        >
          <p>{comment.user.firstName.charAt(0)}</p>
        </div>
        <div className=" flex-1 whitespace-pre-line px-3">
          <p className="text-sm font-semibold">
            {comment.user.firstName}{" "}
            <span className="text-2xs text-neutral-500">
              {format(new Date(comment.createdAt), "MMM d y h:mmbbb")}
            </span>
          </p>
          <p className="text-xm">{comment.content}</p>
        </div>
        <div className="flex-3 hidden space-x-1 group-hover:block">
          <button className="rounded bg-neutral-200 p-1 text-xs text-neutral-500 hover:bg-neutral-500 hover:text-white">
            <span>
              <EllipsisVerticalIcon className="inline-block h-4 w-4" />
            </span>
          </button>
          <button
            type="submit"
            name="deleteComment"
            value={comment.id}
            className="rounded bg-neutral-200 p-1 text-xs text-neutral-500 hover:bg-red-500 hover:text-white"
          >
            <span>
              <TrashIcon className="inline-block h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </fetcher.Form>
  );
};

const TalkingPointExpandedMenuPanel = ({
  tags,
  availableTags,
}: {
  tags: SerializeFrom<Tag[]>;
  availableTags: SerializeFrom<Tag[]>;
}) => {
  const MENU_OPTIONS = ["Tags", "Actions"];

  console.log(availableTags);

  const [addTag, setAddTag] = useState(false);

  return (
    <div className="p-2 text-xs text-slate-600">
      {MENU_OPTIONS.map((menuOption, i) => {
        return (
          <div className="border-b border-slate-200 p-2 " key={i}>
            <div
              className="flex flex-row justify-between rounded p-2 hover:bg-zinc-100"
              onClick={() => {
                if (menuOption === "Tags" && addTag === false) {
                  setAddTag(true);
                }

                if (menuOption === "Tags" && addTag === true) {
                  setAddTag(false);
                }
              }}
            >
              <p>{menuOption}</p>
              <p>+</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              {availableTags && menuOption === "Tags" && addTag ? (
                availableTags.map((t) => <TagOption key={t.id} tag={t} />)
              ) : (
                <></>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TagOption = ({ tag }: { tag: SerializeFrom<Tag> }) => {
  const fetcher = useFetcher();

  if (fetcher.submission) {
    return <p>adding tag...</p>;
  }

  return (
    <fetcher.Form
      method="post"
      key={tag.id}
      style={{
        color: tag.color,
      }}
      className=" flex w-full flex-row items-center justify-between p-2 font-light hover:bg-neutral-100"
    >
      <TagIcon className="inline-block h-4 w-4" />
      <button type="submit" name="handleTag" value={tag.id}>
        {tag.name}
      </button>
    </fetcher.Form>
  );
};
