import { useEffect, useState } from "react";
import { apiRequest, resolveMediaUrl } from "../services/api";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 15;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
];
const INITIAL_FORM = {
  title: "",
  category: "Graphic design",
  description: "",
  file: null,
  displayWidth: 1200,
  displayHeight: 800,
  fitMode: "cover",
  isPublished: true,
};

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("This file could not be read. Please choose it again."));
    reader.readAsDataURL(file);
  });
}

function readVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      if (Number.isFinite(duration) && duration > 0) resolve(duration);
      else
        reject(
          new Error(
            "Could not read the video duration. Try another MP4 or WebM video.",
          ),
        );
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("Could not open this video. Try an MP4 or WebM file."));
    };
    video.src = url;
  });
}

function frameStyle(item) {
  const width = Number(item.displayWidth) || 1200;
  const height = Number(item.displayHeight) || 800;
  return { aspectRatio: width + " / " + height };
}

function mediaFit(item) {
  return { objectFit: item.fitMode === "contain" ? "contain" : "cover" };
}

export default function AdminPortfolioManager({ items, onItemsChange, token }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [previewUrl, setPreviewUrl] = useState("");
  const [checkingVideo, setCheckingVideo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const chooseFile = async (event) => {
    const input = event.currentTarget;
    const file = input.files && input.files[0] ? input.files[0] : null;
    setError("");
    setMessage("");
    setForm((current) => ({ ...current, file: null }));
    setPreviewUrl("");
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, WebP image or MP4/WebM video.");
      input.value = "";
      return;
    }
    const isVideo = file.type.startsWith("video/");
    const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > limit) {
      setError(
        "This file is too large. The limit is " +
          (isVideo ? "25 MB" : "10 MB") +
          ".",
      );
      input.value = "";
      return;
    }

    if (isVideo) {
      setCheckingVideo(true);
      try {
        const duration = await readVideoDuration(file);
        if (duration > MAX_VIDEO_SECONDS) {
          setError(
            "Video is " +
              duration.toFixed(1) +
              " seconds. Please choose a video that is 15 seconds or shorter.",
          );
          input.value = "";
          return;
        }
      } catch (readError) {
        setError(readError.message || "Could not check this video.");
        input.value = "";
        return;
      } finally {
        setCheckingVideo(false);
      }
    }

    setForm((current) => ({ ...current, file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadWork = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!form.file && !editingId) {
      setError("Choose an image or video before uploading.");
      return;
    }
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const fileData = form.file ? await readAsDataUrl(form.file) : "";
      const result = await apiRequest(
        editingId ? "/portfolio/" + editingId : "/portfolio",
        {
          method: editingId ? "PATCH" : "POST",
          token,
          body: JSON.stringify({
            title: form.title,
            category: form.category,
            description: form.description,
            displayWidth: Number(form.displayWidth),
            displayHeight: Number(form.displayHeight),
            fitMode: form.fitMode,
            isPublished: form.isPublished,
            ...(fileData ? { fileData } : {}),
          }),
        },
      );
      onItemsChange((current) =>
        editingId
          ? current.map((work) => (work._id === editingId ? result.data : work))
          : [result.data, ...current],
      );
      const wasEditing = Boolean(editingId);
      setEditingId("");
      setForm(INITIAL_FORM);
      setPreviewUrl("");
      formElement.reset();
      setMessage(
        wasEditing
          ? "Portfolio work updated."
          : result.message || "Your work has been added to the portfolio.",
      );
    } catch (requestError) {
      setError(requestError.message || "Could not upload this work.");
    } finally {
      setUploading(false);
    }
  };

  const editWork = (item) => {
    setError("");
    setMessage("");
    setEditingId(item._id);
    setForm({
      title: item.title || "",
      category: item.category || "Other",
      description: item.description || "",
      file: null,
      displayWidth: item.displayWidth || 1200,
      displayHeight: item.displayHeight || 800,
      fitMode: item.fitMode || "cover",
      isPublished: Boolean(item.isPublished),
    });
    setPreviewUrl("");
    document
      .querySelector(".portfolio-upload-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEdit = () => {
    setEditingId("");
    setForm(INITIAL_FORM);
    setPreviewUrl("");
    setError("");
    setMessage("");
  };

  const togglePublished = async (item) => {
    setSavingId(item._id);
    setError("");
    setMessage("");
    try {
      const result = await apiRequest("/portfolio/" + item._id, {
        method: "PATCH",
        token,
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      onItemsChange((current) =>
        current.map((work) => (work._id === item._id ? result.data : work)),
      );
      setMessage(
        result.data.isPublished
          ? "Work is now visible on your website."
          : "Work has been hidden from your website.",
      );
    } catch (requestError) {
      setError(requestError.message || "Could not update publishing status.");
    } finally {
      setSavingId("");
    }
  };

  const deleteWork = async (item) => {
    if (!window.confirm('Delete "' + item.title + '" and its uploaded media?'))
      return;
    setSavingId(item._id);
    setError("");
    setMessage("");
    try {
      await apiRequest("/portfolio/" + item._id, { method: "DELETE", token });
      onItemsChange((current) =>
        current.filter((work) => work._id !== item._id),
      );
      setMessage("Portfolio work deleted.");
    } catch (requestError) {
      setError(requestError.message || "Could not delete this work.");
    } finally {
      setSavingId("");
    }
  };

  const previewItem = {
    displayWidth: form.displayWidth,
    displayHeight: form.displayHeight,
    fitMode: form.fitMode,
  };

  return (
    <div className="portfolio-manager">
      <div className="portfolio-manager-heading">
        <div>
          <h2>{editingId ? "Edit your work" : "Add your work"}</h2>
          <p>
            Set the display frame here; the website keeps the same proportions
            responsively.
          </p>
        </div>
        <span>
          {items.length} {items.length === 1 ? "project" : "projects"}
        </span>
      </div>
      <form className="portfolio-upload-form" onSubmit={uploadWork}>
        <label>
          Project title
          <input
            name="title"
            value={form.title}
            onChange={updateField}
            maxLength={120}
            required
            placeholder="e.g. Brand identity for a cafe"
          />
        </label>
        <label>
          Category
          <select name="category" value={form.category} onChange={updateField}>
            <option>Graphic design</option>
            <option>Branding</option>
            <option>UI/UX design</option>
            <option>Web development</option>
            <option>Video & motion</option>
            <option>Other</option>
          </select>
        </label>
        <label className="portfolio-upload-description">
          Short description
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            maxLength={500}
            rows={3}
            placeholder="What did you create for this project?"
          />
        </label>
        <fieldset className="portfolio-display-settings">
          <legend>Website display size</legend>
          <label>
            Width (px)
            <input
              name="displayWidth"
              type="number"
              min="240"
              max="3840"
              step="1"
              value={form.displayWidth}
              onChange={updateField}
              required
            />
          </label>
          <span className="portfolio-size-times" aria-hidden="true">
            {"\u00D7"}
          </span>
          <label>
            Height (px)
            <input
              name="displayHeight"
              type="number"
              min="240"
              max="3840"
              step="1"
              value={form.displayHeight}
              onChange={updateField}
              required
            />
          </label>
          <label className="portfolio-fit-mode">
            Image/video fit
            <select name="fitMode" value={form.fitMode} onChange={updateField}>
              <option value="cover">Fill frame (crop edges)</option>
              <option value="contain">Show full media</option>
            </select>
          </label>
          <small>
            The website scales this frame to the card width and preserves the
            width-to-height ratio.
          </small>
        </fieldset>
        <label className="portfolio-file-field">
          Project image or video
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            onChange={chooseFile}
            required={!editingId}
          />
          <small>
            {editingId ? "Leave empty to keep the current media. " : ""}JPG,
            PNG, WebP, MP4 or WebM. Images up to 10 MB. Videos up to 25 MB and
            15 seconds.
          </small>
          {checkingVideo && (
            <span className="portfolio-file-name">
              Checking video length...
            </span>
          )}
          {form.file && (
            <span className="portfolio-file-name">
              {form.file.name} - {(form.file.size / 1024 / 1024).toFixed(1)} MB
            </span>
          )}
        </label>
        {(previewUrl ||
          (editingId && items.find((item) => item._id === editingId))) && (
          <div className="portfolio-upload-preview-wrap">
            <span>
              {previewUrl
                ? "Preview at selected display ratio"
                : "Current media preview"}
            </span>
            <div
              className="portfolio-upload-preview"
              style={frameStyle(previewItem)}
            >
              {previewUrl ? (
                form.file?.type.startsWith("video/") ? (
                  <video
                    src={previewUrl}
                    controls
                    playsInline
                    style={mediaFit(previewItem)}
                    aria-label="Selected project video preview"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Selected project preview"
                    style={mediaFit(previewItem)}
                  />
                )
              ) : (
                (() => {
                  const item = items.find((work) => work._id === editingId);
                  return item?.mediaType === "video" ? (
                    <video
                      src={resolveMediaUrl(item.mediaUrl)}
                      controls
                      playsInline
                      style={mediaFit(item)}
                      aria-label={item.title + " current video preview"}
                    />
                  ) : (
                    <img
                      src={resolveMediaUrl(item?.mediaUrl)}
                      alt={item?.title || "Current portfolio media"}
                      style={mediaFit(item || previewItem)}
                    />
                  );
                })()
              )}
            </div>
          </div>
        )}
        <label className="portfolio-publish-toggle">
          <input
            type="checkbox"
            name="isPublished"
            checked={form.isPublished}
            onChange={updateField}
          />
          <span>Publish on website right away</span>
        </label>
        <div className="portfolio-form-actions">
          <button
            className="button button-primary portfolio-upload-button"
            type="submit"
            disabled={uploading || checkingVideo}
          >
            {uploading
              ? editingId
                ? "Saving..."
                : "Uploading..."
              : editingId
                ? "Save changes"
                : "Add to portfolio"}{" "}
            <span aria-hidden="true">{"\u2197"}</span>
          </button>
          {editingId && (
            <button
              className="admin-modal-cancel"
              type="button"
              onClick={cancelEdit}
              disabled={uploading}
            >
              Cancel edit
            </button>
          )}
        </div>
        {error && (
          <p className="portfolio-manager-message error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="portfolio-manager-message success" role="status">
            {message}
          </p>
        )}
      </form>

      <div className="portfolio-manager-list-heading">
        <h3>Your portfolio work</h3>
        <span>Published work appears on the public Portfolio page.</span>
      </div>
      {items.length === 0 ? (
        <div className="admin-empty">
          <span>{"\u2733"}</span>
          <h2>No portfolio work yet.</h2>
          <p>Upload an image or video above to get started.</p>
        </div>
      ) : (
        <div className="portfolio-manager-grid">
          {items.map((item) => (
            <article className="portfolio-manager-card" key={item._id}>
              <div className="portfolio-manager-media" style={frameStyle(item)}>
                {item.mediaType === "video" ? (
                  <video
                    src={resolveMediaUrl(item.mediaUrl)}
                    controls
                    preload="metadata"
                    playsInline
                    style={mediaFit(item)}
                    aria-label={item.title + " project video"}
                  />
                ) : (
                  <img
                    src={resolveMediaUrl(item.mediaUrl)}
                    alt={item.title}
                    loading="lazy"
                    style={mediaFit(item)}
                  />
                )}
              </div>
              <div className="portfolio-manager-card-copy">
                <div>
                  <span>{item.category}</span>
                  <h4>{item.title}</h4>
                  {item.description && <p>{item.description}</p>}
                </div>
                <span
                  className={
                    "portfolio-publish-status" +
                    (item.isPublished ? " is-published" : "")
                  }
                >
                  {item.isPublished ? "Published" : "Hidden"}
                </span>
              </div>
              <div className="portfolio-manager-actions">
                <button
                  type="button"
                  disabled={savingId === item._id}
                  onClick={() => editWork(item)}
                >
                  Edit work
                </button>
                <button
                  type="button"
                  disabled={savingId === item._id}
                  onClick={() => togglePublished(item)}
                >
                  {item.isPublished
                    ? "Hide from website"
                    : "Publish on website"}
                </button>
                <button
                  className="portfolio-delete-button"
                  type="button"
                  disabled={savingId === item._id}
                  onClick={() => deleteWork(item)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
