// groups policy

import { Context, Effect, Layer } from "effect";
import { Group } from "../domains/group";
import { policy } from "../domains/policy";
import { MakeService } from "../utilities/with-effect";
import { UserId } from "../domains/user";

const makeGroupsPolicyService = Effect.sync(() => {
  const canCreate = (_group: typeof Group.jsonCreate.Type) =>
    policy("Group", "create", (_actor) => Effect.succeed(true));

  const canUpdate = (group: Group) =>
    policy("Group", "update", (actor) =>
      Effect.succeed(group.ownerId === actor.accountId),
    );

  const canRead = (group: Group) =>
    policy("Group", "read", (actor) =>
      Effect.succeed(group.ownerId === actor.accountId),
    );

  return { canCreate, canUpdate, canRead } as const;
});

export class GroupsPolicy extends Context.Tag("groupsPolicy")<
  GroupsPolicy,
  MakeService<typeof makeGroupsPolicyService>
>() {}

export const groupsPolicyLive = Layer.succeed(
  GroupsPolicy,
  GroupsPolicy.of(makeGroupsPolicyService.pipe(Effect.runSync)),
);
