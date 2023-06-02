import type { Meeting } from "@prisma/client";
import { prisma } from "~/db.server";

export function createMeeting({
  date,
  authorId,
  title,
  inviteeId,
}: Pick<Meeting, "date" | "title" | "inviteeId" | "authorId">) {
  return prisma.meeting.create({
    data: {
      date,
      authorId,
      title,
      inviteeId,
    },
  });
}

// export async function findMeeting({
//   id
// }): Promise {
//   return await prisma.meeting.findUniqueOrThrow({
//     where: {
//       id: id
//     }
//   })
// }
