import { configure } from '@storybook/html';
import '../../../src/styles.scss';
import { injectMultiSelect } from '../../../src/index';

injectMultiSelect();
configure(require.context('../src', true, /\.stories\.js$/), module);
