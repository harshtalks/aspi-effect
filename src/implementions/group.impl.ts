import { Context, Effect, Layer, Option } from "effect";
import { GroupsRepo, groupsRepoLive } from "../repositories/group.repo";
import { SqlClient } from "@effect/sql/SqlClient";
import { AccountId, GroupId } from "../domains/branded";
import { Group, GroupNotFound } from "../domains/group";
import { policyRequire } from "../domains/policy";
import { MakeService } from "../utilities/with-effect";
import { sqlLive } from "../requirements/sql";

const makeGroupsImpl = Effect.all([GroupsRepo, SqlClient]).pipe(
  Effect.andThen(([groupsRepo, sql]) => {
    const createGroup = (
      ownerId: AccountId,
      group: typeof Group.jsonCreate.Type,
    ) =>
      groupsRepo
        .insert(
          Group.insert.make({
            ...group,
            ownerId: ownerId,
          }),
        )
        .pipe(
          Effect.withSpan("Groups.create", {
            attributes: {
              group,
              ownerId,
            },
          }),
          policyRequire("Group", "create"),
        );

    const updateGroup = (
      group: Group,
      update: Partial<typeof Group.jsonUpdate.Type>,
    ) =>
      groupsRepo
        .update({
          ...group,
          ...update,
          updatedAt: undefined,
        })
        .pipe(
          Effect.withSpan("Groups.updateGroup"),
          policyRequire("Group", "update"),
        );

    const findById = (id: GroupId) =>
      groupsRepo
        .findById(id)
        .pipe(
          Effect.withSpan("Groups.findById"),
          policyRequire("Group", "read"),
        );

    const with_ = <A, E, R>(
      id: GroupId,
      f: (group: Group) => Effect.Effect<A, E, R>,
    ) => {
      return groupsRepo.findById(id).pipe(
        Effect.andThen(
          Option.match({
            onSome: Effect.succeed,
            onNone: () => new GroupNotFound({ id }),
          }),
        ),
        Effect.andThen(f),
        sql.withTransaction,
        Effect.catchTag("SqlError", (err) => Effect.die(err)),
        Effect.withSpan("Groups.with", { attributes: { id } }),
      );
    };

    return {
      updateGroup,
      createGroup,
      findById,
      with: with_,
    } as const;
  }),
);

export class Groups extends Context.Tag("@impl/groups")<
  Groups,
  MakeService<typeof makeGroupsImpl>
>() {}

export const groupsLive = Layer.effect(Groups, makeGroupsImpl).pipe(
  Layer.provide(sqlLive),
  Layer.provide(groupsRepoLive),
);
