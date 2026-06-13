'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { CheckCircle, XCircle, Loader2, LogIn, UserPlus } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export default function InvitationResponsePage() {
  const { token, action } = useParams()
  const router = useRouter()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  const [status, setStatus] = useState('loading') // 'loading' | 'unauthenticated' | 'success' | 'error'
  const [message, setMessage] = useState('')
  const [orgData, setOrgData] = useState(null)
  const [preview, setPreview] = useState(null)   // org/inviter/role from public preview endpoint
  const [responded, setResponded] = useState(false)

  // Step 1: fetch preview (public, no auth) — validates token early so expired links
  // show the right message before the user is even prompted to sign in.
  useEffect(() => {
    if (!token || !['accept', 'decline'].includes(action)) {
      setStatus('error')
      setMessage('Invalid invitation link.')
      return
    }

    const fetchPreview = async () => {
      try {
        const res = await axios.get(`${API_BASE}/organisations/invitations/${token}/`)
        const data = res.data

        if (data.is_expired) {
          setStatus('error')
          setMessage('This invitation has expired.')
          return
        }
        if (data.status !== 'pending') {
          setStatus('error')
          setMessage('This invitation has already been used.')
          return
        }
        setPreview(data)
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.detail || 'Invitation not found or no longer valid.')
      }
    }

    fetchPreview()
  }, [token, action])

  // Step 2: once preview is valid, check auth. Re-runs when isAuthenticated changes
  // (e.g. user signs in and is redirected back here).
  useEffect(() => {
    if (!preview) return           // still loading or already errored
    if (status === 'error') return
    if (responded) return          // don't fire twice

    if (!isAuthenticated) {
      setStatus('unauthenticated')
      return
    }

    const respond = async () => {
      setResponded(true)
      setStatus('loading')
      try {
        const res = await axios.post(
          `${API_BASE}/organisations/invitations/${token}/${action}/`
        )
        setMessage(res.data.detail || (action === 'accept' ? 'Invitation accepted!' : 'Invitation declined.'))
        if (action === 'accept' && res.data.org_id) {
          setOrgData({ org_id: res.data.org_id, org_name: res.data.org_name, role: res.data.role })
        }
        setStatus('success')
      } catch (err) {
        const detail = err.response?.data?.detail
        setMessage(detail || 'Something went wrong. The invitation may have expired or already been used.')
        setStatus('error')
      }
    }

    respond()
  }, [preview, isAuthenticated, token, action])

  const isAccept = action === 'accept'
  const inviteRedirect = `/invitations/${token}/${action}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <img src="/nous_logo.png" alt="Nous Meeting" className="h-10 mx-auto mb-6" />

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3 text-gray-600">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-sm">Processing your response…</p>
          </div>
        )}

        {status === 'unauthenticated' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
              <UserPlus className="h-7 w-7 text-indigo-500" />
            </div>

            {preview ? (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  You're invited to join{' '}
                  <span className="bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] bg-clip-text text-transparent">
                    {preview.org_name}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {preview.invited_by} · invited you as{' '}
                  <span className="font-medium capitalize">{preview.role}</span>
                </p>
              </div>
            ) : (
              <h2 className="text-xl font-semibold text-gray-900">Sign in to continue</h2>
            )}

            <p className="text-sm text-gray-600 mt-1">
              {isAccept
                ? 'Sign in to your Nous Meeting account, or create one to accept this invitation.'
                : 'Sign in to respond to this invitation.'}
            </p>

            <div className="flex flex-col gap-3 w-full mt-2">
              <button
                onClick={() =>
                  router.push(`/auth/login?redirect=${encodeURIComponent(inviteRedirect)}`)
                }
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white text-sm font-medium rounded-lg hover:opacity-90 transition"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </button>

              {isAccept && (
                <button
                  onClick={() =>
                    router.push(
                      `/auth/register?redirect=${encodeURIComponent(inviteRedirect)}`
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  <UserPlus className="h-4 w-4" />
                  Create a Nous Meeting account
                </button>
              )}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            {isAccept ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-gray-400" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {isAccept ? "You're in!" : 'Invitation declined'}
            </h2>
            <p className="text-sm text-gray-600">{message}</p>

            {isAccept && orgData && (
              <p className="text-sm text-gray-500">
                You joined <strong>{orgData.org_name}</strong> as{' '}
                <span className="capitalize font-medium">{orgData.role}</span>.
              </p>
            )}

            <button
              onClick={() => router.push(isAccept ? '/organizations' : '/')}
              className="mt-2 px-6 py-2.5 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white text-sm font-medium rounded-lg hover:opacity-90 transition"
            >
              {isAccept ? 'Go to my organizations' : 'Go to homepage'}
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-12 w-12 text-red-400" />
            <h2 className="text-xl font-semibold text-gray-900">Unable to process</h2>
            <p className="text-sm text-gray-600">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-2 px-6 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
            >
              Go to homepage
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
