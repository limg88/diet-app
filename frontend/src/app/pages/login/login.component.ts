import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    PasswordModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  isRegister = false;
  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/menu');
    }
  }

  toggleMode() {
    this.isRegister = !this.isRegister;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    if (!email || !password) {
      return;
    }

    this.loading = true;
    if (this.isRegister) {
      this.authService.register(email, password).subscribe({
        next: () => {
          this.toastService.success('Account created. You can log in now.');
          this.isRegister = false;
          this.loading = false;
        },
        error: (err) => {
          this.toastService.error(err?.error?.message ?? 'Registration failed');
          this.loading = false;
        },
      });
      return;
    }

    this.authService.login(email, password).subscribe({
      next: () => {
        this.toastService.success('Welcome back!');
        this.loading = false;
        this.router.navigateByUrl('/menu');
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Login failed');
        this.loading = false;
      },
    });
  }
}
