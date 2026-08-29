import "../../assets/css/global.css";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

const statusLabels = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

function MessageList() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] =
    useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] =
    useState(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/contact-messages`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Cannot load contact messages."
        );
      }

      const messageList = Array.isArray(data)
        ? data
        : Array.isArray(data.messages)
          ? data.messages
          : [];

      setMessages(messageList);
    } catch (requestError) {
      console.error(
        "Load messages error:",
        requestError
      );

      setError(
        requestError.message ||
          "Cannot load contact messages."
      );

      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const viewMessage = async (message) => {
    setSelectedMessage(message);

    if (message.status === "new") {
      await updateStatus(message.id, "read", false);
    }
  };

  const updateStatus = async (
    id,
    status,
    showSuccess = true
  ) => {
    try {
      setUpdatingId(id);
      setError("");

      if (showSuccess) {
        setSuccess("");
      }

      const response = await fetch(
        `${API_URL}/contact-messages/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Cannot update message status."
        );
      }

      const updatedMessage =
        data.contactMessage || {
          ...messages.find(
            (message) => message.id === id
          ),
          status,
        };

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === id
            ? {
                ...message,
                ...updatedMessage,
                status,
              }
            : message
        )
      );

      setSelectedMessage((currentMessage) =>
        currentMessage?.id === id
          ? {
              ...currentMessage,
              ...updatedMessage,
              status,
            }
          : currentMessage
      );

      if (showSuccess) {
        setSuccess(
          `Message marked as ${statusLabels[
            status
          ].toLowerCase()}.`
        );
      }
    } catch (requestError) {
      console.error(
        "Update message error:",
        requestError
      );

      setError(
        requestError.message ||
          "Cannot update message status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteMessage = async (message) => {
    const confirmed = window.confirm(
      `Delete the message from "${message.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(message.id);
      setSuccess("");
      setError("");

      const response = await fetch(
        `${API_URL}/contact-messages/${message.id}`,
        {
          method: "DELETE",
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Cannot delete contact message."
        );
      }

      setMessages((currentMessages) =>
        currentMessages.filter(
          (item) => item.id !== message.id
        )
      );

      if (selectedMessage?.id === message.id) {
        setSelectedMessage(null);
      }

      setSuccess(
        "Contact message deleted successfully."
      );
    } catch (requestError) {
      console.error(
        "Delete message error:",
        requestError
      );

      setError(
        requestError.message ||
          "Cannot delete contact message."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const replyToMessage = (message) => {
    const subject = encodeURIComponent(
      `Re: ${message.subject || "Your enquiry"}`
    );

    const emailBody = encodeURIComponent(
      `Hello ${message.name},\n\n`
    );

    window.location.href =
      `mailto:${message.email}` +
      `?subject=${subject}` +
      `&body=${emailBody}`;

    updateStatus(message.id, "replied");
  };

  const filteredMessages = messages.filter(
    (message) => {
      const keyword = search
        .trim()
        .toLowerCase();

      const matchesSearch =
        !keyword ||
        [
          message.id,
          message.name,
          message.email,
          message.phone,
          message.subject,
          message.message,
          message.status,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(keyword)
        );

      const matchesStatus =
        statusFilter === "all" ||
        message.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  };

  const getStatusStyle = (status) => {
    if (status === "new") {
      return {
        color: "#92400e",
        backgroundColor: "#fef3c7",
      };
    }

    if (status === "read") {
      return {
        color: "#1e40af",
        backgroundColor: "#dbeafe",
      };
    }

    if (status === "replied") {
      return {
        color: "#166534",
        backgroundColor: "#dcfce7",
      };
    }

    return {
      color: "#475569",
      backgroundColor: "#e2e8f0",
    };
  };

  const badgeStyle = {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize",
  };

  const newMessageCount = messages.filter(
    (message) => message.status === "new"
  ).length;

  if (loading) {
    return (
      <div className="product-page">
        <h1>Customer Messages</h1>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-header">
        <div>
          <h1>Customer Messages</h1>

          <p>
            Total messages: {messages.length}
            {" | "}
            New: {newMessageCount}
          </p>
        </div>

        <button
          type="button"
          className="btn-edit"
          onClick={loadMessages}
        >
          Refresh
        </button>
      </div>

      {success && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            backgroundColor: "#f0fdf4",
            color: "#166534",
          }}
        >
          {success}
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            backgroundColor: "#fef2f2",
            color: "#991b1b",
          }}
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={loadMessages}
            style={{ marginTop: "8px" }}
          >
            Try Again
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <input
          className="search-box"
          type="search"
          placeholder="Search messages..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          style={{
            minWidth: "170px",
            padding: "10px 12px",
            border: "1px solid #d0d5dd",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
          }}
        >
          <option value="all">
            All statuses
          </option>

          <option value="new">
            New
          </option>

          <option value="read">
            Read
          </option>

          <option value="replied">
            Replied
          </option>

          <option value="archived">
            Archived
          </option>
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Status</th>
              <th>Received</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredMessages.length > 0 ? (
              filteredMessages.map(
                (message) => {
                  const updating =
                    updatingId === message.id;

                  return (
                    <tr
                      key={message.id}
                      style={{
                        fontWeight:
                          message.status === "new"
                            ? "600"
                            : "normal",
                      }}
                    >
                      <td>#{message.id}</td>

                      <td>
                        <strong>
                          {message.name}
                        </strong>
                      </td>

                      <td>
                        <div>
                          {message.email}
                        </div>

                        <div
                          style={{
                            marginTop: "4px",
                            color: "#667085",
                            fontSize: "12px",
                          }}
                        >
                          {message.phone || "-"}
                        </div>
                      </td>

                      <td>
                        {message.subject ||
                          "General Enquiry"}
                      </td>

                      <td>
                        <div
                          style={{
                            maxWidth: "240px",
                            overflow: "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={message.message}
                        >
                          {message.message}
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            ...badgeStyle,
                            ...getStatusStyle(
                              message.status
                            ),
                          }}
                        >
                          {statusLabels[
                            message.status
                          ] || message.status}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            minWidth: "135px",
                            fontSize: "12px",
                          }}
                        >
                          {formatDate(
                            message.createdAt ||
                              message.created_at
                          )}
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                            minWidth: "250px",
                          }}
                        >
                          <button
                            type="button"
                            className="btn-view"
                            onClick={() =>
                              viewMessage(message)
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="btn-edit"
                            disabled={updating}
                            onClick={() =>
                              replyToMessage(
                                message
                              )
                            }
                          >
                            Reply
                          </button>

                          {message.status !==
                            "read" && (
                            <button
                              type="button"
                              className="btn-edit"
                              disabled={updating}
                              onClick={() =>
                                updateStatus(
                                  message.id,
                                  "read"
                                )
                              }
                            >
                              Read
                            </button>
                          )}

                          {message.status !==
                            "archived" && (
                            <button
                              type="button"
                              className="btn-edit"
                              disabled={updating}
                              onClick={() =>
                                updateStatus(
                                  message.id,
                                  "archived"
                                )
                              }
                            >
                              Archive
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn-delete"
                            disabled={updating}
                            onClick={() =>
                              deleteMessage(
                                message
                              )
                            }
                          >
                            {updating
                              ? "Working..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    padding: "35px",
                    textAlign: "center",
                  }}
                >
                  No customer messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedMessage && (
        <div
          onClick={() =>
            setSelectedMessage(null)
          }
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backgroundColor:
              "rgba(15, 23, 42, 0.6)",
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "26px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              boxShadow:
                "0 24px 60px rgba(0, 0, 0, 0.24)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: "20px",
                marginBottom: "22px",
              }}
            >
              <div>
                <h2
                  style={{
                    marginBottom: "5px",
                  }}
                >
                  {selectedMessage.subject ||
                    "General Enquiry"}
                </h2>

                <span
                  style={{
                    ...badgeStyle,
                    ...getStatusStyle(
                      selectedMessage.status
                    ),
                  }}
                >
                  {statusLabels[
                    selectedMessage.status
                  ] ||
                    selectedMessage.status}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMessage(null)
                }
                style={{
                  width: "36px",
                  height: "36px",
                  border: 0,
                  borderRadius: "50%",
                  fontSize: "22px",
                  cursor: "pointer",
                  backgroundColor: "#f1f5f9",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
                marginBottom: "22px",
              }}
            >
              <p>
                <strong>Customer:</strong>{" "}
                {selectedMessage.name}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${selectedMessage.email}`}>
                  {selectedMessage.email}
                </a>
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {selectedMessage.phone || "-"}
              </p>

              <p>
                <strong>Received:</strong>{" "}
                {formatDate(
                  selectedMessage.createdAt ||
                    selectedMessage.created_at
                )}
              </p>
            </div>

            <div
              style={{
                padding: "18px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                backgroundColor: "#f8fafc",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {selectedMessage.message}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "22px",
              }}
            >
              <button
                type="button"
                className="btn-edit"
                onClick={() =>
                  replyToMessage(
                    selectedMessage
                  )
                }
              >
                Reply by Email
              </button>

              <button
                type="button"
                className="btn-edit"
                onClick={() =>
                  updateStatus(
                    selectedMessage.id,
                    "replied"
                  )
                }
              >
                Mark Replied
              </button>

              <button
                type="button"
                className="btn-edit"
                onClick={() =>
                  updateStatus(
                    selectedMessage.id,
                    "archived"
                  )
                }
              >
                Archive
              </button>

              <button
                type="button"
                className="btn-delete"
                onClick={() =>
                  deleteMessage(
                    selectedMessage
                  )
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageList;