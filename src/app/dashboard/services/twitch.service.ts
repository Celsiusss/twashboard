import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as queryString from 'querystring';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '../../utils/Logger';

export interface TwitchStorage {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string[];
  token_type: 'bearer';
  userId: string;
}

interface StreamInfo {
  game_id: string;
  id: string;
  language: string;
  pagination: string;
  started_at: string;
  tag_ids: string[];
  thumbnail_url: string;
  title: string;
  type: 'live' | '';
  user_id: string;
  user_name: string;
  viewer_count: number;
}

@Injectable()
export class TwitchService {
  userTokens: TwitchStorage = JSON.parse(localStorage.getItem('twitch'));

  streamInfo: StreamInfo = {
    game_id: '',
    id: '',
    language: '',
    pagination: '',
    started_at: '',
    tag_ids: [],
    thumbnail_url: '',
    title: '',
    type: '',
    user_id: '',
    user_name: '',
    viewer_count: 0
  };

  constructor(private http: HttpClient) {
    this.init();
  }

  logger = new Logger('TWITCH', 'purple');

  async init() {
    this.getStreamInfo().subscribe(data => {
      if (data.length) {
        this.streamInfo = data[0];
      }
    });
  }

  getStreamInfo = () =>
    this.twitchRequest<StreamInfo[]>('https://api.twitch.tv/helix/streams', {
      user_id: this.userTokens.userId
    });

  twitchRequest<T>(url: string, params?: any, body?: any): Observable<T> {
    const headers = {
      Authorization: 'Bearer ' + this.userTokens.access_token
    };
    url = params ? `${url}?${queryString.stringify(params)}` : url;
    if (body) {
      return this.http
        .post<{ data: T }>(url, body, {
          headers
        })
        .pipe(map(response => response.data));
    } else {
      return this.http
        .get<{ data: T }>(url, {
          headers
        })
        .pipe(map(response => response.data));
    }
  }
}
