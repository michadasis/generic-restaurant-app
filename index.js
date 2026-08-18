import { registerWidgetTaskHandler } from 'react-native-android-widget';
import 'expo-router/entry';
import { widgetTaskHandler } from './widget/widget-task-handler';

registerWidgetTaskHandler(widgetTaskHandler);
