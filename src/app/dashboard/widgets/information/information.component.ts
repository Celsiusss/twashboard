import { Component, OnInit } from '@angular/core';
import { Widget } from '../../../models';
import { TwitchService } from '../../services/twitch.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements Widget, OnInit {
  widgetInformation = {
    initialHeight: 200,
    initialWidth: 200,
    name: 'Information'
  };
  widgetConfig = null;

  constructor(public twitch: TwitchService) {}

  ngOnInit() {
  }
}
