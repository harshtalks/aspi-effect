import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { Schema } from "@effect/schema";
import { brandedGroupId } from "../domains/branded";
import { Person } from "../domains/person";
import { GroupNotFound } from "../domains/group";
import { Unauthorized } from "../domains/policy";
import { security } from "../annonations/security";

// People API
export class PeopleApi extends HttpApiGroup.make("people").pipe(
  HttpApiGroup.add(
    HttpApiEndpoint.post("createPeople", "/groups/:groupId/people").pipe(
      HttpApiEndpoint.setPath(
        Schema.Struct({
          groupId: brandedGroupId,
        }),
      ),
      HttpApiEndpoint.setSuccess(Person.json),
      HttpApiEndpoint.setPayload(Person.jsonCreate),
      HttpApiEndpoint.addError(GroupNotFound),
    ),
  ),
  HttpApiGroup.prefix("/people"),
  HttpApiGroup.addError(Unauthorized),
  OpenApi.annotate({
    security: security,
    title: "People",
    description: "Manage people",
  }),
) {}
