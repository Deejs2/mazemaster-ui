import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  registerProgress = 0;
  avatars = [0, 1, 2, 3]; // Avatar options
  selectedAvatar = 0;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  selectAvatar(index: number): void {
    this.selectedAvatar = index;
    this.updateRegisterProgress();
  }

  updateRegisterProgress(): void {
    const usernameValue = this.f['username'].value && this.f['username'].value.length >= 3 ? 1 : 0;
    const emailValue = this.f['email'].value && this.f['email'].valid ? 1 : 0;
    const passwordValue = this.f['password'].value && this.f['password'].value.length >= 6 ? 1 : 0;
    const confirmPasswordValue = this.f['confirmPassword'].value && 
                                this.f['password'].value === this.f['confirmPassword'].value ? 1 : 0;
    const avatarSelected = this.selectedAvatar !== null ? 1 : 0;
    
    const totalFields = 5;
    const completedFields = usernameValue + emailValue + passwordValue + confirmPasswordValue + avatarSelected;
    
    this.registerProgress = Math.round((completedFields / totalFields) * 100);
  }

  onRegister(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Show animation for 1.5 seconds
    setTimeout(() => {
      // Here you would normally call your user registration service
      // For demo, we're just redirecting after a delay
      this.loading = false;
      alert('Registration successful! Redirecting to login...');
      this.goToLogin();
    }, 1500);
  }

  goToLogin(): void {
    // Navigate to login page
    this.router.navigate(['/auth/login']);
  }
}

function MustMatch(arg0: string, arg1: string): any {
  return (formGroup: FormGroup) => {
    const password = formGroup.controls[arg0];
    const confirmPassword = formGroup.controls[arg1];

    if (confirmPassword.errors && !confirmPassword.errors['mustMatch']) {
      return;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mustMatch: true });
    } else {
      confirmPassword.setErrors(null);
    }
  };
}
