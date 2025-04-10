export const navItems = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
  },
  {
    name: 'Tickets',
    url: '/tickets',
    icon: 'confirmation_number',
  },
  {
    name: 'Master File',
    icon: 'description',
    children: [
      {
        name: 'Customers',
        url: '/customers',
        icon: 'supervisor_account'
      },
      {
        name: 'Users',
        url: '/users',
        icon: 'badge '
      },
    ]
  }
];