import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  queryParamsSub: Subscription;

  ngOnInit() {
    this.queryParamsSub = this.route.queryParams
      .pipe(
        filter(params => params.code),
        map(params => params.code)
      )
      .subscribe(code => this.auth.getTokens(code));
  }

  ngOnDestroy(): void {
    this.queryParamsSub.unsubscribe();
  }
}
