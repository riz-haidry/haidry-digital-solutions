import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { Reveal } from "../components/Reveal";
import AdminPortfolioManager from "./AdminPortfolioManager";
import logo from "../assets/logo-640.png";

const emptyData = { inquiries: [], customers: [], orders: [], portfolio: [] };
const labels = {
  inquiries: "Enquiries",
  customers: "Customers",
  orders: "Projects",
  portfolio: "Portfolio",
};
const singularLabels = {
  inquiries: "enquiry",
  customers: "customer",
  orders: "project",
};
const endpoint = {
  inquiries: "/inquiries",
  customers: "/customers",
  orders: "/orders",
};
const inquiryStatuses = ["new", "contacted", "qualified", "closed"];
const orderStatuses = [
  "draft",
  "in-progress",
  "review",
  "complete",
  "cancelled",
];

function getForm(type, record) {
  if (type === "inquiries")
    return {
      name: record?.name ?? "",
      phone: record?.phone ?? "",
      email: record?.email ?? "",
      service: record?.service ?? "",
      message: record?.message ?? "",
      status: record?.status ?? "new",
    };
  if (type === "customers")
    return {
      name: record?.name ?? "",
      phone: record?.phone ?? "",
      email: record?.email ?? "",
    };
  return {
    customer: record?.customer?._id ?? record?.customer ?? "",
    title: record?.title ?? "",
    service: record?.service ?? "",
    notes: record?.notes ?? "",
    amount: record?.amount ?? 0,
    status: record?.status ?? "draft",
  };
}

function statusLabel(value) {
  return String(value || "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("hds-admin-token");
  const [activeTab, setActiveTab] = useState("inquiries");
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState("");
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const reduceMotion = useReducedMotion();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [inquiries, customers, orders, portfolio] = await Promise.all([
        apiRequest("/inquiries", { token }),
        apiRequest("/customers", { token }),
        apiRequest("/orders", { token }),
        apiRequest("/portfolio/manage", { token }),
      ]);
      setData({
        inquiries: inquiries.data ?? [],
        customers: customers.data ?? [],
        orders: orders.data ?? [],
        portfolio: portfolio.data ?? [],
      });
    } catch (requestError) {
      if (
        requestError.message.toLowerCase().includes("token") ||
        requestError.message.toLowerCase().includes("session") ||
        requestError.message.includes("401")
      ) {
        sessionStorage.removeItem("hds-admin-token");
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(requestError.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  // Loading the authenticated workspace is the purpose of this effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {loadData();}, [loadData]);

  useEffect(() => {
    if (!editor && !deleteTarget) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !saving && !deleting) {
        setEditor(null);
        setDeleteTarget(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [editor, deleteTarget, saving, deleting]);

  const records = useMemo(() => {
    const source = data?.[activeTab] || [];
    const query = search.trim().toLowerCase();
    if (!query) return source;
    return source.filter((record) => {
      const customerName =
        typeof record.customer === "object" ? record.customer?.name : "";
      return [
        record.name,
        record.email,
        record.phone,
        record.service,
        record.message,
        record.title,
        record.notes,
        customerName,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [activeTab, data, search]);

  const refreshData = () => {
    setNotice("");
    loadData();
  };

  const openCreate = () => {
    setError("");
    setNotice("");
    setEditor({ type: activeTab, record: null });
    setForm(getForm(activeTab, null));
  };

  const openEdit = (type, record) => {
    setError("");
    setNotice("");
    setEditor({ type, record });
    setForm(getForm(type, record));
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    if (!editor) return;
    const { type, record } = editor;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const isEditing = Boolean(record);
      const path =
        type === "inquiries" && !isEditing
          ? "/inquiries/manage"
          : `${endpoint[type]}${isEditing ? `/${record._id}` : ""}`;
      const result = await apiRequest(path, {
        method: isEditing ? "PATCH" : "POST",
        token,
        body: JSON.stringify(form),
      });
      const saved = result.data;
      setData((current) => ({
        ...current,
        [type]: isEditing
          ? current[type].map((item) => (item._id === saved._id ? saved : item))
          : [saved, ...current[type]],
      }));
      setNotice(
        `${singularLabels[type]} ${isEditing ? "updated" : "created"} successfully.`,
      );
      setEditor(null);
    } catch (requestError) {
      setError(
        requestError.message ||
          `Could not save this ${labels[type].toLowerCase().slice(0, -1)}.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (type, id, status) => {
    setSavingId(id);
    setError("");
    try {
      const result = await apiRequest(`${endpoint[type]}/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status }),
      });
      setData((current) => ({
        ...current,
        [type]: current[type].map((item) =>
          item._id === id ? result.data : item,
        ),
      }));
    } catch (requestError) {
      setError(requestError.message || "Could not update this record.");
    } finally {
      setSavingId("");
    }
  };

  const removeRecord = async () => {
    if (!deleteTarget) return;
    const { type, record } = deleteTarget;
    setDeleting(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(`${endpoint[type]}/${record._id}`, {
        method: "DELETE",
        token,
      });
      setData((current) => ({
        ...current,
        [type]: current[type].filter((item) => item._id !== record._id),
      }));
      setDeleteTarget(null);
      setNotice(`${singularLabels[type]} deleted successfully.`);
    } catch (requestError) {
      setError(requestError.message || "Could not delete this record.");
    } finally {
      setDeleting(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("hds-admin-token");
    navigate("/admin/login", { replace: true });
  };

  const onPortfolioChange = (portfolio) =>
    setData((current) => ({
      ...current,
      portfolio:
        typeof portfolio === "function"
          ? portfolio(current.portfolio)
          : portfolio,
    }));
  const currentTitle =
    editor?.type === "inquiries"
      ? "enquiry"
      : editor?.type === "customers"
        ? "customer"
        : "project";

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <Link
          className="admin-brand-lockup"
          to="/"
          aria-label="Haidry Digital Solutions home"
        >
          <img src={logo} alt="Haidry Digital Solutions logo" />
          <span>
            <strong>Haidry Digital Solutions</strong>
            <small>Studio dashboard</small>
          </span>
        </Link>
        <div className="admin-top-actions">
          <Link to="/">
            View website <span aria-hidden="true">↗</span>
          </Link>
          <button type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="admin-content">
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow-index">PRIVATE WORKSPACE /</span> Overview
          </p>
          <div className="admin-heading-row">
            <div>
              <h1>Project dashboard.</h1>
              <p>Keep track of conversations, customers and studio work.</p>
            </div>
            <motion.button
              className="button button-outline"
              type="button"
              onClick={refreshData}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              ↻ Refresh
            </motion.button>
          </div>
        </Reveal>

        <div className="admin-stat-grid">
          <Reveal className="admin-stat">
            <span>New enquiries</span>
            <strong>
              {data.inquiries.filter((item) => item.status === "new").length}
            </strong>
            <small>Waiting for a first response</small>
          </Reveal>
          <Reveal className="admin-stat" delay={0.05}>
            <span>Customers</span>
            <strong>{data.customers.length}</strong>
            <small>Saved customer records</small>
          </Reveal>
          <Reveal className="admin-stat" delay={0.1}>
            <span>Open projects</span>
            <strong>
              {
                data.orders.filter(
                  (item) => !["complete", "cancelled"].includes(item.status),
                ).length
              }
            </strong>
            <small>Active project records</small>
          </Reveal>
        </div>

        <section className="admin-records" aria-label="Manage studio records">
          <div
            className="admin-tabs"
            role="tablist"
            aria-label="Dashboard data"
          >
            {Object.entries(labels).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                className={activeTab === key ? "active" : ""}
                onClick={() => {
                  setActiveTab(key);
                  setSearch("");
                  setError("");
                  setNotice("");
                }}
              >
                {label}
                <span>{data[key].length}</span>
              </button>
            ))}
          </div>

          {activeTab === "portfolio" ? (
            <AdminPortfolioManager
              items={data.portfolio}
              onItemsChange={onPortfolioChange}
              token={token}
            />
          ) : (
            <>
              <div className="admin-record-toolbar">
                <div>
                  <span className="admin-toolbar-kicker">
                    MANAGE / {labels[activeTab].toUpperCase()}
                  </span>
                  <h2>
                    {labels[activeTab]}
                    <span>{records.length}</span>
                  </h2>
                </div>
                <div className="admin-toolbar-actions">
                  <label className="admin-search">
                    <span aria-hidden="true">⌕</span>
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={`Search ${labels[activeTab].toLowerCase()}`}
                      aria-label={`Search ${labels[activeTab].toLowerCase()}`}
                    />
                  </label>
                  <motion.button
                    className="admin-add-button"
                    type="button"
                    onClick={openCreate}
                    disabled={
                      activeTab === "orders" && data.customers.length === 0
                    }
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  >
                    <span aria-hidden="true">＋</span> Add{" "}
                    {activeTab === "inquiries"
                      ? "enquiry"
                      : activeTab === "customers"
                        ? "customer"
                        : "project"}
                  </motion.button>
                </div>
              </div>

              {error && !editor && !deleteTarget && (
                <p className="form-message error admin-feedback" role="alert">
                  {error}
                </p>
              )}
              {notice && (
                <p
                  className="admin-feedback admin-feedback-success"
                  role="status"
                >
                  {notice}
                </p>
              )}
              {activeTab === "orders" && data.customers.length === 0 && (
                <p className="admin-inline-hint">
                  Add a customer before creating a project.
                </p>
              )}
              {loading ? (
                <div className="admin-empty">
                  Loading your {labels[activeTab].toLowerCase()}…
                </div>
              ) : records.length === 0 ? (
                <div className="admin-empty">
                  <span>✳</span>
                  <h2>
                    {search
                      ? "No matching records."
                      : `No ${labels[activeTab].toLowerCase()} yet.`}
                  </h2>
                  <p>
                    {search
                      ? "Try a different search."
                      : "Use the add button to create your first record."}
                  </p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        {activeTab === "inquiries" ? (
                          <>
                            <th>Contact</th>
                            <th>Service</th>
                            <th>Message</th>
                            <th>Received</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </>
                        ) : activeTab === "customers" ? (
                          <>
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Created</th>
                            <th>Actions</th>
                          </>
                        ) : (
                          <>
                            <th>Project</th>
                            <th>Customer</th>
                            <th>Service / Budget</th>
                            <th>Updated</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record._id}>
                          {activeTab === "inquiries" ? (
                            <>
                              <td>
                                <strong>{record.name}</strong>
                                <small>{record.email || record.phone}</small>
                              </td>
                              <td>{record.service}</td>
                              <td className="message-cell">
                                {record.message || "—"}
                              </td>
                              <td>
                                {record.createdAt
                                  ? new Date(
                                      record.createdAt,
                                    ).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td>
                                <select
                                  aria-label={`Status for ${record.name}`}
                                  disabled={savingId === record._id}
                                  value={record.status}
                                  onChange={(event) =>
                                    updateStatus(
                                      "inquiries",
                                      record._id,
                                      event.target.value,
                                    )
                                  }
                                >
                                  {inquiryStatuses.map((status) => (
                                    <option key={status} value={status}>
                                      {statusLabel(status)}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </>
                          ) : activeTab === "customers" ? (
                            <>
                              <td>
                                <strong>{record.name}</strong>
                              </td>
                              <td>{record.email || "—"}</td>
                              <td>{record.phone || "—"}</td>
                              <td>
                                {record.createdAt
                                  ? new Date(
                                      record.createdAt,
                                    ).toLocaleDateString()
                                  : "—"}
                              </td>
                            </>
                          ) : (
                            <>
                              <td>
                                <strong>
                                  {record.title || "Untitled project"}
                                </strong>
                                <small>{record.notes || ""}</small>
                              </td>
                              <td>{record.customer?.name || "—"}</td>
                              <td>
                                {record.service}
                                <small>{currency(record.amount)}</small>
                              </td>
                              <td>
                                {new Date(
                                  record.updatedAt ?? record.createdAt,
                                ).toLocaleDateString()}
                              </td>
                              <td>
                                <select
                                  aria-label={`Status for ${record.title || "project"}`}
                                  disabled={savingId === record._id}
                                  value={record.status}
                                  onChange={(event) =>
                                    updateStatus(
                                      "orders",
                                      record._id,
                                      event.target.value,
                                    )
                                  }
                                >
                                  {orderStatuses.map((status) => (
                                    <option key={status} value={status}>
                                      {statusLabel(status)}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </>
                          )}
                          <td>
                            <div className="admin-row-actions">
                              <button
                                type="button"
                                onClick={() => openEdit(activeTab, record)}
                              >
                                Edit
                              </button>
                              <button
                                className="admin-row-delete"
                                type="button"
                                onClick={() => {
                                  setError("");
                                  setDeleteTarget({ type: activeTab, record });
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {editor && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving)
              setEditor(null);
          }}
        >
          <motion.section
            className="admin-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-editor-title"
            initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            <div className="admin-modal-heading">
              <div>
                <span className="admin-toolbar-kicker">
                  {editor.record ? "UPDATE RECORD" : "NEW RECORD"}
                </span>
                <h2 id="admin-editor-title">
                  {editor.record ? "Edit" : "Add"} {currentTitle}
                </h2>
              </div>
              <button
                className="admin-modal-close"
                type="button"
                onClick={() => setEditor(null)}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form className="admin-record-form" onSubmit={saveRecord}>
              {editor.type === "inquiries" && (
                <>
                  <label>
                    Contact name
                    <input
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      maxLength={120}
                      required
                    />
                  </label>
                  <div className="admin-form-grid">
                    <label>
                      Phone
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={updateField}
                        maxLength={32}
                        required
                      />
                    </label>
                    <label>
                      Email
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={updateField}
                        maxLength={180}
                      />
                    </label>
                  </div>
                  <label>
                    Service
                    <input
                      name="service"
                      value={form.service}
                      onChange={updateField}
                      maxLength={100}
                      required
                      placeholder="e.g. Web development"
                    />
                  </label>
                  <label>
                    Message
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={updateField}
                      maxLength={4000}
                      rows={4}
                    />
                  </label>
                  <label>
                    Status
                    <select
                      name="status"
                      value={form.status}
                      onChange={updateField}
                    >
                      {inquiryStatuses.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              {editor.type === "customers" && (
                <>
                  <label>
                    Customer name
                    <input
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      maxLength={120}
                      required
                    />
                  </label>
                  <div className="admin-form-grid">
                    <label>
                      Phone
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={updateField}
                        maxLength={32}
                      />
                    </label>
                    <label>
                      Email
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={updateField}
                        maxLength={180}
                      />
                    </label>
                  </div>
                </>
              )}
              {editor.type === "orders" && (
                <>
                  <label>
                    Customer
                    <select
                      name="customer"
                      value={form.customer}
                      onChange={updateField}
                      required
                    >
                      <option value="">Choose customer</option>
                      {data.customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name}
                          {customer.phone ? ` · ${customer.phone}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Project title
                    <input
                      name="title"
                      value={form.title}
                      onChange={updateField}
                      maxLength={180}
                      required
                    />
                  </label>
                  <div className="admin-form-grid">
                    <label>
                      Service
                      <input
                        name="service"
                        value={form.service}
                        onChange={updateField}
                        maxLength={100}
                        required
                      />
                    </label>
                    <label>
                      Budget (INR)
                      <input
                        name="amount"
                        type="number"
                        min="0"
                        step="1"
                        value={form.amount}
                        onChange={updateField}
                      />
                    </label>
                  </div>
                  <label>
                    Project notes
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={updateField}
                      maxLength={4000}
                      rows={4}
                    />
                  </label>
                  <label>
                    Status
                    <select
                      name="status"
                      value={form.status}
                      onChange={updateField}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              {error && (
                <p className="form-message error" role="alert">
                  {error}
                </p>
              )}
              <div className="admin-modal-actions">
                <button
                  className="admin-modal-cancel"
                  type="button"
                  onClick={() => setEditor(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="admin-add-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editor.record
                      ? "Save changes"
                      : `Create ${currentTitle}`}
                </button>
              </div>
            </form>
          </motion.section>
        </div>
      )}

      {deleteTarget && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting)
              setDeleteTarget(null);
          }}
        >
          <motion.section
            className="admin-modal-card admin-delete-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-delete-title"
            initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            <span className="admin-delete-icon" aria-hidden="true">
              !
            </span>
            <span className="admin-toolbar-kicker">CONFIRM DELETE</span>
            <h2 id="admin-delete-title">
              Delete this{" "}
              {deleteTarget.type === "inquiries"
                ? "enquiry"
                : deleteTarget.type === "customers"
                  ? "customer"
                  : "project"}
              ?
            </h2>
            <p>
              This action cannot be undone. Customer records with linked
              enquiries or projects are protected.
            </p>
            {error && (
              <p className="form-message error" role="alert">
                {error}
              </p>
            )}
            <div className="admin-modal-actions">
              <button
                className="admin-modal-cancel"
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Keep record
              </button>
              <button
                className="admin-confirm-delete"
                type="button"
                onClick={removeRecord}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </motion.section>
        </div>
      )}
    </main>
  );
}
