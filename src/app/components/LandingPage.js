import Link from 'next/link';

const  LandingPage = () => {
    return (
      <div className="bg-white h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">

        {/* Workflow Section */}
        <div className="flex flex-col items-center bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700 drop-shadow-md">
              From Meetings to Meaning
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
        
      </div>
    );
  }

export default LandingPage;