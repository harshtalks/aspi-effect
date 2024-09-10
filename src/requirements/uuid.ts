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

export const UuidLive = Layer.succeed(
  Uuid,
  Uuid.of(makeUuidService.pipe(Effect.runSync)),
);

export const UuidTest = Layer.succeed(
  Uuid,
  Uuid.of({
    generate: Effect.succeed("test-uuid"),
  }),
);

/**Notes */
// Effect.success -> removes the top level effect -> channels into successful effect
