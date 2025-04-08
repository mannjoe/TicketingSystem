import { ViewTableColumn } from "@interfaces/ViewTable.interface";

export const USERS_COLUMN_MAPPINGS: ViewTableColumn[] = [
  { key: 'username', label: 'Username', visible: true },
  { key: 'fullName', label: 'Full Name', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'role', label: 'Role', visible: true },
  { key: 'active', label: 'Active', visible: true },
];