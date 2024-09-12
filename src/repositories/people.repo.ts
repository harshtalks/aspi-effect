import { Model } from "@effect/sql";
import { Context, Effect, Layer } from "effect";
import { Person } from "../domains/person";
import { MakeService } from "../utilities/with-effect";
import { sqlLive } from "../requirements/sql";

const makePeopleRepo = Model.makeRepository(Person, {
  spanPrefix: "PeopleRepo",
  tableName: "people",
  idColumn: "id",
});

export class PeopleRepo extends Context.Tag("People/Repo")<
  PeopleRepo,
  MakeService<typeof makePeopleRepo>
>() {}

export const peopleRepoLive = Layer.effect(PeopleRepo, makePeopleRepo).pipe(
  Layer.provide(sqlLive),
);
