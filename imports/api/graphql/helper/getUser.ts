import { Accounts } from 'meteor/accounts-base'
import { check } from 'meteor/check'
import { DocumentType } from '@typegoose/typegoose'
import { User, Users } from '../../mongo/user.model'

export const getUser = async (loginToken: string, agent: string): Promise<DocumentType<User> | undefined > => {
  if (loginToken) {
    check(loginToken, String)

    const hashedToken = Accounts._hashLoginToken(loginToken)

    const user = await Users.findOne({
      'services.resume.loginTokens.hashedToken': hashedToken
    })

    if (user) {
      // find the right login token corresponding, the current user may have
      // several sessions logged on different browsers / computers
      const tokenInformation = user.services?.resume?.loginTokens?.find(
        tokenInfo => tokenInfo.hashedToken === hashedToken
      )

      if (tokenInformation?.when) {
        const expiresAt = Accounts._tokenExpiration(tokenInformation.when)
        const isExpired = expiresAt < new Date()
  
        if (!isExpired) {
          // Addition if not expired update the agent string
          user.services.resume.loginTokens?.map(tokenInfo => {
            if (tokenInfo.hashedToken === hashedToken && tokenInfo.agent !== agent) {
              tokenInfo.agent = agent;
              user.save();
            }
          })

          return user
        }
      }
    }
  }
}