import { prop as Property } from '@typegoose/typegoose';
import { IsEmail, IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class UserResetPassword {
  @Property()
  @Field()
  token: string

  @Property()
  @Field()
  @IsEmail()
  email: string

  @Property()
  @Field()
  when: Date

  @Property()
  @Field()
  reason: string
}

@ObjectType()
export class UserPasswordService {
  @Property()
  @Field()
  bcrypt?: string

  @Property()
  @Field(() => UserResetPassword, { nullable: true })
  reset?: UserResetPassword
}

@ObjectType()
export class UserProfile {
  @Property()
  @IsUrl()
  @Field()
  avatar?: string
}

@ObjectType()
export class UserLoginToken {
  @Property()
  @Field()
  when?: Date

  @Property()
  @Field()
  hashedToken?: string

  @Property()
  @Field({ nullable: true })
  agent?: string
}

@ObjectType()
export class UserEmailVerficationToken {
  @Property()
  @Field()
  token: string

  @Property()
  @IsEmail()
  @Field()
  address: string

  @Property()
  @Field()
  when: Date
}

@ObjectType()
export class UserEmailService {
  @Property({ default: [], _id: false, type: UserEmailVerficationToken })
  @Field(() => [UserEmailVerficationToken] ,{ defaultValue: []})
  verificationTokens?: UserEmailVerficationToken[]
}

@ObjectType()
export class UserResumeService {
  @Property({ _id: false, type: UserLoginToken })
  @Field(() => [UserLoginToken], { nullable: true })
  loginTokens?: UserLoginToken[]
}

@ObjectType()
export class UserService {
  @Property({ type: UserPasswordService })
  @Field(() => UserPasswordService)
  password: UserPasswordService

  @Property({ type: UserResumeService })
  @Field(() => UserResumeService)
  resume: UserResumeService

  // TODO: restrict access to admins only
  @Property({ type: UserEmailService })
  @Field(() => UserEmailService)
  email: UserEmailService
}

@ObjectType()
export class UserEmail {
  @Property()
  @IsEmail()
  @Field()
  address: string

  @Property({ default: false })
  @Field()
  verified: boolean
}