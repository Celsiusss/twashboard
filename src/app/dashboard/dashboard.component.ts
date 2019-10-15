import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import '../../assets/js/magnet.min';
import { fromEvent, merge, Subscription } from 'rxjs';
import { map, mergeMap, take, takeUntil, tap } from 'rxjs/operators';
import { WidgetService } from './services/widget.service';
import { WidgetStructure } from '../models';

declare var Magnet: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit, AfterContentChecked {
  @ViewChildren('widgetViews', { read: ViewContainerRef })
  widgetViewContainerRefs: QueryList<ViewContainerRef>;
  @ViewChildren('widgets') widgetElementRefs: QueryList<
    ElementRef<HTMLDivElement>
  >;

  widgetsDraggingSubscription: Subscription;
  widgetsResizeSubscription: Subscription;

  readonly magnet = new Magnet();
  sideNavOpen = true;
  isResizing = false;

  constructor(public widgetsService: WidgetService) {}

  ngAfterContentChecked(): void {
    this.widgetsService.widgetViewContainerRefs = this.widgetViewContainerRefs;
  }

  async newWidget(widgetSlug: string, structure?: WidgetStructure) {
    const registerDraggingHandler = () => {
      if (this.widgetsDraggingSubscription) {
        this.widgetsDraggingSubscription.unsubscribe();
      }
      if (this.widgetsResizeSubscription) {
        this.widgetsResizeSubscription.unsubscribe();
      }
      this.widgetsDraggingSubscription = merge(
        this.widgetsService.widgetComponentRefs.map(ref =>
          ref.widget.instance.dragging.asObservable()
        )
      )
        .pipe(
          mergeMap(obs => obs),
          tap(widgetId => this.widgetsService.saveWidgetPosition(widgetId)),
          tap(widgetId => this.magnet.setAllowDrag(!widgetId))
        )
        .subscribe();
      this.widgetsResizeSubscription = merge(
        this.widgetsService.widgetComponentRefs.map(ref =>
          ref.widget.instance.startResize.asObservable()
        )
      )
        .pipe(
          mergeMap(obs => obs),
          tap(widgetId => this.onResize(widgetId))
        )
        .subscribe();
    };

    const newComponentRef = await this.widgetsService.initNewWidget(
      widgetSlug,
      this.widgetViewContainerRefs,
      structure ? structure.id : undefined
    );

    this.magnet.add(this.widgetElementRefs.last.nativeElement);
    registerDraggingHandler();

    let width =
      newComponentRef.instance.widgetInformation.initialWidth +
      document.documentElement.scrollTop;
    let height =
      newComponentRef.instance.widgetInformation.initialHeight +
      document.documentElement.scrollLeft;

    if (structure) {
      width = structure.width;
      height = structure.height;

      const { posX, posY } = structure;
      this.widgetElementRefs.last.nativeElement.style.left = posX + 'px';
      this.widgetElementRefs.last.nativeElement.style.top = posY + 'px';
    }

    this.widgetElementRefs.last.nativeElement.style.height = height + 'px';
    this.widgetElementRefs.last.nativeElement.style.width = width + 'px';
  }

  async ngAfterViewInit() {
    this.magnet.distance(6);
    this.magnet.attractable(true);
    this.magnet.allowCtrlKey(true);
    this.magnet.setAllowDrag(false);
    this.magnet.stayInParent(true);

    const widgets = await this.widgetsService.retrieveWidgets();
    for (const widget of widgets) {
      await this.newWidget(widget.type, widget);
    }
  }

  onResize(widgetId: string) {
    const element = this.widgetElementRefs.toArray()[
      this.widgetsService.getWidgetNumber(widgetId)
    ].nativeElement;

    let width = 0;
    let height = 0;

    const resize = (event: MouseEvent) => {
      width =
        event.clientX -
        element.getBoundingClientRect().left +
        document.documentElement.scrollLeft;
      height =
        event.clientY -
        element.getBoundingClientRect().top +
        document.documentElement.scrollTop;

      element.style.width = width + 'px';
      element.style.height = height + 'px';
    };

    this.isResizing = true;
    console.log('resize init');
    const cancel = fromEvent(document, 'mouseup').pipe(
      take(1),
      map(() => true),
      tap(() => (this.isResizing = false)),
      tap(() => this.widgetsService.saveWidgetSize(widgetId, width, height))
    );

    fromEvent(document, 'mousemove')
      .pipe(
        tap(() => console.log('rresizing')),
        takeUntil(cancel)
      )
      .subscribe(resize);
  }
}
