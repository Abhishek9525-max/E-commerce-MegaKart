import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { getProductPricing } from "../../utils/productPricing";

const API_URL = import.meta.env.VITE_BACKEND_URL || "";

const initialMessage = {
  role: "assistant",
  content: "Hello! I can help you find products, shop within a budget, or answer shipping and returns questions.",
};

const formatPrice = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([initialMessage]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || isSending) return;

    setMessages((current) => [...current, { role: "user", content }]);
    setMessage("");
    setError("");
    setIsSending(true);

    try {
      const history = messages
        .slice(-6)
        .map(({ role, content: previousMessage }) => ({
          role,
          content: previousMessage,
        }));
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: content,
        history,
      }, {
        withCredentials: true,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.data.reply,
          products: response.data.products || [],
          loginPrompt: response.data.loginPrompt,
          aiUnavailable: response.data.aiAvailable === false,
        },
      ]);
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 401) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: "Please sign in to securely check your order status.",
            loginPrompt: true,
          },
        ]);
      } else {
        setError(
          requestError.response?.data?.message ||
            "I couldn't send that just now. Please try again."
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {isOpen ? (
        <section
          aria-label="MegaKart shopping assistant"
          className="flex h-[min(620px,calc(100dvh-2.5rem))] w-[min(390px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg border border-[#D8D2C8] bg-[#FAF9F6] shadow-[0_16px_50px_rgba(23,23,20,0.22)]"
        >
          <header className="flex items-center justify-between bg-[#414B36] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">MegaKart Assistant</p>
              <p className="mt-0.5 text-[11px] text-white/75">Product help, just for you</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
            >
              <FiX aria-hidden="true" />
            </button>
          </header>

          <div
            aria-live="polite"
            className="flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-4"
          >
            {messages.map((entry, index) => (
              <div
                key={`${entry.role}-${index}`}
                className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-lg px-3 py-2.5 text-sm leading-relaxed ${
                    entry.role === "user"
                      ? "bg-[#414B36] text-white"
                      : "border border-[#EAE6DF] bg-white text-[#33342E]"
                  }`}
                >
                  <p>{entry.content}</p>
                  {entry.aiUnavailable && (
                    <p className="mt-2 text-[11px] text-[#77746D]" role="status">
                      Natural-language AI is temporarily unavailable. Product search and verified support help are still available.
                    </p>
                  )}
                  {entry.loginPrompt && (
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="mt-2 inline-block text-xs font-semibold text-[#414B36] underline underline-offset-2"
                    >
                      Sign in
                    </Link>
                  )}
                  {entry.products?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {entry.products.map((product) => {
                        const price = getProductPricing(product).price;
                        const image = product.images?.[0]?.url;
                        return (
                          <Link
                            key={product._id}
                            to={`/product/${product._id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 rounded-md border border-[#EAE6DF] p-2 text-[#171714] hover:bg-[#FAF8F5]"
                          >
                            {image ? (
                              <img
                                src={image}
                                alt=""
                                className="h-14 w-12 shrink-0 rounded object-cover"
                              />
                            ) : (
                              <span className="flex h-14 w-12 shrink-0 items-center justify-center rounded bg-[#F0EDE7]">
                                <FiMessageCircle aria-hidden="true" />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-medium">{product.name}</span>
                              <span className="mt-1 block text-xs text-[#414B36]">{formatPrice(price)}</span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <p className="text-xs text-[#77746D]" role="status">Finding an answer...</p>
            )}
            {error && <p className="text-xs text-[#A94F38]" role="alert">{error}</p>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-[#EAE6DF] bg-white p-3">
            <label htmlFor="chat-message" className="sr-only">Message the shopping assistant</label>
            <div className="flex items-center gap-2">
              <input
                id="chat-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={500}
                placeholder="Ask about products or orders..."
                className="min-w-0 flex-1 rounded-md border border-[#D8D2C8] px-3 py-2.5 text-sm"
              />
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#414B36] text-white transition-colors hover:bg-[#30392A] disabled:opacity-50"
              >
                <FiSend aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[#77746D]">
              Order details are only available to the signed-in account owner.
            </p>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open shopping assistant"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#414B36] text-white shadow-lg transition-transform hover:scale-105"
        >
          <FiMessageCircle className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
