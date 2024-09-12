import { Context, Effect, Layer } from "effect";
import { UserId } from "../domains/user";
import { policy } from "../domains/policy";
import { MakeService } from "../utilities/with-effect";

const makeAccountsPolicy = Effect.sync(() => {
  const canUpdate = (toUpdate: UserId) =>
    policy("User", "update", (actor) => Effect.succeed(actor.id === toUpdate));

  const canRead = (toRead: UserId) =>
    policy("User", "read", (actor) => Effect.succeed(actor.id === toRead));

  const canReadSensitive = (toReadSensitive: UserId) =>
    policy("User", "readSensitive", (actor) =>
      Effect.succeed(actor.id === toReadSensitive),
    );

  return {
    canRead,
    canReadSensitive,
    canUpdate,
  } as const;
});

export class AccountsPolicy extends Context.Tag("accountsPolicy")<
  AccountsPolicy,
  MakeService<typeof makeAccountsPolicy>
>() {}

export const accountsPolicyLive = Layer.effect(
  AccountsPolicy,
  makeAccountsPolicy,
);
