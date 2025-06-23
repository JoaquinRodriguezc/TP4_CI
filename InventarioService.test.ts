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
    expect(result).toBeCloseTo(19690.83, 2); // Usá 2 decimales para que sea más estricto
  });
  //-------------------------------------------------------------------------------------
  it('debería clasificar correctamente un producto como A, B o C', () => {
    expect(inventarioService.clasificarABC({ nombre: 'ProdA', demandaAnual: 200, costoUnidad: 6 })).toBe('A'); // 1200
    expect(inventarioService.clasificarABC({ nombre: 'ProdB', demandaAnual: 100, costoUnidad: 6 })).toBe('B'); // 600
    expect(inventarioService.clasificarABC({ nombre: 'ProdC', demandaAnual: 10, costoUnidad: 20 })).toBe('C'); // 200
  });
  //-------------------------------------------------------------------------------------
  it('debería lanzar excepción si el producto es nulo o indefinido', () => {
    expect(() => inventarioService.clasificarABC(undefined as any)).toThrow('El producto no puede ser nulo o indefinido');
  });
  //-------------------------------------------------------------------------------------
  it('debería lanzar excepción si demandaAnual o costoUnidad son menores o iguales a 0', () => {
    expect(() => inventarioService.clasificarABC({ nombre: 'ProdX', demandaAnual: 0, costoUnidad: 10 })).toThrow('El producto debe tener demandaAnual y costoUnidad mayores a 0');
    expect(() => inventarioService.clasificarABC({ nombre: 'ProdY', demandaAnual: 10, costoUnidad: 0 })).toThrow('El producto debe tener demandaAnual y costoUnidad mayores a 0');
  });
});

