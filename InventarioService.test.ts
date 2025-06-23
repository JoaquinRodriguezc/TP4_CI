import { describe, expect, it } from "@jest/globals";
import { InventarioService } from "./InventarioService";

describe("InventarioService", () => {
  const inventarioService = new InventarioService();
  //-------------------------------------------------------------------------------------
  it("should be defined", () => {
    expect(inventarioService).toBeDefined();
  });
  //-------------------------------------------------------------------------------------
  it("debe lanzar error porque un valor es negativo", () => {
    expect(() => inventarioService.calcularLoteOptimo(10, 10, -10)).toThrow();
  });
  //-------------------------------------------------------------------------------------
  it("debe lanzar error por costoMantenimiento no puede ser 0", () => {
    expect(() => inventarioService.calcularLoteOptimo(10, 10, 0)).toThrow();
  });
  //-------------------------------------------------------------------------------------
  it("debe ser el valor correcto", () => {
    const qOPtimo = inventarioService.calcularLoteOptimo(1000, 10, 30);
    expect(qOPtimo).toBeCloseTo(25.819);
  });
  //-------------------------------------------------------------------------------------
  //Testeos para el calculo del CGI
  it("debe calcular correctamente el Costo Total de Inventario (caso simple)", async () => {
    const result = await inventarioService.calcularCostoTotalLoteFijo(
      100,    // loteOptimo
      1000,   // demanda
      10,     // costoUnidad
      50,     // costoPedido
      2       // costoMantenimiento
    );
    expect(result).toBeCloseTo(10600);
  });
  //-------------------------------------------------------------------------------------
  it("Debe lanzar error si el lote óptimo es 0", async () => {
    await expect(
      inventarioService.calcularCostoTotalLoteFijo(0, 1000, 10, 50, 2)
    ).rejects.toThrow(
      "No se puede calcular CT con lote óptimo igual a 0 o nulo"
    );
  });
  //-------------------------------------------------------------------------------------
  it("debe calcular correctamente un caso realista y complejo (≈19690.83)", async () => {
    const result = await inventarioService.calcularCostoTotalLoteFijo(
      150,      // loteOptimo
      1450,     // demanda
      12.75,    // costoUnidad
      95,       // costoPedido
      3.8       // costoMantenimiento
    );
    expect(result).toBeCloseTo(19690.83, 2); // Usá 2 decimales para que sea más estricto
  });
  //-------------------------------------------------------------------------------------
  it("debe calcular correctamente el stock de seguridad para nivel de servicio 0.95", () => {
    const result = inventarioService.calcularStockSeguridadConstante(
      0.95,   // nivelServicio
      20,     // variacionDemanda
      4,      // demoraEntregaProveedor
      1       // tiempoRevision
    );
    // z = 1.6449, sqrt(4+1) = sqrt(5) ≈ 2.2361 → 1.6449 * 20 * 2.2361 ≈ 73.6 → ceil = 74
    expect(result).toBe(74);
  });
  //-------------------------------------------------------------------------------------
  it("debe retornar NaN si se pasa un nivel de servicio inválido", () => {
  const result = inventarioService.calcularStockSeguridadConstante(
      0.85,   // nivelServicio no definido
      10,
      3,
      1
    );
    expect(result).toBeNaN(); // z será undefined → multiplicación con undefined da NaN
  });
  //-------------------------------------------------------------------------------------
  it("debe calcular correctamente el stock cuando solo hay demora del proveedor (tiempoRevision = 0)", () => {
  const result = inventarioService.calcularStockSeguridadConstante(
      0.98,   // nivelServicio
      10,     // variacionDemanda
      4,      // demoraEntregaProveedor
      0       // tiempoRevision
    );
    // z = 2.0537, sqrt(4) = 2 → 2.0537 * 10 * 2 = 41.074 → ceil = 42
    expect(result).toBe(42);
  });
});
