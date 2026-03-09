export interface Location {
    id?: string;
    zone: string;
    category: string;
    type: string;
    area: string;
    row: string;
    bay: string;
    level: string;
    storageName: string; // Código generado como "REGULAR-392"
    customName: boolean;
    binQty: number;
    content?: string;
    active: boolean;
    createdAt?: Date;
}

export interface LocationGeneratorParams {
    zone?: string;
    category: string;
    type: string;
    area: string;
    rowMin: number;
    rowMax: number;
    bayMin: number;
    bayMax: number;
    levelMin: string;
    levelMax: string;
    content?: string;
    storageNameFormat?: string;
}
