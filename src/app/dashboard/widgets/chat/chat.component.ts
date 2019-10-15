import { Component, OnInit } from '@angular/core';
import { Widget } from '../../../models';
import { TwitchChatService } from '../../services/twitch-chat.service';
import { ChatConfig } from '../../../models';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements Widget, OnInit {
  widgetInformation = { initialHeight: 500, initialWidth: 200, name: 'Chat' };

  widgetConfig: ChatConfig = {
    type: 'chat',
    config: {
      badges: {
        value: true,
        type: 'toggle'
      },
      font: {
        type: 'number',
        value: 1
      }
    }
  };

  constructor(public chat: TwitchChatService) {}

  ngOnInit() {
    this.chat.initChat();
  }
}
