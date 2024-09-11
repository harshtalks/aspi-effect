import { Context, Effect, Layer } from "effect";
import { GroupsPolicy, groupsPolicyLive } from "./groups.policy";
import { Group } from "../domains/group";
import { Person } from "../domains/person";
import { policy, policyCompose } from "../domains/policy";
import { MakeService } from "../utilities/with-effect";

const makePeoplePolicy = GroupsPolicy.pipe(
  Effect.andThen((groupsPolicy) => {
    const canCreate = (group: Group, _person: typeof Person.jsonCreate.Type) =>
      groupsPolicy
        .canUpdate(group)
        .pipe(
          policyCompose(
            policy("Person", "create", (actor) => Effect.succeed(true)),
          ),
        );

    return { canCreate } as const;
  }),
);

export class PeoplePolicy extends Context.Tag("peoplePolicy")<
  PeoplePolicy,
  MakeService<typeof makePeoplePolicy>
>() {}

export const peoplePolicyLive = Layer.succeed(
  PeoplePolicy,
  PeoplePolicy.of(
    makePeoplePolicy
      .pipe(Effect.provide(groupsPolicyLive))
      .pipe(Effect.runSync),
  ),
);
