import Webcam from 'react-webcam'
import { useState } from 'react'

export interface AIResponse {
  status: 'success' | 'error';
  data?: {
    book: string;
    chapter: string;
  };
  message?: string;
}

export default function Index() {
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ chapter: string, book: string } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean | null>(false)
  
  
  const handleScreenshot = async (getScreenshot: () => string) => {
    try {
      setIsLoading(true)
      setError(null)

      const imageSrc = getScreenshot()
      if (!imageSrc) throw Error("Failed to captur image")

      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `
            Analyze the provided image to identify which book and chapter of the Bible it is. Follow these rules:
            
            1. **Text Extraction:**
            - Read the visible text, focusing on biblical book names (e.g., "Genesis," "Psalms") and chapter numbers (e.g., "1," "3").
            - Consider common abbreviations (e.g., "Jn" for John, "1 Cor" for 1 Corinthians).
            
            2. **Output Format:**
            - Return ONLY a valid JSON object, without markdown or additional text.
            - Use this format (in Spanish):
            {
            "status": "success" | "error",
            "data": {
            "book": "BOOK_NAME_IN_ENGLISH",
            "chapter": "CHAPTER_NUMBER"
            },
            "message": "Descriptive message"
            }
            
            3. **Contingency rules:**
            - If the text is not readable or the image is not from the Bible:
            - "status": "error"
            - "message": "The image is invalid or the text is not readable"
            - If the text is readable but does not match a Bible book:
            - "status": "error"
            - "message": "No Bible book identified"
            
            4. **Examples of valid output:**
            - Success:
            {"status": "success", "data": {"book": "John", "chapter": "3"}, "message": ""}
            - Error:
            {"status": "error", "data": null, "message": "The image is invalid or the text is unreadable"}
            
            5. **Additional Notes:**
            - Prioritize the first detected book and chapter if there are multiple.
            - Use canonical names in Spanish (e.g., "1 Reyes," not "1 Rey").
            - The name of the chapter has to be in english.`,
          image: imageSrc
        })
      })


      if (!response.ok) throw new Error('Network response was not ok')

      const ai: { answer: AIResponse } = await response.json();

      if (ai.answer.status === 'error') {
        throw new Error(ai.answer.message || 'Analysis failed');
      }

      if (!ai.answer.data?.book || !ai.answer.data?.chapter) {
        throw new Error('Invalid response structure');
      }

      setResult(ai.answer.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };


  return (
<div className='min-h-screen bg-gray/30 flex flex-col items-center ml-12 justify-center p-4'>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
  <div className='bg-white rounded-xl shadow-md p-6 w-[100%] mx-auto overflow-hidden'>
  <div className='flex justify-between items-center'>
      <button className="p-2 hover:bg-gray-100 rounded-full">
        <span className="material-symbols-outlined text-3xl text-blue-600">
          cameraswitch
        </span>
      </button>
      <button >
        <span className="material-symbols-outlined text-2xl text-red-600">
          close
        </span>
      </button>
    </div>
    <h1 className='text-3xl font-bold text-center text-gray-800 sm:text-2xl font-semibold text-center mb-4 break-words leading-tight'>
      Bible Chapter Scanner
    </h1>
    
    <div className='relative aspect-video bg-gray-200 rounded-lg overflow-hidden'>
      <Webcam
        audio={false}
        className='w-full h-full object-cover'
        screenshotFormat='image/jpeg'
        videoConstraints={{ width: 1280, height: 720, facingMode: { exact: 'environment'} }}
      >
        {({ getScreenshot }) => (
          <button
            disabled={isLoading}
            onClick={() => handleScreenshot(getScreenshot)}
            className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 py-2 px-4 sm:px-6 rounded-full text-sm sm:text-base text-white font-medium ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {isLoading ? 'Processing...' : 'Take photo'}
          </button>
        )}
      </Webcam>
    </div>

    {isLoading && (
      <div className='flex items-center justify-center p-4'>
        <div className='w-8 h-8 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin'/>
      </div>
    )}

    {error && (
      <div className='p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mt-4 text-sm'>
        <p className='font-medium mb-2'>Error:</p>
        <p>{error}</p>
      </div>
    )}

    {result && (
      <div className='flex flex-col items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 mt-4 text-center'>
        <p className='font-medium mb-2 text-sm sm:text-base'>Successfully identified:</p>
        <p className='mb-4 text-sm sm:text-base'>Book of {result.book}, Chapter {result.chapter}</p>
        <button 
          className='py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base'
          onClick={() => window.location.reload()}
        >
          Click here to view the whole chapter
        </button>
      </div>
    )}
  </div>
</div>
  );
}












// import type { MetaFunction } from "@remix-run/node";

// export const meta: MetaFunction = () => {
//   return [
//     { title: "AO LABS | Bible Scanner" },
//     { name: "description", content: "This is a web app that meant to be" },
//   ];
// };