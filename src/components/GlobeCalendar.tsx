import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Race } from '../types';
import { cn } from '../lib/utils';

interface GlobeCalendarProps {
  races: Race[];
  accentColor: string;
}

// Helper to parse coordinates
const getLongLat = (coordinates: string) =>
  coordinates
    .split(/[ -]/)
    .reduce((acc: number[], curr) => {
      const match = curr.match(/([\d\.]+)°([\d\.]+)′([\d\.]+)″([NSWE])/);
      if (!match) return acc;
      let [, degrees, minutes, seconds, direction] = match;

      let decimal = parseFloat(degrees) + parseFloat(minutes) / 60 + parseFloat(seconds) / 3600;

      if (direction === "S" || direction === "W") decimal *= -1;

      return [...acc, decimal];
    }, [])
    .reverse();

// Fallback coordinates for known countries/circuits if not provided
const fallbackCoordinates: Record<string, string> = {
  'bh': "26°1′57″N 50°30′38″E", // Bahrain
  'sa': "21°37′55″N 39°6′16″E", // Saudi Arabia
  'au': "37°50′59″S 144°58′6″E", // Australia
  'it': "44°20′28″N 11°42′48″E", // Imola / Monza
  'us': "25°57′29″N 80°14′20″W", // Miami / Austin
  'es': "41°34′12″N 2°15′40″E", // Spain
  'mc': "43°44′5″N 7°25′14″E", // Monaco
  'az': "40°22′21″N 49°51′12″E", // Azerbaijan
  'ca': "45°30′02″N 73°31′21″W", // Canada
  'gb': "52°4′43″N 1°1′1″W", // UK
  'at': "47°13′11″N 14°45′53″E", // Austria
  'fr': "43°15′2″N 5°47′30″E", // France
  'hu': "47°34′56″N 19°15′04″E", // Hungary
  'be': "50°26′14″N 5°58′17″E", // Belgium
  'nl': "52°23′19.75″N 4°32′27.32″E", // Netherlands
  'sg': "1°17′29.51″N 103°51′49.86″E", // Singapore
  'jp': "34°50′35″N 136°32′26″E", // Japan
  'mx': "19°24′22″N 99°5′33″W", // Mexico
  'br': "23°42′4″S 46°41′50″W", // Brazil
  'ae': "24°28′2″N 54°36′11″E", // Abu Dhabi
  'qa': "25°29′24″N 51°27′15″E", // Qatar
  'cn': "31°20′20″N 121°13′11″E", // China
};

export function GlobeCalendar({ races, accentColor }: GlobeCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract color class (e.g. "text-red-500" -> "red-500")
  const colorName = accentColor.replace('text-', '');
  const hexColor = accentColor.includes('amber') ? '#f59e0b' : '#ef4444';
  const bgBadgeColor = accentColor.includes('amber') ? 'bg-amber-500' : 'bg-red-500';

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous SVG
    d3.select(containerRef.current).selectAll("*").remove();

    // Reduced size for better fit on 1080p without scrolling
    const size = 500;
    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("viewBox", `0 0 ${size} ${size}`)
      .attr("width", "100%")
      .attr("height", "100%")
      .style("max-width", "100%")
      .style("height", "auto");

    const defs = svg.append("defs");

    const radialGradient = defs
      .append("radialGradient")
      .attr("id", "gradient-overlay")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("cx", (size * 3) / 4)
      .attr("cy", size / 4);

    radialGradient
      .append("stop")
      .attr("offset", 0)
      .attr("stop-color", "rgba(255, 255, 255, 0.1)");

    radialGradient
      .append("stop")
      .attr("offset", 1)
      .attr("stop-color", "rgba(0, 0, 0, 0.8)");

    const loadingText = svg
      .append("g")
      .attr("transform", `translate(${size / 2} ${size / 2})`)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .append("text")
      .attr("font-size", "18")
      .attr("fill", "white")
      .text("Cargando mapa...");

    (async () => {
      try {
        const json: any = await d3.json(
          "https://unpkg.com/world-atlas@2.0.2/countries-110m.json"
        );

        const data = races.map((race) => {
          const coordString = fallbackCoordinates[race.flagCode || ''] || "38°53′23″N 77°00′32″W";
          const coordinates = getLongLat(coordString);
          return { ...race, coordinates };
        });

        setIsLoading(false);

        const outro = svg
          .select("g")
          .attr("opacity", "1")
          .transition()
          .delay(200) // Faster
          .attr("opacity", "0")
          .remove();

        outro.on("end", () => {
          const groupMap = svg.append("g");
          const groupGeo = groupMap.append("g");
          const groupOverlay = groupMap.append("g");
          const groupData = groupMap.append("g");
          const groupControls = svg.append("g");

          const controlSize = 48; // Slightly smaller controls
          const controls = [
            {
              href: "arrow-left",
              x: 0,
              index: -1,
              key: "ArrowLeft",
              label: "Anterior"
            },
            {
              href: "arrow-right",
              x: size - controlSize,
              index: 1,
              key: "ArrowRight",
              label: "Siguiente"
            }
          ];

          groupControls
            .attr("opacity", "0")
            .attr("transform", `translate(0 ${size - controlSize})`);

          const groupsControls = groupControls
            .selectAll("g")
            .data(controls)
            .enter()
            .append("g")
            .attr("transform", ({ x }) => `translate(${x} 0)`);

          groupsControls
            .append("use")
            .attr("href", ({ href }) => `#${href}`)
            .attr("width", controlSize)
            .attr("height", controlSize)
            .style("color", hexColor)
            .style("filter", `drop-shadow(0 0 5px ${hexColor}80)`);

          groupsControls
            .append("rect")
            .attr("width", controlSize)
            .attr("height", controlSize)
            .attr("opacity", "0");

          const intro = groupMap.attr("opacity", "0").transition().attr("opacity", "1");

          const sphere = { type: "Sphere" as const };

          const projection = d3.geoOrthographic().fitSize([size, size], sphere);

          const path = d3.geoPath().projection(projection);
          defs
            .append("clipPath")
            .attr("id", "clip-path-overlay")
            .append("path")
            .attr("d", path(sphere) || "");

          groupGeo
            .append("path")
            .attr("d", path(sphere) || "")
            .attr("fill", "#020617"); // slate-950

          const groupCountries = groupGeo.append("g");

          groupCountries
            .selectAll("path")
            .data(topojson.feature(json, json.objects.countries).features)
            .enter()
            .append("path")
            .attr("d", path as any)
            .attr("fill", "#0f172a") // slate-900
            .attr("stroke", "#1e293b") // slate-800
            .attr("stroke-width", "1");

          groupOverlay
            .append("rect")
            .attr("width", size)
            .attr("height", size)
            .attr("fill", "url(#gradient-overlay)")
            .attr("opacity", 0.8)
            .attr("clip-path", "url(#clip-path-overlay)");

          groupData
            .append("path")
            .attr("fill", "none")
            .attr("stroke", hexColor)
            .attr("stroke-width", "2")
            .style("filter", `drop-shadow(0 0 4px ${hexColor})`);

          groupData.append("circle")
            .attr("fill", hexColor)
            .style("filter", `drop-shadow(0 0 6px ${hexColor})`);

          const groupDetails = groupData.append("g");

          // Using foreignObject for better HTML styling (Tailwind)
          const foreignObject = groupDetails.append("foreignObject")
            .attr("width", 280)
            .attr("height", 140)
            .style("opacity", "0")
            .style("overflow", "visible");

          const tooltipDiv = foreignObject.append("xhtml:div")
            .attr("class", "bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col gap-2 text-white font-sans relative overflow-hidden group");
            
          // Add decorative top border
          tooltipDiv.append("xhtml:div")
            .attr("class", `absolute top-0 left-0 w-full h-1 ${bgBadgeColor}`);

          const line = d3
            .line()
            .x(([x]) => x)
            .y(([, y]) => y)
            .curve(d3.curveBasis);

          const lineDistanceScale = d3.scaleLinear().domain([0, size]).range([0, 100]);

          const updateTooltipContent = (datum: any, indexDatum: number) => {
            const dateObj = new Date(datum.date);
            const formattedDate = new Intl.DateTimeFormat('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            }).format(dateObj);

            tooltipDiv.html(`
              <div class="absolute top-0 left-0 w-full h-1 ${bgBadgeColor}"></div>
              <div class="flex flex-col border-b border-white/10 pb-2 mb-1 gap-1">
                <div class="self-start ${bgBadgeColor} text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                  Ronda ${indexDatum + 1}
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-sm font-black italic uppercase tracking-tighter text-white leading-tight">${datum.name}</span>
                  ${datum.flagCode ? `<img src="https://flagcdn.com/w40/${datum.flagCode}.png" class="w-6 h-4 rounded-sm object-cover shadow-sm border border-white/10 shrink-0 mt-0.5" alt="Flag" />` : ''}
                </div>
              </div>
              <div class="flex items-center gap-2 text-[11px] text-slate-300 font-mono uppercase tracking-wider mb-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-${colorName} shrink-0"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                <span class="leading-tight">${formattedDate}</span>
              </div>
              <div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-${colorName} shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span class="leading-tight">${datum.circuit}</span>
              </div>
            `);
          };

          const handleUpdate = (datum: any, from: any) => {
            const { coordinates } = datum;

            const [long, lat] = coordinates;

            let [startAngle] = projection.rotate();
            let endAngle = long * -1;

            const change = endAngle - startAngle;
            if (Math.abs(change) > 180) {
              if (change < 0) endAngle += 360;
              else startAngle += 360;
            }

            // Faster animations
            const transitionText = d3.transition().duration(200).ease(d3.easeQuadIn);
            const transitionPath = d3.transition(transitionText).transition().duration(350);
            const transitionPoint = d3.transition(transitionPath).transition().duration(150).ease(d3.easeQuadOut);

            foreignObject
              .transition(transitionText)
              .style("opacity", "0");

            groupData
              .select("path")
              .transition(transitionPath)
              .attr("stroke-dashoffset", "1");

            groupData.select("circle").transition(transitionPoint).attr("r", "0");

            transitionPoint.on("end", () => {
              const { coordinates: source } = from;

              const start = projection(source);
              const end = projection(coordinates);
              
              if (!start || !end) return;

              const [x1, y1] = start;
              const [x2, y2] = end;

              const cx = (x2 + x1) / 2;
              const cy = (y2 + y1) / 2;

              const px = x2 - x1;
              const py = y2 - y1;

              let nx = py * -1;
              let ny = px;

              const m = (nx ** 2 + ny ** 2) ** 0.5;

              nx /= m;
              ny /= m;

              const d = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5;

              const lineDistance = lineDistanceScale(d);

              const x = cx + nx * lineDistance;
              const y = cy + ny * lineDistance;

              const points: [number, number][] = [start, [x, y], end];

              groupData
                .select("path")
                .attr("d", line(points))
                .attr("pathLength", "1")
                .attr("stroke-dasharray", "1")
                .attr("stroke-dashoffset", "1");

              // Faster rotation
              const transition = d3.transition().duration(450).ease(d3.easeQuadInOut);

              transition
                .tween("focus", () => {
                  const i = d3.interpolateArray(
                    [startAngle, 0, 0],
                    [long > 0 ? endAngle + 30 : endAngle - 30, 0, 0]
                  );

                  const o = d3.interpolate(1, -1);

                  return (t) => {
                    projection.rotate(i(t));

                    groupCountries.selectAll("path").attr("d", path as any);

                    const start = projection(source);
                    const end = projection(coordinates);
                    
                    if (!start || !end) return;

                    const cx = (end[0] + start[0]) / 2;
                    const cy = (end[1] + start[1]) / 2;

                    const px = end[0] - start[0];
                    const py = end[1] - start[1];

                    let nx = py * -1;
                    let ny = px;

                    const m = (nx ** 2 + ny ** 2) ** 0.5;

                    nx /= m;
                    ny /= m;

                    const x = cx + nx * lineDistance;
                    const y = cy + ny * lineDistance;

                    const points: [number, number][] = [start, [x, y], end];

                    groupData
                      .select("path")
                      .attr("d", line(points))
                      .attr("pathLength", "1")
                      .attr("stroke-dasharray", "1")
                      .attr("stroke-dashoffset", o(t));
                  };
                })
                .on("end", () => {
                  const projCoords = projection(coordinates);
                  if (!projCoords) return;
                  
                  groupData
                    .select("circle")
                    .attr("transform", `translate(${projCoords})`);

                  const indexDatum = data.findIndex(({ id }) => datum.id === id);
                  updateTooltipContent(datum, indexDatum);

                  const width = 280;
                  const height = 140;

                  const x =
                    long > 0
                      ? Math.max(0, size / 3 - width / 2)
                      : Math.min(size - width, (size * 2) / 3 - width / 2);
                  const y = lat > 0 ? size / 2 - height : size / 2;

                  const [x1, y1] = projCoords;
                  const x2 = x + width / 2;
                  const y2 = y + height / 2;

                  groupData.select("path").attr("d", `M ${x1} ${y1} ${x2} ${y2}`);

                  foreignObject.attr("transform", `translate(${x} ${y})`);

                  const transitionPoint = d3.transition().duration(150).ease(d3.easeQuadIn);
                  const transitionPath = d3.transition(transitionPoint).transition().duration(250).ease(d3.easeQuadInOut);
                  const transitionText = d3.transition(transitionPath).transition().duration(150).ease(d3.easeQuadOut);

                  groupData
                    .select("circle")
                    .attr("r", "0")
                    .transition(transitionPoint)
                    .attr("r", "6");

                  groupData
                    .select("path")
                    .attr("pathLength", "1")
                    .attr("stroke-dasharray", "1")
                    .attr("stroke-dashoffset", "1")
                    .transition(transitionPath)
                    .attr("stroke-dashoffset", "0");

                  foreignObject.transition(transitionText).style("opacity", "1");

                  transitionText.on("end", () => {
                    const { length } = data;

                    groupsControls
                      .style("cursor", "not-allowed")
                      .on("click", null)
                      .filter(({ index }) => {
                        const i = indexDatum + index;
                        return i >= 0 && i < length;
                      })
                      .style("cursor", "pointer")
                      .on(
                        "click",
                        (e, { index }) => {
                          handleUpdate(data[indexDatum + index], datum);
                        },
                        {
                          once: true
                        }
                      );

                    const controlsKeyboard = controls.filter(({ index }) => {
                      const i = indexDatum + index;
                      return i >= 0 && i < length;
                    });

                    svg
                      .attr("tabindex", "0")
                      .on("keydown", function (e) {
                        const controlKeyboard = controlsKeyboard.find(
                          ({ key }) => key === e.key
                        );
                        if (controlKeyboard) {
                          d3.select(this).attr("aria-label", "").on("keydown", null);

                          const { index } = controlKeyboard;
                          handleUpdate(data[indexDatum + index], datum);
                        }
                      });
                  });
                });
            });
          };

          intro.on("end", () => {
            const [datum] = data;
            const { coordinates } = datum;
            const [long, lat] = coordinates;

            const [startAngle] = projection.rotate();
            const endAngle = long * -1 + 30;

            const transition = d3
              .transition()
              .duration(500) // Faster
              .delay(100)
              .ease(d3.easeQuadInOut);

            transition
              .tween("focus", () => {
                const i = d3.interpolateArray([startAngle, 0, 0], [endAngle, 0, 0]);

                return (t) => {
                  projection.rotate(i(t));
                  groupCountries.selectAll("path").attr("d", path as any);
                };
              })
              .on("end", () => {
                const projCoords = projection(coordinates);
                if (!projCoords) return;
                
                groupData
                  .select("circle")
                  .attr("transform", `translate(${projCoords})`);

                const indexDatum = data.findIndex((d) => d.id === datum.id);
                updateTooltipContent(datum, indexDatum);

                const width = 280;
                const height = 140;

                const x = Math.max(0, size / 3 - width / 2);
                const y = lat > 0 ? size / 2 - height : size / 2;

                const [x1, y1] = projCoords;
                const x2 = x + width / 2;
                const y2 = y + height / 2;

                groupData.select("path").attr("d", `M ${x1} ${y1} ${x2} ${y2}`);

                foreignObject.attr("transform", `translate(${x} ${y})`);

                const transitionPoint = d3.transition().duration(150).ease(d3.easeQuadIn);
                const transitionPath = d3.transition(transitionPoint).transition().duration(250).ease(d3.easeQuadInOut);
                const transitionText = d3.transition(transitionPath).transition().duration(150).ease(d3.easeQuadOut);

                groupData
                  .select("circle")
                  .attr("r", "0")
                  .transition(transitionPoint)
                  .attr("r", "6");

                groupData
                  .select("path")
                  .attr("pathLength", "1")
                  .attr("stroke-dasharray", "1")
                  .attr("stroke-dashoffset", "1")
                  .transition(transitionPath)
                  .attr("stroke-dashoffset", "0");

                foreignObject.transition(transitionText).style("opacity", "1");

                transitionText.on("end", () => {
                  groupControls
                    .transition()
                    .attr("opacity", "1")
                    .on("end", () => {
                      const { length } = data;

                      groupsControls
                        .style("cursor", "not-allowed")
                        .on("click", null)
                        .filter(({ index }) => {
                          const i = indexDatum + index;
                          return i >= 0 && i < length;
                        })
                        .style("cursor", "pointer")
                        .on(
                          "click",
                          (e, { index }) => {
                            handleUpdate(data[indexDatum + index], datum);
                          },
                          {
                            once: true
                          }
                        );

                      const controlsKeyboard = controls.filter(({ index }) => {
                        const i = indexDatum + index;
                        return i >= 0 && i < length;
                      });

                      svg
                        .attr("tabindex", "0")
                        .on("keydown", function (e) {
                          const controlKeyboard = controlsKeyboard.find(
                            ({ key }) => key === e.key
                          );
                          if (controlKeyboard) {
                            d3.select(this).attr("aria-label", "").on("keydown", null);

                            const { index } = controlKeyboard;
                            handleUpdate(data[indexDatum + index], datum);
                          }
                        });
                    });
                });
              });
          });
        });
      } catch (error) {
        console.error("Error loading globe data:", error);
      }
    })();
  }, [races, accentColor, bgBadgeColor, colorName, hexColor]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
      <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
        <symbol id="arrow-right" viewBox="-50 -50 100 100">
          <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M -12.5 -20 l 25 20 -25 20" />
          </g>
        </symbol>
        <symbol id="arrow-left" viewBox="-50 -50 100 100">
          <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" transform="scale(-1 1)">
            <path d="M -12.5 -20 l 25 20 -25 20" />
          </g>
        </symbol>
      </svg>
      
      {/* F1 Styling Background Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div 
        ref={containerRef} 
        className="w-full aspect-square flex items-center justify-center relative z-10"
      >
        {/* D3 will render here */}
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden rounded-3xl">
        <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] ${bgBadgeColor}/10 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-1000`}></div>
        <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] ${bgBadgeColor}/5 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-1000`}></div>
      </div>
    </div>
  );
}
