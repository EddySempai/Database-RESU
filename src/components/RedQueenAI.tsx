import { useState, useEffect, useRef } from 'react';

const RedQueenAI = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypedText, setCurrentTypedText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const simulateAIResponse = (userText: string) => {
    setIsTyping(true);
    setCurrentTypedText('');
    
    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    
    const fakeResponse = "ANALIZANDO SITUACIÓN... \nADVERTENCIA: Probabilidad de supervivencia táctica reducida al 14.3%. \nRECOMENDACIÓN: Evacuar el perímetro inmediatamente o redirigir el fuego de supresión al sector este. \nQUE TENGAS UN BUEN DÍA.";
    let i = 0;
    
    const typeInterval = setInterval(() => {
      setCurrentTypedText(fakeResponse.substring(0, i + 1));
      i++;
      if (i >= fakeResponse.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'ai', text: fakeResponse }]);
        setCurrentTypedText('');
      }
    }, 40); // typing speed
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const text = input;
    setInput('');
    simulateAIResponse(text);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, currentTypedText]);

  return (
    <section className="relative z-10 py-24 px-6 md:px-12 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="font-mono text-neon-red text-sm tracking-widest uppercase mb-2">Uplink Establecido</h3>
          <h2 className="font-bebas text-5xl md:text-6xl tracking-wider text-white">IA Táctica "Red Queen"</h2>
        </div>

        <div className="bg-[#050505] border-2 border-gray-800 rounded-md overflow-hidden flex flex-col h-[500px] shadow-[0_0_30px_rgba(158,0,0,0.1)]">
          {/* Console Header */}
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between">
            <span className="font-mono text-xs text-red-500 flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
              SYS.RED_QUEEN.V4.1
            </span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-gray-700 rounded-full" />
              <div className="w-3 h-3 bg-gray-700 rounded-full" />
              <div className="w-3 h-3 bg-gray-700 rounded-full" />
            </div>
          </div>

          {/* Console Screen */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-4 bg-[#020202]"
          >
            <div className="text-gray-500">
              <p>Iniciando protocolo de enlace táctico...</p>
              <p>Conexión segura establecida con Mainframe.</p>
              <p>Esperando input del comandante...</p>
              <br/>
            </div>
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <span className={`text-xs mb-1 ${msg.role === 'user' ? 'text-gray-600' : 'text-blood-red'}`}>
                  {msg.role === 'user' ? 'COMANDANTE' : 'RED QUEEN'}
                </span>
                <div className={`whitespace-pre-wrap ${msg.role === 'user' ? 'text-gray-300' : 'text-neon-red'}`}>
                  {msg.role === 'user' ? `> ${msg.text}` : msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start">
                <span className="text-xs mb-1 text-blood-red">RED QUEEN</span>
                <div className="whitespace-pre-wrap text-neon-red drop-shadow-[0_0_5px_rgba(255,42,42,0.5)]">
                  {currentTypedText}<span className="animate-pulse bg-neon-red w-[8px] h-[16px] inline-block ml-1 align-middle"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 bg-black border-t border-gray-800 flex flex-col md:flex-row gap-4">
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describa su situación de combate..."
              className="flex-1 bg-[#111] border border-gray-700 text-white font-mono text-sm p-3 focus:border-blood-red outline-none resize-none h-16 transition-colors"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              type="submit"
              disabled={isTyping || !input.trim()}
              className="bg-gray-800 hover:bg-blood-red disabled:opacity-50 disabled:hover:bg-gray-800 text-white font-mono uppercase text-sm px-6 transition-colors duration-300 h-16"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RedQueenAI;
