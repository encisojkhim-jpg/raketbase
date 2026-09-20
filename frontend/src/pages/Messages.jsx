// Messages.jsx — Contract-scoped chat (one conversation per contract).
// A conversation is auto-created server-side the moment a proposal is accepted
// (see backend/src/controllers/proposalsController.js), named after the job
// posting. New messages/files arrive live via Supabase Realtime. Once the
// contract is completed the conversation becomes read-only and either party
// can propose permanently deleting its history — deletion only actually
// happens once BOTH sides have confirmed.
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChatIcon, PaperclipIcon, TrashIcon, DownloadIcon, FileIcon, CloseIcon, SendIcon, ArrowLeftIcon } from '../components/Icons';
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  getAttachmentDownloadUrl,
  confirmDeleteConversation,
  cancelDeleteConversation,
} from '../services/api';
import { useCurrentUser } from '../utils/currentUser';
import { showToast } from '../utils/toast';
import { supabase } from '../config/supabaseClient';

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatClock(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatSidebarTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function personName(person) {
  if (!person) return 'Participant';
  return [person.first_name, person.last_name].filter(Boolean).join(' ') || person.email || 'Participant';
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
  const [text, setText] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const channelRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await getConversations();
      setConversations(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load conversations');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadConversations();
  }, [loadConversations, navigate]);

  // Load the active conversation's messages whenever the URL's :id changes.
  useEffect(() => {
    if (!selectedId) {
      setActive(null);
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoadingMessages(true);
    setError('');
    (async () => {
      try {
        const [msgRes] = await Promise.all([getConversationMessages(selectedId)]);
        if (cancelled) return;
        setMessages(msgRes.data || []);
      } catch (err) {
        if (!cancelled) showToast(err.message || 'Failed to load conversation');
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Keep `active` (the selected conversation's metadata) in sync with the list —
  // simpler than a separate GET, and the list already carries contract status.
  useEffect(() => {
    if (!selectedId) return;
    const found = conversations.find((c) => c.conversation_id === selectedId);
    if (found) setActive(found);
  }, [selectedId, conversations]);

  // Realtime: live message inserts + conversation updates (delete-confirmation
  // flags changing, or the conversation being deleted once both sides confirm).
  useEffect(() => {
    if (!selectedId) return;

    const token = localStorage.getItem('token');
    if (token && supabase.realtime?.setAuth) {
      supabase.realtime.setAuth(token);
    }

    const channel = supabase
      .channel(`conversation-${selectedId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedId}` },
        (payload) => {
          setMessages((prev) => (prev.some((m) => m.message_id === payload.new.message_id) ? prev : [...prev, payload.new]));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `conversation_id=eq.${selectedId}` },
        (payload) => {
          setConversations((prev) => prev.map((c) => (c.conversation_id === selectedId ? { ...c, ...payload.new } : c)));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'conversations', filter: `conversation_id=eq.${selectedId}` },
        () => {
          showToast('This conversation was deleted.');
          setConversations((prev) => prev.filter((c) => c.conversation_id !== selectedId));
          navigate('/messages');
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [selectedId, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const isClient = active ? user.user_id === active.client_id : false;
  const isParticipant = active ? user.user_id === active.client_id || user.user_id === active.freelancer_id : false;
  const other = active ? (isClient ? active.freelancer : active.client) : null;
  const contractStatus = active?.contracts?.status;
  const isCompleted = contractStatus === 'completed';
  const myConfirmed = active ? (isClient ? active.client_delete_confirmed : active.freelancer_delete_confirmed) : false;
  const otherConfirmed = active ? (isClient ? active.freelancer_delete_confirmed : active.client_delete_confirmed) : false;

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() && !pendingFile) return;
    setSending(true);
    setError('');
    try {
      const res = await sendMessage(selectedId, { content: text.trim(), file: pendingFile });
      setMessages((prev) => (prev.some((m) => m.message_id === res.data.message_id) ? prev : [...prev, res.data]));
      setText('');
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadConversations();
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  async function handleDownload(message) {
    try {
      const res = await getAttachmentDownloadUrl(selectedId, message.message_id);
      window.open(res.data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      showToast(err.message || 'Failed to open attachment');
    }
  }

  async function handleConfirmDelete() {
    if (
      !window.confirm(
        'Permanently delete this entire conversation, including all shared files? This cannot be undone once both sides confirm.'
      )
    ) {
      return;
    }
    setDeleteBusy(true);
    try {
      const res = await confirmDeleteConversation(selectedId);
      if (res.data.deleted) {
        showToast('Conversation deleted.');
        setConversations((prev) => prev.filter((c) => c.conversation_id !== selectedId));
        navigate('/messages');
      } else {
        setConversations((prev) =>
          prev.map((c) => (c.conversation_id === selectedId ? { ...c, ...res.data } : c))
        );
        showToast(`Waiting for ${personName(other)} to also confirm deletion.`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to confirm deletion');
    } finally {
      setDeleteBusy(false);
    }
  }

  async function handleCancelDelete() {
    setDeleteBusy(true);
    try {
      const res = await cancelDeleteConversation(selectedId);
      setConversations((prev) => prev.map((c) => (c.conversation_id === selectedId ? { ...c, ...res.data } : c)));
    } catch (err) {
      showToast(err.message || 'Failed to cancel');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg text-text">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <aside
          className={`w-full shrink-0 overflow-y-auto border-r border-border bg-panel/40 md:block md:max-w-sm ${
            selectedId ? 'hidden' : 'block'
          }`}
        >
          <div className="border-b border-border px-5 py-4">
            <h1 className="font-display text-lg font-semibold tracking-tight">Messages</h1>
            <p className="mt-0.5 text-[12px] text-text-secondary">Chats open automatically once a contract starts.</p>
          </div>

          {loadingList ? (
            <p className="px-5 py-8 text-center text-sm text-text-secondary animate-pulse">Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface">
                <ChatIcon className="h-5 w-5 text-text-secondary" />
              </div>
              <p className="font-display text-sm font-medium">No conversations yet</p>
              <p className="mt-1 text-[12px] text-text-secondary">
                When a proposal is accepted, a chat opens here automatically.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {conversations.map((c) => {
                const iAmClient = user.user_id === c.client_id;
                const iAmParticipant = iAmClient || user.user_id === c.freelancer_id;
                const partner = iAmParticipant ? (iAmClient ? c.freelancer : c.client) : null;
                const label = iAmParticipant
                  ? personName(partner)
                  : `${personName(c.client)} ↔ ${personName(c.freelancer)}`;
                const preview = c.last_message
                  ? c.last_message.content || (c.last_message.file_name ? `📎 ${c.last_message.file_name}` : '')
                  : 'No messages yet';
                const isActive = c.conversation_id === selectedId;
                return (
                  <li key={c.conversation_id}>
                    <button
                      onClick={() => navigate(`/messages/${c.conversation_id}`)}
                      className={`flex w-full flex-col items-start gap-0.5 px-5 py-3.5 text-left transition-colors cursor-pointer hover:bg-surface/60 ${
                        isActive ? 'bg-surface' : ''
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-text">{c.title}</span>
                        {c.last_message && (
                          <span className="shrink-0 text-[11px] text-text-secondary">
                            {formatSidebarTime(c.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <span className="truncate text-[12px] text-text-secondary">{label}</span>
                      <span className="truncate text-[12px] text-text-secondary/80">{preview}</span>
                      {c.contracts?.status === 'completed' && (
                        <span className="mt-1 inline-block rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/30">
                          Completed
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Active conversation */}
        <main className={`flex flex-1 flex-col overflow-hidden ${selectedId ? 'flex' : 'hidden md:flex'}`}>
          {!selectedId ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <ChatIcon className="mb-3 h-8 w-8 text-text-secondary" />
              <p className="font-display text-base font-medium">Select a conversation</p>
              <p className="mt-1 max-w-xs text-sm text-text-secondary">
                Pick a chat from the list to see your messages and shared files.
              </p>
            </div>
          ) : !active ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-text-secondary animate-pulse">Loading...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-border bg-panel/60 px-5 py-3.5">
                <button
                  onClick={() => navigate('/messages')}
                  className="text-text-secondary hover:text-text cursor-pointer md:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-[#1A1305]">
                  {(personName(isClient ? active.freelancer : active.client)[0] || '?').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">{active.title}</p>
                  <p className="truncate text-[12px] text-text-secondary">
                    {isParticipant ? personName(other) : `${personName(active.client)} ↔ ${personName(active.freelancer)}`}
                  </p>
                </div>
                {contractStatus && (
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      isCompleted
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : contractStatus === 'submitted'
                        ? 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {contractStatus === 'active' ? 'In Progress' : contractStatus}
                  </span>
                )}
              </div>

              {/* Deletion banner — only once the contract is completed */}
              {isCompleted && isParticipant && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/50 px-5 py-3 text-sm">
                  {myConfirmed && otherConfirmed ? (
                    <span className="text-text-secondary">Deleting...</span>
                  ) : myConfirmed ? (
                    <>
                      <span className="text-text-secondary">
                        You've marked this conversation for deletion. Waiting for {personName(other)} to confirm.
                      </span>
                      <button
                        onClick={handleCancelDelete}
                        disabled={deleteBusy}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text disabled:opacity-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  ) : otherConfirmed ? (
                    <>
                      <span className="text-text-secondary">
                        {personName(other)} wants to permanently delete this conversation and its files.
                      </span>
                      <button
                        onClick={handleConfirmDelete}
                        disabled={deleteBusy}
                        className="flex items-center gap-1.5 rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-400 disabled:opacity-50 cursor-pointer"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Confirm Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-text-secondary">
                        This job is complete. The conversation is read-only.
                      </span>
                      <button
                        onClick={handleConfirmDelete}
                        disabled={deleteBusy}
                        className="flex items-center gap-1.5 rounded-md border border-rose-500/40 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 cursor-pointer"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete Conversation
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Message list */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {loadingMessages ? (
                  <p className="text-center text-sm text-text-secondary animate-pulse">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <p className="text-sm text-text-secondary">
                      No messages yet. Say hello to get things started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m) => {
                      if (m.message_type === 'system') {
                        return (
                          <div key={m.message_id} className="flex justify-center">
                            <p className="max-w-[85%] rounded-full bg-surface px-3.5 py-1.5 text-center text-[12px] text-text-secondary">
                              {m.content}
                            </p>
                          </div>
                        );
                      }
                      const mine = m.sender_id === user.user_id;
                      return (
                        <div key={m.message_id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-lg px-3.5 py-2.5 text-sm ${
                              mine ? 'bg-accent text-[#1A1305]' : 'bg-panel border border-border text-text'
                            }`}
                          >
                            {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}
                            {m.file_path && (
                              <button
                                onClick={() => handleDownload(m)}
                                className={`mt-1.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs cursor-pointer ${
                                  mine ? 'bg-black/10 hover:bg-black/15' : 'bg-surface hover:bg-surface/70 border border-border'
                                }`}
                              >
                                <FileIcon className="h-4 w-4 shrink-0" />
                                <span className="min-w-0 flex-1 truncate font-medium">{m.file_name}</span>
                                <span className="shrink-0 opacity-70">{formatFileSize(m.file_size)}</span>
                                <DownloadIcon className="h-3.5 w-3.5 shrink-0" />
                              </button>
                            )}
                            <p className={`mt-1 text-[10px] ${mine ? 'text-[#1A1305]/70' : 'text-text-secondary'}`}>
                              {formatClock(m.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              {/* Composer */}
              {isParticipant && !isCompleted && (
                <form onSubmit={handleSend} className="border-t border-border bg-panel/60 px-5 py-3.5">
                  {error && <p className="mb-2 text-[12px] text-error">{error}</p>}
                  {pendingFile && (
                    <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs">
                      <FileIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{pendingFile.name}</span>
                      <span className="shrink-0 text-text-secondary">{formatFileSize(pendingFile.size)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPendingFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="shrink-0 text-text-secondary hover:text-text cursor-pointer"
                      >
                        <CloseIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => setPendingFile(e.target.files[0] || null)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-text-secondary hover:text-text hover:border-accent/40 cursor-pointer transition-colors"
                      aria-label="Attach a file"
                    >
                      <PaperclipIcon className="h-4.5 w-4.5" />
                    </button>
                    <textarea
                      rows={1}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 resize-none rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                    <button
                      type="submit"
                      disabled={sending || (!text.trim() && !pendingFile)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-[#1A1305] hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      aria-label="Send message"
                    >
                      <SendIcon className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
