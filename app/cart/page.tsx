"use client";
import { useEffect, useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);

  const increaseQuantity = (index: number) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity += 1;

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const decreaseQuantity = (index: number) => {
    const updatedCart = [...cart];

    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
    } else {
      updatedCart.splice(index, 1);
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeFromCart = (indexToRemove: number) => {
    const updatedCart = cart.filter((_, index) => index !== indexToRemove);

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // ✅ total must be ABOVE useEffect
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

    useEffect(() => {
      const renderPayPal = () => {
        const paypal = (window as any).paypal;
        const container = document.getElementById("paypal-container");

        if (!paypal || !container) return;

        container.innerHTML = "";

        paypal.Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
          },

          createOrder: (_: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: total.toFixed(2),
                  },
                },
              ],
            });
          },

          onApprove: async (_: any, actions: any) => {
            const order = await actions.order.capture();
            console.log("Payment success:", order);
            alert("Payment successful!");
          },

          onError: (err: any) => {
            console.error("PayPal error:", err);
          },
        }).render("#paypal-container");
      };

      // small delay ensures script is ready
      const timeout = setTimeout(renderPayPal, 300);

      return () => clearTimeout(timeout);
    }, [total]); // rerender PayPal when total changes

  return (
    <main
      style={{
        paddingTop: "120px",
        minHeight: "100vh",
        backgroundColor: "#111",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <h1>Your Cart</h1>

      <div style={{ width: "80%", maxWidth: "800px" }}>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cart.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#222",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "10px",
              }}
            >
              <img
                src={item.image}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />

              <div style={{ flex: 1, marginLeft: "15px" }}>
                <h3 style={{ margin: 0 }}>{item.name}</h3>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => decreaseQuantity(index)}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      background: "#444",
                      color: "white",
                      fontSize: "18px",
                    }}
                  >
                    -
                  </button>

                  <span style={{ color: "#aaa" }}>{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(index)}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      background: "#444",
                      color: "white",
                      fontSize: "18px",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <p style={{ margin: 0 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>

                <button
                  onClick={() => removeFromCart(index)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "22px",
                    color: "#ff4d4d",
                  }}
                  title="Remove item"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}

        <h2>Total: ${total.toFixed(2)}</h2>

      
        <div style={{ marginTop: "20px", marginLeft: "20px" }} id="paypal-container" />
      </div>
    </main>
  );
}
