"use client";
import { useEffect, useState } from "react";
declare const google: any;

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [addressValid, setAddressValid] = useState(false);
  
  
  const [shipping, setShipping] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "USA",
  });
  const US_STATES = [
 "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"
];

  const fieldLabels: Record<string, string> = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    address: "Address",
    city: "City",
    state: "State",
    zip: "ZIP Code",
    country: "Country",
  };

  const validateShipping = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!shipping.firstName.trim()) return "First name is required";
    if (!shipping.lastName.trim()) return "Last name is required";
    if (!shipping.address.trim()) return "Address is required";
    if (!shipping.city.trim()) return "City is required";
    if (!shipping.state.trim()) return "State is required";
    if (!shipping.zip.trim()) return "ZIP is required";
    if (!emailRegex.test(shipping.email)) return "Invalid email";

    if (!addressValid)
    return "Please select a valid address from the Google suggestions.";

return null;

    return null;
  };

  const updateCart = (updatedCart: any[]) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQuantity = (index: number) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity += 1;
    updateCart(updatedCart);
  };

  const decreaseQuantity = (index: number) => {
    const updatedCart = [...cart];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
    } else {
      updatedCart.splice(index, 1);
    }
    updateCart(updatedCart);
  };

  const removeFromCart = (indexToRemove: number) => {
    const updatedCart = cart.filter((_, index) => index !== indexToRemove);
    updateCart(updatedCart);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  useEffect(() => {
  const script = document.createElement("script");

  script.src =
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyAZSTSYX6r5SSQ2uRKjil8uLUuzeLHPKNI&libraries=places";

  script.async = true;

  script.onload = () => {
    const input = document.getElementById(
      "address-input"
    ) as HTMLInputElement;

    if (!input) return;

    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: [
        "formatted_address",
        "address_components",
        "geometry",
        "place_id",
      ],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.place_id) {
        setAddressValid(false);
        return;
      }

      const components: Record<string, string> = {};

    (place.address_components || []).forEach((component: any) => {
      component.types.forEach((type: string) => {
        components[type] = component.long_name;
      });
    });

      setShipping((prev) => ({
        ...prev,
        address: place.formatted_address || "",
        city: components.locality || "",
        state: components.administrative_area_level_1 || "",
        zip: components.postal_code || "",
        country: components.country || "USA",
      }));

      setAddressValid(true);
    });
  };

  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  useEffect(() => {
    if (step !== "payment") return;

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

        createOrder: async () => {
          const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart }),
          });

          const data = await res.json();
          return data.orderID;
        },

        onApprove: async (data: any) => {
          const res = await fetch("/api/orders", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderID: data.orderID,
              cart,
              shipping,
            }),
          });

          const result = await res.json();

          console.log(result);

          if (!res.ok) {
            alert(result.error || "Failed to save order");
            return;
          }

          alert("Payment successful!");
        }
      }).render("#paypal-container");
    };

    const timeout = setTimeout(renderPayPal, 300);
    return () => clearTimeout(timeout);
  }, [step, cart]);

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
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}

        <h2>Total: ${total.toFixed(2)}</h2>

        {step === "shipping" && (
          <div
            style={{
              background: "#1c1c1c",
              padding: 20,
              borderRadius: 10,
              marginTop: 20,
            }}
          >
            <h2>Shipping Information</h2>

            {Object.keys(shipping).map((key) => {
            if (key === "state" || key === "country") return null;

            return (
              <input
              key={key}
              id={key === "address" ? "address-input" : undefined}
              placeholder={fieldLabels[key]}
              value={(shipping as any)[key]}
              onChange={(e) => {
                if (key === "address") {
                  setAddressValid(false);
                }

                setShipping({
                  ...shipping,
                  [key]: e.target.value,
                });
              }}
              style={{
                display: "block",
                width: "100%",
                marginBottom: 10,
                padding: 10,
              }}
            />
            );
          })}
          <select
            value={shipping.state}
            onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 10,
              padding: 10,
            }}
          >
            <option value="">Select State
              
            </option>
            {US_STATES.map((state) => (
              <option key={state} value={state}
              style={{
                background: "#929292",
                color: "black",}}>
                {state}
              </option>
            ))}
          </select>

          <select
            value={shipping.country}
            onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
            style={{
              backgroundColor: "#1c1c1c",
              color: "white",
              border: "1px solid #555",
              padding: 10,
              width: "100%",
              marginBottom: 10,
              borderRadius: 6,
            }}
          >
            <option
              value="USA"
              style={{
                backgroundColor: "#1c1c1c",
                color: "white",
              }}
            >
              United States
            </option>
          </select>



            <button
            style={{
              padding: "10px 20px",
              background: "#0070f3",
              cursor: "pointer",
              color: "white",
              border: "none",}}
              onClick={() => {
                const error = validateShipping();
                if (error) {
                  alert(error);
                  return;
                }
                setStep("payment");
              }}
            >
              Continue to Payment
            </button>
          </div>
        )}

{step === "payment" && (
  <div style={{ marginTop: 20 }}>
    <h2>Payment</h2>

    <div
      style={{
        background: "#222",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
      }}
    >
      <p>
        {shipping.firstName} {shipping.lastName}
      </p>

      <p>{shipping.address}</p>

      <p>
        {shipping.city},{" "}
        <select
          value={shipping.state}
          onChange={(e) =>
            setShipping({ ...shipping, state: e.target.value })
          }
          style={{
            background: "transparent",
            color: "white",
            border: "1px solid #555",
            padding: "4px",
            borderRadius: "4px",
            marginLeft: "6px",
          }}
        >
          <option value="">State</option>
          {US_STATES.map((state) => (
            <option key={state} value={state} style={{
              background: "#929292",
              color: "black",}}>
              {state}
            </option>
          ))}
        </select>{" "}
        {shipping.zip}
      </p>

      <p>
        <select
          value={shipping.country}
          onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
          style={{
            backgroundColor: "#1c1c1c",
            color: "white",
            border: "1px solid #555",
            padding: 10,
            width: "100%",
            marginBottom: 10,
            borderRadius: 6,
          }}
        >
          <option
            value=""
            style={{
              backgroundColor: "#1c1c1c",
              color: "white",
            }}
          >
            Country
          </option>

          <option
            value="USA"
            style={{
              backgroundColor: "#5a5a5a",
              color: "black",
            }}
          >
            United States
          </option>
        </select>
      </p>

      <p>{shipping.email}</p>
    </div>

    <div id="paypal-container" />
  </div>
)}
      </div>
    </main>
  );
}
