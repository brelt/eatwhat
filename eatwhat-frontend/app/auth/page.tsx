'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AuthPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const { signIn, signUp, user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-bg flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (tab === 'signin') {
      const { error: authError } = await signIn(email, password)
      if (authError) setError(authError.message)
    } else {
      const { error: authError, needsConfirmation: confirmNeeded } = await signUp(email, password)
      if (authError) {
        setError(authError.message)
      } else if (confirmNeeded) {
        setNeedsConfirmation(true)
      }
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            吃
          </div>
          <h1 className="text-2xl font-bold">本周吃什么</h1>
          <p className="text-gray-500 text-sm mt-1">EatWhat AU</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => { setTab('signin'); setError('') }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              tab === 'signin' ? 'bg-white shadow text-primary' : 'text-gray-600'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => { setTab('signup'); setError('') }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              tab === 'signup' ? 'bg-white shadow text-primary' : 'text-gray-600'
            }`}
          >
            注册
          </button>
        </div>

        {/* Email confirmation message */}
        {needsConfirmation ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">📧</div>
            <h2 className="text-lg font-semibold">请确认您的邮箱</h2>
            <p className="text-gray-500 text-sm">
              我们已向 <span className="font-medium text-gray-700">{email}</span> 发送了确认邮件，请查看收件箱并点击链接完成注册。
            </p>
            <button
              onClick={() => { setNeedsConfirmation(false); setTab('signin') }}
              className="text-primary text-sm hover:underline"
            >
              已确认，去登录
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱 (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码 (Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'signup' ? '至少6位字符' : '输入密码'}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '处理中...' : tab === 'signin' ? '登录' : '注册'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
