import { AfterViewInit, Component, OnInit, viewChild, NgZone } from '@angular/core'; // Adicionado NgZone
import { IonRouterOutlet, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router'; // Adicionado Router
import { BackButtonEvent } from '@ionic/core';

import { CoreLoginHelper } from '@features/login/services/login-helper';
import { SplashScreen } from '@singletons';
import { CoreApp } from '@services/app';
import { CoreNavigator } from '@services/navigator';
import { CoreSubscriptions } from '@static/subscriptions';
import { CoreWindow } from '@static/window';
import { CorePlatform } from '@services/platform';
import { CoreLogger } from '@static/logger';
import { CorePromisedValue } from '@classes/promised-value';
import { register } from 'swiper/element/bundle';
import { CoreWait } from '@static/wait';
import { CoreOpener } from '@static/opener';
import { BackButtonPriority } from '@/core/constants';

register();

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonicModule],
})
export class AppComponent implements OnInit, AfterViewInit {

    readonly outlet = viewChild.required(IonRouterOutlet);

    protected logger = CoreLogger.getInstance('AppComponent');

    // Adicionado o Router e NgZone no construtor
    constructor(
        private router: Router,
        private zone: NgZone
    ) {}

    /**
     * @inheritdoc
     */
    ngOnInit(): void {
        // --- LÓGICA DE REDIRECIONAMENTO AUTOMÁTICO ---
        const token = localStorage.getItem('core_login_token');
        if (token) {
            this.zone.run(() => {
                // Se o token existe, manda direto para o home
                this.router.navigateByUrl('/main/home');
            });
        }
        // ----------------------------------------------

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = <any> window;

        CorePlatform.resume.subscribe(() => {
            setTimeout(() => {
                if (CoreLoginHelper.isWaitingForBrowser() && !CoreOpener.isInAppBrowserOpen()) {
                    CoreLoginHelper.stopWaitingForBrowser();
                    CoreLoginHelper.checkLogout();
                }
            }, 1000);
        });

        win.openWindowSafely = (url: string, name?: string): void => {
            CoreWindow.open(url, name);
        };

        win.onOverrideUrlLoading = (url: string) => {
            CoreWindow.open(url);
        };

        document.addEventListener('ionBackButton', (event: BackButtonEvent) => {
            event.detail.register(BackButtonPriority.QUIT_APP, async () => {
                const initialPath = CoreNavigator.getCurrentPath();
                if (initialPath.startsWith('/main/')) {
                    CoreApp.closeApp();
                    return;
                }

                await CoreWait.wait(50);

                if (CoreNavigator.getCurrentPath() != initialPath) {
                    return;
                }

                CoreApp.closeApp();
            });
        });

        const observer = new MutationObserver((mutations) => {
            if (!(document.activeElement instanceof HTMLElement)) {
                return;
            }
            for (const mutation of mutations) {
                if (mutation.target instanceof HTMLElement &&
                        mutation.target.ariaHidden === 'true' &&
                        mutation.target.contains(document.activeElement)) {
                    document.activeElement.blur();
                    return;
                }
            }
        });
        observer.observe(document.body, {
            attributeFilter: ['aria-hidden'],
            subtree: true,
        });
    }

    /**
     * @inheritdoc
     */
    ngAfterViewInit(): void {
        this.logger.debug('App component initialized');

        CoreSubscriptions.once(this.outlet().activateEvents, async () => {
            await CorePlatform.ready();

            this.logger.debug('Hide splash screen');
            SplashScreen.hide();
            this.setSystemUIColorsAfterSplash();
        });
    }

    protected async setSystemUIColorsAfterSplash(): Promise<void> {
        if (!CorePlatform.isAndroid()) {
            CoreApp.setSystemUIColors();
            return;
        }

        const promise = new CorePromisedValue<void>();
        const interval = window.setInterval(() => {
            CoreApp.setSystemUIColors();
        });
        setTimeout(() => {
            clearInterval(interval);
            promise.resolve();
        }, 1000);

        return promise;
    }
}
