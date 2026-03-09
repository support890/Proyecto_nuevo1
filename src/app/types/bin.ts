export interface Bin {
    id?: string;
    locationId: string;
    binName: string;
    capacity?: number;
    currentStock?: number;
    active: boolean;
    createdAt?: Date;
}

export interface BinGeneratorParams {
    locationId: string;
    prefix: string;
    startNumber: number;
    endNumber: number;
}
