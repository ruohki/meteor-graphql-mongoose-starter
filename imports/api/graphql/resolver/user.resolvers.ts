import { DocumentType } from '@typegoose/typegoose';
import { Accounts } from 'meteor/accounts-base'

import { Resolver, Query, Arg, Mutation, Ctx, Authorized } from "type-graphql";
import { User, Users } from "../../mongo/user.model";
import { ChangeUsernameInput, CreateUserInput, EmailInput, LoginUserInput, VerifyEmailInput } from '../classes/user.inputTypes';

@Resolver()
export class UserResolver {
  @Query(() => User)
  @Authorized()
  async getMyself(@Ctx("user") user: User): Promise<User> {
    return user;
  }

  @Mutation(() => User, { nullable: true })
  async createUser(@Arg("input") input: CreateUserInput): Promise<User | null> {
    const result = Accounts.createUser({
      username: input.username,
      password: input.password,
      email: input.email
    })

    return Users.findById(result)
  }
  

  @Mutation(() => String, { nullable: true })
  async loginUser(@Arg("input") credentials: LoginUserInput): Promise<String | null> {
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
  
  @Mutation(() => Boolean)
  async verifyEmail(@Arg("input") input: VerifyEmailInput): Promise<boolean> {
    return Users.verifyEmail(input.token);
  }

  @Mutation(() => Boolean)
  @Authorized()
  async changeUsername(@Arg("input") input: ChangeUsernameInput, @Ctx("user") user: DocumentType<User>): Promise<Boolean> {
    return user.changeUsername(input.username);
  }

  @Mutation(() => Boolean)
  @Authorized()
  async sendVerificationEmail(@Arg("input") input: EmailInput, @Ctx("user") user: DocumentType<User>): Promise<boolean> {
    Accounts.sendVerificationEmail(user._id, input.email)
    return true;
  }
  
}
