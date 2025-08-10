const API_URL =
  "https://script.google.com/macros/s/AKfycbxxnmkxfU-QFuKLHHYqdQo1sP-g5lj_TxK8Cw5oQNL-kd-Xy9Hz6ekuBEUeW9cZu8q8AQ/exec";

const daftarCerita = document.getElementById("daftar-cerita");
const searchInput = document.getElementById("search");
const statusCheckboxes = document.querySelectorAll(".status-checkbox");
const wilayahCheckboxes = document.querySelectorAll(".wilayah-checkbox");

// Hilangkan tombol clear-search jika ada
const clearSearchButton = document.getElementById("clear-search");
if (clearSearchButton) {
  clearSearchButton.remove();
}

let semuaCerita = [];

// Ambil data dari API
window.addEventListener("load", () => {
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      semuaCerita = data.reverse();
      tampilkanCerita();
    })
    .catch((err) => console.error("Gagal mengambil data:", err))
    .finally(() => {
      document.getElementById("loader").classList.add("hidden");
      document.body.classList.remove("loading");
      document.getElementById("main-content").classList.add("visible");
    });
});

// Tampilkan daftar cerita
function tampilkanCerita() {
  daftarCerita.innerHTML = "";

  const searchTerm = searchInput.value.toLowerCase();
  const selectedWilayah = Array.from(wilayahCheckboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);
  const selectedStatus = Array.from(statusCheckboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  const hasil = semuaCerita.filter(
    ({ nama = "", wilayah = "", cerita = "", komentar = "" }) => {
      const cocokSearch =
        nama.toLowerCase().includes(searchTerm) ||
        wilayah.toLowerCase().includes(searchTerm) ||
        cerita.toLowerCase().includes(searchTerm);

      const cocokWilayah =
        selectedWilayah.length === 0 || selectedWilayah.includes(wilayah);

      const isSudah = komentar.trim() !== "";
      const cocokStatus =
        selectedStatus.length === 0 ||
        (isSudah && selectedStatus.includes("sudah")) ||
        (!isSudah && selectedStatus.includes("belum"));

      return cocokSearch && cocokWilayah && cocokStatus;
    }
  );

  if (hasil.length === 0) {
    daftarCerita.innerHTML = `
      <div class="text-center text-muted mt-5">
        <p>Tidak ada cerita yang cocok dengan pencarian atau filter.</p>
      </div>`;
    return;
  }

  hasil.forEach(({ nama, wilayah, cerita, komentar, konselor }) => {
    const card = document.createElement("div");
    card.className = "card mb-4";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const header = document.createElement("h5");
    header.className = "card-title fw-bold mb-2";
    header.textContent = `${nama} (${wilayah})`;

    const isi = document.createElement("p");
    isi.className = "card-text";
    isi.textContent = cerita;

    const status = document.createElement("span");
    status.className = "badge rounded-pill mt-3";

    cardBody.appendChild(header);
    cardBody.appendChild(isi);

    if (komentar && komentar.trim() !== "") {
      status.textContent = "✅ Sudah dikomentari";
      status.classList.add("bg-success", "text-white");

      const komentarBox = document.createElement("div");
      komentarBox.className = "d-flex align-items-start mt-4 gap-3";

      const foto = document.createElement("img");
      foto.src = `assets/img/photo/${konselor.toLowerCase()}.jpg`;
      foto.alt = konselor;
      foto.className = "rounded-circle";
      foto.width = 40;
      foto.height = 40;
      foto.style.cursor = "pointer";
      foto.onclick = () => bukaPopupKonselor(konselor);

      const isiKomentar = document.createElement("div");
      isiKomentar.innerHTML = `
        <p class="fw-semibold mb-1">${konselor}</p>
        <p class="mb-0">${komentar}</p>`;

      komentarBox.appendChild(foto);
      komentarBox.appendChild(isiKomentar);
      cardBody.appendChild(status);
      cardBody.appendChild(komentarBox);
    } else {
      status.textContent = "⏳ Belum dikomentari";
      status.classList.add("bg-secondary", "text-white");
      cardBody.appendChild(status);
    }

    card.appendChild(cardBody);
    daftarCerita.appendChild(card);
  });
}

// Event listeners
searchInput.addEventListener("input", tampilkanCerita);
statusCheckboxes.forEach((cb) =>
  cb.addEventListener("change", tampilkanCerita)
);
wilayahCheckboxes.forEach((cb) =>
  cb.addEventListener("change", tampilkanCerita)
);

// Fungsi popup konselor
function bukaPopupKonselor(nama) {
  const popup = document.getElementById("konselor-popup");
  const foto = document.getElementById("popup-foto-konselor");
  const namaKonselor = document.getElementById("popup-nama-konselor");
  const btnProfile = document.getElementById("btn-kunjungi-profile");

  foto.src = `assets/img/photo/${nama.toLowerCase()}.jpg`;
  namaKonselor.textContent = nama;
  btnProfile.href = `profile/${nama.toLowerCase()}.html`;

  popup.classList.add("show");
}
