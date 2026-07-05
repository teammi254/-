import { WIKI, major, minor } from './data.js';

// --- DOM Elements ---
const views = document.querySelectorAll(".view");
const backButtons = document.querySelectorAll(".back-btn");

// Landing
const portalMajor = document.getElementById("portal-major");
const portalMinor = document.getElementById("portal-minor");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

// Major Arcana
const majorGrid = document.getElementById("major-grid");

// Minor Arcana
const minorGrid = document.getElementById("minor-grid");
const suitTabsContainer = document.querySelector(".suit-tabs");
const suitTabs = document.querySelectorAll(".suit-tab");

// Search
const searchResultsGrid = document.getElementById("search-results-grid");
const searchResultsDesc = document.getElementById("search-results-desc");

// --- Data Preparation ---
const allCards = [
  ...major.map(c => ({ ...c, suit: 'major' })),
  ...Object.keys(minor).flatMap(suit =>
    minor[suit].map(c => ({ ...c, suit }))
  )
];

// --- Functions ---

function cardHTML(c, suitClass) {
  return `
  <div class="tarot-card ${suitClass || ""}">
    <div class="card-image-wrap"><img src="${WIKI(c.img)}" alt="${c.n}" loading="lazy"></div>
    <div class="card-content">
      <h3 class="card-title">${c.n}</h3>
      <ul class="card-details">
        <li><strong>การงาน:</strong> ${c.work}</li>
        <li><strong>การเงิน:</strong> ${c.money}</li>
        <li><strong>ความรัก:</strong> ${c.love}</li>
        <li><strong>สุขภาพ:</strong> ${c.health}</li>
        <li><strong>ความหมายเฉพาะ:</strong> ${c.special}</li>
      </ul>
    </div>
  </div>`;
}

function getSuitClass(card) {
  if (card.suit === 'major') return "";
  return `suit-accent-${card.suit}`;
}

function renderSuit(suit) {
  minorGrid.innerHTML = minor[suit].map(c => cardHTML(c, getSuitClass(c))).join("");
}

function showSuit(suit) {
  suitTabs.forEach(t => t.classList.toggle("active", t.dataset.suit === suit));
  renderSuit(suit);
  minorGrid.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showView(id) {
  views.forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function performSearch() {
  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword) return;

  const results = allCards.filter(card => {
    const cardContent = [card.n, card.work, card.money, card.love, card.health, card.special].join(' ').toLowerCase();
    return cardContent.includes(keyword);
  });

  showView('search-results');

  if (results.length > 0) {
    searchResultsDesc.innerHTML = `พบ ${results.length} ใบที่ตรงกับคำว่า "<strong>${keyword}</strong>"`;
    searchResultsGrid.innerHTML = results.map(c => cardHTML(c, getSuitClass(c))).join("");
  } else {
    searchResultsDesc.innerHTML = `ไม่พบไพ่ที่ตรงกับคำว่า "<strong>${keyword}</strong>"`;
    searchResultsGrid.innerHTML = `
      <div style="text-align: center; grid-column: 1 / -1; background: var(--panel); padding: 2rem; border-radius: 16px; border: 1px solid var(--line);">
        <p style="margin-top:0;">ลองใช้คีย์เวิร์ดอื่น หรือค้นหาความหมายเพิ่มเติมบน Google</p>
        <a href="https://www.google.com/search?q=ความหมายไพ่ทาโรต์+${encodeURIComponent(keyword)}" target="_blank" rel="noopener noreferrer" class="back-btn" style="text-decoration:none; display:inline-flex;">
          ค้นหา "${keyword}" บน Google
        </a>
      </div>
    `;
  }
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
  // Initial Renders
  majorGrid.innerHTML = major.map(c => cardHTML(c, getSuitClass(c))).join("");
  renderSuit("wands");

  // View navigation
  portalMajor.addEventListener('click', () => showView('major'));
  portalMinor.addEventListener('click', () => showView('minor'));
  backButtons.forEach(btn => btn.addEventListener('click', () => {
    showView('landing');
    searchInput.value = ""; // Clear search input when going back
  }));

  // Suit tabs
  suitTabsContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.suit-tab');
    if (tab) showSuit(tab.dataset.suit);
  });

  // Search functionality
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') performSearch();
  });
});