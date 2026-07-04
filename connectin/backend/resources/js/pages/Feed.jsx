import { useEffect, useMemo, useState } from "react";
import AppLayout from "./components/AppLayout";
import { apiFetch } from "./api";

export default function Feed() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const CURRENT_USER_ID = user?.id ?? 1;

  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostContent, setEditingPostContent] = useState("");

  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentImages, setCommentImages] = useState({}); // postId -> File|null

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");

  const [error, setError] = useState("");

  const loadPosts = async () => {
    setError("");
    try {
      const data = await apiFetch("/posts");
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Erreur");
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Styles Tailwind réutilisables
  const btnBluePale =
    "inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-200 dark:hover:bg-indigo-950/45";

  const btnRedPale =
    "inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/45";

  const btnNeutral =
    "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900";

  const field =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 dark:border-slate-800 dark:bg-slate-950";

  // POSTS (create avec image)
  const createPost = async (e) => {
    e.preventDefault();
    setError("");
    if (!newContent.trim()) return;

    try {
      const fd = new FormData();
      fd.append("content", newContent);
      fd.append("user_id", String(CURRENT_USER_ID));
      if (newPostImage) fd.append("image", newPostImage);

      await apiFetch("/posts", { method: "POST", body: fd });

      setNewContent("");
      setNewPostImage(null);
      loadPosts();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const startEditPost = (post) => {
    setEditingPostId(post.id);
    setEditingPostContent(post.content || "");
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditingPostContent("");
  };

  const saveEditPost = async (postId) => {
    setError("");
    try {
      await apiFetch(`/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingPostContent }),
      });
      cancelEditPost();
      loadPosts();
    } catch (e) {
      setError(e.message);
    }
  };

  const deletePost = async (postId) => {
    setError("");
    try {
      await apiFetch(`/posts/${postId}`, { method: "DELETE" });
      loadPosts();
    } catch (e) {
      setError(e.message);
    }
  };

  // LIKES
  const likedByMe = (post) =>
    (post.likes || []).some((l) => Number(l.user_id) === Number(CURRENT_USER_ID));

  const toggleLike = async (postId) => {
    setError("");
    try {
      await apiFetch(`/posts/${postId}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: CURRENT_USER_ID }),
      });
      loadPosts();
    } catch (e) {
      setError(e.message);
    }
  };

  // COMMENTS (create avec image)
  const setCommentDraft = (postId, value) => {
    setCommentDrafts((prev) => ({ ...prev, [postId]: value }));
  };

  const setCommentImage = (postId, file) => {
    setCommentImages((prev) => ({ ...prev, [postId]: file }));
  };

  const addComment = async (postId) => {
    setError("");
    const content = (commentDrafts[postId] || "").trim();
    if (!content) return;

    try {
      const fd = new FormData();
      fd.append("content", content);
      fd.append("user_id", String(CURRENT_USER_ID));
      if (commentImages[postId]) fd.append("image", commentImages[postId]);

      await apiFetch(`/posts/${postId}/comments`, { method: "POST", body: fd });

      setCommentDraft(postId, "");
      setCommentImage(postId, null);
      loadPosts();
    } catch (e) {
      setError(e.message);
    }
  };

  const startEditComment = (c) => {
    setEditingCommentId(c.id);
    setEditingCommentContent(c.content || "");
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const saveEditComment = async (commentId) => {
    setError("");
    try {
      await apiFetch(`/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingCommentContent }),
      });
      cancelEditComment();
      loadPosts();
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteComment = async (commentId) => {
    setError("");
    try {
      await apiFetch(`/comments/${commentId}`, { method: "DELETE" });
      loadPosts();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <AppLayout subtitle="Feed" requireAuth={false}>
      {/* Composer */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="text-3xl font-extrabold tracking-tight">Feed</div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={createPost} className="mt-4 space-y-3">
          <textarea
            className={field + " min-h-[110px] resize-none"}
            placeholder="Écris un post..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />

          {/* Image post */}
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-300 dark:file:bg-slate-900 dark:file:text-slate-200 dark:hover:file:bg-slate-800"
            onChange={(e) => setNewPostImage(e.target.files?.[0] || null)}
          />

          <div className="flex items-center gap-2">
            <button type="submit" className={btnBluePale}>
              Publier
            </button>
            {newPostImage && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Image: {newPostImage.name}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Posts */}
      <div className="mt-6 space-y-6">
        {posts.map((post) => {
          const isEditing = editingPostId === post.id;
          const isLiked = likedByMe(post);
          const canEditPost = Number(post.user_id) === Number(CURRENT_USER_ID);

          return (
            <div
              key={post.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200">
                  {(post.user?.name || "U").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{post.user?.name || "Utilisateur"}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Post #{post.id}</div>
                </div>
                <div className="flex-1" />
              </div>

              {/* Content */}
              <div className="mt-4">
                {isEditing ? (
                  <>
                    <textarea
                      className={field + " min-h-[110px] resize-none"}
                      value={editingPostContent}
                      onChange={(e) => setEditingPostContent(e.target.value)}
                    />
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => saveEditPost(post.id)} className={btnBluePale}>
                        Enregistrer
                      </button>
                      <button type="button" onClick={cancelEditPost} className={btnNeutral}>
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                      {post.content}
                    </div>

                    {/* Image post affichée */}
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="image du post"
                        className="mt-4 w-full rounded-2xl border border-slate-200 object-cover dark:border-slate-800"
                      />
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {/* Like (inchangé: rouge pâle si liké) */}
                <button
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    isLiked
                      ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/45"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900",
                  ].join(" ")}
                >
                  <span>{isLiked ? "❤️" : "🤍"}</span>
                  <span>{(post.likes || []).length}</span>
                </button>

                <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  💬 {(post.comments || []).length}
                </span>

                <div className="flex-1" />

                {canEditPost && !isEditing && (
                  <button type="button" onClick={() => startEditPost(post)} className={btnNeutral}>
                    Modifier
                  </button>
                )}

                {/* ✅ Supprimer = rouge pâle */}
                {canEditPost && (
                  <button type="button" onClick={() => deletePost(post.id)} className={btnRedPale}>
                    Supprimer
                  </button>
                )}
              </div>

              {/* Comments */}
              <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                {(post.comments || []).map((c) => {
                  const canEdit = Number(c.user_id) === Number(CURRENT_USER_ID);
                  const editing = editingCommentId === c.id;

                  return (
                    <div key={c.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{c.user?.name || "Utilisateur"}</div>

                        {canEdit && !editing && (
                          <div className="flex gap-2">
                            <button type="button" onClick={() => startEditComment(c)} className={btnNeutral + " px-3 py-1.5 text-xs"}>
                              Modifier
                            </button>
                            {/* ✅ Supprimer commentaire = rouge pâle */}
                            <button type="button" onClick={() => deleteComment(c.id)} className={btnRedPale + " px-3 py-1.5 text-xs"}>
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>

                      {editing ? (
                        <>
                          <input
                            className={field + " mt-3 py-2.5"}
                            value={editingCommentContent}
                            onChange={(e) => setEditingCommentContent(e.target.value)}
                            placeholder="Modifier le commentaire..."
                          />
                          <div className="mt-3 flex gap-2">
                            <button type="button" onClick={() => saveEditComment(c.id)} className={btnBluePale + " px-3 py-2 text-xs"}>
                              Enregistrer
                            </button>
                            <button type="button" onClick={cancelEditComment} className={btnNeutral + " px-3 py-2 text-xs"}>
                              Annuler
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                            {c.content}
                          </div>

                          {/* Image commentaire affichée */}
                          {c.image_url && (
                            <img
                              src={c.image_url}
                              alt="image du commentaire"
                              className="mt-3 w-full rounded-2xl border border-slate-200 object-cover dark:border-slate-800"
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Add comment + image */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      className={field + " py-2.5"}
                      value={commentDrafts[post.id] || ""}
                      onChange={(e) => setCommentDraft(post.id, e.target.value)}
                      placeholder="Ajouter un commentaire..."
                    />

                    {/* ✅ Envoyer = bleu pâle */}
                    <button type="button" onClick={() => addComment(post.id)} className={btnBluePale}>
                      Envoyer
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-300 dark:file:bg-slate-900 dark:file:text-slate-200 dark:hover:file:bg-slate-800"
                      onChange={(e) => setCommentImage(post.id, e.target.files?.[0] || null)}
                    />
                    {commentImages[post.id] && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Image: {commentImages[post.id].name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
} 