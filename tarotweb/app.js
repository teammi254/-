import { major, minor } from './data.js';

// --- DOM Elements ---
const views = document.querySelectorAll(".view"); // All sections that can be a "page"
const searchInput = document.getElementById("search-input"); // On tarot.html
const searchBtn = document.getElementById("search-btn"); // On tarot.html
const majorGrid = document.getElementById("major-grid"); // On tarot22.html
const minorGrid = document.getElementById("minor-grid"); // On tarot56.html
const suitTabsContainer = document.querySelector(".suit-tabs"); // On tarot56.html

// Card Detail
const cardDetailView = document.getElementById("card-detail");
let previousViewId = null; // To track which view to go back to

// --- Data Preparation ---
const allCards = [
  ...major.map(c => ({ ...c, suit: 'major' })),
  ...Object.keys(minor).flatMap(suit =>
    minor[suit].map(c => ({ ...c, suit }))
  )
];

// --- Functions ---

function resolveAssetUrl(path) {
  if (!path) return "";
  const basePrefix = window.location.pathname.includes("/datatarot/") ? "../" : "";
  return new URL(`${basePrefix}${path}`, window.location.href).href;
}

function cardHTML(c, index = 0) { // เพิ่ม parameter 'index'
  return `
  <div class="tarot-card" data-card-name="${c.n}" style="animation-delay: ${index * 0.05}s;">
    <div class="card-image-wrap"><img src="${resolveAssetUrl(c.img)}" alt="${c.n}" loading="lazy"></div>
    <div class="card-content">
      <h3 class="card-title">${c.n}</h3>
    </div>
  </div>`;
}

function renderCardDetail(card) {
  // Adjusted to show only the 3 main meanings as requested
  const meaningsToShow = [
    { title: "ความหมายทั่วไป", text: card.work },
    { title: "ความหมายความรัก", text: card.love },
    { title: "ความหมายการเงิน", text: card.money },
  ].filter(meaning => meaning.text); // Only show if text exists

  cardDetailView.innerHTML = `
    <div class="detail-header">
      <span class="detail-header-badge">ไพ่ใบนี้บอกว่า: ${card.n}</span>
    </div>
    <div class="detail-container">
      <div class="detail-left-col">
        <img src="${resolveAssetUrl(card.img)}" alt="${card.n}" class="detail-card-image">
      </div>
      <div class="detail-right-col">
        ${meaningsToShow.map(meaning => `
          <div class="detail-meaning-box">
            <h3>${meaning.title}</h3>
            <p>${meaning.text}</p>
          </div>
        `).join('')}
      </div>
    </div>
    <div style="text-align: center;">
       <button class="back-btn" data-target="${previousViewId}">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
         ย้อนกลับ
       </button>
    </div>
  </div>`;
}

function renderSuit(suit) {
  // Guard against trying to render on the wrong page
  if (!minorGrid) return;
  const suitData = minor[suit] || [];
  minorGrid.innerHTML = suitData.map((c, i) => cardHTML(c, i)).join("");
}

function showView(id) {
  // ค้นหา view ที่กำลังแสดงผลอยู่
  const currentActive = document.querySelector('.view.active');

  // --- นี่คือส่วนสำคัญของการ "ย้อนกลับ" ---
  // 1. ตรวจสอบว่า view ที่กำลังจะเปิดคือ 'card-detail' หรือไม่
  // 2. ถ้าใช่, ให้จำ ID ของ view ที่เปิดอยู่ก่อนหน้า (เช่น 'major' หรือ 'minor')
  //    เก็บไว้ในตัวแปร previousViewId
  if (currentActive && id === 'card-detail') {
    previousViewId = currentActive.id;
  }

  // ซ่อน view ทั้งหมด แล้วแสดงเฉพาะ view ที่มี id ตรงกับที่ระบุ
  views.forEach(v => v.classList.remove("active"));

  const targetView = document.getElementById(id);
  if (targetView) {
    targetView.classList.add("active");
  } else if (previousViewId) {
    const fallbackView = document.getElementById(previousViewId);
    if (fallbackView) fallbackView.classList.add("active");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function performSearch() {
  // Guard against running on pages without search input
  if (!searchInput) return;

  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword) return;

  const results = allCards.filter(card => {
    const cardContent = [card.n, card.work, card.money, card.love, card.health, card.special].join(' ').toLowerCase();
    return cardContent.includes(keyword);
  });

  const searchResultsGrid = document.getElementById("search-results-grid");
  const searchResultsDesc = document.getElementById("search-results-desc");

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

// --- Oracle Reading Functions ---

let currentOracleCategory = null; // Track current oracle category

function drawRandomCard(category) {
  const categoryMappings = {
    love: 'love',
    work: 'work',
    health: 'health'
  };

  const field = categoryMappings[category];
  if (!field) return null;

  // Filter cards that have the requested meaning
  const cardsWithMeaning = allCards.filter(card => card[field]);
  
  if (cardsWithMeaning.length === 0) return null;
  
  // Pick random card
  return cardsWithMeaning[Math.floor(Math.random() * cardsWithMeaning.length)];
}

function displayOracleResult(card, category) {
  const categoryNames = {
    love: '💕 ความรัก',
    work: '💼 การงาน',
    health: '🌿 สุขภาพ'
  };

  const categoryLabel = categoryNames[category] || category;
  const field = category;

  const cardDisplay = document.getElementById('oracle-card-display');
  const cardImage = document.getElementById('oracle-card-image');
  const cardName = document.getElementById('oracle-card-name');
  const cardMeaning = document.getElementById('oracle-card-meaning');
  const categoryDisplay = document.getElementById('oracle-result-category');
  const drawBtn = document.getElementById('draw-card-btn');

  // Update display
  categoryDisplay.textContent = `คำแนะนำสำหรับ ${categoryLabel}`;
  cardImage.src = resolveAssetUrl(card.img);
  cardImage.alt = card.n;
  cardName.textContent = `ไพ่: ${card.n}`;
  cardMeaning.textContent = card[field] || 'ไม่มีข้อมูล';

  cardDisplay.style.display = 'block';
  drawBtn.style.display = 'none';
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
  // --- Page-specific Initial Renders ---

  // If we are on the Major Arcana page
  if (majorGrid) {
    majorGrid.innerHTML = major.map((c, i) => cardHTML(c, i)).join("");
  }

  // If we are on the Minor Arcana page
  if (minorGrid && suitTabsContainer) {
    const defaultSuitTab = suitTabsContainer.querySelector('[data-suit="pentacles"]');
    if (defaultSuitTab) defaultSuitTab.classList.add('active');
    renderSuit("pentacles"); // Show Pentacles by default
  }

  // Oracle portal button
  const oraclePortal = document.getElementById('portal-oracle');
  if (oraclePortal) {
    oraclePortal.addEventListener('click', () => {
      showView('oracle');
    });
  }

  // Oracle category buttons
  document.querySelectorAll('.oracle-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentOracleCategory = btn.dataset.category;
      showView('oracle-result');
      
      // Reset draw button
      const drawBtn = document.getElementById('draw-card-btn');
      const cardDisplay = document.getElementById('oracle-card-display');
      if (drawBtn && cardDisplay) {
        drawBtn.style.display = 'block';
        cardDisplay.style.display = 'none';
      }
    });
  });

  // Draw card button
  const drawBtn = document.getElementById('draw-card-btn');
  if (drawBtn) {
    drawBtn.addEventListener('click', () => {
      if (!currentOracleCategory) return;
      const card = drawRandomCard(currentOracleCategory);
      if (card) {
        displayOracleResult(card, currentOracleCategory);
      }
    });
  }

  // Back buttons (now using event delegation on the body)
  document.body.addEventListener('click', (e) => {
    const backButton = e.target.closest('.back-btn');
    if (!backButton) return;

    // For card-detail view, use previousViewId fallback
    if (backButton.closest('#card-detail')) {
      const targetView = backButton.dataset.target || previousViewId;
      if (targetView) {
        showView(targetView);
      }
    } else {
      // For other views, use data-target attribute
      const targetView = backButton.dataset.target;
      if (targetView) {
        showView(targetView);
      }
    }
  });

  // Suit tabs
  if (suitTabsContainer) {
    suitTabsContainer.addEventListener('click', (e) => {
      const tab = e.target.closest('.suit-tab');
      if (!tab) return;
      // Remove active class from all tabs within this container
      suitTabsContainer.querySelectorAll('.suit-tab').forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderSuit(tab.dataset.suit);
    });
  }

  // Search functionality
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

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