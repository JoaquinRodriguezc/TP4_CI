export class InventarioService {
  constructor() {}

  // ================== CÁLCULOS DE INVENTARIO ======================

  // Calcula el Punto de Pedido para un artículo (modelo LOTE_FIJO)
  async calcularPuntoPedido(
    demandaAnual: number,
    demoraEntregaProveedor: number,
    stockSeguridad: number
  ): Promise<number> {
    if (demoraEntregaProveedor <= 0) {
      throw new Error(
        "Demora de entrega de proveedor no puede ser menor o igual a 0"
      );
    }
    const demandaDiaria = demandaAnual / 365;
    return demandaDiaria * demoraEntregaProveedor + stockSeguridad;
  }

  // Calcula el Lote Óptimo (modelo LOTE_FIJO)
  calcularLoteOptimo(
    demanda: number,
    costoPedido: number,
    costoMantenimiento: number
  ): number {
    if (costoMantenimiento <= 0) {
      throw new Error("Costo de mantenimiento no puede ser menor o igual a 0");
    }
    return Math.sqrt((2 * demanda * costoPedido) / costoMantenimiento);
  }

  // Calcula el Costo Global de Inventario (CGI)
  async calcularCostoTotalLoteFijo(
    loteOptimo: number,
    demanda: number,
    costoUnidad: number,
    costoPedido: number,
    costoMantenimiento: number
  ): Promise<number> {
    // Para modelo LOTE_FIJO
    if (loteOptimo <= 0) {
      throw new Error(
        "No se puede calcular CT con lote óptimo igual a 0 o nulo"
      );
    }
    return (
      demanda * costoUnidad +
      (demanda / loteOptimo) * costoPedido +
      (loteOptimo / 2) * costoMantenimiento
    );
  }
  async calcularCostoTotalTiempoFijo(
    demanda: number,
    costoUnidad: number,
    inventarioMaximo: number,
    costoMantenimiento: number
  ): Promise<number> {
    return demanda * costoUnidad + (inventarioMaximo / 2) * costoMantenimiento;
  }

  // Calcula el stock de seguridad (modelo LOTE_FIJO y TIEMPO_FIJO)
  public calcularStockSeguridadConstante(
    nivelServicio: number,
    variacionDemanda: number,
    demoraEntregaProveedor: number,
    tiempoRevision: number
  ): number {
    const zTable: Record<number, number> = {
      0.9: 1.2816,
      0.95: 1.6449,
      0.98: 2.0537,
      0.99: 2.3263,
    };

    const z = zTable[nivelServicio];

    const stockSeguridad =
      z *
      variacionDemanda *
      Math.sqrt(demoraEntregaProveedor + (tiempoRevision || 0));

    return Math.ceil(stockSeguridad);
  }
}
