import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '@/layout/service/layout.service';
import { Ripple } from 'primeng/ripple';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@/pages/service/auth.service';

@Component({
    selector: '[app-topbar]',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, FormsModule, Ripple, InputText, ButtonModule, IconField, InputIcon],
    template: `
        <div class="layout-topbar">
            <a class="app-logo" routerLink="/">
                <img alt="app logo" [src]="logo" style="height: 48px; width: auto;" />
            </a>

            <button #menubutton class="topbar-menubutton p-link" type="button" (click)="onMenuButtonClick()">
                <span></span>
            </button>

            <ul class="topbar-menu">
                <li *ngFor="let item of tabs; let i = index">
                    <a
                        [routerLink]="item.routerLink"
                        routerLinkActive="active-route"
                        [routerLinkActiveOptions]="item.routerLinkActiveOptions || { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }"
                        [fragment]="item.fragment"
                        [queryParamsHandling]="item.queryParamsHandling"
                        [preserveFragment]="item.preserveFragment!"
                        [skipLocationChange]="item.skipLocationChange!"
                        [replaceUrl]="item.replaceUrl!"
                        [state]="item.state"
                        [queryParams]="item.queryParams"
                    >
                        <span>{{ item.label }}</span>
                    </a>
                    <i class="pi pi-times" (click)="removeTab($event, item, i)"></i>
                </li>
                <li *ngIf="!tabs || tabs.length === 0" class="topbar-menu-empty">Use (cmd + click) on a menu item to open a tab</li>
            </ul>

            <div class="topbar-actions">
                <p-button icon="pi pi-palette" rounded (onClick)="layoutService.showConfigSidebar()"></p-button>
                <div class="topbar-search" [ngClass]="{ 'topbar-search-active': searchActive }">
                    <button pButton [rounded]="true" severity="secondary" type="button" icon="pi pi-search" (click)="activateSearch()"></button>

                    <div class="search-input-wrapper">
                        <p-icon-field>
                            <input #searchinput type="text" pInputText placeholder="Search" (blur)="deactivateSearch()" (keydown.escape)="deactivateSearch()" />
                            <p-inputicon class="pi pi-search" />
                        </p-icon-field>
                    </div>
                </div>

                <div class="topbar-profile" *ngIf="currentUser()">
                    <button class="topbar-profile-button" type="button" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                        <img alt="avatar" src="/layout/images/avatar.png" />
                        <span class="profile-details">
                            <span class="profile-name">{{ currentUser()?.name }}</span>
                            <span class="profile-job">{{ currentUser()?.role }}</span>
                        </span>
                        <i class="pi pi-angle-down"></i>
                    </button>
                    <ul class="list-none p-4 m-0 rounded-border shadow hidden absolute bg-surface-0 dark:bg-surface-900 origin-top w-full sm:w-48 mt-2 right-0 top-auto">
                        <li>
                            <a pRipple class="flex p-2 rounded-border items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer">
                                <i class="pi pi-user !mr-4"></i>
                                <span class="hidden sm:inline">Profile</span>
                            </a>
                            <a pRipple class="flex p-2 rounded-border items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer">
                                <i class="pi pi-inbox !mr-4"></i>
                                <span class="hidden sm:inline">Inbox</span>
                            </a>
                            <a pRipple class="flex p-2 rounded-border items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer">
                                <i class="pi pi-cog !mr-4"></i>
                                <span class="hidden sm:inline">Settings</span>
                            </a>
                            <a pRipple class="flex p-2 rounded-border items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer" (click)="logout()">
                                <i class="pi pi-power-off !mr-4"></i>
                                <span class="hidden sm:inline">Sign Out</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="topbar-profile" *ngIf="!currentUser()">
                    <p-button 
                        label="Login" 
                        icon="pi pi-sign-in"
                        [outlined]="true"
                        [routerLink]="'/auth/login'">
                    </p-button>
                </div>
            </div>
        </div>
    `,
    host: {
        class: 'layout-topbar'
    }
})
export class AppTopbar {
    menu: MenuItem[] = [];

    @ViewChild('searchinput') searchInput!: ElementRef;

    @ViewChild('menubutton') menuButton!: ElementRef;

    searchActive: boolean = false;

    currentUser;

    constructor(public layoutService: LayoutService, private authService: AuthService) {
        this.currentUser = this.authService.currentUser;
    }

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    activateSearch() {
        this.searchActive = true;
        setTimeout(() => {
            this.searchInput.nativeElement.focus();
        }, 100);
    }

    deactivateSearch() {
        this.searchActive = false;
    }

    removeTab(event: MouseEvent, item: MenuItem, index: number) {
        this.layoutService.onTabClose(item, index);
        event.preventDefault();
    }

    logout() {
        this.authService.logout();
    }

    get layoutTheme(): string | undefined {
        return this.layoutService.layoutConfig().layoutTheme;
    }
    set layoutTheme(value: string) {
        this.layoutService.layoutConfig.update((state) => ({ ...state, layoutTheme: value }));
    }

    get logo(): string {
        const path = '/layout/images/logo-';
        const logo = this.layoutService.isDarkTheme() || this.layoutService.layoutConfig().layoutTheme === 'primaryColor'? 'light.png' : 'dark.png';
        return path + logo;
    }

    get tabs(): MenuItem[] {
        return this.layoutService.tabs;
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }

    toggleConfigSidebar() {
        let layoutState = this.layoutService.layoutState();

        if (this.layoutService.isSidebarActive()) {
            layoutState.overlayMenuActive = false;
            layoutState.overlaySubmenuActive = false;
            layoutState.staticMenuMobileActive = false;
            layoutState.menuHoverActive = false;
            layoutState.configSidebarVisible = false;
        }
        layoutState.configSidebarVisible = !layoutState.configSidebarVisible;
        this.layoutService.layoutState.set(layoutState);
    }
}
