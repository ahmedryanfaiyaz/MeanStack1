import {Component, OnDestroy, OnInit} from '@angular/core';
import { AuthService } from '../auth.service';
import {Subscription} from 'rxjs';

@Component({
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SignInComponent implements OnInit, OnDestroy{
  isLoading = false;
  private authStatusSub: Subscription;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }, error => {
        console.log(error);
      }
    );
  }

  onSignIn(signInForm: any): void {
    if (signInForm.invalid) {
      return;
    }
    this.authService.signIn(signInForm.value.email, signInForm.value.password);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
}
