import mongoose from 'mongoose';

import { ApolloServer } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

import { buildSchema } from 'type-graphql';
import { ObjectId } from "mongodb";

//import { DocumentType } from '@typegoose/typegoose';
import { TypegooseMiddleware } from './helper/typegooseMiddleware';

import { ObjectIdScalar } from './helper/scalarObjectID';

import { UserResolver } from './resolver/user.resolvers';

import { getUser } from './helper/getUser';
import { WebApp } from 'meteor/webapp';
import { Meteor } from 'meteor/meteor';
import { authChecker } from './helper/authChecker';

export interface GraphqlContext {
  userId?: string | null
  user?: Meteor.User | null
}

export const createMongoConnection = async (): Promise<typeof mongoose> => {
  const mongoUrl = process.env.MONGO_URL ?? "mongodb://localhost:3001/meteor"
  
  return mongoose.connect(mongoUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
}

export const createApolloServer = async () => {
  await createMongoConnection();

  const schema = await buildSchema({
    resolvers: [
      UserResolver
    ],
    authChecker,
    //@ts-ignore
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
    globalMiddlewares: [TypegooseMiddleware],
    validate: true,
  });
  
  const server = new ApolloServer({
    schema: schema,
    playground: true,
    tracing: true,
    context: async(context: ExpressContext): Promise<GraphqlContext> => {
      if (!context?.req?.headers) return { };
      if (!context?.req?.headers.authorization) return {}
      
      const { authorization, "user-agent": userAgent = "Unknown" } = context.req.headers;
      const user = await getUser(authorization, userAgent);
      
      return user ? {
        user,
        userId: user?._id
      } : { }
    },
  });
  
  //@ts-ignore
  server.applyMiddleware({
    //@ts-ignore
    app: WebApp.connectHandlers,
    path: '/graphql'
  })

  WebApp.connectHandlers.use('/graphql', (req: Express.Response, res: Express.Response) => {
    //@ts-ignore
    if (req.method === 'GET') {
      //@ts-ignore
      res.end()
    }
  })
}


