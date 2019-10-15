import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { RouterModule, Routes } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { InformationComponent } from './widgets/information/information.component';
import { WidgetComponent } from './widget/widget.component';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { ChatComponent } from './widgets/chat/chat.component';
import { WidgetService } from './services/widget.service';
import { MatRippleModule } from '@angular/material/core';
import { TwitchService } from './services/twitch.service';
import { TwitchChatService } from './services/twitch-chat.service';
import { WidgetOptionsComponent } from './widget/widget-options/widget-options.component';
import { MatDialogModule, MatInputModule, MatSlideToggleModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [{ path: '', component: DashboardComponent }];

@NgModule({
  declarations: [
    DashboardComponent,
    SidemenuComponent,
    InformationComponent,
    WidgetComponent,
    ChatComponent,
    WidgetOptionsComponent
  ],
  imports: [
    CommonModule,
    AngularFirestoreModule,
    RouterModule.forChild(routes),
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatRippleModule,
    MatDialogModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  entryComponents: [
    InformationComponent,
    WidgetComponent,
    ChatComponent,
    WidgetOptionsComponent
  ],
  providers: [WidgetService, TwitchService, TwitchChatService]
})
export class DashboardModule {}
