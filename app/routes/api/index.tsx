import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ActionFunctionArgs, LoaderFunctionArgs} from '@remix-run/node'
import { json } from "@remix-run/node";
import type { AIResponse } from '../_index'



const storagedData: (AIResponse | null)[] = []


export async function action({ request }: ActionFunctionArgs) {
  
  if(request.method == 'POST') {
    
    try {
      const { message, image } = await request.json();
      
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });
      
      const imageResp = await fetch(image)
      .then((response) => response.arrayBuffer());
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: Buffer.from(imageResp).toString("base64"),
            mimeType: "image/jpeg",
          },
        },
        message,
      ]).then(res => res.response.text())
      .then(res => res.replace(/```json\n|\n```/g, ''))
      .then(res => JSON.parse(res))
      
      storagedData.push(result);



      return json({ answer: result }, {headers: {'Access-Control-Allow-Origin': '*'}, status:200});
      
    } catch (error) {
      return json({ error: "Rate limit exceeded" }, {headers: {'Access-Control-Allow-Origin': '*'}, status: 429});
    } 
  }
  }
  
  export async function loader({ request }: LoaderFunctionArgs) {
    setTimeout(async () => {
      storagedData[0] = null
    }, 15000)
    
    return json(storagedData[0], {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });


  }