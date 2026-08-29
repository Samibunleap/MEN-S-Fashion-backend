import "../../assets/css/global.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8080/api";

const orderStatusLabels = {
  AWAITING_PAYMENT_CONFIRMATION:
    "Awaiting Payment",
  PAYMENT_CONFIRMED:
    "Payment Confirmed",
  PREPARING:
    "Preparing",
  READY_TO_SHIP:
    "Ready to Ship",
  SHIPPING:
    "Shipping",
  DELIVERED:
    "Delivered",
  CANCELLED:
    "Cancelled",

  pending:
    "Pending",
  preparing:
    "Preparing",
  ready_to_ship:
    "Ready to Ship",
  shipping:
    "Shipping",
  delivered:
    "Delivered",
  cancelled:
    "Cancelled",
};

const paymentStatusLabels = {
  PENDING_PAYMENT_REVIEW:
    "Pending Review",
  PAYMENT_CONFIRMED:
    "Confirmed",
  PAYMENT_REJECTED:
    "Rejected",

  pending:
    "Pending Review",
  confirmed:
    "Confirmed",
  rejected:
    "Rejected",
};

function normalizeOrder(order) {
  let items = order.items || [];

  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  }

  return {
    ...order,

    id: Number(order.id),

    customerName:
      order.customerName ||
      order.customer_name ||
      "Customer",

    customerEmail:
      order.customerEmail ||
      order.customer_email ||
      "",

    customerPhone:
      order.customerPhone ||
      order.customer_phone ||
      "",

    address:
      order.address ||
      order.shipping_address ||
      "",

    total: Number(
      order.total ??
      order.total_amount ??
      0
    ),

    paymentMethod:
      order.paymentMethod ||
      order.payment_method ||
      "",

    paymentStatus:
      order.paymentStatus ||
      order.payment_status ||
      "PENDING_PAYMENT_REVIEW",

    orderStatus:
      order.orderStatus ||
      order.order_status ||
      "AWAITING_PAYMENT_CONFIRMATION",

    createdAt:
      order.createdAt ||
      order.created_at ||
      null,

    updatedAt:
      order.updatedAt ||
      order.updated_at ||
      null,

    items: Array.isArray(items)
      ? items
      : [],
  };
}

function OrderList() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/orders`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not load orders."
        );
      }

      const orderList = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
          ? data.orders
          : [];

      setOrders(
        orderList.map(normalizeOrder)
      );
    } catch (error) {
      console.error(
        "Load orders error:",
        error
      );

      setError(
        error.message ||
          "Could not load orders. Start the backend."
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateOrder = async (
    id,
    endpoint,
    body
  ) => {
    try {
      setUpdatingId(id);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/orders/${id}${endpoint}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: body
            ? JSON.stringify(body)
            : undefined,
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
            "Order update failed."
        );
      }

      setMessage(
        data.message ||
          "Order updated successfully."
      );

      await loadOrders();
    } catch (error) {
      console.error(
        "Update order error:",
        error
      );

      setError(
        error.message ||
          "Order update failed."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const acceptPayment = (order) => {
    updateOrder(
      order.id,
      "/payment/accept"
    );
  };

  const rejectPayment = (order) => {
    const confirmed = window.confirm(
      `Reject payment for order #${order.id}?`
    );

    if (!confirmed) {
      return;
    }

    updateOrder(
      order.id,
      "/payment/reject"
    );
  };

  const changeOrderStatus = (
    order,
    status
  ) => {
    updateOrder(
      order.id,
      "/status",
      {
        status,
      }
    );
  };

  const cancelOrder = (order) => {
    const confirmed = window.confirm(
      `Cancel order #${order.id}?`
    );

    if (!confirmed) {
      return;
    }

    changeOrderStatus(
      order,
      "CANCELLED"
    );
  };

  const filteredOrders = orders.filter(
    (order) => {
      const keyword = search
        .trim()
        .toLowerCase();

      if (!keyword) {
        return true;
      }

      const searchableValues = [
        order.id,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.address,
        order.orderStatus,
        order.paymentStatus,
        order.total,
      ];

      return searchableValues.some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(keyword)
      );
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

  const getPaymentStyle = (status) => {
    if (
      status === "PAYMENT_CONFIRMED" ||
      status === "confirmed"
    ) {
      return {
        color: "#166534",
        backgroundColor: "#dcfce7",
      };
    }

    if (
      status === "PAYMENT_REJECTED" ||
      status === "rejected"
    ) {
      return {
        color: "#991b1b",
        backgroundColor: "#fee2e2",
      };
    }

    return {
      color: "#92400e",
      backgroundColor: "#fef3c7",
    };
  };

  const getOrderStatusStyle = (
    status
  ) => {
    if (
      status === "DELIVERED" ||
      status === "delivered"
    ) {
      return {
        color: "#166534",
        backgroundColor: "#dcfce7",
      };
    }

    if (
      status === "CANCELLED" ||
      status === "cancelled"
    ) {
      return {
        color: "#991b1b",
        backgroundColor: "#fee2e2",
      };
    }

    if (
      status === "SHIPPING" ||
      status === "shipping"
    ) {
      return {
        color: "#1e40af",
        backgroundColor: "#dbeafe",
      };
    }

    return {
      color: "#854d0e",
      backgroundColor: "#fef9c3",
    };
  };

  const badgeStyle = {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  };

  const renderNextAction = (order) => {
    const isUpdating =
      updatingId === order.id;

    const paymentPending =
      order.paymentStatus ===
        "PENDING_PAYMENT_REVIEW" ||
      order.paymentStatus === "pending";

    const paymentRejected =
      order.paymentStatus ===
        "PAYMENT_REJECTED" ||
      order.paymentStatus === "rejected";

    const paymentConfirmed =
      order.paymentStatus ===
        "PAYMENT_CONFIRMED" ||
      order.paymentStatus === "confirmed";

    const cancelled =
      order.orderStatus === "CANCELLED" ||
      order.orderStatus === "cancelled";

    const delivered =
      order.orderStatus === "DELIVERED" ||
      order.orderStatus === "delivered";

    if (cancelled) {
      return (
        <span style={{ color: "#991b1b" }}>
          Cancelled
        </span>
      );
    }

    if (delivered) {
      return (
        <span style={{ color: "#166534" }}>
          Completed
        </span>
      );
    }

    if (paymentRejected) {
      return (
        <span style={{ color: "#991b1b" }}>
          Payment Rejected
        </span>
      );
    }

    if (paymentPending) {
      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          <button
            type="button"
            className="btn-edit"
            disabled={isUpdating}
            onClick={() =>
              acceptPayment(order)
            }
          >
            {isUpdating
              ? "Updating..."
              : "Accept Payment"}
          </button>

          <button
            type="button"
            className="btn-delete"
            disabled={isUpdating}
            onClick={() =>
              rejectPayment(order)
            }
          >
            Reject
          </button>
        </div>
      );
    }

    if (
      paymentConfirmed &&
      (
        order.orderStatus ===
          "PAYMENT_CONFIRMED" ||
        order.orderStatus ===
          "AWAITING_PAYMENT_CONFIRMATION" ||
        order.orderStatus === "pending"
      )
    ) {
      return (
        <button
          type="button"
          className="btn-edit"
          disabled={isUpdating}
          onClick={() =>
            changeOrderStatus(
              order,
              "PREPARING"
            )
          }
        >
          Start Preparing
        </button>
      );
    }

    if (
      order.orderStatus ===
        "PREPARING" ||
      order.orderStatus ===
        "preparing"
    ) {
      return (
        <button
          type="button"
          className="btn-edit"
          disabled={isUpdating}
          onClick={() =>
            changeOrderStatus(
              order,
              "READY_TO_SHIP"
            )
          }
        >
          Ready to Ship
        </button>
      );
    }

    if (
      order.orderStatus ===
        "READY_TO_SHIP" ||
      order.orderStatus ===
        "ready_to_ship"
    ) {
      return (
        <button
          type="button"
          className="btn-edit"
          disabled={isUpdating}
          onClick={() =>
            changeOrderStatus(
              order,
              "SHIPPING"
            )
          }
        >
          Start Shipping
        </button>
      );
    }

    if (
      order.orderStatus ===
        "SHIPPING" ||
      order.orderStatus ===
        "shipping"
    ) {
      return (
        <button
          type="button"
          className="btn-edit"
          disabled={isUpdating}
          onClick={() =>
            changeOrderStatus(
              order,
              "DELIVERED"
            )
          }
        >
          Mark Delivered
        </button>
      );
    }

    return (
      <span>
        No action available
      </span>
    );
  };

  if (loading) {
    return (
      <div className="product-page">
        <h1>Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-header">
        <div>
          <h1>Orders</h1>

          <p>
            Total orders: {orders.length}
          </p>
        </div>

        <button
          type="button"
          className="btn-edit"
          onClick={loadOrders}
        >
          Refresh
        </button>
      </div>

      {message && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #bbf7d0",
            backgroundColor: "#f0fdf4",
            color: "#166534",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #fecaca",
            backgroundColor: "#fef2f2",
            color: "#991b1b",
          }}
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={loadOrders}
            style={{ marginTop: "8px" }}
          >
            Try Again
          </button>
        </div>
      )}

      <input
        className="search-box"
        type="search"
        placeholder="Search order..."
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
      />

      <div
        style={{
          marginTop: "18px",
          overflowX: "auto",
        }}
      >
        <table className="product-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Received</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(
                (order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>
                        #{order.id}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {order.customerName}
                      </strong>

                      <div
                        style={{
                          marginTop: "4px",
                          color: "#667085",
                          fontSize: "12px",
                        }}
                      >
                        {order.customerEmail ||
                          "-"}
                      </div>
                    </td>

                    <td>
                      {order.customerPhone ||
                        "-"}
                    </td>

                    <td>
                      <div
                        style={{
                          minWidth: "160px",
                          maxWidth: "220px",
                          whiteSpace: "normal",
                        }}
                      >
                        {order.address || "-"}
                      </div>
                    </td>

                    <td>
                      {order.items.length > 0
                        ? order.items.reduce(
                            (
                              total,
                              item
                            ) =>
                              total +
                              Number(
                                item.quantity ||
                                  item.qty ||
                                  1
                              ),
                            0
                          )
                        : "-"}
                    </td>

                    <td>
                      <strong>
                        $
                        {Number(
                          order.total || 0
                        ).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <span
                        style={{
                          ...badgeStyle,
                          ...getPaymentStyle(
                            order.paymentStatus
                          ),
                        }}
                      >
                        {paymentStatusLabels[
                          order.paymentStatus
                        ] ||
                          order.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          ...badgeStyle,
                          ...getOrderStatusStyle(
                            order.orderStatus
                          ),
                        }}
                      >
                        {orderStatusLabels[
                          order.orderStatus
                        ] ||
                          order.orderStatus}
                      </span>
                    </td>

                    <td>
                      <div
                        style={{
                          minWidth: "130px",
                          fontSize: "12px",
                        }}
                      >
                        {formatDate(
                          order.createdAt
                        )}
                      </div>
                    </td>

                    <td>
                      <div
                        style={{
                          minWidth: "210px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                            marginBottom:
                              "6px",
                          }}
                        >
                          <button
                            type="button"
                            className="btn-view"
                            onClick={() =>
                              navigate(
                                `/orders/${order.id}`
                              )
                            }
                          >
                            View
                          </button>

                          {![
                            "DELIVERED",
                            "delivered",
                            "CANCELLED",
                            "cancelled",
                          ].includes(
                            order.orderStatus
                          ) && (
                            <button
                              type="button"
                              className="btn-delete"
                              disabled={
                                updatingId ===
                                order.id
                              }
                              onClick={() =>
                                cancelOrder(
                                  order
                                )
                              }
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                        {renderNextAction(
                          order
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    padding: "30px",
                    textAlign: "center",
                  }}
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderList;