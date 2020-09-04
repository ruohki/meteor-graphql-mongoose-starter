import * as React from 'react';
import { render } from 'react-dom'
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { App } from './App';
import { UserContext } from './state/user';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = Accounts._storedLoginToken();
  return {
    headers: Object.assign({}, headers, token ? {
      authorization: token
    }: undefined)
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export const WrappedApp = () => (
  <ApolloProvider client={client}>
    <UserContext.Provider>
      <App />
    </UserContext.Provider>
  </ApolloProvider>
);

Meteor.startup(() => {
  render(<WrappedApp />, document.getElementById("root"));
})