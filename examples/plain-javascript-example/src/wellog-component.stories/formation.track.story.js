import { WellogComponent } from '../../../../src/index';
import { scaleTrack, formationTrack } from '../shared/standard-tracks';

export const withFormationTrack = () => {
  const div = document.createElement('div');

  div.style.width = '85px';
  div.style.height = '500px';

  requestAnimationFrame(() => {
    const instance = new WellogComponent();
    instance.init(div);
    instance.domain = [0, 1500];
    instance.addTrack(scaleTrack);
    instance.addTrack(formationTrack);
  });

  return div;
};

