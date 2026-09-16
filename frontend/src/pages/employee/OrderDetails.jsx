import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import { procurementService } from '../../services/procurementService'; // assume we have this
import { ArrowLeft, Send, User, Building2 } from 'lucide-react';

export const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now since we don't have the full API wired up in this snippet
    setTimeout(() => {
      setOrder({
        id: id,
        poNumber: 'PO-2023-1001',
        supplierName: 'TechCorp Supplies',
        totalAmount: 1500.00,
        status: 'CONFIRMED',
        deliveryStatus: 'SHIPPED',
        createdAt: '2023-10-15T10:30:00Z'
      });
      setMessages([
        { id: 1, senderName: 'TechCorp Supplies', senderId: 99, message: 'Your order has been shipped. Expected delivery on Friday.', timestamp: '2023-10-16T09:00:00Z' }
      ]);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Mock sending message
    setMessages([...messages, {
      id: Date.now(),
      senderName: user.name,
      senderId: user.id,
      message: newMessage,
      timestamp: new Date().toISOString()
    }]);
    setNewMessage('');
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading order details...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-4 shrink-0">
        <Link to="/dashboard/orders" className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Order {order.poNumber}</h1>
          <p className="text-sm text-slate-500">{order.supplierName} • {order.status}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Order Info */}
        <div className="lg:w-1/3 flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar pr-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-medium text-slate-900">${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-medium text-blue-600">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery:</span>
                <span className="font-medium text-amber-600">{order.deliveryStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Supplier Coordination
            </h2>
            <p className="text-xs text-slate-500">Chat with {order.supplierName}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 mt-10">No messages yet.</div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white shrink-0 flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message to the supplier..."
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
