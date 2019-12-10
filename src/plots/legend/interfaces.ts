export interface LegendInfo {
  label?: string,
  unit?: string,
}

interface DifferentialPlotSerieLegendInfo extends LegendInfo {
  show?: boolean,
}

export interface DifferentialPlotLegendInfo {
  serie1: DifferentialPlotSerieLegendInfo,
  serie2: DifferentialPlotSerieLegendInfo,
}
