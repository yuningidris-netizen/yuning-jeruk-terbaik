const alternatives = [
  { code: "A1", name: "Jeruk Keprok" },
  { code: "A2", name: "Jeruk Siam" },
  { code: "A3", name: "Jeruk Pontianak" },
  { code: "A4", name: "Jeruk Medan" },
  { code: "A5", name: "Jeruk Bali" },
  { code: "A6", name: "Jeruk Nipis" },
  { code: "A7", name: "Jeruk Lemon" },
  { code: "A8", name: "Jeruk Sunkist" },
  { code: "A9", name: "Jeruk Valencia" },
  { code: "A10", name: "Jeruk Mandarin" },
  { code: "A11", name: "Jeruk Santang" },
  { code: "A12", name: "Jeruk Kasturi" },
  { code: "A13", name: "Jeruk Purut" },
  { code: "A14", name: "Jeruk Kumquat" },
  { code: "A15", name: "Jeruk Dekopon" }
];

const criteria = [
  { code: "C1", name: "Berat Buah", weight: 0.30, type: "Benefit", note: "Semakin berat semakin baik" },
  { code: "C2", name: "Tingkat Kemanisan", weight: 0.25, type: "Benefit", note: "Semakin manis semakin baik" },
  { code: "C3", name: "Ketahanan Penyimpanan", weight: 0.25, type: "Benefit", note: "Semakin tahan lama semakin baik" },
  { code: "C4", name: "Harga Bibit", weight: 0.20, type: "Cost", note: "Semakin murah semakin baik" }
];

const rawData = [
  { code: "A1", values: [4, 3, 4, 4] },
  { code: "A2", values: [3, 4, 3, 5] },
  { code: "A3", values: [4, 5, 4, 3] },
  { code: "A4", values: [5, 4, 5, 2] },
  { code: "A5", values: [5, 5, 5, 1] },
  { code: "A6", values: [2, 2, 3, 5] },
  { code: "A7", values: [3, 4, 4, 4] },
  { code: "A8", values: [4, 5, 5, 2] },
  { code: "A9", values: [5, 4, 4, 3] },
  { code: "A10", values: [4, 5, 3, 3] },
  { code: "A11", values: [3, 4, 4, 4] },
  { code: "A12", values: [2, 3, 3, 5] },
  { code: "A13", values: [2, 2, 5, 5] },
  { code: "A14", values: [3, 3, 4, 4] },
  { code: "A15", values: [5, 5, 5, 2] }
];

const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];
const fmt = (n) => Number(n).toFixed(3);
const toPct = (n) => `${Math.round(n * 100)}%`;

function getName(code) {
  return alternatives.find(a => a.code === code)?.name || code;
}

function compute() {
  const maxBenefit = [0, 1, 2].map(i => Math.max(...rawData.map(r => r.values[i])));
  const minCost = Math.min(...rawData.map(r => r.values[3]));

  const normalized = rawData.map(row => ({
    code: row.code,
    name: getName(row.code),
    values: [
      row.values[0] / maxBenefit[0],
      row.values[1] / maxBenefit[1],
      row.values[2] / maxBenefit[2],
      minCost / row.values[3]
    ]
  }));

  const results = normalized
    .map(row => ({
      code: row.code,
      name: row.name,
      values: row.values,
      score: row.values.reduce((acc, v, i) => acc + (v * criteria[i].weight), 0)
    }))
    .sort((a, b) => b.score - a.score);

  return { normalized, results };
}

function renderTables() {
  $("#statAlternatif").textContent = alternatives.length;
  $("#statKriteria").textContent = criteria.length;

  $("#tableJenis tbody").innerHTML = alternatives.map(a => `
    <tr><td>${a.code}</td><td>${a.name}</td></tr>
  `).join("");

  $("#tableKriteria tbody").innerHTML = criteria.map(c => `
    <tr>
      <td>${c.code}</td>
      <td>${c.name}</td>
      <td>${toPct(c.weight)}</td>
      <td><span class="badge-small ${c.type === 'Benefit' ? 'badge-benefit' : 'badge-cost'}">${c.type}</span></td>
      <td>${c.note}</td>
    </tr>
  `).join("");

  $("#tableAlternatif tbody").innerHTML = rawData.map(row => `
    <tr data-search="${row.code} ${getName(row.code)}">
      <td>${row.code}</td>
      <td>${getName(row.code)}</td>
      <td>${row.values[0]}</td>
      <td>${row.values[1]}</td>
      <td>${row.values[2]}</td>
      <td>${row.values[3]}</td>
    </tr>
  `).join("");
}

function renderAll() {
  renderTables();
  const { normalized, results } = compute();

  $("#tableMatriksAwal tbody").innerHTML = rawData.map(row => `
    <tr>
      <td>${row.code}</td>
      <td>${getName(row.code)}</td>
      ${row.values.map(v => `<td>${v}</td>`).join("")}
    </tr>
  `).join("");

  $("#tableNormalisasi tbody").innerHTML = normalized.map(row => `
    <tr>
      <td>${row.code}</td>
      <td>${row.name}</td>
      ${row.values.map(v => `<td>${fmt(v)}</td>`).join("")}
    </tr>
  `).join("");

  $("#tableNilaiAkhir tbody").innerHTML = results.map(row => `
    <tr>
      <td>${row.code}</td>
      <td>${row.name}</td>
      <td>${fmt(row.score)}</td>
      <td>${row.code === "A5" ? '<span class="badge-small badge-best">Terbaik</span>' : 'Layak'}</td>
    </tr>
  `).join("");

  $("#tablePeringkat tbody").innerHTML = results.map((row, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${row.code}</td>
      <td>${row.name}</td>
      <td>${fmt(row.score)}</td>
      <td>${idx === 0 ? '<span class="badge-small badge-best">Alternatif Terbaik</span>' : `Peringkat ${idx + 1}`}</td>
    </tr>
  `).join("");

  const best = results[0];
  $("#bestAlt").textContent = best.code;
  $("#bestBox").innerHTML = `
    <div class="badge-small badge-best" style="margin-bottom:10px;">🏆 Alternatif Terbaik</div>
    <div><strong>${best.code} - ${best.name}</strong></div>
    <p style="margin:10px 0 0;line-height:1.8;color:#374151">
      Nilai preferensi tertinggi saat ini adalah <b>${fmt(best.score)}</b>.
      Pada data jeruk ini, <b>${best.code}</b> menjadi alternatif terbaik.
    </p>
  `;

  renderBars(results);
  bindSortableTables();
}

function renderBars(results) {
  const max = Math.max(...results.map(r => r.score));
  const min = Math.min(...results.map(r => r.score));
  const range = (max - min) || 1;

  $("#bars").innerHTML = results
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
    .map(r => {
      const h = 40 + ((r.score - min) / range) * 240;
      const isBest = r.code === results[0].code;
      return `
        <div class="bar-col">
          <div class="bar" style="height:${h}px;${isBest ? 'outline:3px solid rgba(37,99,235,.24);' : ''}">
            <span>${fmt(r.score)}</span>
          </div>
          <div class="bar-label">${r.code}</div>
        </div>
      `;
    }).join("");
}

function bindSortableTables() {
  $$('table thead th').forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const table = th.closest("table");
      const type = th.dataset.sort || "text";
      sortTable(table, th.cellIndex, type);
    });
  });
}

function sortTable(table, colIndex, type) {
  const tbody = table.querySelector("tbody");
  const rows = [...tbody.querySelectorAll("tr")];
  const asc = table._sortAsc = !(table._sortAsc ?? false);

  rows.sort((a, b) => {
    const A = a.children[colIndex].innerText.trim();
    const B = b.children[colIndex].innerText.trim();

    if (type === "num") {
      const x = parseFloat(A);
      const y = parseFloat(B);
      return asc ? x - y : y - x;
    }
    return asc ? A.localeCompare(B, "id") : B.localeCompare(A, "id");
  });

  tbody.innerHTML = "";
  rows.forEach(r => tbody.appendChild(r));
}

function downloadCSV() {
  const { results } = compute();
  const header = ["Peringkat", "Kode", "Nama", "Nilai_Akhir", "Status"];
  const rows = results.map((r, i) => [
    i + 1,
    r.code,
    `"${r.name}"`,
    fmt(r.score),
    i === 0 ? "Alternatif Terbaik" : ""
  ]);
  const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hasil_spk_jeruk.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadJSON() {
  const { results } = compute();
  const data = {
    title: "Sistem Pendukung Keputusan Pemilihan Jenis Jeruk Terbaik",
    criteria,
    alternatives,
    results: results.map((r, i) => ({
      rank: i + 1,
      code: r.code,
      name: r.name,
      score: Number(r.score.toFixed(3))
    })),
    best: results[0]
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "laporan_spk_jeruk.json";
  a.click();
  URL.revokeObjectURL(url);
}

function showPage(pageId) {
  $$(".page").forEach(page => page.classList.remove("active"));
  const target = $("#page-" + pageId);
  if (target) target.classList.add("active");

  $$(".nav-link").forEach(btn => btn.classList.remove("active"));
  const activeBtn = $(`.nav-link[data-target="${pageId}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  renderAll();
}

$("#searchAlternatif").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  $$("#tableAlternatif tbody tr").forEach(tr => {
    const text = tr.dataset.search.toLowerCase();
    tr.classList.toggle("hide", !text.includes(q));
  });
});

$$(".nav-link").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.target));
});

$$("[data-target-btn]").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.targetbtn));
});

renderAll();
showPage("beranda");