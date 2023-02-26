# todo

1. database
   <!-- a. get basic data structures in place for meetings, talking points and
   comments -->
   <!-- b. seed with a few different examples for a test user -->
   c. add concept of organisation notes in schema
   d. get strucutre working for tags and actions

<!-- 2. modal -->
   <!-- a. when viewing a meeting in more detail, it should redirect to a new url
   `meetings/${meeting.id}/detail` or something similar -
   this means that the user can makes updates to the content, without being
   redirected to another page -->

<!-- 3. users can submit comments for existing talking points -->

4. Different categories of users

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
owner: {
initials: "om",
color: "#F9E79F",
},
comments: [
{
comment:
"I think that I deserve this after delivering a big piece of work",
owner: {
initials: "om",
color: "#F9E79F",
},
},
{
comment:
"We need to go away and plan the information that needs to be sent through to the people team. I'm not sure what that is at the moment, but I will check",
owner: {
initials: "pm",
color: "#D2B4DE",
},
},
],
},
{
title: "Hackathon",
tags: ["happy", "canImprove"],
actions: [],
owner: {
initials: "pm",
color: "#D2B4DE",
},
comments: [
{
comment: "Really enjoyed the team aspect",
owner: {
initials: "om",
color: "#F9E79F",
},
},
{
comment:
"Would like to widen the topic a little though - it felt samey",
owner: {
initials: "om",
color: "#F9E79F",
},
},
],
},
{
title: "Purchase rule documentation",
tags: [],
actions: [],
owner: {
initials: "pm",
color: "#D2B4DE",
},
comments: [
{
comment:
"We should put some time into getting these sorted, it'll pay off massively when onboarding new engineers",
owner: {
initials: "pm",
color: "#D2B4DE",
},
},
],
},
],
createdAt: new Date("2023-02-05"),
}
