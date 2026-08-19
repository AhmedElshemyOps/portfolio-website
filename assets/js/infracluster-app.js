(function () {
  "use strict";

  var areas = [
    { name: "Dubai Marina", x: 18, y: 78, base: "Marina", drive: 42 },
    { name: "JBR", x: 20, y: 82, base: "Beach", drive: 44 },
    { name: "Palm Jumeirah", x: 25, y: 74, base: "Palm", drive: 38 },
    { name: "JLT", x: 23, y: 70, base: "Marina", drive: 40 },
    { name: "Barsha Heights", x: 31, y: 63, base: "New Dubai", drive: 35 },
    { name: "Al Barsha", x: 34, y: 59, base: "New Dubai", drive: 34 },
    { name: "Downtown Dubai", x: 54, y: 49, base: "Downtown", drive: 20 },
    { name: "Business Bay", x: 52, y: 45, base: "Downtown", drive: 22 },
    { name: "DIFC", x: 58, y: 50, base: "Central", drive: 24 },
    { name: "Sheikh Zayed Road", x: 50, y: 54, base: "Central", drive: 27 },
    { name: "Jumeirah", x: 45, y: 62, base: "Beach", drive: 28 },
    { name: "Deira", x: 72, y: 42, base: "Old Dubai", drive: 15 },
    { name: "Bur Dubai", x: 66, y: 44, base: "Old Dubai", drive: 17 },
    { name: "Dubai Creek", x: 69, y: 39, base: "Old Dubai", drive: 16 },
    { name: "Festival City", x: 75, y: 35, base: "Airport East", drive: 18 },
    { name: "Airport Area", x: 80, y: 32, base: "Airport East", drive: 12 },
    { name: "Mirdif", x: 84, y: 25, base: "Airport East", drive: 21 },
    { name: "Dubai Silicon Oasis", x: 78, y: 18, base: "Inland", drive: 34 },
    { name: "Dubai Production City", x: 28, y: 48, base: "Inland", drive: 42 },
    { name: "Jumeirah Village Circle", x: 30, y: 53, base: "Inland", drive: 38 }
  ];
  var languages = ["English", "French", "Arabic", "German", "Spanish", "Italian", "Russian", "Mandarin", "Hindi", "Portuguese"];
  var hotelBrands = ["Grand", "Royal", "City", "Marina", "Creek", "Pearl", "Vista", "Heritage", "Elite", "Signature", "Metro", "Harbour", "Palm", "Garden", "Central"];
  var hotelTypes = ["Hotel", "Suites", "Resort", "Residence", "Inn", "Tower", "Collection", "Apartments"];
  var vehicles = [
    { name: "Sedan", capacity: 3, luggage: 2, type: "FIT", baseCost: 180, kmCost: 2.2 },
    { name: "SUV", capacity: 5, luggage: 4, type: "Premium FIT", baseCost: 280, kmCost: 3.2 },
    { name: "7-seat family van", capacity: 6, luggage: 5, type: "Family", baseCost: 340, kmCost: 3.8 },
    { name: "14-seat van", capacity: 12, luggage: 10, type: "Small group", baseCost: 520, kmCost: 4.4 },
    { name: "22-seat mini coach", capacity: 20, luggage: 16, type: "Medium group", baseCost: 760, kmCost: 5.8 },
    { name: "35-seat coach", capacity: 32, luggage: 28, type: "Group", baseCost: 1050, kmCost: 7.2 },
    { name: "50-seat coach", capacity: 45, luggage: 40, type: "Large group", baseCost: 1380, kmCost: 8.6 }
  ];
  var state = { step: 0, groups: [], database: [], results: null, importRows: [], importHeaders: [] };
  var steps = ["Service", "Groups", "Rules", "Results", "Database"];

  function byId(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function number(value, fallback) {
    var parsed = Number(String(value == null ? "" : value).replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  function normalizeHeader(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  }
  function normalizeTime(value, fallback) {
    if (value == null || value === "") return fallback || "08:30";
    if (typeof value === "number") {
      var excelDay = value % 1;
      if (excelDay > 0) return time(Math.round(excelDay * 24 * 60));
      return fallback || "08:30";
    }
    var raw = String(value).trim();
    var match = raw.match(/^(\d{1,2})[:.](\d{2})/);
    if (match) return pad(Math.min(23, Number(match[1]))) + ":" + pad(Math.min(59, Number(match[2])));
    var ampm = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
    if (ampm) {
      var hour = Number(ampm[1]) % 12;
      if (/pm/i.test(ampm[3])) hour += 12;
      return pad(hour) + ":" + pad(Number(ampm[2] || 0));
    }
    return fallback || "08:30";
  }
  function minutes(value) {
    var parts = String(value || "09:00").split(":").map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }
  function time(mins) {
    mins = Math.max(0, Math.round(mins));
    return pad(Math.floor(mins / 60) % 24) + ":" + pad(mins % 60);
  }
  function seedHotels() {
    var rows = [];
    for (var i = 0; i < 1200; i += 1) {
      var area = areas[i % areas.length];
      var jitterX = ((i * 37) % 11) - 5;
      var jitterY = ((i * 53) % 13) - 6;
      var brand = hotelBrands[i % hotelBrands.length];
      var type = hotelTypes[(i + Math.floor(i / 7)) % hotelTypes.length];
      var stars = 3 + (i % 3);
      rows.push({
        id: "DXB-" + pad(Math.floor(i / 100)) + pad(i % 100),
        name: brand + " " + area.name + " " + type + " " + (i + 1),
        area: area.name,
        zone: area.base,
        x: Math.max(5, Math.min(95, area.x + jitterX)),
        y: Math.max(5, Math.min(92, area.y + jitterY)),
        drive: area.drive + (i % 9),
        stars: stars,
        languages: [languages[i % languages.length], languages[(i + 3) % languages.length], "English"].filter(function (v, idx, arr) { return arr.indexOf(v) === idx; })
      });
    }
    return rows;
  }
  async function loadUaeLocations() {
    try {
      var response = await fetch("data/uae_tourism_locations.json");
      if (!response.ok) throw new Error("HTTP " + response.status);
      var data = await response.json();
      if (!data.locations || !data.locations.length) throw new Error("No location rows found");
      return data.locations.map(function (location, index) {
        var emirate = location.emirate || "Dubai";
        var zone = location.zone || location.area || emirate;
        return {
          id: location.id || ("uae-row-" + index),
          name: location.name,
          type: location.type || "Location",
          category: location.category || location.type || "Location",
          emirate: emirate,
          area: location.area || zone,
          zone: zone,
          x: Number(location.x || (20 + (index % 70))),
          y: Number(location.y || (20 + ((index * 7) % 70))),
          drive: Number(location.drive || 25),
          stars: location.stars || "",
          languages: location.languages || ["English", "Arabic"],
          maps: location.maps || "",
          source: location.source || "static-seed",
          verified: Boolean(location.verified)
        };
      });
    } catch (error) {
      console.warn("UAE location database could not load; using fallback Dubai seed.", error);
      return seedHotels();
    }
  }
  function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function nearestHotel(query) {
    query = String(query || "").toLowerCase();
    return state.database.find(function (h) { return h.name.toLowerCase().indexOf(query) > -1 || h.area.toLowerCase().indexOf(query) > -1 || h.emirate.toLowerCase().indexOf(query) > -1; }) || state.database[0];
  }
  function hotelFromImport(row, map) {
    var hotelValue = cell(row, map.hotel);
    var areaValue = cell(row, map.area);
    var hotel = nearestHotel(hotelValue || areaValue);
    if (areaValue) {
      var areaMatch = areas.find(function (area) { return area.name.toLowerCase() === String(areaValue).trim().toLowerCase(); }) ||
        areas.find(function (area) { return area.name.toLowerCase().indexOf(String(areaValue).trim().toLowerCase()) > -1; });
      if (areaMatch) {
        hotel = {
          id: "IMPORT-" + normalizeHeader(hotelValue || areaValue).slice(0, 18),
          name: hotelValue || areaMatch.name + " imported hotel",
          area: areaMatch.name,
          zone: areaMatch.base,
          x: areaMatch.x,
          y: areaMatch.y
        };
      }
    }
    return hotel;
  }
  function cell(row, header) {
    return header ? row[header] : "";
  }
  function addGroup(seed) {
    var hotelPool = state.database.filter(function (item) { return /hotel|resort|apartment/i.test(item.type || ""); });
    var sourcePool = hotelPool.length ? hotelPool : state.database;
    var hotel = seed && seed.hotel ? nearestHotel(seed.hotel) : sourcePool[(state.groups.length * 61 + 7) % sourcePool.length];
    state.groups.push({
      hotelId: hotel.id,
      hotelName: hotel.name,
      area: hotel.area,
      zone: hotel.zone,
      x: hotel.x,
      y: hotel.y,
      adults: number(seed && seed.adults, 2),
      children: number(seed && seed.children, 0),
      infants: number(seed && seed.infants, 0),
      luggage: number(seed && seed.luggage, 1),
      language: seed && seed.language || "English",
      pickupTime: normalizeTime(seed && seed.pickupTime, "08:30"),
      tour: seed && seed.tour || "UAE City Tour"
    });
    renderGroups();
    updateSummary();
  }
  function headcount(g) { return Number(g.adults || 0) + Number(g.children || 0) + Number(g.infants || 0); }
  function recommendVehicle(pax, luggage) {
    var adjusted = pax + Math.ceil((luggage || 0) / 6);
    return vehicles.find(function (v) { return v.capacity >= adjusted; }) || vehicles[vehicles.length - 1];
  }
  function routeKm(cluster) {
    if (!cluster || !cluster.sequence || !cluster.sequence.length) return 0;
    var distanceUnits = 0;
    for (var i = 1; i < cluster.sequence.length; i += 1) {
      distanceUnits += distance(cluster.sequence[i - 1], cluster.sequence[i]);
    }
    distanceUnits += distance(cluster.sequence[cluster.sequence.length - 1], cluster.center);
    return Math.max(8, Math.round(distanceUnits * 1.18));
  }
  function estimateCost(cluster) {
    var km = routeKm(cluster);
    var spread = Math.max(0, cluster.maxTime - cluster.minTime);
    var waitingCost = Math.ceil(spread / 15) * 25;
    return {
      km: km,
      waitingCost: waitingCost,
      total: Math.round(cluster.vehicle.baseCost + km * cluster.vehicle.kmCost + waitingCost)
    };
  }
  function largerVehicle(vehicle) {
    var index = vehicles.indexOf(vehicle);
    return vehicles[Math.min(vehicles.length - 1, index + 1)];
  }
  function dispatchPayload(clusters) {
    return {
      source: "InfraCluster static MVP",
      destinationSystem: "InfraDispatch",
      serviceTitle: byId("clusterServiceTitle").value || "UAE hotel pickup",
      serviceDate: byId("clusterServiceDate").value || "",
      tourType: byId("clusterTourType").value || "",
      firstStop: byId("clusterFirstStop").value || "",
      targetArrival: byId("targetArrival").value || "",
      supervisorNote: byId("clusterNote").value || "",
      estimatedCostAED: clusters.reduce(function (sum, cluster) { return sum + cluster.cost.total; }, 0),
      clusters: clusters.map(function (cluster) {
        return {
          cluster: cluster.id,
          zone: cluster.zone,
          language: cluster.language,
          pax: cluster.pax,
          luggage: cluster.luggage,
          pickupWindow: cluster.pickupStart + " - " + cluster.pickupEnd,
          recommendedVehicle: cluster.vehicle.name,
          estimatedCostAED: cluster.cost.total,
          risk: cluster.risk,
          sequence: cluster.sequence.map(function (group) {
            return {
              hotel: group.hotelName,
              area: group.area,
              pickupTime: group.pickupTime,
              adults: group.adults,
              children: group.children,
              infants: group.infants,
              language: group.language
            };
          })
        };
      })
    };
  }
  function clusterGroups() {
    var maxClusters = Number(byId("maxClusters").value || 4);
    var timeWindow = Number(byId("timeWindow").value || 20);
    var maxPax = Number(byId("maxVehiclePax").value || 32);
    var languageMode = byId("languageMode").value;
    var sorted = state.groups.slice().sort(function (a, b) {
      return minutes(a.pickupTime) - minutes(b.pickupTime) || a.zone.localeCompare(b.zone) || a.area.localeCompare(b.area);
    });
    var clusters = [];
    sorted.forEach(function (group) {
      var best = null;
      var bestScore = Infinity;
      clusters.forEach(function (cluster) {
        var pax = cluster.groups.reduce(function (sum, g) { return sum + headcount(g); }, 0) + headcount(group);
        var languageOk = languageMode === "mixed" || cluster.language === group.language;
        var timeSpread = Math.max(cluster.maxTime, minutes(group.pickupTime)) - Math.min(cluster.minTime, minutes(group.pickupTime));
        if (pax > maxPax || timeSpread > timeWindow || !languageOk) return;
        var geo = distance(group, cluster.center);
        var score = geo * 1.8 + timeSpread * 1.25 + (cluster.zone === group.zone ? 0 : 12);
        if (score < bestScore) { bestScore = score; best = cluster; }
      });
      if (!best && clusters.length >= maxClusters) {
        best = clusters.slice().sort(function (a, b) {
          return distance(group, a.center) - distance(group, b.center);
        })[0];
      }
      if (!best || clusters.length < maxClusters && bestScore > 20) {
        clusters.push({ id: clusters.length + 1, groups: [group], minTime: minutes(group.pickupTime), maxTime: minutes(group.pickupTime), center: { x: group.x, y: group.y }, language: group.language, zone: group.zone });
      } else {
        best.groups.push(group);
        best.minTime = Math.min(best.minTime, minutes(group.pickupTime));
        best.maxTime = Math.max(best.maxTime, minutes(group.pickupTime));
        best.center = {
          x: best.groups.reduce(function (sum, g) { return sum + g.x; }, 0) / best.groups.length,
          y: best.groups.reduce(function (sum, g) { return sum + g.y; }, 0) / best.groups.length
        };
      }
    });
    clusters.forEach(function (cluster, index) {
      cluster.id = index + 1;
      cluster.pax = cluster.groups.reduce(function (sum, g) { return sum + headcount(g); }, 0);
      cluster.luggage = cluster.groups.reduce(function (sum, g) { return sum + Number(g.luggage || 0); }, 0);
      cluster.vehicle = recommendVehicle(cluster.pax, cluster.luggage);
      cluster.sequence = cluster.groups.slice().sort(function (a, b) {
        return distance(a, cluster.center) - distance(b, cluster.center);
      });
      cluster.pickupStart = time(cluster.minTime - 8);
      cluster.pickupEnd = time(cluster.maxTime + 8);
      cluster.quality = Math.max(52, Math.round(100 - (cluster.maxTime - cluster.minTime) * 1.3 - (cluster.groups.length > 1 ? distance(cluster.sequence[0], cluster.sequence[cluster.sequence.length - 1]) : 0) * 1.7));
      cluster.risk = cluster.quality > 82 ? "Clean" : cluster.quality > 68 ? "Watch" : "Supervisor review";
      cluster.cost = estimateCost(cluster);
      cluster.alternativeVehicle = largerVehicle(cluster.vehicle);
    });
    state.results = clusters;
    renderResults();
    updateSummary();
  }
  function renderProgress() {
    var host = byId("clusterProgress");
    host.innerHTML = "";
    steps.forEach(function (label, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = index === state.step ? "active" : index < state.step ? "done" : "";
      button.innerHTML = "<span>" + (index + 1) + "</span>" + label;
      button.addEventListener("click", function () { state.step = index; renderStep(); });
      host.appendChild(button);
    });
  }
  function renderStep() {
    document.querySelectorAll(".cluster-step").forEach(function (panel, index) { panel.hidden = index !== state.step; });
    byId("prevClusterStep").disabled = state.step === 0;
    byId("nextClusterStep").textContent = state.step === steps.length - 1 ? "Run clustering" : "Next";
    renderProgress();
  }
  function renderGroups() {
    var host = byId("groupList");
    host.innerHTML = "";
    state.groups.forEach(function (group, index) {
      var item = document.createElement("div");
      item.className = "cluster-item";
      item.innerHTML = '<div class="cluster-item-head"><strong>Group ' + (index + 1) + " · " + group.area + '</strong><button type="button">Remove</button></div>' +
        '<div class="mini-grid">' +
        '<label>Hotel<input data-field="hotelName" value="' + esc(group.hotelName) + '"></label>' +
        '<label>Adults<input data-field="adults" type="number" min="0" value="' + esc(group.adults) + '"></label>' +
        '<label>Children<input data-field="children" type="number" min="0" value="' + esc(group.children) + '"></label>' +
        '<label>Infants<input data-field="infants" type="number" min="0" value="' + esc(group.infants) + '"></label>' +
        '<label>Language<input data-field="language" value="' + esc(group.language) + '"></label>' +
        '<label>Pickup time<input data-field="pickupTime" type="time" value="' + esc(group.pickupTime) + '"></label>' +
        '<label>Luggage<input data-field="luggage" type="number" min="0" value="' + esc(group.luggage) + '"></label>' +
        '<label>Tour<input data-field="tour" value="' + esc(group.tour) + '"></label>' +
        '<label>Area<input data-field="area" value="' + esc(group.area) + '"></label>' +
        '</div>';
      item.querySelector("button").addEventListener("click", function () { state.groups.splice(index, 1); renderGroups(); updateSummary(); });
      item.querySelectorAll("[data-field]").forEach(function (input) {
        input.addEventListener("change", function () {
          group[input.dataset.field] = input.value;
          if (input.dataset.field === "hotelName" || input.dataset.field === "area") {
            var hotel = nearestHotel(input.value);
            group.hotelId = hotel.id; group.area = hotel.area; group.zone = hotel.zone; group.x = hotel.x; group.y = hotel.y;
          }
          updateSummary();
        });
      });
      host.appendChild(item);
    });
  }
  function renderResults() {
    var clusters = state.results || [];
    var totalPax = state.groups.reduce(function (sum, g) { return sum + headcount(g); }, 0);
    byId("clusterKpis").innerHTML = [
      ["Groups", state.groups.length],
      ["Passengers", totalPax],
      ["Clusters", clusters.length],
      ["Est. cost", clusters.length ? "AED " + clusters.reduce(function (sum, c) { return sum + c.cost.total; }, 0).toLocaleString() : "-"],
      ["Best score", clusters.length ? Math.round(clusters.reduce(function (sum, c) { return sum + c.quality; }, 0) / clusters.length) + "/100" : "-"]
    ].map(function (k) { return "<div><span>" + k[0] + "</span><strong>" + k[1] + "</strong></div>"; }).join("");
    renderMap(clusters);
    byId("clusterCards").innerHTML = clusters.map(function (cluster) {
      return '<article class="cluster-card"><h3>Cluster ' + cluster.id + " · " + esc(cluster.zone) + '</h3><p><strong>' + esc(cluster.vehicle.name) + '</strong> recommended for ' + cluster.pax + ' pax and ' + cluster.luggage + ' luggage.</p><ul>' +
        '<li>Pickup window: ' + cluster.pickupStart + " - " + cluster.pickupEnd + '</li>' +
        '<li>Language: ' + esc(cluster.language) + '</li>' +
        '<li>Estimated dispatch cost: AED ' + cluster.cost.total.toLocaleString() + " · " + cluster.cost.km + ' km planning factor</li>' +
        '<li>Comfort alternative: ' + esc(cluster.alternativeVehicle.name) + '</li>' +
        '<li>Quality: ' + cluster.quality + "/100 · " + cluster.risk + '</li>' +
        '<li>Sequence: ' + cluster.sequence.map(function (g) { return esc(g.area); }).join(" -> ") + '</li>' +
        '</ul></article>';
    }).join("") || '<article class="cluster-card"><h3>No plan yet</h3><p>Add groups and run clustering.</p></article>';
    byId("briefingOutput").innerHTML = clusters.map(function (cluster) {
      return '<article class="cluster-card"><h3>Driver / guide brief · Cluster ' + cluster.id + '</h3><p>Use ' + esc(cluster.vehicle.name) + ". Start pickup at " + cluster.pickupStart + ". Keep " + esc(cluster.language) + " guide support. Estimated cost AED " + cluster.cost.total.toLocaleString() + ". Sequence: " + cluster.sequence.map(function (g) { return esc(g.hotelName); }).join(" -> ") + ".</p></article>";
    }).join("");
    renderDispatchBridge(clusters);
  }
  function renderDispatchBridge(clusters) {
    var host = byId("dispatchBridgeOutput");
    if (!host) return;
    if (!clusters.length) {
      host.innerHTML = '<article class="cluster-card"><h3>No handoff yet</h3><p>Run clustering to generate the InfraDispatch handoff package.</p></article>';
      return;
    }
    var totalClusterCost = clusters.reduce(function (sum, cluster) { return sum + cluster.cost.total; }, 0);
    var totalPax = clusters.reduce(function (sum, cluster) { return sum + cluster.pax; }, 0);
    var totalLuggage = clusters.reduce(function (sum, cluster) { return sum + cluster.luggage; }, 0);
    var baselineVehicle = recommendVehicle(totalPax, totalLuggage);
    var baselineCost = Math.round(baselineVehicle.baseCost + clusters.reduce(function (sum, c) { return sum + c.cost.km; }, 0) * baselineVehicle.kmCost + clusters.length * 80);
    var savings = baselineCost - totalClusterCost;
    host.innerHTML = '<article class="cluster-card bridge-card"><h3>InfraCluster -> InfraDispatch handoff</h3><p>Send these clusters to InfraDispatch as separate dispatch runs, each with its own vehicle, pickup window, language requirement and hotel sequence.</p><ul>' +
      '<li>Recommended dispatch runs: ' + clusters.length + '</li>' +
      '<li>Estimated clustered cost: AED ' + totalClusterCost.toLocaleString() + '</li>' +
      '<li>One-vehicle baseline: ' + esc(baselineVehicle.name) + ' · AED ' + baselineCost.toLocaleString() + '</li>' +
      '<li>Cost signal: ' + (savings >= 0 ? "Clustered plan may save AED " + savings.toLocaleString() : "Clustered plan costs AED " + Math.abs(savings).toLocaleString() + " more but may improve timing and service quality") + '</li>' +
      '</ul></article>' +
      '<article class="cluster-card bridge-card"><h3>Best dispatch solution</h3><p>' + (savings >= 0 ? "Use the clustered dispatch plan as the cost-control option, then let InfraDispatch prepare final pickup order, driver notes, guide notes and manifest." : "Use the clustered plan when guest timing and language quality are more important than pure vehicle cost; supervisor should approve the service-quality premium.") + '</p><ul>' +
      clusters.map(function (cluster) { return '<li>Cluster ' + cluster.id + ': ' + esc(cluster.vehicle.name) + ', ' + cluster.pax + ' pax, ' + esc(cluster.language) + ', ' + cluster.pickupStart + " - " + cluster.pickupEnd + '</li>'; }).join("") +
      '</ul></article>';
  }
  function renderMap(clusters) {
    var map = byId("clusterMap");
    map.innerHTML = '<div class="map-axis"></div>';
    (clusters.length ? clusters.flatMap(function (c) { return c.groups.map(function (g) { g._cluster = c.id; return g; }); }) : state.groups).forEach(function (g) {
      var p = document.createElement("div");
      p.className = "map-point cluster-" + (g._cluster || 1);
      p.style.left = g.x + "%";
      p.style.top = g.y + "%";
      p.title = g.hotelName;
      map.appendChild(p);
      var l = document.createElement("span");
      l.className = "map-label";
      l.style.left = g.x + "%";
      l.style.top = g.y + "%";
      l.textContent = g.area;
      map.appendChild(l);
    });
  }
  function renderDatabase() {
    var query = byId("dbSearch").value.toLowerCase();
    var area = byId("dbArea").value;
    var lang = byId("dbLanguage").value;
    var type = byId("dbType") ? byId("dbType").value : "";
    var rows = state.database.filter(function (h) {
      return (!query || h.name.toLowerCase().indexOf(query) > -1 || h.area.toLowerCase().indexOf(query) > -1 || h.emirate.toLowerCase().indexOf(query) > -1 || h.type.toLowerCase().indexOf(query) > -1) &&
        (!area || h.emirate === area || h.area === area) && (!type || h.type === type) && (!lang || h.languages.indexOf(lang) > -1);
    }).slice(0, 260);
    byId("databaseCount").textContent = rows.length + " visible from " + state.database.length.toLocaleString() + " UAE tourism rows";
    byId("hotelDatabaseBody").innerHTML = rows.map(function (h) {
      return "<tr><td>" + esc(h.id) + "</td><td>" + esc(h.name) + "</td><td>" + esc(h.type) + "</td><td>" + esc(h.emirate) + "</td><td>" + esc(h.area) + "</td><td>" + esc(h.source) + "</td><td>" + esc(h.languages.join(", ")) + "</td></tr>";
    }).join("");
  }
  function parseDelimited(text, delimiter) {
    var rows = [];
    var row = [];
    var value = "";
    var quoted = false;
    for (var i = 0; i < text.length; i += 1) {
      var char = text[i];
      var next = text[i + 1];
      if (char === '"' && quoted && next === '"') { value += '"'; i += 1; continue; }
      if (char === '"') { quoted = !quoted; continue; }
      if (char === delimiter && !quoted) { row.push(value); value = ""; continue; }
      if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(value);
        if (row.some(function (cellValue) { return String(cellValue).trim() !== ""; })) rows.push(row);
        row = []; value = "";
        continue;
      }
      value += char;
    }
    row.push(value);
    if (row.some(function (cellValue) { return String(cellValue).trim() !== ""; })) rows.push(row);
    return rows;
  }
  function arraysToObjects(rows) {
    if (!rows.length) return [];
    var headers = rows[0].map(function (header, index) { return String(header || ("Column " + (index + 1))).trim(); });
    state.importHeaders = headers;
    return rows.slice(1).filter(function (row) {
      return row.some(function (value) { return String(value || "").trim() !== ""; });
    }).map(function (row) {
      return headers.reduce(function (object, header, index) {
        object[header] = row[index] == null ? "" : row[index];
        return object;
      }, {});
    });
  }
  function guessHeader(headers, keywords) {
    var normalized = headers.map(function (header) { return { raw: header, key: normalizeHeader(header) }; });
    var match = normalized.find(function (header) {
      return keywords.some(function (keyword) { return header.key === keyword || header.key.indexOf(keyword) > -1; });
    });
    return match ? match.raw : "";
  }
  function fillMapping() {
    var headers = state.importHeaders;
    var options = '<option value="">Not included</option>' + headers.map(function (header) { return '<option value="' + esc(header) + '">' + esc(header) + '</option>'; }).join("");
    ["mapHotel", "mapArea", "mapAdults", "mapChildren", "mapInfants", "mapLuggage", "mapLanguage", "mapPickupTime", "mapTour"].forEach(function (id) {
      byId(id).innerHTML = options;
    });
    byId("mapHotel").value = guessHeader(headers, ["hotel", "hotelname", "pickuphotel", "property"]);
    byId("mapArea").value = guessHeader(headers, ["area", "zone", "district", "location"]);
    byId("mapAdults").value = guessHeader(headers, ["adults", "adult", "adt", "paxadult"]);
    byId("mapChildren").value = guessHeader(headers, ["children", "child", "chd", "kids"]);
    byId("mapInfants").value = guessHeader(headers, ["infants", "infant", "inf"]);
    byId("mapLuggage").value = guessHeader(headers, ["luggage", "bags", "bag"]);
    byId("mapLanguage").value = guessHeader(headers, ["language", "guide", "guidelanguage", "lang"]);
    byId("mapPickupTime").value = guessHeader(headers, ["pickuptime", "pickup", "time", "pickuptiming"]);
    byId("mapTour").value = guessHeader(headers, ["tour", "service", "program", "activity"]);
  }
  function renderImportPreview() {
    var rows = state.importRows.slice(0, 8);
    byId("importRowCount").textContent = state.importRows.length + " importable rows detected";
    byId("importPreviewHead").innerHTML = "<tr>" + state.importHeaders.map(function (header) { return "<th>" + esc(header) + "</th>"; }).join("") + "</tr>";
    byId("importPreviewBody").innerHTML = rows.map(function (row) {
      return "<tr>" + state.importHeaders.map(function (header) { return "<td>" + esc(row[header]) + "</td>"; }).join("") + "</tr>";
    }).join("");
  }
  function setUploadStatus(message, type) {
    var status = byId("uploadStatus");
    status.textContent = message;
    status.className = "upload-status" + (type ? " " + type : "");
  }
  async function handleFileUpload(file) {
    if (!file) return;
    var ext = file.name.split(".").pop().toLowerCase();
    try {
      var rows;
      if (ext === "csv" || ext === "tsv" || file.type.indexOf("csv") > -1) {
        var text = await file.text();
        rows = parseDelimited(text, ext === "tsv" ? "\t" : ",");
      } else if (ext === "xlsx" || ext === "xls") {
        if (!window.XLSX) {
          setUploadStatus("Excel parser is not available. Please save the sheet as CSV and upload again.", "error");
          return;
        }
        var buffer = await file.arrayBuffer();
        var workbook = window.XLSX.read(buffer, { type: "array", cellDates: false });
        var sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      } else {
        setUploadStatus("Unsupported file type. Upload CSV, TSV, XLSX or XLS.", "error");
        return;
      }
      state.importRows = arraysToObjects(rows).slice(0, 1500);
      if (!state.importRows.length) {
        setUploadStatus("The file was read, but no usable rows were found after the header row.", "error");
        return;
      }
      fillMapping();
      renderImportPreview();
      byId("mappingPanel").hidden = false;
      setUploadStatus(file.name + " loaded successfully. Review the column mapping, then import rows.", "success");
    } catch (error) {
      setUploadStatus("Could not read this file: " + error.message, "error");
    }
  }
  function applyImport() {
    if (!state.importRows.length) {
      setUploadStatus("Upload a spreadsheet before importing rows.", "error");
      return;
    }
    var map = {
      hotel: byId("mapHotel").value,
      area: byId("mapArea").value,
      adults: byId("mapAdults").value,
      children: byId("mapChildren").value,
      infants: byId("mapInfants").value,
      luggage: byId("mapLuggage").value,
      language: byId("mapLanguage").value,
      pickupTime: byId("mapPickupTime").value,
      tour: byId("mapTour").value
    };
    if (!map.hotel && !map.area) {
      setUploadStatus("Map at least a hotel or area column before importing.", "error");
      return;
    }
    var imported = state.importRows.map(function (row, index) {
      var hotel = hotelFromImport(row, map);
      return {
        hotelId: hotel.id || ("IMPORT-" + (index + 1)),
        hotelName: cell(row, map.hotel) || hotel.name || ("Imported hotel " + (index + 1)),
        area: hotel.area,
        zone: hotel.zone,
        x: hotel.x,
        y: hotel.y,
        adults: number(cell(row, map.adults), 0),
        children: number(cell(row, map.children), 0),
        infants: number(cell(row, map.infants), 0),
        luggage: number(cell(row, map.luggage), 0),
        language: cell(row, map.language) || "English",
        pickupTime: normalizeTime(cell(row, map.pickupTime), "08:30"),
        tour: cell(row, map.tour) || byId("clusterTourType").value || "Dubai City Tour"
      };
    }).filter(function (group) { return group.hotelName || group.area; });
    if (byId("importMode").value === "replace") state.groups = [];
    state.groups = state.groups.concat(imported);
    renderGroups();
    clusterGroups();
    state.step = 3;
    renderStep();
    setUploadStatus(imported.length + " rows imported and clustered. Review the generated plan.", "success");
  }
  function downloadTemplate() {
    var lines = [
      "hotel,area,adults,children,infants,luggage,language,pickup_time,tour",
      "\"Grand Dubai Marina Hotel\",Dubai Marina,8,2,0,5,English,08:20,Dubai City Tour",
      "\"Royal JBR Suites\",JBR,6,1,1,4,English,08:35,Dubai City Tour",
      "\"Palm Jumeirah Resort\",Palm Jumeirah,5,0,0,3,French,08:45,Dubai City Tour"
    ];
    var blob = new Blob([lines.join("\n")], { type: "text/csv" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "infracluster-upload-template.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function updateSummary() {
    var totalPax = state.groups.reduce(function (sum, g) { return sum + headcount(g); }, 0);
    var languagesUsed = Array.from(new Set(state.groups.map(function (g) { return g.language; }))).join(", ") || "-";
    var clusters = state.results || [];
    byId("summaryCards").innerHTML = [
      ["Groups", state.groups.length],
      ["Pax", totalPax],
      ["Languages", languagesUsed],
      ["Vehicles", clusters.length ? clusters.map(function (c) { return c.vehicle.name; }).join(" / ") : "Pending"]
    ].map(function (s) { return '<div class="summary-card"><span>' + s[0] + '</span><strong>' + s[1] + '</strong></div>'; }).join("");
    byId("riskPanel").innerHTML = clusters.some(function (c) { return c.risk !== "Clean"; }) ? "Some clusters need supervisor review because of timing, distance, or capacity pressure." : "Add groups, then run clustering to produce operational risk notes.";
  }
  function loadDemo() {
    state.groups = [];
    [
      { hotel: "Marina", adults: 8, children: 2, infants: 0, luggage: 5, language: "English", pickupTime: "08:20" },
      { hotel: "JBR", adults: 6, children: 1, infants: 1, luggage: 4, language: "English", pickupTime: "08:35" },
      { hotel: "Palm", adults: 5, children: 0, infants: 0, luggage: 3, language: "French", pickupTime: "08:45" },
      { hotel: "Downtown", adults: 10, children: 3, infants: 0, luggage: 7, language: "French", pickupTime: "09:05" },
      { hotel: "Deira", adults: 12, children: 1, infants: 0, luggage: 9, language: "English", pickupTime: "09:15" },
      { hotel: "Airport", adults: 4, children: 2, infants: 1, luggage: 6, language: "Arabic", pickupTime: "09:30" }
    ].forEach(addGroup);
    clusterGroups();
  }
  function exportCsv() {
    var clusters = state.results || [];
    var lines = [["cluster", "hotel", "area", "adults", "children", "infants", "language", "pickup_time", "vehicle"].join(",")];
    clusters.forEach(function (c) {
      c.sequence.forEach(function (g) {
        lines.push([c.id, '"' + g.hotelName.replace(/"/g, '""') + '"', g.area, g.adults, g.children, g.infants, g.language, g.pickupTime, '"' + c.vehicle.name + '"'].join(","));
      });
    });
    var blob = new Blob([lines.join("\n")], { type: "text/csv" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "infracluster-dispatch-plan.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function copyDispatchHandoff() {
    var clusters = state.results || [];
    var payload = dispatchPayload(clusters);
    var text = JSON.stringify(payload, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
  }
  function exportDispatchJson() {
    var payload = dispatchPayload(state.results || []);
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "infracluster-to-infradispatch-handoff.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function init() {
    if (!byId("infraClusterApp")) return;
    state.database = await loadUaeLocations();
    var areaSelect = byId("dbArea");
    var emirates = Array.from(new Set(state.database.map(function (item) { return item.emirate; }))).sort();
    var types = Array.from(new Set(state.database.map(function (item) { return item.type; }))).sort();
    areaSelect.innerHTML = '<option value="">All emirates / areas</option>' + emirates.map(function (a) { return '<option>' + a + '</option>'; }).join("");
    if (byId("dbType")) byId("dbType").innerHTML = '<option value="">All types</option>' + types.map(function (type) { return '<option>' + type + '</option>'; }).join("");
    byId("dbLanguage").innerHTML = '<option value="">All languages</option>' + languages.map(function (l) { return '<option>' + l + '</option>'; }).join("");
    byId("addGroup").addEventListener("click", function () { addGroup(); });
    byId("clusterFileInput").addEventListener("change", function (event) { handleFileUpload(event.target.files[0]); });
    byId("applyImport").addEventListener("click", applyImport);
    byId("downloadClusterTemplate").addEventListener("click", downloadTemplate);
    byId("loadDemoGroups").addEventListener("click", loadDemo);
    byId("runCluster").addEventListener("click", clusterGroups);
    byId("exportClusterCsv").addEventListener("click", exportCsv);
    byId("copyClusterBrief").addEventListener("click", function () {
      navigator.clipboard.writeText(byId("briefingOutput").innerText || "");
    });
    byId("copyDispatchHandoff").addEventListener("click", copyDispatchHandoff);
    byId("exportDispatchJson").addEventListener("click", exportDispatchJson);
    byId("prevClusterStep").addEventListener("click", function () { state.step = Math.max(0, state.step - 1); renderStep(); });
    byId("nextClusterStep").addEventListener("click", function () {
      if (state.step < steps.length - 1) state.step += 1;
      else clusterGroups();
      renderStep();
    });
    ["dbSearch", "dbArea", "dbType", "dbLanguage"].forEach(function (id) { if (byId(id)) { byId(id).addEventListener("input", renderDatabase); byId(id).addEventListener("change", renderDatabase); } });
    renderProgress(); renderStep(); renderDatabase(); updateSummary();
    loadDemo();
  }
  document.addEventListener("DOMContentLoaded", init);
}());
