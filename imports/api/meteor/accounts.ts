import { Accounts } from 'meteor/accounts-base'
import { getUser } from '../graphql/helper/getUser';

Accounts.onLogin((options) => {
  if (options.allowed && options.user) {
    // Update user agent 
    console.log(options.user.services.resume)
    const token = options?.methodArguments[0]?.resume
    getUser(token, options.connection.httpHeaders["user-agent"]);
  }
})

const saved = Accounts._insertHashedLoginToken
Accounts._insertHashedLoginToken = function (userId, hashedToken, query) {
  console.log(userId, this)
  saved(userId, hashedToken, query);
};