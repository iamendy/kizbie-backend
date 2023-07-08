import { RolesBuilder } from 'nest-access-control';
import { Role } from './enums';

export const RBAC_POLICY: RolesBuilder = new RolesBuilder();

RBAC_POLICY.grant(Role.USER)
  .read('book')
  .readAny('book')
  .create('comment')
  .updateOwn('comment')
  .deleteOwn('comment')
  .grant(Role.EDITOR)
  .extend(Role.USER)
  .create('book')
  .update('book', ['title'])
  .delete('book')
  .delete('deleteComment');
