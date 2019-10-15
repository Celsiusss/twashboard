import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  QueryList,
  ViewContainerRef
} from '@angular/core';
import { InformationComponent } from '../widgets/information/information.component';
import { ChatComponent } from '../widgets/chat/chat.component';
import { WidgetComponent } from '../widget/widget.component';
import * as uuidv4 from 'uuid/v4';
import { first, take } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Logger } from '../../utils/Logger';
import { WidgetStructure } from '../../models';

export enum Widgets {
  Information = 'information',
  Chat = 'chat'
}

interface WidgetArrayStructure<T> {
  id: string;
  widget: T;
}

@Injectable()
export class WidgetService {
  widgetSlugs: Widgets[] = Object.values(Widgets);

  widgets: WidgetArrayStructure<string>[] = [];
  widgetComponentRefs: WidgetArrayStructure<
    ComponentRef<WidgetComponent>
  >[] = [];
  widgetViewContainerRefs: QueryList<ViewContainerRef>;

  logger = new Logger('WidgetService', 'orange');

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private fireStore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  async removeWidget(widgetId: string) {
    console.log('remove', this.widgetComponentRefs);
    this.widgets.splice(
      this.widgets.findIndex(widget => widget.id === widgetId),
      1
    );
    this.widgetComponentRefs.splice(
      this.widgetComponentRefs.findIndex(widget => widget.id === widgetId),
      1
    );

    try {
      const { uid } = await this.afAuth.authState.pipe(first()).toPromise();
      this.fireStore.doc(`users/${uid}/widgets/${widgetId}`).delete();
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  async initNewWidget(
    widgetSlug: string,
    widgetViewContainerRefs: QueryList<ViewContainerRef>,
    widgetId?: string
  ): Promise<ComponentRef<WidgetComponent>> {
    const uuid = widgetId ? widgetId : uuidv4();
    this.widgets.push({ id: uuid, widget: widgetSlug });

    return new Promise(resolve => {
      widgetViewContainerRefs.changes.pipe(take(1)).subscribe(() => {
        setTimeout(async () => {
          console.log(this.widgets);

          const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
            WidgetComponent
          );

          const newComponentRef = this.widgetViewContainerRefs.last.createComponent(
            componentFactory
          );
          newComponentRef.instance.initComponent(
            createWidgetComponent(widgetSlug)
          );
          newComponentRef.instance.widgetId = uuid;
          this.widgetComponentRefs.push({ id: uuid, widget: newComponentRef });
          const userId = this.afAuth.auth.currentUser.uid;
          if (!widgetId) {
            await this.fireStore
              .collection('users')
              .doc(userId)
              .collection('widgets')
              .doc(uuid)
              .set({
                id: uuid,
                type: widgetSlug
              });
            await this.saveWidgetSize(
              uuid,
              newComponentRef.instance.widgetInformation.initialWidth,
              newComponentRef.instance.widgetInformation.initialHeight
            );
            await this.saveWidgetPosition(uuid);
          }
          resolve(newComponentRef);
        });
      });
    });
  }

  async saveWidgetSize(widgetId: string, width: number, height: number) {
    const userId = this.afAuth.auth.currentUser.uid;

    return await this.fireStore
      .doc(`users/${userId}/widgets/${widgetId}`)
      .update({
        width,
        height
      });
  }
  async saveWidgetPosition(widgetId: string) {
    if (widgetId && this.widgetComponentRefs) {
      const widget = this.widgetComponentRefs.find(w => w.id === widgetId)
        .widget;
      const widgetElement = widget.location.nativeElement as HTMLElement;
      const widgetParent = widgetElement.parentElement;

      if (widgetParent) {
        const userId = this.afAuth.auth.currentUser.uid;
        const posX = +widgetParent.style.left.replace('px', '');
        const posY = +widgetParent.style.top.replace('px', '');
        console.log(posX, posY);
        console.log(widgetId);
        return await this.fireStore
          .doc(`users/${userId}/widgets/${widgetId}`)
          .update({
            posX,
            posY
          });
      }
    }
    return;
  }

  async retrieveWidgets(): Promise<WidgetStructure[]> {
    try {
      const { uid } = await this.afAuth.authState.pipe(first()).toPromise();
      const widgetsSnapshot = await this.fireStore
        .collection(`users/${uid}/widgets`)
        .get()
        .toPromise();
      return widgetsSnapshot.docs.map(widgetDocRef =>
        widgetDocRef.data()
      ) as WidgetStructure[];
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  getWidgetNumber(id: string) {
    return this.widgets.findIndex(widget => widget.id === id);
  }
}

export function createWidgetComponent(slug: string) {
  switch (slug) {
    case 'information':
      return InformationComponent;
    case 'chat':
      return ChatComponent;
  }
}
