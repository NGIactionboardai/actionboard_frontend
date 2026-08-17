'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { CheckCircle, XCircle, Loader2, LogIn, Crown } from 'lucide-react'
import { organizationApi } from '@/redux/api/organizationApi'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export default function OwnershipTransferResponsePage() {
  const { token, action } = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  const [status, setStatus] = useState('loading') // 'loading' | 'unauthenticated' | 'success' | 'error'
  const [message, setMessage] = useState('')
  const [orgData, setOrgData] = useState(null)
  const [preview, setPreview] = useState(null)   // org/initiator from public preview endpoint
  const [responded, setResponded] = useState(false)

  // Step 1: fetch preview (public, no auth) — validates token early so expired links
  // show the right message before the user is even prompted to sign in.
  useEffect(() => {
    if (!token || !['accept', 'decline'].includes(action)) {
      setStatus('error')
      setMessage('Invalid ownership transfer link.')
      return
    }

    const fetchPreview = async () => {
      try {
        const res = await axios.get(`${API_BASE}/organisations/ownership-transfer/${token}/`)
        const data = res.data

        if (data.is_expired) {
          setStatus('error')
          setMessage('This ownership transfer request has expired.')
          return
        }
        if (data.status !== 'pending') {
          setStatus('error')
          setMessage('This ownership transfer request has already been resolved.')
          return
        }
        setPreview(data)
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.detail || 'Transfer request not found or no longer valid.')
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
          `${API_BASE}/organisations/ownership-transfer/${token}/${action}/`
        )
        setMessage(res.data.detail || (action === 'accept' ? 'You are now the owner!' : 'Transfer declined.'))
        if (action === 'accept' && res.data.org_id) {
          setOrgData({ org_id: res.data.org_id, org_name: res.data.org_name })
          dispatch(organizationApi.util.invalidateTags(['UserOrgs']))
        }
        setStatus('success')
      } catch (err) {
        const detail = err.response?.data?.detail
        setMessage(detail || 'Something went wrong. The request may have expired or already been used.')
        setStatus('error')
      }
    }

    respond()
  }, [preview, isAuthenticated, token, action, dispatch])

  const isAccept = action === 'accept'
  const transferRedirect = `/organisations/transfer-ownership/${token}/${action}`

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
              <Crown className="h-7 w-7 text-indigo-500" />
            </div>

            {preview ? (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  You&rsquo;ve been asked to become the owner of{' '}
                  <span className="bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] bg-clip-text text-transparent">
                    {preview.org_name}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Requested by {preview.initiated_by}
                </p>
              </div>
            ) : (
              <h2 className="text-xl font-semibold text-gray-900">Sign in to continue</h2>
            )}

            <p className="text-sm text-gray-600 mt-1">
              Sign in to your Nous Meeting account to {isAccept ? 'accept' : 'respond to'} this ownership
              transfer request.
            </p>

            <div className="flex flex-col gap-3 w-full mt-2">
              <button
                onClick={() =>
                  router.push(`/auth/login?redirect=${encodeURIComponent(transferRedirect)}`)
                }
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white text-sm font-medium rounded-lg hover:opacity-90 transition"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </button>
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
              {isAccept ? "You're now the owner!" : 'Transfer declined'}
            </h2>
            <p className="text-sm text-gray-600">{message}</p>

            {isAccept && orgData && (
              <p className="text-sm text-gray-500">
                You are now the owner of <strong>{orgData.org_name}</strong>.
              </p>
            )}

            <button
              onClick={() => router.push(isAccept && orgData ? `/meetings/${orgData.org_id}` : '/')}
              className="mt-2 px-6 py-2.5 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white text-sm font-medium rounded-lg hover:opacity-90 transition"
            >
              {isAccept ? 'Go to organisation' : 'Go to homepage'}
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
