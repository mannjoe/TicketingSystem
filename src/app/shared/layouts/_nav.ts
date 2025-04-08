export const navItems = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
  },
  {
    name: 'Ticket',
    url: '/ticket',
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
  },
  {
    name: 'Help',
    url: '/help',
    icon: 'help'
  }
];