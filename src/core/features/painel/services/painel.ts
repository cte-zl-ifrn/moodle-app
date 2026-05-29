import { Injectable } from '@angular/core';
import { Http } from '@singletons';
import { CoreStorage } from '@services/storage';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { CoreConstants } from '@/core/constants';
import { CoreSites } from '@services/sites';
import { CoreError } from '@classes/errors/error';

export const LOGIN_PAINEL_URL = 'http://localhost:8092';
export const PAINEL_URL = 'http://localhost:8092';
export const CLIENT_ID = 'changeme';

@Injectable({ providedIn: 'root' })
export class CorePainelService {

    async loginSUAP(username: string, password: string): Promise<any> {
        const authenticateUrl = `${LOGIN_PAINEL_URL}/api/v1/authenticate/`;

        // Transformamos o objeto explicitamente em uma string JSON
        const body = JSON.stringify({
            username: username,
            password: password,
            client_id: CLIENT_ID
        });

        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const observable = Http.post(authenticateUrl, body, options).pipe(
            catchError(error => {
                console.error('Erro no loginSUAP:', error);
                return throwError(() => error);
            })
        );

        return firstValueFrom(observable);
    }

    async verifyToken(token: string): Promise<boolean> {
        const verifyTokenUrl = `${LOGIN_PAINEL_URL}/api/v1/verify/`;
        const body = { token };

        const observable = Http.post(verifyTokenUrl, body).pipe(
            catchError(error => throwError(() => error))
        );

        try {
            const response: any = await firstValueFrom(observable);
            const userData: any = await CoreStorage.get('user-data');
            return response.username === userData?.matricula;
        } catch {
            return false;
        }
    }

    async getDiaries(filter: any, userToken: string): Promise<any> {
        const observable = Http.get(`${PAINEL_URL}/api/v1/diarios/`, {
            headers: { Authorization: `Bearer ${userToken}` },
            params: filter,
        });

        try {
            return await firstValueFrom(observable);
        } catch (error) {
            console.error('Error fetching diaries', error);
            return null;
        }
    }

    async loginMoodle(courseUrl: string, username: string, userToken: string): Promise<string> {
        const service = CoreConstants.CONFIG.wsservice;
        const params = { service, username, token: userToken };
        const headers = { Authentication: `Token ${userToken}` };
        const loginUrl = `${courseUrl}auth/suap/dispatch.php`;

        try {
            const loginTokenResponse: any = await firstValueFrom(Http.get(loginUrl, { params, headers }));
            if (!loginTokenResponse.token || !loginTokenResponse.privatetoken) {
                throw new CoreError('Invalid token');
            }
            return await CoreSites.newSite(courseUrl, loginTokenResponse.token, loginTokenResponse.privatetoken);
        } catch (error) {
            throw new CoreError('Error getting token from Moodle');
        }
    }
}
