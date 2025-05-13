import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  registerForm: FormGroup;
    loading = false;
    submitted = false;
    error = '';
    
    constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      private authService: AuthService
    ) {
      this.registerForm = this.formBuilder.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      }, {
        validator: this.mustMatch('password', 'confirmPassword')
      });
    }
    
    // Convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }
    
    // Custom validator to check if password and confirm password match
    mustMatch(controlName: string, matchingControlName: string) {
      return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];
  
        if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
          return;
        }
  
        if (control.value !== matchingControl.value) {
          matchingControl.setErrors({ mustMatch: true });
        } else {
          matchingControl.setErrors(null);
        }
      };
    }
    
    onSubmit() {
      this.submitted = true;
      
      if (this.registerForm.invalid) {
        return;
      }
      
      this.loading = true;
      this.error = '';
      
      this.authService.register(
        this.f['username'].value,
        this.f['email'].value,
        this.f['password'].value
      ).subscribe({
        next: () => {
          this.router.navigate([`/auth/verify/${this.f['email'].value}`]);
        },
        error: error => {
          this.error = error;
          this.loading = false;
        }
      });
    }
    
    // Demo function to simulate registration without backend
    simulateRegister() {
      this.loading = true;
      this.error = '';
      
      setTimeout(() => {
        this.authService.simulateLogin('NewPlayer' + Math.floor(Math.random() * 1000));
        this.router.navigate(['/levels']);
        this.loading = false;
      }, 800);
    }
  }