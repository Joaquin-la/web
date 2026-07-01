"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function CategoryPage() {
  const params = useParams();
  const id = params.id as string;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [background, setBackground] = useState<string>("");

  useEffect(() => {
    async function loadProducts() {
      console.log("Category ID:", id);

      setLoading(true);

      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("name, background")
        .eq("id", id)
        .single();

      if (categoryError) {
        console.error("Category error:", categoryError);
      }

      if (categoryData) {
        setCategoryName(categoryData.name);
        setBackground(categoryData.background);
      }

      //Get products for category
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", id);

      console.log("Products:", productData);
      console.log("Product Error:", productError);

      if (productError) {
        console.error("Product error:", productError);
      }

      setProducts(productData || []);
      setLoading(false);
    }

    if (id) {
      loadProducts();
    }
  }, [id]);

  return (
    <main
      style={{
        paddingTop: "120px",
        minHeight: "100vh",
        backgroundColor: "white",
        backgroundImage: background ? `url(${background})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          fontWeight: "bold",
          marginBottom: "2rem",
          color: "white",
          fontFamily: "Georgia, serif",
        }}
      >
        {categoryName || "---"} products
      </h1>

      {loading && (
        <h2 style={{ fontFamily: "Georgia, serif", color: "white" }}>
          Loading products...
        </h2>
      )}

      {!loading && products.length === 0 && (
        <h2 style={{ fontFamily: "Georgia, serif", color: "white" }}>
          No products found.
        </h2>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "15px",
                boxShadow: "0 5px 15px rgba(38, 0, 255, 0.1)",
                textAlign: "center",
                color: "black",
                fontFamily: "Georgia, serif",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px rgba(255, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 5px 15px rgba(38, 0, 255, 0.1)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              </div>

              <h2 style={{ marginTop: "1rem" }}>{p.name}</h2>

              <p
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                ${p.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}