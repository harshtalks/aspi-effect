// UUID as a requirement

import { Context, Effect, Layer } from "effect";
import * as Api from "uuid";

const makeUuidService = Effect.sync(() => {
  const generate = Effect.sync(() => Api.v7());
  return { generate } as const;
});

export class Uuid extends Context.Tag("UUID")<
  Uuid,
  Effect.Effect.Success<typeof makeUuidService>
>() {}

export const UuidLive = Layer.effect(Uuid, makeUuidService);

export const UuidTest = Layer.effect(
  Uuid,
  Effect.succeed({ generate: Effect.succeed("12") }),
);

/**Notes */
// Effect.success -> removes the top level effect -> channels into successful effect
