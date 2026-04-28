import { gql } from 'graphql-request';

export const OPS_TENANTS = gql`
  query OpsTenants($limit: Int) {
    tenants(limit: $limit) {
      id
      name
      status
      plan
      country
      currency
      subdomain
      createdAt
      updatedAt
    }
  }
`;

/** Operator view: include inactive modules from catalog. */
export const OPS_MODULES = gql`
  query OpsModules($limit: Int) {
    modules(limit: $limit, includeInactive: true) {
      id
      code
      name
      category
      description
      isActive
      displayOrder
      isCore
    }
  }
`;

export const OPS_FEATURE_FLAGS = gql`
  query OpsFeatureFlags($tenantId: ID!, $limit: Int) {
    featureFlags(tenantId: $tenantId, limit: $limit) {
      id
      tenantId
      featureName
      isEnabled
      createdAt
      updatedAt
    }
  }
`;

export const OPS_PROVISION_TENANT = gql`
  mutation OpsProvisionTenant($input: ProvisionTenantInput!) {
    provisionTenant(input: $input) {
      schemaName
      migrationsRan
      detail
      tenant {
        id
        name
        status
        subdomain
      }
    }
  }
`;

export const OPS_RUN_TENANT_MIGRATIONS = gql`
  mutation OpsRunTenantMigrations($tenantId: ID!) {
    runTenantMigrations(tenantId: $tenantId) {
      schemaName
      migrationsRan
      detail
      tenant {
        id
        name
        status
      }
    }
  }
`;

export const OPS_UPDATE_TENANT = gql`
  mutation OpsUpdateTenant($input: UpdateTenantInput!) {
    updateTenant(input: $input) {
      id
      name
      status
      plan
    }
  }
`;

export const OPS_UPSERT_SUBSCRIPTION = gql`
  mutation OpsUpsertSubscription($input: UpsertTenantSubscriptionInput!) {
    upsertTenantSubscription(input: $input) {
      id
      tenantId
      moduleId
      status
      contractedSeats
      currentSeatUsage
      overagePolicy
    }
  }
`;

export const OPS_REMOVE_SUBSCRIPTION = gql`
  mutation OpsRemoveSubscription($subscriptionId: ID!) {
    removeTenantSubscription(subscriptionId: $subscriptionId)
  }
`;

export const OPS_SET_MODULE_ACTIVE = gql`
  mutation OpsSetModuleActive($moduleId: ID!, $isActive: Boolean!) {
    setModuleActive(moduleId: $moduleId, isActive: $isActive) {
      id
      code
      isActive
    }
  }
`;

export const OPS_UPSERT_FEATURE_FLAG = gql`
  mutation OpsUpsertFeatureFlag($tenantId: ID!, $featureName: String!, $isEnabled: Boolean!) {
    upsertFeatureFlag(tenantId: $tenantId, featureName: $featureName, isEnabled: $isEnabled) {
      id
      featureName
      isEnabled
    }
  }
`;

export const OPS_SUBSCRIPTIONS = gql`
  query OpsSubscriptions($tenantId: ID, $limit: Int) {
    tenantSubscriptions(tenantId: $tenantId, limit: $limit) {
      id
      tenantId
      moduleId
      status
      activatedAt
      expiresAt
      contractedSeats
      currentSeatUsage
      overagePolicy
    }
  }
`;

export const OPS_INVOICES = gql`
  query OpsInvoices($tenantId: ID, $limit: Int) {
    invoices(tenantId: $tenantId, limit: $limit) {
      id
      tenantId
      billingCycleId
      invoiceNumber
      subtotal
      discountTotal
      taxAmount
      totalAmount
      currency
      status
      dueDate
      sentAt
      paidAt
      createdAt
    }
  }
`;

export const OPS_PAYMENTS = gql`
  query OpsPayments($invoiceId: ID, $limit: Int) {
    payments(invoiceId: $invoiceId, limit: $limit) {
      id
      invoiceId
      amount
      paymentMethod
      status
      paidAt
      gatewayRef
      failureReason
      createdAt
    }
  }
`;

export const OPS_OPERATOR_USERS = gql`
  query OpsOperatorUsers($limit: Int) {
    operatorUsers(limit: $limit) {
      id
      email
      fullName
      phone
      isActive
      lastLoginAt
      createdAt
    }
  }
`;

export const OPS_OPERATOR_ROLES = gql`
  query OpsOperatorRoles($limit: Int) {
    operatorRoles(limit: $limit) {
      id
      code
      name
      description
      createdAt
    }
  }
`;
