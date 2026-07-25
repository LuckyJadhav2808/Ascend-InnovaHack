"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { LayoutGrid, Network } from "lucide-react";
import NodeDetailsDrawer from "./NodeDetailsDrawer";

export default function SkillGraphVisualizer({ graphData, compact = false }) {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState("graph"); // "graph" | "list"

  useEffect(() => {
    if (!graphData || !graphData.nodes || !graphData.nodes.length || !svgRef.current || viewMode !== "graph") return;

    const width = 600;
    const height = compact ? 320 : 400;
    const margin = 50;

    // Clear previous elements
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`);

    const nodes = graphData.nodes.map((d) => ({ ...d }));
    const links = (graphData.edges || []).map((d) => ({ source: d.from, target: d.to }));

    const getColor = (status, mastery) => {
      if (status === "strong" || mastery >= 70) return "#B7D9CF";
      if (status === "ok" || mastery >= 40) return "#F6D67A";
      return "#F4C9D6";
    };

    const getStrokeColor = (status, mastery) => {
      if (status === "strong" || mastery >= 70) return "#86C2B2";
      if (status === "ok" || mastery >= 40) return "#E5BE53";
      return "#E39EB2";
    };

    // Smooth force simulation setup with decay to prevent continuous trembling
    const simulation = d3
      .forceSimulation(nodes)
      .alphaDecay(0.04)
      .alphaMin(0.001)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(100).strength(0.8))
      .force("charge", d3.forceManyBody().strength(-140))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.08))
      .force("y", d3.forceY(height / 2).strength(0.08))
      .force("collision", d3.forceCollide().radius(35));

    // Render Edges
    const link = svg
      .append("g")
      .attr("stroke", "#D5D5D0")
      .attr("stroke-opacity", 0.9)
      .attr("stroke-width", 2)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-dasharray", "4 3");

    // Node Container Group
    const nodeGroup = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.2).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = Math.max(margin, Math.min(width - margin, event.x));
            d.fy = Math.max(margin, Math.min(height - margin, event.y));
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = d.x;
            d.fy = d.y;
          })
      );

    // Node Circle Background
    nodeGroup
      .append("circle")
      .attr("r", 24)
      .attr("fill", (d) => getColor(d.status, d.mastery))
      .attr("stroke", (d) => getStrokeColor(d.status, d.mastery))
      .attr("stroke-width", 3.5)
      .attr("class", "node-circle shadow-md");

    // Inner Percentage Text
    nodeGroup
      .append("text")
      .text((d) => `${d.mastery}%`)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "11px")
      .attr("font-weight", "800")
      .attr("fill", "#1E1E1E");

    // Topic Label Pill under Node
    const labelGroup = nodeGroup.append("g").attr("transform", "translate(0, 34)");

    labelGroup
      .append("rect")
      .attr("x", (d) => -Math.min(65, (d.topic.length * 4) + 8))
      .attr("y", -10)
      .attr("width", (d) => Math.min(130, (d.topic.length * 8) + 16))
      .attr("height", 20)
      .attr("rx", 10)
      .attr("fill", "#FFFFFF")
      .attr("stroke", "#E5E5E0")
      .attr("stroke-width", 1);

    labelGroup
      .append("text")
      .text((d) => (d.topic.length > 16 ? d.topic.slice(0, 14) + "…" : d.topic))
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "10px")
      .attr("font-weight", "700")
      .attr("fill", "#1E1E1E");

    nodeGroup.on("click", (event, d) => {
      setSelectedNode(d);
    });

    // Simulation Ticker
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [graphData, compact, viewMode]);

  const nodesList = graphData?.nodes || [];

  return (
    <div className="relative w-full h-full flex flex-col space-y-3">
      {/* View Mode Toggle Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-[#8A8A8A]">
          {nodesList.length} Topic Nodes Tracked
        </span>

        <div className="flex bg-[#F7F6F3] p-1 rounded-xl border border-[#E5E5E0]">
          <button
            type="button"
            onClick={() => setViewMode("graph")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              viewMode === "graph"
                ? "bg-white text-[#1E1E1E] shadow-xs"
                : "text-[#8A8A8A] hover:text-[#1E1E1E]"
            }`}
          >
            <Network className="w-3 h-3" />
            <span>Interactive Graph</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              viewMode === "list"
                ? "bg-white text-[#1E1E1E] shadow-xs"
                : "text-[#8A8A8A] hover:text-[#1E1E1E]"
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            <span>Skill Cards List</span>
          </button>
        </div>
      </div>

      {/* View Mode 1: Interactive D3 Graph View */}
      {viewMode === "graph" ? (
        <div className="relative w-full h-[320px] bg-[#F7F6F3] rounded-2xl border border-[#E5E5E0] overflow-hidden flex items-center justify-center">
          <svg ref={svgRef} className="w-full h-full" />

          {selectedNode && (
            <div className="absolute bottom-3 left-3 right-3 bg-[#1E1E1E] text-white p-3 rounded-xl text-xs flex items-center justify-between shadow-xl z-10 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>{selectedNode.topic}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                      selectedNode.mastery >= 70
                        ? "bg-[#B7D9CF] text-[#1E1E1E]"
                        : selectedNode.mastery >= 40
                        ? "bg-[#F6D67A] text-[#1E1E1E]"
                        : "bg-[#F4C9D6] text-[#1E1E1E]"
                    }`}
                  >
                    {selectedNode.status || (selectedNode.mastery >= 70 ? "strong" : selectedNode.mastery >= 40 ? "ok" : "weak")}
                  </span>
                </div>
                <p className="text-[11px] text-[#8A8A8A] mt-0.5">Mastery: {selectedNode.mastery}%</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-white/60 hover:text-white px-2 py-1 bg-white/10 rounded-md text-[10px]"
              >
                Close
              </button>
            </div>
          )}
        </div>
      ) : (
        /* View Mode 2: Accessible Skill Cards Grid View */
        <div className="max-h-[320px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {nodesList.map((node, idx) => {
            const isStrong = node.mastery >= 70;
            const isOk = node.mastery >= 40 && node.mastery < 70;

            return (
              <div
                key={idx}
                onClick={() => setSelectedNode(node)}
                className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] shadow-xs flex flex-col justify-between space-y-2 cursor-pointer hover:border-[#FF6B4A]/50 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#1E1E1E] truncate">{node.topic}</h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      isStrong
                        ? "bg-[#B7D9CF] text-[#1E1E1E]"
                        : isOk
                        ? "bg-[#F6D67A] text-[#1E1E1E]"
                        : "bg-[#F4C9D6] text-[#1E1E1E]"
                    }`}
                  >
                    {isStrong ? "Strong" : isOk ? "OK" : "Weak"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#8A8A8A] font-semibold">
                    <span>Mastery Level</span>
                    <span className="text-[#1E1E1E] font-bold">{node.mastery}%</span>
                  </div>
                  <div className="w-full bg-[#F7F6F3] h-2 rounded-full overflow-hidden border border-[#E5E5E0]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isStrong ? "bg-[#86C2B2]" : isOk ? "bg-[#F6D67A]" : "bg-[#FF6B4A]"
                      }`}
                      style={{ width: `${node.mastery}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Production Slide-Over Node Learning Drawer */}
      <NodeDetailsDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
