import { Schema } from "@effect/schema";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const Email = Schema.String.pipe(
  Schema.pattern(emailRegex),
  Schema.annotations({
    title: "Email",
    description: "Email address",
  }),
  Schema.brand("Email"),
  Schema.annotations({
    title: "Email",
  }),
);

export type Email = typeof Email.Type;
