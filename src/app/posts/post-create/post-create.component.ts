import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { mimeType } from './mime-type.validator';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  post: Post;
  isLoading = false;
  postForm: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private postId: string;
  private authStatusSub: Subscription;

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    private authService: AuthService
  ){}

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
    this.postForm = new FormGroup({
      title: new FormControl(
        null,
        {
          validators: [Validators.required, Validators.minLength(3)]
        }),
      content: new FormControl(
        null,
        {
          validators: [Validators.required, Validators.minLength(3)]
        }
      ),
      image: new FormControl(
        null,
        {
          validators: [Validators.required],
          asyncValidators: [mimeType]
        })
    });
    this.route.paramMap.subscribe((paramMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService
          .getPost(this.postId)
          .subscribe(response => {
            this.isLoading = false;
            this.imagePreview = response.imagePath;
            this.post = {
              id: response._id,
              title: response.title,
              content: response.content,
              imagePath: response.imagePath,
              creator: response.creator
            };
            this.postForm.setValue({
              title: this.post.title,
              content: this.post.content,
              image: this.post.imagePath
            });
          });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }


  onImagePicked(event: Event): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.postForm.patchValue({image: file});
    this.postForm.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost(): void {
    if (this.postForm.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService
        .addPost(
          this.postForm.value.title,
          this.postForm.value.content,
          this.postForm.value.image
      );
    } else {
      this.postsService
        .updatePost(
          this.postId,
          this.postForm.value.title,
          this.postForm.value.content,
          this.postForm.value.image
        );
    }
    this.postForm.reset();
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
}
