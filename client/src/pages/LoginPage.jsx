import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axiosInstance'

/* ─── Google Font ─── */
const fontLink = document.createElement('link')
fontLink.rel = 'stylesheet'
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
document.head.appendChild(fontLink)

const BASE = {
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  boxSizing: 'border-box',
}

function LoginPage() {
  const location = useLocation()
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/register')
  const { login } = useAuth()

  /* ── LOGIN STATE ── */
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  /* ── REGISTER STATE ── */
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [role, setRole] = useState('client')
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState(false)

  /* ── Responsive ── */
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 700)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  /* ── URL sync (no reload) ── */
  useEffect(() => {
    const target = isSignUp ? '/register' : '/login'
    if (window.location.pathname !== target) {
      window.history.replaceState(null, '', target)
    }
  }, [isSignUp])

  const switchPanel = (toSignUp) => {
    setLoginError('')
    setRegError('')
    setIsSignUp(toSignUp)
  }

  /* ── LOGIN HANDLER — identical to original ── */
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const user = await login(loginEmail, loginPassword)
      if (user.role === 'client') {
        window.location.href = '/client/dashboard'
      } else {
        window.location.href = '/freelancer/dashboard'
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoginLoading(false)
    }
  }

  /* ── REGISTER HANDLER — identical to original ── */
  const handleRegister = async (e) => {
    e.preventDefault()
    setRegLoading(true)
    setRegError('')
    try {
      await API.post('/api/auth/register', {
        firstName,
        lastName,
        email: regEmail,
        password: regPassword,
        role,
      })
      setRegSuccess(true)
    } catch (err) {
      setRegError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setRegLoading(false)
    }
  }

  /* ══════════════════════════════════════════════
     MOBILE LAYOUT
  ══════════════════════════════════════════════ */
  if (isMobile) {
    return (
      <div style={{
        ...BASE,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        background: 'linear-gradient(rgba(10,20,60,0.42), rgba(10,20,60,0.42)), url(/auth-bg.png) center center / 100% 100% no-repeat',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.25rem', overflow: 'hidden',
      }}>
        <div style={{
          ...BASE,
          width: '100%', maxWidth: '420px',
          background: '#fff', borderRadius: '20px',
          padding: '2rem 1.5rem',
          boxShadow: '0 24px 64px rgba(79,70,229,0.22)',
        }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex', background: '#f3f4f6', borderRadius: '10px',
            padding: '4px', marginBottom: '1.5rem',
          }}>
            {[['Sign In', false], ['Create Account', true]].map(([label, val]) => (
              <button key={label} onClick={() => switchPanel(val)} style={{
                ...BASE, flex: 1, padding: '0.55rem', border: 'none',
                borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
                fontWeight: isSignUp === val ? 700 : 500,
                background: isSignUp === val ? '#4f46e5' : 'transparent',
                color: isSignUp === val ? '#fff' : '#6b7280',
                transition: 'all 0.25s',
              }}>{label}</button>
            ))}
          </div>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <a href="/" style={{
              fontSize: '1.75rem', fontWeight: 900,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              textDecoration: 'none', display: 'inline-block',
            }}>Allie</a>
            <p style={{ margin: '0.2rem 0 0', color: '#374151', fontWeight: 600, fontSize: '1rem' }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {!isSignUp ? (
            /* ── MOBILE SIGN IN ── */
            <form onSubmit={handleLogin} noValidate>
              {loginError && <ErrorBox msg={loginError} />}
              <MField label="Email">
                <MInput id="m-login-email" type="email" value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="Anchal@example.com" required />
              </MField>
              <MField>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label htmlFor="m-login-pw" style={labelStyle}>Password</label>
                  <a href="/forgot-password" style={{ fontSize: '0.78rem', color: '#4f46e5', textDecoration: 'none' }}>Forgot password?</a>
                </div>
                <MInput id="m-login-pw" type="password" value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Your password" required />
              </MField>
              <SubmitBtn loading={loginLoading} label="Sign In" loadLabel="Signing in…" />
            </form>
          ) : regSuccess ? (
            <SuccessPanel email={regEmail} onGoLogin={() => switchPanel(false)} />
          ) : (
            /* ── MOBILE SIGN UP ── */
            <form onSubmit={handleRegister} noValidate>
              {regError && <ErrorBox msg={regError} />}
              <RoleToggle role={role} setRole={setRole} />
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <MField label="First Name" style={{ flex: 1 }}>
                  <MInput id="m-reg-fn" type="text" value={firstName}
                    onChange={e => setFirstName(e.target.value)} placeholder="Anchal" required />
                </MField>
                <MField label="Last Name" style={{ flex: 1 }}>
                  <MInput id="m-reg-ln" type="text" value={lastName}
                    onChange={e => setLastName(e.target.value)} placeholder="Bisht" required />
                </MField>
              </div>
              <MField label="Email">
                <MInput id="m-reg-email" type="email" value={regEmail}
                  onChange={e => setRegEmail(e.target.value)} placeholder="Anchal@example.com" required />
              </MField>
              <MField label="Password">
                <MInput id="m-reg-pw" type="password" value={regPassword}
                  onChange={e => setRegPassword(e.target.value)} placeholder="Min 8 characters" required />
              </MField>
              <SubmitBtn loading={regLoading} label="Create Account" loadLabel="Creating account…" />
            </form>
          )}
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════
     DESKTOP SLIDING LAYOUT
     ┌──────────────────┬──────────────────┐
     │   Sign-In form   │  Sign-Up form    │
     │   (left half)    │  (right half)    │
     └──────────────────┴──────────────────┘
     Overlay (50% wide) slides on top:
       - Default /login  → overlay sits on RIGHT, reveals Login form
       - After click     → overlay slides to LEFT, reveals Register form
  ══════════════════════════════════════════════ */
  return (
    <div style={{
      ...BASE,
      width: '100vw',
      height: '100vh',
      minHeight: '100vh',
      background: 'linear-gradient(rgba(10,20,60,0.42), rgba(10,20,60,0.42)), url(/auth-bg.png) center center / 100% 100% no-repeat',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', overflow: 'hidden',
    }}>
      {/* ── CARD ── */}
      <div style={{
        ...BASE,
        position: 'relative',
        width: '100%', maxWidth: '860px', height: '560px',
        background: '#fff', borderRadius: '24px',
        boxShadow: '0 32px 80px rgba(79,70,229,0.3), 0 8px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}>

        {/* ─── SIGN-IN FORM — permanently on left half ─── */}
        <div style={{
          ...BASE,
          position: 'absolute', top: 0, left: 0,
          width: '50%', height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '3rem 2.75rem',
          zIndex: 1,
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <GradientLogo />
            <p style={{ margin: '0.25rem 0 0', color: '#1e1b4b', fontWeight: 700, fontSize: '1.1rem' }}>
              Welcome back
            </p>
          </div>
          {loginError && <ErrorBox msg={loginError} />}
          <form onSubmit={handleLogin} noValidate>
            <DField label="Email">
              <DInput id="d-login-email" type="email" value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)} placeholder="Anchal@example.com" required />
            </DField>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label htmlFor="d-login-pw" style={labelStyle}>Password</label>
                <a href="/forgot-password" style={{ fontSize: '0.75rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
              <DInput id="d-login-pw" type="password" value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)} placeholder="Your password" required />
            </div>
            <SubmitBtn loading={loginLoading} label="Sign In" loadLabel="Signing in…" />
          </form>
        </div>
        <div style={{
          ...BASE,
          position: 'absolute', top: 0, left: '50%',
          width: '50%', height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '2.25rem 2.75rem',
          zIndex: 1, overflowY: 'auto',
        }}>
          {regSuccess ? (
            <SuccessPanel email={regEmail} onGoLogin={() => switchPanel(false)} />
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.1rem' }}>
                <GradientLogo />
                <p style={{ margin: '0.25rem 0 0', color: '#1e1b4b', fontWeight: 700, fontSize: '1.05rem' }}>
                  Create your account
                </p>
              </div>
              {regError && <ErrorBox msg={regError} />}
              <form onSubmit={handleRegister} noValidate>
                <RoleToggle role={role} setRole={setRole} />
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: 0 }}>
                  <DField label="First Name" style={{ flex: 1, marginBottom: '0.75rem' }}>
                    <DInput id="d-reg-fn" type="text" value={firstName}
                      onChange={e => setFirstName(e.target.value)} placeholder="Anchal" required />
                  </DField>
                  <DField label="Last Name" style={{ flex: 1, marginBottom: '0.75rem' }}>
                    <DInput id="d-reg-ln" type="text" value={lastName}
                      onChange={e => setLastName(e.target.value)} placeholder="Bisht" required />
                  </DField>
                </div>
                <DField label="Email" style={{ marginBottom: '0.75rem' }}>
                  <DInput id="d-reg-email" type="email" value={regEmail}
                    onChange={e => setRegEmail(e.target.value)} placeholder="Anchal@example.com" required />
                </DField>
                <DField label="Password" style={{ marginBottom: '1rem' }}>
                  <DInput id="d-reg-pw" type="password" value={regPassword}
                    onChange={e => setRegPassword(e.target.value)} placeholder="Min 8 characters" required />
                </DField>
                <SubmitBtn loading={regLoading} label="Create Account" loadLabel="Creating account…" />
              </form>
            </>
          )}
        </div>

        {/* ─── SLIDING OVERLAY ─── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '50%', height: '100%',
            zIndex: 10,
            transform: isSignUp ? 'translate3d(0, 0, 0)' : 'translate3d(100.2%, 0, 0)',
            transition: 'transform 0.99s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '2.5rem 2rem', textAlign: 'center',
            overflow: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Background Layer 1: card.png (Left side / Sign Up state) */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'url(/card.png) center center / 100% 100% no-repeat',
            opacity: isSignUp ? 1 : 0,
            transition: 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'opacity',
            pointerEvents: 'none', zIndex: 0,
          }} />

          {/* Background Layer 2: card2.png (Right side / Sign In state) */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'url(/card2.png) center center / 100% 100% no-repeat',
            opacity: isSignUp ? 0 : 1,
            transition: 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'opacity',
            pointerEvents: 'none', zIndex: 0,
          }} />

          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', zIndex: 1,
          }} />
          <div style={{
            position: 'absolute', bottom: '-80px', left: '-40px',
            width: '240px', height: '240px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', zIndex: 1,
          }} />

          {/* Badge icon */}
          <div style={{
            position: 'relative', zIndex: 2,
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', marginBottom: '1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            {isSignUp ? '✨' : '✨'}
          </div>

          {/* White Allie wordmark */}
          <div style={{ position: 'relative', zIndex: 2, fontSize: '1.9rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.03em', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
            Allie
          </div>

          <h3 style={{
            position: 'relative', zIndex: 2,
            color: '#fff', fontSize: '1.35rem', fontWeight: 800,
            margin: '0 0 0.75rem', letterSpacing: '-0.01em', textShadow: '0 2px 10px rgba(0,0,0,0.6)',
          }}>
            {isSignUp ? 'Already have an account?' : 'New here?'}
          </h3>
          <p style={{
            position: 'relative', zIndex: 2,
            color: '#ffffff', fontSize: '0.9rem',
            lineHeight: 1.65, marginBottom: '2rem', textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            fontWeight: 500,
          }}>
            {isSignUp
              ? 'Sign in to manage your projects, bids, and wallet.'
              : 'Join Allie to hire top freelancers or find exciting projects.'}
          </p>

          <button
            id={isSignUp ? 'overlay-signin-btn' : 'overlay-signup-btn'}
            onClick={() => switchPanel(!isSignUp)}
            style={{
              ...BASE,
              position: 'relative', zIndex: 2,
              background: 'rgba(0,0,0,0.25)',
              backdropFilter: 'blur(4px)',
              border: '2px solid rgba(255,255,255,0.85)',
              color: '#fff',
              padding: '0.65rem 2.25rem',
              borderRadius: '50px',
              fontWeight: 700, fontSize: '0.88rem',
              cursor: 'pointer', letterSpacing: '0.08em',
              transition: 'all 0.25s ease',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.25)'; e.target.style.borderColor = '#fff' }}
            onMouseLeave={e => { e.target.style.background = 'rgba(0,0,0,0.25)'; e.target.style.borderColor = 'rgba(255,255,255,0.85)' }}
          >
            {isSignUp ? 'SIGN IN' : 'SIGN UP'}
          </button>
        </div>

      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   SHARED SUB-COMPONENTS
══════════════════════════════════════════════ */
const labelStyle = {
  display: 'block', fontSize: '0.78rem',
  fontWeight: 600, color: '#374151',
  marginBottom: '0.3rem', letterSpacing: '0.02em',
}

function GradientLogo() {
  return (
    <a href="/" style={{
      fontSize: '1.7rem', fontWeight: 900,
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      backgroundClip: 'text', textDecoration: 'none', display: 'inline-block',
    }}>Allie</a>
  )
}

function ErrorBox({ msg }) {
  return (
    <div style={{
      background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
      padding: '0.6rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '0.9rem',
    }}>
      {msg}
    </div>
  )
}

function SuccessPanel({ email, onGoLogin }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📧</div>
      <h2 style={{ fontWeight: 800, color: '#1e1b4b', fontSize: '1.2rem', margin: '0 0 0.5rem' }}>
        Check your email!
      </h2>
      <p style={{ color: '#6b7280', fontSize: '0.87rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        We sent a verification link to{' '}
        <strong style={{ color: '#4f46e5' }}>{email}</strong>.
        Click it to activate your account.
      </p>
      <button onClick={onGoLogin} style={{
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff',
        border: 'none', padding: '0.65rem 1.75rem', borderRadius: '10px',
        fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
      }}>
        Go to Sign In →
      </button>
    </div>
  )
}

function RoleToggle({ role, setRole }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
      {['client', 'freelancer'].map(r => (
        <button key={r} type="button" onClick={() => setRole(r)} style={{
          flex: 1, padding: '0.45rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem',
          border: role === r ? '2px solid #4f46e5' : '1.5px solid #e5e7eb',
          background: role === r ? '#eef2ff' : '#f9fafb',
          color: role === r ? '#4f46e5' : '#6b7280',
          fontWeight: role === r ? 700 : 500,
          transition: 'all 0.2s',
        }}>
          {r === 'client' ? 'I am a Client' : 'I am a Freelancer'}
        </button>
      ))}
    </div>
  )
}

function SubmitBtn({ loading, label, loadLabel }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: '100%', border: 'none',
      background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: '#fff', padding: '0.8rem', borderRadius: '10px',
      fontWeight: 700, fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'opacity 0.2s', letterSpacing: '0.02em',
    }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
    >
      {loading ? loadLabel : label}
    </button>
  )
}

/* Desktop field wrapper */
function DField({ label, children, style }) {
  return (
    <div style={{ marginBottom: '0.85rem', ...style }}>
      {label && <label style={labelStyle}>{label}</label>}
      {children}
    </div>
  )
}

/* Desktop input */
function DInput({ id, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input id={id} {...props} style={{
      width: '100%', border: focused ? '1.5px solid #4f46e5' : '1.5px solid #e5e7eb',
      borderRadius: '9px', padding: '0.6rem 0.85rem', fontSize: '0.875rem',
      outline: 'none', background: focused ? '#fff' : '#f9fafb',
      color: '#111827', transition: 'all 0.2s', boxSizing: 'border-box',
    }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

/* Mobile field wrapper */
function MField({ label, children, style }) {
  return (
    <div style={{ marginBottom: '0.9rem', ...style }}>
      {label && <label style={labelStyle}>{label}</label>}
      {children}
    </div>
  )
}

/* Mobile input */
function MInput({ id, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input id={id} {...props} style={{
      width: '100%', border: focused ? '1.5px solid #4f46e5' : '1.5px solid #e5e7eb',
      borderRadius: '9px', padding: '0.65rem 0.9rem', fontSize: '0.9rem',
      outline: 'none', background: focused ? '#fff' : '#f9fafb',
      color: '#111827', transition: 'all 0.2s', boxSizing: 'border-box',
    }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

export default LoginPage