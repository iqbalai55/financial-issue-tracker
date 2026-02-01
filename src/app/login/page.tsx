'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

type DemoAccount = {
  label: string
  email: string
  password: string
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      if (error.status === 400) {
        setErrorMsg('Email atau password salah')
      } else {
        setErrorMsg('Terjadi kesalahan. Coba lagi.')
      }
      return
    }

    router.push('/issues')
    router.refresh()
  }

  // daftar demo/trial account
  const demoAccounts: DemoAccount[] = [
    { label: 'Trial Bendahara', email: 'miqbalai55@gmail.com', password: '123' },
    { label: 'Trial Karyawan 1', email: 'test@example.com', password: '123' },
    { label: 'Trial Karyawan 2', email: 'test2@example.com', password: '123' },
  ]

  // isi input dengan akun demo
  const fillDemoAccount = (account: DemoAccount) => {
    setEmail(account.email)
    setPassword(account.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Login</h2>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
            disabled={loading}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </div>

        {/* Demo / Trial Accounts */}
        <div className="pt-4 border-t space-y-2">
          <h3 className="text-sm font-semibold text-gray-600">Demo Accounts</h3>
          <div className="flex flex-col gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.label}
                onClick={() => fillDemoAccount(acc)}
                className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
