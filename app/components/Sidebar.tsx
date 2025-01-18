import Link from 'next/link'

export default function Sidebar() {
  const menuItems = [
    { name: 'نظرة عامة', href: '/dashboard' },
    { name: 'الإعدادات', href: '/dashboard/settings' },
    { name: 'الأوامر', href: '/dashboard/commands' },
    { name: 'الإحصائيات', href: '/dashboard/statistics' },
    { name: 'الأدوار', href: '/dashboard/roles' },
    { name: 'القنوات', href: '/dashboard/channels' },
  ]

  return (
    <aside className="bg-purple-800 text-white w-64 min-h-screen p-4">
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link href={item.href} className="block p-2 rounded hover:bg-purple-700 transition duration-150 ease-in-out">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

