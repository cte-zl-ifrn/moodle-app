import { Component, OnInit, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CoreSiteBasicInfo, CoreSites } from '@services/sites';
import { CoreAccountsList, CoreLoginHelper } from '@features/login/services/login-helper';
import { CoreNavigator } from '@services/navigator';
import { CoreFilter } from '@features/filter/services/filter';
import { CoreLoadings } from '@services/overlays/loadings';
import { CoreAlerts } from '@services/overlays/alerts';
import { Translate } from '@singletons';
import { CoreSharedModule } from '@/core/shared.module';

// CAMINHO CORRIGIDO ABAIXO:
@Component({
    selector: 'page-core-login-sites',
    templateUrl: 'sites.html',
    imports: [
        CoreSharedModule,
    ],
})
export default class CoreLoginSitesPage implements OnInit {

    accountsList: CoreAccountsList = {
        sameSite: [],
        otherSites: [],
        count: 0,
    };

    showDelete = false;
    loaded = false;

    constructor(
        protected router: Router,
        protected zone: NgZone
    ) {}

    async ngOnInit(): Promise<void> {
        if (CoreNavigator.getRouteBooleanParam('openAddSite')) {
            this.add();
        }

        this.accountsList = await CoreLoginHelper.getAccountsList();
        this.loaded = true;

        if (this.accountsList.count == 0 && !CoreNavigator.getRouteBooleanParam('openAddSite')) {
            this.add();
        }
    }

    // Função que estava faltando e causando o erro no HTML e no ngOnInit
    add(): void {
        CoreLoginHelper.goToAddSite();
    }

async logoutCustom() {
    try {
        console.log('Botão SAIR clicado!');

        // 1. Limpa o token do site atual (CoreSites já está no seu topo e funciona)
        await CoreSites.logout();

        // 2. Avisa ao Angular para atualizar a tela e navegar
        this.zone.run(async () => {
            console.log('Redirecionando...');
            await CoreNavigator.navigate('/login/site', {
                reset: true,
                animated: true
            });
        });

    } catch (error) {
        console.error('Erro na ação de sair:', error);
        // Fallback: se o navegador travar, force a URL manualmente
        window.location.hash = '/login/site';
    }
}
    async deleteSite(event: Event, site: CoreSiteBasicInfo): Promise<void> {
        event.stopPropagation();
        let siteName = site.siteName || '';
        siteName = await CoreFilter.formatText(siteName, { clean: true, singleLine: true, filter: false }, [], site.id);

        try {
            await CoreAlerts.confirmDelete(Translate.instant('core.login.confirmdeletesite', { sitename: siteName }));
        } catch {
            return;
        }

        try {
            await CoreLoginHelper.deleteAccountFromList(this.accountsList, site);
            this.showDelete = false;
            if (this.accountsList.count == 0) {
                this.add();
            }
        } catch (error) {
            CoreAlerts.showError(error, { default: Translate.instant('core.login.errordeletesite') });
        }
    }

    async login(site: CoreSiteBasicInfo): Promise<void> {
        const modal = await CoreLoadings.show();
        try {
            const loggedIn = await CoreSites.loadSite(site.id);
            if (loggedIn) {
                await CoreNavigator.navigateToSiteHome();
                return;
            }
        } catch (error) {
            CoreAlerts.showError(error, { default: 'Error loading site.' });
        } finally {
            modal.dismiss();
        }
    }

    toggleDelete(): void {
        this.showDelete = !this.showDelete;
    }

    openSettings(): void {
        CoreNavigator.navigate('/settings');
    }
}
