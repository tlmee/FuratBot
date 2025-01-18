import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')

  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
  const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/discord'

  if (!DISCORD_CLIENT_ID) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 })
  }

  let url: string

  if (action === 'login') {
    // رابط تسجيل الدخول للمستخدم فقط
    const loginParams = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'identify email guilds',
    })

    url = `https://discord.com/oauth2/authorize?${loginParams.toString()}`
  } else if (action === 'add-bot') {
    // رابط إضافة البوت مع الصلاحيات المطلوبة
    const botParams = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      permissions: '8',
      scope: 'bot applications.commands',
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
    })

    url = `https://discord.com/oauth2/authorize?${botParams.toString()}`
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  return NextResponse.json({ url })
}

