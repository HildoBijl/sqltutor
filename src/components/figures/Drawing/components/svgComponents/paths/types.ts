import { type VectorInput, type Vector } from '@/utils';

import { type DefaultObjectProps } from '../definitions';

export interface ArrowHeadProps extends DefaultObjectProps<SVGPolygonElement> {
	position?: Vector;
	angle?: number;
	size?: number;
	color?: string;
}

export interface LinePropsWithoutArrows extends DefaultObjectProps<SVGPathElement> {
	points: VectorInput[];
	close?: boolean;
	size?: number;
	color?: string;
}

export interface LineProps extends LinePropsWithoutArrows {
	arrow?: Partial<ArrowHeadProps> | boolean;
	startArrow?: Partial<ArrowHeadProps> | boolean;
	endArrow?: Partial<ArrowHeadProps> | boolean;
}

export interface CurvePropsWithoutArrows extends LinePropsWithoutArrows {
	through?: boolean;
	curveRatio?: number;
	curveDistance?: number;
}

export interface CurveProps extends CurvePropsWithoutArrows {
	arrow?: Partial<ArrowHeadProps> | boolean;
	startArrow?: Partial<ArrowHeadProps> | boolean;
	endArrow?: Partial<ArrowHeadProps> | boolean;
}
