// redacted is something that has sensitive information and you don't want to expose it to the public

import { Schema } from "@effect/schema";
import { AccessTokenNonRedacted } from "./branded";
import { Redacted } from "effect";

/**
 *  AccessToken is a redacted type of AccessTokenNonRedacted
 * string & {branded: "AccessToken} -> subtype of string
 */

export const AccessToken = Schema.Redacted(AccessTokenNonRedacted);
export type AccessToken = typeof AccessToken.Type;

export const accessTokenFromStr = (str: string) =>
  Redacted.make(AccessTokenNonRedacted.make(str));

export const accessTokenFromRedacted = (
  token: Redacted.Redacted,
): AccessToken => token as AccessToken;
