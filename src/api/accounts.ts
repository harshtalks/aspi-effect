import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import {
  brandedUserId,
  User,
  UserNotFound,
  UserWithSensitiveInfo,
} from "../domains/user";
import { Schema } from "@effect/schema";
import { security } from "../annonations/security";
import { Unauthorized } from "../domains/policy";

export class AccountsApi extends HttpApiGroup.make("Accounts").pipe(
  // GET /users/me
  HttpApiGroup.add(
    HttpApiEndpoint.get("me", "/users/me").pipe(
      HttpApiEndpoint.setSuccess(UserWithSensitiveInfo.json),
    ),
  ),
  // get /users/:id
  HttpApiGroup.add(
    HttpApiEndpoint.get("getUser", "/users/:id").pipe(
      HttpApiEndpoint.setSuccess(User.json),
      HttpApiEndpoint.setPath(
        Schema.Struct({
          id: brandedUserId,
        }),
      ),
      HttpApiEndpoint.addError(UserNotFound),
    ),
  ),
  // Patch /users/:id
  HttpApiGroup.add(
    HttpApiEndpoint.patch("updateUser", "/users/:id").pipe(
      HttpApiEndpoint.setPath(
        Schema.Struct({
          id: brandedUserId,
        }),
      ),
      HttpApiEndpoint.setSuccess(User.json),
      HttpApiEndpoint.addError(UserNotFound),
      HttpApiEndpoint.setPayload(
        Schema.partialWith(User.jsonUpdate, { exact: true }),
      ),
    ),
  ),
  // All the above apis are protected.
  HttpApiGroup.annotateEndpoints(OpenApi.Security, security),
  HttpApiGroup.addError(Unauthorized),

  // non protected api
  // POST /users
  HttpApiGroup.add(
    HttpApiEndpoint.post("createUser", "/users").pipe(
      HttpApiEndpoint.setPayload(User.jsonCreate),
      HttpApiEndpoint.setSuccess(UserWithSensitiveInfo.json),
    ),
  ),
) {}
