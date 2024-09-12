import { HttpApiBuilder } from "@effect/platform";
import Api from "../api";
import { Effect, Layer } from "effect";
import { Groups, groupsLive } from "../implementions/group.impl";
import { GroupsPolicy, groupsPolicyLive } from "../policies/groups.policy";
import { Accounts, accountsLive } from "../implementions/account.impl";
import { CurrentUser } from "../domains/user";
import { policyUse } from "../domains/policy";

export const httpGroupsLive = HttpApiBuilder.group(Api, "groups", (handlers) =>
  Effect.all([Groups, GroupsPolicy, Accounts]).pipe(
    Effect.andThen(([groups, policy, accounts]) => {
      return handlers.pipe(
        // create
        HttpApiBuilder.handle("createGroup", ({ payload }) => {
          return CurrentUser.pipe(
            Effect.andThen((user) =>
              groups.createGroup(user.accountId, payload),
            ),
            policyUse(policy.canCreate(payload)),
          );
        }),
        // update
        HttpApiBuilder.handle("updateGroup", ({ path, payload }) => {
          return groups.with(path.id, (group) =>
            groups
              .updateGroup(group, payload)
              .pipe(policyUse(policy.canUpdate(group))),
          );
        }),
        // read
        HttpApiBuilder.handle("getGroup", ({ path }) => {
          return groups.with(path.id, (group) => {
            return Effect.succeed(group).pipe(policyUse(policy.canRead(group)));
          });
        }),
      );
    }),
  ),
).pipe(
  Layer.provide(accountsLive),
  Layer.provide(groupsLive),
  Layer.provide(groupsPolicyLive),
);
