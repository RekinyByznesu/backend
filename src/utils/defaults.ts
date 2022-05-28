import { TagType } from "@prisma/client";

export const categories = [
  "Interpersonal",
  "Personal",
  "Professional",
  "Daily Life",
];

export const tags = [
  {
    type: TagType.PLACE,
    name: "School",
  },
  {
    type: TagType.PLACE,
    name: "Work",
  },
  {
    type: TagType.PLACE,
    name: "Home",
  },
  {
    type: TagType.ACTIVITY,
    name: "Sport",
  },
  {
    type: TagType.ACTIVITY,
    name: "Computer Games",
  },
  {
    type: TagType.ACTIVITY,
    name: "TV Shows",
  },
  {
    type: TagType.ACTIVITY,
    name: "Hanging out with friends",
  },
  {
    type: TagType.ACTIVITY,
    name: "Reading",
  },
  {
    type: TagType.ACTIVITY,
    name: "Cooking",
  },
  {
    type: TagType.ACTIVITY,
    name: "Exercising",
  },
  {
    type: TagType.ACTIVITY,
    name: "Shopping",
  },
  {
    type: TagType.ACTIVITY,
    name: "Eating",
  },
  {
    type: TagType.ACTIVITY,
    name: "Cleaning",
  },
  {
    type: TagType.ACTIVITY,
    name: "Housework",
  },
];
