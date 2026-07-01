"use client";

import { supabase } from "../../../lib/supabaseClient";
import { useEffect, useRef, useState } from "react";



import { useParams } from "next/navigation";

export default function ProductPage() {

  
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const addToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingIndex = cart.findIndex(
      (item: any) => item.id === product.id
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }

  localStorage.setItem("cart", JSON.stringify(cart));

  window.dispatchEvent(new Event("cartUpdated"));
};
  
  useEffect(() => {
  async function loadProduct() {
    console.log("Product ID:", id);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    console.log("Product data:", data);
    console.log("Product error:", error);

    setProduct(data);
  }

  loadProduct();
}, [id]);

  if (!product) {
    return (
      <h1 style={{ paddingTop: "120px", textAlign: "center" }}>
        Loading product...
      </h1>
    );
  }

  return (
    <main
      style={{
        paddingTop: "120px",
        backgroundColor: "rgba(73, 73, 73, 0.34)",
        minHeight: "100vh",
        fontFamily: "Georgia, serif",
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "40px",
        alignItems: "flex-start",
      }}
    >
      {/* LEFT SIDE IMAGES */}
      <div
        style={{
          flex: "1 1 450px",
          marginTop: "25px",
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          alignItems: "center",
          backgroundColor: "rgba(163, 226, 255, 0.34)",
          padding: "20px",
          borderRadius: "0px",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            maxWidth: "540px",
            height: "auto",
            objectFit: "cover",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.06)";
            e.currentTarget.style.boxShadow =
              "0 10px 25px rgba(255, 146, 146, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 5px 15px rgba(153, 135, 255, 0.1)";
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "40px",
            justifyContent: "center",
          }}
        >
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            maxWidth: "250px",
            height: "auto",
            cursor: "pointer",
            marginTop: "20px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow =
              "0 10px 25px rgba(255, 135, 135, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 5px 15px rgba(142, 122, 255, 0.1)";
          }}
        />

          <img
            src={product.image}
            alt={product.name}
            style={{
              width: "100%",
              maxWidth: "250px",
              height: "auto",
              cursor: "pointer",
              marginTop: "20px",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow =
              "0 10px 25px rgba(255, 135, 135, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 5px 15px rgba(133, 111, 255, 0.1)";
}}
          />
        </div>
      </div>

      {/* RIGHT SIDE CONTENT */}
      <div
        style={{
          width: "40%",
          minWidth: "300px",
          paddingLeft: "40px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
          {product.name}
        </h1>

        <p style={{ fontSize: "1.2rem", marginBottom: "20px", color: "#ffffff" }}>
          {product.description}
        </p>

        <h2 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>
          ${product.price}
        </h2>
        <button
          onClick={() => {
            addToCart(product);
            alert(`${product.name} added to cart`);
          }}
          style={{
            marginTop: "20px",
            padding: "15px 30px",
            backgroundColor: "#111",
            color: "white",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#111";
          }}
        >
          Add to Cart
          
        </button>

      </div>
    </main>
  );
}