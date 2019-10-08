import { configure } from '@storybook/html';
import '../../../src/styles.scss';

configure(require.context('../src', true, /\.stories\.js$/), module);
