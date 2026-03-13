import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'page-core-login-custom',
  templateUrl: './login-custom.page.html',
  styleUrls: ['./login-custom.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]

})
export class LoginCustomPage implements OnInit {
  username = '';
  password = '';

  constructor(
    private router: Router,
    private zone: NgZone
  ) { }
ngOnInit() {
    const token = localStorage.getItem('core_login_token');
    if (token) {
      this.zone.run(() => {
        // Alterado de /mainmenu para /main/home para evitar o erro NG04002
        this.router.navigateByUrl('/main/home');
      });
    }
  }
async entrar() {
    if (this.username === 'login' && this.password === 'senha') {
      console.log('✅ Credenciais aceitas. Gravando token...');
      localStorage.setItem('core_login_token', 'token-de-teste-jwt');

      this.zone.run(async () => {
        try {
          // No Moodle App v4, a rota costuma ser /main/home ou /tabs/home
          const success = await this.router.navigateByUrl('/main/home');

          if (success) {
            console.log('🎉 Navegação concluída!');
          } else {
            console.warn('⚠️ /main/home falhou. Tentando redirecionamento padrão...');
            // Tenta a rota raiz, o Moodle redirecionará sozinho se estiver logado
            await this.router.navigateByUrl('/');
          }
        } catch (err) {
          console.error('Erro crítico na navegação:', err);
          // Caso tudo falhe, força o recarregamento da página inicial
          window.location.href = '/';
        }
      });
    } else {
      alert('Credenciais incorretas');
    }
  }
  logout() {
    console.log('🚪 Encerrando sessão...');

    // Limpa o token que criamos no localStorage
    localStorage.removeItem('core_login_token');

    // Redireciona de volta para a tela de login (ela mesma)
    this.zone.run(() => {
      this.router.navigateByUrl('/login-custom');
    });
  }
}
