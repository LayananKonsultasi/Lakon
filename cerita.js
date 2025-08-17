const API_URL =
  "https://script.google.com/macros/s/AKfycbxxnmkxfU-QFuKLHHYqdQo1sP-g5lj_TxK8Cw5oQNL-kd-Xy9Hz6ekuBEUeW9cZu8q8AQ/exec";

const daftarCerita = document.getElementById("daftar-cerita");
const searchInput = document.getElementById("search");
const statusCheckboxes = document.querySelectorAll(".status-checkbox");
const wilayahCheckboxes = document.querySelectorAll(".wilayah-checkbox");

let semuaCerita = [];

// Pagination & sort state
let currentPage = 1;
const PER_PAGE = 10;
let sortNewest = true;

// Helper container IDs
const CONTROLS_CONTAINER_ID = "cerita-controls-container";
const PAGINATION_CONTAINER_ID = "cerita-pagination-container";
const SORT_BUTTON_ID = "cerita-sort-toggle-top";

// Tombol sortir diposisikan langsung di atas daftar card cerita
function createTopSortButton() {
  if (document.getElementById(SORT_BUTTON_ID)) return;

  // Cari container daftar cerita
  const daftarCeritaContainer = document.getElementById("daftar-cerita");
  if (!daftarCeritaContainer) return;

  // Buat wrapper tombol sortir dengan margin bawah agar tidak terlalu rapat
  const wrapper = document.createElement("div");
  wrapper.id = "cerita-sort-wrapper";
  wrapper.className = "mb-3 d-flex justify-content-end";

  const btn = document.createElement("button");
  btn.id = SORT_BUTTON_ID;
  btn.type = "button";
  btn.className = "btn btn-sm btn-outline-primary d-flex align-items-center";
  btn.title = "Urutkan cerita";
  btn.innerHTML = sortNewest
    ? '<i class="bi bi-sort-down"></i> <span class="ms-1">Terbaru</span>'
    : '<i class="bi bi-sort-up"></i> <span class="ms-1">Terlama</span>';

  btn.onclick = () => {
    sortNewest = !sortNewest;
    currentPage = 1;
    updateTopSortIcon();
    tampilkanCerita();
    btn.blur();
  };

  wrapper.appendChild(btn);

  // Sisipkan tombol tepat sebelum daftar cerita
  daftarCeritaContainer.insertAdjacentElement("beforebegin", wrapper);
}

// Update icon dan label tombol sortir
function updateTopSortIcon() {
  const btn = document.getElementById(SORT_BUTTON_ID);
  if (!btn) return;
  btn.innerHTML = sortNewest
    ? '<i class="bi bi-sort-down"></i> <span class="ms-1">Terbaru</span>'
    : '<i class="bi bi-sort-up"></i> <span class="ms-1">Terlama</span>';
}

// Ambil data dari API
window.addEventListener("load", () => {
  createTopSortButton();
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      semuaCerita = Array.isArray(data) ? data.reverse() : [];
      tampilkanCerita();
    })
    .catch((err) => console.error("Gagal mengambil data:", err))
    .finally(() => {
      const loader = document.getElementById("loader");
      if (loader) loader.classList.add("hidden");
      document.body.classList.remove("loading");
      const mainContent = document.getElementById("main-content");
      if (mainContent) mainContent.classList.add("visible");
    });
});

// Fungsi utama menampilkan daftar cerita
function tampilkanCerita() {
  daftarCerita.innerHTML = "";

  const searchTermRaw =
    searchInput && searchInput.value
      ? searchInput.value.trim().toLowerCase()
      : "";
  let searchMode = "all";
  let searchTerm = searchTermRaw;

  if (searchTermRaw.startsWith("nama:")) {
    searchMode = "nama";
    searchTerm = searchTermRaw.replace(/^nama:/, "").trim();
  } else if (searchTermRaw.startsWith("cerita:")) {
    searchMode = "cerita";
    searchTerm = searchTermRaw.replace(/^cerita:/, "").trim();
  }

  const selectedWilayah = Array.from(wilayahCheckboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  const selectedStatus = Array.from(statusCheckboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  const hasil = semuaCerita.filter(
    ({ nama = "", wilayah = "", cerita = "", komentar = "" }) => {
      const namaLow = String(nama).toLowerCase();
      const wilayahLow = String(wilayah).toLowerCase();
      const ceritaLow = String(cerita).toLowerCase();
      const komentarLow = String(komentar).toLowerCase();

      let cocokSearch = false;
      if (searchMode === "nama") {
        cocokSearch = namaLow.includes(searchTerm);
      } else if (searchMode === "cerita") {
        cocokSearch = ceritaLow.includes(searchTerm);
      } else {
        cocokSearch =
          namaLow.includes(searchTerm) ||
          wilayahLow.includes(searchTerm) ||
          ceritaLow.includes(searchTerm);
      }

      const cocokWilayah =
        selectedWilayah.length === 0 || selectedWilayah.includes(wilayah);

      const isSudah = komentarLow.trim() !== "";
      const cocokStatus =
        selectedStatus.length === 0 ||
        (isSudah && selectedStatus.includes("sudah")) ||
        (!isSudah && selectedStatus.includes("belum"));

      return cocokSearch && cocokWilayah && cocokStatus;
    }
  );

  if (!hasil || hasil.length === 0) {
    daftarCerita.innerHTML = `
      <div class="text-center text-muted mt-5">
        <p>Tidak ada cerita yang cocok dengan pencarian atau filter.</p>
      </div>`;
    removeControls();
    return;
  }

  const hasilSorted = sortNewest ? [...hasil] : [...hasil].reverse();

  const totalItems = hasilSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * PER_PAGE;
  const pageItems = hasilSorted.slice(startIndex, startIndex + PER_PAGE);

  pageItems.forEach(({ nama, wilayah, cerita, komentar, konselor }) => {
    const ulasanBox = document.createElement("div");
    ulasanBox.className = "p-4 mb-4 bg-light rounded-3";

    const header = document.createElement("div");
    header.className = "d-flex justify-content-between align-items-center mb-1";

    const namaEl = document.createElement("p");
    namaEl.className = "fw-semibold fs-6 mb-1";
    namaEl.textContent = `${nama} (${wilayah})`;

    const statusBadge = document.createElement("span");
    statusBadge.className = "badge px-2 py-2 small bg-white";
    statusBadge.style.fontSize = "13px";

    if (komentar && komentar.trim() !== "") {
      statusBadge.classList.add("border", "border-success", "text-success");
      statusBadge.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> Sudah dibalas`;
    } else {
      statusBadge.classList.add("border", "border-secondary", "text-secondary");
      statusBadge.innerHTML = `<i class="bi bi-clock-fill me-1"></i> Belum dibalas`;
    }

    header.appendChild(namaEl);
    header.appendChild(statusBadge);
    ulasanBox.appendChild(header);

    const ceritaEl = document.createElement("p");
    ceritaEl.className =
      komentar && komentar.trim() !== ""
        ? "text-muted mb-3"
        : "text-muted mb-0";
    ceritaEl.style.lineHeight = "1.6";
    ceritaEl.textContent = cerita;
    ulasanBox.appendChild(ceritaEl);

    if (komentar && komentar.trim() !== "") {
      const komentarBox = document.createElement("div");
      komentarBox.className = "d-flex mt-3";

      const foto = document.createElement("img");
      foto.src = `assets/img/photo/${(konselor || "")}.jpg`;
      foto.alt = konselor || "";
      foto.className = "rounded-circle me-3";
      foto.style.width = "38px";
      foto.style.height = "38px";
      foto.style.cursor = "pointer";
      foto.onclick = () => bukaPopupKonselor(konselor);

      const komentarText = document.createElement("div");
      komentarText.innerHTML = `
      <p class="fw-semibold fs-6 mb-1">${konselor}</p>
      <p class="text-muted mb-0" style="line-height: 1.6">${komentar}</p>
    `;

      komentarBox.appendChild(foto);
      komentarBox.appendChild(komentarText);
      ulasanBox.appendChild(komentarBox);
    }

    daftarCerita.appendChild(ulasanBox);
  });

  renderControls(totalPages);
  updateTopSortIcon();
}

// Render pagination controls
function renderControls(totalPages) {
  let controlsContainer = document.getElementById(CONTROLS_CONTAINER_ID);
  if (!controlsContainer) {
    controlsContainer = document.createElement("div");
    controlsContainer.id = CONTROLS_CONTAINER_ID;
    controlsContainer.className = "mt-3 d-flex flex-column align-items-center";
    daftarCerita.insertAdjacentElement("afterend", controlsContainer);
  }
  controlsContainer.innerHTML = "";

  let paginationContainer = document.getElementById(PAGINATION_CONTAINER_ID);
  if (!paginationContainer) {
    paginationContainer = document.createElement("div");
    paginationContainer.id = PAGINATION_CONTAINER_ID;
    paginationContainer.className =
      "d-flex gap-2 align-items-center mt-2 flex-wrap";
    controlsContainer.appendChild(paginationContainer);
  }
  paginationContainer.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "btn btn-sm btn-outline-secondary";
  prevBtn.textContent = "Prev";
  prevBtn.disabled = currentPage <= 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      tampilkanCerita();
    }
  };
  paginationContainer.appendChild(prevBtn);

  const MAX_BUTTONS = 7;
  const totalPagesNum = totalPages;
  let start = 1;
  let end = totalPagesNum;
  if (totalPagesNum > MAX_BUTTONS) {
    if (currentPage <= 4) {
      start = 1;
      end = MAX_BUTTONS;
    } else if (currentPage + 3 >= totalPagesNum) {
      start = totalPagesNum - (MAX_BUTTONS - 1);
      end = totalPagesNum;
    } else {
      start = currentPage - 3;
      end = currentPage + 3;
    }
  }

  if (start > 1) {
    const firstBtn = createPageButton(1);
    paginationContainer.appendChild(firstBtn);
    if (start > 2) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.className = "mx-1 text-muted";
      paginationContainer.appendChild(dots);
    }
  }

  for (let i = start; i <= end; i++) {
    const btn = createPageButton(i);
    paginationContainer.appendChild(btn);
  }

  if (end < totalPagesNum) {
    if (end < totalPagesNum - 1) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.className = "mx-1 text-muted";
      paginationContainer.appendChild(dots);
    }
    const lastBtn = createPageButton(totalPagesNum);
    paginationContainer.appendChild(lastBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "btn btn-sm btn-outline-secondary";
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage >= totalPagesNum;
  nextBtn.onclick = () => {
    if (currentPage < totalPagesNum) {
      currentPage++;
      tampilkanCerita();
    }
  };
  paginationContainer.appendChild(nextBtn);

  const info = document.createElement("div");
  info.className = "text-muted small ms-3";
  info.style.marginTop = "6px";
  info.textContent = `Halaman ${currentPage} dari ${totalPagesNum}`;
  controlsContainer.appendChild(info);

  function createPageButton(pageNum) {
    const b = document.createElement("button");
    b.type = "button";
    b.className =
      "btn btn-sm " +
      (pageNum === currentPage ? "btn-primary" : "btn-outline-primary");
    b.textContent = pageNum;
    b.onclick = () => {
      currentPage = pageNum;
      tampilkanCerita();
    };
    return b;
  }
}

function removeControls() {
  const controls = document.getElementById(CONTROLS_CONTAINER_ID);
  if (controls) controls.remove();
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    tampilkanCerita();
  });
}
statusCheckboxes.forEach((cb) =>
  cb.addEventListener("change", () => {
    currentPage = 1;
    tampilkanCerita();
  })
);
wilayahCheckboxes.forEach((cb) =>
  cb.addEventListener("change", () => {
    currentPage = 1;
    tampilkanCerita();
  })
);

function bukaPopupKonselor(nama) {
  const popup = document.getElementById("konselor-popup");
  const foto = document.getElementById("popup-foto-konselor");
  const namaKonselor = document.getElementById("popup-nama-konselor");
  const btnProfile = document.getElementById("btn-kunjungi-profile");

  if (foto) foto.src = `assets/img/photo/${(nama || "").toLowerCase()}.jpg`;
  if (namaKonselor) namaKonselor.textContent = nama || "";
  if (btnProfile)
    btnProfile.href = `profile/${(nama || "").toLowerCase()}.html`;

  if (popup) popup.classList.add("show");
}

