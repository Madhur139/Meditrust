import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Paperclip,
  Mic,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
  Info,
  ArrowRight,
  Stethoscope,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import aiService from "../../services/aiService";
import { logoutUser } from "../../features/auth/authSlice";

// ==========================================
// MOCK DATA (Hardcoded for teaching purposes)
// Later replace with: api.ai.sendChatMessage({ message, history })
// ==========================================

const MOCK_PROMPT_SUGGESTIONS = [
  "Explain my elevated fasting blood sugar (115 mg/dL)",
  "Can I take ibuprofen with amoxicillin?",
  "Safe home remedies for persistent dry cough",
  "When should I see an urgent care doctor for migraine?",
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "ai",
    text: "Hello! I am MediTrust's AI health assistant. Ask me general health questions and I'll share safe, educational guidance. For anything specific or urgent, please consult a licensed doctor.",
    time: "Just now",
  },
];

export default function AiChatPage({ onNavigate }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [failedMessage, setFailedMessage] = useState(null);

  const go = (route, legacyId) => {
    if (typeof onNavigate === "function" && legacyId) {
      try {
        onNavigate(legacyId);
      } catch {
        // ignore legacy demo navigator errors
      }
    }
    navigate(route);
  };

  const now = () =>
    new Date().toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });

  const toHistory = (msgs) =>
    msgs
      .filter((m) => m.sender === "user" || m.sender === "ai")
      .slice(-20)
      .map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text,
      }));

  const sendToAi = async (text, baseMessages) => {
    setIsPending(true);
    setChatError("");
    try {
      const reply = await aiService.sendChatMessage({
        message: text,
        history: toHistory(baseMessages),
        token: user?.token,
      });
      if (!reply) throw new Error("Empty response from AI service.");
      setMessages([
        ...baseMessages,
        { id: baseMessages.length + 1, sender: "ai", text: reply, time: now() },
      ]);
      setFailedMessage(null);
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("user");
        dispatch(logoutUser());
        navigate("/login");
        return;
      }
      setChatError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not reach the AI service.",
      );
      setFailedMessage({ text, baseMessages });
    } finally {
      setIsPending(false);
    }
  };

  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text || isPending) return;
    const userMsg = {
      id: messages.length + 1,
      sender: "user",
      text,
      time: now(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInputText("");
    sendToAi(text, next);
  };

  const handleRetry = () => {
    if (!failedMessage || isPending) return;
    sendToAi(failedMessage.text, failedMessage.baseMessages);
  };

  const handleNewChat = () => {
    if (isPending) return;
    setMessages(INITIAL_MESSAGES);
    setChatError("");
    setFailedMessage(null);
    setInputText("");
  };

  const handleSelectPrompt = (prompt) => {
    setInputText(prompt);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                MediTrust AI Clinical Companion
              </h1>
              <Badge variant="purple" size="sm" dot>
                Clinical v4.2 Active
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trained on peer-reviewed clinical guidelines • HIPAA secure
              session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => go("/doctors", "doctors")}
            icon={Stethoscope}>
            Connect with Real Doctor
          </Button>
          <button
            onClick={handleNewChat}
            disabled={isPending}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            title="Start a new conversation">
            New Chat
          </button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-semibold text-slate-400 shrink-0">
          Try asking:
        </span>
        {MOCK_PROMPT_SUGGESTIONS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSelectPrompt(prompt)}
            className="px-3 py-1.5 rounded-xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-800 text-xs font-medium whitespace-nowrap transition-colors">
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <Card className="p-4 sm:p-6 min-h-[480px] max-h-[600px] overflow-y-auto space-y-5 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? "bg-teal-600 text-white"
                    : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xs"
                }`}>
                {isUser ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-xl space-y-1.5 ${isUser ? "items-end text-right" : "items-start text-left"}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? "bg-teal-600 text-white rounded-tr-none"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-2"
                  }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* AI Evidence Sources */}
                  {msg.sources && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-600">
                        Verified Sources:
                      </span>
                      {msg.sources.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 px-1">
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator Animation */}
        {isPending && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-xs flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
              <span className="text-xs text-slate-400 font-medium ml-1.5">
                MediTrust AI is formulating medical guidance...
              </span>
            </div>
          </div>
        )}

        {/* Error with retry (no fake AI response on failure) */}
        {chatError && !isPending && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>{chatError}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        )}
      </Card>

      {/* Input Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-sm flex items-center gap-2">
        <button
          type="button"
          onClick={() => go("/auth/ai-hub/prescription", "ai-prescription")}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Attach prescription or lab report">
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask MediTrust AI about medicines, symptoms, or test results..."
          disabled={isPending}
          className="flex-1 bg-transparent border-0 text-sm text-slate-800 placeholder-slate-400 focus:outline-none px-2 disabled:opacity-60"
        />

        {/* <button
          type="button"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Voice input"
        >
          <Mic className="w-5 h-5" />
        </button> */}

        <Button
          variant="ai"
          size="sm"
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isPending}
          icon={Send}
          className="shadow-xs">
          {isPending ? "Sending…" : "Send"}
        </Button>
      </div>
    </div>
  );
}
