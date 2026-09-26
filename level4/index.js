import express from "express"
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai"
import {ChatGoogleGenerativeAI} from "@langchain/google-genai"
import { ChatGroq } from "@langchain/groq"
import { Annotation, END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { TavilySearch } from "@langchain/tavily"

dotenv.config()

const port = 5000

const app = express()
app.use(express.json())


// const ai = new GoogleGenAI({
//     apiKey:process.env.GEMINI_API_KEY
// })

// app.post("/ai", async (req, res) => {
//     const { input } = req.body

//        const response = await ai.models.generateContent({
//         model: "gemini-3.5-flash",
//         contents: [
//             {
//                 role: "system",
//                 parts: [{ text: "You are assistant and your name is Jarvis" }]
//             },
//             {
//                 role: "user",
//                 parts: [{ text: input }]
//             }
//         ]
//     })

//     return res.status(200).json({ ai: response.text })
// })


//WITH LANGCHAIN

// const llm = new ChatGoogleGenerativeAI({
//     model:"gemini-3.5-flash"
// })

//GROQ

const tool = new TavilySearch({
  maxResults: 5,
  topic: "general",
});

const tools = [tool]
const toolNode = new ToolNode(tools)

const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature:0.7,
    maxTokens:100,
    maxRetries:2
}).bindTools(tools)

// const State = Annotation.Root({
//     prompt:Annotation,
//     aiMsg:Annotation
// })

const callLLm = async (state)=>{
    console.log("state:",state)

    const response = await llm.invoke([
        {
            role:"system",
            content:"You are assistant and your name is Jarvis. If you don't know the answer please don't give the wrong answer"
        },
        
        ...state.messages
    ])

    return {messages:[response]}
}

const shouldContinue = async(state)=>{
  const lastMessage = state.messages[state.messages.length-1]
  if(lastMessage.tool_calls.length > 0){
    return "tools"
  }
  else{
    return END
  }
}

const graph = new StateGraph(MessagesAnnotation)
.addNode("agent",callLLm)
.addNode("tools",toolNode)
.addEdge(START,"agent")
.addEdge("tools","agent")
.addConditionalEdges("agent",shouldContinue)
.compile()


// app.post("/ai",async(req,res)=>{

//     const{input} = req.body

//     const response = await llm.invoke([
//         {
//             role:"system",
//             content:"You are assistant and your name is Jarvis. If you don't know the answer please don't give the wrong answer"
//         },
//         {
//             role:"human",
//             content:input
//         }
//     ])

//     return res.status(200).json({"ai:":response.content})
// })

app.post("/ai",async(req,res)=>{

    const {input} = req.body

    const response = await graph.invoke({messages:[

        { 
            role:"user",
            content:input
        }
    ]})
    console.log(response.messages)

    return res.status(200).json({ "ai": response })
})

app.get("/",(req,res)=>{
    res.status(200).json({message:"Hello from AI world"})
})

app.listen(port,()=>{
    console.log(`server started on port ${port}`)
})