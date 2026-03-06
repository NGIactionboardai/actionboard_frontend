"use client"

import Image from "next/image"
import Select from "react-select"
import countryList from "react-select-country-list"
import { useMemo, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function FreeTrialPage() {
  const router = useRouter()

  const countryOptions = useMemo(() => countryList().getData(), [])

  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country: "",
    organization: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCountryChange = (option) => {
    setFormData(prev => ({
      ...prev,
      country: option?.label || ""
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.country) {
      toast.error("Please fill all required fields")
      return
    }

    try {

      setLoading(true)

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/waitlist/signup/`,
        formData
      )

      toast.success("Pre-registration successful!")

      router.push(`/pre-register/thank-you?name=${encodeURIComponent(formData.first_name)}`)

    } catch (error) {

      const message =
        error?.response?.data?.email?.[0] ||
        error?.response?.data?.detail ||
        "Something went wrong. Please try again."

      toast.error(message)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* LEFT SIDE */}
      <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white p-16">

        <div className="absolute inset-0 opacity-40">
          <Image
            src="/free-trial-page-img-02.jpg"
            alt="AI Meeting Intelligence"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Experience Smarter Meetings with AI
          </h1>

          <p className="text-lg text-indigo-100">
            Be among the first to use <span className="font-semibold">Nous Meeting</span> and
            transform the way your team captures knowledge from meetings.
          </p>

          <p className="mt-4 text-indigo-200">
            Automatically record, transcribe, summarize and analyze your meetings
            so your team can focus on decisions instead of note-taking.
          </p>
        </div>

      </div>


      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center bg-gray-50 p-6">

        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">

          <h2 className="text-2xl font-semibold text-center mb-6">
            Pre-Register for Early Access
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* FIRST NAME */}
            <div>
              <label className="text-sm text-gray-600">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                type="text"
                className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* LAST NAME */}
            <div>
              <label className="text-sm text-gray-600">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                type="text"
                className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* COUNTRY */}
            <div>
              <label className="text-sm text-gray-600">
                Country <span className="text-red-500">*</span>
              </label>

              <Select
                options={countryOptions}
                value={countryOptions.find(c => c.label === formData.country) || null}
                onChange={handleCountryChange}
                placeholder="Select Country"
                className="mt-1"
                isSearchable
              />
            </div>

            {/* ORGANIZATION */}
            <div>
              <label className="text-sm text-gray-600">
                Organization (Optional)
              </label>
              <input
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                type="text"
                className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm text-gray-600">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>


            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-md text-white font-medium bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Submitting..." : "PRE-REGISTER NOW"}
            </button>

          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            By submitting this form you agree to our terms and privacy policy.
          </p>

        </div>

      </div>

    </div>
  )
}