/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import * as snabbdom from 'snabbdom-jsx';
import { VNode } from "snabbdom/vnode";
import { IView, RenderingContext, PolylineEdgeView, Point, toDegrees, angleOfPoint, maxDistance } from "sprotty/lib";
import { DependencyGraphNode, DependencyGraphEdge } from './graph-model';

const JSX = {createElement: snabbdom.svg};

export class DependencyNodeView implements IView {
    cornerRadius = 5;

    render(node: Readonly<DependencyGraphNode>, context: RenderingContext): VNode {
        return <g>
            <rect class-sprotty-node={true}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  class-resolved={node.resolved} class-error={node.error !== undefined}
                  x="0" y="0" rx={this.cornerRadius} ry={this.cornerRadius}
                  width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

export class DependencyEdgeView extends PolylineEdgeView {
    arrowLength = 10;
    arrowWidth = 8;
    labelOffset = 20;

    render(edge: Readonly<DependencyGraphEdge>, context: RenderingContext): VNode {
        const route = edge.route();
        if (route.length === 0)
            return this.renderDanglingEdge("Cannot compute route", edge, context);

        return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}
                  class-optional={edge.optional}>
            {this.renderLine(edge, route, context)}
            {this.renderAdditionals(edge, route, context)}
            {context.renderChildren(edge, { route })}
        </g>;
    }

    protected renderAdditionals(edge: DependencyGraphEdge, segments: Point[], context: RenderingContext): VNode[] {
        return [
            this.renderArrow(edge, segments),
            this.renderLabel(edge, segments)
        ];
    }

    protected renderArrow(edge: DependencyGraphEdge, segments: Point[]): VNode {
        const width = this.arrowWidth;
        const length = this.arrowLength;
        const p2 = segments[segments.length - 1];
        let p1: Point;
        let index = segments.length - 2;
        do {
            p1 = segments[index];
            index--;
        } while (index >= 0 && maxDistance(p1, p2) < length);
        const angle = angleOfPoint({ x: p1.x - p2.x, y: p1.y - p2.y });
        return <path class-arrow={true} d={`M -1.5,0 L ${length},-${width / 2} L ${length},${width / 2} Z`}
                  transform={`rotate(${toDegrees(angle)} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`}/>;
    }

    protected renderLabel(edge: DependencyGraphEdge, segments: Point[]): VNode {
        const offset = this.labelOffset;
        let p1, p2: Point;
        let index = segments.length - 1;
        do {
            p2 = segments[index];
            p1 = segments[index - 1];
            index--;
        } while (index > 0 && maxDistance(p1, p2) < offset);
        const angle = angleOfPoint({ x: p1.x - p2.x, y: p1.y - p2.y });
        const anchor: Point = {
            x: p2.x + Math.cos(angle) * offset,
            y: p2.y + Math.sin(angle) * offset
        };
        // if (angle >= Math.PI / 2)
        //     angle -= Math.PI;
        return <text transform={`rotate(${toDegrees(angle)} ${anchor.x} ${anchor.y}) translate(${anchor.x} ${anchor.y})`}>{edge.version}</text>
    }

}
