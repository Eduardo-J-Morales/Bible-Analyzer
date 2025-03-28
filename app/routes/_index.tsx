import Webcam from 'react-webcam'
import { useState } from 'react'

export interface AIResponse {
  status: 'success' | 'error';
  data?: {
    book: {name: string, shortName:  string}
    chapter: string;
  };
  message?: string;
}

export default function Index() {
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ chapter: string, book: {name: string, shortName: string} } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean | null>(false)
  const [cameraType, setCameraType] = useState<string | null>('environment')
  
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
            - Once you identified the book name of the visible  text, please return not only the name of the book, instead return one of the following objects, of course the one that correponds to the book that is present on the visible text.
            [
  { "name": "Genesis", "shortName": "GEN" },
  { "name": "Exodus", "shortName": "EXO" },
  { "name": "Leviticus", "shortName": "LEV" },
  { "name": "Numbers", "shortName": "NUM" },
  { "name": "Deuteronomy", "shortName": "DEU" },
  { "name": "Joshua", "shortName": "JOS" },
  { "name": "Judges", "shortName": "JDG" },
  { "name": "Ruth", "shortName": "RUT" },
  { "name": "1 Samuel", "shortName": "1SA" },
  { "name": "2 Samuel", "shortName": "2SA" },
  { "name": "1 Kings", "shortName": "1KI" },
  { "name": "2 Kings", "shortName": "2KI" },
  { "name": "1 Chronicles", "shortName": "1CH" },
  { "name": "2 Chronicles", "shortName": "2CH" },
  { "name": "Ezra", "shortName": "EZR" },
  { "name": "Nehemiah", "shortName": "NEH" },
  { "name": "Esther", "shortName": "EST" },
  { "name": "Job", "shortName": "JOB" },
  { "name": "Psalms", "shortName": "PSA" },
  { "name": "Proverbs", "shortName": "PRO" },
  { "name": "Ecclesiastes", "shortName": "ECC" },
  { "name": "Song", "shortName": "SNG" },
  { "name": "Isaiah", "shortName": "ISA" },
  { "name": "Jeremiah", "shortName": "JER" },
  { "name": "Lamentations", "shortName": "LAM" },
  { "name": "Ezekiel", "shortName": "EZK" },
  { "name": "Daniel", "shortName": "DAN" },
  { "name": "Hosea", "shortName": "HOS" },
  { "name": "Joel", "shortName": "JOL" },
  { "name": "Amos", "shortName": "AMO" },
  { "name": "Obadiah", "shortName": "OBA" },
  { "name": "Jonah", "shortName": "JON" },
  { "name": "Micah", "shortName": "MIC" },
  { "name": "Nahum", "shortName": "NAM" },
  { "name": "Habakkuk", "shortName": "HAB" },
  { "name": "Zephaniah", "shortName": "ZEP" },
  { "name": "Haggai", "shortName": "HAG" },
  { "name": "Zechariah", "shortName": "ZEC" },
  { "name": "Malachi", "shortName": "MAL" },
  { "name": "Matthew", "shortName": "MAT" },
  { "name": "Mark", "shortName": "MRK" },
  { "name": "Luke", "shortName": "LUK" },
  { "name": "John", "shortName": "JHN" },
  { "name": "Acts", "shortName": "ACT" },
  { "name": "Romans", "shortName": "ROM" },
  { "name": "1 Corinthians", "shortName": "1CO" },
  { "name": "2 Corinthians", "shortName": "2CO" },
  { "name": "Galatians", "shortName": "GAL" },
  { "name": "Ephesians", "shortName": "EPH" },
  { "name": "Philippians", "shortName": "PHP" },
  { "name": "Colossians", "shortName": "COL" },
  { "name": "1 Thessalonians", "shortName": "1TH" },
  { "name": "2 Thessalonians", "shortName": "2TH" },
  { "name": "1 Timothy", "shortName": "1TI" },
  { "name": "2 Timothy", "shortName": "2TI" },
  { "name": "Titus", "shortName": "TIT" },
  { "name": "Philemon", "shortName": "PHM" },
  { "name": "Hebrews", "shortName": "HEB" },
  { "name": "James", "shortName": "JAS" },
  { "name": "1 Peter", "shortName": "1PE" },
  { "name": "2 Peter", "shortName": "2PE" },
  { "name": "1 John", "shortName": "1JN" },
  { "name": "2 John", "shortName": "2JN" },
  { "name": "3 John", "shortName": "3JN" },
  { "name": "Jude", "shortName": "JUD" },
  { "name": "Revelation", "shortName": "REV" }
]
            
            2. **Output Format:**
            - Return ONLY a valid JSON object, without markdown or additional text.
            - Use this format (in Spanish):
            {
            "status": "success" | "error",
            "data": {
            "book": "BOOK_NAME_OBJECT",
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
  <div className='bg-white rounded-xl p-6 w-[100%] mx-auto overflow-hidden'>
  
  <div className='flex justify-end items-center'>
  <button className="md:hidden p-2 hover:bg-gray-100 scale-[1.5] absolute left-1/2 transform -translate-x-1/2 rounded-full">
    <span className="material-symbols-outlined text-3xl text-blue-600">
      cameraswitch
    </span>
  </button>
  <span className="material-symbols-outlined p-6 scale-[1.5] text-3xl text-blue-600">

    </span>
  <button className="p-2 absolute top-10 hover:bg-red-50 rounded-full">
    <span className="material-symbols-outlined  text-2xl text-red-600">
      close
    </span>
  </button>
</div>
    
    <div className='relative aspect-video bg-gray-200 rounded-lg overflow-hidden'>
      <Webcam
        audio={false}
        className='w-full h-full object-cover'
        screenshotFormat='image/jpeg'
        videoConstraints={{ width: 1280, height: 720, facingMode: `${cameraType}`}}
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
        <p className='mb-4 text-sm sm:text-base'>Book of {result.book.name}, Chapter {result.chapter}</p>
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