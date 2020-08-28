import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base'

import {
  prop as Property,
  modelOptions as Options,
  getModelForClass, DocumentType
} from '@typegoose/typegoose';

import { Field, ObjectType } from 'type-graphql';
import { UserEmail, UserProfile, UserService } from '../graphql/classes/user.objectTypes';
import { ModelType } from '@typegoose/typegoose/lib/types';

@Options({
  schemaOptions: { versionKey: false },
  options: { automaticName: false, customName: "users" }
})
@ObjectType()
export class User implements Meteor.User {
  @Property()
  @Field({ name: "id" })
  _id: string
  
  @Property()
  @Field()
  createdAt?: Date
  
  @Property()
  @Field({ nullable: true })
  username?: string
  
  @Property({ _id: false, type: UserEmail })
  @Field(() => [UserEmail], { nullable: true })
  emails?: UserEmail[]
  
  @Property({ type: UserProfile })
  @Field(() => UserProfile, { nullable: true })
  profile?: UserProfile
  
  @Property({ type: UserService })
  @Field(() => UserService)
  services: UserService

  public async revokeAllTokens(this: DocumentType<User>): Promise<DocumentType<User>> {
    this.services.resume.loginTokens = [];
    return this.save();
  }

  public removeEmail(this: DocumentType<User>, email: string): boolean {
    Accounts.removeEmail(this._id, email)
    return true;
  }

  public addEmail(this: DocumentType<User>, email: string, verified: boolean): boolean {
    Accounts.addEmail(this._id, email, verified)
    return true;
  }

  public changeUsername(this: DocumentType<User>, username: string): boolean {
    Accounts.setUsername(this._id, username)
    return true;
  }

  public changePassword(this: DocumentType<User>, password: string, logout: boolean): boolean {
    Accounts.setPassword(this._id, password, { logout })
    return true;
  }

  public static async verifyEmail(this: ModelType<User>, token: string): Promise<boolean> {

    const user = await this.findOne({
      'services.email.verificationTokens.token': token
    });

    if (!user)
      throw new Meteor.Error(403, "Verify email link expired");

      const tokenRecord = user.services.email?.verificationTokens?.find(
        t => t.token == token
      );
    if (!tokenRecord) return false

    const emailsRecord = user.emails?.find(
      e => e.address == tokenRecord.address
    );

    if (!emailsRecord) return false

    return !!(await Users.updateOne({
      _id: user._id,
      'emails.address': tokenRecord.address
    }, {
      $set: { 'emails.$.verified': true },
      $pull: {
        'services.email.verificationTokens': {
          address: tokenRecord.address
        }
      }
    }));
  }
}

export const Users = getModelForClass(User);