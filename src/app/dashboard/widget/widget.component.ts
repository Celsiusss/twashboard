import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { InformationComponent } from '../widgets/information/information.component';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent implements OnInit {
  @Output() dragging = new EventEmitter<boolean>();
  @Output() startResize = new EventEmitter<number>();
  @ViewChild('component', { read: ViewContainerRef, static: true })
  viewContainerRef: ViewContainerRef;

  widgetIndex = 0;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {
  }

  initComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      InformationComponent
    );

    const newComponentRef = this.viewContainerRef.createComponent(
      componentFactory
    );
  }

  onDrag() {
    this.dragging.emit(true);
  }
  onNoDrag() {
    this.dragging.emit(false);
  }
  onStartResize() {
    this.startResize.emit(this.widgetIndex);
  }
}
