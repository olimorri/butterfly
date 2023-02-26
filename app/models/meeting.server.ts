import type { Meeting, User } from "@prisma/client";
import { prisma } from "~/db.server";

export function createMeeting({
  date,
  userId,
}: Pick<Meeting, "date"> & {
  userId: User["id"];
}) {
  return prisma.meeting.create({
    data: {
      date,
      ownerId: userId,
      users: {
        connect: {
          id: userId,
        },
      },
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
