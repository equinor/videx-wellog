import {
  ScaleTrack,
  FormationTrack,
  scaleLegendConfig,
  LegendHelper,
} from '../../../../src/index';
import { formationData } from './mock-data';

export const scaleTrack = new ScaleTrack('scale', {
  label: 'MD',
  abbr: 'MD',
  maxWidth: 45,
  legendConfig: scaleLegendConfig,
});

export const formationTrack = new FormationTrack('frm', {
  label: 'Formations',
  abbr: 'Frm',
  width: '1',
  maxWidth: 40,
  data: () => Promise.resolve(formationData),
  legendConfig: LegendHelper.basicVerticalLabel(),
});
