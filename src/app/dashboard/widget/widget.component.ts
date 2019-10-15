import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Output,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Widget, WidgetConfig, WidgetInformation } from '../../models';
import { WidgetService } from '../services/widget.service';
import { MatDialog } from '@angular/material';
import { WidgetOptionsComponent } from './widget-options/widget-options.component';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent {
  // outputs null on drag start, and the widgetId on drag end
  @Output() dragging = new EventEmitter<string | null>();
  @Output() startResize = new EventEmitter<string>();
  @ViewChild('component', { read: ViewContainerRef, static: true })
  viewContainerRef: ViewContainerRef;
  componentInstance: Widget;

  widgetId: string;

  widgetInformation: WidgetInformation = {
    name: '',
    initialHeight: 100,
    initialWidth: 100
  };
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    public widgetService: WidgetService,
    private dialog: MatDialog
  ) {}

  initComponent(component: Type<Widget>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      component
    );

    const newComponentRef = this.viewContainerRef.createComponent(
      componentFactory
    );

    this.widgetInformation = newComponentRef.instance.widgetInformation;
    this.componentInstance = newComponentRef.instance;
  }

  openOptions() {
    const dialogRef = this.dialog.open(WidgetOptionsComponent, {
      width: '400px',
      data: this.componentInstance.widgetConfig
    });
    dialogRef.afterClosed().subscribe((result: WidgetConfig) => {
      if (result) {
        this.componentInstance.widgetConfig = result;
      }
    });
  }

  onDrag() {
    this.dragging.emit(null);

    fromEvent(document, 'mouseup')
      .pipe(take(1))
      .subscribe(() => this.onNoDrag());
  }
  onNoDrag() {
    this.dragging.emit(this.widgetId);
  }
  onStartResize() {
    this.startResize.emit(this.widgetId);
  }
}
