// Constants for form dropdowns

export const contractTypes = [
    { value: 'FIXED_PRICE', label: 'Fixed Price' },
    { value: 'TIME_AND_MATERIAL', label: 'Time & Material' },
    { value: 'RETAINER', label: 'Retainer' },
    { value: 'DEDICATED_TEAM', label: 'Dedicated Team' },
];

export const currencies = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'INR', label: 'INR' },
];

export const projectStatuses = [
    { value: 'PLANNING', label: 'Planning', color: 'info' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'primary' },
    { value: 'ON_HOLD', label: 'On Hold', color: 'warning' },
    { value: 'COMPLETED', label: 'Completed', color: 'success' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'error' },
];

export const billingTypes = [
    { value: 'BILLABLE', label: 'Billable' },
    { value: 'NON_BILLABLE', label: 'Non-Billable' },
    { value: 'INTERNAL', label: 'Internal' },
];

export const taskPriorities = [
    { value: 'LOW', label: 'Low', color: 'success' },
    { value: 'MEDIUM', label: 'Medium', color: 'info' },
    { value: 'HIGH', label: 'High', color: 'warning' },
    { value: 'URGENT', label: 'Urgent', color: 'error' },
];

export const taskStatuses = [
    { value: 'OPEN', label: 'Open', color: 'default' },
    { value: 'ASSIGNED', label: 'Assigned', color: 'info' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'primary' },
    { value: 'IN_REVIEW', label: 'In Review', color: 'secondary' },
    { value: 'COMPLETED', label: 'Completed', color: 'success' },
    { value: 'APPROVED', label: 'Approved', color: 'success' },
    { value: 'ON_HOLD', label: 'On Hold', color: 'warning' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'error' },
];

export const taskTypes = [
    { value: 'DEVELOPMENT', label: 'Development' },
    { value: 'TESTING', label: 'Testing' },
    { value: 'DESIGN', label: 'Design' },
    { value: 'DOCUMENTATION', label: 'Documentation' },
    { value: 'BUG_FIX', label: 'Bug Fix' },
    { value: 'ENHANCEMENT', label: 'Enhancement' },
    { value: 'MEETING', label: 'Meeting' },
    { value: 'SUPPORT', label: 'Support' },
    { value: 'OTHER', label: 'Other' },
];

export const userRoles = [
    { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'error' },
    { value: 'FINANCE_ADMIN', label: 'Finance Admin', color: 'warning' },
    { value: 'PROJECT_MANAGER', label: 'Project Manager', color: 'primary' },
    { value: 'TEAM_LEAD', label: 'Team Lead', color: 'info' },
    { value: 'EMPLOYEE', label: 'Employee', color: 'default' },
    { value: 'CLIENT', label: 'Client', color: 'secondary' },
    { value: 'AUDITOR', label: 'Auditor', color: 'default' },
];

export const userStatuses = [
    { value: 'ACTIVE', label: 'Active', color: 'success' },
    { value: 'INACTIVE', label: 'Inactive', color: 'default' },
    { value: 'SUSPENDED', label: 'Suspended', color: 'error' },
];
