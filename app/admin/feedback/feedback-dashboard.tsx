"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { firebaseAuth, firebaseStorage, firestore } from "@/lib/firebase-client";
import {
  Bell,
  Bug,
  ChevronDown,
  CircleHelp,
  Ellipsis,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  MessageCircle,
  Moon,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Sun,
  ThumbsUp,
  Users,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

type Status = "Submitted" | "Reviewing" | "Planned" | "In Progress" | "Shipped";
type Category = "Feature Idea" | "Bug & Problem" | "Content & Personalization" | "General Feedback";

type FeedbackPost = {
  id: string;
  title: string;
  body: string;
  author: string;
  initials: string;
  time: string;
  category: Category;
  status: Status;
  supports: number;
  comments: number;
  hasPhotos?: boolean;
  version?: string;
  mediaURLs: string[];
  mediaPaths: string[];
};

type FeedbackComment = {
  id: string;
  body: string;
  author: string;
  initials: string;
  time: string;
  isOfficial: boolean;
};

const statuses: Status[] = ["Submitted", "Reviewing", "Planned", "In Progress", "Shipped"];

const statusStyle: Record<Status, string> = {
  Submitted: "bg-slate-100 text-slate-600",
  Reviewing: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Planned: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  "In Progress": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Shipped: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const categoryIcon = {
  "Feature Idea": Lightbulb,
  "Bug & Problem": Bug,
  "Content & Personalization": Sparkles,
  "General Feedback": MessageCircle,
};

export function FeedbackDashboard() {
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [dataError, setDataError] = useState("");
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All feedback");
  const [selectedId, setSelectedId] = useState("");
  const [statusMenu, setStatusMenu] = useState(false);
  const [actionsMenu, setActionsMenu] = useState(false);
  const [editing, setEditing] = useState<FeedbackPost | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [officialReply, setOfficialReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("feedback-hub-theme");
    setDarkTheme(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => onAuthStateChanged(firebaseAuth, async (nextUser) => {
    setUser(nextUser);
    setAuthReady(true);
    if (!nextUser) {
      setIsAdmin(false);
      setPosts([]);
      return;
    }
    const token = await nextUser.getIdTokenResult(true);
    setIsAdmin(token.claims.admin === true);
  }), []);

  useEffect(() => {
    if (!user) return;
    setLoadingPosts(true);
    setDataError("");
    const postsQuery = firestoreQuery(collection(firestore, "communityPosts"), orderBy("createdAt", "desc"), limit(100));
    return onSnapshot(postsQuery, (snapshot) => {
      const livePosts = snapshot.docs.map((snapshotDoc): FeedbackPost => {
        const value = snapshotDoc.data();
        const author = typeof value.authorName === "string" ? value.authorName : "Swimmer";
        const mediaURLs = Array.isArray(value.mediaURLs) ? value.mediaURLs : value.mediaURL ? [value.mediaURL] : [];
        const mediaPaths = Array.isArray(value.mediaPaths) ? value.mediaPaths : value.mediaPath ? [value.mediaPath] : [];
        const createdAt = value.createdAt?.toDate?.() as Date | undefined;
        return {
          id: snapshotDoc.id,
          title: value.title ?? "Untitled feedback",
          body: value.body ?? "",
          author,
          initials: author.split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase() || "KS",
          time: createdAt ? relativeTime(createdAt) : "Just now",
          category: normalizeCategory(value.category),
          status: normalizeStatus(value.status),
          supports: Array.isArray(value.supporterIDs) ? value.supporterIDs.length : 0,
          comments: typeof value.commentCount === "number" ? value.commentCount : 0,
          hasPhotos: mediaURLs.length > 0,
          version: typeof value.appVersion === "string" ? value.appVersion : undefined,
          mediaURLs,
          mediaPaths,
        };
      });
      setPosts(livePosts);
      setSelectedId((current) => livePosts.some((post) => post.id === current) ? current : (livePosts[0]?.id ?? ""));
      setLoadingPosts(false);
    }, (error) => {
      setDataError(error.message);
      setLoadingPosts(false);
    });
  }, [user]);

  const postIdsKey = useMemo(() => posts.map((post) => post.id).join("|"), [posts]);

  useEffect(() => {
    if (!user || !postIdsKey) return;
    const unsubscribers = postIdsKey.split("|").map((postId) => onSnapshot(
      collection(firestore, "communityPosts", postId, "comments"),
      (snapshot) => setPosts((current) => current.map((post) => post.id === postId ? { ...post, comments: snapshot.size } : post)),
      (error) => setDataError(error.message),
    ));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [postIdsKey, user]);

  useEffect(() => {
    if (!user || !selectedId) {
      setComments([]);
      return;
    }
    setLoadingComments(true);
    const commentsQuery = firestoreQuery(
      collection(firestore, "communityPosts", selectedId, "comments"),
      orderBy("createdAt", "asc"),
      limit(200),
    );
    return onSnapshot(commentsQuery, (snapshot) => {
      const liveComments = snapshot.docs.map((snapshotDoc): FeedbackComment => {
        const value = snapshotDoc.data();
        const author = typeof value.authorName === "string" ? value.authorName : "Swimmer";
        const createdAt = value.createdAt?.toDate?.() as Date | undefined;
        return {
          id: snapshotDoc.id,
          body: typeof value.body === "string" ? value.body : "",
          author,
          initials: author.split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase() || "KS",
          time: createdAt ? relativeTime(createdAt) : "Just now",
          isOfficial: value.isOfficial === true,
        };
      });
      setComments(liveComments);
      setPosts((current) => current.map((post) => post.id === selectedId ? { ...post, comments: liveComments.length } : post));
      setLoadingComments(false);
    }, (error) => {
      setDataError(error.message);
      setLoadingComments(false);
    });
  }, [selectedId, user]);

  const filteredPosts = useMemo(() => {
    const clean = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesQuery = !clean || `${post.title} ${post.body} ${post.author}`.toLowerCase().includes(clean);
      const matchesFilter = activeFilter === "All feedback" || post.category === activeFilter || post.status === activeFilter;
      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, posts, query]);

  const selected = posts.find((post) => post.id === selectedId) ?? filteredPosts[0] ?? posts[0];

  async function recordAction(action: string, postID: string) {
    if (!user) return;
    await addDoc(collection(firestore, "communityAdminAudit"), { actorID: user.uid, action, postID, createdAt: serverTimestamp() });
  }

  async function updateStatus(status: Status) {
    if (!selected || !isAdmin) return;
    try {
      await updateDoc(doc(firestore, "communityPosts", selected.id), { status, updatedAt: serverTimestamp() });
      await recordAction("update_status", selected.id);
      setStatusMenu(false);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "The status could not be updated.");
    }
  }

  function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    if (!isAdmin) return;
    void updateDoc(doc(firestore, "communityPosts", editing.id), {
      title: editing.title.trim(),
      body: editing.body.trim(),
      category: editing.category,
      updatedAt: serverTimestamp(),
    }).then(() => recordAction("update_post", editing.id)).then(() => setEditing(null)).catch((error) => setDataError(error.message));
  }

  async function deleteSelected() {
    if (!selected || !isAdmin) return;
    try {
      await deleteDoc(doc(firestore, "communityPosts", selected.id));
      await recordAction("delete_post", selected.id);
      await Promise.all(selected.mediaPaths.map((path) => deleteObject(ref(firebaseStorage, path)).catch(() => undefined)));
      setConfirmDelete(false);
      setActionsMenu(false);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "The post could not be deleted.");
    }
  }

  async function signIn(provider: "apple" | "google") {
    setDataError("");
    try {
      const authProvider = provider === "apple" ? new OAuthProvider("apple.com") : new GoogleAuthProvider();
      if (provider === "apple") authProvider.addScope("email");
      await signInWithPopup(firebaseAuth, authProvider);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Sign-in could not be completed.");
    }
  }

  function toggleTheme() {
    setDarkTheme((current) => {
      const next = !current;
      window.localStorage.setItem("feedback-hub-theme", next ? "dark" : "light");
      return next;
    });
  }

  async function sendOfficialReply() {
    const body = officialReply.trim();
    if (!selected || !user || !isAdmin || !body || sendingReply) return;
    setSendingReply(true);
    setDataError("");
    try {
      await addDoc(collection(firestore, "communityPosts", selected.id, "comments"), {
        body: body.slice(0, 1000),
        authorID: user.uid,
        authorName: "Keep Swimmin’ Team",
        createdAt: serverTimestamp(),
        isOfficial: true,
      });
      await recordAction("official_response", selected.id);
      setOfficialReply("");
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "The response could not be posted.");
    } finally {
      setSendingReply(false);
    }
  }

  if (!authReady) return <PortalMessage title="Opening Feedback Hub…" body="Checking your secure admin session." />;
  if (!user) return <SignInScreen error={dataError} onSignIn={signIn} />;
  if (!isAdmin) return <PortalMessage title="Admin access required" body={`You’re signed in as ${user.email ?? "this account"}, but this account does not have the Firebase admin permission.`} action={<button onClick={() => signOut(firebaseAuth)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold">Use another account</button>} />;
  if (loadingPosts && posts.length === 0) return <PortalMessage title="Loading real feedback…" body="Connecting to the live Keep Swimmin’ community feed." />;
  if (!selected && !loadingPosts) return <PortalMessage title="No feedback yet" body="New posts from the app will appear here automatically." action={<button onClick={() => signOut(firebaseAuth)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold">Sign out</button>} />;

  return (
    <main className={`feedback-admin fixed inset-0 z-50 flex overflow-hidden bg-[#f7f9fc] text-slate-900 ${darkTheme ? "dark-mode" : ""}`}>
      <aside className="flex w-[248px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-5">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5285f7] text-lg font-black text-white shadow-lg shadow-blue-200">K</div>
          <div><p className="text-[15px] font-bold">Keep Swimmin&apos;</p><p className="text-xs text-slate-400">Admin portal</p></div>
        </div>

        <nav className="mt-8 space-y-1 text-sm font-medium">
          <NavItem icon={LayoutDashboard} label="Overview" />
          <NavItem icon={Inbox} label="Feedback" active count={posts.filter((post) => post.status === "Submitted").length} />
          <NavItem icon={Users} label="Community" />
        </nav>

        <p className="mb-2 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Manage</p>
        <nav className="space-y-1 text-sm font-medium">
          <NavItem icon={MessageCircle} label="Responses" />
          <NavItem icon={SlidersHorizontal} label="Saved views" />
        </nav>

          <div className="mt-auto space-y-1 border-t border-slate-100 pt-4 text-sm font-medium">
          <NavItem icon={CircleHelp} label="Help & support" />
          <NavItem icon={Settings} label="Settings" />
          <button onClick={() => signOut(firebaseAuth)} className="mt-4 flex w-full items-center gap-3 rounded-xl bg-slate-50 p-2.5 text-left hover:bg-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{(user.displayName ?? user.email ?? "A").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user.displayName ?? user.email ?? "Administrator"}</p><p className="truncate text-[11px] text-slate-400">Administrator · Sign out</p></div>
            <Ellipsis className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-7">
          <div><div className="flex items-center gap-2"><h1 className="text-lg font-bold">Feedback Hub</h1><span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-[#5285f7]">BETA</span></div><p className="text-xs text-slate-400">Listen, respond, and shape what comes next.</p></div>
          <div className="flex items-center gap-2"><button onClick={toggleTheme} aria-label={darkTheme ? "Use light theme" : "Use dark theme"} title={darkTheme ? "Use light theme" : "Use dark theme"} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500">{darkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button><button aria-label="Notifications" className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#5285f7] ring-2 ring-white" /></button><button className="rounded-xl bg-[#5285f7] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-200">Export feedback</button></div>
        </header>

        <div className="grid grid-cols-[minmax(430px,1fr)_390px] overflow-hidden">
          <section className="flex min-w-0 flex-col overflow-hidden border-r border-slate-200/80">
            <div className="border-b border-slate-200/80 bg-white px-6 py-5">
              <div className="grid grid-cols-4 gap-3">
                <Metric label="Total feedback" value={posts.length.toString()} detail="All time" />
                <Metric label="Needs review" value={posts.filter((p) => p.status === "Submitted").length.toString()} detail="New arrivals" accent />
                <Metric label="In progress" value={posts.filter((p) => p.status === "In Progress").length.toString()} detail="Active work" />
                <Metric label="Shipped" value={posts.filter((p) => p.status === "Shipped").length.toString()} detail="Closed loop" />
              </div>
              <div className="mt-5 flex items-center gap-3">
                <label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search feedback, people, or keywords…" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50" /></label>
                <select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium outline-none"><option>All feedback</option><option>Feature Idea</option><option>Bug & Problem</option><option>Content & Personalization</option><option>General Feedback</option><option>Submitted</option><option>Reviewing</option><option>Planned</option><option>In Progress</option><option>Shipped</option></select>
              </div>
            </div>

            {dataError && <div className="border-b border-rose-100 bg-rose-50 px-6 py-2.5 text-[11px] font-medium text-rose-700">{dataError}</div>}
            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-3 text-[11px] text-slate-400"><span>{filteredPosts.length} live conversations</span><button className="flex items-center gap-1 font-semibold text-slate-600">Newest first <ChevronDown className="h-3.5 w-3.5" /></button></div>
            <div className="overflow-y-auto">
              {filteredPosts.map((post) => <PostRow key={post.id} post={post} active={selected.id === post.id} onClick={() => setSelectedId(post.id)} />)}
              {filteredPosts.length === 0 && <div className="grid h-64 place-items-center text-sm text-slate-400">No feedback matches this view.</div>}
            </div>
          </section>

          <aside className="overflow-y-auto bg-white">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Conversation</p><h2 className="mt-2 text-xl font-bold leading-tight">{selected.title}</h2></div><div className="relative"><button onClick={() => setActionsMenu((open) => !open)} aria-label="More actions" className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50"><Ellipsis className="h-4 w-4" /></button>{actionsMenu && <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button onClick={() => { setEditing(selected); setActionsMenu(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium hover:bg-slate-50"><Pencil className="h-3.5 w-3.5" />Edit post</button><button onClick={() => setConfirmDelete(true)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" />Delete post</button></div>}</div></div>
              <div className="mt-4 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-[11px] font-bold text-blue-700">{selected.initials}</div><div><p className="text-xs font-semibold">{selected.author}</p><p className="text-[11px] text-slate-400">{selected.time} · {selected.version}</p></div></div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-slate-600">{selected.body}</p>
              {selected.mediaURLs.length > 0 && <div className="mt-4 grid grid-cols-2 gap-2">{selected.mediaURLs.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className={`group relative overflow-hidden rounded-xl bg-blue-50 ${selected.mediaURLs.length === 1 ? "col-span-2" : ""}`}><img src={url} alt={`Attachment ${index + 1}`} className="h-36 w-full object-contain transition group-hover:scale-[1.02]" /><span className="absolute bottom-2 right-2 rounded-lg bg-slate-950/65 px-2 py-1 text-[9px] font-semibold text-white"><ImageIcon className="mr-1 inline h-3 w-3" />Open</span></a>)}</div>}
              <div className="mt-5 flex items-center gap-4 border-y border-slate-100 py-3 text-xs font-semibold text-slate-500"><span className="flex items-center gap-1.5"><ThumbsUp className="h-4 w-4 text-[#5285f7]" />{selected.supports} supports</span><span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{selected.comments} comments</span></div>

              <div className="mt-6">
                <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Comments</p><span className="text-[10px] font-semibold text-slate-400">{comments.length}</span></div>
                <div className="mt-3 space-y-3">
                  {loadingComments && <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-400">Loading conversation…</div>}
                  {!loadingComments && comments.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">No comments on this post yet.</div>}
                  {comments.map((comment) => <div key={comment.id} className={`rounded-2xl p-3.5 ${comment.isOfficial ? "bg-blue-50 ring-1 ring-blue-100" : "bg-slate-50"}`}><div className="flex items-center gap-2.5"><div className={`flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold ${comment.isOfficial ? "bg-[#5285f7] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{comment.initials}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-[11px] font-bold text-slate-700">{comment.author}</p>{comment.isOfficial && <span className="rounded-full bg-white px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-[#5285f7]">Official</span>}</div><p className="text-[9px] text-slate-400">{comment.time}</p></div></div><p className="mt-2.5 text-xs leading-5 text-slate-600">{comment.body}</p></div>)}
                </div>
              </div>

              <div className="mt-6"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Status</p><div className="relative mt-2"><button onClick={() => setStatusMenu((open) => !open)} className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold ${statusStyle[selected.status]}`}><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-current opacity-70" />{selected.status}</span><ChevronDown className="h-4 w-4" /></button>{statusMenu && <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">{statuses.map((status) => <button key={status} onClick={() => updateStatus(status)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium hover:bg-slate-50"><span className={`h-2 w-2 rounded-full ${status === "Shipped" ? "bg-emerald-500" : status === "In Progress" ? "bg-blue-500" : status === "Planned" ? "bg-violet-500" : status === "Reviewing" ? "bg-amber-500" : "bg-slate-400"}`} />{status}</button>)}</div>}</div></div>

              <div className="mt-6"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Internal note</p><textarea onChange={() => setSavedNote(false)} placeholder="Add a private note for yourself…" className="mt-2 h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-blue-300 focus:bg-white" /><button onClick={() => setSavedNote(true)} className="mt-2 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">{savedNote ? "Note saved" : "Save note"}</button></div>

              <div className="mt-6 rounded-2xl bg-[#f4f7ff] p-4"><div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Sparkles className="h-4 w-4 text-[#5285f7]" />Official response</div><p className="mt-1.5 text-[11px] leading-5 text-slate-500">Reply as the Keep Swimmin’ Team. Users will see it immediately in the app.</p><textarea value={officialReply} onChange={(event) => setOfficialReply(event.target.value)} maxLength={1000} placeholder="Write an update or response…" className="mt-3 h-24 w-full resize-none rounded-xl border border-blue-100 bg-white p-3 text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50" /><div className="mt-2 flex items-center justify-between"><span className="text-[9px] text-slate-400">{officialReply.length}/1000</span><button onClick={sendOfficialReply} disabled={!officialReply.trim() || sendingReply} className="rounded-xl bg-[#5285f7] px-4 py-2.5 text-xs font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40">{sendingReply ? "Posting…" : "Post official response"}</button></div></div>
            </div>
          </aside>
        </div>
      </section>

      {editing && <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/30 p-6 backdrop-blur-sm"><form onSubmit={saveEdit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5285f7]">Admin access</p><h2 className="mt-1 text-xl font-bold">Edit feedback post</h2></div><button type="button" onClick={() => setEditing(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><label className="mt-6 block text-xs font-semibold text-slate-600">Title<input required maxLength={100} value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></label><label className="mt-4 block text-xs font-semibold text-slate-600">Description<textarea required maxLength={2000} value={editing.body} onChange={(event) => setEditing({ ...editing, body: event.target.value })} className="mt-2 h-32 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></label><label className="mt-4 block text-xs font-semibold text-slate-600">Category<select value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value as Category })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"><option>Feature Idea</option><option>Bug & Problem</option><option>Content & Personalization</option><option>General Feedback</option></select></label><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50">Cancel</button><button className="rounded-xl bg-[#5285f7] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-200">Save changes</button></div></form></div>}

      {confirmDelete && <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/30 p-6 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><Trash2 className="h-5 w-5" /></div><h2 className="mt-4 text-lg font-bold">Delete this post?</h2><p className="mt-2 text-xs leading-5 text-slate-500">This removes the feedback and its conversation from the hub. This action can’t be undone.</p><div className="mt-6 grid grid-cols-2 gap-2"><button onClick={() => setConfirmDelete(false)} className="rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600">Keep post</button><button onClick={deleteSelected} className="rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white">Delete post</button></div></div></div>}
    </main>
  );
}

function NavItem({ icon: Icon, label, active, count }: { icon: typeof Inbox; label: string; active?: boolean; count?: number }) {
  return <button className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${active ? "bg-blue-50 font-semibold text-[#4777df]" : "text-slate-500 hover:bg-slate-50"}`}><Icon className="h-4 w-4" /><span className="flex-1">{label}</span>{count !== undefined && <span className="rounded-full bg-[#5285f7] px-2 py-0.5 text-[10px] font-bold text-white">{count}</span>}</button>;
}

function Metric({ label, value, detail, accent }: { label: string; value: string; detail: string; accent?: boolean }) {
  return <div className={`rounded-2xl border p-3.5 ${accent ? "border-blue-100 bg-blue-50/70" : "border-slate-200 bg-white"}`}><p className="text-[10px] font-semibold text-slate-400">{label}</p><div className="mt-1 flex items-end justify-between"><p className="text-xl font-bold">{value}</p><p className={`text-[9px] ${accent ? "text-blue-500" : "text-slate-400"}`}>{detail}</p></div></div>;
}

function PostRow({ post, active, onClick }: { post: FeedbackPost; active: boolean; onClick: () => void }) {
  const Icon = categoryIcon[post.category];
  return <button onClick={onClick} className={`relative flex w-full gap-4 border-b border-slate-100 px-6 py-4 text-left transition ${active ? "bg-blue-50/60" : "bg-white hover:bg-slate-50/70"}`}>{active && <span className="absolute inset-y-0 left-0 w-1 bg-[#5285f7]" />}<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h3 className="truncate text-[13px] font-semibold text-slate-800">{post.title}</h3><span className="shrink-0 text-[10px] text-slate-400">{post.time}</span></div><p className="mt-1 line-clamp-1 text-[11px] leading-5 text-slate-500">{post.body}</p><div className="mt-2.5 flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${statusStyle[post.status]}`}>{post.status}</span><span className="text-[10px] text-slate-400">{post.category}</span><span className="ml-auto flex items-center gap-2.5 text-[10px] text-slate-400"><span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{post.supports}</span><span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.comments}</span></span></div></div></button>;
}

function PortalMessage({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return <main className="fixed inset-0 z-50 grid place-items-center bg-[#f7f9fc] p-6 text-slate-900"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5285f7] text-lg font-black text-white">K</div><h1 className="mt-5 text-xl font-bold">{title}</h1><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{body}</p>{action && <div className="mt-5">{action}</div>}</div></main>;
}

function SignInScreen({ error, onSignIn }: { error: string; onSignIn: (provider: "apple" | "google") => Promise<void> }) {
  return <main className="fixed inset-0 z-50 grid place-items-center bg-[#f7f9fc] p-6 text-slate-900"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5285f7] text-lg font-black text-white">K</div><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5285f7]">Private admin portal</p><h1 className="mt-2 text-2xl font-bold">Welcome to Feedback Hub</h1><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Sign in with the same account you use for Keep Swimmin’ to view the live community feed.</p><div className="mt-6 space-y-2"><button onClick={() => onSignIn("apple")} className="w-full rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white">Continue with Apple</button><button onClick={() => onSignIn("google")} className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Continue with Google</button></div>{error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-left text-xs leading-5 text-rose-700">{error}</p>}</div></main>;
}

function normalizeCategory(value: unknown): Category {
  if (value === "Feature Idea" || value === "Bug & Problem" || value === "Content & Personalization") return value;
  if (value === "Quotes & Themes") return "Content & Personalization";
  return "General Feedback";
}

function normalizeStatus(value: unknown): Status {
  if (value === "Reviewing" || value === "Planned" || value === "In Progress" || value === "Shipped") return value;
  return "Submitted";
}

function relativeTime(date: Date) {
  const seconds = Math.max(1, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  const days = Math.floor(seconds / 86400);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}
