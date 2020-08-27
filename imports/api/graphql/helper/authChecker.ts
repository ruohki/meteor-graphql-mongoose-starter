/* import isNil from 'lodash/isNil';
import min from 'lodash/min';

import { $enum } from 'ts-enum-util';
import { AuthChecker } from 'type-graphql';
import { FluffyContext } from '..';
import { UserRole } from '@flauschig/types';

export const fluffyAuthChecker: AuthChecker<FluffyContext> = ({ context }, roles) => {
  if (isNil(context.user?.role)) return false;
  const definedRoles = $enum(UserRole).map(e => UserRole[e].toString());
  const requiredRole =  min(roles.map(r => definedRoles.indexOf(r)));
  const userRole = definedRoles.indexOf(UserRole[context.user.role]);

  return userRole <= requiredRole; 
};
 */

import { AuthChecker } from 'type-graphql';
import { GraphqlContext } from '..';

export const authChecker: AuthChecker<GraphqlContext> = ({ context }/* , roles */) => {
  if (context.userId) return true;

  return false;
}