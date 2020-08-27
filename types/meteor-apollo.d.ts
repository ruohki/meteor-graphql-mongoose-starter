import { Meteor } from 'meteor/meteor';
import { GraphQLSchema } from 'graphql';

declare module "meteor/apollo" {
	
	export function createApolloServer(customOptions: GraphQLOptions, customConfig?: customApolloServerConfig): void;
	export function getUser(loginToken: string): Meteor.User;

	export interface GraphQLOptions {
		schema: GraphQLSchema;	// values to be used as context and rootValue in resolvers
		context?: Object;	// value to be used as context in resolvers
		rootValue?: Object;	// value to be used as rootValue in resolvers
		formatError?: Function;	// function used to format errors before returning them to clients
		validationRules?: Array<Function>;	// additional validation rules to be applied to client-specified queries
		formatParams?: Function;	// function applied for each query in a batch to format parameters before passing them to `runQuery`
		formatResponse?: Function;	// function applied to each response before returning data to clients
		debug?: boolean;	// a boolean option that will trigger additional debug logging if execution errors occur
	}

	export interface customApolloServerConfig {
		path?: string;
		configServer?: (server: any) => void;
		graphiql?: boolean;
		graphiqlPath?: string;
		graphiqlOptions?: graphiqlOptions;
	}

	export interface graphiqlOptions {
		endpointURL: string; // URL for the GraphQL endpoint this instance of GraphiQL serves
		query?: string; // optional query to pre-populate the GraphiQL UI with
		operationName?: string; // optional operationName to pre-populate the GraphiQL UI with
		variables?: {}; // optional variables to pre-populate the GraphiQL UI with
		result?: {}; // optional result to pre-populate the GraphiQL UI with
	}


}