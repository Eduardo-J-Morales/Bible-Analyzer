import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'

const storageData: any[] = []

export const action = async ({ request }: ActionFunctionArgs ) => {
    try {
        const { message, image } = await request.json()

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
        const model = genAI.getGenerativeModel({model: 'models/gemini-1.5-pro'})

        const imageResp = await fetch(image)
            .then((response) => response.arrayBuffer())

        const result = await model.generateContent([
            {
            inlineData: {
                data: Buffer.from(imageResp).toString('base64'),
                mimeType: 'image/jpeg'
            },
        },
        message,
    ])
    .then(res => res.response.text())
    .then(res => res.replace(/```json\n|\n```/g, ''))
    .then(res => JSON.parse(res))


    storageData.push(result)

    return new Response(JSON.stringify({answer: result}), 
        {
            headers: { 'Content-Type': 'application/json'}
        }
    )

    } catch (error) {
        return new Response(JSON.stringify({error: 'Error related to the API'})), {
            status: 429,
            headers: { 'Content-Type': 'application/json'}
        }
    }
}

export const loader = async () => {
    return new Response(JSON.stringify(storageData[0]), {
        headers: { 'Content-Type': "application/json"}
    })
}