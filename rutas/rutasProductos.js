var rutas = require("express").Router();
var { mostrarProductos, nuevoProducto, borrarProducto, buscarProductoPorID, editarProducto } = require("../bd/productosBD");

rutas.get("/", async (req, res) => {
    const productosValidos = await mostrarProductos();
    console.log(productosValidos);
    res.json(productosValidos);
});

rutas.get("/buscarPorId/:id", async (req, res) => {
    const productoValido = await buscarProductoPorID(req.params.id);
    res.json(productoValido);
});

rutas.delete("/borrarProducto/:id", async (req, res) => {
    const productoBorrado = await borrarProducto(req.params.id);
    res.json(productoBorrado);
});

rutas.post("/nuevoProducto", async (req, res) => {
    try {
        const productoValido = await nuevoProducto(req.body);
        if (productoValido) {
            res.status(201).json({ mensaje: "Producto agregado con éxito." });
        } else {
            res.status(400).json({ error: "Datos del producto no válidos." });
        }
    } catch (error) {
        console.error("Error al agregar el producto:", error);
        res.status(500).json({ error: "Hubo un error al agregar el producto." });
    }
});


rutas.put("/editarProducto/:id", async (req, res) => {
    try {
        const productoActualizado = await editarProducto(req.params.id, req.body);
        if (productoActualizado) {
            res.json({ mensaje: "Producto actualizado con éxito." });
        } else {
            res.status(404).json({ error: "Producto no encontrado." });
        }
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ error: "Hubo un error al actualizar el producto." });
    }
});

module.exports = rutas;
