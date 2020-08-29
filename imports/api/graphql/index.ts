import { WebApp } from "meteor/webapp";
import { Meteor } from "meteor/meteor";

import * as http from 'http';
import * as net from 'net';
import * as WebSocket from 'ws'

import mongoose from "mongoose";
import url from "url";

import { ApolloServer } from "apollo-server-express";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { buildSchema } from "type-graphql";
import { PubSub as ApolloPubSub } from "apollo-server-express";
import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";

import { ObjectId } from "mongodb";
import { TypegooseMiddleware } from "./helper/typegooseMiddleware";
import { ObjectIdScalar } from "./helper/scalarObjectID";
import { getUser } from "./helper/getUser";
import { authChecker } from "./helper/authChecker";

import { UserResolver } from "./resolver/user.resolvers";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";

export interface SubscriptionParams {
  authorization?: string
}

export interface GraphqlContext {
  userId?: string | null;
  user?: Meteor.User | null;
}

export const createMongoConnection = async (): Promise<typeof mongoose> => {
  const mongoUrl = process.env.MONGO_URL ?? "mongodb://localhost:3001/meteor";

  const mongo = await mongoose.connect(mongoUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  return mongo;
};

const createRedisPubSub = (redisUrl: string) => {
  return new RedisPubSub({
    publisher: new Redis(redisUrl),
    subscriber: new Redis(redisUrl),
  });
};

const createApolloPubSub = () => new ApolloPubSub();

export const createApolloServer = async () => {
  await createMongoConnection();

  const useRedis: string | undefined = process.env?.REDIS_URL ?? undefined;
  const pubSub = useRedis ? createRedisPubSub(process.env.REDIS_URL!) : createApolloPubSub();

  const schema = await buildSchema({
    resolvers: [UserResolver],
    pubSub,
    authChecker,
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
    globalMiddlewares: [TypegooseMiddleware],
    validate: true,
  });

  const server = new ApolloServer({
    schema: schema,
    playground: true,
    tracing: true,
    context: async (context: ExpressContext): Promise<GraphqlContext> => {
      if (!context?.req?.headers) return {};
      if (!context?.req?.headers.authorization) return {};

      const { authorization } = context.req.headers;
      const user = await getUser(authorization);

      return user ? {
        user,
        userId: user?._id,
      } : {};
    },
  });

  const subscriptionServer = new SubscriptionServer({
    schema,
    execute,
    subscribe,
    onConnect: async (params: SubscriptionParams) => {
      if (params.authorization) {
        const user = await getUser(params.authorization);
        return user ? {
          user,
          userId: user?._id,
        } : {};
      }
    }
  }, {
    noServer: true,
  });

  server.applyMiddleware({
    //@ts-ignore this is compatible and stated in the docs of apollo-server-express to be compatible
    app: WebApp.connectHandlers,
    path: "/graphql",
  });

  WebApp.connectHandlers.use("/graphql", (req: http.IncomingMessage, res: http.ServerResponse) => {
    if (req.method === "GET") res.end();
  });

  //@ts-ignore we need to access the private field wich typescript does not like
  const wsServer: WebSocket.Server = subscriptionServer.wsServer;
  const upgradeHandler = (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    if (!req.url) return;
    const pathname = url.parse(req.url).pathname;

    if (!pathname) return
    if (pathname.startsWith("/graphql")) {
      wsServer.handleUpgrade(req, socket, head, (ws) => {
        wsServer.emit("connection", ws, req);
      });
    }
  };
  WebApp.httpServer.on("upgrade", upgradeHandler);
};
