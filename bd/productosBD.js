const productosBD = require("./conexion").productos;
const Producto = require("../modelos/ProductoModelo");
const { encriptarCodigo, validarCodigo } = require("../middlewares/funcionesCodigo");

function validarDatosProducto(producto) {
    const esValido = 
        producto.nombre != undefined &&
        producto.proveedor != undefined &&
        producto.codigo != undefined &&
        producto.descripcion != undefined &&
        producto.categoria != undefined &&
        producto.precio != undefined &&
        producto.stock != undefined;

    console.log("Validación de producto:", {
        nombre: producto.nombre,
        proveedor: producto.proveedor,
        codigo: producto.codigo,
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        precio: producto.precio,
        stock: producto.stock,
        esValido
    });

    return esValido;
}

async function mostrarProductos() {
    try {
        const snapshot = await productosBD.get(); // Get the QuerySnapshot
        console.log("Productos fetched from DB:", snapshot); // Log the snapshot

        const productosValidos = snapshot.docs.map(doc => {
            const productoData = doc.data(); // Get data from the document
            console.log("Producto data:", productoData); // Log each product's data
            
            const producto1 = new Producto({ 
                id: doc.id,  // Use the document ID directly
                ...productoData,
                precio: productoData.precio || 0, // Default to 0 if undefined
                stock: productoData.stock || 0,   // Default to 0 if undefined
            });

            // Validate and return the product if valid
            return validarDatosProducto(producto1.getProducto) ? producto1.getProducto : null;
        }).filter(Boolean); // Filter out invalid products

        console.log("Productos válidos:", productosValidos); // Log valid products before returning
        return productosValidos;
    } catch (error) {
        console.error("Error al mostrar productos:", error); // Log any errors that occur
        return []; // Return an empty array in case of error
    }
}


async function buscarProductoPorID(id) {
    const producto = await productosBD.doc(id).get();
    const producto1 = new Producto({ id: producto.id, ...producto.data() });
    return validarDatosProducto(producto1.getProducto) ? producto1.getProducto : null;
}

async function nuevoProducto(data) {
    // Encriptar el código si está presente
    if (data.codigo) {
        const { salt, hash } = encriptarCodigo(data.codigo);
        data.codigo = hash;
        data.salt = salt;
    }

    // Convertir precio y stock a los tipos correctos
    if (data.precio) {
        data.precio = parseFloat(data.precio);
    }
    if (data.stock) {
        data.stock = parseInt(data.stock, 10);
    }

    // Crear una instancia del producto
    const producto1 = new Producto(data);
    console.log("Datos del nuevo producto:", producto1.getProducto);

    // Validar los datos del producto
    if (validarDatosProducto(producto1.getProducto)) {
        await productosBD.doc().set(producto1.getProducto);
        return true;
    }
    return false; // Devuelve false si los datos no son válidos
}



async function borrarProducto(id) {
    const productoValido = await buscarProductoPorID(id);
    if (productoValido) {
        await productosBD.doc(id).delete();
        return true;
    }
    return false;
}

async function editarProducto(id, data) {
    const productoExistente = await productosBD.doc(id).get();
    if (!productoExistente.exists) {
        return false;
    }
    
    const productoActualizado = {
        nombre: data.nombre || productoExistente.data().nombre,
        proveedor: data.proveedor || productoExistente.data().proveedor,
        descripcion: data.descripcion || productoExistente.data().descripcion,
        categoria: data.categoria || productoExistente.data().categoria,
        precio: (data.precio !== undefined ? data.precio : productoExistente.data().precio),
        stock: (data.stock !== undefined ? data.stock : productoExistente.data().stock)
    };
    
    await productosBD.doc(id).update(productoActualizado);
    return true;
}



module.exports = {
    mostrarProductos,
    nuevoProducto,
    borrarProducto,
    buscarProductoPorID,
    editarProducto
} 
