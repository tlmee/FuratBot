import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

const SERVER_DATA_PATH = process.env.SERVER_DATA_PATH || 'C:\\Users\\arabs\\Desktop\\FuratBotAS\\data\\servers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const guild_id = searchParams.get('guild_id')
  const permissions = searchParams.get('permissions')

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/discord'
    
    // إذا كان هناك guild_id، فهذا يعني أن المستخدم قام بإضافة البوت
    if (guild_id && permissions) {
      // التأكد من وجود المجلد
      await fs.mkdir(SERVER_DATA_PATH, { recursive: true })

      // إنشاء ملف للسيرفر
      const serverDataPath = path.join(SERVER_DATA_PATH, `${guild_id}.json`)
      const serverData = {
        id: guild_id,
        permissions: permissions,
        addedAt: new Date().toISOString(),
      }

      await fs.writeFile(serverDataPath, JSON.stringify(serverData, null, 2))

      // إعادة توجيه المستخدم إلى صفحة تأكيد إضافة البوت
      return NextResponse.redirect(new URL(`/bot-added?guild_id=${guild_id}`, request.url))
    }

    // معالجة تسجيل الدخول العادي
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token')
    }

    const tokenData = await tokenResponse.json()

    // الحصول على معلومات المستخدم
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to get user data')
    }

    const userData = await userResponse.json()

    // إنشاء جلسة المستخدم
    const session = {
      user: {
        id: userData.id,
        username: userData.username,
        avatar: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`,
        email: userData.email,
      },
      accessToken: tokenData.access_token,
    }

    // حفظ الجلسة في ملف تعريف الارتباط
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // أسبوع واحد
    })

    return response
  } catch (error) {
    console.error('Error in Discord callback:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}

