import { describe, expect, it } from "@jest/globals";
import { InventarioService } from "./InventarioService";

describe("Index", () => {
  const inventarioService = new InventarioService();
  it("should be defined", () => {
    expect(inventarioService).toBeDefined();
  });

  it("debe lanzar error porque un valor es negativo", () => {
    expect(() => inventarioService.calcularLoteOptimo(10, 10, -10)).toThrow();
  });
  it("debe lanzar error por costoMantenimiento no puede ser 0", () => {
    expect(() => inventarioService.calcularLoteOptimo(10, 10, 0)).toThrow();
  });
  it("debe ser el valor correcto", () => {
    const qOPtimo = inventarioService.calcularLoteOptimo(1000, 10, 30);
    expect(qOPtimo).toBeCloseTo(25.819);
  });
});
