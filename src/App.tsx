import { useEffect, useState, useRef } from 'react';
import { Send, Bot, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  interface Message {
    sender: 'user' | 'bot';
    sender_id?: string;
    recipient_id?: string;
    msg: string;
  }

  const [chat, setChat] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [typingDots, setTypingDots] = useState("");
  const [name, setName] = useState("User");
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const scrollSuggestions = (direction: 'left' | 'right') => {
    if (suggestionsRef.current) {
      const scrollAmount = 200;
      const newScrollPosition = suggestionsRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      suggestionsRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    setName(uuidv4());
  }, []);

  useEffect(() => {
    const objDiv = document.getElementById("messageArea");
    if (objDiv) objDiv.scrollTop = objDiv.scrollHeight;
  }, [chat]);

  useEffect(() => {
    let typingInterval: number | undefined;
    if (botTyping) {
      typingInterval = setInterval(() => {
        setTypingDots((prev) => (prev === "...." ? "" : prev + "."));
      }, 500);
    } else {
      setTypingDots(".");
    }
    return () => clearInterval(typingInterval);
  }, [botTyping]);

  const handleSubmit = (evt: { preventDefault: () => void; }) => {
    evt.preventDefault();
    if (inputMessage.trim()) {
      const userMessage: Message = { sender: "user", sender_id: name, msg: inputMessage };
      setChat((prevChat) => [...prevChat, userMessage]);
      setBotTyping(true);
      setInputMessage("");
      rasaAPI(name, inputMessage);
    }
  };

  const rasaAPI = async (name: string, msg: string) => {
    try {
      const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sender: name, message: msg }),
      });
      const data = await response.json();
      if (data) {
        const botMessages = data.map((message: { recipient_id: any; text: any; }) => ({
          sender: "bot",
          recipient_id: message.recipient_id,
          msg: message.text,
        }));
        setBotTyping(false);
        setChat((prevChat) => [...prevChat, ...botMessages]);
      }
    } catch (error) {
      console.error("Error communicating with Rasa API:", error);
    }
  };

  const suggestions = [
    "Bonjour",
    "Quels filières sont disponibles ?",
    "Pouvez-vous lister les éléments qui dans GI ?",
    "Quels semesters sont dans le filière GI ?",
    "Quels modules sont dans le filière Génie Informatique ?",
    "Quels modules sont dans le Semester 1 ?",
    "Pouvez-vous lister les éléments de Reseaux?",
    "Pouvez-vous lister les éléments de Langues?",
    "Quel professeur est responsable de Réseaux",
    "Quel est l'email du professeur Baddi ?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[1000px]">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center gap-3">
          <Bot className="text-white w-8 h-8" />
          <h1 className="text-2xl font-bold text-white">Assistant IA</h1>
        </div>

        {/* Messages Area */}
        <div 
          id="messageArea"
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          {chat.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${
                message.sender === 'bot' 
                  ? 'flex-row' 
                  : 'flex-row-reverse'
              }`}>
                <div className={`rounded-full p-2 ${
                  message.sender === 'bot' 
                    ? 'bg-indigo-100' 
                    : 'bg-indigo-600'
                }`}>
                  {message.sender === 'bot' 
                    ? <Bot className="w-5 h-5 text-indigo-600" />
                    : <User className="w-5 h-5 text-white" />
                  }
                </div>
                <div className={`rounded-2xl px-4 py-2 ${
                  message.sender === 'bot'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-indigo-600 text-white'
                }`}>
                  <p className="whitespace-pre-line">{message.msg}</p>
                </div>
              </div>
            </div>
          ))}

          {botTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="rounded-full p-2 bg-indigo-100">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="rounded-2xl px-4 py-2 bg-gray-100">
                  <p>typing{typingDots}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="relative flex items-center">
            <button
              onClick={() => scrollSuggestions('left')}
              className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div 
              ref={suggestionsRef}
              className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory mx-8 px-2"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(suggestion)}
                  className="snap-start shrink-0 px-4 py-2 text-sm bg-white border border-gray-200 rounded-full hover:bg-indigo-50 hover:border-indigo-200 transition-colors whitespace-nowrap shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <button
              onClick={() => scrollSuggestions('right')}
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Input Area */}
        <form 
          onSubmit={handleSubmit}
          className="p-4 bg-white border-t border-gray-100 flex gap-2"
        >
          <input
            type="text"
            placeholder="Écrivez votre message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;