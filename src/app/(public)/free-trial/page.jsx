import Image from "next/image";

export default function FreeTrialPage() {
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
            Start your free trial of <span className="font-semibold">Nous Meeting</span> and
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
            Schedule Your Free Trial
          </h2>

          <form className="space-y-4">

            <div>
              <label className="text-sm text-gray-600">First Name</label>
              <input
                type="text"
                className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Last Name</label>
              <input
                type="text"
                className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Company Name</label>
              <input
                type="text"
                className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Zip Code</label>
              <input
                type="text"
                className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 rounded-md text-white font-medium bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:opacity-90 transition"
            >
              GET YOUR FREE TRIAL
            </button>

          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            By submitting this form you agree to our terms and privacy policy.
          </p>

        </div>

      </div>

    </div>
  );
}