import Link from 'next/link'
import { Bot } from 'lucide-react'
import Header from './components/Header'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black text-white">
      <Header />
      <main className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="space-y-6 max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-950 border border-indigo-800">
            جديد: اشتراكات العضوية الخاصة بنا
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            أنشئ سيرفر ديسكورد
            <br />
            احترافي!
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            بوت متعدد الاستخدامات قابل للتخصيص بشكل كبير لصور الترحيب،
            والسجلات المتعمقة، وأوامر اجتماعية، وإدارة متطورة والمزيد...
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link
              href="/add-bot"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 text-lg min-w-[200px]"
            >
              إضافة البوت
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 text-lg border border-gray-700 min-w-[200px]"
            >
              لوحة التحكم
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

