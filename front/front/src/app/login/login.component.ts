import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.access);
        this.router.navigate(['/home']);
      },
      error: err => {
        this.error = 'Credenciales incorrectas';
      }
    });
  }
}
