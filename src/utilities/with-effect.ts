import { Effect } from "effect";

export type MakeService<T extends Effect.Effect<any, any, any>> =
  Effect.Effect.Success<T>;
