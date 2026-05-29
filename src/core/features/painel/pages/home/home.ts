import { Component, OnInit } from '@angular/core';
import { CoreStorage } from '@services/storage';
import { CoreNavigator } from '@services/navigator';
import { CoreNetwork } from '@services/network';
import { CoreAlerts } from '@services/overlays/alerts';
import { CoreLoadings } from '@services/overlays/loadings';
import { Translate } from '@singletons';
import { CoreCourseHelper } from '@features/course/services/course-helper';
import { CoreCourses } from '@features/courses/services/courses';
import { CorePainelService } from '../../services/painel';
import { CoreSharedModule } from '@/core/shared.module';

@Component({
    selector: 'page-core-painel-home',
    templateUrl: 'home.html',
    styleUrls: ['home.scss'],
    standalone: true,
    imports: [CoreSharedModule]
})
export default class CorePainelHomePage implements OnInit {
    userToken: string | null = null;
    userData: any;
    courses: any[] = [];
    coordinates: any[] = [];
    
    imageProfile: string = 'assets/img/user-avatar.png';
    mainListOption: any = { label: 'Meus Diários', id: 1 };
    mainListOptionOpened: boolean = false;
    coursesLoaded: boolean = false;
    coordinatesLoaded: boolean = false;
    
    constructor(
        private painelService: CorePainelService
    ) {}

    async ngOnInit(): Promise<void> {
        this.userToken = await CoreStorage.get('user-token');
        this.userData = await CoreStorage.get('user-data');
        
        await this.loadDiaries();
    }

    async loadDiaries() {
        if (!this.userToken) return;
        
        this.coursesLoaded = false;
        this.coordinatesLoaded = false;
        
        const filter = { page: 1, page_size: 5000, situacao: 'inprogress' };
        const diaries = await this.painelService.getDiaries(filter, this.userToken);
        
        if (diaries) {
            this.extractCoursesAndCoordinations(diaries);
        }
        
        this.coursesLoaded = true;
        this.coordinatesLoaded = true;
    }

    extractCoursesAndCoordinations(diariesData: any) {
        const regex = /https:\/\/[^\/]+\//;
        
        this.courses = diariesData.diarios?.map((diary: any) => {
            const urlMatch = diary.viewurl.match(regex) || diary.viewurl.match(/http:\/\/[^\/]+\//);
            return {
                name: diary.fullname,
                environment: diary.ambiente.titulo,
                environment_id: diary.ambiente.id,
                color: diary.ambiente.cor_mestra,
                id: diary.id,
                url: urlMatch ? urlMatch[0] : '',
                favorite: diary.isfavourite,
                progress: diary.progress,
            };
        }) || [];
        
        this.coordinates = diariesData.coordenacoes?.map((coord: any) => {
            const urlMatch = coord.viewurl.match(regex) || coord.viewurl.match(/http:\/\/[^\/]+\//);
            return {
                name: coord.fullname,
                environment: coord.ambiente.titulo,
                environment_id: coord.ambiente.id,
                color: coord.ambiente.cor_mestra,
                id: coord.id,
                url: urlMatch ? urlMatch[0] : '',
                favorite: coord.isfavourite,
                progress: coord.progress,
            };
        }) || [];
    }

    async goToCourseAccount(course: any) {
        if (!CoreNetwork.isOnline()) {
            CoreAlerts.showError(Translate.instant('core.networkerrormsg'));
            return;
        }

        const modal = await CoreLoadings.show();
        
        try {
            const siteId = await this.painelService.loginMoodle(course.url, this.userData.matricula, this.userToken!);
            const allCourses = await CoreCourses.getUserCourses(undefined, siteId);
            const selectedCourse = allCourses.find(c => c.fullname === course.name);
            
            if (selectedCourse) {
                await CoreCourseHelper.openCourse(selectedCourse, { params: { isGuest: false } });
            }
        } catch (error) {
            CoreAlerts.showError(Translate.instant('core.painel.cantaccessdiarietrylater'));
        } finally {
            modal.dismiss();
        }
    }

    getText(text: string): string {
        return Translate.instant(text);
    }

    openNotifications(event: Event): void {
        console.log('openNotifications', event);
    }

    openMessages(event: Event): void {
        console.log('openMessages', event);
    }

    toggleSideMenu(event: Event): void {
        console.log('toggleSideMenu', event);
    }

    openMainListPopOver(event: Event): void {
        console.log('openMainListPopOver', event);
    }

    handleSearchFilter(): void {
        console.log('handleSearchFilter');
    }

    toogleFilter(): void {
        console.log('toogleFilter');
    }

    getAllDiaries(): void {
        console.log('getAllDiaries');
    }

    getAllCoordenations(): void {
        console.log('getAllCoordenations');
    }

    handleRefresh(event: any): void {
        this.loadDiaries().then(() => {
            event.target.complete();
        });
    }

    getImgStyleClassById(id: number): string {
        return `ava-${id}`;
    }

    handleFavoriteCourseButton(course: any): void {
        console.log('handleFavoriteCourseButton', course);
    }
}
