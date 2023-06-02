import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useRef, useState } from "react";
import { prisma } from "~/db.server";
import { createMeeting } from "~/models/meeting.server";

import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const allOrgUsers = await prisma.user.findMany({
    where: { organisationId: user.organisationId },
  });

  const filteredOrgUsers = allOrgUsers.filter((u) => u.id !== user.id);

  const mappedOrgUsers = filteredOrgUsers.map((filteredUser) => {
    return {
      id: filteredUser.id,
      email: filteredUser.email,
      firstName: filteredUser.firstName,
      lastName: filteredUser.lastName,
    };
  });

  return json(mappedOrgUsers);
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const date = formData.get("date");
  const attendee = formData.get("attendee");
  const title = formData.get("title");

  if (!date || typeof date !== "string") {
    return json(
      { errors: { title: null, body: "Date is required" } },
      { status: 400 }
    );
  }

  if (!attendee || typeof attendee !== "string") {
    return json(
      { errors: { title: null, body: "Attendee is required" } },
      { status: 400 }
    );
  }

  if (!title || typeof title !== "string") {
    return json(
      { errors: { title: null, body: "Title is required" } },
      { status: 400 }
    );
  }

  const parsedDate = new Date(date);

  const meeting = await createMeeting({
    date: parsedDate,
    authorId: userId,
    title,
    inviteeId: attendee,
  });

  console.log(meeting);

  return redirect(`/meeting/${meeting.id}`);
}

export default function NewMeetingPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  console.log(data);

  const dateRef = useRef<HTMLInputElement>(null);
  const attendeeRef = useRef<HTMLSelectElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const [titlePlaceholder, setTitlePlaceholder] =
    useState<string>("Meeting with ...");

  const updateTitlePlaceholder = (e) => {
    console.log("in here");

    console.log(e.target.value);

    const selectedAttendee = data.find((user) => user.id === e.target.value);

    if (!selectedAttendee) return;

    if (titleRef.current) {
      titleRef.current.value = `Meeting with ${selectedAttendee?.firstName} ${selectedAttendee?.lastName}`;
    }

    setTitlePlaceholder(
      `Meeting with ${selectedAttendee?.firstName} ${selectedAttendee?.lastName}`
    );
  };

  // React.useEffect(() => {
  //   if (actionData?.errors?.title) {
  //     dateRef.current?.focus();
  //   }
  // }, [actionData]);

  return (
    <Form method="post" className="flex w-full flex-col gap-8">
      <div className="flex w-full flex-1 flex-col px-5 py-10 align-middle">
        <h1 className="text-3xl font-black">New meeting</h1>
        <div className="flex w-full justify-center">
          <div className="mt-5 w-1/2 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mt-5 flex w-full flex-col gap-1">
              <span>Attendee </span>
              <select
                ref={attendeeRef}
                name="attendee"
                className="text-lg flex-1 rounded-md border border-slate-300 p-2 leading-loose active:border-blue-500"
                aria-invalid={actionData?.errors?.title ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.title ? "title-error" : undefined
                }
                onChange={(e) => {
                  updateTitlePlaceholder(e);
                }}
              >
                <option value=""></option>
                {data.map((user, index) => {
                  return (
                    <option key={index} value={user.id}>
                      {user.firstName} {user.lastName} - {user.email}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="mt-5 flex w-full flex-col gap-1">
              <span>Date </span>
              <input
                ref={dateRef}
                type="date"
                name="date"
                className="text-lg flex-1 rounded-md border border-slate-300 p-2 leading-loose active:border-blue-500"
                aria-invalid={actionData?.errors?.title ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.title ? "title-error" : undefined
                }
              />
            </label>
            <label className="mt-5 flex w-full flex-col gap-1">
              <span>Title </span>
              <input
                ref={titleRef}
                type="text"
                name="title"
                placeholder={titlePlaceholder}
                className="text-lg flex-1 rounded-md border border-slate-300 p-2 leading-loose active:border-blue-500"
                aria-invalid={actionData?.errors?.title ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.title ? "title-error" : undefined
                }
              />
            </label>
            {actionData?.errors?.title && (
              <div className="pt-1 text-red-700" id="title-error">
                {actionData.errors.title}
              </div>
            )}
            <div className="mt-5 text-right">
              <button
                type="submit"
                className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
}
