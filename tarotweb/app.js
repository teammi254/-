import { major, minor } from './data.js';

// --- DOM Elements ---
const views = document.querySelectorAll(".view");

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

// Card Detail
const cardDetailView = document.getElementById("card-detail");
let previousView = 'landing'; // To track which view to go back to

// --- Data Preparation ---
const allCards = [
  ...major.map(c => ({ ...c, suit: 'major' })),
  ...Object.keys(minor).flatMap(suit =>
    minor[suit].map(c => ({ ...c, suit }))
  )
];

// --- Functions ---

function cardHTML(c, index = 0) { // เพิ่ม parameter 'index'
  return `
  <div class="tarot-card" data-card-name="${c.n}" style="animation-delay: ${index * 0.05}s;">
    <div class="card-image-wrap"><img src="${c.img}" alt="${c.n}" loading="lazy"></div>
    <div class="card-content">
      <h3 class="card-title">${c.n}</h3>
    </div>
  </div>`;
}

function renderCardDetail(card) {
  const meanings = [
    { title: "ความหมายทั่วไป (การงาน/ภาพรวม)", text: card.work },
    { title: "ความหมายด้านการเงิน", text: card.money },
    { title: "ความหมายด้านความรัก", text: card.love },
    { title: "ความหมายด้านสุขภาพ", text: card.health },
    { title: "ลักษณะเฉพาะ/บุคคล/สถานที่", text: card.special },
  ];

  cardDetailView.innerHTML = `
    <div class="detail-header">
      <span class="detail-header-badge">${card.n}</span>
    </div>
    <div class="detail-container">
      <div class="detail-left-col">
        <img src="${card.img}" alt="${card.n}" class="detail-card-image">
      </div>
      <div class="detail-right-col">
        ${meanings.map(meaning => `
          <div class="detail-meaning-box">
            <h3>${meaning.title}</h3>
            <p>${meaning.text}</p>
          </div>
        `).join('')}
      </div>
    </div>
    <div style="text-align: center;">
       <button class="back-btn" data-target="${previousView}">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
         ย้อนกลับ
       </button>
    </div>
  </div>`;
}

function renderSuit(suit) {
  minorGrid.innerHTML = minor[suit].map((c, i) => cardHTML(c, i)).join("");
}

function showView(id) {
  const currentActive = document.querySelector('.view.active');
  if (currentActive && id !== 'card-detail') previousView = currentActive.id;

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
    searchResultsGrid.innerHTML = results.map((c, i) => cardHTML(c, i)).join("");
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
  majorGrid.innerHTML = major.map((c, i) => cardHTML(c, i)).join("");
  // Set the default active tab for minor arcana
  const defaultSuitTab = suitTabsContainer.querySelector('[data-suit="pentacles"]');
  if (defaultSuitTab) defaultSuitTab.classList.add('active');
  renderSuit("pentacles"); // แสดงชุด Pentacles เป็นค่าเริ่มต้น

  // View navigation
  portalMajor.addEventListener('click', () => showView('major'));
  portalMinor.addEventListener('click', () => showView('minor'));

  // Back buttons (now using event delegation on the body)
  document.body.addEventListener('click', (e) => {
    if (e.target.matches('.back-btn')) {
      const targetView = e.target.dataset.target || 'landing';
      showView(targetView);
      if (targetView === 'landing') {
        searchInput.value = ""; // Clear search only when going to landing
      }
    }
  });


  // Suit tabs
  suitTabsContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.suit-tab');
    if (!tab) return;
    suitTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderSuit(tab.dataset.suit);
  });

  // Search functionality
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  // Card click to show detail view
  document.body.addEventListener('click', (e) => {
    const cardElement = e.target.closest('.tarot-card');
    if (!cardElement) return;

    const cardName = cardElement.dataset.cardName;
    const cardData = allCards.find(c => c.n === cardName);

    renderCardDetail(cardData);
    showView('card-detail');
  });
});