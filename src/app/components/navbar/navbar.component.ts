import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  
  scrolled = false;

  constructor() { }

  ngOnInit(): void {
    // Check scroll position on page load
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  checkScroll() {
    // Apply class when page is scrolled past 50px
    this.scrolled = window.pageYOffset > 50;
  }
}