import { Context, Effect, Layer } from "effect";
import { PeopleRepo, peopleRepoLive } from "../repositories/people.repo";
import { GroupId } from "../domains/branded";
import { Person } from "../domains/person";
import { policyRequire } from "../domains/policy";
import { MakeService } from "../utilities/with-effect";

export const makePeopleImpl = PeopleRepo.pipe(
  Effect.andThen((peopleRepo) => {
    const createPerson = (
      groupId: GroupId,
      person: typeof Person.jsonCreate.Type,
    ) =>
      peopleRepo
        .insert(
          Person.insert.make({
            ...person,
            groupId: groupId,
          }),
        )
        .pipe(
          Effect.withSpan("People.create", {
            attributes: {
              person,
              groupId,
            },
          }),
          policyRequire("Person", "create"),
        );

    return { createPerson } as const;
  }),
);

export class People extends Context.Tag("@impl/people")<
  People,
  MakeService<typeof makePeopleImpl>
>() {}

export const peopleLive = Layer.effect(People, makePeopleImpl).pipe(
  Layer.provide(peopleRepoLive),
);
