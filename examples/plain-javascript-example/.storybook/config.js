import { configure } from '@storybook/html';
import './styles.scss';

configure(require.context('../src', true, /\.stories\.js$/), module);
