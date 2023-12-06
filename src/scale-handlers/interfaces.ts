import { ZoomTransform } from 'd3';
import { Domain, Range, Scale } from '../common/interfaces';

export interface ScaleHandler {
  scale: Scale,
  dataScale: Scale,
  baseDomain(): Domain,
  baseDomain(newDomain: Domain) : ScaleHandler,
  baseDomain(newDomain?: Domain) : ScaleHandler | Domain,
  range(): Range,
  range(newRange: Range): ScaleHandler,
  range(newRange?: Range): ScaleHandler | Range,
  rescale(transform: ZoomTransform, axis?: string) : void,
}

export interface ScaleHandlerTicks {
  major: number[],
  minor: number[],
}

export interface ScaleInterpolator {
  forward(v:number) : number,
  reverse(v:number) : number,
  forwardInterpolatedDomain(domain : Domain) : Domain,
  reverseInterpolatedDomain(domain : Domain) : Domain,
}
