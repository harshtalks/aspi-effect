import { HttpApiBuilder } from "@effect/platform";
import Api from "../api";
import { Effect, Layer, pipe } from "effect";
import { Groups, groupsLive } from "../implementions/group.impl";
import { People, peopleLive } from "../implementions/people.impl";
import { PeoplePolicy, peoplePolicyLive } from "../policies/people.policy";
import { Accounts, accountsLive } from "../implementions/account.impl";
import { policyUse } from "../domains/policy";

export const httpPeopleLive = HttpApiBuilder.group(Api, "people", (handlers) =>
  Effect.all([Groups, People, PeoplePolicy, Accounts]).pipe(
    Effect.andThen(([groups, people, peoplePolicy, accounts]) => {
      return handlers.pipe(
        HttpApiBuilder.handle("createPeople", ({ path, payload }) =>
          groups.with(path.groupId, (group) =>
            people
              .createPerson(group.id, payload)
              .pipe(policyUse(peoplePolicy.canCreate(group, payload))),
          ),
        ),
        accounts.httpSecurity,
      );
    }),
  ),
).pipe(
  Layer.provide(groupsLive),
  Layer.provide(peopleLive),
  Layer.provide(peoplePolicyLive),
  Layer.provide(accountsLive),
);
