export const userInputs = [
  {
    id: "username",
    label: "Nama Pengguna",
    type: "text",
    placeholder: "Nama Pengguna"
  },
  {
    id: "email",
    label: "Email",
    type: "mail",
    placeholder: "email@bintang.jaya"
  },
  {
    id: "password",
    label: "Password",
    type: "password"
  },
  {
    id: "position",
    label: "Jabatan / Posisi",
    type: "text",
    placeholder: "Manajer"
  }
];
export const warnaInputs = [
  {
    id: "id",
    label: "Kode Untuk Warna",
    type: "text",
    placeholder: "002",
    minLength: "3",
    maxLength: "3"
  },
  {
    id: "number",
    label: "Nomor Warna",
    type: "text",
    placeholder: "014B"
  },
  {
    id: "color",
    label: "Warna",
    type: "text",
    placeholder: "Putih"
  },
]
export const jenisInputs = [
  {
    id: "id",
    label: "Kode Untuk Jenis",
    type: "text",
    placeholder: "2",
    minLength: "1",
    maxLength: "1"
  },
  {
    id: "type",
    label: "Jenis Benang Obras",
    type: "text",
    placeholder: "Hosan"
  }
]
export const konesInputs = [
  {
    id: "id",
    label: "Kode Untuk Kones",
    type: "text",
    placeholder: "1",
    minLength: "1",
    maxLength: "1"
  },
  {
    id: "variant",
    label: "Kones",
    type: "text",
    placeholder: "GP"
  }
]
export const beratInputs = [
  {
    id: "id",
    label: "Kode Untuk Berat",
    type: "text",
    placeholder: "03",
    minLength: "2",
    maxLength: "2"
  },
  {
    id: "weight",
    label: "Berat",
    type: "text",
    placeholder: "450 Gram"
  }
]
export const jumlahInputs = [
  {
    id: "id",
    label: "Kode Untuk Jumlah Stok",
    type: "text",
    placeholder: "5",
    minLength: "1",
    maxLength: "1"
  },
  {
    id: "stock",
    label: "Jumlah Stok",
    type: "text",
    placeholder: "1 Lusin"
  }
]
export const tokoInputs = [
  {
    id: "client",
    label: "Nama Toko",
    type: "text",
    placeholder: "(Arsada Jaya)"
  }
]

export const produkInputs = [
  {
    id: "idProduct",
    label: "Kode Barang",
    type: "text",
    readOnly: true
  },

  {
    id: "product",
    label: "Nama Barang",
    type: "text",
    placeholder: "Benang Obras",
    readOnly: true
  },
  {
    id: "idColor",
    label: "Kode Untuk Warna",
    type: "text",
    placeholder: "(3 digit setelah kode default)",
    maxLength: "3",
    readOnly: true
  },
  {
    id: "color",
    label: "Warna",
    type: "text",
    placeholder: "(Pilih nomor warna)",
    readOnly: true
  },
  {
    id: "number",
    label: "Nomor Warna",
    type: "dropdown",
    options: [],
    placeholder: "(Sesuai buku warna)"
  },

  {
    id: "idType",
    label: "Kode Untuk Jenis",
    type: "text",
    placeholder: "(1 digit setelah kode warna)",
    maxLength: "1",
    readOnly: true
  },
  {
    id: "type",
    label: "Jenis Benang Obras",
    type: "dropdown",
    options: [
      { value: "Gemilang", label: "Gemilang" },
      { value: "Hosan", label: "Hosan" }
    ],
    placeholder: "(Klik untuk memilih)"
  },
  {
    id: "idCones",
    label: "Kode Untuk Kones",
    type: "text",
    placeholder: "(1 digit setelah kode jenis)",
    maxLength: "1",
    readOnly: true
  },
  {
    id: "variant",
    label: "Kones",
    type: "dropdown",
    options: [
      { value: "3 Pon", label: "3 Pon" },
      { value: "GP", label: "GP" }
    ],
    placeholder: "(Klik untuk memilih)"
  },
  {
    id: "idSize",
    label: "Kode Untuk Berat",
    type: "text",
    placeholder: "(2 digit setelah kode kones)",
    maxLength: "2",
    readOnly: true
  },
  {
    id: "weight",
    label: "Berat per-satuan",
    type: "dropdown",
    options: [
      { value: "100 gram", label: "100 gram" },
      { value: "160 gram", label: "160 gram" },
      { value: "220 gram", label: "220 gram" },
      { value: "350 gram", label: "350 gram" },
      { value: "400 gram", label: "400 gram" },
      { value: "450 gram", label: "450 gram" },
      { value: "500 gram", label: "500 gram" },
      { value: "550 gram", label: "550 gram" },
      { value: "600 gram", label: "600 gram" },
      { value: "1000 gram", label: "1000 gram" },
      { value: "50 gram", label: "50 gram" },

    ],
    placeholder: "(Klik untuk memilih)"
  },
  {
    id: "idAmount",
    label: "Kode Untuk Stok",
    type: "text",
    placeholder: "(1 digit terakhir)",
    maxLength: "1",
    readOnly: true
  },
  {
    id: "stock",
    label: "Stok",
    type: "dropdown",
    options: [
      { value: "1 Bal", label: "1 Bal" },
      { value: "1 Lusin", label: "1 Lusin" },
      { value: "2 Lusin", label: "2 Lusin" },
      { value: "10 Lusin", label: "10 Lusin" },
      { value: "1 Kodi", label: "1 Kodi" },
      { value: "2 Kodi", label: "2 Kodi" },
      { value: "10 Kodi", label: "10 Kodi" },
      { value: "1 Dus", label: "1 Dus" },
      { value: "1 Strip", label: "1 Strip" },
      { value: "1 Pcs", label: "1 Pcs" },
      { value: "Other", label: "Lainnya" },
    ],
    placeholder: "(Klik untuk memilih)"
  },

]
export const stokInputs = [
  {
    id: "id",
    label: "TagID",
    type: "text",
    placeholder: "(ID dari tag)",
    readOnly: true
  },
  {
    id: "product",
    label: "Nama Barang",
    type: "text",
    placeholder: "(Benang Obras)",
    readOnly: true
  },
  {
    id: "color",
    label: "Warna",
    type: "text",
    placeholder: "(Pink)",
    readOnly: true
  },
  {
    id: "number",
    label: "Nomor Warna",
    type: "text",
    placeholder: "(2050)",
    readOnly: true
  },
  {
    id: "type",
    label: "Jenis Benang Obras",
    type: "text",
    placeholder: "(Gemilang / Hosan)",
    readOnly: true
  },
  {
    id: "stock",
    label: "Stok",
    type: "text",
    placeholder: "(1 Bal)",
    readOnly: true
  },
  {
    id: "weight",
    label: "Berat per-satuan",
    type: "text",
    placeholder: "(160 gram)",
    readOnly: true
  },
  {
    id: "variant",
    label: "Kones",
    type: "text",
    placeholder: "(3 Pon / GP)",
    readOnly: true
  },

]

export const kirimInputs = [
  {
    id: "id",
    label: "TagID",
    type: "text",
    placeholder: "(ID dari tag)",
    readOnly: true
  },
  {
    id: "product",
    label: "Nama Barang",
    type: "text",
    placeholder: "(Benang Obras)",
    readOnly: true
  },
  {
    id: "color",
    label: "Warna",
    type: "text",
    placeholder: "(Pink)",
    readOnly: true
  },
  {
    id: "number",
    label: "Nomor Warna",
    type: "text",
    placeholder: "(2050)",
    readOnly: true
  },
  {
    id: "type",
    label: "Jenis Benang Obras",
    type: "text",
    placeholder: "(Gemilang / Hosan)",
    readOnly: true
  },
  {
    id: "stock",
    label: "Stok",
    type: "text",
    placeholder: "(1 Bal)",
    readOnly: true
  },
  {
    id: "weight",
    label: "Berat per-satuan",
    type: "text",
    placeholder: "(160 gram)",
    readOnly: true
  },
  {
    id: "variant",
    label: "Kones",
    type: "text",
    placeholder: "(3 Pon / GP)",
    readOnly: true
  },
  {
    id: "client",
    label: "Dikirim Ke",
    type: "dropdown",
    options: [],
    placeholder: "(Klik untuk memilih)"
  }
]