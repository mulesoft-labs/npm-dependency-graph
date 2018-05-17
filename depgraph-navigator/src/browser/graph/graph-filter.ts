/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";
import { SGraphSchema, SModelIndex, SModelElementSchema } from "sprotty/lib";
import { DependencyGraphNodeSchema, DependencyGraphEdgeSchema, isNode, isEdge } from "./graph-model";

@injectable()
export class DependencyGraphFilter {

    protected nameFilter: (name: string) => boolean = node => true;

    setFilter(text: string) {
        const textTrim = text.trim();
        if (textTrim.length === 0)
            this.nameFilter = name => true;
        else if (text.startsWith(' ') && text.endsWith(' '))
            this.nameFilter = name => name === textTrim;
        else if (text.startsWith(' '))
            this.nameFilter = name => name.startsWith(textTrim);
        else if (text.endsWith(' '))
            this.nameFilter = name => name.endsWith(textTrim);
        else
            this.nameFilter = name => name.indexOf(textTrim) >= 0;
    }

    refresh(graph: SGraphSchema, index: SModelIndex<SModelElementSchema>): void {
        let nodeCount = 0;
        let visibleCount = 0;

        // Count the nodes and apply the name filter
        for (const element of graph.children) {
            if (isNode(element)) {
                const visible = this.nameFilter(element.name);
                element.hidden = !visible;
                nodeCount++;
                if (visible)
                    visibleCount++;
            }
        }
        if (visibleCount === nodeCount)
            return;
        
        // Construct a map of incoming edges
        const incoming = this.createIncomingMap(graph, index);
        const dfsMark: { [id: string]: boolean } = {};

        // Perform a depth-first-search to find the nodes from which the name-filtered nodes are reachable
        for (const element of graph.children) {
            if (isNode(element) && !element.hidden) {
                this.dfs(element, incoming, dfsMark, index);
            }
        }
    }

    protected createIncomingMap(graph: SGraphSchema, index: SModelIndex<SModelElementSchema>):
            Map<DependencyGraphNodeSchema, DependencyGraphEdgeSchema[]> {
        const incoming = new Map<DependencyGraphNodeSchema, DependencyGraphEdgeSchema[]>();
        for (const element of graph.children) {
            if (isEdge(element)) {
                const target = index.getById(element.targetId);
                if (isNode(target)) {
                    let arr = incoming.get(target);
                    if (arr) {
                        arr.push(element);
                    } else {
                        arr = [element];
                        incoming.set(target, arr);
                    }
                }
            }
        }
        return incoming;
    }

    protected dfs(node: DependencyGraphNodeSchema,
                  incoming: Map<DependencyGraphNodeSchema, DependencyGraphEdgeSchema[]>,
                  mark: { [id: string]: boolean },
                  index: SModelIndex<SModelElementSchema>): void {
        if (mark[node.id])
            return;
        mark[node.id] = true;
        for (const edge of incoming.get(node) || []) {
            const source = index.getById(edge.sourceId);
            if (isNode(source)) {
                source.hidden = false;
                this.dfs(source, incoming, mark, index);
            }
        }
    }

}