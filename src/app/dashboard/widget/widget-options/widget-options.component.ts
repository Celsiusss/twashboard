import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ConfigElement, WidgetConfig } from '../../../models';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-widget-options',
  templateUrl: './widget-options.component.html',
  styleUrls: ['./widget-options.component.scss']
})
export class WidgetOptionsComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<WidgetOptionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WidgetConfig
  ) {}

  configLayout: { value: ConfigElement<any>; key: string }[] = [];
  form: FormGroup;

  ngOnInit() {
    if (this.data) {
      this.configLayout = Object.entries(this.data.config).map(
        ([key, value]) => ({ key, value })
      );
      this.form = this.toFormGroup(this.configLayout);
    }
  }

  save() {
    const config: WidgetConfig = this.data;

    Object.entries(this.form.value).forEach(([key, value]) => {
      config.config[key].value = value;
    });

    this.dialogRef.close(config);
  }

  toFormGroup(options: { value: ConfigElement<any>; key: string }[]) {
    const group: any = {};
    options.forEach(option => {
      group[option.key] = new FormControl(option.value.value);
    });
    return new FormGroup(group);
  }
}
