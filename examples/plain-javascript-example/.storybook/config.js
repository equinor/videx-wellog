import { configure } from '@storybook/html';
import '../../../src/styles.scss';
import './styles.scss';

configure(require.context('../src', true, /\.stories\.js$/), module);
