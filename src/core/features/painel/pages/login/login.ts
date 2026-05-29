import { Component, OnInit, ElementRef, viewChild } from '@angular/core';
import { CoreNetwork } from '@services/network';
import { CoreStorage } from '@services/storage';
import { CoreNavigator } from '@services/navigator';
import { CoreAlerts } from '@services/overlays/alerts';
import { CoreLoadings } from '@services/overlays/loadings';
import { Translate } from '@singletons';
import { CorePainelService } from '../../services/painel';
import { CoreSharedModule } from '@/core/shared.module';

@Component({
    selector: 'page-core-painel-login',
    templateUrl: 'login.html',
    styleUrls: ['login.scss'],
    standalone: true,
    imports: [CoreSharedModule]
})
export default class CorePainelLoginPage implements OnInit {

    readonly formElement = viewChild<ElementRef>('loginForm');

    constructor(
        private painelService: CorePainelService
    ) { }

    hasInitalized = true;
    langOption = 'pt-br';

    async ngOnInit(): Promise<void> {
        const userToken = await CoreStorage.get('user-token') as string;
        if (userToken) {
            const isTokenValid = await this.painelService.verifyToken(userToken);
            if (isTokenValid) {
                await CoreNavigator.navigate('/painel/home', { reset: true });
            } else {
                await CoreStorage.remove('user-token');
            }
        }
    }

    async loginPainel(): Promise<void> {
        const usernameInput = this.formElement()?.nativeElement.querySelector('input[name="username"]') as HTMLInputElement;
        const passwordInput = this.formElement()?.nativeElement.querySelector('input[name="password"]') as HTMLInputElement;

        if (!usernameInput?.value || !passwordInput?.value) {
            return;
        }

        if (!CoreNetwork.isOnline()) {
            CoreAlerts.showError(Translate.instant('core.networkerrormsg'));
            return;
        }

        const modal = await CoreLoadings.show(Translate.instant('core.painel.processing'));

        try {
            const response = await this.painelService.loginSUAP(usernameInput.value, passwordInput.value);

            await CoreStorage.set('user-data', response.data);
            await CoreStorage.set('user-token', response.token);
            await CoreStorage.set('user-photo', response.data.url_foto_75x100);

            await CoreNavigator.navigate('/painel/home', { reset: true });
        } catch (error: any) {
            console.error('Erro capturado no login:', error);

            if (error.status === 401) {
                CoreAlerts.showError(Translate.instant('core.painel.invaliduserorpassword'));
            } else {
                CoreAlerts.showError(Translate.instant('core.painel.suapunavailabletrylater'));
            }
        } finally {
            modal.dismiss();
        }
    }

    getText(text: string): string {
        return Translate.instant(text);
    }

    changeLanguage(event: any): void {
        this.langOption = event.detail.value;
    }

    changePassword(): void {
        window.open('https://suap.ifrn.edu.br/comum/solicitar_trocar_senha/', '_system');
    }
}
