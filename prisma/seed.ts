import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, addHours, addMinutes } from "date-fns";

const prisma = new PrismaClient();

async function seed() {
  const email = "oliver@email.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  await prisma.organisation.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.talkingPoint.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.password.deleteMany();

  const hashedPassword = await bcrypt.hash("oliver91", 10);

  const organisation = await prisma.organisation.create({
    data: {
      name: "Butterfly",
      email: "oliver@email.com",
    },
  });

  console.log("added org");

  const manager = await prisma.user.create({
    data: {
      email,
      firstName: "Oliver",
      lastName: "Morrison",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      organisationId: organisation.id,
      color: "#86efac",
      role: "admin",
    },
  });

  const otis = await prisma.user.create({
    data: {
      email: "otis@email.com",
      firstName: "Otis",
      lastName: "Morrison",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      organisationId: organisation.id,
      color: "#67e8f9",
      role: "employee",
    },
  });

  const isabel = await prisma.user.create({
    data: {
      email: "isabel@email.com",
      firstName: "Isabel",
      lastName: "Webb",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      organisationId: organisation.id,
      color: "#a5b4fc",
      role: "employee",
    },
  });

  const samantha = await prisma.user.create({
    data: {
      email: "samantha@email.com",
      firstName: "Samantha",
      lastName: "Morrison",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      organisationId: organisation.id,
      color: "#f0abfc",
      role: "employee",
    },
  });

  console.log("added people");

  await prisma.tag.createMany({
    data: [
      { name: "salary", color: "#10b981", organisationId: organisation.id },
      {
        name: "development",
        color: "#0ea5e9",
        organisationId: organisation.id,
      },
      { name: "team", color: "#8b5cf6", organisationId: organisation.id },
      { name: "company", color: "#ec4899", organisationId: organisation.id },
    ],
  });

  const date = new Date();

  const meeting = await prisma.meeting.create({
    data: {
      title: "Meeting with Otis Morrison",
      date: date,
      authorId: manager.id,
      inviteeId: otis.id,
    },
  });

  await prisma.meeting.create({
    data: {
      title: "Meeting with Isabel Webb",
      date: addMinutes(date, 90),
      authorId: manager.id,
      inviteeId: isabel.id,
    },
  });

  await prisma.meeting.create({
    data: {
      title: "Meeting with Samantha Morrison",
      date: addDays(date, 1),
      authorId: manager.id,
      inviteeId: samantha.id,
    },
  });

  console.log("added meeting");

  const talkingPointOne = await prisma.talkingPoint.create({
    data: { title: "Hackathon", userId: manager.id, meetingId: meeting.id },
  });

  const salaryTag = await prisma.tag.findUniqueOrThrow({
    where: { name: "salary" },
  });

  const devTag = await prisma.tag.findUniqueOrThrow({
    where: { name: "development" },
  });

  const talkingPointTwo = await prisma.talkingPoint.create({
    data: {
      title: "Quarterly review",
      userId: otis.id,
      meetingId: meeting.id,
      tags: {
        connect: [{ id: salaryTag.id }, { id: devTag.id }],
      },
    },
  });

  const talkingPointThree = await prisma.talkingPoint.create({
    data: {
      title: "Learning budget",
      userId: otis.id,
      meetingId: meeting.id,
    },
  });

  console.log("added talking points");

  await prisma.comment.createMany({
    data: [
      {
        talkingPointId: talkingPointOne.id,
        content: "Really enjoyed it!",
        userId: otis.id,
      },
      {
        talkingPointId: talkingPointOne.id,
        content: "So did I, was good to see everyone",
        userId: manager.id,
      },
      {
        talkingPointId: talkingPointTwo.id,
        content: "We need to prepare for your quarterly review",
        userId: manager.id,
      },
      {
        talkingPointId: talkingPointThree.id,
        content: "I'd like to learn some new skills",
        userId: otis.id,
      },
    ],
  });

  console.log("added comments");

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
