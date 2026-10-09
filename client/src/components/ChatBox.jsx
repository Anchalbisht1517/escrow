import { useEffect, useRef, useState } from 'react';
import API from '../api/axiosInstance';
import socket from '../api/socket';
import { useAuth } from '../context/AuthContext';

export default function ChatBox({ projectId }) {
  const { user } = useAuth();
  const myId = user?._id || user?.id;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [canSend, setCanSend] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // Add a message only if it isn't already in the list
  const addMessage = (msg) =>
    setMessages((prev) =>
      prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
    );

  useEffect(() => {
    let active = true;

    const onMessage = (msg) => addMessage(msg);

    const join = () => socket.emit('chat:join', projectId, (res) => {
      if (!res?.ok && active) setError(res?.message || 'Could not join chat');
    });

    // 1. Load history
    API.get(`/api/chat/${projectId}/messages`)
      .then(({ data }) => {
        if (!active) return;
        setMessages(data.data.messages);
        setCanSend(data.data.canSend);
      })
      .catch((err) => active && setError(err.response?.data?.message || 'Could not load chat'))
      .finally(() => active && setLoading(false));

    // 2. Connect, join the room, listen
    socket.on('chat:message', onMessage);
    socket.on('connect', join); // re-join after a reconnect
    if (socket.connected) join();
    else socket.connect();

    return () => {
      active = false;
      socket.emit('chat:leave', projectId);
      socket.off('chat:message', onMessage);
      socket.off('connect', join);
    };
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText('');
    try {
      const { data } = await API.post(`/api/chat/${projectId}/messages`, { text: value });
      addMessage(data.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send message');
      setText(value);
    }
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading chat...</p>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[28rem]">
      <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-900">
        Project Chat
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm">No messages yet. Say hello!</p>
        )}
        {messages.map((m) => {
          const mine = (m.sender?._id || m.sender) === myId;
          return (
            <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                mine ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}>
                {!mine && (
                  <p className="text-xs font-semibold mb-0.5">{m.sender?.firstName}</p>
                )}
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <p className={`text-[10px] mt-1 ${mine ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-5 text-xs text-red-500">{error}</p>}

      {canSend ? (
        <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            placeholder="Type a message..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            Send
          </button>
        </form>
      ) : (
        <p className="p-3 border-t border-gray-100 text-center text-xs text-gray-400">
          Chat is closed for this project.
        </p>
      )}
    </div>
  );
}