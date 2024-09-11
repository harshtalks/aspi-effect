import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { isHttpApiGroup } from "@effect/platform/HttpApiGroup";
import { Group, GroupNotFound } from "../domains/group";
import { Schema } from "@effect/schema";
import { brandedGroupId } from "../domains/branded";
import { Unauthorized } from "../domains/policy";
import { security } from "../annonations/security";

// Apis for group
export class GroupsApi extends HttpApiGroup.make("groups").pipe(
  // Post /groups
  HttpApiGroup.add(
    HttpApiEndpoint.post("createGroup", "/").pipe(
      HttpApiEndpoint.setSuccess(Group.json),
      HttpApiEndpoint.setPayload(Group.jsonCreate),
    ),
  ),
  // Patch /groups/:id
  HttpApiGroup.add(
    HttpApiEndpoint.post("updateGroup", "/:id").pipe(
      HttpApiEndpoint.setSuccess(Group.json),
      HttpApiEndpoint.setPayload(Group.jsonUpdate),
      HttpApiEndpoint.setPath(
        Schema.Struct({
          id: brandedGroupId,
        }),
      ),
      HttpApiEndpoint.addError(GroupNotFound),
    ),
  ),
  // get /groups/:id
  HttpApiGroup.add(
    HttpApiEndpoint.get("getGroup", "/:id").pipe(
      HttpApiEndpoint.setSuccess(Group.json),
      HttpApiEndpoint.setPath(
        Schema.Struct({
          id: brandedGroupId,
        }),
      ),
      HttpApiEndpoint.addError(GroupNotFound),
    ),
  ),
  // add prefix to all the apis - /groups
  HttpApiGroup.prefix("/groups"),
  // annoations
  HttpApiGroup.addError(Unauthorized),
  OpenApi.annotate({
    title: "Groups",
    description: "Manage groups",
    security: security,
  }),
) {}
