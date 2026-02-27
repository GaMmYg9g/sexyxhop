// ============================================
// LUXURIA SHOP - CATÁLOGO DE PRODUCTOS
// ============================================

const productos = [
    {
        id: 1,
        nombre: "ARNÉS STRAP-ON DOBLE",
        descripcion: "Arnes ajustable con doble dildo para juego en pareja",
        precio: 45,
        imagen: "imagen/arnes.jpg",
        categoria: "arneses",
        disponible: true,
        especificaciones: [
            { label: "Largo", valor: "17.5 y 12.5 cm" },
            { label: "Diámetro", valor: "2.2 y 3.5 cm" },
            { label: "Material", valor: "Silicona" },
            { label: "Incluye", valor: "Dildos intercambiables" }
        ]
    },
    {
        id: 2,
        nombre: "VIBRADOR SUCCIONADOR",
        descripcion: "Estimulador de clítoris y punto G con control por APP",
        precio: 45,
        imagen: "imagen/vibrador.jpg",
        categoria: "vibradores",
        disponible: true,
        especificaciones: [
            { label: "Largo", valor: "11 cm" },
            { label: "Diámetro", valor: "3.4 cm" },
            { label: "Material", valor: "Silicona ABS" },
            { label: "Batería", valor: "Carga USB Magnética" },
            { label: "Vibración", valor: "9 modos de vibración" },
            { label: "Succión", valor: "9 modos de succión" }
        ]
    }
];

// Imagen por defecto
const IMAGEN_DEFAULT = "img/default-product.jpg";
