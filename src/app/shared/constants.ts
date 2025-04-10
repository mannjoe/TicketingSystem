import { ViewTableColumn } from "@interfaces/ViewTable.interface";

export const USERS_COLUMN_MAPPINGS: ViewTableColumn[] = [
  { key: 'username', label: 'Username', visible: true },
  { key: 'fullName', label: 'Full Name', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'role', label: 'Role', visible: true },
  { key: 'active', label: 'Active', visible: true },
];

export const CUSTOMERS_COLUMN_MAPPINGS: ViewTableColumn[] = [
  { key: 'name', label: 'Full Name', visible: true },
  { key: 'identifierNo', label: 'Identifier No', visible: true },
  { key: 'type', label: 'Type', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'phone', label: 'Phone', visible: true },
  { key: 'active', label: 'Active', visible: true },
  { key: 'address', label: 'Address', visible: false },
];