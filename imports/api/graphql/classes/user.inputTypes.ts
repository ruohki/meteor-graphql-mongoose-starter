import { IsEmail, Length, Matches } from 'class-validator';
import { Field, InputType } from "type-graphql";

@InputType()
export class CreateUserInput {
  @Field()
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
  username: string

  @Field()
  @Length(5)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
  password: string
}