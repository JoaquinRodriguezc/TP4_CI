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
      100, // loteOptimo
      1000, // demanda
      10, // costoUnidad
      50, // costoPedido
      2 // costoMantenimiento
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
      150, // loteOptimo
      1450, // demanda
      12.75, // costoUnidad
      95, // costoPedido
      3.8 // costoMantenimiento
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

  //-------------------------------------------------------------------------------------
  it("debe calcular correctamente el stock de seguridad para nivel de servicio 0.95", () => {
    const result = inventarioService.calcularStockSeguridadConstante(
      0.95, // nivelServicio
      20, // variacionDemanda
      4, // demoraEntregaProveedor
      1 // tiempoRevision
    );
    // z = 1.6449, sqrt(4+1) = sqrt(5) ≈ 2.2361 → 1.6449 * 20 * 2.2361 ≈ 73.6 → ceil = 74
    expect(result).toBe(74);
  });

  //-------------------------------------------------------------------------------------
  it("debe retornar NaN si se pasa un nivel de servicio inválido", () => {
    const result = inventarioService.calcularStockSeguridadConstante(
      0.85, // nivelServicio no definido
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
  //-------------------------------------------------------------------------------------
  it("lanza error si algún parámetro numérico es inválido (NaN o string)", async () => {
    await expect(
      inventarioService.calcularPuntoPedido("1000" as any, 5, 5)
    ).rejects.toThrow("Todos los parámetros deben ser numéricos");

    await expect(
      inventarioService.calcularPuntoPedido(1000, NaN, 5)
    ).rejects.toThrow("Todos los parámetros deben ser numéricos");

    await expect(
      inventarioService.calcularPuntoPedido(1000, 5, undefined as any)
    ).rejects.toThrow("Todos los parámetros deben ser numéricos");
  });

  //-------------------------------------------------------------------------------------
  it("lanza error si días laborables son 0 o negativos", async () => {
    await expect(
      inventarioService.calcularPuntoPedido(1000, 5, 5, { diasLaborables: 0 })
    ).rejects.toThrow("La cantidad de días laborables debe ser mayor a 0");

    await expect(
      inventarioService.calcularPuntoPedido(1000, 5, 5, {
        diasLaborables: -100,
      })
    ).rejects.toThrow("La cantidad de días laborables debe ser mayor a 0");
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
  // ===================== TESTS para simularInventario =====================
  it('Simulación básica sin reposiciones', () => {
    const resultado = inventarioService.simularInventario(100, 10, 5, []);
    expect(resultado).toEqual([90, 80, 70, 60, 50]);
  });

  it('Simulación con reposiciones en algunos días', () => {
    const resultado = inventarioService.simularInventario(50, 10, 4, [
      { dia: 2, cantidad: 20 },
      { dia: 4, cantidad: 10 }
    ]);
    expect(resultado).toEqual([40, 50, 40, 40]);
  });

  it('Inventario nunca puede ser negativo', () => {
    const resultado = inventarioService.simularInventario(15, 10, 3, []);
    expect(resultado).toEqual([5, 0, 0]); // Se queda sin stock el segundo día
  });
});


