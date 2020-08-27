import { DocumentType } from '@typegoose/typegoose';
import { Accounts } from 'meteor/accounts-base'

import { Resolver, Query, Arg, Mutation, Ctx, Authorized } from "type-graphql";
import { User, Users } from "../../mongo/user.model";
import { CreateUserInput, LoginUserInput } from '../classes/user.inputTypes';

@Resolver()
export class UserResolver {
  @Query(() => User)
  @Authorized()
  async getMyself(@Ctx("user") user: User): Promise<User> {
    return user;
  }

  @Mutation(() => User, { nullable: true })
  async createUser(@Arg("user") user: CreateUserInput): Promise<User | null> {
    const result = Accounts.createUser({
      username: user.username,
      password: user.password,
      email: user.email
    })

    return Users.findById(result)
  }
  

  @Mutation(() => String, { nullable: true })
  async loginUser(@Arg("credentials") credentials: LoginUserInput): Promise<String | null> {
    const user = await Users.findOne({ $or: [
      {
        username: credentials.username
      }, {
        "emails.address": credentials.username
      }
    ]})

    if (user) {
      const { error, userId } = Accounts._checkPassword(user, credentials.password)
      if (!error) {
        const stampedLoginToken = Accounts._generateStampedLoginToken();
        Accounts._insertLoginToken(userId, stampedLoginToken);

        return stampedLoginToken.token
      }
    }

    throw Error("Username or password incorrect")
  }

  @Mutation(() => Boolean)
  @Authorized()
  async logoutAllDevices(@Ctx("user") user: DocumentType<User>): Promise<boolean> {
    return !!(await user.revokeAllTokens());
  }
}