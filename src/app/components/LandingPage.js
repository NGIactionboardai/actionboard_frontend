import Link from 'next/link';

const  LandingPage = () => {
    return (
      <div className="bg-white min-h-screen flex flex-col">

        {/* Hero Section - Full Width */}
        <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between py-16">

        {/* Left: Text */}
        <div className="md:w-5/12 w-full pl-10 md:pl-16 lg:pl-24 pr-6 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            From <br />
            {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700">
              Meetings to Meaning
            </span> */}
            <span className="text-transparent bg-clip-text bg-gray-900">
              Meetings to Meaning
            </span>
          </h1>
          <p className="text-lg text-gray-700">
            Nous Meeting turns your meetings into actionable transcripts, live notes and intelligent summaries.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-6 py-3 text-white font-semibold rounded-md bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] transition"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Right: Full Edge Image */}
        <div className="md:w-7/12 w-full">
          <img
            src="/home/ab-home-01.png"
            alt="Hero Image"
            className="w-full h-full object-cover md:rounded-none"
          />
        </div>
        </div>


        {/* Workflow Section */}
        <div className="flex flex-col items-center bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gray-900 drop-shadow-md">
              Turn Every Meeting into a Smart Summary
            </h2>
          </div>

          <div className="mt-20 overflow-x-auto">
            <div className="flex items-center justify-start space-x-8 md:space-x-12 px-4">
              {/* Step 1: Meetings */}
              <div className="flex flex-col items-center">
                <img src="/icons/ab-icon-01.png" alt="Meetings" className="h-16 w-16" />
                <p className="mt-2 text-sm font-medium text-gray-800">Meetings</p>
              </div>

              {/* Arrow */}
              <div className="text-2xl font-bold text-gray-950">→</div>

              {/* Step 2: Audio Recording */}
              <div className="flex flex-col items-center">
                <img src="/icons/ab-icon-02.png" alt="Audio Recording" className="h-16 w-16" />
                <p className="mt-2 text-sm font-medium text-gray-800">Audio Recording</p>
              </div>

              <div className="text-2xl font-bold text-gray-950">→</div>

              {/* Step 3: Transcription */}
              <div className="flex flex-col items-center">
                <img src="/icons/ab-icon-03.png" alt="Transcription" className="h-16 w-16" />
                <p className="mt-2 text-sm font-medium text-gray-800">Transcription</p>
              </div>

              <div className="text-2xl font-bold text-gray-950">→</div>

              {/* Step 4: AI Insights */}
              <div className="flex flex-col items-center">
                <img src="/icons/ab-icon-04.png" alt="AI Insights" className="h-16 w-16" />
                <p className="mt-2 text-sm font-medium text-gray-800">AI Insights</p>
              </div>

              <div className="text-2xl font-bold text-gray-950">→</div>

              {/* Step 5: Dashboard */}
              <div className="flex flex-col items-center">
                <img src="/icons/ab-icon-05.png" alt="Real-Time Dashboard" className="h-16 w-16" />
                <p className="mt-2 text-sm font-medium text-gray-800 text-center">Real-Time Dashboard</p>
              </div>

              <div className="text-2xl font-bold text-gray-950">→</div>

              {/* Step 6: Report */}
              <div className="flex flex-col items-center">
                <img src="/icons/ab-icon-06.png" alt="Post Meeting Report" className="h-16 w-16" />
                <p className="mt-2 text-sm font-medium text-gray-800 text-center">Post Meeting Report</p>
              </div>
            </div>
          </div>

        </div>  

        {/* Live Transcription Section */}
        <div className="bg-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Live Transcription
            </h2>
            <p className="text-lg text-gray-600 mb-10">
              Capture every word with precision. Our real-time transcription engine converts spoken conversations into accurate, speaker-labeled text as your meeting unfolds—no lag, no missed moments.
            </p>
            <div className="flex justify-center">
              <img
                src="/home/live-transcript.png"
                alt="Live Transcript Demo"
                className="w-full max-w-3xl rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>


        {/* AI Insights Section */}
        <div className="bg-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              AI Insights
            </h2>
            <p className="text-lg text-gray-600 mb-10">
              Let AI do the heavy lifting. Instantly extract key takeaways, action items, sentiment shifts, and speaker summaries—so you leave every meeting with clarity and direction.
            </p>
            <div className="flex justify-center">
              <img
                src="/home/ai-summery.png"
                alt="AI Insights"
                className="w-full max-w-3xl rounded-lg border border-gray-700 shadow-sm"
              />
            </div>
          </div>
        </div>


        {/* Analyze Speaker Sentiment Section */}
        <div className="bg-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Analyze Speaker Sentiment
            </h2>
            <p className="text-lg text-gray-600 mb-10">
              Visualize how your meetings feel. Our AI analyzes speaker tone and language to detect shifts in sentiment—then displays it through intuitive charts and graphs so you can spot engagement, tension, or alignment at a glance.
            </p>
            <div className="flex justify-center">
              <img
                src="/home/speaker-sentiment.png"
                alt="Speaker Sentiment"
                className="w-full max-w-3xl rounded-lg border border-gray-700 shadow-md shadow-gray-500/40"
              />
            </div>
          </div>
        </div>
        
      </div>
    );
  }

export default LandingPage;