import { gql, useQuery } from '@apollo/client';
import * as React from 'react';
import { UserContext } from './state/user';

const QUERY = gql`
  query getMyself {
    getMyself {
      id
    }
  }
`

interface PartialUser {
  id: string
}



export const App = () => {
  const user = React.useContext(UserContext.Context);
  
  const { loading, data } = useQuery<{ getMyself: PartialUser}>(QUERY, {
    fetchPolicy: 'network-only',
    skip: !user.isLoggedIn
  })


  return (
    <>
      <h1>Hallo, Welt!</h1>

      <p>Status: {user.isLoggedIn ? 'angemeldet' : 'abgemeldet'}</p>
      <p>Name: {user.isLoggedIn ? user.user?.username : 'Unbekannt'}</p>

      <p>GraphQL: {loading ? 'fetching' : 'waiting'}</p>
      <p>GraphQL UserID: {data?.getMyself.id}</p>
    </>
  )
}