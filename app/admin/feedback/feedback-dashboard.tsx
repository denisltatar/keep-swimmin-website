"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
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
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Columns3,
  GripVertical,
  Ellipsis,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  List,
  LogOut,
  MessageCircle,
  Moon,
  Search,
  Settings,
  Shield,
  ShieldCheck,
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
type DashboardView = "list" | "board";

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
  hasOfficialReply: boolean;
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
const categories: Category[] = ["Feature Idea", "Bug & Problem", "Content & Personalization", "General Feedback"];

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
  const [dashboardView, setDashboardView] = useState<DashboardView>("list");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All feedback");
  const [selectedId, setSelectedId] = useState("");
  const [boardSelectedId, setBoardSelectedId] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [statusMenu, setStatusMenu] = useState(false);
  const [actionsMenu, setActionsMenu] = useState(false);
  const [editing, setEditing] = useState<FeedbackPost | null>(null);
  const [editingComment, setEditingComment] = useState<FeedbackComment | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteComment, setConfirmDeleteComment] = useState<FeedbackComment | null>(null);
  const [mediaViewer, setMediaViewer] = useState<{ urls: string[]; index: number } | null>(null);
  const [darkTheme, setDarkTheme] = useState(false);
  const [officialReply, setOfficialReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("feedback-hub-theme");
    setDarkTheme(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDashboardView(window.localStorage.getItem("feedback-hub-view") === "board" ? "board" : "list");
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
          hasOfficialReply: false,
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
      (snapshot) => setPosts((current) => current.map((post) => post.id === postId ? { ...post, comments: snapshot.size, hasOfficialReply: snapshot.docs.some((commentDoc) => commentDoc.data().isOfficial === true) } : post)),
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

  async function updateStatus(status: Status, postId = selected?.id) {
    if (!postId || !isAdmin) return;
    try {
      await updateDoc(doc(firestore, "communityPosts", postId), { status, updatedAt: serverTimestamp() });
      await recordAction("update_status", postId);
      setStatusMenu(false);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "The status could not be updated.");
    }
  }

  async function updateCategory(category: Category, postId = selected?.id) {
    if (!postId || !isAdmin || !adminMode) return;
    try {
      await updateDoc(doc(firestore, "communityPosts", postId), { category, updatedAt: serverTimestamp() });
      await recordAction("update_category", postId);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "The ticket type could not be updated.");
    }
  }

  function openMedia(urls: string[], index = 0) {
    setMediaViewer({ urls, index });
  }

  function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    if (!isAdmin || !adminMode) return;
    void updateDoc(doc(firestore, "communityPosts", editing.id), {
      title: editing.title.trim(),
      body: editing.body.trim(),
      category: editing.category,
      updatedAt: serverTimestamp(),
    }).then(() => recordAction("update_post", editing.id)).then(() => setEditing(null)).catch((error) => setDataError(error.message));
  }

  async function deleteSelected() {
    if (!selected || !isAdmin || !adminMode) return;
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

  async function saveCommentEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !editingComment || !adminMode || !isAdmin) return;
    const body = editingComment.body.trim();
    if (!body) return;
    try {
      await updateDoc(doc(firestore, "communityPosts", selected.id, "comments", editingComment.id), {
        body: body.slice(0, 1000),
        updatedAt: serverTimestamp(),
      });
      await recordAction("update_comment", selected.id);
      setEditingComment(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "The comment could not be updated.");
    }
  }

  async function deleteComment() {
    if (!selected || !confirmDeleteComment || !adminMode || !isAdmin) return;
    try {
      await deleteDoc(doc(firestore, "communityPosts", selected.id, "comments", confirmDeleteComment.id));
      await recordAction("delete_comment", selected.id);
      setConfirmDeleteComment(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "The comment could not be deleted.");
    }
  }

  async function signIn() {
    setDataError("");
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
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

  function changeView(view: DashboardView) {
    setDashboardView(view);
    window.localStorage.setItem("feedback-hub-view", view);
  }

  async function sendOfficialReply() {
    const body = officialReply.trim();
    if (!selected || !user || !isAdmin || !adminMode || !body || sendingReply) return;
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
          <NavItem icon={LayoutDashboard} label="Overview" disabled />
          <NavItem icon={Inbox} label="Feedback" active count={posts.filter((post) => post.status === "Submitted").length} />
          <NavItem icon={Users} label="Community" disabled />
        </nav>

        <p className="mb-2 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Manage</p>
        <nav className="space-y-1 text-sm font-medium">
          <NavItem icon={MessageCircle} label="Responses" disabled />
          <NavItem icon={SlidersHorizontal} label="Saved views" disabled />
        </nav>

          <div className="mt-auto space-y-1 border-t border-slate-100 pt-4 text-sm font-medium">
          <NavItem icon={CircleHelp} label="Help & support" disabled />
          <NavItem icon={Settings} label="Settings" disabled />
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{(user.displayName ?? user.email ?? "A").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user.displayName ?? user.email ?? "Administrator"}</p><p className="truncate text-[11px] text-slate-400">Administrator</p></div>
          </div>
          <button onClick={() => signOut(firebaseAuth)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-7">
          <div><div className="flex items-center gap-2"><h1 className="text-lg font-bold">Feedback Hub</h1><span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-[#5285f7]">BETA</span></div><p className="text-xs text-slate-400">Listen, respond, and shape what comes next.</p></div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1" aria-label="Dashboard view">
              <button onClick={() => changeView("list")} aria-pressed={dashboardView === "list"} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${dashboardView === "list" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}><List className="h-3.5 w-3.5" />List</button>
              <button onClick={() => changeView("board")} aria-pressed={dashboardView === "board"} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${dashboardView === "board" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}><Columns3 className="h-3.5 w-3.5" />Board</button>
            </div>
            <button onClick={() => { setAdminMode((enabled) => !enabled); setActionsMenu(false); setStatusMenu(false); }} aria-pressed={adminMode} title={adminMode ? "Disable editing controls" : "Enable editing controls"} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${adminMode ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>{adminMode ? <ShieldCheck className="h-4 w-4" /> : <Shield className="h-4 w-4" />}{adminMode ? "Admin on" : "Admin off"}</button>
            <button onClick={toggleTheme} aria-label={darkTheme ? "Use light theme" : "Use dark theme"} title={darkTheme ? "Use light theme" : "Use dark theme"} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50">{darkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            <button disabled aria-label="Notifications (coming soon)" title="Coming soon" className="relative cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-400 opacity-55"><Bell className="h-4 w-4" /></button>
            <button disabled title="Coming soon" className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-400 opacity-55">Export feedback</button>
          </div>
        </header>

        {dashboardView === "board" ? (
          <BoardView
            posts={filteredPosts}
            query={query}
            setQuery={setQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            selectedPost={posts.find((post) => post.id === boardSelectedId)}
            comments={comments}
            loadingComments={loadingComments}
            canManage={adminMode}
            onMovePost={updateStatus}
            onUpdateCategory={updateCategory}
            onViewMedia={openMedia}
            onEditPost={(post) => setEditing(post)}
            onDeletePost={() => setConfirmDelete(true)}
            onEditComment={(comment) => setEditingComment(comment)}
            onDeleteComment={(comment) => setConfirmDeleteComment(comment)}
            officialReply={officialReply}
            setOfficialReply={setOfficialReply}
            sendingReply={sendingReply}
            onSendReply={sendOfficialReply}
            onOpenPost={(postId) => {
              setSelectedId(postId);
              setBoardSelectedId(postId);
            }}
            onClosePost={() => setBoardSelectedId("")}
          />
        ) : <div className="grid grid-cols-[minmax(430px,1fr)_390px] overflow-hidden">
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
                <label className="relative"><select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)} className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-xs font-medium outline-none"><option>All feedback</option><option>Feature Idea</option><option>Bug & Problem</option><option>Content & Personalization</option><option>General Feedback</option><option>Submitted</option><option>Reviewing</option><option>Planned</option><option>In Progress</option><option>Shipped</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /></label>
              </div>
            </div>

            {dataError && <div className="border-b border-rose-100 bg-rose-50 px-6 py-2.5 text-[11px] font-medium text-rose-700">{dataError}</div>}
            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-3 text-[11px] text-slate-400"><span>{filteredPosts.length} live conversations</span><button disabled title="Sorting options coming soon" className="flex cursor-not-allowed items-center gap-1 font-semibold text-slate-400 opacity-55">Newest first <ChevronDown className="h-3.5 w-3.5" /></button></div>
            <div className="overflow-y-auto">
              {filteredPosts.map((post) => <PostRow key={post.id} post={post} active={selected.id === post.id} onClick={() => setSelectedId(post.id)} />)}
              {filteredPosts.length === 0 && <div className="grid h-64 place-items-center text-sm text-slate-400">No feedback matches this view.</div>}
            </div>
          </section>

          <aside className="overflow-y-auto bg-white">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Conversation</p><h2 className="mt-2 text-xl font-bold leading-tight">{selected.title}</h2></div><div className="relative"><button disabled={!adminMode} onClick={() => setActionsMenu((open) => !open)} aria-label={adminMode ? "More actions" : "Enable admin mode to edit"} title={adminMode ? "Post actions" : "Enable Admin mode first"} className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"><Ellipsis className="h-4 w-4" /></button>{actionsMenu && <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button onClick={() => { setEditing(selected); setActionsMenu(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium hover:bg-slate-50"><Pencil className="h-3.5 w-3.5" />Edit post</button><button onClick={() => setConfirmDelete(true)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" />Delete post</button></div>}</div></div>
              <div className="mt-4 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-[11px] font-bold text-blue-700">{selected.initials}</div><div><p className="text-xs font-semibold">{selected.author}</p><p className="text-[11px] text-slate-400">{selected.time} · {selected.version}</p></div></div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="relative"><p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">Status</p><button disabled={!adminMode} onClick={() => setStatusMenu((open) => !open)} title={adminMode ? "Change ticket status" : "Enable Admin mode to change status"} className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-65 ${statusStyle[selected.status]}`}><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-current opacity-70" />{selected.status}</span><ChevronDown className="mr-0.5 h-4 w-4 shrink-0" /></button>{statusMenu && <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">{statuses.map((status) => <button key={status} onClick={() => updateStatus(status)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium hover:bg-slate-50"><span className={`h-2 w-2 rounded-full ${status === "Shipped" ? "bg-emerald-500" : status === "In Progress" ? "bg-blue-500" : status === "Planned" ? "bg-violet-500" : status === "Reviewing" ? "bg-amber-500" : "bg-slate-400"}`} />{status}</button>)}</div>}</div>
                <label><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400">Ticket type</span><span className="relative block"><select disabled={!adminMode} value={selected.category} onChange={(event) => void updateCategory(event.target.value as Category)} title={adminMode ? "Change ticket type" : "Enable Admin mode to change type"} className="h-[42px] w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-[10px] font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-65">{categories.map((category) => <option key={category}>{category}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /></span></label>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-slate-600">{selected.body}</p>
              {selected.mediaURLs.length > 0 && <div className="mt-4 grid grid-cols-2 gap-2">{selected.mediaURLs.map((url, index) => <button key={url} onClick={() => openMedia(selected.mediaURLs, index)} className={`group relative overflow-hidden rounded-xl bg-blue-50 ${selected.mediaURLs.length === 1 ? "col-span-2" : ""}`}><img src={url} alt={`Attachment ${index + 1}`} className="h-36 w-full object-contain transition group-hover:scale-[1.02]" /><span className="absolute bottom-2 right-2 rounded-lg bg-slate-950/65 px-2 py-1 text-[9px] font-semibold text-white"><ImageIcon className="mr-1 inline h-3 w-3" />View</span></button>)}</div>}
              <div className="mt-5 flex items-center gap-4 border-y border-slate-100 py-3 text-xs font-semibold text-slate-500"><span className="flex items-center gap-1.5"><ThumbsUp className="h-4 w-4 text-[#5285f7]" />{selected.supports} supports</span><span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{selected.comments} comments</span></div>

              <div className="mt-6">
                <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Comments</p><span className="text-[10px] font-semibold text-slate-400">{comments.length}</span></div>
                <div className="mt-3 space-y-3">
                  {loadingComments && <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-400">Loading conversation…</div>}
                  {!loadingComments && comments.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">No comments on this post yet.</div>}
                  {comments.map((comment) => <div key={comment.id} className={`group/comment rounded-2xl p-3.5 ${comment.isOfficial ? "bg-blue-50 ring-1 ring-blue-100" : "bg-slate-50"}`}><div className="flex items-center gap-2.5"><div className={`flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold ${comment.isOfficial ? "bg-[#5285f7] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{comment.initials}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-[11px] font-bold text-slate-700">{comment.author}</p>{comment.isOfficial && <span className="rounded-full bg-white px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-[#5285f7]">Official</span>}</div><p className="text-[9px] text-slate-400">{comment.time}</p></div>{adminMode && <div className="flex items-center gap-1"><button onClick={() => setEditingComment(comment)} aria-label="Edit comment" title="Edit comment" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-blue-600"><Pencil className="h-3 w-3" /></button><button onClick={() => setConfirmDeleteComment(comment)} aria-label="Delete comment" title="Delete comment" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-rose-600"><Trash2 className="h-3 w-3" /></button></div>}</div><p className="mt-2.5 whitespace-pre-wrap text-xs leading-5 text-slate-600">{comment.body}</p></div>)}
                </div>
              </div>

              <div className="mt-6 opacity-55"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Internal note</p><span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Coming soon</span></div><textarea disabled placeholder="Private notes aren’t available yet." className="mt-2 h-24 w-full cursor-not-allowed resize-none rounded-xl border border-slate-200 bg-slate-100 p-3 text-xs text-slate-400 outline-none" /><button disabled className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-xs font-semibold text-slate-400">Save note</button></div>

              <div className="mt-6 rounded-2xl bg-[#f4f7ff] p-4"><div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Sparkles className="h-4 w-4 text-[#5285f7]" />Official response</div><p className="mt-1.5 text-[11px] leading-5 text-slate-500">Reply as the Keep Swimmin’ Team. Users will see it immediately in the app.</p><textarea disabled={!adminMode} value={officialReply} onChange={(event) => setOfficialReply(event.target.value)} maxLength={1000} placeholder={adminMode ? "Write an update or response…" : "Enable Admin mode to respond."} className="mt-3 h-24 w-full resize-none rounded-xl border border-blue-100 bg-white p-3 text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 disabled:cursor-not-allowed disabled:opacity-60" /><div className="mt-2 flex items-center justify-between"><span className="text-[9px] text-slate-400">{officialReply.length}/1000</span><button onClick={sendOfficialReply} disabled={!adminMode || !officialReply.trim() || sendingReply} className="rounded-xl bg-[#5285f7] px-4 py-2.5 text-xs font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40">{sendingReply ? "Posting…" : "Post official response"}</button></div></div>
            </div>
          </aside>
        </div>}
      </section>

      {editing && <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/30 p-6 backdrop-blur-sm"><form onSubmit={saveEdit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5285f7]">Admin access</p><h2 className="mt-1 text-xl font-bold">Edit feedback post</h2></div><button type="button" onClick={() => setEditing(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><label className="mt-6 block text-xs font-semibold text-slate-600">Title<input required maxLength={100} value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></label><label className="mt-4 block text-xs font-semibold text-slate-600">Description<textarea required maxLength={2000} value={editing.body} onChange={(event) => setEditing({ ...editing, body: event.target.value })} className="mt-2 h-32 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></label><label className="mt-4 block text-xs font-semibold text-slate-600">Category<select value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value as Category })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"><option>Feature Idea</option><option>Bug & Problem</option><option>Content & Personalization</option><option>General Feedback</option></select></label><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50">Cancel</button><button className="rounded-xl bg-[#5285f7] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-200">Save changes</button></div></form></div>}

      {editingComment && <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/30 p-6 backdrop-blur-sm"><form onSubmit={saveCommentEdit} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5285f7]">Admin mode</p><h2 className="mt-1 text-xl font-bold">Edit comment</h2></div><button type="button" onClick={() => setEditingComment(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><p className="mt-2 text-xs text-slate-400">Comment by {editingComment.author}</p><textarea required autoFocus maxLength={1000} value={editingComment.body} onChange={(event) => setEditingComment({ ...editingComment, body: event.target.value })} className="mt-5 h-36 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEditingComment(null)} className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50">Cancel</button><button className="rounded-xl bg-[#5285f7] px-5 py-2.5 text-xs font-semibold text-white">Save comment</button></div></form></div>}

      {confirmDelete && <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/30 p-6 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><Trash2 className="h-5 w-5" /></div><h2 className="mt-4 text-lg font-bold">Delete this post?</h2><p className="mt-2 text-xs leading-5 text-slate-500">This removes the feedback and its conversation from the hub. This action can’t be undone.</p><div className="mt-6 grid grid-cols-2 gap-2"><button onClick={() => setConfirmDelete(false)} className="rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600">Keep post</button><button onClick={deleteSelected} className="rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white">Delete post</button></div></div></div>}

      {confirmDeleteComment && <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/30 p-6 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><Trash2 className="h-5 w-5" /></div><h2 className="mt-4 text-lg font-bold">Delete this comment?</h2><p className="mt-2 text-xs leading-5 text-slate-500">This permanently removes {confirmDeleteComment.author}&apos;s comment. This action can’t be undone.</p><div className="mt-6 grid grid-cols-2 gap-2"><button onClick={() => setConfirmDeleteComment(null)} className="rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600">Keep comment</button><button onClick={deleteComment} className="rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white">Delete comment</button></div></div></div>}

      {mediaViewer && <div onClick={() => setMediaViewer(null)} className="absolute inset-0 z-[70] flex flex-col bg-slate-950/90 p-5 backdrop-blur-md"><div className="mx-auto flex w-full max-w-6xl items-center justify-between text-white"><div><p className="text-xs font-bold">User attachment</p><p className="mt-0.5 text-[10px] text-slate-400">{mediaViewer.index + 1} of {mediaViewer.urls.length}</p></div><button onClick={() => setMediaViewer(null)} aria-label="Close gallery" className="rounded-xl border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/20"><X className="h-5 w-5" /></button></div><div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-center justify-center py-5">{mediaViewer.urls.length > 1 && <button onClick={(event) => { event.stopPropagation(); setMediaViewer((viewer) => viewer && ({ ...viewer, index: (viewer.index - 1 + viewer.urls.length) % viewer.urls.length })); }} aria-label="Previous image" className="absolute left-0 z-10 rounded-full border border-white/15 bg-slate-900/70 p-3 text-white backdrop-blur transition hover:bg-slate-800"><ChevronLeft className="h-6 w-6" /></button>}<img onClick={(event) => event.stopPropagation()} src={mediaViewer.urls[mediaViewer.index]} alt={`Attachment ${mediaViewer.index + 1}`} className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl shadow-black/50" />{mediaViewer.urls.length > 1 && <button onClick={(event) => { event.stopPropagation(); setMediaViewer((viewer) => viewer && ({ ...viewer, index: (viewer.index + 1) % viewer.urls.length })); }} aria-label="Next image" className="absolute right-0 z-10 rounded-full border border-white/15 bg-slate-900/70 p-3 text-white backdrop-blur transition hover:bg-slate-800"><ChevronRight className="h-6 w-6" /></button>}</div>{mediaViewer.urls.length > 1 && <div onClick={(event) => event.stopPropagation()} className="mx-auto flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur">{mediaViewer.urls.map((url, index) => <button key={url} onClick={() => setMediaViewer({ urls: mediaViewer.urls, index })} className={`overflow-hidden rounded-xl border-2 transition ${index === mediaViewer.index ? "border-blue-400 opacity-100" : "border-transparent opacity-50 hover:opacity-90"}`}><img src={url} alt="" className="h-14 w-20 object-cover" /></button>)}</div>}</div>}
    </main>
  );
}

function BoardView({
  posts,
  query,
  setQuery,
  activeFilter,
  setActiveFilter,
  selectedPost,
  comments,
  loadingComments,
  canManage,
  onMovePost,
  onUpdateCategory,
  onViewMedia,
  onEditPost,
  onDeletePost,
  onEditComment,
  onDeleteComment,
  officialReply,
  setOfficialReply,
  sendingReply,
  onSendReply,
  onOpenPost,
  onClosePost,
}: {
  posts: FeedbackPost[];
  query: string;
  setQuery: (value: string) => void;
  activeFilter: string;
  setActiveFilter: (value: string) => void;
  selectedPost?: FeedbackPost;
  comments: FeedbackComment[];
  loadingComments: boolean;
  canManage: boolean;
  onMovePost: (status: Status, postId: string) => Promise<void>;
  onUpdateCategory: (category: Category, postId?: string) => Promise<void>;
  onViewMedia: (urls: string[], index?: number) => void;
  onEditPost: (post: FeedbackPost) => void;
  onDeletePost: () => void;
  onEditComment: (comment: FeedbackComment) => void;
  onDeleteComment: (comment: FeedbackComment) => void;
  officialReply: string;
  setOfficialReply: (value: string) => void;
  sendingReply: boolean;
  onSendReply: () => Promise<void>;
  onOpenPost: (postId: string) => void;
  onClosePost: () => void;
}) {
  const [draggingId, setDraggingId] = useState("");
  const [dropTarget, setDropTarget] = useState<Status | null>(null);

  async function dropPost(status: Status, transferredId: string) {
    const postId = transferredId || draggingId;
    const post = posts.find((item) => item.id === postId);
    setDropTarget(null);
    setDraggingId("");
    if (!post || post.status === status) return;
    await onMovePost(status, post.id);
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="feedback-board-toolbar flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-4">
        <div>
          <h2 className="text-sm font-bold">Status board</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">Drag tickets between columns to update their status instantly.</p>
        </div>
        <div className="flex w-full max-w-xl items-center gap-3">
          <label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the board…" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50" /></label>
          <label className="relative"><select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)} className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-xs font-medium outline-none"><option>All feedback</option><option>Feature Idea</option><option>Bug & Problem</option><option>Content & Personalization</option><option>General Feedback</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /></label>
        </div>
      </div>

      <div className="feedback-board flex min-h-0 flex-1 gap-4 overflow-x-auto p-5">
        {statuses.map((status) => {
          const statusPosts = posts.filter((post) => post.status === status);
          return (
            <section
              key={status}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDropTarget(status);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropTarget(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                void dropPost(status, event.dataTransfer.getData("text/plain"));
              }}
              className={`feedback-board-column flex w-[306px] min-w-[306px] flex-col overflow-hidden rounded-2xl border bg-slate-50/70 transition ${dropTarget === status ? "border-blue-400 ring-4 ring-blue-100" : "border-slate-200"}`}
            >
              <header className="feedback-board-column-header flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] ${statusStyle[status]}`}>{status}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{statusPosts.length}</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-current text-slate-300" />
              </header>
              <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
                {statusPosts.map((post) => {
                  const Icon = categoryIcon[post.category];
                  return (
                    <article
                      key={post.id}
                      draggable
                      onDragStart={(event) => {
                        setDraggingId(post.id);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", post.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId("");
                        setDropTarget(null);
                      }}
                      onClick={() => onOpenPost(post.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") onOpenPost(post.id);
                      }}
                      role="button"
                      tabIndex={0}
                      title="Drag to change status or click for details"
                      className={`feedback-board-card group relative w-full cursor-grab overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md active:cursor-grabbing ${draggingId === post.id ? "scale-[0.98] opacity-45" : ""} ${selectedPost?.id === post.id ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-200"}`}
                    >
                      <span className="absolute right-2 top-2 z-10 rounded-lg bg-slate-950/65 p-1 text-white opacity-70 backdrop-blur-sm transition group-hover:opacity-100"><GripVertical className="h-3.5 w-3.5" /></span>
                      {post.mediaURLs[0] && <div className="relative h-24 overflow-hidden border-b border-slate-100 bg-slate-100"><img draggable={false} src={post.mediaURLs[0]} alt="" className="h-full w-full select-none object-cover transition duration-300 group-hover:scale-[1.03]" /><span className="absolute bottom-2 right-2 rounded-md bg-slate-950/70 px-1.5 py-1 text-[8px] font-bold text-white"><ImageIcon className="mr-1 inline h-2.5 w-2.5" />{post.mediaURLs.length}</span></div>}
                      <div className="p-3.5">
                        {post.hasOfficialReply && <div className="mb-2.5 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[8px] font-extrabold uppercase tracking-wider text-blue-600 ring-1 ring-blue-100"><Sparkles className="h-2.5 w-2.5" />KS replied</div>}
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Icon className="h-3.5 w-3.5" /></div>
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-xs font-bold leading-5 text-slate-800">{post.title}</h3>
                            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{post.body}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-[8px] font-bold text-blue-700">{post.initials}</div>
                          <div className="min-w-0 flex-1"><p className="truncate text-[9px] font-bold text-slate-600">{post.author}</p><p className="text-[8px] text-slate-400">{post.time}</p></div>
                          <span className="flex items-center gap-2 text-[9px] font-semibold text-slate-400">
                            <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{post.supports}</span>
                            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.comments}</span>
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
                {statusPosts.length === 0 && <div className="grid h-28 place-items-center rounded-xl border border-dashed border-slate-200 text-[10px] font-medium text-slate-400">No feedback here</div>}
              </div>
            </section>
          );
        })}
      </div>

      {selectedPost && <BoardTicketDrawer post={selectedPost} comments={comments} loadingComments={loadingComments} canManage={canManage} onUpdateStatus={(status) => onMovePost(status, selectedPost.id)} onUpdateCategory={(category) => onUpdateCategory(category, selectedPost.id)} onViewMedia={onViewMedia} onEditPost={() => onEditPost(selectedPost)} onDeletePost={onDeletePost} onEditComment={onEditComment} onDeleteComment={onDeleteComment} officialReply={officialReply} setOfficialReply={setOfficialReply} sendingReply={sendingReply} onSendReply={onSendReply} onClose={onClosePost} />}
    </div>
  );
}

function BoardTicketDrawer({
  post,
  comments,
  loadingComments,
  canManage,
  onUpdateStatus,
  onUpdateCategory,
  onViewMedia,
  onEditPost,
  onDeletePost,
  onEditComment,
  onDeleteComment,
  officialReply,
  setOfficialReply,
  sendingReply,
  onSendReply,
  onClose,
}: {
  post: FeedbackPost;
  comments: FeedbackComment[];
  loadingComments: boolean;
  canManage: boolean;
  onUpdateStatus: (status: Status) => Promise<void>;
  onUpdateCategory: (category: Category) => Promise<void>;
  onViewMedia: (urls: string[], index?: number) => void;
  onEditPost: () => void;
  onDeletePost: () => void;
  onEditComment: (comment: FeedbackComment) => void;
  onDeleteComment: (comment: FeedbackComment) => void;
  officialReply: string;
  setOfficialReply: (value: string) => void;
  sendingReply: boolean;
  onSendReply: () => Promise<void>;
  onClose: () => void;
}) {
  const Icon = categoryIcon[post.category];
  const [statusOpen, setStatusOpen] = useState(false);

  return (
    <>
      <button onClick={onClose} aria-label="Close ticket details" className="absolute inset-0 z-20 cursor-default bg-slate-950/35 backdrop-blur-[1px]" />
      <aside className="feedback-board-drawer absolute inset-y-0 right-0 z-30 flex w-[480px] max-w-[94vw] flex-col border-l border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#5285f7]">Conversation workspace</p><p className="mt-1 text-xs text-slate-400">Manage this ticket without leaving the board</p></div>
          <div className="flex items-center gap-1.5">
            <button disabled={!canManage} onClick={onEditPost} title={canManage ? "Edit post" : "Enable Admin mode to edit"} className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35"><Pencil className="h-4 w-4" /></button>
            <button disabled={!canManage} onClick={onDeletePost} title={canManage ? "Delete post" : "Enable Admin mode to delete"} className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-35"><Trash2 className="h-4 w-4" /></button>
            <button onClick={onClose} aria-label="Close details" className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {post.mediaURLs.length > 0 && <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1">{post.mediaURLs.slice(0, 4).map((url, index) => <button key={url} onClick={() => onViewMedia(post.mediaURLs, index)} className={`group relative overflow-hidden bg-slate-200 ${post.mediaURLs.length === 1 ? "col-span-2" : ""}`}><img src={url} alt={`Attachment ${index + 1}`} className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]" /><span className="absolute bottom-2 right-2 rounded-lg bg-slate-950/70 px-2 py-1 text-[8px] font-bold text-white"><ImageIcon className="mr-1 inline h-3 w-3" />View gallery</span></button>)}</div>}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="relative flex-1">
                <button disabled={!canManage} onClick={() => setStatusOpen((open) => !open)} title={canManage ? "Change ticket status" : "Enable Admin mode to change status"} className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-65 ${statusStyle[post.status]}`}><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-current opacity-70" />{post.status}</span><ChevronDown className="mr-0.5 h-4 w-4 shrink-0" /></button>
                {statusOpen && <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">{statuses.map((status) => <button key={status} onClick={() => { setStatusOpen(false); void onUpdateStatus(status); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium hover:bg-slate-50"><span className={`h-2 w-2 rounded-full ${status === "Shipped" ? "bg-emerald-500" : status === "In Progress" ? "bg-blue-500" : status === "Planned" ? "bg-violet-500" : status === "Reviewing" ? "bg-amber-500" : "bg-slate-400"}`} />{status}</button>)}</div>}
              </div>
              <label className="relative mt-0.5 w-[190px] shrink-0"><select disabled={!canManage} value={post.category} onChange={(event) => void onUpdateCategory(event.target.value as Category)} title={canManage ? "Change ticket type" : "Enable Admin mode to change type"} className="h-[42px] w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-[10px] font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-65">{categories.map((category) => <option key={category}>{category}</option>)}</select><Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /></label>
            </div>
            <h2 className="mt-4 text-xl font-bold leading-7 text-slate-900">{post.title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{post.body}</p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-[11px] font-bold text-blue-700">{post.initials}</div>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{post.author}</p><p className="mt-0.5 text-[10px] text-slate-400">Posted {post.time}{post.version ? ` · App ${post.version}` : ""}</p></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 p-4"><ThumbsUp className="h-4 w-4 text-[#5285f7]" /><p className="mt-3 text-xl font-bold">{post.supports}</p><p className="text-[10px] text-slate-400">Community supports</p></div>
              <div className="rounded-2xl border border-slate-200 p-4"><MessageCircle className="h-4 w-4 text-[#5285f7]" /><p className="mt-3 text-xl font-bold">{post.comments}</p><p className="text-[10px] text-slate-400">Conversation replies</p></div>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Comments</p><span className="text-[10px] font-semibold text-slate-400">{comments.length}</span></div>
              <div className="mt-3 space-y-3">
                {loadingComments && <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-400">Loading conversation…</div>}
                {!loadingComments && comments.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">No comments on this post yet.</div>}
                {comments.map((comment) => <div key={comment.id} className={`rounded-2xl p-3.5 ${comment.isOfficial ? "bg-blue-50 ring-1 ring-blue-100" : "bg-slate-50"}`}><div className="flex items-center gap-2.5"><div className={`flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold ${comment.isOfficial ? "bg-[#5285f7] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{comment.initials}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-[11px] font-bold text-slate-700">{comment.author}</p>{comment.isOfficial && <span className="rounded-full bg-white px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-[#5285f7]">Official</span>}</div><p className="text-[9px] text-slate-400">{comment.time}</p></div>{canManage && <div className="flex items-center gap-1"><button onClick={() => onEditComment(comment)} aria-label="Edit comment" className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-blue-600"><Pencil className="h-3 w-3" /></button><button onClick={() => onDeleteComment(comment)} aria-label="Delete comment" className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600"><Trash2 className="h-3 w-3" /></button></div>}</div><p className="mt-2.5 whitespace-pre-wrap text-xs leading-5 text-slate-600">{comment.body}</p></div>)}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#f4f7ff] p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Sparkles className="h-4 w-4 text-[#5285f7]" />Official response</div>
              <p className="mt-1.5 text-[11px] leading-5 text-slate-500">Reply as the Keep Swimmin’ Team. Users will see it immediately in the app.</p>
              <textarea disabled={!canManage} value={officialReply} onChange={(event) => setOfficialReply(event.target.value)} maxLength={1000} placeholder={canManage ? "Write an update or response…" : "Enable Admin mode to respond."} className="mt-3 h-24 w-full resize-none rounded-xl border border-blue-100 bg-white p-3 text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 disabled:cursor-not-allowed disabled:opacity-60" />
              <div className="mt-2 flex items-center justify-between"><span className="text-[9px] text-slate-400">{officialReply.length}/1000</span><button onClick={() => void onSendReply()} disabled={!canManage || !officialReply.trim() || sendingReply} className="rounded-xl bg-[#5285f7] px-4 py-2.5 text-xs font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40">{sendingReply ? "Posting…" : "Post official response"}</button></div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({ icon: Icon, label, active, count, disabled }: { icon: typeof Inbox; label: string; active?: boolean; count?: number; disabled?: boolean }) {
  return <button disabled={disabled || active} title={disabled ? "Coming soon" : undefined} aria-current={active ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${active ? "bg-blue-50 font-semibold text-[#4777df]" : disabled ? "cursor-not-allowed text-slate-400 opacity-45" : "text-slate-500 hover:bg-slate-50"}`}><Icon className="h-4 w-4" /><span className="flex-1">{label}</span>{count !== undefined && <span className="rounded-full bg-[#5285f7] px-2 py-0.5 text-[10px] font-bold text-white">{count}</span>}</button>;
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

function SignInScreen({ error, onSignIn }: { error: string; onSignIn: () => Promise<void> }) {
  return <main className="fixed inset-0 z-50 grid place-items-center bg-[#f7f9fc] p-6 text-slate-900"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5285f7] text-lg font-black text-white">K</div><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5285f7]">Private admin portal</p><h1 className="mt-2 text-2xl font-bold">Welcome to Feedback Hub</h1><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Sign in with the Google account you use for Keep Swimmin’ to view the live community feed.</p><div className="mt-6"><button onClick={onSignIn} className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Continue with Google</button></div>{error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-left text-xs leading-5 text-rose-700">{error}</p>}</div></main>;
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
