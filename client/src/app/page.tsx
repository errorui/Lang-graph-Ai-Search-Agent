"use client"
import Header from './components/Hearder';
import InputBar from './components/InputBar';
import MessageArea from './components/MessageArea';
import React, { useState } from 'react';

interface SearchInfo {
  stages: string[];
  query: string;
  urls: string[];
  error?: string; // Add an error property to SearchInfo
}

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  type: string;
  isLoading?: boolean;
  searchInfo?: SearchInfo;
}

const Home = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: 'Hi there, how can I help you?',
      isUser: false,
      type: 'message'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [checkpointId, setCheckpointId] = useState<string | null>(null); // Explicitly type checkpointId

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      const newMessageId = messages.length > 0 ? Math.max(...messages.map(msg => msg.id)) + 1 : 1;

      setMessages(prev => [
        ...prev,
        {
          id: newMessageId,
          content: currentMessage,
          isUser: true,
          type: 'message'
        }
      ]);

      const userInput = currentMessage;
      setCurrentMessage(""); // Clear input field immediately

      try {
        const aiResponseId = newMessageId + 1;
        setMessages(prev => [
          ...prev,
          {
            id: aiResponseId,
            content: "",
            isUser: false,
            type: 'message',
            isLoading: true, // Keep isLoading true initially
            searchInfo: {
              stages: [],
              query: "",
              urls: []
            }
          }
        ]);

        let url = `${process.env.NEXT_PUBLIC_API_URL}/chat_stream/${encodeURIComponent(userInput)}`;
        console.log("Connecting to SSE endpoint:", url);
        if (checkpointId) {
          url += `?checkpoint_id=${encodeURIComponent(checkpointId)}`;
        }

        const eventSource = new EventSource(url);
        let streamedContent = "";
        let currentSearchInfo: SearchInfo | null = null; // Use a mutable variable for search info

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'checkpoint') {
              setCheckpointId(data.checkpoint_id);
            } else if (data.type === 'content') {
              streamedContent += data.content;
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiResponseId
                    ? { ...msg, content: streamedContent } // Update content, isLoading remains true
                    : msg
                )
              );
            } else if (data.type === 'search_start') {
              const newSearchInfo: SearchInfo = {
                stages: ['searching'],
                query: data.query,
                urls: []
              };
              currentSearchInfo = newSearchInfo; // Update the mutable search info

              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiResponseId
                    ? { ...msg, searchInfo: { ...newSearchInfo }, isLoading: true } // Still loading during search
                    : msg
                )
              );
            } else if (data.type === 'search_results') {
              try {
                const urls = typeof data.urls === 'string' ? JSON.parse(data.urls) : data.urls;
                const updatedStages = currentSearchInfo ? [...currentSearchInfo.stages, 'reading'] : ['reading'];
                const newSearchInfo: SearchInfo = {
                  stages: updatedStages,
                  query: currentSearchInfo?.query || "",
                  urls: urls
                };
                currentSearchInfo = newSearchInfo; // Update the mutable search info

                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === aiResponseId
                      ? { ...msg, searchInfo: { ...newSearchInfo }, isLoading: true } // Still loading during reading
                      : msg
                  )
                );
              } catch (err) {
                console.error("Error parsing search results:", err);
              }
            } else if (data.type === 'search_error') {
              const updatedStages = currentSearchInfo ? [...currentSearchInfo.stages, 'error'] : ['error'];
              const newSearchInfo: SearchInfo = {
                stages: updatedStages,
                query: currentSearchInfo?.query || "",
                error: data.error,
                urls: []
              };
              currentSearchInfo = newSearchInfo; // Update the mutable search info

              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiResponseId
                    ? { ...msg, searchInfo: { ...newSearchInfo }, isLoading: true } // Still loading as this is part of processing
                    : msg
                )
              );
            } else if (data.type === 'end') {
              // When stream ends, set isLoading to false and update final search info
              const finalSearchInfo = currentSearchInfo ? {
                ...currentSearchInfo,
                stages: [...currentSearchInfo.stages, 'writing']
              } : undefined; // Only add 'writing' if search info exists

              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiResponseId
                    ? { ...msg, isLoading: false, searchInfo: finalSearchInfo } // Mark as not loading
                    : msg
                )
              );
              eventSource.close();
            }
          } catch (error) {
            console.error("Error parsing event data:", error, event.data);
            eventSource.close(); // Close on parsing error

            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiResponseId
                  ? { ...msg, content: streamedContent || "Sorry, there was an error processing your request.", isLoading: false }
                  : msg
              )
            );
          }
        };

        eventSource.onerror = (error) => {
          console.error("EventSource error:", error);
          eventSource.close();

          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiResponseId
                ? { ...msg, content: streamedContent || "Sorry, there was an error connecting to the server.", isLoading: false }
                : msg
            )
          );
        };
      } catch (error) {
        console.error("Error setting up EventSource:", error);
        const newMessageId = messages.length > 0 ? Math.max(...messages.map(msg => msg.id)) + 1 : 1;
        setMessages(prev => [
          ...prev,
          {
            id: newMessageId, // Use a new ID for the error message
            content: "Sorry, there was an error connecting to the server.",
            isUser: false,
            type: 'message',
            isLoading: false
          }
        ]);
      }
    }
  };

  return (
    <div className=" bg-gray-black min-h-screen ">
      <div className="w-full min-h-screen bg-white flex flex-col  shadow-lg   overflow-hidden h-screen">
        <Header />
        <MessageArea messages={messages} />
        <InputBar currentMessage={currentMessage} setCurrentMessage={setCurrentMessage} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default Home;