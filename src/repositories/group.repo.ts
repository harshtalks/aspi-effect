import { Context, Effect, Layer } from "effect";
import { ContextTags } from "./tags";
import { Model } from "@effect/sql";
import { Group } from "../domains/group";
import { MakeService } from "../utilities/with-effect";
import { sqlLive } from "../requirements/sql";

const makeGroupsRepo = Model.makeRepository(Group, {
  tableName: "groups",
  spanPrefix: "GroupsRepo",
  idColumn: "id",
});

export class GroupsRepo extends Context.Tag(
  ContextTags.groups.pipe(Effect.runSync),
)<GroupsRepo, MakeService<typeof makeGroupsRepo>>() {}

export const groupsRepoLive = Layer.succeed(
  GroupsRepo,
  GroupsRepo.of(
    makeGroupsRepo.pipe(Effect.provide(sqlLive)).pipe(Effect.runSync),
  ),
);
