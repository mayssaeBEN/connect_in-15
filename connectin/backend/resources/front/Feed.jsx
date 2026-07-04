import { useEffect, useMemo, useRef, useState } from "react";
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
  const [error, setError] = useState("");

  // Create post
  const [newContent, setNewContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const newPostFileRef = useRef(null);

  // Edit post
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostContent, setEditingPostContent] = useState("");
  const [editingPostNewImage, setEditingPostNewImage] = useState(null);
  const [editingPostRemoveImage, setEditingPostRemoveImage] = useState(false);
  const editPostFileRef = useRef(null);

  // Create comment
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentImages, setCommentImages] = useState({});
  const commentFileRefs = useRef({});

  // Edit comment
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [editingCommentNewImage, setEditingCommentNewImage] = useState(null);
  const [editingCommentRemoveImage, setEditingCommentRemoveImage] = useState(false);
  const editCommentFileRef = useRef(null);

  // Like lock
  const [likingPostId, setLikingPostId] = useState(null);

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

  // Styles (contraste +)
  const card =
    "rounded-2xl border border-slate-300 bg-white p-6 shadow-md " +
    "dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40";

  const field =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none " +
    "ring-indigo-500/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950";

  const btnBlue =
    "inline-flex items-center justify-center rounded-xl border border-indigo-300 bg-indigo-100 " +
    "px-4 py-2.5 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-200 " +
    "dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-100 dark:hover:bg-indigo-950/60";

  const btnRed =
    "inline-flex items-center justify-center rounded-xl border border-rose-300 bg-rose-100 " +
    "px-3 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-200 " +
    "dark:border-rose-800/60 dark:bg-rose-950/35 dark:text-rose-100 dark:hover:bg-rose-950/55";

  const btnNeutral =
    "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 " +
    "hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800";

  const fileBtn =
    "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white " +
    "px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 " +
    "dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800";

  // Create post
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
      if (newPostFileRef.current) newPostFileRef.current.value = "";

      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit post
  const startEditPost = (post) => {
    setEditingPostId(post.id);
    setEditingPostContent(post.content || "");
    setEditingPostNewImage(null);
    setEditingPostRemoveImage(false);
    if (editPostFileRef.current) editPostFileRef.current.value = "";
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditingPostContent("");
    setEditingPostNewImage(null);
    setEditingPostRemoveImage(false);
    if (editPostFileRef.current) editPostFileRef.current.value = "";
  };

  const saveEditPost = async (postId) => {
    setError("");
    try {
      const fd = new FormData();
      fd.append("_method", "PUT"); // ✅ important pour upload
      fd.append("content", editingPostContent);
      if (editingPostRemoveImage) fd.append("remove_image", "1");
      if (editingPostNewImage) fd.append("image", editingPostNewImage);

      await apiFetch(`/posts/${postId}`, { method: "POST", body: fd });

      cancelEditPost();
      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const deletePost = async (postId) => {
    setError("");
    try {
      await apiFetch(`/posts/${postId}`, { method: "DELETE" });
      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  // Likes
  const likedByMe = (post) =>
    (post.likes || []).some((l) => Number(l.user_id) === Number(CURRENT_USER_ID));

  const toggleLike = async (postId) => {
    if (likingPostId === postId) return;
    setLikingPostId(postId);
    setError("");

    try {
      await apiFetch(`/posts/${postId}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: CURRENT_USER_ID }),
      });
      await loadPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLikingPostId(null);
    }
  };

  // Create comment
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

      const ref = commentFileRefs.current[postId];
      if (ref) ref.value = "";

      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit comment
  const startEditComment = (c) => {
    setEditingCommentId(c.id);
    setEditingCommentContent(c.content || "");
    setEditingCommentNewImage(null);
    setEditingCommentRemoveImage(false);
    if (editCommentFileRef.current) editCommentFileRef.current.value = "";
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
    setEditingCommentNewImage(null);
    setEditingCommentRemoveImage(false);
    if (editCommentFileRef.current) editCommentFileRef.current.value = "";
  };

  const saveEditComment = async (commentId) => {
    setError("");
    try {
      const fd = new FormData();
      fd.append("_method", "PUT"); // ✅ important pour upload
      fd.append("content", editingCommentContent);
      if (editingCommentRemoveImage) fd.append("remove_image", "1");
      if (editingCommentNewImage) fd.append("image", editingCommentNewImage);

      await apiFetch(`/comments/${commentId}`, { method: "POST", body: fd });

      cancelEditComment();
      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteComment = async (commentId) => {
    setError("");
    try {
      await apiFetch(`/comments/${commentId}`, { method: "DELETE" });
      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppLayout subtitle="Feed">
      <div className={card}>
        <div className="text-3xl font-extrabold tracking-tight">Feed</div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/35 dark:text-rose-100">
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

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={newPostFileRef}
              id="post-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setNewPostImage(e.target.files?.[0] || null)}
            />

            <label htmlFor="post-image" className={fileBtn}>
              Choisir une image
            </label>

            <span className="text-sm text-slate-800 dark:text-slate-300">
              {newPostImage ? newPostImage.name : "Aucun fichier"}
            </span>

            <button type="submit" className={btnBlue}>
              Publier
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 space-y-6">
        {posts.map((post) => {
          const isEditing = editingPostId === post.id;
          const isLiked = likedByMe(post);
          const canEditPost = Number(post.user_id) === Number(CURRENT_USER_ID);

          return (
            <div key={post.id} className={card}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-200 text-sm font-bold text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-100">
                  {(post.user?.name || "U").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{post.user?.name || "Utilisateur"}</div>
                  <div className="text-xs text-slate-700 dark:text-slate-400">Post #{post.id}</div>
                </div>
                <div className="flex-1" />
              </div>

              <div className="mt-4">
                {isEditing ? (
                  <>
                    <textarea
                      className={field + " min-h-[110px] resize-none"}
                      value={editingPostContent}
                      onChange={(e) => setEditingPostContent(e.target.value)}
                    />

                    {post.image_url && !editingPostRemoveImage && (
                      <img
                        src={post.image_url}
                        alt="image du post"
                        className="mt-4 w-full rounded-2xl border border-slate-300 object-cover dark:border-slate-700"
                      />
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        ref={editPostFileRef}
                        id={`edit-post-image-${post.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setEditingPostNewImage(e.target.files?.[0] || null)}
                      />

                      <label htmlFor={`edit-post-image-${post.id}`} className={fileBtn}>
                        Remplacer l’image
                      </label>

                      <button
                        type="button"
                        className={btnRed}
                        onClick={() => {
                          setEditingPostRemoveImage((v) => !v);
                          setEditingPostNewImage(null);
                          if (editPostFileRef.current) editPostFileRef.current.value = "";
                        }}
                      >
                        {editingPostRemoveImage ? "Annuler suppression" : "Supprimer l’image"}
                      </button>

                      <span className="text-sm text-slate-800 dark:text-slate-300">
                        {editingPostNewImage
                          ? `Nouvelle: ${editingPostNewImage.name}`
                          : editingPostRemoveImage
                          ? "Image supprimée"
                          : post.image_url
                          ? "Image actuelle"
                          : "Aucune image"}
                      </span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => saveEditPost(post.id)} className={btnBlue}>
                        Enregistrer
                      </button>
                      <button type="button" onClick={cancelEditPost} className={btnNeutral}>
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900 dark:text-slate-50">
                      {post.content}
                    </div>

                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="image du post"
                        className="mt-4 w-full rounded-2xl border border-slate-300 object-cover dark:border-slate-700"
                      />
                    )}
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={likingPostId === post.id}
                  onClick={() => toggleLike(post.id)}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    isLiked
                      ? "border-rose-300 bg-rose-100 text-rose-900 hover:bg-rose-200 dark:border-rose-800/60 dark:bg-rose-950/35 dark:text-rose-100 dark:hover:bg-rose-950/55"
                      : "border-slate-300 bg-white text-slate-900 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800",
                  ].join(" ")}
                >
                  <span>{isLiked ? "❤️" : "🤍"}</span>
                  <span>{(post.likes || []).length}</span>
                </button>

                <span className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                  💬 {(post.comments || []).length}
                </span>

                <div className="flex-1" />

                {canEditPost && !isEditing && (
                  <button type="button" onClick={() => startEditPost(post)} className={btnNeutral}>
                    Modifier
                  </button>
                )}

                {canEditPost && (
                  <button type="button" onClick={() => deletePost(post.id)} className={btnRed}>
                    Supprimer
                  </button>
                )}
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-300 pt-5 dark:border-slate-700">
                {(post.comments || []).map((c) => {
                  const canEdit = Number(c.user_id) === Number(CURRENT_USER_ID);
                  const editing = editingCommentId === c.id;

                  return (
                    <div key={c.id} className="rounded-xl border border-slate-300 p-4 dark:border-slate-700">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{c.user?.name || "Utilisateur"}</div>

                        {canEdit && !editing && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditComment(c)}
                              className={btnNeutral + " px-3 py-1.5 text-xs"}
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteComment(c.id)}
                              className={btnRed + " px-3 py-1.5 text-xs"}
                            >
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

                          {c.image_url && !editingCommentRemoveImage && (
                            <img
                              src={c.image_url}
                              alt="image du commentaire"
                              className="mt-3 w-full rounded-2xl border border-slate-300 object-cover dark:border-slate-700"
                            />
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <input
                              ref={editCommentFileRef}
                              id={`edit-comment-image-${c.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => setEditingCommentNewImage(e.target.files?.[0] || null)}
                            />

                            <label htmlFor={`edit-comment-image-${c.id}`} className={fileBtn}>
                              Remplacer l’image
                            </label>

                            <button
                              type="button"
                              className={btnRed}
                              onClick={() => {
                                setEditingCommentRemoveImage((v) => !v);
                                setEditingCommentNewImage(null);
                                if (editCommentFileRef.current) editCommentFileRef.current.value = "";
                              }}
                            >
                              {editingCommentRemoveImage ? "Annuler suppression" : "Supprimer l’image"}
                            </button>

                            <span className="text-sm text-slate-800 dark:text-slate-300">
                              {editingCommentNewImage
                                ? `Nouvelle: ${editingCommentNewImage.name}`
                                : editingCommentRemoveImage
                                ? "Image supprimée"
                                : c.image_url
                                ? "Image actuelle"
                                : "Aucune image"}
                            </span>
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveEditComment(c.id)}
                              className={btnBlue + " px-3 py-2 text-xs"}
                            >
                              Enregistrer
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditComment}
                              className={btnNeutral + " px-3 py-2 text-xs"}
                            >
                              Annuler
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mt-2 whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100">
                            {c.content}
                          </div>

                          {c.image_url && (
                            <img
                              src={c.image_url}
                              alt="image du commentaire"
                              className="mt-3 w-full rounded-2xl border border-slate-300 object-cover dark:border-slate-700"
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      className={field + " py-2.5"}
                      value={commentDrafts[post.id] || ""}
                      onChange={(e) => setCommentDraft(post.id, e.target.value)}
                      placeholder="Ajouter un commentaire..."
                    />
                    <button type="button" onClick={() => addComment(post.id)} className={btnBlue}>
                      Envoyer
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={(el) => {
                        if (el) commentFileRefs.current[post.id] = el;
                      }}
                      id={`comment-image-${post.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setCommentImage(post.id, e.target.files?.[0] || null)}
                    />

                    <label htmlFor={`comment-image-${post.id}`} className={fileBtn}>
                      Choisir une image
                    </label>

                    <span className="text-sm text-slate-800 dark:text-slate-300">
                      {commentImages[post.id] ? commentImages[post.id].name : "Aucun fichier"}
                    </span>
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