import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  loginProgress = 0;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  updateProgress(): void {
    const usernameValue = this.f['username'].value ? 1 : 0;
    const passwordValue = this.f['password'].value ? 1 : 0;
    const totalFields = 2;
    const completedFields = usernameValue + passwordValue;
    
    this.loginProgress = Math.round((completedFields / totalFields) * 100);
  }

  onLogin(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Show animation for 1.5 seconds
    setTimeout(() => {
      // Here you would normally call your authentication service
      // For demo, we're just redirecting after a delay
      this.loading = false;
      // Navigate to game dashboard or main screen
      // this.router.navigate(['/dashboard']);
      alert('Login successful! Redirecting to game...');
    }, 1500);
  }

  goToRegister(): void {
    // Navigate to register page
    this.router.navigate(['/auth/register']);
  }
}