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
  it("debe calcular correctamente el Costo Total de Inventario (caso simple)", async () => {
    const result = await inventarioService.calcularCostoTotalLoteFijo(
      100,   // loteOptimo
      1000,  // demanda
      10,    // costoUnidad
      50,    // costoPedido
      2      // costoMantenimiento
    );
    expect(result).toBeCloseTo(10600);
  });

  //-------------------------------------------------------------------------------------
  it("Debe lanzar error si el lote óptimo es 0", async () => {
    await expect(
      inventarioService.calcularCostoTotalLoteFijo(
        0,
        1000,
        10,
        50,
        2
      )
    ).rejects.toThrow("No se puede calcular CT con lote óptimo igual a 0 o nulo");
  });

  //-------------------------------------------------------------------------------------
  it("debe calcular correctamente un caso realista y complejo (≈19690.83)", async () => {
    const result = await inventarioService.calcularCostoTotalLoteFijo(
      150,     // loteOptimo
      1450,    // demanda
      12.75,   // costoUnidad
      95,      // costoPedido
      3.8      // costoMantenimiento
    );
    expect(result).toBeCloseTo(19690.83, 2);
  });

  // ===================== TESTS para debeReponerse =====================
  it("debe retornar true si no hay fecha de última reposición", () => {
    const articulo = { fechaUltimaReposicion: null, intervaloDias: 7 };
    const result = inventarioService.debeReponerse(articulo, new Date(), false);
    expect(result).toBe(true);
  });

  it("debe retornar false si existe una orden de compra activa", () => {
    const articulo = {
      fechaUltimaReposicion: new Date("2025-06-10"),
      intervaloDias: 7
    };
    const result = inventarioService.debeReponerse(articulo, new Date("2025-06-23"), true);
    expect(result).toBe(false);
  });

  it("debe retornar true si pasaron más días que el intervalo", () => {
    const articulo = {
      fechaUltimaReposicion: new Date("2025-06-01"),
      intervaloDias: 10
    };
    const result = inventarioService.debeReponerse(articulo, new Date("2025-06-23"), false);
    expect(result).toBe(true);
  });

});
