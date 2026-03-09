// Herramientas dibujables en el canvas
// Nota: 'zone' ya no es un elemento dibujable — es un ATRIBUTO de las locations
export type WTool = 'select' | 'location' | 'bin' | 'wall' | 'dockdoor' | 'frame';

// Una zona es solo metadata con nombre y color
// Las locations se colorean según la zona asignada
export interface WZone {
    id: string;      // generado localmente
    name: string;    // ej. "Zona A", "Refrigerado", "Picking"
    color: string;   // hex sin # — ej. "bbdefb"
}

export interface WItem {
    id: string;
    type: Exclude<WTool, 'select'>;
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    color: string;       // color visual del elemento en canvas
    category?: string;   // solo locations
    zoneId?: string;     // ID de WZone asignada (solo locations)
    active: boolean;
    linkedId?: string;   // FK a Location.id o Bin.id en la DB
}

export interface WLayout {
    name: string;
    items: WItem[];
    zones: WZone[];      // persist zonas junto con el layout
}
