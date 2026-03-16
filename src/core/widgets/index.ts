import { WidgetRegistry } from '../registry/WidgetRegistry';
import TextField from './TextField';
import RadioField from './RadioField';
import TextArea from './TextArea';
import UploadField from './UploadField';
import CollapsiblePanel from './Panel';
import Grid from './Grid';
import StepperWidget from './Stepper';
import KPITile from './KPITile';
import KPITable from './KPITable';
import TabsWidget from './TabsWidget';
import DateField from './DateField';
import DateTimeField from './DateTimeField';

import SelectField from './SelectField';
import SwitchField from './SwitchField';
import CardGrid from './CardGrid';

// Register widgets
WidgetRegistry.register('textField', TextField);
WidgetRegistry.register('radioField', RadioField);
WidgetRegistry.register('textAreaField', TextArea);
WidgetRegistry.register('uploadField', UploadField);
WidgetRegistry.register('panel', CollapsiblePanel);
WidgetRegistry.register('grid', Grid);
WidgetRegistry.register('stepper', StepperWidget);
WidgetRegistry.register('kpi', KPITile);
WidgetRegistry.register('kpiTable', KPITable);
WidgetRegistry.register('tabs', TabsWidget);
WidgetRegistry.register('dateField', DateField);
WidgetRegistry.register('dateAndTimeField', DateTimeField);
WidgetRegistry.register('selectField', SelectField);
WidgetRegistry.register('switchField', SwitchField);
WidgetRegistry.register('cardGrid', CardGrid);

export { TextField, RadioField, TextArea, UploadField, CollapsiblePanel, Grid, StepperWidget, KPITile, KPITable, TabsWidget, DateField, DateTimeField, SelectField, SwitchField, CardGrid };

