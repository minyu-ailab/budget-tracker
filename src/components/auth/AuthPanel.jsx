import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import './AuthPanel.css'

const INITIAL_SIGNIN = {
  email: '',
  password: '',
}

const INITIAL_SIGNUP = {
  email: '',
  name: '',
  phone: '',
  password: '',
  twoFactorMethod: 'sms',
}

export default function AuthPanel() {
  const { signIn, signUp, status, error, infoMessage } = useAuthStore()
  const [mode, setMode] = useState('signin')
  const [signInForm, setSignInForm] = useState(INITIAL_SIGNIN)
  const [signUpForm, setSignUpForm] = useState(INITIAL_SIGNUP)

  const isSubmitting = status === 'loading'

  const handleSignIn = async (event) => {
    event.preventDefault()
    await signIn(signInForm)
  }

  const handleSignUp = async (event) => {
    event.preventDefault()
    await signUp(signUpForm)
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Budget Tracker</h1>
        <p className="auth-subtitle">Sign in to manage your synced accounts and budgets.</p>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => setMode('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Create Account
          </button>
        </div>

        {mode === 'signin' ? (
          <form className="auth-form" onSubmit={handleSignIn}>
            <label>
              Email
              <input
                type="email"
                value={signInForm.email}
                onChange={(event) =>
                  setSignInForm((state) => ({ ...state, email: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={signInForm.password}
                onChange={(event) =>
                  setSignInForm((state) => ({ ...state, password: event.target.value }))
                }
                required
              />
            </label>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignUp}>
            <label>
              Name
              <input
                type="text"
                value={signUpForm.name}
                onChange={(event) =>
                  setSignUpForm((state) => ({ ...state, name: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={signUpForm.email}
                onChange={(event) =>
                  setSignUpForm((state) => ({ ...state, email: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                value={signUpForm.phone}
                onChange={(event) =>
                  setSignUpForm((state) => ({ ...state, phone: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={signUpForm.password}
                onChange={(event) =>
                  setSignUpForm((state) => ({ ...state, password: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Preferred Two-Factor Method
              <select
                value={signUpForm.twoFactorMethod}
                onChange={(event) =>
                  setSignUpForm((state) => ({ ...state, twoFactorMethod: event.target.value }))
                }
              >
                <option value="sms">SMS OTP</option>
                <option value="totp">Authenticator App (TOTP)</option>
              </select>
            </label>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {error ? <p className="auth-error">{error}</p> : null}
        {infoMessage ? <p className="auth-info">{infoMessage}</p> : null}
      </div>
    </div>
  )
}
