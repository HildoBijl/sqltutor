import { type VectorInput, type Vector } from '@/utils';

import { type DefaultObjectProps } from '../definitions';

export interface ArrowHeadProps extends DefaultObjectProps<SVGPolygonElement> {
	position?: Vector;
	angle?: number;
	size?: number;
	color?: string;
}

export interface LineWithoutArrowsProps extends DefaultObjectProps<SVGPathElement> {
	points: VectorInput[];
	close?: boolean;
	size?: number;
	color?: string;
}

export interface ArrowLineExtras {
	arrow?: Partial<ArrowHeadProps> | boolean;
	startArrow?: Partial<ArrowHeadProps> | boolean;
	endArrow?: Partial<ArrowHeadProps> | boolean;
	lineStyle?: React.CSSProperties;
}

export interface LineProps extends LineWithoutArrowsProps, ArrowLineExtras {}

export interface CurveWithoutArrowsProps extends LineWithoutArrowsProps {
	through?: boolean;
	curveRatio?: number;
	curveDistance?: number;
}

export interface CurveProps extends CurveWithoutArrowsProps, ArrowLineExtras {}
