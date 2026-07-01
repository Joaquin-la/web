"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";


export default function Navbar() {

  const [cartCount, setCartCount] = useState(0);
    useEffect(() => {
      async function loadCategories() {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("created_at", { ascending: true });

        console.log("categories:", data);
        console.log("error:", error);

        setCategories(data || []);
      }

      loadCategories();
    }, []);
      

    useEffect(() => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    }, []);
    
  const [categories, setCategories] = useState<any[]>([]);
  
  useEffect(() => {
  const updateCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(
      cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
    );
  };

  // initial load
  updateCart();

  // listen for other tabs
  window.addEventListener("storage", updateCart);

  // listen for same-tab updates (custom event)
  window.addEventListener("cartUpdated", updateCart);

  return () => {
    window.removeEventListener("storage", updateCart);
    window.removeEventListener("cartUpdated", updateCart);
  };
}, []);

  return (
    <nav
    style={{
      width: "100%",
      padding: "15px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "#000000",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1000,
    }}
    >
        <button
          onClick={() => (window.location.href = "/login")}
          style={{
            position: "absolute",
            right: "20px",
            padding: "8px 14px",
            background: "black",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "-6px"
          }}
        >
          Login
        </button>
          <Link
            href="/cart"
            style={{
              position: "absolute",
              right: "20px",
              padding: "8px 14px",
              background: "black",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "-6px",
              textDecoration: "none",
              transition: "0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "black";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "black";
              e.currentTarget.style.color = "white";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            🛒 Cart -{cartCount}-
          </Link>
        <div      
        style={{
        display: "flex",
        gap: "30px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}>

      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/category/${cat.id}`}
          style={{
            padding: "4px 10px",
            fontSize: "1.2rem",
            color: "white",
            fontWeight: "bold",
            fontFamily: "Georgia, serif",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: "pointer",
      }}
          onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.1)";
      e.currentTarget.style.backgroundColor= "white"
      e.currentTarget.style.color = "black";
              }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow =
          "0 5px 15px #000000";
        e.currentTarget.style.backgroundColor= "black"
        e.currentTarget.style.color = "white";
      }}
        >
          {cat.name}
        </Link>
      ))} 
       </div>
      <Link
      href="/"
      style={{
        color: "white",
        padding: "2px 3px",
        marginTop: "10px",
        fontWeight: "bold",
        fontSize: "1.5rem",
        fontFamily: "Georgia, serif",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
      }}
          onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.1)";
      e.currentTarget.style.backgroundColor= "white"
      e.currentTarget.style.color = "black";
              }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow =
          "0 5px 15px #000000";
        e.currentTarget.style.backgroundColor= "black"
        e.currentTarget.style.color = "white";
      }}
    >
      Home
    </Link>
    </nav>
  );
}