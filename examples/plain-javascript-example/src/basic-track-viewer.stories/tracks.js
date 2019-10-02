import {
  ScaleTrack,
  FormationTrack,
} from '../../../../src/index';
import { formationData } from './mock-data';

export const scaleTrack = new ScaleTrack('scale', {
  maxWidth: 45,
});

export const formationTrack = new FormationTrack('frm', {
  width: '1',
  maxWidth: 40,
  data: () => Promise.resolve(formationData),
});
