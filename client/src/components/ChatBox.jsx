import { useEffect, useRef, useState } from 'react';
import API from '../api/axiosInstance';
import socket from '../api/socket';
import { useAuth } from '../context/AuthContext';

export default function ChatBox({ projectId, projectStatus }) {
  const { user } = useAuth();
  const myId = user?._id || user?.id;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [canSend, setCanSend] = useState(projectStatus ? projectStatus === 'in-progress' : true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // Sync canSend with projectStatus prop whenever it changes
  useEffect(() => {
    if (projectStatus !== undefined) {
      setCanSend(projectStatus === 'in-progress');
    }
  }, [projectStatus]);

  // Add a message only if it isn't already in the list
  const addMessage = (msg) =>
    setMessages((prev) =>
      prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
    );

  useEffect(() => {
    let active = true;

    const onMessage = (msg) => addMessage(msg);

    const join = () => socket.emit('chat:join', projectId, (res) => {
      if (!active) return;
      if (!res?.ok) {
        setError(res?.message || 'Could not join chat');
        if (res?.message?.includes('closed') || res?.message?.includes('denied')) {
          setCanSend(false);
        }
      } else if (res?.canSend !== undefined) {
        setCanSend(res.canSend);
      }
    });

    // 1. Load history
    API.get(`/api/chat/${projectId}/messages`)
      .then(({ data }) => {
        if (!active) return;
        setMessages(data.data.messages);
        if (projectStatus !== undefined) {
          setCanSend(projectStatus === 'in-progress');
        } else {
          setCanSend(data.data.canSend);
        }
      })
      .catch((err) => {
        if (!active) return;
        const msg = err.response?.data?.message || 'Could not load chat';
        setError(msg);
        if (err.response?.status === 403 || msg.includes('closed')) {
          setCanSend(false);
        }
      })
      .finally(() => active && setLoading(false));

    // 2. Connect, join the room, listen
    socket.on('chat:message', onMessage);
    socket.on('connect', join);
    if (socket.connected) join();
    else socket.connect();

    return () => {
      active = false;
      socket.emit('chat:leave', projectId);
      socket.off('chat:message', onMessage);
      socket.off('connect', join);
    };
  }, [projectId, projectStatus]);

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
      setError('');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Could not send message';
      setError(errMsg);
      if (err.response?.status === 403 || errMsg.includes('closed')) {
        setCanSend(false);
      } else {
        setText(value);
      }
    }
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading chat...</p>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[28rem]">
      <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-900 flex justify-between items-center">
        <span>Project Chat</span>
        {!canSend && (
          <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Chat Closed
          </span>
        )}
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

      {canSend ? (
        <>
          {error && <p className="px-5 text-xs text-red-500 mb-1">{error}</p>}
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
        </>
      ) : (
        <div className="p-3 border-t border-gray-100 text-center text-xs text-gray-500 bg-gray-50 rounded-b-2xl font-medium">
          🔒 Chat is closed for this project.
        </div>
      )}
    </div>
  );
}