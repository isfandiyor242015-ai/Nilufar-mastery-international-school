// Nilufar Teacher's Tools — Supabase connection
// Replace BOTH placeholders below with your own Project URL and Publishable key.
// Never put a Supabase Secret key or service_role key in this file.
const SUPABASE_URL = "https://brztnafjpyilsiijnhjl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyenRuYWZqcHlpbHNpaWpuaGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0NTIwNzcsImV4cCI6MjEwOTAyODA3N30.-W148061Fde_mimqPZsBM5Xgw0RH1mzzTU3FMhLDvFw        ";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
window.db = db;

let currentCategory = "All";
let currentSearch = "";

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function safeHttpUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

async function getMaterials() {
  const { data, error } = await db
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function renderMaterials() {
  const grid = document.getElementById("materialsGrid");
  if (!grid) return;

  grid.innerHTML = '<p class="empty">Loading materials...</p>';
  try {
    const materials = await getMaterials();
    const searchText = currentSearch.toLowerCase();
    const filtered = materials.filter(item => {
      const matchesCategory = currentCategory === "All" || item.category === currentCategory;
      const matchesSearch =
        String(item.title || "").toLowerCase().includes(searchText) ||
        String(item.description || "").toLowerCase().includes(searchText) ||
        String(item.category || "").toLowerCase().includes(searchText);
      return matchesCategory && matchesSearch;
    });

    if (!filtered.length) {
      grid.innerHTML = '<p class="empty">No materials found. Try another search.</p>';
      return;
    }

    grid.innerHTML = filtered.map(item => `
      <article class="card">
        <div class="card-icon">${escapeHTML(item.icon || "📚")}</div>
        <h3>${escapeHTML(item.title)}</h3>
        <span class="card-category">${escapeHTML(item.category)}</span>
        <p>${escapeHTML(item.description)}</p>
        <a class="card-link" href="material.html?id=${encodeURIComponent(item.id)}">Explore Material →</a>
      </article>
    `).join("");
  } catch (error) {
    console.error(error);
    grid.innerHTML = '<p class="empty">Could not load materials. Please check the Supabase connection and table permissions.</p>';
  }
}

function filterCategory(category, button) {
  currentCategory = category;
  document.querySelectorAll(".category").forEach(item => item.classList.remove("active"));
  if (button) button.classList.add("active");
  renderMaterials();
}

function searchMaterials() {
  const input = document.getElementById("searchInput");
  currentSearch = input ? input.value.trim() : "";
  renderMaterials();
}

document.addEventListener("DOMContentLoaded", () => {
  renderMaterials();
  const search = document.getElementById("searchInput");
  if (search) search.addEventListener("input", searchMaterials);
});
