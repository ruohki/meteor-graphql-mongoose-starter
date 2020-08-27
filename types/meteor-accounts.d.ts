import { Meteor } from 'meteor/meteor';
declare module "meteor/accounts-base" {
  interface stampedLoginToken {
    token: string
    when: Date
  }
  type headerKey = "x-forwarded-for" | "x-forwarded-port" | "x-forwarded-proto" | "host" | "user-agent" | "accept-language"
  interface Connection {
    id: string
    close: () => void
    onClose: () => void
    clientAddress: string
    httpHeaders: Record<headerKey, string>
  }

  interface LoginOptions {
    type: string,
    allowed: boolean,
    methodName: string,
    methodArguments: any,
    user: Meteor.User,
    connection: Connection
  }

  module Accounts {
    function _hashLoginToken(token: string): string;
    function _generateStampedLoginToken(): stampedLoginToken;
    function _insertLoginToken(userId: string, token: stampedLoginToken): void;
    function _tokenExpiration(when: Date): Date
    function validateLoginAttempt( func: (options: LoginOptions) => boolean ): void;
    function onLogin( func: (options: LoginOptions) => boolean ): void;
  }
}
