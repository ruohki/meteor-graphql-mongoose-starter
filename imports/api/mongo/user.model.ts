import { Meteor } from 'meteor/meteor';
import {
  prop as Property,
  modelOptions as Options,
  getModelForClass, DocumentType
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { UserEmail, UserProfile, UserService } from '../graphql/classes/user.objectTypes';

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
}
 

export const Users = getModelForClass(User);