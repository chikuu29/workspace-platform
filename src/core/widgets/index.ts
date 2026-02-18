import { ComponentRegistry } from '../registry/ComponentRegistry';
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

// Register widgets
ComponentRegistry.register('textField', TextField);
ComponentRegistry.register('radioField', RadioField);
ComponentRegistry.register('textAreaField', TextArea);
ComponentRegistry.register('uploadField', UploadField);
ComponentRegistry.register('panel', CollapsiblePanel);
ComponentRegistry.register('grid', Grid);
ComponentRegistry.register('stepper', StepperWidget);
ComponentRegistry.register('kpi', KPITile);
ComponentRegistry.register('kpiTable', KPITable);
ComponentRegistry.register('tabs', TabsWidget);

export { TextField, RadioField, TextArea, UploadField, CollapsiblePanel, Grid, StepperWidget, KPITile, KPITable, TabsWidget };
