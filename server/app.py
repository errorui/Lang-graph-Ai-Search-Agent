from typing import TypedDict, Annotated, Optional
from langgraph.graph import add_messages, StateGraph, END

from langchain_core.messages import HumanMessage, AIMessageChunk,AIMessage, ToolMessage
from dotenv import load_dotenv
from langchain_community.tools.tavily_search import TavilySearchResults
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from uuid import uuid4
from langgraph.checkpoint.memory import MemorySaver

import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

memory = MemorySaver()

class State(TypedDict):  # type: ignore
    messages: Annotated[list, add_messages]

from langchain_google_genai import ChatGoogleGenerativeAI

model = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.5
)

search_tool = TavilySearchResults(max_results=5)
tools = [search_tool]
llm_with_tools = model.bind_tools(tools=tools)  # type: ignore

async def model_node(state: State):
    # logger.info(f"[model_node] Invoking model with messages: {state['messages']}")
    result = await llm_with_tools.ainvoke(state["messages"])
    # logger.info(f"[model_node] Model result: {result}")
    return {"messages": [result]}

async def tools_router(state: State):
    last_message = state["messages"][-1]
    # logger.info(f"[tools_router] Last message: {last_message}")
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        # logger.info("[tools_router] Tool calls found, routing to 'tool_node'")
        return "tool_node"
    else:
        # logger.info("[tools_router] No tool calls, routing to END")
        return "end"

async def tool_node(state):
    tool_calls = state["messages"][-1].tool_calls
    tool_messages = []

    # logger.info(f"[tool_node] Processing {len(tool_calls)} tool call(s)")

    for tool_call in tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_id = tool_call["id"]

        # logger.info(f"[tool_node] Tool call: {tool_name}, args: {tool_args}")

        if tool_name == "tavily_search_results_json":
            try:
                search_results = await search_tool.ainvoke(tool_args)
                # logger.info(f"[tool_node] Search result: {search_results}")
                tool_message = ToolMessage(
                    content=json.dumps(search_results),
                    tool_call_id=tool_id,
                    name=tool_name
                )
                tool_messages.append(tool_message)
            except Exception as e:
                logger.error(f"[tool_node] Tool failed: {e}")
    
    return {"messages": tool_messages}

graph_builder = StateGraph(State)
graph_builder.add_node("model", model_node)
graph_builder.add_node("tool_node", tool_node)
graph_builder.set_entry_point("model")
graph_builder.add_conditional_edges("model", tools_router, {"end": END, "tool_node": "tool_node"})
graph_builder.add_edge("tool_node", "model")
graph = graph_builder.compile(checkpointer=memory)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type"],
)
import ast
from collections.abc import Mapping

def serialise_ai_message_chunk(chunk):
    # print("the chunk received", chunk)
    print("type of chunk:", type(chunk))

# Option 1: If you want to check if it has an attribute 'content'
    if hasattr(chunk, "content") and chunk.content:
        print("checking: content exists")

    if isinstance(chunk, dict) and "messages" in chunk:
        
        # print("checking: message key exists in dict",chunk["messages"])
        for msg in chunk["messages"]:
                    
            if isinstance(msg, ToolMessage) and msg.name == "tavily_search_results_json":
                return []
            if isinstance(msg, AIMessage) and msg.content=='':
                # print(msg)
                if msg.additional_kwargs and "function_call" in msg.additional_kwargs:
                    function_call = msg.additional_kwargs["function_call"]
                    if isinstance(function_call, dict):
                        args = function_call.get("arguments", "{}")
                        # print(args)
                       
                        parsed_args = json.loads(args)
                        query = parsed_args.get("query", "")
                        safe_query = query.replace('"', '\\"').replace("'", "\\'").replace("\n", "\\n")
                        # print("safe query",safe_query)
                      
                        return f"search_query {safe_query} "

            

    
    try:
        # Case 1: If it's directly an AIMessage or ToolMessage
         

        if hasattr(chunk, "content"):
            return chunk.content

        # Case 2: LangGraph returns Mapping-like chunk with 'messages'
        if isinstance(chunk, Mapping) and "messages" in chunk:
            contents = []
            for msg in chunk["messages"]:
                # ToolMessage edge case: parse the string content
                if hasattr(msg, "content"):
                    contents.append(msg.content)
            
            # if content empty, yield search started
            # if
            print(contents)        
            return "\n".join(contents)

        # raise TypeError(f"Unexpected chunk format: {type(chunk)}")

    except Exception as e:
        logger.error(f"[serialise_ai_message_chunk] Error: {e}")
        return "[Serialization Error]"

async def generate_chat_responses(message: str, checkpoint_id: Optional[str] = None):
    is_new_conversation = checkpoint_id is None
    thread_id = str(uuid4()) if is_new_conversation else checkpoint_id

    config = {"configurable": {"thread_id": thread_id}}
    logger.info(f"[generate_chat_responses] Thread ID: {thread_id}, Message: {message}")

    events = graph.astream_events(
        {"messages": [HumanMessage(content=message)]},
        version="v2",
        config=config
    )

    if is_new_conversation:
        yield f"data: {{\"type\": \"checkpoint\", \"checkpoint_id\": \"{thread_id}\"}}\n\n"

    async for event in events:
        logger.info(f"[Event] Type: {event['event']}")
        event_type = event["event"]

        if event_type == "on_chain_stream":
            chunk = event["data"]["chunk"]
            # Print tool name if chunk is a ToolMessage
            # print(chunk)
            if hasattr(chunk, "tool_call_id") and hasattr(chunk, "name"):
                print(f"ToolMessage tool: {chunk.name}")
            # Case 1: AIMessage with content
            chunk_content = serialise_ai_message_chunk(chunk)
            if chunk_content and chunk_content != "[Serialization Error]":
                if chunk_content.startswith("search_query "):
                # extract query part after prefix
                    query = chunk_content.split(" ", 1)[1]
                    yield f"data: {{\"type\": \"search_start\", \"query\": \"{query}\"}}\n\n"
                else:
                    payload = {
                    "type": "content",
                    "content": chunk_content
                        }
                    yield f'data: {json.dumps(payload)}\n\n'

            # Case 2: ToolMessage containing tavily_search_results_json response
            if isinstance(chunk, dict) and "messages" in chunk:
                logger.error(f"[ToolMessage Parse Error no] ")
                for msg in chunk["messages"]:
                    
                    if isinstance(msg, ToolMessage) and msg.name == "tavily_search_results_json":
                        # print("tool",msg)
                        try:
                            parsed = ast.literal_eval(msg.content)
                            print("parsed",parsed)
                            urls = [item["url"] for item in parsed if isinstance(item, dict) and "url" in item]
                            urls_json = json.dumps(urls)
                            yield f"data: {{\"type\": \"search_results\", \"urls\": {urls_json}}}\n\n"
                        except Exception as e:
                            logger.error(f"[ToolMessage Parse Error] {e}")

        

    yield f"data: {{\"type\": \"end\"}}\n\n"
    logger.info("[generate_chat_responses] Stream ended")


   
@app.get("/chat_stream/{message}")
async def chat_stream(message: str, checkpoint_id: Optional[str] = Query(None)):
    return StreamingResponse(
        generate_chat_responses(message, checkpoint_id),
        media_type="text/event-stream"
    )

import uvicorn
if __name__ == "__main__":
    
    uvicorn.run(
        "app:app",            # filename:app
              # or "127.0.0.1" for local only

        host="0.0.0.0",      
        port=8000,
        reload=True            # optional: auto-reload on code change (dev only)
    )
