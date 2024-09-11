import { Effect } from "effect";

export namespace ContextTags {
  export const groups = Effect.succeed("repositories/groups");
  export const accounts = Effect.succeed("repositories/accounts");
  export const people = Effect.succeed("repositories/people");
  export const users = Effect.succeed("repositories/users");
}
