import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, interval, take } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { Modal } from 'bootstrap'; 

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  
  email: string | null = null;
  otpForm!: FormGroup;
  otpControls: number[] = [0, 1, 2, 3, 4, 5]; // For 6-digit OTP
  isLoading = false;
  isResending = false;
  errorMessage = '';
  cooldownTimer = 0;
  timerSubscription?: Subscription;
  
  // Modal instances
  private successModal: Modal | null = null;
  private errorModal: Modal | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    // Get the email from the route parameters
    const url = this.router.url;
    const emailParam = url.split('/').pop(); // Get the last part of the URL
    if (emailParam) {
      this.email = decodeURIComponent(emailParam); // Decode the email parameter
      console.log('Email:', this.email);
    } else {
      // Handle case where email is not provided
      console.error('Email not provided in route parameters');
      this.router.navigate(['/auth/register']);
    }
  }

  ngOnInit(): void {
    this.initializeForm();
    
    // Initialize modals after view is loaded
    setTimeout(() => {
      this.successModal = new Modal(document.getElementById('successModal')!);
      this.errorModal = new Modal(document.getElementById('errorModal')!);
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  initializeForm(): void {
    const formControls: Record<string, any> = {};
    
    // Create form controls for each digit
    this.otpControls.forEach(i => {
      formControls[`digit${i}`] = ['', [Validators.required, Validators.pattern(/^[0-9]$/)]];
    });
    
    this.otpForm = this.fb.group(formControls);
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    // Handle backspace
    if (event.key === 'Backspace') {
      if ((event.target as HTMLInputElement).value === '') {
        // Move to previous input if current is empty
        if (index > 0) {
          setTimeout(() => {
            this.otpInputs.get(index - 1)?.nativeElement.focus();
          });
        }
      }
    }
    
    // Allow only numbers, backspace, tab, and arrow keys
    if (
      !/^[0-9]$/.test(event.key) && 
      !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)
    ) {
      event.preventDefault();
    }
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // If input is a number and not empty
    if (/^[0-9]$/.test(value)) {
      // Move to next input
      if (index < this.otpControls.length - 1) {
        setTimeout(() => {
          this.otpInputs.get(index + 1)?.nativeElement.focus();
        });
      }
    } else if (value.length > 1) {
      // If pasting multiple digits, distribute them
      const digits = value.split('').filter(char => /^[0-9]$/.test(char));
      
      // Fill current and subsequent inputs
      for (let i = 0; i < Math.min(digits.length, this.otpControls.length - index); i++) {
        this.otpForm.get(`digit${index + i}`)?.setValue(digits[i]);
      }
      
      // Focus on the next empty input or the last input
      const nextEmptyIndex = this.otpControls.findIndex((_, i) => 
        i >= index && !this.otpForm.get(`digit${i}`)?.value
      );
      
      const focusIndex = nextEmptyIndex !== -1 ? 
        nextEmptyIndex : 
        Math.min(index + digits.length, this.otpControls.length - 1);
      
      setTimeout(() => {
        this.otpInputs.get(focusIndex)?.nativeElement.focus();
      });
      
      // Set the current input to the first digit only
      input.value = digits[0] || '';
    }
  }

  isAnyDigitInvalid(): boolean {
    return this.otpControls.some(i => 
      this.otpForm.get(`digit${i}`)?.invalid && 
      (this.otpForm.get(`digit${i}`)?.dirty || this.otpForm.get(`digit${i}`)?.touched)
    );
  }

  getOtpValue(): string {
    return this.otpControls
      .map(i => this.otpForm.get(`digit${i}`)?.value || '')
      .join('');
  }

  verifyOtp(): void {
    if (this.otpForm.invalid) return;
    
    const otpValue = this.getOtpValue();
    
    if (!this.email) {
      this.showError('Email address is missing. Please try again.');
      return;
    }
    
    this.isLoading = true;
    
    this.authService.validateOtp(this.email, otpValue).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showSuccess();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('OTP verification failed:', error.error.error.details);
        this.showError(error.error.error.details || 'Invalid OTP. Please try again.');
        // Reset the form
        this.otpForm.reset();
        setTimeout(() => {
          this.otpInputs.first?.nativeElement.focus();
        });
        // Start cooldown timer
        this.startCooldownTimer();
      }
    });
  }

  resendOtp(): void {
    if (this.cooldownTimer > 0 || this.isResending) return;
    
    if (!this.email) {
      this.showError('Email address is missing. Please try again.');
      return;
    }
    
    this.isResending = true;
    
    this.authService.resendOtp(this.email).subscribe({
      next: () => {
        this.isResending = false;
        this.startCooldownTimer();
        
        // Reset the form
        this.otpForm.reset();
        setTimeout(() => {
          this.otpInputs.first?.nativeElement.focus();
        });
      },
      error: (error) => {
        this.isResending = false;
        console.error('Failed to resend OTP:', error);
        this.showError('Failed to resend OTP. Please try again later.');
      }
    });
  }

  startCooldownTimer(): void {
    this.cooldownTimer = 60; // 60 seconds cooldown
    
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    this.timerSubscription = interval(1000).pipe(
      take(this.cooldownTimer)
    ).subscribe(() => {
      this.cooldownTimer--;
    });
  }

  showSuccess(): void {
    this.successModal?.show();
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.errorModal?.show();
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}