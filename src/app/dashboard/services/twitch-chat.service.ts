import { Injectable } from '@angular/core';
import { TwitchService } from './twitch.service';
import { AuthService } from '../../services/auth.service';
import * as queryString from 'querystring';
import { Logger } from '../../utils/Logger';
import { HttpClient } from '@angular/common/http';
import { Badge, Badges, ChatLine, ChatUser } from '../../models';

@Injectable()
export class TwitchChatService {
  private chatSocket: WebSocket;

  constructor(
    private twitch: TwitchService,
    private auth: AuthService,
    private http: HttpClient
  ) {}
  chatHistory: ChatLine[] = [];

  users: { username?: ChatUser } = {};
  allBadges: Badges;

  logger = new Logger('IRC', 'blue');

  async initChat() {
    this.allBadges = await this.getBadges();
    this.logger.info(
      `Found ${Object.keys(this.allBadges.badge_sets).length} badges`
    );
    const accessToken = this.twitch.userTokens.access_token;
    this.chatSocket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
    this.chatSocket.onopen = event => {
      this.chatSocket.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
      this.chatSocket.send('PASS oauth:' + accessToken);
      this.chatSocket.send('NICK ' + 'CelsiussDsd');
    };
    this.chatSocket.onmessage = async event => {
      this.logger.info(event.data);
      if (event.data.includes('Welcome, GLHF!')) {
        this.chatSocket.send('JOIN #celsiussd');
        this.addMessage('Welcome to the chat room!');
        return;
      }
      if (event.data.includes('Login authentication failed')) {
        await this.auth.refreshToken();
        this.chatSocket.send(
          'PASS oauth:' + this.twitch.userTokens.access_token
        );
        return;
      }
      if (event.data.toString().trim() === 'PING :tmi.twitch.tv') {
        this.chatSocket.send('PONG :tmi.twitch.tv');
        return;
      }

      try {
        this.processMessage(event.data);
      } catch (e) {
        this.logger.error(e);
      }
    };
  }

  processMessage(IRCMessage: string) {
    const type = getType(IRCMessage);
    if (type === 'USERSTATE') {
      const metaMatch = /@(.*?) /.exec(IRCMessage);
      const meta: { [key: string]: string | string[] } = queryString.parse(
        metaMatch[1].replace(/;/g, '&')
      );
      const username = meta['display-name'].toString().toLocaleLowerCase();
      const color = meta.color;
      let badges: Badge[] = [];

      if (meta.badges) {
        if (isStringArray(meta.badges)) {
          badges = meta.badges.map(badge => getBadgeFromString(badge));
        } else {
          badges.push(getBadgeFromString(meta.badges));
        }
      } else {
        badges = null;
      }

      this.users[username] = { ...meta, color, badges };
      this.logger.info(this.users);
    } else if (type === 'PRIVMSG') {
      const { name, message } = formatChat(IRCMessage);
      const user: { [key: string]: string | any } = this.users[name]
        ? this.users[name]
        : null;

      this.logger.info({ name, message });

      const badges: Badge[] = user.badges;

      this.addMessage({
        name: user['display-name'],
        message,
        color: user.color,
        badges
      });
    }
  }

  addMessage(chatLine: ChatLine) {
    this.chatHistory = [...this.chatHistory, chatLine];
  }

  async getBadges() {
    try {
      return await this.http
        .get<Badges>('https://badges.twitch.tv/v1/badges/global/display')
        .toPromise();
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}

function formatChat(line: string) {
  const metaMatch = /@(.*?) /.exec(line);
  const meta = queryString.parse(metaMatch[1].replace(';', '&'), {
    arrayFormat: 'comma'
  });

  const type = getType(line);

  if (type === 'PRIVMSG') {
    const [metaString, host, _, channel] = line.split(' ');
    const message = line
      .split(' ')
      .slice(4)
      .join(' ')
      .substr(1);

    const name = getName(host);

    return { name, message, meta };
  }

  return null;
}

function getName(host: string) {
  return /:(.*?)!/.exec(host)[1];
}

function getType(message: string) {
  const type = message.split(' ')[2].trim();
  return ['USERSTATE', 'NOTICE', 'PRIVMSG', 'ROOMSTATE', 'USERSTATE'].some(
    el => el === type
  )
    ? type
    : null;
}

function getBadgeFromString(badge: string): Badge {
  const array = badge.split('/');
  return { title: array[0], version: array[1] };
}

function isStringArray(value: string | string[]): value is string[] {
  return !!(value as string[]).map;
}
