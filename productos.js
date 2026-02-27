// ============================================
// LUXURIA SHOP - CATÁLOGO DE PRODUCTOS
// ============================================
// Edita este archivo para añadir/modificar productos
// Stock híbrido: agotado = true siempre muestra agotado
//             : si stock = 0, también muestra agotado

const productos = [
    {
        id: 1,
        nombre: "CAMISA DE SEDA NEGRA",
        descripcion: "Seductora camisa de seda negra. Corte italiano, tacto suave.",
        precio: 89.99,
        imagen: "imagen/camisa-seda.jpg",
        categoria: "ropa",
        stock: 15,
        agotado: false,
        destacado: true
    },
    {
        id: 2,
        nombre: "PANTALÓN DE VESTIR BORGOÑA",
        descripcion: "Elegancia y confort. Talle alto, tejido premium.",
        precio: 129.99,
        imagen: "imagen/pantalon.jpg",
        categoria: "ropa",
        stock: 8,
        agotado: false,
        destacado: true
    },
    {
        id: 3,
        nombre: "CINTURÓN DORADO",
        descripcion: "Hebilla dorada apagada. Cuero genuino italiano.",
        precio: 45.50,
        imagen: "imagen/cinturon.jpg",
        categoria: "accesorios",
        stock: 2,
        agotado: false,
        destacado: false
    },
    {
        id: 4,
        nombre: "LENCERÍA ENCaje",
        descripcion: "Conjunto de encaje francés. Máxima comodidad y estilo.",
        precio: 79.99,
        imagen: "imagen/lenceria.jpg",
        categoria: "intimo",
        stock: 5,
        agotado: false,
        destacado: true
    },
    {
        id: 5,
        nombre: "ACEITE CORPORAL DORADO",
        descripcion: "Aceite con partículas doradas. Hidratación y brillo.",
        precio: 34.99,
        imagen: "imagen/aceite.jpg",
        categoria: "intimo",
        stock: 12,
        agotado: false,
        destacado: false
    },
    {
        id: 6,
        nombre: "GAFAS DE SOL ELEGANTES",
        descripcion: "Diseño italiano. Protección UV y estilo único.",
        precio: 149.99,
        imagen: "imagen/gafas.jpg",
        categoria: "accesorios",
        stock: 0,
        agotado: false,  // Stock 0, pero no marcado como agotado manualmente
        destacado: false  // El sistema lo mostrará agotado por stock=0 (Opción C)
    },
    {
        id: 7,
        nombre: "SET DE VELAS AROMÁTICAS",
        descripcion: "Tres velas. Notas: vainilla, canela, ámbar.",
        precio: 59.99,
        imagen: "imagen/velas.jpg",
        categoria: "ofertas",
        stock: 3,
        agotado: false,
        destacado: true
    },
    {
        id: 8,
        nombre: "ESPEJO CON LUCES",
        descripcion: "Espejo de maquillaje con luces LED regulables.",
        precio: 89.99,
        imagen: "imagen/espejo.jpg",
        categoria: "ofertas",
        stock: 4,
        agotado: false,
        destacado: false
    },
    {
        id: 9,
        nombre: "Gammy",
        descripcion: "Elegancia y confort. Talle alto, tejido premium.",
        precio: 129.99,
        imagen: "imagen/p.jpg",
        categoria: "ropa",
        stock: 8,
        agotado: false,
        destacado: true
    },
];

// No modificar - Imagen por defecto
const IMAGEN_DEFAULT = "img/default-product.jpg";

// Función para obtener productos (con imagen por defecto si falta)
function obtenerProductos() {
    return productos.map(producto => ({
        ...producto,
        imagen: producto.imagen || IMAGEN_DEFAULT
    }));
}

// Función para verificar si un producto está agotado (Opción C híbrida)
function productoAgotado(producto) {
    return producto.agotado === true || producto.stock === 0;
}
