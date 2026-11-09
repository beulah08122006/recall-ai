import { useEffect, useState } from "react";
import {
  Brain,
  Home,
  BrainCircuit,
  Handshake,
  Backpack,
  Bell,
  Sparkles,
  BarChart3,
  Settings,
  Search,
  Mic,
  Send,
  Plus,
  ChevronDown,
  Check,
  AlertTriangle,
  Package,
  Clock3,
  Menu,
  X,
} from "lucide-react";

import "./App.css";

/* =========================================
   TYPES
========================================= */

type Page =
  | "home"
  | "memories"
  | "borrowed"
  | "carry"
  | "reminders"
  | "assistant"
  | "insights"
  | "settings";

type Memory = {
  _id: string;
  text: string;
  category?: string;
  user?: string;
  createdAt?: string;
};

/* =========================================
   APP
========================================= */

function App() {
  const [page, setPage] = useState<Page>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = (newPage: Page) => {
    setPage(newPage);
    setSidebarOpen(false);
  };

  return (
    <div className="app">

      {/* =========================================
          BACKGROUND
      ========================================= */}

      <div className="background">
        <video
          className="bg-video"
          autoPlay
          loop
          muted
          playsInline
          src="/recall-ai.mp4"
        />
        <div className="grid-line vertical" style={{ left: "25%" }}></div>
        <div className="grid-line vertical" style={{ left: "75%" }}></div>
        <div className="grid-line horizontal" style={{ top: "33%" }}></div>
      </div>

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        <div className="sidebar-top">

          {/* BRAND */}

          <div className="brand">

            <div className="brand-icon ai-pulse">
              <Brain size={23} />
            </div>

            <div>
              <h2>
                Recall <span>AI</span>
              </h2>

              <p>
                Remember before you forget.
              </p>
            </div>

            <button
              className="mobile-close"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>

          </div>

          {/* MAIN NAVIGATION */}

          <div className="nav-section">

            <NavItem
              icon={<Home size={18} />}
              label="Home"
              active={page === "home"}
              onClick={() => navigate("home")}
            />

            <NavItem
              icon={<BrainCircuit size={18} />}
              label="Memories"
              active={page === "memories"}
              onClick={() => navigate("memories")}
            />

            <NavItem
              icon={<Handshake size={18} />}
              label="Borrowed"
              active={page === "borrowed"}
              onClick={() => navigate("borrowed")}
            />

            <NavItem
              icon={<Backpack size={18} />}
              label="Carry List"
              active={page === "carry"}
              onClick={() => navigate("carry")}
            />

            <NavItem
              icon={<Bell size={18} />}
              label="Reminders"
              active={page === "reminders"}
              onClick={() => navigate("reminders")}
            />

          </div>

          <div className="nav-divider"></div>

          {/* ASK RECALL */}

          <div className="nav-section">

            <button
              className={`ai-nav ${
                page === "assistant" ? "active" : ""
              }`}
              onClick={() => navigate("assistant")}
            >

              <div className="ai-nav-icon">
                <Sparkles size={18} />
              </div>

              <div className="ai-nav-content">
                <strong>Ask Recall</strong>
                <span>
                  Your AI memory assistant
                </span>
              </div>

            </button>

          </div>

          <div className="nav-divider"></div>

          {/* SECONDARY NAVIGATION */}

          <div className="nav-section">

            <NavItem
              icon={<BarChart3 size={18} />}
              label="Insights"
              active={page === "insights"}
              onClick={() => navigate("insights")}
            />

            <NavItem
              icon={<Settings size={18} />}
              label="Settings"
              active={page === "settings"}
              onClick={() => navigate("settings")}
            />

          </div>

        </div>

        {/* AI CARD */}

        <div className="sidebar-ai-card">

          <div className="sidebar-ai-glow"></div>

          <div className="sidebar-ai-icon ai-float">
            <Sparkles size={22} />
          </div>

          <h3>
            Recall is ready.
          </h3>

          <p>
            Tell me what happened.
            <br />
            I'll remember it for you.
          </p>

          <button
            onClick={() => navigate("assistant")}
          >
            <Mic size={15} />
            Talk to Recall
          </button>

        </div>

        {/* PROFILE */}

        <div className="profile">

          <div className="avatar">
            B
          </div>

          <div className="profile-info">
            <strong>Beulah</strong>
            <span>Personal memory</span>
          </div>

          <ChevronDown size={15} />

        </div>

      </aside>

      {/* =========================================
          MAIN
      ========================================= */}

      <main className="main">

        {/* TOPBAR */}

        <header className="topbar">

          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={21} />
          </button>

          <div className="search-box">

            <Search size={17} />

            <input
              placeholder="Search your memories..."
            />

            <span>
              ⌘ K
            </span>

          </div>

          <div className="top-actions">

            <button className="icon-button">

              <Bell size={19} />

              <span className="notification-dot">
                3
              </span>

            </button>

            <div className="top-avatar">
              B
            </div>

            <div className="top-name">
              <strong>Beulah</strong>
              <ChevronDown size={14} />
            </div>

          </div>

        </header>

        {/* =========================================
            PAGE CONTENT
        ========================================= */}

        {page === "home" && (
          <HomePage
            onAssistant={() => navigate("assistant")}
          />
        )}

        {page === "assistant" && (
          <AssistantPage
            message={message}
            setMessage={setMessage}
          />
        )}

        {page === "memories" && (
          <MemoriesPage />
        )}

        {page === "borrowed" && (
          <SimplePage
            icon={<Handshake />}
            title="Borrowed Items"
            description="Keep track of everything you've lent."
          />
        )}

        {page === "carry" && (
          <SimplePage
            icon={<Backpack />}
            title="Carry List"
            description="Things Recall thinks you should take."
          />
        )}

        {page === "reminders" && (
          <SimplePage
            icon={<Bell />}
            title="Smart Reminders"
            description="Recall will remind you before you forget."
          />
        )}

        {page === "insights" && (
          <SimplePage
            icon={<BarChart3 />}
            title="Memory Insights"
            description="See patterns in the things you remember."
          />
        )}

        {page === "settings" && (
          <SimplePage
            icon={<Settings />}
            title="Settings"
            description="Customize your Recall AI experience."
          />
        )}

      </main>

    </div>
  );
}

/* =========================================
   NAV ITEM
========================================= */

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`nav-item ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* =========================================
   HOME PAGE
========================================= */

function HomePage({
  onAssistant,
}: {
  onAssistant: () => void;
}) {
  return (
    <div className="content">

      {/* WELCOME */}

      <div className="welcome">

        <div>

          <div className="eyebrow">
            YOUR PERSONAL AI MEMORY
          </div>

          <h1>
            Good morning, Beulah 👋
          </h1>

          <p>
            Your memories are organized and ready
            when you need them.
          </p>

        </div>

        <div className="date-card">
          <Clock3 size={15} />
          Thursday, August 20
        </div>

      </div>

      {/* STATS */}

      <div className="stats-grid">

        <Stat
          icon={<BrainCircuit />}
          number="128"
          label="Total Memories"
          color="purple"
        />

        <Stat
          icon={<Handshake />}
          number="4"
          label="Borrowed Items"
          color="green"
        />

        <Stat
          icon={<Bell />}
          number="3"
          label="Reminders"
          color="orange"
        />

        <Stat
          icon={<Backpack />}
          number="7"
          label="Carry Items"
          color="blue"
        />

      </div>

      {/* AI CTA */}

      <section className="ai-hero">

        <div className="ai-hero-glow"></div>

        <div className="ai-avatar ai-float ai-pulse">
          <Sparkles size={27} />
        </div>

        <div className="ai-hero-content">

          <div className="ai-label">
            <Sparkles size={14} />
            RECALL AI
          </div>

          <h2>
            What should I remember
            <span> for you?</span>
          </h2>

          <p>
            Tell me what you lent, where you're going,
            or anything you don't want to forget.
          </p>

          <button
            className="ask-ai-button"
            onClick={onAssistant}
          >
            Ask Recall
            <Sparkles size={16} />
          </button>

        </div>

      </section>

      {/* LOWER GRID */}

      <div className="dashboard-grid">

        {/* ATTENTION */}

        <section className="dashboard-card">

          <div className="card-header">

            <div>
              <small>ATTENTION</small>
              <h2>
                Needs your attention
              </h2>
            </div>

            <button>
              View all →
            </button>

          </div>

          <div className="attention-item">

            <div className="item-icon orange">
              <Package size={22} />
            </div>

            <div className="attention-info">

              <h3>
                Your calculator is with Priya
              </h3>

              <p>
                You may need it for your upcoming
                mathematics exam.
              </p>

              <div className="item-meta">

                <Clock3 size={13} />

                Lent 7 days ago

                <span>
                  <AlertTriangle size={13} />
                  Needs attention
                </span>

              </div>

            </div>

            <button className="view-button">
              View
            </button>

          </div>

        </section>

        {/* BEFORE YOU LEAVE */}

        <section className="dashboard-card">

          <div className="card-header">

            <div>
              <small>AI PREDICTION</small>
              <h2>
                Before you leave
              </h2>
            </div>

            <span className="ai-badge">
              ✨ AI
            </span>

          </div>

          <div className="prediction">

            <div className="prediction-title">

              <div>

                <strong>
                  College · Presentation
                </strong>

                <span>
                  Your personalized checklist
                </span>

              </div>

              <Backpack size={20} />

            </div>

            <div className="checklist">

              <CheckItem
                text="Laptop"
                checked
              />

              <CheckItem
                text="Charger"
                checked
              />

              <CheckItem text="ID Card" />

              <CheckItem
                text="Presentation file"
              />

              <CheckItem text="Pen drive" />

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

/* =========================================
   ASSISTANT PAGE
========================================= */

function AssistantPage({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (value: string) => void;
}) {
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState("");

  const sendMemory = async () => {

    if (!message.trim() || sending) {
      return;
    }

    try {

      setSending(true);
      setResponse("");

      const res = await fetch(
        "http://localhost:5000/api/memories",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text: message,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {

        throw new Error(
          data.message ||
          "Failed to save memory"
        );

      }

      setResponse(
        data.message ||
        "Got it! I'll remember that."
      );

      setMessage("");

    } catch (error) {

      console.error(error);

      setResponse(
        "Sorry, I couldn't save that memory. Check whether your backend is running."
      );

    } finally {

      setSending(false);

    }

  };

  const handleExample = (text: string) => {
    setMessage(text);
  };

  return (
    <div className="assistant-page">

      <div className="assistant-center">

        <div className="assistant-orb ai-float ai-pulse">
          <Brain size={38} />
        </div>

        <div className="assistant-label">
          <Sparkles size={14} />
          RECALL AI ASSISTANT
        </div>

        <h1>
          What can I remember
          <span> for you?</span>
        </h1>

        <p>
          Talk naturally. I'll understand your items,
          people, places and plans.
        </p>

        {/* CHAT */}

        <div className="chat-window">

          <div className="chat-message ai-message">

            <div className="mini-ai">
              <Brain size={15} />
            </div>

            <div>

              <strong>Recall</strong>

              <p>
                Hi! I'm your personal memory assistant.
                Tell me what happened, what you lent,
                or where you're going.
              </p>

            </div>

          </div>

          {response && (
            <div className="assistant-response">

              <Sparkles size={16} />

              <span>
                {response}
              </span>

            </div>
          )}

          {/* EXAMPLES */}

          <div className="example-row">

            <button
              onClick={() =>
                handleExample(
                  "What have I lent?"
                )
              }
            >
              🤝 What have I lent?
            </button>

            <button
              onClick={() =>
                handleExample(
                  "What should I take?"
                )
              }
            >
              🎒 What should I take?
            </button>

            <button
              onClick={() =>
                handleExample(
                  "What should I remember?"
                )
              }
            >
              🧠 What should I remember?
            </button>

          </div>

          {/* INPUT */}

          <div className="chat-input">

            <input
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {

                if (e.key === "Enter") {
                  sendMemory();
                }

              }}
              placeholder='Try "I gave my calculator to Priya"...'
            />

            <button className="mic-button">
              <Mic size={18} />
            </button>

            <button
              className="send-button"
              onClick={sendMemory}
              disabled={sending}
            >
              <Send size={18} />
            </button>

          </div>

          {sending && (
            <div className="sending-text">
              Recall is remembering...
            </div>
          )}

        </div>

        {/* CAPABILITIES */}

        <div className="assistant-capabilities">

          <span>🧠 Understand</span>
          <span>🤝 Remember</span>
          <span>🎒 Predict</span>
          <span>🔔 Remind</span>

        </div>

      </div>

    </div>
  );
}

/* =========================================
   STAT
========================================= */

function Stat({
  icon,
  number,
  label,
  color,
}: {
  icon: React.ReactNode;
  number: string;
  label: string;
  color: string;
}) {
  return (
    <div className="stat-card">

      <div className={`stat-icon ${color}`}>
        {icon}
      </div>

      <strong>
        {number}
      </strong>

      <span>
        {label}
      </span>

      <small>
        This week
      </small>

    </div>
  );
}

/* =========================================
   CHECK ITEM
========================================= */

function CheckItem({
  text,
  checked = false,
}: {
  text: string;
  checked?: boolean;
}) {
  return (
    <div className="check-item">

      <div
        className={`check-box ${
          checked ? "checked" : ""
        }`}
      >
        {checked && (
          <Check size={13} />
        )}
      </div>

      <span>
        {text}
      </span>

    </div>
  );
}

/* =========================================
   MEMORIES PAGE
========================================= */

function MemoriesPage() {

  const [memories, setMemories] =
    useState<Memory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =========================================
     FETCH MEMORIES
  ========================================= */

  const fetchMemories = async () => {

    try {

      setLoading(true);
      setError("");

      const res = await fetch(
        "http://localhost:5000/api/memories"
      );

      const data = await res.json();

      if (!res.ok) {

        throw new Error(
          data.message ||
          "Failed to fetch memories"
        );

      }

      setMemories(data);

    } catch (err) {

      console.error(err);

      setError(
        "Could not load memories. Make sure the backend is running."
      );

    } finally {

      setLoading(false);

    }

  };

  /* =========================================
     DELETE MEMORY
  ========================================= */

  const deleteMemory = async (id: string) => {

    try {

      const res = await fetch(
        `http://localhost:5000/api/memories/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {

        throw new Error(
          data.message ||
          "Failed to delete memory"
        );

      }

      // Remove deleted memory immediately
      setMemories(
        (currentMemories) =>
          currentMemories.filter(
            (memory) =>
              memory._id !== id
          )
      );

    } catch (err) {

      console.error(err);

      setError(
        "Could not delete this memory."
      );

    }

  };

  /* =========================================
     LOAD MEMORIES WHEN PAGE OPENS
  ========================================= */

  useEffect(() => {
    fetchMemories();
  }, []);

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="memories-page">

      {/* PAGE HEADING */}

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            YOUR MEMORY VAULT
          </div>

          <h1>
            Your Memories 🧠
          </h1>

          <p>
            Everything Recall remembers for you.
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={fetchMemories}
        >
          ↻ Refresh
        </button>

      </div>

      {/* LOADING */}

      {loading && (
        <div className="memory-status">

          <Sparkles size={20} />

          Recall is loading your memories...

        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="memory-error">

          <AlertTriangle size={20} />

          {error}

        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        memories.length === 0 && (

          <div className="empty-memories">

            <div className="empty-memory-icon">
              <BrainCircuit size={35} />
            </div>

            <h2>
              No memories yet
            </h2>

            <p>
              Tell Recall something you don't
              want to forget.
            </p>

          </div>
        )}

      {/* MEMORY GRID */}

      {!loading &&
        !error &&
        memories.length > 0 && (

          <div className="memory-grid">

            {memories.map((memory) => (

              <div
                className="memory-card"
                key={memory._id}
              >

                {/* CARD TOP */}

                <div className="memory-card-top">

                  <div className="memory-icon">
                    <BrainCircuit size={20} />
                  </div>

                  <span className="memory-label">
                    {memory.category ||
                      "MEMORY"}
                  </span>

                </div>

                {/* MEMORY TEXT */}

                <p className="memory-text">
                  {memory.text}
                </p>

                {/* DATE */}

                {memory.createdAt && (
                  <div className="memory-date">

                    <Clock3 size={13} />

                    {new Date(
                      memory.createdAt
                    ).toLocaleString()}

                  </div>
                )}

                {/* DELETE */}

                <button
                  className="delete-memory-button"
                  onClick={() => {

                    const confirmed =
                      window.confirm(
                        "Delete this memory?"
                      );

                    if (confirmed) {
                      deleteMemory(
                        memory._id
                      );
                    }

                  }}
                >
                  🗑️ Delete
                </button>

              </div>

            ))}

          </div>
        )}

    </div>
  );
}

/* =========================================
   SIMPLE PAGE
========================================= */

function SimplePage({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="simple-page">

      <div className="simple-icon ai-float">
        {icon}
      </div>

      <div className="eyebrow">
        RECALL AI
      </div>

      <h1>
        {title}
      </h1>

      <p>
        {description}
      </p>

      <button className="primary-button">

        <Plus size={16} />

        Add something

      </button>

    </div>
  );
}

export default App;