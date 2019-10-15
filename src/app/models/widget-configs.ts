export interface ChatConfig extends WidgetConfig {
  type: 'chat';
  config: {
    badges: ConfigElement<boolean>;
    font: ConfigElement<number>;
  }
}

export interface ConfigElement<T> {
  type: 'toggle' | 'text' | 'number';
  value: T;
}
export interface WidgetConfig {
  type: string;
  config: {
    [key: string]: ConfigElement<any>
  }
}

export interface Widget {
  widgetInformation: WidgetInformation;
  widgetConfig: WidgetConfig;
}

export interface WidgetInformation {
  name: string;
  initialHeight: number;
  initialWidth: number;
}

export interface WidgetStructure {
  id: string;
  width: number;
  height: number;
  posX: number;
  posY: number;
  config: WidgetConfig;
  type: string;
}
