import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Rating } from '@shared/components/rating/rating';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { RatingModule } from 'primeng/rating';


@Component({
  selector: 'app-reviews-tab',
  imports: [CommonModule, Rating, FormsModule, ReactiveFormsModule, RatingModule],
  templateUrl: './reviews-tab.html',
  styleUrl: './reviews-tab.scss'
})
export class ReviewsTab implements OnInit {

  // Rating
  rating: number = 5;
  numberOfReviews: number[] = [4, 0, 0, 0, 2];
  sumOfReviews: number = 0;

  // Form
  reviewsForm: FormGroup;
  userRating: number = 0;

  constructor(private fb: FormBuilder) {
    this.reviewsForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      review: ['', [Validators.required]],
    });
  }

  ngOnInit() {

    this.sumOfReviews = this.numberOfReviews.reduce((acc, curr) => acc + curr, 0);
  }
}
