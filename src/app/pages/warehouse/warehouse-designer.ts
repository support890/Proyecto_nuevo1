import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ColorPickerModule } from 'primeng/colorpicker';
import { MessageService } from 'primeng/api';

import { WItem, WTool, WZone } from '../../types/warehouse';
import { Location as StoreLocation } from '../../types/location';
import { Bin } from '../../types/bin';
import { LocationService } from '../service/location.service';
import { BinService } from '../service/bin.service';

@Component({
    selector: 'app-warehouse-designer',
    templateUrl: './warehouse-designer.html',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DecimalPipe,
        ButtonModule, TooltipModule, InputTextModule, DropdownModule,
        InputSwitchModule, InputNumberModule, ToastModule, DialogModule, ColorPickerModule,
    ],
    providers: [MessageService],
    styles: [`
        :host { display: flex; flex-direction: column; height: 100%; }
        .dw-wrap { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

        /* Top bar */
        .dw-topbar {
            display: flex; align-items: center; gap: 8px; padding: 6px 12px;
            background: var(--surface-0, #fff);
            border-bottom: 1px solid var(--surface-200, #e2e8f0);
            min-height: 48px; flex-shrink: 0;
        }
        .dw-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 0.84rem; color: var(--text-color-secondary, #64748b); }
        .dw-bc-active { font-weight: 600; color: var(--text-color, #1e293b); }
        .dw-spacer { flex: 1; }

        /* Main */
        .dw-main { display: flex; flex: 1; min-height: 0; overflow: hidden; }

        /* Left toolbar */
        .dw-toolbar {
            display: flex; flex-direction: column; gap: 2px; padding: 8px 6px;
            background: var(--surface-0, #fff); border-right: 1px solid var(--surface-200, #e2e8f0);
            align-items: center; width: 52px; flex-shrink: 0;
        }
        .dw-tool {
            width: 38px; height: 38px; border-radius: 8px; border: 1px solid transparent;
            background: transparent; cursor: pointer; display: flex; align-items: center;
            justify-content: center; color: var(--text-color-secondary, #64748b); font-size: 1rem;
            transition: background 0.12s, color 0.12s, border-color 0.12s;
        }
        .dw-tool:hover { background: var(--surface-100, #f1f5f9); color: var(--text-color, #1e293b); }
        .dw-tool.active { background: #e8f0fe; color: #1a4fa0; border-color: #b3c6f5; }
        .dw-tool-sep { width: 28px; height: 1px; background: var(--surface-200, #e2e8f0); margin: 3px 0; }

        /* Canvas */
        .dw-canvas-wrap { flex: 1; min-width: 0; overflow: hidden; position: relative; background: #f0f2f5; }
        .dw-svg { width: 100%; height: 100%; display: block; }
        .dw-svg.c-draw { cursor: crosshair; }
        .dw-svg.c-pan { cursor: grab; }
        .dw-svg.c-panning { cursor: grabbing; }
        .dw-svg.c-select { cursor: default; }

        /* Properties panel */
        .dw-props {
            width: 280px; min-width: 280px; background: var(--surface-0, #fff);
            border-left: 1px solid var(--surface-200, #e2e8f0);
            display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0;
        }
        .dw-props-head {
            display: flex; align-items: center; justify-content: space-between;
            padding: 10px 14px; border-bottom: 1px solid var(--surface-200, #e2e8f0);
            background: var(--surface-50, #f8f9fa); flex-shrink: 0;
        }
        .dw-props-type-badge {
            display: flex; align-items: center; gap: 6px;
            padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 700;
            color: #fff;
        }
        .dw-props-body { padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
        .dw-prop label {
            display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.04em; color: var(--text-color-secondary, #64748b); margin-bottom: 4px;
        }
        .dw-divider { height: 1px; background: var(--surface-200, #e2e8f0); margin: 2px 0; }
        .dw-props-empty {
            flex: 1; display: flex; flex-direction: column; align-items: center;
            justify-content: flex-start; gap: 12px; padding: 20px 16px; text-align: center;
            color: var(--text-color-secondary, #94a3b8); overflow-y: auto;
        }
        .dw-shortcuts { font-size: 0.72rem; text-align: left; width: 100%; }
        .shortcuts-title { font-weight: 700; margin-bottom: 8px; font-size: 0.73rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .dw-shortcuts .row { display: flex; gap: 12px; margin-bottom: 3px; align-items: center; }
        kbd {
            background: var(--surface-100, #f1f5f9); border: 1px solid var(--surface-300, #cbd5e1);
            border-radius: 4px; padding: 1px 5px; font-size: 0.68rem; font-family: monospace;
            color: var(--text-color, #1e293b);
        }

        /* Legend */
        .dw-legend { font-size: 0.75rem; text-align: left; width: 100%; }
        .legend-title { font-weight: 700; margin-bottom: 8px; font-size: 0.73rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .legend-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
        .legend-dot { width: 16px; height: 16px; border-radius: 3px; flex-shrink: 0; }

        /* Linked badge */
        .dw-linked-badge {
            display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 6px;
            background: #e8f0fe; border: 1px solid #b3c6f5; font-size: 0.78rem;
        }
        .dw-linked-badge .lbl { font-weight: 600; color: #1a4fa0; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* Info message */
        .dw-info-msg {
            display: flex; align-items: flex-start; gap: 6px; padding: 8px 10px; border-radius: 6px;
            background: #fefce8; border: 1px solid #fde047; font-size: 0.75rem; color: #713f12;
            line-height: 1.4;
        }
        .dw-info-msg i { margin-top: 1px; flex-shrink: 0; }

        /* Status chip */
        .status-chip {
            display: flex; align-items: center; gap: 4px; font-size: 0.8rem;
            padding: 2px 8px; border-radius: 12px;
            background: #fef2f2; color: #ef4444; border: 1px solid #fca5a5;
        }
        .status-chip.active { background: #f0fdf4; color: #16a34a; border-color: #86efac; }

        /* Color preview */
        .color-preview { width: 22px; height: 22px; border-radius: 4px; border: 1px solid var(--surface-300); flex-shrink: 0; }

        /* Position grid */
        .pos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .pos-field .pos-lbl { font-size: 0.7rem; color: var(--text-color-secondary); display: block; margin-bottom: 2px; }

        /* Link actions */
        .link-actions button { width: 100%; }

        /* Bottom bar */
        .dw-bottombar {
            display: flex; align-items: center; padding: 5px 14px;
            background: var(--surface-0, #fff); border-top: 1px solid var(--surface-200, #e2e8f0);
            gap: 8px; min-height: 36px; flex-shrink: 0;
        }
        .dw-item-count { font-size: 0.75rem; color: var(--text-color-secondary, #64748b); font-weight: 600; }
        .dw-item-summary { font-size: 0.75rem; color: var(--text-color-secondary, #64748b); }
        .dw-zoom-ctrl { display: flex; align-items: center; gap: 4px; }

        /* Shared buttons */
        .dw-btn {
            display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px;
            border-radius: 7px; border: 1px solid var(--surface-300, #cbd5e1);
            background: var(--surface-0, #fff); cursor: pointer; font-size: 0.82rem;
            color: var(--text-color, #1e293b); white-space: nowrap;
        }
        .dw-btn:hover { background: var(--surface-50, #f8f9fa); }
        .dw-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .dw-btn:disabled:hover { background: var(--surface-0, #fff); }
        .dw-btn.primary { background: #1a4fa0; color: #fff; border-color: #1a4fa0; }
        .dw-btn.primary:hover { background: #163f82; border-color: #163f82; }
        .dw-btn-icon { width: 30px; height: 30px; padding: 0; justify-content: center; border-radius: 7px; }
        .dw-btn.danger { color: #ef4444; border-color: #fca5a5; }
        .dw-btn.danger:hover { background: #fef2f2; }
        .dw-btn.success { background: #16a34a; color: #fff; border-color: #16a34a; }
        .dw-btn.success:hover { background: #15803d; }
        .w-full { width: 100%; }

        /* SVG */
        .dw-item { cursor: move; }
        .item-lbl { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; pointer-events: none; }

        /* Dialog form */
        .dlg-field { margin-bottom: 12px; }
        .dlg-field label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-color-secondary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.03em; }
        .dlg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        /* Stock bar */
        .stock-bar-wrap { width: 100%; height: 8px; background: var(--surface-200); border-radius: 99px; overflow: hidden; margin-bottom: 4px; }
        .stock-bar-inner { height: 100%; background: #16a34a; border-radius: 99px; transition: width 0.3s; max-width: 100%; }
        .stock-bar-inner.warn { background: #f59e0b; }
        .stock-bar-inner.full { background: #ef4444; }

        /* Zones */
        .zone-list {
            margin-top: 10px; display: flex; flex-direction: column; gap: 8px;
            max-height: 380px; overflow-y: auto; padding-right: 4px;
        }
        .zone-item {
            display: flex; align-items: center; gap: 10px; padding: 10px;
            background: var(--surface-50); border: 1px solid var(--surface-100);
            border-radius: 8px; transition: all 0.2s;
        }
        .zone-item.editing { padding: 8px; background: #fff; border-color: #7c3aed; }
        .zone-color-swatch { width: 14px; height: 14px; border-radius: 3px; flex-shrink: 0; box-shadow: 0 0 0 1px rgba(0,0,0,0.1); }
        .zone-name { font-size: 0.88rem; font-weight: 600; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .zone-count { font-size: 0.75rem; font-weight: 600; padding: 3px 7px; background: var(--surface-200); border-radius: 99px; color: var(--text-color-secondary); }
        .zone-list::-webkit-scrollbar { width: 5px; }
        .zone-list::-webkit-scrollbar-track { background: transparent; }
        .zone-list::-webkit-scrollbar-thumb { background: var(--surface-200); border-radius: 10px; }
    `]
})
export class WarehouseDesigner implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('svgEl') svgRef!: ElementRef<SVGSVGElement>;
    @ViewChild('canvasWrap') canvasWrapRef!: ElementRef<HTMLDivElement>;

    // Viewport
    zoom = 1;
    panX = 0;
    panY = 0;

    // Tool
    activeTool: WTool = 'select';

    tools: { id: WTool; label: string; icon: string; sep?: boolean }[] = [
        { id: 'select', label: 'Seleccionar  (V)', icon: 'pi pi-arrows-alt' },
        { id: 'location', label: 'Ubicación  (L)', icon: 'pi pi-map-marker', sep: true },
        { id: 'bin', label: 'Bin  (B) — dentro de Ubicación', icon: 'pi pi-box' },
        { id: 'wall', label: 'Pared  (W)', icon: 'pi pi-bars', sep: true },
        { id: 'dockdoor', label: 'Dock Door  (D) — sobre Pared', icon: 'pi pi-arrow-circle-right' },
        { id: 'frame', label: 'Marco / Área  (F)', icon: 'pi pi-clone' },
    ];

    // Canvas items
    items: WItem[] = [];
    selectedId: string | null = null;

    // Drawing state
    isDrawing = false;
    drawStart = { x: 0, y: 0 };
    draft: { x: number; y: number; w: number; h: number } | null = null;

    // Drag state
    isDragging = false;
    dragOffset = { x: 0, y: 0 };

    // Pan state
    isPanning = false;
    panStart = { x: 0, y: 0 };
    spaceDown = false;

    // Resize state
    isResizing = false;
    activeHandle: string | null = null;
    lastMousePoint = { x: 0, y: 0 };

    // History
    history: WItem[][] = [];
    readonly MAX_HISTORY = 50;

    layoutName = 'Mi Almacén';

    // ---- Zonas (solo metadata, no dibujables) ----
    zones: WZone[] = [];
    get zoneOptions(): { label: string; value: string }[] {
        return this.zones.map(z => ({ label: z.name, value: z.id }));
    }
    showZoneManagerDlg = false;
    editingZone: WZone | null = null;
    newZoneName = '';
    newZoneColor = 'bbdefb';

    // DB data for linking
    dbLocations: StoreLocation[] = [];
    locationOptions: { label: string; value: string }[] = [];
    linkedBins: Bin[] = [];
    binOptions: { label: string; value: string }[] = [];

    // Location edit dialog
    showLocationEditDlg = false;
    editingLocation: StoreLocation | null = null;
    savingLocation = false;

    // Bin edit dialog
    showBinEditDlg = false;
    editingBin: Bin | null = null;
    savingBin = false;

    categoryOptions = [
        { label: 'REGULAR', value: 'REGULAR' },
        { label: 'HURT', value: 'HURT' },
        { label: 'PICKING', value: 'PICKING' },
        { label: 'REPOSITORY', value: 'REPOSITORY' },
        { label: 'FLOW', value: 'FLOW' },
        { label: 'BLOCKED', value: 'BLOCKED' },
    ];

    typeOptions = [
        { label: 'Floor-F', value: 'Floor-F' },
        { label: 'Low-L', value: 'Low-L' },
        { label: 'Mid-M', value: 'Mid-M' },
        { label: 'Top-T', value: 'Top-T' },
        { label: 'Special-S', value: 'Special-S' },
        { label: 'Toxicity-TX', value: 'Toxicity-TX' },
    ];

    levelOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => ({ label: l, value: l }));

    private wheelHandler = (e: WheelEvent) => { e.preventDefault(); this.onWheel(e); };

    constructor(
        private router: Router,
        private messageService: MessageService,
        private locationService: LocationService,
        private binService: BinService,
    ) { }

    ngOnInit(): void {
        // Load DB locations for linking dropdown
        this.dbLocations = this.locationService.getAllLocations();
        this.locationOptions = this.dbLocations.map(l => ({
            label: l.storageName,
            value: l.id!,
        }));

        // Load saved layout
        const saved = localStorage.getItem('wh-designer-layout');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.items = data.items ?? [];
                this.layoutName = data.name ?? 'Mi Almacén';
                this.zones = data.zones ?? [];
            } catch { /* ignore */ }
        }
    }

    ngAfterViewInit(): void {
        this.canvasWrapRef.nativeElement.addEventListener('wheel', this.wheelHandler, { passive: false });
    }

    ngOnDestroy(): void {
        this.canvasWrapRef.nativeElement.removeEventListener('wheel', this.wheelHandler);
    }

    // ---- Keyboard shortcuts ----

    @HostListener('document:keydown', ['$event'])
    onKeyDown(e: KeyboardEvent): void {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        if (e.code === 'Space') { e.preventDefault(); this.spaceDown = true; return; }
        if ((e.metaKey || e.ctrlKey) && e.code === 'KeyZ') { e.preventDefault(); this.undo(); return; }
        if (e.code === 'Escape') { this.selectedId = null; this.activeTool = 'select'; return; }
        if ((e.code === 'Delete' || e.code === 'Backspace') && this.selectedId) { this.deleteSelected(); return; }

        if (!e.metaKey && !e.ctrlKey) {
            switch (e.code) {
                case 'KeyV': this.setTool('select'); break;
                case 'KeyL': this.setTool('location'); break;
                case 'KeyB': this.setTool('bin'); break;
                case 'KeyW': this.setTool('wall'); break;
                case 'KeyD': this.setTool('dockdoor'); break;
                case 'KeyF': this.setTool('frame'); break;
            }
        }
    }

    @HostListener('document:keyup', ['$event'])
    onKeyUp(e: KeyboardEvent): void {
        if (e.code === 'Space') this.spaceDown = false;
    }

    // ---- Tool selection ----

    setTool(tool: WTool): void {
        this.activeTool = tool;
        if (tool !== 'select') this.selectedId = null;
    }

    // ---- Canvas mouse events ----

    onCanvasMouseDown(e: MouseEvent): void {
        if (e.button !== 0) return;
        if (this.spaceDown) {
            this.isPanning = true;
            this.panStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
            return;
        }
        if (this.activeTool === 'select') { this.selectedId = null; return; }

        const p = this.toWorld(e);
        this.isDrawing = true;
        this.drawStart = { x: this.snap(p.x), y: this.snap(p.y) };
        this.draft = { x: this.drawStart.x, y: this.drawStart.y, w: 0, h: 0 };
    }

    onCanvasMouseMove(e: MouseEvent): void {
        if (this.isPanning) {
            this.panX += e.movementX;
            this.panY += e.movementY;
            return;
        }

        const p = this.toWorld(e);

        if (this.isResizing && this.selectedItem && this.activeHandle) {
            const dx = p.x - this.lastMousePoint.x;
            const dy = p.y - this.lastMousePoint.y;
            this.handleResizing(dx, dy);
            this.lastMousePoint = p;
            return;
        }

        if (this.isDragging && this.selectedItem) {
            this.selectedItem.x = this.snap(p.x - this.dragOffset.x);
            this.selectedItem.y = this.snap(p.y - this.dragOffset.y);
            return;
        }
        if (this.isDrawing && this.draft) {
            const ex = this.snap(p.x);
            const ey = this.snap(p.y);
            this.draft = {
                x: Math.min(ex, this.drawStart.x),
                y: Math.min(ey, this.drawStart.y),
                w: Math.abs(ex - this.drawStart.x),
                h: Math.abs(ey - this.drawStart.y),
            };
        }
    }

    onCanvasMouseUp(_e: MouseEvent): void {
        if (this.isPanning) { this.isPanning = false; return; }
        if (this.isDragging) { this.isDragging = false; return; }
        if (this.isResizing) { this.isResizing = false; this.activeHandle = null; return; }
        if (this.isDrawing && this.draft) {
            this.isDrawing = false;
            const d = this.draft;
            this.draft = null;
            const type = this.activeTool as Exclude<WTool, 'select'>;
            const def = this.defaultSize(type);
            this.attemptCreateItem(d.x, d.y, d.w < 10 ? def.w : d.w, d.h < 10 ? def.h : d.h, type);
        }
    }

    onItemMouseDown(e: MouseEvent, item: WItem): void {
        if (this.activeTool !== 'select') return;
        e.stopPropagation();
        this.selectedId = item.id;
        this.isDragging = true;
        const p = this.toWorld(e);
        this.dragOffset = { x: p.x - item.x, y: p.y - item.y };
        // Load linked bins when bin item is selected
        if (item.type === 'bin') this.loadBinsForBinItem(item);
    }

    onHandleMouseDown(e: MouseEvent, handle: string, item: WItem): void {
        if (this.activeTool !== 'select') return;
        e.stopPropagation();
        this.selectedId = item.id;
        this.isResizing = true;
        this.activeHandle = handle;
        this.lastMousePoint = this.toWorld(e);
    }

    private handleResizing(dx: number, dy: number): void {
        if (!this.selectedItem || !this.activeHandle) return;
        const it = this.selectedItem;
        const h = this.activeHandle;
        const min = 10;

        if (h.includes('r')) {
            const newW = it.w + dx;
            it.w = this.snap(Math.max(min, newW));
        }
        if (h.includes('l')) {
            const newW = it.w - dx;
            if (newW >= min) {
                it.x = this.snap(it.x + dx);
                it.w = this.snap(newW);
            }
        }
        if (h.includes('b')) {
            const newH = it.h + dy;
            it.h = this.snap(Math.max(min, newH));
        }
        if (h.includes('t')) {
            const newH = it.h - dy;
            if (newH >= min) {
                it.y = this.snap(it.y + dy);
                it.h = this.snap(newH);
            }
        }
    }

    onWheel(e: WheelEvent): void {
        const rect = this.svgRef.nativeElement.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.15, Math.min(4, this.zoom * factor));
        this.panX = mx - (mx - this.panX) * newZoom / this.zoom;
        this.panY = my - (my - this.panY) * newZoom / this.zoom;
        this.zoom = newZoom;
    }

    // ---- Item creation with constraints ----

    private attemptCreateItem(x: number, y: number, w: number, h: number, type: Exclude<WTool, 'select'>): void {
        const candidate: WItem = {
            id: `${type}-${Date.now()}`,
            type, x, y, w, h,
            label: this.defaultLabel(type, this.items.filter(i => i.type === type).length + 1),
            color: this.defaultColor(type),
            active: true,
        };

        // Constraint: bins must be inside a location
        if (type === 'bin') {
            const cx = x + w / 2;
            const cy = y + h / 2;
            const inside = this.items.some(i =>
                i.type === 'location' &&
                cx >= i.x && cx <= i.x + i.w &&
                cy >= i.y && cy <= i.y + i.h
            );
            if (!inside) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Restricción',
                    detail: 'Los Bins solo pueden crearse dentro de una Ubicación',
                    life: 4000,
                });
                return;
            }
        }

        // Constraint: dock doors must overlap a wall
        if (type === 'dockdoor') {
            const wall = this.findOverlappingWall(candidate);
            if (!wall) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Restricción',
                    detail: 'Los Dock Doors deben colocarse sobre una Pared',
                    life: 4000,
                });
                return;
            }
            // Snap dock door to sit flush on the wall
            this.alignDockDoorToWall(candidate, wall);
        }

        this.pushHistory();
        this.items = [...this.items, candidate];
        this.selectedId = candidate.id;
        this.activeTool = 'select';
    }

    // ---- Link to DB items ----

    onLinkLocation(item: WItem, locationId: string): void {
        item.linkedId = locationId;
        const loc = this.dbLocations.find(l => l.id === locationId);
        if (loc) {
            item.label = loc.storageName;
            item.category = loc.category;
        }
    }

    unlinkItem(item: WItem): void {
        item.linkedId = undefined;
        this.linkedBins = [];
        this.binOptions = [];
    }

    async loadBinsForBinItem(binItem: WItem): Promise<void> {
        // Find the containing location WItem
        const cx = binItem.x + binItem.w / 2;
        const cy = binItem.y + binItem.h / 2;
        const parentLocItem = this.items.find(i =>
            i.type === 'location' && i.linkedId &&
            cx >= i.x && cx <= i.x + i.w &&
            cy >= i.y && cy <= i.y + i.h
        );
        if (parentLocItem?.linkedId) {
            this.linkedBins = await this.binService.getBinsByLocation(parentLocItem.linkedId);
            this.binOptions = this.linkedBins.map(b => ({
                label: b.binName,
                value: b.id!,
            }));
        } else {
            this.linkedBins = [];
            this.binOptions = [];
        }
    }

    onLinkBin(item: WItem, binId: string): void {
        item.linkedId = binId;
        const bin = this.linkedBins.find(b => b.id === binId);
        if (bin) item.label = bin.binName;
    }

    // ---- Edit dialogs ----

    async openLocationEdit(): Promise<void> {
        if (!this.selectedItem?.linkedId) return;
        const loc = await this.locationService.getLocationById(this.selectedItem.linkedId);
        if (loc) {
            this.editingLocation = { ...loc };
            this.showLocationEditDlg = true;
        }
    }

    async saveLocationEdit(): Promise<void> {
        if (!this.editingLocation?.id) return;
        this.savingLocation = true;
        try {
            const result = await this.locationService.updateLocation(this.editingLocation.id, this.editingLocation);
            if (result) {
                this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Ubicación actualizada correctamente' });
                if (this.selectedItem) {
                    this.selectedItem.label = result.storageName;
                    this.selectedItem.category = result.category;
                }
                // Refresh options list
                this.dbLocations = this.locationService.getAllLocations();
                this.locationOptions = this.dbLocations.map(l => ({ label: l.storageName, value: l.id! }));
                this.showLocationEditDlg = false;
            }
        } finally {
            this.savingLocation = false;
        }
    }

    async openBinEdit(): Promise<void> {
        if (!this.selectedItem?.linkedId) return;
        const bin = this.linkedBins.find(b => b.id === this.selectedItem!.linkedId);
        if (bin) {
            this.editingBin = { ...bin };
            this.showBinEditDlg = true;
        }
    }

    async saveBinEdit(): Promise<void> {
        if (!this.editingBin?.id) return;
        this.savingBin = true;
        try {
            const result = await this.binService.updateBin(this.editingBin.id, this.editingBin);
            if (result) {
                this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Bin actualizado correctamente' });
                if (this.selectedItem) this.selectedItem.label = result.binName;
                // Refresh bin list
                const idx = this.linkedBins.findIndex(b => b.id === result.id);
                if (idx !== -1) this.linkedBins[idx] = result;
                this.showBinEditDlg = false;
            }
        } finally {
            this.savingBin = false;
        }
    }

    // ---- Canvas actions ----

    deleteSelected(): void {
        if (!this.selectedId) return;
        this.pushHistory();
        this.items = this.items.filter(i => i.id !== this.selectedId);
        this.selectedId = null;
    }

    duplicateSelected(): void {
        if (!this.selectedItem) return;
        this.pushHistory();
        const src = this.selectedItem;
        const copy: WItem = {
            ...JSON.parse(JSON.stringify(src)),
            id: `${src.type}-${Date.now()}`,
            x: src.x + 20,
            y: src.y + 20,
            linkedId: undefined,
            label: src.label + ' (copia)',
        };
        this.items = [...this.items, copy];
        this.selectedId = copy.id;
    }

    undo(): void {
        if (!this.history.length) return;
        this.items = this.history.pop()!;
        this.selectedId = null;
    }

    saveLayout(): void {
        localStorage.setItem('wh-designer-layout', JSON.stringify({
            name: this.layoutName,
            items: this.items,
            zones: this.zones,
        }));
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Diseño guardado correctamente' });
    }

    clearCanvas(): void {
        if (!this.items.length) return;
        this.pushHistory();
        this.items = [];
        this.selectedId = null;
    }

    zoomIn(): void { this.zoomByCenter(1.2); }
    zoomOut(): void { this.zoomByCenter(1 / 1.2); }
    resetView(): void { this.zoom = 1; this.panX = 0; this.panY = 0; }
    goBack(): void { this.router.navigate(['/ubicaciones']); }

    // ---- Zone Manager ----

    openZoneManager(): void {
        this.newZoneName = '';
        this.newZoneColor = 'bbdefb';
        this.editingZone = null;
        this.showZoneManagerDlg = true;
    }

    addZone(): void {
        const name = this.newZoneName.trim();
        if (!name) return;
        const zone: WZone = {
            id: `zone-${Date.now()}`,
            name,
            color: this.newZoneColor.replace('#', ''),
        };
        this.zones = [...this.zones, zone];
        this.newZoneName = '';
        this.newZoneColor = 'bbdefb';
    }

    startEditZone(zone: WZone): void {
        this.editingZone = { ...zone };
    }

    saveZoneEdit(): void {
        if (!this.editingZone) return;
        this.zones = this.zones.map(z =>
            z.id === this.editingZone!.id ? { ...this.editingZone! } : z
        );
        // Re-colorear en canvas las locations que usan esta zona
        const zoneId = this.editingZone.id;
        const newColor = this.editingZone.color.replace('#', '');
        this.items = this.items.map(i =>
            (i.type === 'location' && i.zoneId === zoneId)
                ? { ...i, color: newColor }
                : i
        );
        this.editingZone = null;
    }

    cancelZoneEdit(): void {
        this.editingZone = null;
    }

    deleteZone(zoneId: string): void {
        this.zones = this.zones.filter(z => z.id !== zoneId);
        // Desasignar zona de las locations que la usaban
        this.items = this.items.map(i =>
            (i.type === 'location' && i.zoneId === zoneId)
                ? { ...i, zoneId: undefined, color: 'c8e6c9' }
                : i
        );
    }

    assignZone(item: WItem, zoneId: string): void {
        const zone = this.zones.find(z => z.id === zoneId);
        if (!zone) return;
        item.zoneId = zoneId;
        item.color = zone.color.replace('#', '');
    }

    removeZoneFromItem(item: WItem): void {
        item.zoneId = undefined;
        item.color = 'c8e6c9'; // verde default de locations
    }

    // Devuelve el color hex (#rrggbb) para el fill de una location según su zona
    zoneColorOf(item: WItem): string {
        if (item.type !== 'location') return '#' + item.color.replace('#', '');
        if (item.zoneId) {
            const zone = this.zones.find(z => z.id === item.zoneId);
            if (zone) return '#' + zone.color.replace('#', '');
        }
        return '#' + item.color.replace('#', '');
    }

    /** Devuelve el color (#rrggbb) de la zona dada su ID */
    getZoneColor(zoneId?: string): string {
        if (!zoneId) return 'transparent';
        const zone = this.zones.find(z => z.id === zoneId);
        return zone ? '#' + zone.color.replace('#', '') : 'transparent';
    }

    /** Devuelve el nombre de la zona dada su ID */
    getZoneName(zoneId?: string): string {
        if (!zoneId) return '';
        return this.zones.find(z => z.id === zoneId)?.name ?? '';
    }

    /** Cuenta cuántas ubicaciones están asignadas a la zona dada */
    countLocsByZone(zoneId: string): number {
        return this.items.filter(i => i.type === 'location' && i.zoneId === zoneId).length;
    }

    // ---- Computed getters ----

    get selectedItem(): WItem | null {
        return this.items.find(i => i.id === this.selectedId) ?? null;
    }

    get gridTransform(): string {
        return `translate(${this.panX},${this.panY}) scale(${this.zoom})`;
    }

    get svgCursorClass(): string {
        if (this.isPanning) return 'c-panning';
        if (this.spaceDown) return 'c-pan';
        if (this.activeTool !== 'select') return 'c-draw';
        return 'c-select';
    }

    // ---- Rendering helpers ----

    strokeOf(item: WItem): string {
        if (this.selectedId === item.id) return '#1a4fa0';
        const m: Record<string, string> = {
            location: '#2e7d32', bin: '#f9a825',
            wall: '#263238', dockdoor: '#e65100', frame: '#bdbdbd',
        };
        // Locations con zona: usar versión oscurecida del color de zona
        if (item.type === 'location' && item.zoneId) {
            const zone = this.zones.find(z => z.id === item.zoneId);
            if (zone) return '#' + this.darkenHex(zone.color.replace('#', ''));
        }
        return m[item.type] ?? '#888';
    }

    textFillOf(item: WItem): string {
        const m: Record<string, string> = {
            location: '#1b5e20', bin: '#827717',
            wall: '#eceff1', dockdoor: '#bf360c', frame: '#757575',
        };
        return m[item.type] ?? '#333';
    }

    strokeWidthOf(item: WItem): number {
        return this.selectedId === item.id ? 2.5 : 1.5;
    }

    getDraftColor(): string {
        return this.defaultColor(this.activeTool as Exclude<WTool, 'select'>);
    }

    getDraftStroke(): string {
        const m: Record<string, string> = {
            location: '#2e7d32', bin: '#f9a825',
            wall: '#263238', dockdoor: '#e65100', frame: '#bdbdbd',
        };
        return m[this.activeTool] ?? '#1a4fa0';
    }

    typeName(type: Exclude<WTool, 'select'>): string {
        const m: Record<string, string> = {
            location: 'Ubicación', bin: 'Bin',
            wall: 'Pared', dockdoor: 'Dock Door', frame: 'Marco / Área',
        };
        return m[type] ?? type;
    }

    typeIcon(type: Exclude<WTool, 'select'>): string {
        const m: Record<string, string> = {
            location: 'pi pi-map-marker', bin: 'pi pi-box',
            wall: 'pi pi-bars', dockdoor: 'pi pi-arrow-circle-right', frame: 'pi pi-clone',
        };
        return m[type] ?? 'pi pi-circle';
    }

    typeBadgeColor(type: Exclude<WTool, 'select'>): string {
        const m: Record<string, string> = {
            location: '#2e7d32', bin: '#b8860b',
            wall: '#37474f', dockdoor: '#e65100', frame: '#757575',
        };
        return m[type] ?? '#555';
    }

    categoryColor(category?: string): string {
        const m: Record<string, string> = {
            'REGULAR': '#3b82f6',
            'HURT': '#f59e0b',
            'PICKING': '#8b5cf6',
            'REPOSITORY': '#06b6d4',
            'FLOW': '#10b981',
            'BLOCKED': '#ef4444',
        };
        return category ? (m[category] ?? '#94a3b8') : 'transparent';
    }

    countByType(type: string): number {
        return this.items.filter(i => i.type === type).length;
    }

    stockPercent(bin: { capacity?: number; currentStock?: number }): number {
        if (!bin.capacity || bin.capacity <= 0) return 0;
        return Math.min(100, Math.round(((bin.currentStock ?? 0) / bin.capacity) * 100));
    }

    linkedLabel(item: WItem): string {
        if (!item.linkedId) return '';
        if (item.type === 'location') {
            return this.dbLocations.find(l => l.id === item.linkedId)?.storageName ?? item.linkedId;
        }
        if (item.type === 'bin') {
            return this.linkedBins.find(b => b.id === item.linkedId)?.binName ?? item.linkedId;
        }
        return item.linkedId;
    }

    // ---- Private helpers ----

    snap(v: number, g = 20): number { return Math.round(v / g) * g; }

    private toWorld(e: MouseEvent): { x: number; y: number } {
        const rect = this.svgRef.nativeElement.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - this.panX) / this.zoom,
            y: (e.clientY - rect.top - this.panY) / this.zoom,
        };
    }

    private pushHistory(): void {
        this.history.push(JSON.parse(JSON.stringify(this.items)));
        if (this.history.length > this.MAX_HISTORY) this.history.shift();
    }

    private zoomByCenter(factor: number): void {
        const rect = this.svgRef?.nativeElement.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const newZoom = Math.max(0.15, Math.min(4, this.zoom * factor));
        this.panX = cx - (cx - this.panX) * newZoom / this.zoom;
        this.panY = cy - (cy - this.panY) * newZoom / this.zoom;
        this.zoom = newZoom;
    }

    private findOverlappingWall(item: WItem): WItem | null {
        return this.items.find(i =>
            i.type === 'wall' &&
            item.x < i.x + i.w && item.x + item.w > i.x &&
            item.y < i.y + i.h && item.y + item.h > i.y
        ) ?? null;
    }

    private alignDockDoorToWall(door: WItem, wall: WItem): void {
        const isHorizontal = wall.w >= wall.h;
        if (isHorizontal) {
            // Snap vertically: top edge of door flush with top edge of wall
            door.y = wall.y;
            door.h = Math.max(door.h, 60); // minimum height for visibility
        } else {
            // Snap horizontally: left edge flush with left edge of wall
            door.x = wall.x;
            door.w = Math.max(door.w, 60);
        }
    }

    private defaultSize(type: Exclude<WTool, 'select'>): { w: number; h: number } {
        const m: Record<string, { w: number; h: number }> = {
            location: { w: 80, h: 60 },
            bin: { w: 40, h: 30 },
            wall: { w: 160, h: 10 },
            dockdoor: { w: 60, h: 50 },
            frame: { w: 240, h: 180 },
        };
        return m[type] ?? { w: 100, h: 80 };
    }

    private defaultLabel(type: Exclude<WTool, 'select'>, n: number): string {
        const m: Record<string, string> = {
            location: `LOC-${String(n).padStart(3, '0')}`,
            bin: `BIN-${String(n).padStart(3, '0')}`,
            wall: 'Pared',
            dockdoor: `Dock ${n}`,
            frame: `Área ${n}`,
        };
        return m[type] ?? `${type} ${n}`;
    }

    private defaultColor(type: Exclude<WTool, 'select'>): string {
        const m: Record<string, string> = {
            location: '#c8e6c9',
            bin: '#fff9c4',
            wall: '#37474f',
            dockdoor: '#ffcc80',
            frame: '#f5f5f5',
        };
        return m[type] ?? '#e0e0e0';
    }

    /** Oscurece un color hex (sin #) mezclando con negro al 30% */
    private darkenHex(hex: string): string {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const dr = Math.max(0, Math.round(r * 0.65)).toString(16).padStart(2, '0');
        const dg = Math.max(0, Math.round(g * 0.65)).toString(16).padStart(2, '0');
        const db = Math.max(0, Math.round(b * 0.65)).toString(16).padStart(2, '0');
        return dr + dg + db;
    }
}
