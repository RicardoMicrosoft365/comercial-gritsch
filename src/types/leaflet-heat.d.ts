import * as L from 'leaflet';

declare module 'leaflet' {
  namespace HeatLayer {
    interface HeatLayerOptions {
      minOpacity?: number;
      maxZoom?: number;
      max?: number;
      radius?: number;
      blur?: number;
      gradient?: Record<string, string>;
    }
  }

  function heatLayer(
    latlngs: Array<[number, number] | [number, number, number]>,
    options?: HeatLayer.HeatLayerOptions
  ): L.Layer;
}

declare module 'leaflet.heat' {
  export = L.heatLayer;
} 