import { WebApp } from 'meteor/webapp';
import { Meteor } from 'meteor/meteor';

import mongoose from 'mongoose';

import { ApolloServer } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { buildSchema } from 'type-graphql';
import { PubSub as ApolloPubSub } from 'apollo-server-express';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as Redis from 'ioredis'

import { ObjectId } from "mongodb";
import { TypegooseMiddleware } from './helper/typegooseMiddleware';
import { ObjectIdScalar } from './helper/scalarObjectID';
import { getUser } from './helper/getUser';
import { authChecker } from './helper/authChecker';

import { UserResolver } from './resolver/user.resolvers';

export interface GraphqlContext {
  userId?: string | null
  user?: Meteor.User | null
}

export const createMongoConnection = async (): Promise<typeof mongoose> => {
  const mongoUrl = process.env.MONGO_URL ?? "mongodb://localhost:3001/meteor"
  
  const mongo = await mongoose.connect(mongoUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })

  //mongo.set("debug", true);
  return mongo;
}

const createRedisPubSub = (redisUrl: string) => {
  return new RedisPubSub({
    publisher: new Redis.default(redisUrl),
    subscriber: new Redis.default(redisUrl)
  });
}

const createApolloPubSub = () => new ApolloPubSub()

export const createApolloServer = async () => {
  await createMongoConnection();

  const useRedis: string | boolean = process.env?.REDIS_URL ?? false
  const pubSub = useRedis ? createRedisPubSub(useRedis) : createApolloPubSub();

  const schema = await buildSchema({
    resolvers: [
      UserResolver
    ],
    pubSub,
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
  
  server.installSubscriptionHandlers(WebApp.httpServer)
  
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


