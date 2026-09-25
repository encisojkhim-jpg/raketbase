import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  getAttachmentDownloadUrl,
  confirmDeleteConversation,
  cancelDeleteConversation,
} from "../services/api";
import { useCurrentUser } from "../utils/currentUser";
import { showToast } from "../utils/toast";
import { supabase } from "../config/supabaseClient";

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatClock(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatSidebarTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function personName(person) {
  if (!person) return "Participant";
  return [person.first_name, person.last_name].filter(Boolean).join(" ") || person.email || "Participant";
}

export default function Messages() {
  const navigate = useNavigate();
  const { id: selectedId } = useParams();
  const user = useCurrentUser();

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const channelRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await getConversations();
      setConversations(res.data || []);
    } catch (err) {
      showToast(err.message || "Failed to load conversations");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadConversations();
  }, [loadConversations, navigate]);

  useEffect(() => {
    if (!selectedId) {
      setActive(null);
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoadingMessages(true);
    setError("");
    (async () => {
      try {
        const res = await getConversationMessages(selectedId);
        if (!cancelled) setMessages(res.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load messages");
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const found = conversations.find((c) => c.conversation_id === selectedId);
    if (found) setActive(found);
  }, [selectedId, conversations]);

  useEffect(() => {
    if (!selectedId || !user) return;
    const channel = supabase.channel(`conversation:${selectedId}`);
    channelRef.current = channel;

    channel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` }, (payload) => {
        setMessages((prev) => {
          if (prev.some((m) => m.message_id === payload.new.message_id)) return prev;
          return [...prev, payload.new];
        });
        loadConversations();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations", filter: `conversation_id=eq.${selectedId}` }, (payload) => {
        setConversations((prev) => prev.map((c) => (c.conversation_id === selectedId ? { ...c, ...payload.new } : c)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [selectedId, user, loadConversations]);

  useEffect(() => {
    if (bottomRef.current && !loadingMessages) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !pendingFile) return;
    setSending(true);
    setError("");
    try {
      const res = await sendMessage(selectedId, { content: text.trim(), file: pendingFile });
      setMessages((prev) => (prev.some((m) => m.message_id === res.data.message_id) ? prev : [...prev, res.data]));
      setText("");
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadConversations();
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDownload = async (msg) => {
    if (!msg.file_path) return;
    try {
      const res = await getAttachmentDownloadUrl(selectedId, msg.message_id);
      const link = document.createElement("a");
      link.href = res.data.downloadUrl;
      link.download = msg.file_name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to download file: " + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm("Are you sure you want to permanently delete this conversation?")) return;
    setDeleteBusy(true);
    try {
      await confirmDeleteConversation(selectedId);
      showToast("Deletion confirmed.");
      loadConversations();
    } catch (err) {
      showToast(err.message || "Failed to confirm deletion");
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleCancelDelete = async () => {
    if (!selectedId) return;
    setDeleteBusy(true);
    try {
      await cancelDeleteConversation(selectedId);
      showToast("Deletion cancelled.");
      loadConversations();
    } catch (err) {
      showToast(err.message || "Failed to cancel deletion");
    } finally {
      setDeleteBusy(false);
    }
  };

  const isClient = active?.client_id === user?.user_id;
  const isFreelancer = active?.freelancer_id === user?.user_id;
  const isParticipant = isClient || isFreelancer;
  const other = isClient ? active?.freelancer : active?.client;
  const contractStatus = active?.contracts?.status;
  const isCompleted = contractStatus === "completed";

  const myConfirmed = isClient ? active?.client_deleted : isFreelancer ? active?.freelancer_deleted : false;
  const otherConfirmed = isClient ? active?.freelancer_deleted : isFreelancer ? active?.client_deleted : false;

  return (
    <>


        <div className="page-content-wrapper flex-grow-1 p-0" style={{ overflow: "hidden" }}>
          <div className="row g-0 h-100">
            {/* Conversation List Sidebar */}
            <div className={`col-md-4 col-lg-3 border-end h-100 d-flex flex-column ${selectedId ? "d-none d-md-flex" : ""}`} style={{ backgroundColor: "#f8f9fa" }}>
              <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Messages</h5>
                <span className="badge bg-primary rounded-pill">{conversations.length}</span>
              </div>
              <div className="flex-grow-1 overflow-auto">
                {loadingList ? (
                  <div className="text-center p-4 text-muted small animate-pulse">Loading...</div>
                ) : conversations.length === 0 ? (
                  <div className="text-center p-4 text-muted small">No conversations yet.</div>
                ) : (
                  <div className="d-flex flex-column gap-2 p-3">
                    {conversations.map((c) => {
                      const isActive = c.conversation_id === selectedId;
                      const amClient = c.client_id === user?.user_id;
                      const them = amClient ? c.freelancer : c.client;
                      const label = [them?.first_name, them?.last_name].filter(Boolean).join(" ") || them?.email || "User";
                      
                      return (
                        <button
                          key={c.conversation_id}
                          onClick={() => navigate(`/messages/${c.conversation_id}`)}
                          className={`card card-body text-start shadow-sm transition-all text-decoration-none ${isActive ? "bg-white border-0 z-1" : "bg-light border-light opacity-75"}`}
                          style={isActive ? { borderLeft: "4px solid #FF5A1E" } : { borderLeft: "4px solid transparent" }}
                        >
                          <div className="d-flex w-100 justify-content-between align-items-start mb-1">
                            <h6 className="mb-0 fw-bold text-truncate" style={{ fontSize: "14px" }}>{c.title}</h6>
                            {c.last_message_at && (
                              <small className="text-muted ms-2" style={{ fontSize: "11px", flexShrink: 0 }}>
                                {formatSidebarTime(c.last_message_at)}
                              </small>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <img src={them?.avatar_url || "https://ui-avatars.com/api/?name=User&background=random"} className="rounded-circle" style={{ width: "24px", height: "24px", objectFit: "cover" }} />
                            <small className="text-muted text-truncate" style={{ fontSize: "12px" }}>{label}</small>
                          </div>
                          {c.contracts?.status === "completed" && (
                            <div className="mt-2">
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill" style={{ fontSize: "10px" }}>Completed</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`col-md-8 col-lg-9 h-100 d-flex flex-column ${!selectedId ? "d-none d-md-flex" : ""}`}>
              {!selectedId ? (
                <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-muted bg-white">
                  <i className="bi bi-chat-text" style={{ fontSize: "3rem", opacity: 0.5 }}></i>
                  <h4 className="mt-3 fw-light">Select a conversation</h4>
                  <p className="small">Pick a chat from the list to see your messages.</p>
                </div>
              ) : !active ? (
                <div className="flex-grow-1 d-flex justify-content-center align-items-center text-muted">
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Loading chat...
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-3 border-bottom bg-white d-flex align-items-center justify-content-between shadow-sm" style={{ zIndex: 10 }}>
                    <div className="d-flex align-items-center gap-3">
                      <button onClick={() => navigate("/messages")} className="btn btn-sm btn-light d-md-none rounded-circle">
                        <i className="bi bi-arrow-left"></i>
                      </button>
                      <div className="d-flex flex-column">
                        <h5 className="mb-0 fw-bold">{active.title}</h5>
                        <small className="text-muted">
                          {isParticipant ? personName(other) : `${personName(active.client)} & ${personName(active.freelancer)}`}
                        </small>
                      </div>
                    </div>
                    {contractStatus && (
                      <span className={`badge rounded-pill px-3 py-2 ${
                        isCompleted ? "bg-success bg-opacity-10 text-success border border-success border-opacity-25" :
                        contractStatus === "submitted" ? "bg-info bg-opacity-10 text-info border border-info border-opacity-25" :
                        "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25"
                      }`}>
                        {contractStatus === "active" ? "In Progress" : contractStatus}
                      </span>
                    )}
                  </div>

                  {/* Deletion Banner */}
                  {isCompleted && isParticipant && (
                    <div className="bg-light border-bottom p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                      {myConfirmed && otherConfirmed ? (
                        <span className="text-muted small">Deleting...</span>
                      ) : myConfirmed ? (
                        <>
                          <span className="text-muted small">
                            You marked this conversation for deletion. Waiting for {personName(other)} to confirm.
                          </span>
                          <button onClick={handleCancelDelete} disabled={deleteBusy} className="btn btn-sm btn-outline-secondary rounded-pill">
                            Cancel
                          </button>
                        </>
                      ) : otherConfirmed ? (
                        <>
                          <span className="text-muted small">
                            {personName(other)} wants to permanently delete this conversation.
                          </span>
                          <button onClick={handleConfirmDelete} disabled={deleteBusy} className="btn btn-sm btn-danger rounded-pill fw-medium d-flex align-items-center gap-1">
                            <i className="bi bi-trash"></i> Confirm Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-muted small">
                            This job is complete. The conversation is read-only.
                          </span>
                          <button onClick={handleConfirmDelete} disabled={deleteBusy} className="btn btn-sm btn-outline-danger rounded-pill fw-medium d-flex align-items-center gap-1">
                            <i className="bi bi-trash"></i> Delete Conversation
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Messages Area */}
                  <div className="flex-grow-1 p-4 overflow-auto" style={{ backgroundColor: "#fff" }}>
                    {loadingMessages ? (
                      <div className="text-center p-4 text-muted small">Loading messages...</div>
                    ) : messages.length === 0 ? (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                        <p>No messages yet. Say hello to get things started.</p>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {messages.map((m) => {
                          if (m.message_type === "system") {
                            return (
                              <div key={m.message_id} className="text-center my-2">
                                <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-normal" style={{ fontSize: "12px" }}>
                                  {m.content}
                                </span>
                              </div>
                            );
                          }
                          const mine = m.sender_id === user?.user_id;
                          return (
                            <div key={m.message_id} className={`d-flex ${mine ? "justify-content-end" : "justify-content-start"}`}>
                              <div className={`p-3 rounded-3 shadow-sm ${mine ? "bg-dark text-white" : "bg-light border"}`} style={{ maxWidth: "75%", borderBottomRightRadius: mine ? "4px" : "16px", borderBottomLeftRadius: !mine ? "4px" : "16px" }}>
                                {m.content && <p className="mb-1 text-break" style={{ whiteSpace: "pre-wrap", fontSize: "14px" }}>{m.content}</p>}
                                {m.file_path && (
                                  <button
                                    onClick={() => handleDownload(m)}
                                    className={`btn btn-sm mt-2 d-flex align-items-center gap-2 text-start w-100 ${mine ? "btn-outline-light text-white border-secondary" : "btn-outline-secondary bg-white"}`}
                                  >
                                    <i className="bi bi-file-earmark"></i>
                                    <span className="text-truncate flex-grow-1" style={{ maxWidth: "150px" }}>{m.file_name}</span>
                                    <span className="small opacity-75">{formatFileSize(m.file_size)}</span>
                                    <i className="bi bi-download ms-auto"></i>
                                  </button>
                                )}
                                <div className={`text-end mt-1 ${mine ? "text-white-50" : "text-muted"}`} style={{ fontSize: "10px" }}>
                                  {formatClock(m.created_at)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={bottomRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Composer */}
                  {isParticipant && !isCompleted && (
                    <div className="p-3 bg-white border-top shadow-sm">
                      {error && <div className="text-danger small mb-2">{error}</div>}
                      {pendingFile && (
                        <div className="d-flex align-items-center gap-2 bg-light border rounded p-2 mb-2 small">
                          <i className="bi bi-file-earmark text-primary"></i>
                          <span className="text-truncate flex-grow-1 fw-medium">{pendingFile.name}</span>
                          <span className="text-muted">{formatFileSize(pendingFile.size)}</span>
                          <button type="button" className="btn-close ms-auto" style={{ fontSize: "0.75rem" }} onClick={() => { setPendingFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}></button>
                        </div>
                      )}
                      <form onSubmit={handleSend} className="d-flex align-items-end gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="d-none"
                          onChange={(e) => setPendingFile(e.target.files[0] || null)}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn btn-light border rounded-circle flex-shrink-0 d-flex justify-content-center align-items-center"
                          style={{ width: "42px", height: "42px" }}
                        >
                          <i className="bi bi-paperclip fs-5 text-secondary"></i>
                        </button>
                        <textarea
                          rows="1"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSend(e);
                            }
                          }}
                          placeholder="Type your message..."
                          className="form-control"
                          style={{ resize: "none", overflow: "hidden", minHeight: "42px", borderRadius: "20px", padding: "10px 20px" }}
                        />
                        <button
                          type="submit"
                          disabled={sending || (!text.trim() && !pendingFile)}
                          className="btn btn-dark rounded-circle flex-shrink-0 d-flex justify-content-center align-items-center"
                          style={{ width: "42px", height: "42px" }}
                        >
                          <i className="bi bi-send-fill text-white"></i>
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      
    </>
  );
}
