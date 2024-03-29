// import '../../../src/styles.scss';
import './styles.scss';

/** @type { import('@storybook/html').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Plot types', 'Track types', 'Log Controller', 'Log Viewer'],
      }
    },
  },
};

export default preview;
