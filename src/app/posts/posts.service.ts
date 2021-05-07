import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Post} from './post.model';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';

const BACKEND_URL = `${environment.apiUrl}/posts/`;

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPostUpdateListener(): Observable<{posts: Post[], postCount: number}> {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string): Observable<{_id: string, title: string, content: string, imagePath: string, creator: string}> {
    return this.http
      .get<{_id: string, title: string, content: string, imagePath: string, creator: string}>(
        BACKEND_URL + id);
  }

  getPosts(postsPerPage: number, currentPage: number): void {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{message: string, posts: any, maxPosts: number}>(
        BACKEND_URL + queryParams
      )
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          maxPosts: postData.maxPosts
        };
      }))
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        });
      });
  }

  addPost(title: string, content: string, image: File): void {
    const postData: any = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{message: string, post: Post}>(
        BACKEND_URL,
        postData
      )
      .subscribe(() => {
        this.router
          .navigate(['/'])
          .then();
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string): void {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id,
        title,
        content,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put(BACKEND_URL + id, postData)
      .subscribe(() => {
        this.router
          .navigate(['/'])
          .then();
      });
  }

  deletePost(postId: string): Observable<any> {
    return this.http
      .delete(BACKEND_URL + postId);
  }
}
