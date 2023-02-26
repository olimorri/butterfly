import { Form, useActionData, useNavigate } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import React from "react";
import Modal from "~/components/Modal";
import { prisma } from "~/db.server";
import { getUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const userId = await getUserId(request);

  const meetingId = params.meetingId;

  const formData = await request.formData();
  const talkingPoint = formData.get("talkingPoint");

  if (!userId) {
    return json(
      {
        errors: {
          talkingPoint: null,
          userId: "User ID invalid",
          meetingId: null,
        },
      },
      { status: 400 }
    );
  }

  if (!meetingId) {
    return json(
      {
        errors: {
          talkingPoint: null,
          userId: null,
          meetingId: "Meeting ID invalid",
        },
      },
      { status: 400 }
    );
  }

  if (typeof talkingPoint !== "string" || talkingPoint.length === 0) {
    return json(
      {
        errors: {
          talkingPoint: "You need to add a talking point",
          userId: null,
          meetingId: null,
        },
      },
      { status: 400 }
    );
  }

  await prisma.talkingPoint.create({
    data: {
      title: talkingPoint,
      userId: userId,
      meetingId,
    },
  });

  return redirect(`/meeting/${meetingId}`);
}

export default function AddTalkingPointForm() {
  const actionData = useActionData();

  const tpRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.talkingPoint) {
      tpRef.current?.focus();
    }
  }, [actionData]);

  const navigate = useNavigate();

  return (
    <Modal
      handleClose={() => {
        navigate(-1);
      }}
      size="small"
    >
      <div className="flex h-full flex-row items-start justify-between text-sm ">
        <div className="mx-2 flex h-full w-full flex-col p-5">
          <Form method="post" className="space-y-6">
            <div>
              <label className="flex-3  text-lg font-semibold">
                What would you like to talk about?
              </label>
              <div className="flex-2 mb-3 mt-0 flex w-full flex-col rounded-lg border p-2">
                <textarea
                  placeholder="Add talking point"
                  className="w-full resize-none outline-none"
                  name="talkingPoint"
                  aria-invalid={
                    actionData?.errors?.talkingPoint ? true : undefined
                  }
                  aria-errormessage={
                    actionData?.errors?.talkingPoint ? "title-error" : undefined
                  }
                  ref={tpRef}
                />
              </div>
            </div>

            <div>
              <label className="flex-3  text-lg font-semibold">
                Add some tags
              </label>
              <div className="flex-2 mb-3 mt-0 grid w-full grid-cols-3 gap-2 p-2">
                <button className="bordeer rounded-lg bg-teal-100 p-1">
                  Workload
                </button>
                <button className="bordeer rounded-lg bg-purple-100 p-1">
                  Progression
                </button>
                <button className="bordeer rounded-lg bg-sky-100 p-1">
                  Roadmap
                </button>
                <button className="bordeer rounded-lg bg-orange-100 p-1">
                  Team
                </button>
                <button className="bordeer rounded-lg  bg-cyan-100 p-1">
                  Success
                </button>
                <button className="bordeer rounded-lg bg-pink-100 p-1">
                  Pride
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-1/5 self-end rounded bg-teal-600 p-3 text-xs font-light text-zinc-50 hover:bg-teal-700 focus:bg-teal-600 "
            >
              Create
            </button>
          </Form>
        </div>
      </div>
    </Modal>
  );
}
