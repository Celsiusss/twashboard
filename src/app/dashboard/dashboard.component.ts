import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  QueryList,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import '../../assets/js/magnet.min';
import { fromEvent, merge, Subscription } from 'rxjs';
import { map, mergeMap, take, takeUntil, tap } from 'rxjs/operators';
import { WidgetComponent } from './widget/widget.component';

declare var Magnet: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  @ViewChildren('widgetViews', { read: ViewContainerRef })
  widgetViewContainerRefs: QueryList<ViewContainerRef>;
  @ViewChildren('widgets') widgetElementRefs: QueryList<
    ElementRef<HTMLDivElement>
  >;

  widgets: string[] = [];
  widgetComponentRefs: (ComponentRef<WidgetComponent>)[] = [];

  widgetsDraggingSubscription: Subscription;
  widgetsResizeSubscription: Subscription;

  readonly magnet = new Magnet();
  sideNavOpen = true;
  isResizing = false;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  newWidget() {
    this.widgets.push('information');

    const registerDraggingHandler = () => {
      if (this.widgetsDraggingSubscription) {
        this.widgetsDraggingSubscription.unsubscribe();
      }
      if (this.widgetsResizeSubscription) {
        this.widgetsResizeSubscription.unsubscribe();
      }
      this.widgetsDraggingSubscription = merge(
        this.widgetComponentRefs.map(ref =>
          ref.instance.dragging.asObservable()
        )
      )
        .pipe(
          mergeMap(obs => obs),
          tap(dragging => this.magnet.setAllowDrag(dragging))
        )
        .subscribe();
      this.widgetsResizeSubscription = merge(
        this.widgetComponentRefs.map(ref =>
          ref.instance.startResize.asObservable()
        )
      )
        .pipe(
          mergeMap(obs => obs),
          tap(widgetIndex =>
            this.onResize(
              this.widgetElementRefs.toArray()[widgetIndex].nativeElement
            )
          )
        )
        .subscribe();
    };

    setTimeout(() => {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        WidgetComponent
      );

      const newComponentRef = this.widgetViewContainerRefs.last.createComponent(
        componentFactory
      );
      newComponentRef.instance.widgetIndex = this.widgetComponentRefs.length;
      this.widgetComponentRefs.push(newComponentRef);
      this.magnet.add(this.widgetElementRefs.last.nativeElement);
      registerDraggingHandler();
    });
  }

  ngAfterViewInit(): void {
    this.magnet.distance(15);
    this.magnet.attractable(true);
    this.magnet.allowCtrlKey(true);
    this.magnet.setAllowDrag(false);
  }

  onResize(element: HTMLElement) {
    const resize = (event: MouseEvent) => {
      element.style.width =
        event.clientX -
        element.getBoundingClientRect().left +
        document.documentElement.scrollLeft +
        'px';
      element.style.height =
        event.clientY -
        element.getBoundingClientRect().top +
        document.documentElement.scrollTop +
        'px';
    };

    this.isResizing = true;
    console.log('resize init');
    const cancel = fromEvent(document, 'mouseup').pipe(
      take(1),
      map(() => true),
      tap(() => (this.isResizing = false))
    );

    fromEvent(document, 'mousemove')
      .pipe(
        tap(() => console.log('rresizing')),
        takeUntil(cancel)
      )
      .subscribe(resize);
  }
}
