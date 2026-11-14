/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query RbacAccessBoard {\n  tenantDirectoryUsers(limit: 200) {\n    id\n    username\n    email\n    isActive\n  }\n  tenantDirectoryRoles(limit: 200) {\n    id\n    name\n    description\n    isSystemRole\n  }\n  tenantCatalogPermissions(limit: 500) {\n    id\n    resource\n    action\n    description\n    supportedScopeTypes\n  }\n}\n\nquery RoleAccessConfiguration($roleId: ID!) {\n  permissionIdsForRole(roleId: $roleId)\n  permissionScopesForRole(roleId: $roleId) {\n    resource\n    action\n    scopeType\n  }\n}\n\nmutation SetRoleAccess($roleId: ID!, $permissionIds: [ID!]!, $scopes: [PermissionScopeAssignmentInput!]!) {\n  setRoleAccess(roleId: $roleId, permissionIds: $permissionIds, scopes: $scopes)\n}": typeof types.RbacAccessBoardDocument,
};
const documents: Documents = {
    "query RbacAccessBoard {\n  tenantDirectoryUsers(limit: 200) {\n    id\n    username\n    email\n    isActive\n  }\n  tenantDirectoryRoles(limit: 200) {\n    id\n    name\n    description\n    isSystemRole\n  }\n  tenantCatalogPermissions(limit: 500) {\n    id\n    resource\n    action\n    description\n    supportedScopeTypes\n  }\n}\n\nquery RoleAccessConfiguration($roleId: ID!) {\n  permissionIdsForRole(roleId: $roleId)\n  permissionScopesForRole(roleId: $roleId) {\n    resource\n    action\n    scopeType\n  }\n}\n\nmutation SetRoleAccess($roleId: ID!, $permissionIds: [ID!]!, $scopes: [PermissionScopeAssignmentInput!]!) {\n  setRoleAccess(roleId: $roleId, permissionIds: $permissionIds, scopes: $scopes)\n}": types.RbacAccessBoardDocument,
};

/**
 * The rbacGraphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = rbacGraphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function rbacGraphql(source: string): unknown;

/**
 * The rbacGraphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function rbacGraphql(source: "query RbacAccessBoard {\n  tenantDirectoryUsers(limit: 200) {\n    id\n    username\n    email\n    isActive\n  }\n  tenantDirectoryRoles(limit: 200) {\n    id\n    name\n    description\n    isSystemRole\n  }\n  tenantCatalogPermissions(limit: 500) {\n    id\n    resource\n    action\n    description\n    supportedScopeTypes\n  }\n}\n\nquery RoleAccessConfiguration($roleId: ID!) {\n  permissionIdsForRole(roleId: $roleId)\n  permissionScopesForRole(roleId: $roleId) {\n    resource\n    action\n    scopeType\n  }\n}\n\nmutation SetRoleAccess($roleId: ID!, $permissionIds: [ID!]!, $scopes: [PermissionScopeAssignmentInput!]!) {\n  setRoleAccess(roleId: $roleId, permissionIds: $permissionIds, scopes: $scopes)\n}"): (typeof documents)["query RbacAccessBoard {\n  tenantDirectoryUsers(limit: 200) {\n    id\n    username\n    email\n    isActive\n  }\n  tenantDirectoryRoles(limit: 200) {\n    id\n    name\n    description\n    isSystemRole\n  }\n  tenantCatalogPermissions(limit: 500) {\n    id\n    resource\n    action\n    description\n    supportedScopeTypes\n  }\n}\n\nquery RoleAccessConfiguration($roleId: ID!) {\n  permissionIdsForRole(roleId: $roleId)\n  permissionScopesForRole(roleId: $roleId) {\n    resource\n    action\n    scopeType\n  }\n}\n\nmutation SetRoleAccess($roleId: ID!, $permissionIds: [ID!]!, $scopes: [PermissionScopeAssignmentInput!]!) {\n  setRoleAccess(roleId: $roleId, permissionIds: $permissionIds, scopes: $scopes)\n}"];

export function rbacGraphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;