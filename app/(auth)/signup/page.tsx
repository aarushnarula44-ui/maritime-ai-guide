'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  full_name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  phone: z.string().regex(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit Indian mobile number' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

type FormData = z.infer<typeof schema>

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length
  const colors = ['bg-danger', 'bg-warning', 'bg-warning', 'bg-success']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[0,1,2,3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? colors[strength - 1] : 'bg-border'}`} />
        ))}
      </div>
      <p className="text-xs text-text-muted">{labels[strength - 1] || 'Too weak'}</p>
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [password, setPassword] = useState('')
  const [emailSent, setEmailSent] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setAuthError('')
    const supabase = createClient()
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name, phone: `+91${data.phone}` },
      },
    })
    if (error) {
      setAuthError(error.message)
      return
    }
    // If Supabase email confirmation is disabled, session is active immediately
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setEmailSent(authData.user?.email ?? '')
    }
  }

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/callback` },
    })
  }

  return (
    <>
      <h1 className="font-display text-2xl font-semibold text-primary mb-1">Start your maritime journey</h1>
      <p className="text-text-secondary text-sm mb-6">Free account. No credit card required.</p>

      <button
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-3 border border-border rounded-lg py-2.5 px-4 text-sm font-medium text-text-primary hover:bg-surface transition mb-4"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <hr className="flex-1 border-border" />
        <span className="text-text-muted text-xs">or</span>
        <hr className="flex-1 border-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
          <input
            {...register('full_name')}
            placeholder="Arjun Sharma"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition"
          />
          {errors.full_name && <p className="text-danger text-xs mt-1">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition"
          />
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Phone Number</label>
          <div className="flex">
            <span className="flex items-center px-3 bg-surface border border-r-0 border-border rounded-l-lg text-sm text-text-secondary">+91</span>
            <input
              {...register('phone')}
              type="tel"
              placeholder="9876543210"
              className="flex-1 border border-border rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition"
            />
          </div>
          {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
          <div className="relative">
            <input
              {...register('password', { onChange: (e) => setPassword(e.target.value) })}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
        </div>

        {authError && (
          <p className="text-danger text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{authError}</p>
        )}
        {emailSent && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-3 text-sm text-green-800">
            ✅ Account created! Check <strong>{emailSent}</strong> for a confirmation link, then log in.
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-primary font-semibold py-2.5 rounded-lg hover:bg-accent-dark transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Account
        </button>

        <p className="text-center text-xs text-text-muted">
          By signing up you agree to our{' '}
          <Link href="/terms" className="text-accent hover:underline">Terms</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
        </p>
      </form>

      <p className="text-center text-sm text-text-secondary mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-accent font-medium hover:underline">Log in</Link>
      </p>
    </>
  )
}
