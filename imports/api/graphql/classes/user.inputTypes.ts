import { IsEmail, Length, Matches } from 'class-validator';
import { Field, InputType } from "type-graphql";

@InputType()
export class CreateUserInput {
  @Field()
  @Length(5)
  username: string

  @Field()
  @Length(5)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
  password: string

  @Field()
  @IsEmail()
  email: string
}

@InputType()
export class LoginUserInput {
  @Field()
  @Length(5)
  username: string

  @Field()
  @Length(5)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
  password: string
}

@InputType()
export class VerifyEmailInput {
  @Field()
  token: string
}

@InputType()
export class ChangeUsernameInput {
  @Field()
  @Length(5)
  username: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  @Length(5)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
  password: string;
}

@InputType()
export class EmailInput {
  @Field()
  @IsEmail()
  email: string;
}