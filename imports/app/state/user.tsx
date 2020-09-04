import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

import * as React from 'react';

interface UserContextInterface {
  isLoggingIn: boolean
  isLoggedIn: boolean
  user: Meteor.User | null
  userId: string | null
}

const userContext = React.createContext<Partial<UserContextInterface>>({});
const { Provider } = userContext

const UserContextProvider: React.FC = (props) => {
  const result = useTracker<UserContextInterface>(() => {
    return {
      isLoggedIn: !!Meteor.user(),
      isLoggingIn: Meteor.loggingIn(),
      user: Meteor.user(),
      userId: Meteor.userId()
    }
  })

  return (
    <Provider value={result}>
      {props.children}
    </Provider>
  )
}

export const UserContext = {
  Provider: UserContextProvider,
  Context: userContext
}