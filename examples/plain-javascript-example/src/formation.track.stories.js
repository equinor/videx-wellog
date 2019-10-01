import { FormationTrack, BasicTrackViewer } from '../../../src/index';

export default { title: 'Formation track' };

export const withFormationTrack = () => {
  const data = [
    {
      from: 142.2,
      to: 812,
      name: 'formation1',
      color: { r: 255, g: 229, b: 0 },
    },
    {
      from: 814,
      to: 1200,
      name: 'formation2',
      color: { r: 0, g: 229, b: 215 },
    },
  ];

  const completionTrack = new FormationTrack('frm', {
    width: '1',
    maxWidth: 40,
    data: () => Promise.resolve(data),
  });

  const div = document.createElement('div');

  div.style.width = '100px';
  div.style.height = '500px';

  const trackViewer = new BasicTrackViewer([completionTrack], [100, 1400]);
  trackViewer.init(div, { width: 100, height: 500 });

  return div;
};

