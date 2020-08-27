import { Meteor } from 'meteor/meteor';
import  { createApolloServer } from '../api/graphql';

import '../api/meteor/accounts';

Meteor.startup(() => {
  
  createApolloServer();
})