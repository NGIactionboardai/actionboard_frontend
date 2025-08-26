// app/doc/page.jsx

"use client";

import Image from "next/image";

export default function ZoomDocPage() {
  const steps = [
    {
      title: "How to Add?",
      items: [
        {
          text: "Click the Zoom icon",
          img: "/doc-url/doc-img-01.png",
        },
        {
          text: "Then click on Connect to Zoom.",
          img: "/doc-url/doc-img-02.png",
        },
        {
          text: "You will be prompted to Zoom app’s permission page. Check the box below and click “Allow”.",
          img: "/doc-url/doc-img-03.png",
        },
        {
          text: "The Zoom app will now be connected with your Nous Meeting account.",
          img: "/doc-url/doc-img-04.png",
        },
      ],
    },
    {
      title: "How to Disconnect?",
      items: [
        {
          text: "Click on the “Disconnect” button in the Zoom Account Details section.",
          img: "/doc-url/doc-img-05.png",
        },
        {
          text: "Click “Disconnect” again to confirm. The app will be disconnected.",
          img: "/doc-url/doc-img-06.png",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white px-6 py-12 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Zoom App Documentation
        </h1>

        {steps.map((section, idx) => (
          <div key={idx} className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {section.title}
            </h2>

            <div className="space-y-10">
              {section.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col items-start gap-4"
                >
                  <p className="text-gray-700 text-lg">{item.text}</p>
                  {item.img && (
                    <div className="w-full border rounded-xl overflow-hidden shadow">
                      <Image
                        src={item.img}
                        alt={item.text}
                        width={900}
                        height={500}
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer  */}
        <div className="mt-16 border-t pt-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Nous Meeting – Zoom App Guide
        </div>
      </div>
    </div>
  );
}
